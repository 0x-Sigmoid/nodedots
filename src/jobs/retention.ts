/**
 * Retention enforcement (docs/14 defaults): reports/graph snapshots 90 days,
 * raw source caches 7 days, content-free operational logs 30 days, security
 * audit records 180 days. File report rows older than the retention window
 * are removed; Postgres deployments run the equivalent DELETE (see README).
 */
export const REPORT_RETENTION_DAYS = 90;

export function isExpired(savedAtIso: string, retentionDays: number, nowMs = Date.now()): boolean {
  const saved = Date.parse(savedAtIso);
  if (Number.isNaN(saved)) return true;
  return nowMs - saved > retentionDays * 24 * 60 * 60 * 1000;
}

export function selectExpired<T extends { name: string; mtimeMs: number }>(
  entries: T[],
  retentionDays: number,
  nowMs = Date.now(),
): T[] {
  const cutoff = nowMs - retentionDays * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => entry.mtimeMs < cutoff);
}

/** Postgres equivalent for managed deployments (run on a schedule). */
export const POSTGRES_RETENTION_SQL = `-- analyses + findings (CASCADE handles findings/evidence/feedback where FK-bound)
DELETE FROM analyses WHERE created_at < NOW() - INTERVAL '90 days';
-- outbox terminal states
DELETE FROM outbox_events WHERE status IN ('completed', 'failed') AND updated_at < NOW() - INTERVAL '30 days';
DELETE FROM webhook_deliveries WHERE received_at < NOW() - INTERVAL '30 days'
  AND NOT EXISTS (SELECT 1 FROM outbox_events o WHERE o.delivery_id = webhook_deliveries.delivery_id AND o.status IN ('queued', 'processing'));`;
