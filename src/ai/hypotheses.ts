/**
 * Bounded hypothesis patterns (docs/04: migration/backfill, authorization,
 * billing, and session consequences as AI hypotheses with evidence and
 * uncertainty). These deterministic patterns stand in for model inference
 * until a keyed LLM provider is enabled; every candidate is explicitly
 * labeled, confidence-capped, and gated before publication — never asserted.
 */
import type { ExtractedFile } from "@/engine/extract";

export type HypothesisConfidence = "low" | "medium";

export interface CandidateHypothesis {
  /** Stable family ID, e.g. BILLING_IDENTITY_H1 (H = hypothesis, not rule). */
  family: string;
  title: string;
  explanation: string;
  evidence: { path: string; startLine: number; endLine: number; baseSide?: boolean; note: string }[];
  nextStep: string;
  maxConfidence: HypothesisConfidence;
}

export interface EnrichmentFile {
  content: string;
  extracted: ExtractedFile;
}

export interface EnrichmentContext {
  head: Map<string, EnrichmentFile>;
  base: Map<string, EnrichmentFile>;
  changes: { path: string; kind: "added" | "modified" | "removed" }[];
}

export type HypothesisPattern = (ctx: EnrichmentContext) => CandidateHypothesis[];

function lineOfContent(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i += 1) {
    if (content[i] === "\n") line += 1;
  }
  return line;
}

function firstMatchLine(content: string, pattern: RegExp): number | null {
  const match = pattern.exec(content);
  return match?.index === undefined ? null : lineOfContent(content, match.index);
}

/**
 * BILLING_IDENTITY_H1 — a billing integration still keyed on a legacy
 * identity (overview §6: Stripe keyed by firebase_uid after a Clerk
 * migration). Requires both markers in one file: speculation otherwise.
 */
export function billingIdentityPattern(ctx: EnrichmentContext): CandidateHypothesis[] {
  const out: CandidateHypothesis[] = [];
  for (const [path, file] of ctx.head) {
    if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(path)) continue;
    const hasStripe = /stripe/i.test(file.content);
    const legacy = /firebase_uid|firebaseUid/.exec(file.content);
    if (!hasStripe || !legacy || legacy.index === undefined) continue;
    const line = lineOfContent(file.content, legacy.index);
    out.push({
      family: "BILLING_IDENTITY_H1",
      title: "Billing may still be keyed on the legacy identity",
      explanation:
        "This file references both Stripe and a legacy Firebase UID. If the change migrates identity providers, existing customer mappings may silently stop resolving. This is a bounded hypothesis, not a verified break.",
      evidence: [{ path, startLine: line, endLine: line, note: "Legacy identity reference beside a billing integration." }],
      nextStep: "Verify how existing Stripe customers map to the new identity before merging.",
      maxConfidence: "medium",
    });
  }
  return out;
}

/**
 * SESSION_INVALIDATION_H1 — account deletion without visible session
 * revocation (overview §11). Deletion markers without revocation markers.
 */
export function sessionInvalidationPattern(ctx: EnrichmentContext): CandidateHypothesis[] {
  const out: CandidateHypothesis[] = [];
  for (const [path, file] of ctx.head) {
    if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(path)) continue;
    if (!/deleteUser|deleteAccount|DELETE/.test(file.content)) continue;
    if (/revokeSession|signOut|invalidateSession|revoke/.test(file.content)) continue;
    const line = firstMatchLine(file.content, /deleteUser|deleteAccount/);
    if (line === null) continue;
    out.push({
      family: "SESSION_INVALIDATION_H1",
      title: "Deleted accounts may keep working sessions",
      explanation:
        "This file deletes account data with no visible session revocation nearby. Previously signed-in browsers may stay valid. Bounded hypothesis: revocation could live in an unmodeled job.",
      evidence: [{ path, startLine: line, endLine: line, note: "Deletion without a visible revocation call." }],
      nextStep: "Confirm active sessions are revoked on deletion and test a signed-in browser afterwards.",
      maxConfidence: "medium",
    });
  }
  return out;
}

/**
 * MIGRATION_BACKFILL_H1 — a schema model gains a field with no default and
 * no migration mentioning backfill.
 */
export function migrationBackfillPattern(ctx: EnrichmentContext): CandidateHypothesis[] {
  const out: CandidateHypothesis[] = [];
  const migrations = [...ctx.head.keys()].filter((path) => /migrat/i.test(path));
  const mentionsBackfill = migrations.some((path) => /backfill/i.test(ctx.head.get(path)?.content ?? ""));
  for (const change of ctx.changes) {
    if (change.kind === "removed") continue;
    const headFile = ctx.head.get(change.path);
    const baseFile = ctx.base.get(change.path);
    if (!headFile || !/\.prisma$/.test(change.path)) continue;
    const baseFields = new Set(
      (baseFile?.content ?? "").split("\n").map((raw) => raw.trim().split(/\s+/)[0] ?? ""),
    );
    for (const [index, raw] of headFile.content.split("\n").entries()) {
      const trimmed = raw.trim();
      const tokens = trimmed.split(/\s+/);
      const field = tokens[0];
      const fieldType = tokens[1];
      if (!field || !fieldType) continue;
      if (!/^[A-Za-z_]\w*$/.test(field)) continue;
      if (/^(model|enum)$/.test(field)) continue;
      if (baseFields.has(field)) continue;
      const hasDefault = /@default|DEFAULT/i.test(trimmed);
      if (hasDefault || mentionsBackfill) continue;
      out.push({
        family: "MIGRATION_BACKFILL_H1",
        title: `New schema field ${field} may need a backfill`,
        explanation:
          "A schema field appeared with no default and no migration mentioning backfill was detected. Existing rows may fail writes or read as null. Bounded hypothesis: the migration may live outside supported extraction.",
        evidence: [{ path: change.path, startLine: index + 1, endLine: index + 1, note: `New field: ${field}.` }],
        nextStep: `Add a backfill or default for ${field} before migrating production data.`,
        maxConfidence: "medium",
      });
    }
  }
  return out;
}

const AUTH_MARKERS = /auth|requireAuth|withAuth|clerk|session|permit|authorize/i;

/**
 * AUTHZ_CHECK_H1 — a newly added destructive route (DELETE export) with no
 * visible authorization markers in the file.
 */
export function authzCheckPattern(ctx: EnrichmentContext): CandidateHypothesis[] {
  const out: CandidateHypothesis[] = [];
  for (const change of ctx.changes) {
    if (change.kind !== "added") continue;
    const file = ctx.head.get(change.path);
    if (!file || !/(^|\/)route\.(tsx?|jsx?)$/.test(change.path)) continue;
    if (!/export\s+(?:async\s+)?function\s+DELETE\b/.test(file.content)) continue;
    if (AUTH_MARKERS.test(file.content)) continue;
    const line = firstMatchLine(file.content, /export\s+(?:async\s+)?function\s+DELETE\b/) ?? 1;
    out.push({
      family: "AUTHZ_CHECK_H1",
      title: "New destructive endpoint without visible authorization",
      explanation:
        "This added route exports a DELETE handler with no authorization markers in the file. It may be protected by middleware, but nothing in scope establishes that. Bounded hypothesis, high consequence if wrong.",
      evidence: [{ path: change.path, startLine: line, endLine: line, note: "DELETE handler without visible auth." }],
      nextStep: "Confirm an authorization check guards this route before merging.",
      maxConfidence: "medium",
    });
  }
  return out;
}

export const HEURISTIC_PATTERNS: HypothesisPattern[] = [
  billingIdentityPattern,
  sessionInvalidationPattern,
  migrationBackfillPattern,
  authzCheckPattern,
];
