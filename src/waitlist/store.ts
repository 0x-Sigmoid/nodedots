import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export interface WaitlistStore {
 add(email: string, joinedAt: number): Promise<void>;
 remove(email: string): Promise<void>;
 allow(key: string, now: number): Promise<boolean>;
 claimConfirmation(email: string, now: number): Promise<{ token: string; claimId: string } | null>;
 completeConfirmation(email: string, claimId: string, now: number): Promise<void>;
 releaseConfirmation(email: string, claimId: string): Promise<void>;
 removeByToken(token: string): Promise<void>;
}

export function createD1WaitlistStore(database: D1Database): WaitlistStore {
 return {
  async claimConfirmation(email, now) {
   const claimId = crypto.randomUUID();
   const row = await database.prepare(
    "UPDATE waitlist_signups SET confirmation_status = 'sending', confirmation_claimed_at = ?, confirmation_claim_id = ?, unsubscribe_token = COALESCE(unsubscribe_token, ?) WHERE email = ? AND (confirmation_status = 'pending' OR (confirmation_status = 'sending' AND confirmation_claimed_at < ?)) RETURNING unsubscribe_token",
   ).bind(now, claimId, crypto.randomUUID(), email, now - 300).first<{ unsubscribe_token: string }>();
   return row ? { token: row.unsubscribe_token, claimId } : null;
  },
  async completeConfirmation(email, claimId, now) {
   await database.prepare("UPDATE waitlist_signups SET confirmation_status = 'sent', confirmation_sent_at = ?, confirmation_claim_id = NULL WHERE email = ? AND confirmation_claim_id = ?").bind(now, email, claimId).run();
  },
  async releaseConfirmation(email, claimId) {
   await database.prepare("UPDATE waitlist_signups SET confirmation_status = 'pending', confirmation_claim_id = NULL WHERE email = ? AND confirmation_claim_id = ?").bind(email, claimId).run();
  },
  async removeByToken(token) {
   await database.prepare("DELETE FROM waitlist_signups WHERE unsubscribe_token = ?").bind(token).run();
  },
  async add(email, joinedAt) {
   await database.prepare(
    "INSERT INTO waitlist_signups(email, joined_at, consent, consent_version) VALUES (?, ?, 1, ?) ON CONFLICT(email) DO NOTHING",
   ).bind(email, joinedAt, "launch-updates-v1").run();
  },
  async remove(email) {
   await database.prepare("DELETE FROM waitlist_signups WHERE email = ?").bind(email).run();
  },
  async allow(key, now) {
   // Shared across Worker instances. The increment is atomic in the database.
   const result = await database.batch([
    database.prepare("DELETE FROM waitlist_rate_limits WHERE expires_at <= ?").bind(now),
    database.prepare(
     "INSERT INTO waitlist_rate_limits(key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 RETURNING attempts",
    ).bind(key, now + 1200),
   ]);
   const row = result[1].results?.[0] as { attempts: number } | undefined;
   if (!row) throw new Error("Rate limit storage unavailable");
   return row.attempts <= 5;
  },
 };
}

export async function getWaitlistStore(): Promise<WaitlistStore> {
 const { env } = await getCloudflareContext({ async: true });
 const database = (env as unknown as { WAITLIST_DB?: D1Database }).WAITLIST_DB;
 if (!database) throw new Error("WAITLIST_DB binding is required");
 // Never fall back to volatile memory after returning a successful signup.
 return createD1WaitlistStore(database);
}
