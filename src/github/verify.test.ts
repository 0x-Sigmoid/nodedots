import { describe, expect, it } from "vitest";
import { hashPayload, signPayload, supportedPullRequestAction, verifySignature } from "./verify";

const SECRET = "test-webhook-secret";
const BODY = new TextEncoder().encode('{"action":"opened"}');

describe("webhook signature", () => {
  it("accepts a correctly signed body", () => {
    expect(verifySignature(SECRET, BODY, signPayload(SECRET, BODY))).toBe(true);
  });

  it("rejects tampered bodies, wrong secrets, and missing headers", () => {
    const good = signPayload(SECRET, BODY);
    expect(verifySignature(SECRET, new TextEncoder().encode('{"action":"closed"}'), good)).toBe(false);
    expect(verifySignature("other-secret", BODY, good)).toBe(false);
    expect(verifySignature(SECRET, BODY, null)).toBe(false);
    expect(verifySignature("", BODY, good)).toBe(false);
  });

  it("hashes payloads deterministically", () => {
    expect(hashPayload(BODY)).toBe(hashPayload(BODY));
    expect(hashPayload(BODY)).toHaveLength(64);
  });
});

describe("pull request actions", () => {
  it("accepts the V1 lifecycle actions only", () => {
    for (const action of ["opened", "reopened", "synchronize", "ready_for_review"]) {
      expect(supportedPullRequestAction(action)).toBe(true);
    }
    for (const action of ["closed", "labeled", undefined, null, 42]) {
      expect(supportedPullRequestAction(action)).toBe(false);
    }
  });
});
