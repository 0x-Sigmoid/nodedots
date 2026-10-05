/**
 * Relationship graph (docs/09): adjacency over file and symbol entities.
 * Impact follows reverse IMPORTS to consumers and forward CONFIGURED_BY /
 * READS / TESTED_BY edges to contracts. Traversal is direction-aware,
 * cycle-safe, bounded to depth 3 and 1,000 visited entities. Truncation is
 * reported, never silent.
 */

import { MAX_TRAVERSAL_DEPTH, MAX_VISITED_ENTITIES, normalizePath } from "./eligibility";
import { type ExtractedFile, matchRoute } from "./extract";

export type EdgeRelation = "IMPORTS" | "TESTED_BY" | "CONFIGURED_BY" | "READS" | "HAS_ROUTE";

export interface GraphEdge {
  from: string;
  to: string;
  relation: EdgeRelation;
  line: number;
}

export interface RelationGraph {
  /** Adjacency: entity key → outgoing edges. Entity keys are file paths or `path#Symbol`. */
  outgoing: Map<string, EdgeRelation[]>;
  edges: GraphEdge[];
}

export function symbolKey(path: string, symbol: string): string {
  return `${normalizePath(path)}#${symbol}`;
}

export function resolveImport(fromPath: string, specifier: string, knownFiles: Set<string>): string | null {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;
  const from = normalizePath(fromPath);
  const dir = from.split("/").slice(0, -1);
  const raw = specifier.startsWith("@/")
    ? specifier.slice(2).split("/")
    : [...dir, ...specifier.split("/").filter((segment) => segment !== ".")];
  const resolved: string[] = [];
  for (const segment of raw) {
    if (segment === "..") resolved.pop();
    else if (segment !== "") resolved.push(segment);
  }
  const base = resolved.join("/");
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
  ];
  for (const candidate of candidates) {
    if (knownFiles.has(candidate)) return candidate;
  }
  return null;
}

export interface GraphInput {
  extracted: Map<string, ExtractedFile>;
  /** Head-snapshot file paths eligible for analysis. */
  knownFiles: Set<string>;
  /** Test file paths (subset of knownFiles). */
  testFiles: Set<string>;
  envExampleNames: Set<string>;
  routePatterns: Map<string, { methods: string[]; path: string }>;
}

export function buildGraph(input: GraphInput): {
  graph: RelationGraph;
  reverse: Map<string, { from: string; relation: EdgeRelation; line: number }[]>;
  unresolvedImports: { path: string; specifier: string; line: number }[];
} {
  const edges: GraphEdge[] = [];
  const outgoing = new Map<string, EdgeRelation[]>();
  const reverse = new Map<string, { from: string; relation: EdgeRelation; line: number }[]>();
  const unresolvedImports: { path: string; specifier: string; line: number }[] = [];

  const addEdge = (from: string, to: string, relation: EdgeRelation, line: number) => {
    edges.push({ from, to, relation, line });
    const list = outgoing.get(from) ?? [];
    list.push(relation);
    outgoing.set(from, list);
    const rev = reverse.get(to) ?? [];
    rev.push({ from, relation, line });
    reverse.set(to, rev);
  };

  for (const [path, file] of input.extracted) {
    const from = normalizePath(path);
    for (const imp of file.imports) {
      const target = resolveImport(from, imp.specifier, input.knownFiles);
      if (target === null) {
        if (imp.specifier.startsWith(".") || imp.specifier.startsWith("@/")) {
          unresolvedImports.push({ path: from, specifier: imp.specifier, line: imp.line });
        }
        continue;
      }
      addEdge(from, target, input.testFiles.has(from) ? "TESTED_BY" : "IMPORTS", imp.line);
    }
    for (const env of file.envRefs) {
      if (input.envExampleNames.has(env.name)) {
        addEdge(from, `env:${env.name}`, "CONFIGURED_BY", env.line);
      }
    }
    for (const fetch of file.fetches) {
      for (const [pattern, route] of input.routePatterns) {
        if (matchRoute(pattern, fetch.url)) {
          addEdge(from, route.path, "READS", fetch.line);
        }
      }
    }
  }

  return { graph: { outgoing, edges }, reverse, unresolvedImports };
}

export interface ImpactResult {
  affected: { path: string; via: string[]; depth: number }[];
  truncated: boolean;
  visited: number;
}

/**
 * Traverse from changed files to consumers (reverse IMPORTS/TESTED_BY) and
 * to contracts (forward CONFIGURED_BY/READS). Changed files themselves are
 * excluded from results. Test files reached via traversal are included so
 * reviewers see which tests observe the change.
 */
export function traverseImpact(
  changedPaths: string[],
  reverse: Map<string, { from: string; relation: EdgeRelation; line: number }[]>,
  graph: RelationGraph,
): ImpactResult {
  const changed = new Set(changedPaths.map(normalizePath));
  const visited = new Set<string>(changed);
  const affected = new Map<string, { via: string[]; depth: number }>();
  const queue: { key: string; via: string[]; depth: number }[] = changedPaths.map((path) => ({
    key: normalizePath(path),
    via: [normalizePath(path)],
    depth: 0,
  }));
  let truncated = false;

  while (queue.length > 0) {
    if (visited.size >= MAX_VISITED_ENTITIES) {
      truncated = true;
      break;
    }
    const current = queue.shift();
    if (current === undefined || current.depth >= MAX_TRAVERSAL_DEPTH) continue;

    const neighbors: { key: string; relation: EdgeRelation }[] = [];
    for (const rev of reverse.get(current.key) ?? []) {
      if (rev.relation === "IMPORTS" || rev.relation === "TESTED_BY") {
        neighbors.push({ key: rev.from, relation: rev.relation });
      }
    }
    for (const edge of graph.edges) {
      if (edge.from !== current.key) continue;
      if (edge.relation === "CONFIGURED_BY" || edge.relation === "READS") {
        neighbors.push({ key: edge.to, relation: edge.relation });
      }
    }

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.key)) continue;
      visited.add(neighbor.key);
      if (visited.size > MAX_VISITED_ENTITIES) {
        truncated = true;
        break;
      }
      const via = [...current.via, neighbor.key];
      const depth = current.depth + 1;
      const existing = affected.get(neighbor.key);
      if (existing === undefined || depth < existing.depth) {
        affected.set(neighbor.key, { via, depth });
      }
      queue.push({ key: neighbor.key, via, depth });
    }
  }

  return {
    affected: [...affected.entries()].map(([path, info]) => ({ path, via: info.via, depth: info.depth })),
    truncated,
    visited: visited.size,
  };
}
