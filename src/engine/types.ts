/**
 * NodeDots Code · deterministic analysis engine types.
 *
 * Contracts follow docs/08 (intelligence engine), docs/09 (relationship
 * graph), docs/11 (data model), and docs/15 (evidence policy):
 * - One primary finding state per finding; CHANGED/AFFECTED describe
 *   entities and UNTESTED is a facet, not a state.
 * - Confidence uses high/medium/low bands with an explanation, never a
 *   numeric probability.
 * - Every consequential finding carries evidence, origin, and a next step.
 */

export type FindingState = "CONFIRMED" | "MISSING" | "CONFLICTING" | "UNCERTAIN" | "ACTION_REQUIRED";

export type FindingFacet = "CHANGED" | "AFFECTED" | "MISSING" | "CONFLICTING" | "UNTESTED" | "UNKNOWN";

export type FindingOrigin = "parser" | "rule";

export type ConfidenceBand = "high" | "medium" | "low";

export type Severity = "high" | "medium" | "low";

export interface Evidence {
  /** Repository-relative path. */
  path: string;
  /** 1-based line range supporting the claim. */
  startLine: number;
  endLine: number;
  origin: FindingOrigin;
  /** True when the evidence comes from the base (pre-change) side. */
  baseSide?: boolean;
  note: string;
}

export interface Confidence {
  band: ConfidenceBand;
  explanation: string;
}

export interface Finding {
  /** Stable fingerprint: ruleId + affected logical entity. Links history. */
  fingerprint: string;
  ruleId: string;
  ruleVersion: string;
  state: FindingState;
  facet: FindingFacet;
  severity: Severity;
  confidence: Confidence;
  origin: FindingOrigin;
  title: string;
  explanation: string;
  evidence: Evidence[];
  nextStep: string;
}

export interface UnknownItem {
  category: "dynamic" | "skipped" | "unresolved" | "coverage";
  detail: string;
  paths: string[];
}

export interface ChangedEntity {
  path: string;
  change: "added" | "modified" | "removed";
  symbols: string[];
}

export interface AffectedEntity {
  path: string;
  symbols: string[];
  /** Shortest useful explanation path, e.g. ["api/billing/customers.ts", "db/schema/users.ts"]. */
  via: string[];
  depth: number;
}

export interface Coverage {
  completeness: "full" | "partial" | "unsupported";
  analyzedFiles: number;
  skippedFiles: { path: string; reason: string }[];
  changedFilesAnalyzed: number;
  changedFilesIgnored: number;
  traversalTruncated: boolean;
  publishedFindings: number;
  totalCandidates: number;
  notes: string[];
}

export interface ImpactReport {
  changed: ChangedEntity[];
  affected: AffectedEntity[];
  missing: Finding[];
  conflicting: Finding[];
  /** Bounded enrichment hypotheses that survived evidence validation. */
  uncertain: Finding[];
  untested: Finding[];
  unknown: UnknownItem[];
  actionRequired: Finding[];
  checklist: string[];
  coverage: Coverage;
}

/** Head-snapshot file. Binary content is never passed in; see eligibility. */
export interface RepoFile {
  path: string;
  content: string;
}

/**
 * One changed path with both sides. `base: null` means added,
 * `head: null` means removed.
 */
export interface FileChange {
  path: string;
  base: string | null;
  head: string | null;
}

export interface AnalysisInput {
  /** Unchanged head-snapshot files (changed files come via `changes`). */
  files: RepoFile[];
  changes: FileChange[];
  /** Path of the checked example env inventory. Defaults to `.env.example`. */
  exampleEnvPath?: string;
  /**
   * Retrieval-side limits (live GitHub fetching). Merged into coverage and
   * Unknown so partial scope is explicit, never silent.
   */
  retrievalNotes?: {
    skipped: { path: string; reason: string }[];
    truncation: string[];
    forkPartial: string | null;
  };
}

export type RuleOutcome = "satisfied" | "violated" | "unknown" | "not-applicable";
