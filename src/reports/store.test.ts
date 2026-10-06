import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { analyze } from "@/engine/index";
import { envVar } from "@/engine/fixtures";
import { createFileReportStore, createMemoryReportStore } from "./store";

const dirs: string[] = [];
afterEach(async () => {
  while (dirs.length > 0) {
    const dir = dirs.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

describe("memory report store", () => {
  it("round-trips a report and misses unknown ids", async () => {
    const store = createMemoryReportStore();
    expect(await store.get("nope")).toBeNull();
    const report = await analyze(envVar());
    await store.save("pr-a-b-1-abc123", report, {
      owner: "a",
      repo: "b",
      number: 1,
      headSha: "abc123",
      baseSha: "def456",
    });
    const stored = await store.get("pr-a-b-1-abc123");
    expect(stored?.owner).toBe("a");
    expect(stored?.report.missing.map((item) => item.ruleId)).toContain("ENV_EXAMPLE_001");
    expect(store.size()).toBe(1);
  });
});

describe("file report store", () => {
  it("persists across instances and rejects unsafe ids", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "nodedots-reports-"));
    dirs.push(dir);
    const first = createFileReportStore(dir);
    const report = await analyze(envVar());
    await first.save("pr-a-b-1-abc123", report, {
      owner: "a",
      repo: "b",
      number: 1,
      headSha: "abc123",
      baseSha: "def456",
    });
    const second = createFileReportStore(dir);
    expect((await second.get("pr-a-b-1-abc123"))?.report.coverage.completeness).toBe(
      report.coverage.completeness,
    );
    expect(await second.get("missing")).toBeNull();
    await expect(
      first.save("../escape", report, { owner: "a", repo: "b", number: 1, headSha: "h", baseSha: "b" }),
    ).rejects.toThrow("invalid-analysis-id");
  });
});
