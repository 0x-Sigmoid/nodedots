import { describe, expect, it } from "vitest";
import {
  COMPLETENESS_LABEL,
  DISPOSITIONS,
  formatEvidence,
  getDemoIds,
  getDemoReport,
  getDemoScenario,
  stateClass,
} from "./demo";

describe("demo registry", () => {
  it("resolves every listed id to a scenario and a report", () => {
    for (const id of getDemoIds()) {
      expect(getDemoScenario(id)).toBeDefined();
      expect(getDemoReport(id)).toBeDefined();
    }
    expect(getDemoScenario("nope")).toBeUndefined();
    expect(getDemoReport("nope")).toBeUndefined();
  });

  it("produces the documented sections per scenario", () => {
    expect(getDemoReport("env-var")?.missing.map((item) => item.ruleId)).toContain("ENV_EXAMPLE_001");
    expect(getDemoReport("role-enum")?.conflicting.map((item) => item.ruleId)).toContain("PRISMA_ENUM_001");
    expect(getDemoReport("auth-migration")?.actionRequired.map((item) => item.ruleId)).toContain(
      "AUTH_BOUNDARY_001",
    );
    const contracts = getDemoReport("api-contracts");
    expect(contracts?.conflicting.map((item) => item.ruleId)).toContain("API_METHOD_001");
    expect(contracts?.missing.map((item) => item.ruleId)).toContain("API_ROUTE_001");
  });

  it("returns the cached report on repeat calls", () => {
    expect(getDemoReport("env-var")).toBe(getDemoReport("env-var"));
  });
});

describe("view helpers", () => {
  it("formats evidence ranges with base-side tags", () => {
    expect(
      formatEvidence({ path: "a.ts", startLine: 42, endLine: 42, origin: "rule", note: "" }),
    ).toBe("a.ts:42");
    expect(
      formatEvidence({ path: "a.ts", startLine: 42, endLine: 48, origin: "rule", note: "" }),
    ).toBe("a.ts:42–48");
    expect(
      formatEvidence({ path: "a.ts", startLine: 3, endLine: 3, origin: "rule", baseSide: true, note: "" }),
    ).toBe("a.ts:3 (base)");
  });

  it("maps states to the shared CSS classes", () => {
    expect(stateClass("CONFIRMED")).toBe("confirmed");
    expect(stateClass("MISSING")).toBe("missing");
    expect(stateClass("CONFLICTING")).toBe("conflicting");
    expect(stateClass("UNCERTAIN")).toBe("uncertain");
    expect(stateClass("ACTION_REQUIRED")).toBe("action");
  });

  it("covers the four feedback dispositions from doc 04", () => {
    expect(DISPOSITIONS.map((item) => item.value)).toEqual(["accepted", "dismissed", "fixed", "intentional"]);
  });

  it("labels every completeness outcome", () => {
    expect(Object.keys(COMPLETENESS_LABEL).sort()).toEqual(["full", "partial", "unsupported"]);
  });
});
