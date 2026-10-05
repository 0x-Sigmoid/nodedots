/**
 * Deterministic rule families (docs/04, docs/08).
 * Each rule declares ID/version, prerequisites, and severity logic, and
 * returns satisfied / violated / unknown / not-applicable before any
 * finding is constructed. Rules never guess: inconclusive scope yields
 * Unknown, and naming proximity is labeled weaker evidence (docs/09).
 */

import { type Evidence, type Finding, type RuleOutcome, type UnknownItem } from "./types";
import { type ExtractedFile, type PrismaEnum, type RouteDef, matchRoute } from "./extract";

export const RULE_VERSION = "1";

export interface ChangedEntry {
  path: string;
  kind: "added" | "modified" | "removed";
}

export interface TestAssociation {
  strong: boolean;
  via: string;
}

export interface RuleContext {
  /** Head extraction for every analyzed file (changed + unchanged). */
  /** Head extraction for every analyzed file (changed + unchanged). */
  head: Map<string, ExtractedFile>;
  /** Base extraction for changed files only. */
  base: Map<string, ExtractedFile>;
  changes: ChangedEntry[];
  /** Null when the example inventory is missing or unreadable. */
  exampleNames: Map<string, number> | null;
  examplePath: string;
  enums: PrismaEnum[];
  routes: RouteDef[];
  testAssoc: Map<string, TestAssociation>;
  /** Newly referenced env names: name → referencing spans. */
  newEnvRefs: Map<string, { path: string; line: number }[]>;
  dynamicLines: { path: string; line: number }[];
  unresolvedImports: { path: string; specifier: string; line: number }[];
}

export interface RuleResult {
  outcome: RuleOutcome;
  findings: Finding[];
  unknown: UnknownItem[];
}

const noResult: RuleResult = { outcome: "not-applicable", findings: [], unknown: [] };

function fingerprint(ruleId: string, entity: string): string {
  return `${ruleId}:${entity}`;
}

function envEvidence(spans: { path: string; line: number }[], examplePath: string, checked: string): Evidence[] {
  const evidence: Evidence[] = spans.map((span) => ({
    path: span.path,
    startLine: span.line,
    endLine: span.line,
    origin: "rule" as const,
    note: "Literal environment reference introduced by this change.",
  }));
  evidence.push({
    path: examplePath,
    startLine: 1,
    endLine: 1,
    origin: "rule",
    note: checked,
  });
  return evidence;
}

/**
 * ENV_EXAMPLE_001 — newly referenced environment names absent from the
 * checked example configuration (docs/08 worked rule). A fully read
 * inventory with no match is Missing; an unreadable example is Uncertain.
 */
export function envExampleRule(ctx: RuleContext): RuleResult {
  if (ctx.newEnvRefs.size === 0) return noResult;
  if (ctx.exampleNames === null) {
    return {
      outcome: "unknown",
      findings: [],
      unknown: [
        {
          category: "coverage",
          detail: `New environment references could not be checked: ${ctx.examplePath} is missing or unreadable.`,
          paths: [...ctx.newEnvRefs.keys()],
        },
      ],
    };
  }
  const findings: Finding[] = [];
  for (const [name, spans] of ctx.newEnvRefs) {
    if (ctx.exampleNames.has(name)) continue;
    const files = [...new Set(spans.map((span) => span.path))].join(", ");
    findings.push({
      fingerprint: fingerprint("ENV_EXAMPLE_001", name),
      ruleId: "ENV_EXAMPLE_001",
      ruleVersion: RULE_VERSION,
      state: "MISSING",
      facet: "MISSING",
      severity: "medium",
      confidence: {
        band: "high",
        explanation: `Literal reference with a fully parsed ${ctx.examplePath} inventory (${ctx.exampleNames.size} names) and no match.`,
      },
      origin: "rule",
      title: `${name} is referenced but not documented`,
      explanation: `This change references ${name} (${files}), but the checked example configuration contains no such name. Deployments using the example as a template will miss it.`,
      evidence: envEvidence(
        spans,
        ctx.examplePath,
        `Checked the full ${ctx.examplePath} inventory; no match for ${name}.`,
      ),
      nextStep: `Add ${name} to ${ctx.examplePath} (or record an explicit external-secret exception) before merging.`,
    });
  }
  return { outcome: findings.length > 0 ? "violated" : "satisfied", findings, unknown: [] };
}

/**
 * API_ROUTE_001 — fetched same-origin paths with no matching parsed route.
 * The expected route is absent, so the finding is Missing (docs/15: missing
 * needs an expected item plus adequately searched scope and absence).
 */
export function apiRouteRule(ctx: RuleContext): RuleResult {
  const findings: Finding[] = [];
  for (const [path, file] of ctx.head) {
    for (const fetch of file.fetches) {
      if (!fetch.url.startsWith("/")) continue;
      const matched = ctx.routes.some((route) => matchRoute(route.route, fetch.url));
      if (matched) continue;
      findings.push({
        fingerprint: fingerprint("API_ROUTE_001", `${path}:${fetch.url}`),
        ruleId: "API_ROUTE_001",
        ruleVersion: RULE_VERSION,
        state: "MISSING",
        facet: "MISSING",
        severity: "medium",
        confidence: {
          band: "high",
          explanation: `Literal fetch URL compared against ${ctx.routes.length} parsed route patterns; no pattern matches.`,
        },
        origin: "rule",
        title: `No route matches ${fetch.url}`,
        explanation: `${path} fetches ${fetch.url}, but no parsed Next.js route pattern matches it. The call may 404 or hit an unintended handler.`,
        evidence: [
          {
            path,
            startLine: fetch.line,
            endLine: fetch.line,
            origin: "rule",
            note: `Literal fetch of ${fetch.url}.`,
          },
        ],
        nextStep: `Add the missing route or correct the fetch URL before merging.`,
      });
    }
  }
  return { outcome: findings.length > 0 ? "violated" : "satisfied", findings, unknown: [] };
}

/**
 * API_METHOD_001 — a fetched method the resolved route does not export.
 * Two grounded contracts disagree in the same resolved context: Conflict.
 */
export function apiMethodRule(ctx: RuleContext): RuleResult {
  const findings: Finding[] = [];
  for (const [path, file] of ctx.head) {
    for (const fetch of file.fetches) {
      if (!fetch.url.startsWith("/") || fetch.method === null) continue;
      for (const route of ctx.routes) {
        if (!matchRoute(route.route, fetch.url)) continue;
        if (route.methods.length === 0 || route.methods.includes(fetch.method)) continue;
        findings.push({
          fingerprint: fingerprint("API_METHOD_001", `${path}:${fetch.url}:${fetch.method}`),
          ruleId: "API_METHOD_001",
          ruleVersion: RULE_VERSION,
          state: "CONFLICTING",
          facet: "CONFLICTING",
          severity: "high",
          confidence: {
            band: "high",
            explanation: `Both contracts are parsed: the caller sends ${fetch.method} and the route exports ${route.methods.join(", ") || "no handlers"}.`,
          },
          origin: "rule",
          title: `${fetch.method} ${fetch.url} is not handled by the route`,
          explanation: `${path} sends ${fetch.method} to ${fetch.url}, but ${route.path} exports only ${route.methods.join(", ") || "no method handlers"}. The request cannot succeed as written.`,
          evidence: [
            {
              path,
              startLine: fetch.line,
              endLine: fetch.line,
              origin: "rule",
              note: `Literal ${fetch.method} request.`,
            },
            {
              path: route.path,
              startLine: route.methodLines[route.methods[0] ?? ""] ?? 1,
              endLine: route.methodLines[route.methods[0] ?? ""] ?? 1,
              origin: "rule",
              note: `Route exports: ${route.methods.join(", ") || "none"}.`,
            },
          ],
          nextStep: `Export a ${fetch.method} handler or change the caller to a supported method before merging.`,
        });
      }
    }
  }
  return { outcome: findings.length > 0 ? "violated" : "satisfied", findings, unknown: [] };
}

/**
 * TEST_COVERAGE_001 — changed supported symbols with no detected related
 * test. State is Missing, facet is UNTESTED (docs/08). A test import is
 * association; naming proximity alone keeps confidence at medium and says so.
 */
export function testCoverageRule(ctx: RuleContext): RuleResult {
  const findings: Finding[] = [];
  for (const change of ctx.changes) {
    if (change.kind === "removed") continue;
    const file = ctx.head.get(change.path);
    if (!file || file.exports.length === 0) continue;
    const assoc = ctx.testAssoc.get(change.path);
    if (assoc?.strong) continue;
    const symbols = [...new Set(file.exports.map((exp) => exp.name))].slice(0, 8).join(", ");
    const proximityNote = assoc
      ? `Naming proximity to ${assoc.via} is weaker evidence, not proof of behavior coverage.`
      : `No importing test and no naming-proximate test file were detected.`;
    findings.push({
      fingerprint: fingerprint("TEST_COVERAGE_001", change.path),
      ruleId: "TEST_COVERAGE_001",
      ruleVersion: RULE_VERSION,
      state: "MISSING",
      facet: "UNTESTED",
      severity: change.kind === "modified" ? "medium" : "low",
      confidence: {
        band: assoc ? "medium" : "high",
        explanation: assoc
          ? `Only naming proximity to ${assoc.via}; no test imports the changed file.`
          : "Supported extraction with a complete test inventory and no importing or proximate test.",
      },
      origin: "rule",
      title: `Changed ${change.kind === "modified" ? "behavior" : "symbols"} without a related test`,
      explanation: `${change.path} changes ${symbols}. ${proximityNote}`,
      evidence: [
        {
          path: change.path,
          startLine: file.exports[0]?.line ?? 1,
          endLine: file.exports[0]?.line ?? 1,
          origin: "rule",
          note: `Changed export in ${change.kind} file.`,
        },
      ],
      nextStep: `Add a test covering the changed behavior in ${change.path} before merging.`,
    });
  }
  return { outcome: findings.length > 0 ? "violated" : "satisfied", findings, unknown: [] };
}

/**
 * EXPORT_BREAKAGE_001 — removed or renamed exports still referenced by
 * head importers. Conclusive static name resolution is Missing; namespace
 * or side-effect imports that cannot resolve names are Uncertain.
 */
export function exportBreakageRule(
  ctx: RuleContext,
  resolve: (from: string, specifier: string) => string | null,
): RuleResult {
  const findings: Finding[] = [];
  const unknown: UnknownItem[] = [];
  for (const change of ctx.changes) {
    const baseFile = ctx.base.get(change.path);
    if (!baseFile || baseFile.exports.length === 0) continue;
    const baseNames = new Set(baseFile.exports.map((exp) => exp.name));
    const headFile = ctx.head.get(change.path);
    const headNames = new Set((headFile?.exports ?? []).map((exp) => exp.name));
    const removed = [...baseNames].filter((name) => !headNames.has(name));
    if (removed.length === 0) continue;

    const conclusive: { path: string; line: number; names: string[] }[] = [];
    const inconclusive: { path: string; line: number }[] = [];
    for (const [importerPath, importer] of ctx.head) {
      if (importerPath === change.path) continue;
      for (const named of importer.namedImports) {
        if (resolve(importerPath, named.specifier) !== change.path) continue;
        if (named.names.includes("*") || named.names.length === 0) {
          inconclusive.push({ path: importerPath, line: named.line });
        } else {
          const hit = named.names.filter((name) => removed.includes(name));
          if (hit.length > 0) conclusive.push({ path: importerPath, line: named.line, names: hit });
        }
      }
    }

    for (const hit of conclusive) {
      findings.push({
        fingerprint: fingerprint("EXPORT_BREAKAGE_001", `${change.path}:${hit.names.join(",")}`),
        ruleId: "EXPORT_BREAKAGE_001",
        ruleVersion: RULE_VERSION,
        state: "MISSING",
        facet: "MISSING",
        severity: "high",
        confidence: {
          band: "high",
          explanation: "Conclusive static resolution: the importer names the removed export and the file still imports this path.",
        },
        origin: "rule",
        title: `${hit.names.join(", ")} was removed but is still imported`,
        explanation: `${change.path} no longer exports ${hit.names.join(", ")}, but ${hit.path} still imports ${hit.names.length > 1 ? "them" : "it"} from this path. The import is broken.`,
        evidence: [
          {
            path: hit.path,
            startLine: hit.line,
            endLine: hit.line,
            origin: "rule",
            note: `Head importer references ${hit.names.join(", ")}.`,
          },
          {
            path: change.path,
            startLine: baseFile.exports.find((exp) => hit.names.includes(exp.name))?.line ?? 1,
            endLine: baseFile.exports.find((exp) => hit.names.includes(exp.name))?.line ?? 1,
            origin: "rule",
            baseSide: true,
            note: "Base export that no longer exists in head.",
          },
        ],
        nextStep: `Restore the export, update ${hit.path}, or confirm the removal is intentional before merging.`,
      });
    }
    if (inconclusive.length > 0 && conclusive.length === 0) {
      unknown.push({
        category: "unresolved",
        detail: `${change.path} removed exports (${removed.join(", ")}); namespace or side-effect importers cannot be resolved to names.`,
        paths: [...new Set(inconclusive.map((hit) => hit.path))],
      });
    }
  }
  if (findings.length > 0) return { outcome: "violated", findings, unknown };
  return { outcome: unknown.length > 0 ? "unknown" : "satisfied", findings, unknown };
}

/**
 * PRISMA_ENUM_001 — a UI option list that overlaps a parsed enum but
 * disagrees with it. Overlap is required first so unrelated string arrays
 * never flag (precision guard for the mapping check in docs/08).
 */
export function prismaEnumRule(ctx: RuleContext): RuleResult {
  const findings: Finding[] = [];
  for (const headEnum of ctx.enums) {
    for (const [path, file] of ctx.head) {
      for (const list of file.optionLists) {
        const shared = list.values.filter((value) => headEnum.values.includes(value));
        if (shared.length === 0) continue;
        const missingFromUi = headEnum.values.filter((value) => !list.values.includes(value));
        const extraInUi = list.values.filter((value) => !headEnum.values.includes(value));
        if (missingFromUi.length === 0 && extraInUi.length === 0) continue;
        const parts: string[] = [];
        if (extraInUi.length > 0) parts.push(`UI offers ${extraInUi.join(", ")} which the schema rejects`);
        if (missingFromUi.length > 0) parts.push(`schema allows ${missingFromUi.join(", ")} which the UI hides`);
        findings.push({
          fingerprint: fingerprint("PRISMA_ENUM_001", `${headEnum.name}:${path}:${list.line}`),
          ruleId: "PRISMA_ENUM_001",
          ruleVersion: RULE_VERSION,
          state: "CONFLICTING",
          facet: "CONFLICTING",
          severity: "high",
          confidence: {
            band: "high",
            explanation: `Both contracts are parsed: enum ${headEnum.name} (${headEnum.values.join(", ")}) and the UI list (${list.values.join(", ")}).`,
          },
          origin: "rule",
          title: `Option list and ${headEnum.name} enum disagree`,
          explanation: `${parts.join("; ")}. A selection can fail validation or grant the wrong access.`,
          evidence: [
            {
              path: headEnum.path,
              startLine: headEnum.line,
              endLine: headEnum.line,
              origin: "rule",
              note: `Parsed enum ${headEnum.name}: ${headEnum.values.join(", ")}.`,
            },
            {
              path,
              startLine: list.line,
              endLine: list.line,
              origin: "rule",
              note: `Parsed option list: ${list.values.join(", ")}.`,
            },
          ],
          nextStep: `Align the UI options with the ${headEnum.name} enum before merging.`,
        });
      }
    }
  }
  return { outcome: findings.length > 0 ? "violated" : "satisfied", findings, unknown: [] };
}

const AUTH_BOUNDARY = /(^|\/)(middleware|auth|session|permission|role)s?(\.|_|\/|$)/i;

/**
 * AUTH_BOUNDARY_001 — an explicit review policy: auth-boundary changes
 * require manual review. Static analysis cannot verify runtime behavior,
 * so confidence stays medium with the limitation stated.
 */
export function authBoundaryRule(ctx: RuleContext): RuleResult {
  const findings: Finding[] = [];
  for (const change of ctx.changes) {
    if (!AUTH_BOUNDARY.test(change.path)) continue;
    findings.push({
      fingerprint: fingerprint("AUTH_BOUNDARY_001", change.path),
      ruleId: "AUTH_BOUNDARY_001",
      ruleVersion: RULE_VERSION,
      state: "ACTION_REQUIRED",
      facet: "AFFECTED",
      severity: "high",
      confidence: {
        band: "medium",
        explanation: "Policy trigger is a parsed path match; runtime auth behavior is outside supported extraction.",
      },
      origin: "rule",
      title: `Auth boundary changed: ${change.path}`,
      explanation: `This change touches an authentication or authorization boundary. Policy requires a human to review the auth consequences before merging.`,
      evidence: [
        {
          path: change.path,
          startLine: 1,
          endLine: 1,
          origin: "rule",
          note: `File-level change in a ${change.kind} auth-boundary file.`,
        },
      ],
      nextStep: `Manually review session handling, access checks, and provider behavior for ${change.path}.`,
    });
  }
  return { outcome: findings.length > 0 ? "violated" : "satisfied", findings, unknown: [] };
}
