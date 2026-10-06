/**
 * Analysis pipeline entry point (docs/08 steps 1–4, 7–9).
 * AI enrichment (steps 5–6) is deferred per docs/04: this engine publishes
 * deterministic results only, and records what it cannot establish as
 * Unknown rather than inferring it.
 */

import {
  checkEligible,
  isTestPath,
  MAX_CHANGED_FILES,
  MAX_TRAVERSAL_DEPTH,
  normalizePath,
} from "./eligibility";
import {
  extractFile,
  extractRoute,
  parseEnvExample,
  parsePrisma,
} from "./extract";
import type { ExtractedFile } from "./extract";
import { buildGraph, resolveImport, traverseImpact } from "./graph";
import {
  apiMethodRule,
  apiRouteRule,
  authBoundaryRule,
  envExampleRule,
  exportBreakageRule,
  prismaEnumRule,
  type RuleContext,
  testCoverageRule,
} from "./rules";
import { assembleReport } from "./report";
import { enrich, heuristicProvider, type EnrichmentProvider } from "@/ai/index";
import type { EnrichmentContext } from "@/ai/hypotheses";
import {
  type AffectedEntity,
  type AnalysisInput,
  type ChangedEntity,
  type Coverage,
  type ImpactReport,
  type UnknownItem,
} from "./types";

function stemOf(path: string): string {
  const base = normalizePath(path).split("/").pop() ?? path;
  return base.replace(/\.(test|spec)\.(tsx?|jsx?|mjs|cjs)$/, "").replace(/\.(tsx?|jsx?|mjs|cjs)$/, "");
}

/** Naming proximity is weaker evidence (docs/09): shared stem, same dir bonus. */
function isProximate(sourcePath: string, testPath: string): boolean {
  const sourceStem = stemOf(sourcePath).toLowerCase();
  const testStem = stemOf(testPath).toLowerCase();
  if (sourceStem.length < 4 || testStem.length < 4) return false;
  const sameDir =
    normalizePath(sourcePath).split("/").slice(0, -1).join("/") ===
    normalizePath(testPath).split("/").slice(0, -1).join("/");
  const overlap =
    sourceStem === testStem || sourceStem.includes(testStem) || testStem.includes(sourceStem);
  return overlap && (sameDir || sourceStem === testStem);
}

export interface AnalyzeOptions {
  /**
   * Enrichment providers (docs/08 steps 5–6). Defaults to the heuristic
   * patterns; pass false to publish deterministic results only, or pass
   * explicit providers (including a keyed LLM) for model inference.
   */
  enrichment?: EnrichmentProvider[] | false;
}

export async function analyze(input: AnalysisInput, options: AnalyzeOptions = {}): Promise<ImpactReport> {
  const examplePath = input.exampleEnvPath ?? ".env.example";
  const skippedFiles: { path: string; reason: string }[] = [
    ...(input.retrievalNotes?.skipped ?? []),
  ];
  const notes: string[] = [...(input.retrievalNotes?.truncation ?? [])];

  // 1. Snapshot inventory: eligibility per file, changed-file budget.
  const headContents = new Map<string, string>();
  for (const file of input.files) {
    const path = normalizePath(file.path);
    const check = checkEligible(path, file.content.length);
    if (!check.eligible) {
      skippedFiles.push({ path, reason: check.reason ?? "ineligible" });
      continue;
    }
    headContents.set(path, file.content);
  }

  const changes = input.changes.map((change) => ({ ...change, path: normalizePath(change.path) }));
  const changedFilesIgnored = Math.max(0, changes.length - MAX_CHANGED_FILES);
  const budgetedChanges = changes.slice(0, MAX_CHANGED_FILES);
  if (changedFilesIgnored > 0) {
    notes.push(
      `${changedFilesIgnored} changed files exceed the ${MAX_CHANGED_FILES}-file analysis budget and were ignored; the report is partial.`,
    );
  }
  for (const change of budgetedChanges) {
    if (change.head !== null) {
      const check = checkEligible(change.path, change.head.length);
      if (!check.eligible) {
        skippedFiles.push({ path: change.path, reason: check.reason ?? "ineligible" });
        continue;
      }
      headContents.set(change.path, change.head);
    } else {
      headContents.delete(change.path);
    }
  }

  // 2. Extraction over the head snapshot + base sides of changed files.
  const head = new Map<string, ExtractedFile>();
  const base = new Map<string, ExtractedFile>();
  const baseContents = new Map<string, string>();
  const testFiles = new Set<string>();
  for (const [path, content] of headContents) {
    if (isTestPath(path)) {
      testFiles.add(path);
      continue;
    }
    head.set(path, extractFile(path, content));
  }
  // Test files are also extracted (imports establish TESTED_BY), tracked separately.
  const extractedTests = new Map<string, ExtractedFile>();
  for (const path of testFiles) {
    const content = headContents.get(path);
    if (content !== undefined) {
      const extracted = extractFile(path, content);
      extractedTests.set(path, extracted);
      head.set(path, extracted);
    }
  }
  for (const change of budgetedChanges) {
    if (change.base !== null && checkEligible(change.path, change.base.length).eligible) {
      base.set(change.path, extractFile(change.path, change.base));
      baseContents.set(change.path, change.base);
    }
  }

  const knownFiles = new Set(head.keys());
  const exampleContent = headContents.get(examplePath) ?? headContents.get(".env.sample");
  const exampleNames = exampleContent !== undefined ? parseEnvExample(exampleContent) : null;

  const enums = [...head.entries()]
    .filter(([, file]) => file.path.endsWith(".prisma"))
    .flatMap(([path]) => {
      const content = headContents.get(path) ?? "";
      return parsePrisma(path, content).enums;
    });
  const routes = [...head.keys()]
    .map((path) => {
      const content = headContents.get(path) ?? "";
      return extractRoute(path, content);
    })
    .filter((route): route is NonNullable<typeof route> => route !== null);

  // Test associations: explicit imports (strong) + naming proximity (weak).
  const testAssoc = new Map<string, { strong: boolean; via: string }>();
  for (const [testPath, test] of extractedTests) {
    for (const imp of test.imports) {
      const target = resolveImport(testPath, imp.specifier, knownFiles);
      if (target !== null && !testFiles.has(target)) {
        testAssoc.set(target, { strong: true, via: testPath });
      }
    }
  }
  for (const sourcePath of head.keys()) {
    if (testFiles.has(sourcePath) || testAssoc.has(sourcePath)) continue;
    for (const testPath of testFiles) {
      if (isProximate(sourcePath, testPath)) {
        testAssoc.set(sourcePath, { strong: false, via: testPath });
        break;
      }
    }
  }

  // Newly referenced env names: head refs minus base refs for the same file.
  const newEnvRefs = new Map<string, { path: string; line: number }[]>();
  for (const change of budgetedChanges) {
    const headFile = head.get(change.path);
    if (!headFile) continue;
    const kind = change.head === null ? "removed" : change.base === null ? "added" : "modified";
    const baseNames = new Set((base.get(change.path)?.envRefs ?? []).map((ref) => ref.name));
    for (const ref of headFile.envRefs) {
      if (kind !== "added" && baseNames.has(ref.name)) continue;
      const spans = newEnvRefs.get(ref.name) ?? [];
      spans.push({ path: change.path, line: ref.line });
      newEnvRefs.set(ref.name, spans);
    }
  }

  // Graph + impact traversal.
  const envExampleNames = new Set(exampleNames?.keys() ?? []);
  const routePatterns = new Map(routes.map((route) => [route.route, { methods: route.methods, path: route.path }]));
  const { graph, reverse, unresolvedImports } = buildGraph({
    extracted: head,
    knownFiles,
    testFiles,
    envExampleNames,
    routePatterns,
  });
  const changedPaths = budgetedChanges.filter((change) => change.head !== null).map((change) => change.path);
  const impact = traverseImpact(changedPaths, reverse, graph);

  const dynamicLines = [...head.values()].flatMap((file) =>
    file.dynamicLines.map((line) => ({ path: file.path, line })),
  );

  const ctx: RuleContext = {
    head,
    base,
    changes: budgetedChanges.map((change) => ({
      path: change.path,
      kind: change.head === null ? "removed" : change.base === null ? "added" : "modified",
    })),
    exampleNames,
    examplePath,
    enums,
    routes,
    testAssoc,
    newEnvRefs,
    dynamicLines,
    unresolvedImports,
  };

  // 3–4. Direction-aware traversal done above; evaluate deterministic rules.
  const ruleResults = [
    envExampleRule(ctx),
    apiRouteRule(ctx),
    apiMethodRule(ctx),
    testCoverageRule(ctx),
    exportBreakageRule(ctx, (from, specifier) => resolveImport(from, specifier, knownFiles)),
    prismaEnumRule(ctx),
    authBoundaryRule(ctx),
  ];
  const findings = ruleResults.flatMap((result) => result.findings);
  const unknown: UnknownItem[] = ruleResults.flatMap((result) => result.unknown);

  if (dynamicLines.length > 0) {
    const byFile = new Map<string, number[]>();
    for (const item of dynamicLines) {
      const lines = byFile.get(item.path) ?? [];
      lines.push(item.line);
      byFile.set(item.path, lines);
    }
    for (const [path, lines] of byFile) {
      unknown.push({
        category: "dynamic",
        detail: `Dynamic import target at ${path}:${lines.join(", ")} cannot be resolved statically.`,
        paths: [path],
      });
    }
  }
  if (unresolvedImports.length > 0) {
    const bySpecifier = new Map<string, string[]>();
    for (const item of unresolvedImports) {
      const paths = bySpecifier.get(item.specifier) ?? [];
      paths.push(item.path);
      bySpecifier.set(item.specifier, paths);
    }
    for (const [specifier, paths] of bySpecifier) {
      unknown.push({
        category: "unresolved",
        detail: `Relative import "${specifier}" resolves to no known file; recorded rather than assumed absent.`,
        paths: [...new Set(paths)],
      });
    }
  }
  if (skippedFiles.length > 0) {
    unknown.push({
      category: "skipped",
      detail: `${skippedFiles.length} files were excluded from extraction (limits or unsupported content).`,
      paths: skippedFiles.slice(0, 20).map((file) => file.path),
    });
  }
  if (input.retrievalNotes?.forkPartial) {
    unknown.push({
      category: "coverage",
      detail: input.retrievalNotes.forkPartial,
      paths: [],
    });
  }

  // Webhook-adjacent secrets (docs/08 worked report): a new secret whose
  // handler behavior is outside supported extraction is recorded as
  // Unknown, never asserted.
  for (const name of newEnvRefs.keys()) {
    if (!/(SECRET|TOKEN|WEBHOOK)/.test(name)) continue;
    const spans = newEnvRefs.get(name) ?? [];
    unknown.push({
      category: "unresolved",
      detail: `New secret ${name} has no verifiable handler in scope; webhook and rotation behavior cannot be established.`,
      paths: [...new Set(spans.map((span) => span.path))],
    });
  }

  // 5–6. Bounded enrichment: providers propose, the gate validates, only
  // survivors publish as UNCERTAIN findings.
  const providers = options.enrichment === false ? [] : (options.enrichment ?? [heuristicProvider]);
  if (providers.length > 0) {
    const enrichmentHead = new Map<string, { content: string; extracted: ExtractedFile }>();
    for (const [path, extracted] of head) {
      const content = headContents.get(path);
      if (content !== undefined) enrichmentHead.set(path, { content, extracted });
    }
    const enrichmentBase = new Map<string, { content: string; extracted: ExtractedFile }>();
    for (const [path, extracted] of base) {
      const content = baseContents.get(path);
      if (content !== undefined) enrichmentBase.set(path, { content, extracted });
    }
    const enrichmentCtx: EnrichmentContext = {
      head: enrichmentHead,
      base: enrichmentBase,
      changes: budgetedChanges.map((change) => ({
        path: change.path,
        kind: change.head === null ? "removed" : change.base === null ? "added" : "modified",
      })),
    };
    const batch = await enrich(
      enrichmentCtx,
      providers,
      new Set(findings.map((finding) => finding.fingerprint)),
    );
    findings.push(...batch.findings);
    unknown.push(...batch.unknown);
    notes.push(
      `Enrichment: ${batch.stats.candidates} ${batch.stats.candidates === 1 ? "candidate" : "candidates"}, ${batch.stats.published} published as uncertain, ${batch.stats.demoted + batch.stats.rejected} demoted or rejected.`,
    );
    notes.push(...batch.notes);
  }

  // Changed inventory (symbols from head, or base for removals).
  const changed: ChangedEntity[] = budgetedChanges.map((change) => {
    const kind = change.head === null ? "removed" : change.base === null ? "added" : "modified";
    const extracted = (kind === "removed" ? base : head).get(change.path);
    const symbols = [...new Set((extracted?.exports ?? []).map((exp) => exp.name))];
    return { path: change.path, change: kind, symbols };
  });

  const affected: AffectedEntity[] = impact.affected.map((item) => {
    const extracted = head.get(item.path);
    const symbols = [...new Set((extracted?.exports ?? []).map((exp) => exp.name))].slice(0, 8);
    return { path: item.path, symbols, via: item.via, depth: item.depth };
  });

  const completeness: Coverage["completeness"] =
    head.size === 0 && budgetedChanges.length > 0
      ? "unsupported"
      : skippedFiles.length > 0 || changedFilesIgnored > 0 || impact.truncated
        ? "partial"
        : "full";
  if (impact.truncated) {
    notes.push(
      `Impact traversal stopped at the ${MAX_TRAVERSAL_DEPTH}-depth / entity budget; affected paths below are truncated, not exhaustive.`,
    );
  }

  const coverage: Coverage = {
    completeness,
    analyzedFiles: head.size,
    skippedFiles,
    changedFilesAnalyzed: budgetedChanges.length,
    changedFilesIgnored,
    traversalTruncated: impact.truncated,
    publishedFindings: 0,
    totalCandidates: 0,
    notes,
  };

  // 7–9. Dedupe, rank, publish, checklist.
  return assembleReport({ changed, affected, findings, unknown, coverage }).report;
}
