import { describe, expect, it } from "vitest";
import { checkRateLimit, clientIp, hashLimitKey, type LimitBucket } from "./rate-limit";
import { logEvent, redactValue } from "./log";

describe("rate limiter", () => {
  it("allows within budget and blocks past it with retry-after", () => {
    const store = new Map<string, LimitBucket>();
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(store, "k", 5, 600, 1000).allowed).toBe(true);
    }
    const blocked = checkRateLimit(store, "k", 5, 600, 1001);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets after the window and sweeps expired buckets", () => {
    const store = new Map<string, LimitBucket>();
    checkRateLimit(store, "k", 1, 60, 1000);
    expect(checkRateLimit(store, "k", 1, 60, 2000).allowed).toBe(true);
    expect(store.size).toBe(1);
  });

  it("hashes keys and reads the forwarded IP", async () => {
    const key = await hashLimitKey(["feedback", "1.2.3.4"]);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).not.toContain("1.2.3.4");
    const request = new Request("http://x/", { headers: { "x-forwarded-for": "9.9.9.9, 1.1.1.1" } });
    expect(clientIp(request)).toBe("9.9.9.9");
    expect(clientIp(new Request("http://x/"))).toBe("local");
  });
});

describe("log redaction", () => {
  it("redacts emails, secret keys, and nested values", () => {
    expect(redactValue("contact me at jane@example.com please")).toBe("contact me at [redacted-email] please");
    expect(redactValue({ token: "abc", nested: { user: "bob@example.com" }, safe: "ok" })).toEqual({
      token: "[redacted]",
      nested: { user: "[redacted-email]" },
      safe: "ok",
    });
    expect(redactValue(42)).toBe(42);
  });

  it("emits single-line JSON", () => {
    const lines: string[] = [];
    const original = console.log;
    console.log = (line: string) => {
      lines.push(line);
    };
    try {
      logEvent("info", "test_event", { delivery: "d1" });
    } finally {
      console.log = original;
    }
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({ level: "info", event: "test_event", delivery: "d1" });
  });
});
