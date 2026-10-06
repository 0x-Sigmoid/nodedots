/**
 * Postgres feedback store (feedback_events). Latest-wins is resolved in the
 * query (DISTINCT ON per fingerprint, newest first) so readers never scan
 * full history.
 */
import type { SqlClient } from "./sql";
import {
  resolveLatest,
  type FeedbackRecord,
  type FeedbackStore,
  type StoredDisposition,
} from "@/reports/feedback";

export function createPostgresFeedbackStore(sql: SqlClient): FeedbackStore {
  return {
    async record(input: {
      analysisId: string;
      fingerprint: string;
      disposition: StoredDisposition;
      reason?: string | null;
    }) {
      const id = `${input.analysisId}:${input.fingerprint}:${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
      await sql.query`
        INSERT INTO feedback_events (id, analysis_id, finding_fingerprint, actor, disposition, reason)
        VALUES (${id}, ${input.analysisId}, ${input.fingerprint}, 'local', ${input.disposition}, ${input.reason ?? null})
      `;
    },
    async forAnalysis(analysisId: string) {
      const rows = await sql.query<{ fingerprint: string; disposition: string; reason: string | null; created_at: string }>`
        SELECT DISTINCT ON (finding_fingerprint) finding_fingerprint AS fingerprint, disposition,
               reason, created_at
        FROM feedback_events WHERE analysis_id = ${analysisId} ORDER BY finding_fingerprint, created_at DESC
      `;
      return resolveLatest(
        rows.map(
          (row): FeedbackRecord => ({
            fingerprint: row.fingerprint,
            disposition: row.disposition as StoredDisposition,
            reason: row.reason,
            createdAt: new Date(row.created_at).toISOString(),
          }),
        ),
      );
    },
    async history(analysisId: string, fingerprint: string) {
      const rows = await sql.query<{ disposition: string; reason: string | null; created_at: string }>`
        SELECT disposition, reason, created_at FROM feedback_events
        WHERE analysis_id = ${analysisId} AND finding_fingerprint = ${fingerprint} ORDER BY created_at
      `;
      return rows.map(
        (row): FeedbackRecord => ({
          fingerprint,
          disposition: row.disposition as StoredDisposition,
          reason: row.reason,
          createdAt: new Date(row.created_at).toISOString(),
        }),
      );
    },
  };
}
