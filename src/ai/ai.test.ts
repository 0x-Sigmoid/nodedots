/**
 * Enrichment verification: gate honesty (validate, redact, demote, dedupe,
 * cap), LLM seam purity (bounded prompts, strict parsing, fail-closed
 * transport), and provider selection.
 */
import { describe, expect, it } from "vitest";
import { enrich, enrichmentProvidersFromEnv, heuristicProvider } from "./index";
import { gateCandidates, redactSecrets } from "./gate";
import type { CandidateHypothesis, EnrichmentContext } from "./hypotheses";
import {
  buildEnrichmentPrompt,
  parseLlmCandidates,
  requestLlmCandidates,
  type LlmConfig,
} from "./llm";
import { extractFile } from "@/engine/extract";

function ctxWith(files: Record<string, string>, changes: { path: string; kind: "added" | "modified" | "removed" }[] = []): EnrichmentContext {
  const head = new Map(
    Object.entries(files).map(([path, content]) => [path, { content, extracted: extractFile(path, content) }]),
  );
  return { head, base: new Map(), changes };
}

function candidate(overrides: Partial<CandidateHypothesis> = {}): CandidateHypothesis {
  return {
    family: "BILLING_IDENTITY_H1",
    title: "Maybe billing breaks",
    explanation: "Something might be off.",
    evidence: [{ path: "a.ts", startLine: 1, endLine: 1, note: "here" }],
    nextStep: "Check it.",
    maxConfidence: "medium",
    ...overrides,
  };
}

describe("publication gate", () => {
  const ctx = ctxWith({ "a.ts": "line1\nline2\nline3\n" });

  it("publishes valid candidates as capped uncertain findings", () => {
    const batch = gateCandidates([candidate()], ctx, new Set());
    expect(batch.findings).toHaveLength(1);
    expect(batch.findings[0]?.state).toBe("UNCERTAIN");
    expect(batch.findings[0]?.confidence.band).toBe("low");
    expect(batch.stats).toEqual({ candidates: 1, published: 1, demoted: 0, rejected: 0 });
  });

  it("rejects invented paths, bad ranges, and empty text", () => {
    const batch = gateCandidates(
      [
        candidate({ evidence: [{ path: "missing.ts", startLine: 1, endLine: 1, note: "x" }] }),
        candidate({ evidence: [{ path: "a.ts", startLine: 99, endLine: 99, note: "x" }] }),
        candidate({ title: "  " }),
        candidate({ evidence: [] }),
      ],
      ctx,
      new Set(),
    );
    expect(batch.findings).toHaveLength(0);
    expect(batch.stats.rejected).toBe(4);
    expect(batch.unknown).toHaveLength(1);
    expect(batch.notes.some((note) => note.includes("stand alone"))).toBe(true);
  });

  it("lets deterministic findings win ties and caps output", () => {
    const many = Array.from({ length: 7 }, (_, i) =>
      candidate({ evidence: [{ path: "a.ts", startLine: 1, endLine: 1, note: `e${i}` }] }),
    );
    // Same entity → same fingerprint: second identical candidate demotes.
    const batch = gateCandidates([...many, candidate()], ctx, new Set(), 5);
    expect(batch.findings.length).toBeLessThanOrEqual(5);
    expect(batch.stats.demoted).toBeGreaterThan(0);
    const clash = gateCandidates([candidate()], ctx, new Set(["BILLING_IDENTITY_H1:a.ts"]));
    expect(clash.findings).toHaveLength(0);
    expect(clash.stats.demoted).toBe(1);
  });

  it("redacts secret-like text before publication", () => {
    const batch = gateCandidates(
      [candidate({ explanation: "Uses STRIPE_KEY=sk_live_abc for webhooks." })],
      ctx,
      new Set(),
    );
    expect(batch.findings).toHaveLength(1);
    expect(batch.findings[0]?.explanation).toContain("STRIPE_KEY=[redacted]");
    expect(batch.findings[0]?.explanation).not.toContain("sk_live_abc");
    expect(batch.notes.some((note) => note.includes("redacted"))).toBe(true);
    expect(redactSecrets("nothing here").redacted).toBe(false);
  });
});

describe("heuristic patterns", () => {
  it("fires billing identity only on both markers", () => {
    const both = heuristicProvider(ctxWith({ "b.ts": "import Stripe from 'stripe';\nconst id = row.firebase_uid;\n" }));
    expect(both.map((item) => item.family)).toContain("BILLING_IDENTITY_H1");
    const stripeOnly = heuristicProvider(ctxWith({ "b.ts": "import Stripe from 'stripe';\n" }));
    expect(stripeOnly).toHaveLength(0);
  });

  it("skips session revocation when revocation is visible", () => {
    const missing = heuristicProvider(ctxWith({ "del.ts": "export function deleteUser() {}\n" }));
    expect(missing.map((item) => item.family)).toContain("SESSION_INVALIDATION_H1");
    const present = heuristicProvider(
      ctxWith({ "del.ts": "export function deleteUser() { revokeSession(); }\n" }),
    );
    expect(present).toHaveLength(0);
  });

  it("flags backfill-free schema fields and authorized destructive routes", () => {
    const ctx = ctxWith(
      {
        "db/schema.prisma": "model User {\n  id String @id\n  orgId String\n}\n",
        "app/api/team/route.ts": "export async function DELETE() {}\n",
      },
      [
        { path: "db/schema.prisma", kind: "modified" },
        { path: "app/api/team/route.ts", kind: "added" },
      ],
    );
    // No base: every schema line looks new except headers; orgId fires.
    const families = heuristicProvider(ctx).map((item) => item.family);
    expect(families).toContain("MIGRATION_BACKFILL_H1");
    expect(families).toContain("AUTHZ_CHECK_H1");
  });
});

describe("orchestrator", () => {
  const ctx = ctxWith({ "a.ts": "line1\nline2\n" });

  it("isolates failing providers without failing the analysis", async () => {
    const failing = () => Promise.reject(new Error("down"));
    const batch = await enrich(ctx, [failing, () => []], new Set());
    expect(batch.findings).toHaveLength(0);
    expect(batch.stats).toEqual({ candidates: 0, published: 0, demoted: 0, rejected: 0 });
  });
});

describe("LLM seam", () => {
  const config: LlmConfig = { apiKey: "key", model: "test-model" };

  it("builds prompts without file contents", () => {
    const prompt = buildEnrichmentPrompt({
      changed: [{ path: "a.ts", change: "modified", symbols: ["x"] }],
      deterministicTitles: ["Known finding"],
    });
    expect(prompt).toContain("a.ts");
    expect(prompt).not.toContain("export const x");
    expect(prompt).toContain("Known finding");
  });

  it("parses strict candidates and drops invented paths", () => {
    const allowed = new Set(["a.ts"]);
    const parsed = parseLlmCandidates(
      {
        candidates: [
          {
            family: "BILLING_IDENTITY_H1",
            title: "T",
            explanation: "E",
            evidence: [{ path: "a.ts", startLine: 1, endLine: 2, note: "N" }],
            nextStep: "S",
            maxConfidence: "low",
          },
          {
            family: "BILLING_IDENTITY_H1",
            title: "T",
            explanation: "E",
            evidence: [{ path: "invented.ts", startLine: 1, endLine: 1, note: "N" }],
            nextStep: "S",
            maxConfidence: "low",
          },
          { family: "MADE_UP", title: "T", explanation: "E", evidence: [], nextStep: "S", maxConfidence: "low" },
        ],
      },
      allowed,
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.evidence[0]?.path).toBe("a.ts");
    expect(parseLlmCandidates({ nope: true }, allowed)).toEqual([]);
    expect(parseLlmCandidates("garbage", allowed)).toEqual([]);
  });

  it("fails closed on transport and shape errors", async () => {
    const failing = (() => Promise.reject(new Error("down"))) as unknown as typeof fetch;
    expect(
      await requestLlmCandidates(config, "prompt", new Set(["a.ts"]), failing),
    ).toEqual([]);
    const badStatus = (() =>
      Promise.resolve({ ok: false, status: 500 })) as unknown as typeof fetch;
    expect(await requestLlmCandidates(config, "prompt", new Set(["a.ts"]), badStatus)).toEqual([]);
    const badJson = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [{ message: { content: "not json" } }] }),
      })) as unknown as typeof fetch;
    expect(await requestLlmCandidates(config, "prompt", new Set(["a.ts"]), badJson)).toEqual([]);
  });

  it("selects providers from env", () => {
    expect(enrichmentProvidersFromEnv({ NODE_ENV: "test" as const, AI_ENRICHMENT: "off" })).toBe(false);
    const providers = enrichmentProvidersFromEnv({ NODE_ENV: "test" as const });
    expect(Array.isArray(providers) && providers.length).toBe(1);
  });
});
