/**
 * Report assembly (docs/04, docs/08 steps 7–9): deduplicate by rule family
 * plus affected entity, rank by severity then evidence strength, publish at
 * most 20 prioritized actionable findings while retaining candidate counts,
 * and derive the before-merging checklist from validated findings.
 */

import { MAX_PUBLISHED_FINDINGS } from "./eligibility";
import {
  type AffectedEntity,
  type ChangedEntity,
  type Coverage,
  type Finding,
  type ImpactReport,
  type Severity,
  type UnknownItem,
} from "./types";

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
const CONFIDENCE_RANK = { high: 0, medium: 1, low: 2 } as const;

export function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const unique: Finding[] = [];
  for (const finding of findings) {
    if (seen.has(finding.fingerprint)) continue;
    seen.add(finding.fingerprint);
    unique.push(finding);
  }
  return unique;
}

export function rankFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const severity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (severity !== 0) return severity;
    const confidence = CONFIDENCE_RANK[a.confidence.band] - CONFIDENCE_RANK[b.confidence.band];
    if (confidence !== 0) return confidence;
    return a.fingerprint.localeCompare(b.fingerprint);
  });
}

export interface AssembledReport {
  report: ImpactReport;
  /** Candidate counts per section before the publication cap. */
  candidateCounts: { missing: number; conflicting: number; uncertain: number; untested: number; actionRequired: number };
  additionalWithheld: number;
}

export function assembleReport(input: {
  changed: ChangedEntity[];
  affected: AffectedEntity[];
  findings: Finding[];
  unknown: UnknownItem[];
  coverage: Coverage;
}): AssembledReport {
  const unique = dedupeFindings(input.findings);
  const ranked = rankFindings(unique);
  const published = ranked.slice(0, MAX_PUBLISHED_FINDINGS);

  const missing = published.filter((finding) => finding.state === "MISSING" && finding.facet !== "UNTESTED");
  const conflicting = published.filter((finding) => finding.state === "CONFLICTING");
  const uncertain = published.filter((finding) => finding.state === "UNCERTAIN");
  const untested = published.filter((finding) => finding.facet === "UNTESTED");
  const actionRequired = published.filter((finding) => finding.state === "ACTION_REQUIRED");

  const candidateCounts = {
    missing: unique.filter((finding) => finding.state === "MISSING" && finding.facet !== "UNTESTED").length,
    conflicting: unique.filter((finding) => finding.state === "CONFLICTING").length,
    uncertain: unique.filter((finding) => finding.state === "UNCERTAIN").length,
    untested: unique.filter((finding) => finding.facet === "UNTESTED").length,
    actionRequired: unique.filter((finding) => finding.state === "ACTION_REQUIRED").length,
  };
  const additionalWithheld = unique.length - published.length;

  const checklist = published.map((finding) => finding.nextStep);
  if (input.unknown.length > 0) {
    checklist.push(
      `Verify ${input.unknown.length} uncertain ${input.unknown.length === 1 ? "area" : "areas"} the analysis could not resolve (see Unknown).`,
    );
  }
  if (input.coverage.completeness !== "full") {
    checklist.push("Confirm the coverage limits above do not hide scope you care about before merging.");
  }

  const coverage: Coverage = {
    ...input.coverage,
    publishedFindings: published.length,
    totalCandidates: unique.length,
    notes:
      additionalWithheld > 0
        ? [
            ...input.coverage.notes,
            `${additionalWithheld} additional ${additionalWithheld === 1 ? "finding was" : "findings were"} prioritized out of this report; candidate counts are retained above.`,
          ]
        : input.coverage.notes,
  };

  return {
    report: {
      changed: input.changed,
      affected: input.affected,
      missing,
      conflicting,
      uncertain,
      untested,
      unknown: input.unknown,
      actionRequired,
      checklist,
      coverage,
    },
    candidateCounts,
    additionalWithheld,
  };
}
