/**
 * Publication gate for enrichment candidates (docs/15): schema-invalid
 * candidates are rejected, unknown IDs removed, citations validated against
 * the analyzed snapshot, secrets redacted, certainty demoted, and
 * deterministic findings always win ties. If every candidate fails,
 * deterministic results publish with a degradation note — never a
 * fabricated result.
 */
import type { CandidateHypothesis, EnrichmentContext } from "./hypotheses";
import type { ConfidenceBand, Finding } from "@/engine/types";

export const MAX_ENRICHMENT_FINDINGS = 5;

export interface GateStats {
  candidates: number;
  published: number;
  demoted: number;
  rejected: number;
}

export interface GatedBatch {
  findings: Finding[];
  unknown: { category: "coverage"; detail: string; paths: string[] }[];
  notes: string[];
  stats: GateStats;
}

const SECRET_ASSIGNMENT = /(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|[A-Z][A-Z0-9_]*KEY)\s*=\s*(\S+)/gi;

/** Redact secret-looking assignments; returns the cleaned text and whether it fired. */
export function redactSecrets(text: string): { text: string; redacted: boolean } {
  let redacted = false;
  const cleaned = text.replace(SECRET_ASSIGNMENT, (_match, key: string) => {
    redacted = true;
    return `${key}=[redacted]`;
  });
  return { text: cleaned, redacted };
}

function lineCountOf(ctx: EnrichmentContext, path: string, baseSide: boolean): number | null {
  // Enrichment citations must be measurable in the analyzed snapshot.
  // Base-side citations cannot be measured (base extraction drops content),
  // so heuristic candidates may only cite head ranges.
  if (baseSide) return null;
  const content = ctx.head.get(path)?.content;
  return content === undefined ? null : content.split("\n").length;
}

function validCandidate(candidate: CandidateHypothesis, ctx: EnrichmentContext): string | null {
  if (!candidate.title.trim() || !candidate.explanation.trim() || !candidate.nextStep.trim()) {
    return "empty-text";
  }
  if (candidate.evidence.length === 0) return "no-evidence";
  for (const entry of candidate.evidence) {
    const lines = lineCountOf(ctx, entry.path, entry.baseSide === true);
    if (lines === null) return `unknown-path:${entry.path}`;
    if (entry.startLine < 1 || entry.endLine < entry.startLine || entry.endLine > lines) {
      return `bad-range:${entry.path}`;
    }
  }
  return null;
}

function toFinding(candidate: CandidateHypothesis, redacted: boolean): Finding {
  const entity = candidate.evidence[0]?.path ?? "unknown";
  // Unsupported certainty is demoted: a single evidence span can never
  // support more than low confidence, and nothing heuristic exceeds medium.
  const band: ConfidenceBand =
    candidate.evidence.length >= 2 ? candidate.maxConfidence : "low";
  return {
    fingerprint: `${candidate.family}:${entity}`,
    ruleId: candidate.family,
    ruleVersion: "h1",
    state: "UNCERTAIN",
    facet: "UNKNOWN",
    severity: "medium",
    confidence: {
      band,
      explanation: `Bounded hypothesis with scoped evidence${redacted ? "; secret material redacted" : ""}. Verify before treating it as fact.`,
    },
    origin: "rule",
    title: candidate.title,
    explanation: candidate.explanation,
    evidence: candidate.evidence.map((entry) => ({
      path: entry.path,
      startLine: entry.startLine,
      endLine: entry.endLine,
      origin: "rule" as const,
      ...(entry.baseSide === true ? { baseSide: true as const } : {}),
      note: entry.note,
    })),
    nextStep: candidate.nextStep,
  };
}

/**
 * Validate, redact, demote, dedupe, and cap one batch of candidates.
 * Deterministic fingerprints always win ties (AI must not overwrite facts).
 */
export function gateCandidates(
  candidates: CandidateHypothesis[],
  ctx: EnrichmentContext,
  deterministicFingerprints: Set<string>,
  maxFindings = MAX_ENRICHMENT_FINDINGS,
): GatedBatch {
  const findings: Finding[] = [];
  const unknown: GatedBatch["unknown"] = [];
  const notes: string[] = [];
  let demoted = 0;
  let rejected = 0;
  let redactionCount = 0;
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const problem = validCandidate(candidate, ctx);
    if (problem) {
      rejected += 1;
      continue;
    }
    const title = redactSecrets(candidate.title);
    const explanation = redactSecrets(candidate.explanation);
    const next = redactSecrets(candidate.nextStep);
    if (title.redacted || explanation.redacted || next.redacted) redactionCount += 1;
    const cleaned: CandidateHypothesis = {
      ...candidate,
      title: title.text,
      explanation: explanation.text,
      nextStep: next.text,
    };
    const finding = toFinding(cleaned, redactionCount > 0);
    if (deterministicFingerprints.has(finding.fingerprint) || seen.has(finding.fingerprint)) {
      demoted += 1;
      continue;
    }
    seen.add(finding.fingerprint);
    if (findings.length >= maxFindings) {
      demoted += 1;
      continue;
    }
    findings.push(finding);
  }

  if (redactionCount > 0) {
    notes.push(`${redactionCount} ${redactionCount === 1 ? "hypothesis" : "hypotheses"} contained secret-like text and were redacted before publication.`);
  }
  if (candidates.length > 0 && findings.length === 0) {
    unknown.push({
      category: "coverage",
      detail: `${candidates.length} enrichment ${candidates.length === 1 ? "candidate was" : "candidates were"} proposed and none survived evidence validation; deterministic results stand alone.`,
      paths: [],
    });
    notes.push("Enrichment produced no publishable hypotheses; deterministic results stand alone.");
  } else if (demoted > 0) {
    notes.push(`${demoted} enrichment ${demoted === 1 ? "candidate was" : "candidates were"} demoted (duplicate, capped, or low-evidence).`);
  }

  return {
    findings,
    unknown,
    notes,
    stats: { candidates: candidates.length, published: findings.length, demoted, rejected },
  };
}
