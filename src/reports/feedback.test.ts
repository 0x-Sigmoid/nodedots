import { describe, expect, it } from "vitest";
import {
  createMemoryFeedbackStore,
  isValidAnalysisId,
  isValidDisposition,
  isValidFingerprint,
  resolveLatest,
} from "./feedback";

describe("feedback validation", () => {
  it("accepts the four dispositions plus cleared", () => {
    for (const value of ["accepted", "dismissed", "fixed", "intentional", "cleared"]) {
      expect(isValidDisposition(value)).toBe(true);
    }
    for (const value of ["approved", "", null, undefined, 42]) {
      expect(isValidDisposition(value)).toBe(false);
    }
  });

  it("validates fingerprints and analysis ids", () => {
    expect(isValidFingerprint("RULE:x")).toBe(true);
    expect(isValidFingerprint("")).toBe(false);
    expect(isValidFingerprint("x".repeat(301))).toBe(false);
    expect(isValidAnalysisId("pr-octo-demo-7-abc")).toBe(true);
    expect(isValidAnalysisId("../escape")).toBe(false);
    expect(isValidAnalysisId("")).toBe(false);
  });
});

describe("latest-wins resolution", () => {
  it("keeps the newest event and drops cleared reviews", () => {
    const view = resolveLatest([
      { fingerprint: "a", disposition: "accepted", reason: null, createdAt: "2026-01-01T00:00:00.000Z" },
      { fingerprint: "a", disposition: "dismissed", reason: null, createdAt: "2026-01-02T00:00:00.000Z" },
      { fingerprint: "b", disposition: "fixed", reason: null, createdAt: "2026-01-01T00:00:00.000Z" },
      { fingerprint: "b", disposition: "cleared", reason: null, createdAt: "2026-01-03T00:00:00.000Z" },
    ]);
    expect(view).toEqual({ a: "dismissed" });
  });
});

describe("memory feedback store", () => {
  it("records and resolves per analysis", async () => {
    const store = createMemoryFeedbackStore();
    await store.record({ analysisId: "r1", fingerprint: "f1", disposition: "accepted" });
    await store.record({ analysisId: "r1", fingerprint: "f1", disposition: "fixed", reason: "patched" });
    await store.record({ analysisId: "r2", fingerprint: "f1", disposition: "dismissed" });
    expect(await store.forAnalysis("r1")).toEqual({ f1: "fixed" });
    expect(await store.forAnalysis("r2")).toEqual({ f1: "dismissed" });
    expect(await store.forAnalysis("nope")).toEqual({});
    const history = await store.history("r1", "f1");
    expect(history.map((event) => event.disposition)).toEqual(["accepted", "fixed"]);
    expect(store.size()).toBe(3);
  });
});
