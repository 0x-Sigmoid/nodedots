/**
 * Postgres outbox (docs/11 tables webhook_deliveries + outbox_events).
 * Delivery receipt and the outbox row commit together; duplicates are
 * acknowledged without duplicate work via the primary-key guard.
 */
import type { SqlClient } from "./sql";
import type { OutboxEvent, OutboxInput, OutboxStore } from "@/github/outbox";

function toEvent(row: Record<string, unknown>): OutboxEvent {
  const received = row.received_at;
  const receivedAt =
    typeof received === "number"
      ? received
      : received
        ? Math.floor(new Date(received as string).getTime() / 1000)
        : 0;
  return {
    deliveryId: String(row.delivery_id),
    event: String(row.event),
    action: (row.action as string | null) ?? null,
    owner: (row.owner as string | null) ?? null,
    repo: (row.repo as string | null) ?? null,
    installationId: row.installation_id === null || row.installation_id === undefined ? null : Number(row.installation_id),
    payloadHash: String(row.payload_hash ?? ""),
    receivedAt,
    status: row.status as OutboxEvent["status"],
    attempts: Number(row.attempts ?? 0),
    lastError: (row.last_error as string | null) ?? null,
    analysisId: (row.analysis_id as string | null) ?? null,
  };
}

const isoOf = (epochSec: number) => new Date(epochSec * 1000).toISOString();

export function createPostgresOutbox(sql: SqlClient): OutboxStore {
  return {
    async receive(event: OutboxInput) {
      const inserted = await sql.query<{ delivery_id: string }>`
        INSERT INTO webhook_deliveries (delivery_id, installation_id, event, payload_hash, received_at)
        VALUES (${event.deliveryId}, ${event.installationId}, ${event.event}, ${event.payloadHash}, ${isoOf(event.receivedAt)})
        ON CONFLICT (delivery_id) DO NOTHING
        RETURNING delivery_id
      `;
      if (inserted.length === 0) return { duplicate: true };
      await sql.query`
        INSERT INTO outbox_events (id, delivery_id, event, action, owner, repo, installation_id, payload, status)
        VALUES (${event.deliveryId}, ${event.deliveryId}, ${event.event}, ${event.action}, ${event.owner}, ${event.repo}, ${event.installationId}, ${JSON.stringify(event.payload)}::jsonb, 'queued')
        ON CONFLICT (id) DO NOTHING
      `;
      return { duplicate: false };
    },
    async readPayload(deliveryId: string) {
      const rows = await sql.query<{ payload: unknown }>`
        SELECT payload FROM outbox_events WHERE delivery_id = ${deliveryId}
      `;
      const raw = rows[0]?.payload;
      return typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
    },
    async nextQueued() {
      const rows = await sql.query<Record<string, unknown>>`
        SELECT o.delivery_id, o.event, o.action, o.owner, o.repo, o.installation_id,
               d.payload_hash, EXTRACT(EPOCH FROM d.received_at)::int AS received_at,
               o.status, o.attempts, o.last_error, o.analysis_id
        FROM outbox_events o JOIN webhook_deliveries d ON d.delivery_id = o.delivery_id
        WHERE o.status = 'queued' ORDER BY o.available_at LIMIT 1
      `;
      const row = rows[0];
      return row ? toEvent(row) : undefined;
    },
    async markProcessing(deliveryId: string) {
      await sql.query`
        UPDATE outbox_events SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
        WHERE delivery_id = ${deliveryId}
      `;
    },
    async markQueued(deliveryId: string) {
      await sql.query`
        UPDATE outbox_events SET status = 'queued', updated_at = NOW()
        WHERE delivery_id = ${deliveryId}
      `;
    },
    async markCompleted(deliveryId: string, analysisId: string) {
      await sql.query`
        UPDATE outbox_events SET status = 'completed', analysis_id = ${analysisId}, updated_at = NOW()
        WHERE delivery_id = ${deliveryId}
      `;
    },
    async markFailed(deliveryId: string, error: string) {
      await sql.query`
        UPDATE outbox_events SET status = 'failed', last_error = ${error}, updated_at = NOW()
        WHERE delivery_id = ${deliveryId}
      `;
    },
    async get(deliveryId: string) {
      const rows = await sql.query<Record<string, unknown>>`
        SELECT o.delivery_id, o.event, o.action, o.owner, o.repo, o.installation_id,
               d.payload_hash, EXTRACT(EPOCH FROM d.received_at)::int AS received_at,
               o.status, o.attempts, o.last_error, o.analysis_id
        FROM outbox_events o JOIN webhook_deliveries d ON d.delivery_id = o.delivery_id
        WHERE o.delivery_id = ${deliveryId}
      `;
      const row = rows[0];
      return row ? toEvent(row) : undefined;
    },
    async pendingCount() {
      const rows = await sql.query<{ count: string }>`
        SELECT COUNT(*)::text AS count FROM outbox_events WHERE status IN ('queued', 'processing')
      `;
      return Number(rows[0]?.count ?? 0);
    },
  };
}
