/**
 * Eligibility and beta limits (docs/04):
 * - Commit-pinned eligible text files; skip binary, archive, dependency,
 *   generated, and lockfile content except specialized metadata extraction.
 * - Up to 1 MB per eligible file; up to 500 changed files per analysis.
 * - Limits are never trimmed silently: every skip is recorded so the
 *   report can show partial/unsupported completeness honestly.
 */

export const MAX_FILE_BYTES = 1_000_000;
export const MAX_CHANGED_FILES = 500;
export const MAX_TRAVERSAL_DEPTH = 3;
export const MAX_VISITED_ENTITIES = 1000;
export const MAX_PUBLISHED_FINDINGS = 20;

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage", ".vercel"]);

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".mp3",
  ".mp4",
  ".mov",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".node",
  ".pyc",
  ".o",
  ".a",
]);

const GENERATED_BASENAMES = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"]);

export type SupportedKind = "source" | "test" | "env-example" | "prisma-schema" | "route" | "config" | "other";

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
}

export function isSkippedDir(path: string): boolean {
  return normalizePath(path).split("/").some((segment) => SKIP_DIRS.has(segment));
}

export function isSupportedText(path: string): boolean {
  const clean = normalizePath(path);
  const lower = clean.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot >= 0 && SKIP_EXTENSIONS.has(lower.slice(dot))) return false;
  const base = lower.split("/").pop() ?? lower;
  if (GENERATED_BASENAMES.has(base)) return false;
  return true;
}

export function classifyPath(path: string): SupportedKind {
  const clean = normalizePath(path);
  const lower = clean.toLowerCase();
  const base = lower.split("/").pop() ?? lower;
  if (base === ".env.example" || base === ".env.sample") return "env-example";
  if (base === "schema.prisma" || lower.endsWith(".prisma")) return "prisma-schema";
  if (/(^|\/)(app|pages)(\/|$)/.test(lower) && /\.(tsx?|jsx?)$/.test(lower)) return "route";
  if (/\.(test|spec)\.(tsx?|jsx?|mjs|cjs)$/.test(lower)) return "test";
  if (/\.(tsx?|jsx?|mjs|cjs|json|md|txt|yml|yaml|toml)$/.test(lower)) return "source";
  if (base.startsWith(".env.")) return "config";
  return "other";
}

export function isTestPath(path: string): boolean {
  const lower = normalizePath(path).toLowerCase();
  return (
    /\.(test|spec)\.(tsx?|jsx?|mjs|cjs)$/.test(lower) ||
    /(^|\/)__tests__\//.test(lower) ||
    /(^|\/)tests?\//.test(lower)
  );
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export function checkEligible(path: string, byteSize: number): EligibilityResult {
  if (isSkippedDir(path)) return { eligible: false, reason: "excluded directory" };
  if (!isSupportedText(path)) return { eligible: false, reason: "binary, archive, or generated content" };
  if (byteSize > MAX_FILE_BYTES) return { eligible: false, reason: `exceeds 1 MB file limit (${byteSize} bytes)` };
  return { eligible: true };
}
