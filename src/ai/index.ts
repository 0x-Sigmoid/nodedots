/**
 * Enrichment orchestration (docs/08 steps 5–6): providers propose bounded
 * candidates, the publication gate validates them, and only survivors join
 * the report as UNCERTAIN findings. Heuristic patterns run by default;
 * model inference joins only when explicitly configured.
 */
import { gateCandidates, MAX_ENRICHMENT_FINDINGS, type GatedBatch } from "./gate";
import { HEURISTIC_PATTERNS, type CandidateHypothesis, type EnrichmentContext } from "./hypotheses";
import { buildEnrichmentPrompt, requestLlmCandidates, type LlmConfig } from "./llm";

export type EnrichmentProvider = (ctx: EnrichmentContext) => CandidateHypothesis[] | Promise<CandidateHypothesis[]>;

export function heuristicProvider(ctx: EnrichmentContext): CandidateHypothesis[] {
  return HEURISTIC_PATTERNS.flatMap((pattern) => pattern(ctx));
}

export function llmProvider(config: LlmConfig, post?: typeof fetch): EnrichmentProvider {
  return async (ctx: EnrichmentContext) => {
    const changed = ctx.changes.slice(0, 50).map((change) => {
      const file = ctx.head.get(change.path);
      const symbols = [...new Set((file?.extracted.exports ?? []).map((exp) => exp.name))];
      return { path: change.path, change: change.kind, symbols };
    });
    const allowedPaths = new Set(ctx.changes.map((change) => change.path));
    const prompt = buildEnrichmentPrompt({ changed, deterministicTitles: [] });
    return requestLlmCandidates(config, prompt, allowedPaths, post);
  };
}

export interface EnrichmentOutcome {
  batch: GatedBatch;
}

export async function enrich(
  ctx: EnrichmentContext,
  providers: EnrichmentProvider[],
  deterministicFingerprints: Set<string>,
): Promise<GatedBatch> {
  const candidates: CandidateHypothesis[] = [];
  for (const provider of providers) {
    try {
      const proposed = await provider(ctx);
      candidates.push(...proposed);
    } catch {
      // A failing provider must never fail the analysis; deterministic
      // results publish with a degradation note instead.
    }
  }
  const batch = gateCandidates(candidates, ctx, deterministicFingerprints, MAX_ENRICHMENT_FINDINGS);
  if (candidates.length > 0 && batch.stats.published === 0 && batch.unknown.length === 0) {
    batch.unknown.push({
      category: "coverage",
      detail: "Enrichment providers proposed nothing publishable; deterministic results stand alone.",
      paths: [],
    });
    batch.notes.push("Enrichment produced no publishable hypotheses; deterministic results stand alone.");
  }
  return batch;
}

export function enrichmentProvidersFromEnv(env: NodeJS.ProcessEnv = process.env): EnrichmentProvider[] | false {
  if (env.AI_ENRICHMENT === "off") return false;
  return [heuristicProvider];
}
