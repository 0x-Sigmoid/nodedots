/**
 * Human feedback (docs/08 lifecycle, docs/04 dispositions): append-only
 * disposition events; the latest event per finding defines its state.
 * Clearing records a "cleared" event rather than deleting history.
 */
import type { Disposition } from "./demo";

export const FEEDBACK_VALUES = ["accepted", "dismissed", "fixed", "intentional", "cleared"] as const;

export type StoredDisposition = (typeof FEEDBACK_VALUES)[number];

export interface FeedbackRecord {
  fingerprint: string;
  disposition: StoredDisposition;
  reason: string | null;
  createdAt: string;
}

export interface FeedbackStore {
  record(input: { analysisId: string; fingerprint: string; disposition: StoredDisposition; reason?: string | null }): Promise<void>;
  /** Latest-wins dispositions per fingerprint; "cleared" resolves to absent. */
  forAnalysis(analysisId: string): Promise<Record<string, Disposition>>;
  history(analysisId: string, fingerprint: string): Promise<FeedbackRecord[]>;
}

export function isValidDisposition(value: unknown): value is StoredDisposition {
  return typeof value === "string" && (FEEDBACK_VALUES as readonly string[]).includes(value);
}

export function isValidFingerprint(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 300;
}

export function isValidAnalysisId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(value);
}

/** Resolve latest-wins view over an event list (shared by all backends). */
export function resolveLatest(events: FeedbackRecord[]): Record<string, Disposition> {
  const latest = new Map<string, FeedbackRecord>();
  for (const event of events) {
    const current = latest.get(event.fingerprint);
    if (!current || event.createdAt >= current.createdAt) latest.set(event.fingerprint, event);
  }
  const view: Record<string, Disposition> = {};
  for (const [fingerprint, event] of latest) {
    if (event.disposition !== "cleared") view[fingerprint] = event.disposition;
  }
  return view;
}

export function createMemoryFeedbackStore(): FeedbackStore & { size(): number } {
  const byAnalysis = new Map<string, FeedbackRecord[]>();
  return {
    async record(input) {
      const list = byAnalysis.get(input.analysisId) ?? [];
      list.push({
        fingerprint: input.fingerprint,
        disposition: input.disposition,
        reason: input.reason ?? null,
        createdAt: new Date().toISOString(),
      });
      byAnalysis.set(input.analysisId, list);
    },
    async forAnalysis(analysisId) {
      return resolveLatest(byAnalysis.get(analysisId) ?? []);
    },
    async history(analysisId, fingerprint) {
      return (byAnalysis.get(analysisId) ?? []).filter((event) => event.fingerprint === fingerprint);
    },
    size() {
      let count = 0;
      for (const list of byAnalysis.values()) count += list.length;
      return count;
    },
  };
}
