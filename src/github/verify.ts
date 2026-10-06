/**
 * Webhook authenticity (docs/13): validate X-Hub-Signature-256 HMAC with the
 * configured secret using constant-time comparison, over the preserved raw
 * body. IP restrictions may supplement this; they never replace it.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const MAX_WEBHOOK_BYTES = 2_000_000;

export function hashPayload(rawBody: Uint8Array): string {
  return createHash("sha256").update(rawBody).digest("hex");
}

export function signPayload(secret: string, rawBody: Uint8Array): string {
  return `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
}

export function verifySignature(secret: string, rawBody: Uint8Array, signatureHeader: string | null): boolean {
  if (!secret || !signatureHeader) return false;
  const expected = signPayload(secret, rawBody);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function supportedPullRequestAction(action: unknown): action is "opened" | "reopened" | "synchronize" | "ready_for_review" {
  return action === "opened" || action === "reopened" || action === "synchronize" || action === "ready_for_review";
}
