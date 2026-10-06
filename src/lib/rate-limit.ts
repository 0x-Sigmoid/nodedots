/**
 * Shared abuse control: hashed-key fixed-window limiter over an injected
 * store (memory by default; a shared store arrives with multi-instance
 * deploys). Keys are SHA-256 hashes so no raw IP is retained in the map.
 */

export interface LimitBucket {
  count: number;
  resetAtSec: number;
}

export async function hashLimitKey(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(parts.join(":")));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export interface LimitDecision {
  allowed: boolean;
  retryAfterSec: number;
}

/**
 * Fixed window: `limit` attempts per `windowSec`, tracked per key. Expired
 * buckets are swept on each check.
 */
export function checkRateLimit(
  store: Map<string, LimitBucket>,
  key: string,
  limit: number,
  windowSec: number,
  nowSec = Math.floor(Date.now() / 1000),
): LimitDecision {
  for (const [stored, bucket] of store) {
    if (bucket.resetAtSec <= nowSec) store.delete(stored);
  }
  const bucket = store.get(key);
  const count = (bucket?.count ?? 0) + 1;
  const resetAtSec = bucket?.resetAtSec ?? nowSec + windowSec;
  store.set(key, { count, resetAtSec });
  if (count > limit) {
    return { allowed: false, retryAfterSec: Math.max(1, resetAtSec - nowSec) };
  }
  return { allowed: true, retryAfterSec: 0 };
}
