import { describe, expect, it } from "vitest";
import { isPreviewEnabled, isProductRoute, PREVIEW_REDIRECT_PATH } from "./preview";

describe("preview gate", () => {
  it("enables only on the explicit flag", () => {
    const base = { NODE_ENV: "test" as const };
    expect(isPreviewEnabled({ ...base, PRODUCT_PREVIEW_ENABLED: "1" })).toBe(true);
    expect(isPreviewEnabled({ ...base })).toBe(false);
    expect(isPreviewEnabled({ ...base, PRODUCT_PREVIEW_ENABLED: "0" })).toBe(false);
    expect(isPreviewEnabled({ ...base, PRODUCT_PREVIEW_ENABLED: "true" })).toBe(false);
  });

  it("matches product routes and nothing else", () => {
    expect(isProductRoute("/reports")).toBe(true);
    expect(isProductRoute("/reports/env-var")).toBe(true);
    expect(isProductRoute("/")).toBe(false);
    expect(isProductRoute("/waitlist")).toBe(false);
    expect(isProductRoute("/vision")).toBe(false);
    expect(isProductRoute("/api/waitlist")).toBe(false);
  });

  it("redirects strangers to the waitlist", () => {
    expect(PREVIEW_REDIRECT_PATH).toBe("/waitlist");
  });
});
