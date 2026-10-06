/**
 * Fixture eval harness (docs/16): per-scenario expectations over rule
 * identity plus a false-positive proxy — no high-severity finding outside
 * the expected set. Thresholds live here, separate from unit tests, so
 * quality regressions fail loudly with scenario attribution.
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@/engine/index";
import {
  apiContracts,
  authMigration,
  envVar,
  exportRename,
  importChain,
  manyUntested,
  roleEnum,
} from "@/engine/fixtures";
import type { AnalysisInput } from "@/engine/types";

interface EvalCase {
  name: string;
  input: () => AnalysisInput;
  /** Rule IDs that must appear somewhere in the report. */
  expected: string[];
  /** High-severity rule IDs allowed beyond `expected` (empty = none). */
  allowedHigh: string[];
}

const CASES: EvalCase[] = [
  {
    name: "auth-migration",
    input: authMigration,
    expected: ["AUTH_BOUNDARY_001", "BILLING_IDENTITY_H1"],
    allowedHigh: [],
  },
  {
    name: "env-var",
    input: envVar,
    expected: ["ENV_EXAMPLE_001"],
    allowedHigh: [],
  },
  {
    name: "role-enum",
    input: roleEnum,
    expected: ["PRISMA_ENUM_001"],
    allowedHigh: [],
  },
  {
    name: "export-rename",
    input: exportRename,
    expected: ["EXPORT_BREAKAGE_001"],
    allowedHigh: [],
  },
  {
    name: "api-contracts",
    input: apiContracts,
    expected: ["API_METHOD_001", "API_ROUTE_001"],
    allowedHigh: [],
  },
  {
    name: "import-chain",
    input: importChain,
    expected: [],
    allowedHigh: [],
  },
  {
    name: "many-untested",
    input: () => manyUntested(25),
    expected: ["TEST_COVERAGE_001"],
    allowedHigh: [],
  },
];

describe("fixture eval", () => {
  for (const kase of CASES) {
    it(`${kase.name}: expected findings present, no unexpected high severity`, async () => {
      const report = await analyze(kase.input());
      const all = [...report.missing, ...report.conflicting, ...report.uncertain, ...report.untested, ...report.actionRequired];
      const rules = new Set(all.map((finding) => finding.ruleId));
      for (const ruleId of kase.expected) {
        expect(rules.has(ruleId), `expected ${ruleId} in ${kase.name}`).toBe(true);
      }
      const allowed = new Set([...kase.expected, ...kase.allowedHigh]);
      const unexpectedHigh = all.filter(
        (finding) => finding.severity === "high" && !allowed.has(finding.ruleId),
      );
      expect(
        unexpectedHigh.map((finding) => finding.ruleId),
        `unexpected high-severity findings in ${kase.name}`,
      ).toEqual([]);
    });
  }

  it("caps published output on the noisy fixture", async () => {
    const report = await analyze(manyUntested(25));
    expect(report.coverage.publishedFindings).toBeLessThanOrEqual(20);
  });
});
