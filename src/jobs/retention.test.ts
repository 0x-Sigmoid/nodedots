import { describe, expect, it } from "vitest";
import { isExpired, REPORT_RETENTION_DAYS, selectExpired } from "./retention";

describe("retention", () => {
  const now = Date.parse("2026-10-05T00:00:00.000Z");
  const day = 24 * 60 * 60 * 1000;

  it("expires rows past the window and keeps fresh ones", () => {
    expect(REPORT_RETENTION_DAYS).toBe(90);
    expect(isExpired(new Date(now - 91 * day).toISOString(), 90, now)).toBe(true);
    expect(isExpired(new Date(now - 89 * day).toISOString(), 90, now)).toBe(false);
    expect(isExpired("not-a-date", 90, now)).toBe(true);
  });

  it("selects only expired files", () => {
    const entries = [
      { name: "old.json", mtimeMs: now - 100 * day },
      { name: "new.json", mtimeMs: now - 10 * day },
    ];
    expect(selectExpired(entries, 90, now).map((entry) => entry.name)).toEqual(["old.json"]);
  });
});
