/**
 * Engine verification: fixtures from docs scenarios plus unit coverage for
 * routing, resolution, ranking, budgets, and the honesty boundaries in
 * docs/15 (no fabricated findings, no silent trimming).
 */
import { describe, expect, it } from "vitest";
import { analyze } from "./index";
import {
  apiContracts,
  authMigration,
  dynamicImport,
  envVar,
  envVarWithoutExample,
  exportRename,
  exportRenameClean,
  importChain,
  manyUntested,
  roleEnum,
} from "./fixtures";
import { matchRoute, parseEnvExample, toRoutePattern } from "./extract";
import { resolveImport } from "./graph";
import { dedupeFindings, rankFindings } from "./report";
import type { Finding } from "./types";

function finding(overrides: Partial<Finding> & { fingerprint: string }): Finding {
  return {
    ruleId: "TEST",
    ruleVersion: "1",
    state: "MISSING",
    facet: "MISSING",
    severity: "low",
    confidence: { band: "high", explanation: "test" },
    origin: "rule",
    title: "test",
    explanation: "test",
    evidence: [],
    nextStep: "test",
    ...overrides,
  };
}

describe("auth migration (overview §6)", () => {
  const report = analyze(authMigration());

  it("requires manual review of the auth boundary", () => {
    expect(report.actionRequired).toHaveLength(1);
    expect(report.actionRequired[0]?.ruleId).toBe("AUTH_BOUNDARY_001");
    expect(report.actionRequired[0]?.evidence[0]?.path).toBe("middleware.ts");
  });

  it("flags changed behavior without related tests", () => {
    const paths = report.untested.map((item) => item.evidence[0]?.path);
    expect(paths).toContain("app/login/page.tsx");
    expect(paths).toContain("db/schema/users.ts");
  });

  it("traces affected consumers through imports", () => {
    const billing = report.affected.find((item) => item.path === "api/billing/customers.ts");
    expect(billing).toBeDefined();
    expect(billing?.via).toEqual(["db/schema/users.ts", "api/billing/customers.ts"]);
  });

  it("does not fabricate the semantic billing conflict", () => {
    // The firebase_uid → Stripe mapping consequence needs AI enrichment
    // (docs/04); deterministic rules must not invent it.
    expect(report.conflicting).toHaveLength(0);
    expect(report.missing.filter((item) => item.ruleId === "EXPORT_BREAKAGE_001")).toHaveLength(0);
  });
});

describe("environment variable (docs/08 worked report)", () => {
  it("reports a new secret missing from the example", () => {
    const report = analyze(envVar());
    expect(report.missing).toHaveLength(1);
    const item = report.missing[0];
    expect(item?.ruleId).toBe("ENV_EXAMPLE_001");
    expect(item?.title).toContain("PAYMENT_WEBHOOK_SECRET");
    expect(item?.confidence.band).toBe("high");
    expect(report.checklist.some((step) => step.includes("PAYMENT_WEBHOOK_SECRET"))).toBe(true);
  });

  it("records an unreadable example as Unknown, not Missing", () => {
    const report = analyze(envVarWithoutExample());
    expect(report.missing.filter((item) => item.ruleId === "ENV_EXAMPLE_001")).toHaveLength(0);
    const coverage = report.unknown.find((item) => item.category === "coverage");
    expect(coverage?.detail).toContain(".env.example");
  });
});

describe("role enum mismatch", () => {
  it("reports the schema/UI conflict with both contracts as evidence", () => {
    const report = analyze(roleEnum());
    expect(report.conflicting).toHaveLength(1);
    const item = report.conflicting[0];
    expect(item?.ruleId).toBe("PRISMA_ENUM_001");
    expect(item?.severity).toBe("high");
    const paths = (item?.evidence ?? []).map((entry) => entry.path);
    expect(paths).toContain("db/schema.prisma");
    expect(paths).toContain("components/team/role-select.tsx");
  });
});

describe("export breakage (rule family 4)", () => {
  it("reports a removed export with a base-side citation", () => {
    const report = analyze(exportRename());
    const items = report.missing.filter((item) => item.ruleId === "EXPORT_BREAKAGE_001");
    expect(items).toHaveLength(1);
    expect(items[0]?.severity).toBe("high");
    expect(items[0]?.evidence.some((entry) => entry.baseSide === true)).toBe(true);
    expect(report.affected.some((item) => item.path === "app/settings/page.tsx")).toBe(true);
  });

  it("stays silent when the importer follows the rename", () => {
    const report = analyze(exportRenameClean());
    expect(report.missing.filter((item) => item.ruleId === "EXPORT_BREAKAGE_001")).toHaveLength(0);
  });
});

describe("API contracts (rule family 2)", () => {
  it("conflicts on method mismatch and misses unknown routes", () => {
    const report = analyze(apiContracts());
    const method = report.conflicting.find((item) => item.ruleId === "API_METHOD_001");
    expect(method?.title).toContain("DELETE /api/team/123");
    const route = report.missing.find((item) => item.ruleId === "API_ROUTE_001");
    expect(route?.title).toContain("/api/ghost");
  });
});

describe("unknowns and budgets", () => {
  it("records dynamic import targets as Unknown", () => {
    const report = analyze(dynamicImport());
    expect(report.unknown.some((item) => item.category === "dynamic")).toBe(true);
    expect(report.missing).toHaveLength(0);
  });

  it("bounds traversal at depth three", () => {
    const report = analyze(importChain());
    const depths = new Map(report.affected.map((item) => [item.path, item.depth]));
    expect(depths.get("d.ts")).toBe(1);
    expect(depths.get("c.ts")).toBe(2);
    expect(depths.get("b.ts")).toBe(3);
    expect(depths.has("a.ts")).toBe(false);
    expect(report.coverage.traversalTruncated).toBe(false);
  });

  it("publishes at most 20 findings and retains counts", () => {
    const report = analyze(manyUntested(25));
    expect(report.coverage.totalCandidates).toBe(25);
    expect(report.coverage.publishedFindings).toBe(20);
    expect(report.untested).toHaveLength(20);
    expect(report.coverage.notes.some((note) => note.includes("5 additional findings"))).toBe(true);
  });

  it("marks skipped files and stays partial, never silent", () => {
    const report = analyze({
      files: [{ path: "assets/logo.png", content: "binary" }],
      changes: [
        {
          path: "lib/ok.ts",
          base: null,
          head: "export const value = 1;\n",
        },
      ],
    });
    expect(report.coverage.completeness).toBe("partial");
    expect(report.unknown.some((item) => item.category === "skipped")).toBe(true);
  });
});

describe("ranking and dedupe", () => {
  it("orders high severity before medium before low", () => {
    const ranked = rankFindings([
      finding({ fingerprint: "b", severity: "low" }),
      finding({ fingerprint: "a", severity: "high" }),
      finding({ fingerprint: "c", severity: "medium" }),
    ]);
    expect(ranked.map((item) => item.fingerprint)).toEqual(["a", "c", "b"]);
  });

  it("deduplicates by fingerprint", () => {
    const first = finding({ fingerprint: "same" });
    expect(dedupeFindings([first, finding({ fingerprint: "same" })])).toHaveLength(1);
  });
});

describe("extraction units", () => {
  it("maps App Router files to patterns", () => {
    expect(toRoutePattern("app/api/team/[id]/route.ts")).toBe("/api/team/:id");
    expect(toRoutePattern("app/page.tsx")).toBe("/");
    expect(toRoutePattern("app/team/settings.tsx")).toBeNull();
    expect(toRoutePattern("lib/format.ts")).toBeNull();
  });

  it("matches fetched URLs against patterns", () => {
    expect(matchRoute("/api/team/:id", "/api/team/123")).toBe(true);
    expect(matchRoute("/api/team/:id", "/api/team/123/members")).toBe(false);
    expect(matchRoute("/api/team/:id", "/api/team/123?tab=billing")).toBe(true);
  });

  it("parses example inventories", () => {
    const names = parseEnvExample("# comment\nSTRIPE_KEY=\nexport DATABASE_URL=postgres\n\nEMPTY\n");
    expect([...names.keys()]).toEqual(["STRIPE_KEY", "DATABASE_URL"]);
  });

  it("resolves relative imports and @/ aliases", () => {
    const known = new Set(["lib/auth.ts", "app/login/page.tsx"]);
    expect(resolveImport("app/login/page.tsx", "../../lib/auth", known)).toBe("lib/auth.ts");
    expect(resolveImport("app/login/page.tsx", "@/lib/auth", known)).toBe("lib/auth.ts");
    expect(resolveImport("app/login/page.tsx", "./missing", known)).toBeNull();
    expect(resolveImport("app/login/page.tsx", "react", known)).toBeNull();
  });
});
