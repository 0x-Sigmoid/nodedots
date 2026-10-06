/**
 * Model provider seam (docs/10): an OpenAI-compatible chat endpoint that
 * proposes bounded candidates through the identical publication gate.
 * Evidence-bounded by construction — the prompt carries paths, symbols, and
 * finding titles only, never file contents. Fail-closed: any transport,
 * shape, or validation problem yields zero candidates, and deterministic
 * results publish with a degradation note instead.
 */
import type { CandidateHypothesis, HypothesisConfidence } from "./hypotheses";

export const LLM_PROMPT_VERSION = "llm-v1";

export interface LlmConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  promptVersion?: string;
  maxCandidates?: number;
}

export interface PromptInput {
  changed: { path: string; change: string; symbols: string[] }[];
  deterministicTitles: string[];
}

export function modelOf(config: LlmConfig): string {
  return config.model ?? "gpt-4o-mini";
}

export function baseUrlOf(config: LlmConfig): string {
  return (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
}

/**
 * Build the bounded prompt: candidate families, evidence rules, and the
 * change summary. File contents are never included.
 */
export function buildEnrichmentPrompt(input: PromptInput, promptVersion = LLM_PROMPT_VERSION): string {
  const changed = input.changed
    .slice(0, 50)
    .map((file) => `- ${file.path} (${file.change}): ${file.symbols.slice(0, 8).join(", ") || "no exports"}`)
    .join("\n");
  const known = input.deterministicTitles.slice(0, 20).map((title) => `- ${title}`).join("\n");
  return [
    `You are reviewing a code change for a verification tool (prompt ${promptVersion}).`,
    `Propose at most 5 bounded hypotheses about migration, authorization, billing, or session`,
    `consequences. Each hypothesis needs: family (one of BILLING_IDENTITY_H1, SESSION_INVALIDATION_H1,`,
    `MIGRATION_BACKFILL_H1, AUTHZ_CHECK_H1), title, explanation, evidence (path plus 1-based line`,
    `range, from the changed files below), nextStep, and maxConfidence (low or medium).`,
    `Rules: only cite paths from the changed files list. Never invent files, symbols, tests, or`,
    `citations. If nothing is supported, return {"candidates": []}. Respond with JSON only:`,
    `{"candidates": [{"family": ..., "title": ..., "explanation": ..., "evidence": [{"path": ...,`,
    `"startLine": 1, "endLine": 1, "note": ...}], "nextStep": ..., "maxConfidence": "low"}]}.`,
    ``,
    `Changed files:`,
    changed || "(none)",
    ``,
    `Already-reported findings (do not repeat):`,
    known || "(none)",
  ].join("\n");
}

const FAMILIES = new Set(["BILLING_IDENTITY_H1", "SESSION_INVALIDATION_H1", "MIGRATION_BACKFILL_H1", "AUTHZ_CHECK_H1"]);

/** Strict candidate parsing: unknown families, invented paths, and bad shapes are dropped. */
export function parseLlmCandidates(body: unknown, allowedPaths: Set<string>): CandidateHypothesis[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) return [];
  const list = (body as { candidates?: unknown }).candidates;
  if (!Array.isArray(list)) return [];
  const out: CandidateHypothesis[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    if (typeof item.family !== "string" || !FAMILIES.has(item.family)) continue;
    if (typeof item.title !== "string" || !item.title.trim()) continue;
    if (typeof item.explanation !== "string" || !item.explanation.trim()) continue;
    if (typeof item.nextStep !== "string" || !item.nextStep.trim()) continue;
    if (item.maxConfidence !== "low" && item.maxConfidence !== "medium") continue;
    if (!Array.isArray(item.evidence) || item.evidence.length === 0) continue;
    const evidence: CandidateHypothesis["evidence"] = [];
    let valid = true;
    for (const entry of item.evidence) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        valid = false;
        break;
      }
      const span = entry as Record<string, unknown>;
      if (typeof span.path !== "string" || !allowedPaths.has(span.path)) {
        valid = false;
        break;
      }
      if (
        typeof span.startLine !== "number" ||
        typeof span.endLine !== "number" ||
        !Number.isInteger(span.startLine) ||
        !Number.isInteger(span.endLine)
      ) {
        valid = false;
        break;
      }
      evidence.push({
        path: span.path,
        startLine: span.startLine,
        endLine: span.endLine,
        note: typeof span.note === "string" ? span.note : "Model-cited evidence.",
      });
    }
    if (!valid) continue;
    out.push({
      family: item.family,
      title: item.title.trim(),
      explanation: item.explanation.trim(),
      evidence,
      nextStep: item.nextStep.trim(),
      maxConfidence: item.maxConfidence as HypothesisConfidence,
    });
  }
  return out;
}

export async function requestLlmCandidates(
  config: LlmConfig,
  prompt: string,
  allowedPaths: Set<string>,
  post: typeof fetch = fetch,
): Promise<CandidateHypothesis[]> {
  try {
    const response = await post(`${baseUrlOf(config)}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelOf(config),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) return [];
    const body = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== "string") return [];
    const limit = config.maxCandidates ?? 5;
    return parseLlmCandidates(JSON.parse(content) as unknown, allowedPaths).slice(0, limit);
  } catch {
    return [];
  }
}
