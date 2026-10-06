/**
 * Webhook outbox (docs/13, docs/11): delivery ID, payload hash, routing
 * metadata, and the outbox event are persisted together before any work is
 * acknowledged. Duplicate delivery IDs are acknowledged without duplicate
 * work. Interface-first so the Postgres implementation (docs/11 tables
 * webhook_deliveries + outbox_events) can replace this in-memory version.
 */

export type OutboxStatus = "queued" | "processing" | "completed" | "failed";

export interface OutboxEvent {
  deliveryId: string;
  event: string;
  action: string | null;
  owner: string | null;
  repo: string | null;
  installationId: number | null;
  payloadHash: string;
  receivedAt: number;
  status: OutboxStatus;
  attempts: number;
  lastError: string | null;
  analysisId: string | null;
}

export interface OutboxInput {
  deliveryId: string;
  event: string;
  action: string | null;
  owner: string | null;
  repo: string | null;
  installationId: number | null;
  payloadHash: string;
  receivedAt: number;
  /** Stored alongside the event so the queue can drain without a side channel. */
  payload: unknown;
}

export interface OutboxStore {
  /** Returns `{duplicate: true}` when the delivery ID was already received. */
  receive(event: OutboxInput): Promise<{ duplicate: boolean }>;
  readPayload(deliveryId: string): Promise<unknown>;
  nextQueued(): Promise<OutboxEvent | undefined>;
  markProcessing(deliveryId: string): Promise<void>;
  /** Return an event to the queue for another attempt. */
  markQueued(deliveryId: string): Promise<void>;
  markCompleted(deliveryId: string, analysisId: string): Promise<void>;
  markFailed(deliveryId: string, error: string): Promise<void>;
  get(deliveryId: string): Promise<OutboxEvent | undefined>;
  pendingCount(): Promise<number>;
}

export function createMemoryOutbox(): OutboxStore {
  const events = new Map<string, OutboxEvent>();
  const payloads = new Map<string, unknown>();
  return {
    async receive(event) {
      if (events.has(event.deliveryId)) return { duplicate: true };
      const { payload, ...rest } = event;
      events.set(event.deliveryId, { ...rest, status: "queued", attempts: 0, lastError: null, analysisId: null });
      payloads.set(event.deliveryId, payload);
      return { duplicate: false };
    },
    async readPayload(deliveryId) {
      return payloads.get(deliveryId);
    },
    async nextQueued() {
      for (const event of events.values()) {
        if (event.status === "queued") return event;
      }
      return undefined;
    },
    async markProcessing(deliveryId) {
      const event = events.get(deliveryId);
      if (event) {
        event.status = "processing";
        event.attempts += 1;
      }
    },
    async markQueued(deliveryId) {
      const event = events.get(deliveryId);
      if (event) event.status = "queued";
    },
    async markCompleted(deliveryId, analysisId) {
      const event = events.get(deliveryId);
      if (event) {
        event.status = "completed";
        event.analysisId = analysisId;
      }
    },
    async markFailed(deliveryId, error) {
      const event = events.get(deliveryId);
      if (event) {
        event.status = "failed";
        event.lastError = error;
      }
    },
    async get(deliveryId) {
      return events.get(deliveryId);
    },
    async pendingCount() {
      let count = 0;
      for (const event of events.values()) {
        if (event.status === "queued" || event.status === "processing") count += 1;
      }
      return count;
    },
  };
}

/** Module-level outbox shared by the webhook route and the queue runner in-process. */
export const outbox: OutboxStore = createMemoryOutbox();
