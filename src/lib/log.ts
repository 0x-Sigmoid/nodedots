/**
 * Structured operational logging (docs/18): one JSON line per event with
 * request, delivery, and analysis IDs. Raw source, credentials, PR bodies,
 * and emails never enter normal logs — values that look like secrets or
 * emails are redacted at the boundary.
 */

export type LogLevel = "info" | "warn" | "error";

const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const SENSITIVE_KEY = /token|secret|password|private[_-]?key|api[_-]?key/i;

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(EMAIL_LIKE, "[redacted-email]");
  }
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY.test(key) ? "[redacted]" : redactValue(entry);
    }
    return out;
  }
  return value;
}

export function logEvent(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(redactValue(fields) as Record<string, unknown>),
  });
  if (level === "error") console.error(line);
  else console.log(line);
}
