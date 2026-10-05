/**
 * Static extraction without execution (docs/09).
 * Resolves relative paths and `@/` aliases within repository bounds.
 * Records unresolved imports and dynamic targets instead of pretending
 * they are absent. Heuristic patterns are documented where they appear.
 */

export interface ImportRef {
  specifier: string;
  line: number;
  /** True for `import()` / `require()` with a non-literal target. */
  dynamic: boolean;
}

export interface NamedImport {
  specifier: string;
  /** Imported symbol names; `*` for namespace imports, empty for side-effect imports. */
  names: string[];
  line: number;
}

export interface ExportDef {
  name: string;
  line: number;
  isDefault: boolean;
}

export interface EnvRef {
  name: string;
  line: number;
}

export interface FetchCall {
  url: string;
  method: string | null;
  line: number;
}

export interface OptionList {
  values: string[];
  line: number;
}

export interface RouteDef {
  route: string;
  methods: string[];
  /** Exported-method name → 1-based line of the handler. */
  methodLines: Record<string, number>;
  path: string;
  line: number;
}

export interface PrismaModel {
  name: string;
  fields: string[];
  path: string;
  line: number;
}

export interface PrismaEnum {
  name: string;
  values: string[];
  path: string;
  line: number;
}

export interface ExtractedFile {
  path: string;
  imports: ImportRef[];
  namedImports: NamedImport[];
  exports: ExportDef[];
  envRefs: EnvRef[];
  fetches: FetchCall[];
  optionLists: OptionList[];
  /** Lines with dynamic import/require targets (unresolvable → Unknown). */
  dynamicLines: number[];
  testNames: string[];
}

export function lineOf(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i += 1) {
    if (content[i] === "\n") line += 1;
  }
  return line;
}

/** Strip line/block comments. String contents are preserved (URLs live in strings). */
export function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (match) => "\n".repeat((match.match(/\n/g) ?? []).length))
    .replace(/(^|[^\S\n])\/\/[^\n]*/g, "$1");
}

const IMPORT_FROM = /import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
const EXPORT_FROM = /export\s+(?:[^'"]*?\sfrom\s+)['"]([^'"]+)['"]/g;
const REQUIRE_CALL = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
const DYNAMIC_IMPORT_LITERAL = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
const DYNAMIC_IMPORT_ANY = /import\(/g;
const REQUIRE_DYNAMIC = /require\(\s*[^'"\s]/g;
const EXPORT_NAMED =
  /export\s+(?:async\s+)?(?:function|class|enum|interface|type|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
const EXPORT_LIST = /export\s*\{([^}]*)\}/g;
const EXPORT_DEFAULT_NAMED = /export\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g;
const MODULE_EXPORTS = /module\.exports\s*=\s*\{([^}]*)\}/g;
const EXPORTS_ASSIGN = /exports\.([A-Za-z_$][\w$]*)\s*=/g;
const ENV_REF = /(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]*)/g;
const FETCH_CALL = /fetch\(\s*[`'"]([^`'"]+)[`'"]/g;
const METHOD_LITERAL = /method\s*:\s*['"](GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)['"]/i;
const ARRAY_STRINGS = /\[(?:\s*['"][^'"]+['"]\s*,?){2,8}\s*\]/g;
const STRING_LITERAL = /['"]([^'"]+)['"]/g;
const TEST_DECL = /(?:describe|it|test)\(\s*['"`]([^'"`]+)['"`]/g;
const ROUTE_METHOD = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g;
const IMPORT_NAMED = /import\s+(?:([A-Za-z_$][\w$]*)\s*,\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
const IMPORT_DEFAULT = /import\s+([A-Za-z_$][\w$]*)\s+from\s*['"]([^'"]+)['"]/g;
const IMPORT_NAMESPACE = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s*['"]([^'"]+)['"]/g;

export function extractFile(path: string, content: string): ExtractedFile {
  const code = stripComments(content);
  const imports: ImportRef[] = [];
  const namedImports: NamedImport[] = [];
  const exports: ExportDef[] = [];
  const envRefs: EnvRef[] = [];
  const fetches: FetchCall[] = [];
  const optionLists: OptionList[] = [];
  const dynamicLines: number[] = [];
  const testNames: string[] = [];

  const pushImport = (specifier: string, index: number) => {
    imports.push({ specifier, line: lineOf(code, index), dynamic: false });
  };

  for (const match of code.matchAll(IMPORT_FROM)) {
    if (match[1] !== undefined && match.index !== undefined) pushImport(match[1], match.index);
  }
  for (const match of code.matchAll(EXPORT_FROM)) {
    if (match[1] !== undefined && match.index !== undefined) pushImport(match[1], match.index);
  }
  for (const match of code.matchAll(REQUIRE_CALL)) {
    if (match[1] !== undefined && match.index !== undefined) pushImport(match[1], match.index);
  }
  for (const match of code.matchAll(DYNAMIC_IMPORT_LITERAL)) {
    if (match[1] !== undefined && match.index !== undefined) pushImport(match[1], match.index);
  }
  for (const match of code.matchAll(IMPORT_NAMED)) {
    if (match.index === undefined || match[2] === undefined || match[3] === undefined) continue;
    const names = match[2]
      .split(",")
      .map((part) => part.trim().split(/\s+as\s+/).pop()?.trim())
      .filter((name): name is string => !!name && /^[A-Za-z_$][\w$]*$/.test(name));
    if (match[1] !== undefined) names.push("default");
    namedImports.push({ specifier: match[3], names, line: lineOf(code, match.index) });
  }
  for (const match of code.matchAll(IMPORT_DEFAULT)) {
    if (match.index === undefined || match[1] === undefined || match[2] === undefined) continue;
    namedImports.push({ specifier: match[2], names: ["default"], line: lineOf(code, match.index) });
  }
  for (const match of code.matchAll(IMPORT_NAMESPACE)) {
    if (match.index === undefined || match[1] === undefined) continue;
    namedImports.push({ specifier: match[1], names: ["*"], line: lineOf(code, match.index) });
  }

  const literalDynamicAt = new Set<number>();
  for (const match of code.matchAll(DYNAMIC_IMPORT_LITERAL)) {
    if (match.index !== undefined) literalDynamicAt.add(lineOf(code, match.index));
  }
  for (const match of code.matchAll(DYNAMIC_IMPORT_ANY)) {
    if (match.index === undefined) continue;
    const line = lineOf(code, match.index);
    if (!literalDynamicAt.has(line)) dynamicLines.push(line);
  }
  for (const match of code.matchAll(REQUIRE_DYNAMIC)) {
    if (match.index !== undefined) dynamicLines.push(lineOf(code, match.index));
  }

  for (const match of code.matchAll(EXPORT_NAMED)) {
    if (match[1] !== undefined && match.index !== undefined) {
      exports.push({ name: match[1], line: lineOf(code, match.index), isDefault: false });
    }
  }
  for (const match of code.matchAll(EXPORT_LIST)) {
    if (match[1] === undefined || match.index === undefined) continue;
    const baseLine = lineOf(code, match.index);
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) {
        exports.push({ name, line: baseLine, isDefault: false });
      }
    }
  }
  for (const match of code.matchAll(EXPORT_DEFAULT_NAMED)) {
    if (match[1] !== undefined && match.index !== undefined) {
      exports.push({ name: match[1], line: lineOf(code, match.index), isDefault: true });
    }
  }
  for (const match of code.matchAll(MODULE_EXPORTS)) {
    if (match[1] === undefined || match.index === undefined) continue;
    const baseLine = lineOf(code, match.index);
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/[:\s]/)[0]?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) {
        exports.push({ name, line: baseLine, isDefault: false });
      }
    }
  }
  for (const match of code.matchAll(EXPORTS_ASSIGN)) {
    if (match[1] !== undefined && match.index !== undefined) {
      exports.push({ name: match[1], line: lineOf(code, match.index), isDefault: false });
    }
  }

  for (const match of code.matchAll(ENV_REF)) {
    if (match[1] !== undefined && match.index !== undefined) {
      envRefs.push({ name: match[1], line: lineOf(code, match.index) });
    }
  }

  for (const match of code.matchAll(FETCH_CALL)) {
    if (match[1] === undefined || match.index === undefined) continue;
    const line = lineOf(code, match.index);
    const window = code.slice(match.index, match.index + 400);
    const method = window.match(METHOD_LITERAL);
    fetches.push({ url: match[1], method: method?.[1]?.toUpperCase() ?? null, line });
  }

  for (const match of code.matchAll(ARRAY_STRINGS)) {
    if (match.index === undefined) continue;
    const values: string[] = [];
    for (const inner of match[0].matchAll(STRING_LITERAL)) {
      if (inner[1] !== undefined) values.push(inner[1]);
    }
    if (values.length >= 2) optionLists.push({ values, line: lineOf(code, match.index) });
  }

  for (const match of code.matchAll(TEST_DECL)) {
    if (match[1] !== undefined) testNames.push(match[1]);
  }

  return { path, imports, namedImports, exports, envRefs, fetches, optionLists, dynamicLines, testNames };
}

/** Parse `KEY=...` inventories (`.env.example`). Comments and blanks ignored. */
export function parseEnvExample(content: string): Map<string, number> {
  const names = new Map<string, number>();
  content.split("\n").forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (match?.[1]) names.set(match[1], index + 1);
  });
  return names;
}

const PRISMA_MODEL = /(model|enum)\s+([A-Za-z_]\w*)\s*\{([^}]*)\}/g;

/** Parse Prisma models (field names) and enums (values) with line numbers. */
export function parsePrisma(path: string, content: string): { models: PrismaModel[]; enums: PrismaEnum[] } {
  const models: PrismaModel[] = [];
  const enums: PrismaEnum[] = [];
  for (const match of content.matchAll(PRISMA_MODEL)) {
    const kind = match[1];
    const name = match[2];
    const body = match[3];
    if (kind === undefined || name === undefined || body === undefined || match.index === undefined) continue;
    const line = lineOf(content, match.index);
    const tokens = body
      .split("\n")
      .map((raw) => raw.trim())
      .filter((raw) => raw && !raw.startsWith("//") && !raw.startsWith("@@") && !raw.startsWith("@"))
      .map((raw) => raw.split(/\s+/)[0])
      .filter((token): token is string => token !== undefined && /^[A-Za-z_]\w*$/.test(token));
    if (kind === "model") models.push({ name, fields: tokens, path, line });
    else enums.push({ name, values: tokens, path, line });
  }
  return { models, enums };
}

const APP_ROUTE_FILE = /(^|\/)app\/(?:(.+?)\/)?(page|route|layout|loading|error)\.(tsx?|jsx?|mdx?)$/;

/** Map Next.js App Router files to route patterns (`[id]` → `:id`). */
export function toRoutePattern(path: string): string | null {
  const match = APP_ROUTE_FILE.exec(path.replace(/\\/g, "/"));
  if (!match) return null;
  const middle = match[2] ?? "";
  const segments = middle
    .split("/")
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .map((segment) => {
      const dynamic = /^\[(\.\.\.)?([^\]]+)\]$/.exec(segment);
      return dynamic?.[2] ? `:${dynamic[2]}` : segment;
    });
  return `/${segments.join("/")}`;
}

/** Extract route definitions (pattern + exported HTTP methods) from route files. */
export function extractRoute(path: string, content: string): RouteDef | null {
  const pattern = toRoutePattern(path);
  if (pattern === null || !/(^|\/)route\.(tsx?|jsx?)$/.test(path.replace(/\\/g, "/"))) return null;
  const code = stripComments(content);
  const methods: string[] = [];
  const methodLines: Record<string, number> = {};
  for (const match of code.matchAll(ROUTE_METHOD)) {
    if (match[1] === undefined || match.index === undefined) continue;
    methods.push(match[1]);
    methodLines[match[1]] = lineOf(code, match.index);
  }
  return { route: pattern, methods, methodLines, path, line: 1 };
}

/**
 * Match a fetched URL against a route pattern. Query strings and hashes are
 * ignored; `:param` segments match any single path segment.
 */
export function matchRoute(pattern: string, url: string): boolean {
  const clean = url.split("?")[0]?.split("#")[0] ?? url;
  const patternSegments = pattern.split("/").filter(Boolean);
  const urlSegments = clean.split("/").filter(Boolean);
  if (patternSegments.length !== urlSegments.length) return false;
  return patternSegments.every(
    (segment, index) => segment.startsWith(":") || segment === urlSegments[index],
  );
}
