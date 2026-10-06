/**
 * Commit-pinned retrieval (docs/13): PR file list from the pulls API,
 * contents pinned to base/head SHAs, tree manifest for path resolution.
 * Fork PRs fetch through the head repository; inaccessible content becomes
 * an explicit partial scope, never an assumed absence. Rate limits surface
 * as typed errors so the queue backs off instead of burning retries.
 */
import { checkEligible, isTestPath, MAX_CHANGED_FILES, MAX_FILE_BYTES, normalizePath } from "@/engine/eligibility";
import type { AnalysisInput, FileChange, RepoFile } from "@/engine/types";
import { mintInstallationToken } from "./app-auth";
import { devSnapshotProvider, type PullRequestCoords, type SnapshotProvider } from "./snapshots";

export class GitHubApiError extends Error {
  readonly status: number;
  readonly retryAfterSec: number | null;
  constructor(status: number, message: string, retryAfterSec: number | null = null) {
    super(message);
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

export class RateLimitedError extends GitHubApiError {
  constructor(retryAfterSec: number | null) {
    super(429, "github-rate-limited", retryAfterSec);
  }
}

export interface GitHubClientOptions {
  apiBase?: string;
  token: string | null;
  get?: typeof fetch;
}

export function apiBaseOf(options: GitHubClientOptions): string {
  return (options.apiBase ?? "https://api.github.com").replace(/\/$/, "");
}

async function apiGet(
  options: GitHubClientOptions,
  path: string,
  query: Record<string, string> = {},
): Promise<{ status: number; headers: Headers; json: () => Promise<unknown> }> {
  const url = new URL(`${apiBaseOf(options)}${path}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  const get = options.get ?? fetch;
  const response = await get(url.toString(), { headers });
  const remaining = response.headers.get("x-ratelimit-remaining");
  if (response.status === 429 || (response.status === 403 && remaining === "0")) {
    const retryAfter = response.headers.get("retry-after");
    const reset = response.headers.get("x-ratelimit-reset");
    const wait = retryAfter !== null ? Number(retryAfter) : reset !== null ? Math.max(0, Number(reset) * 1000 - Date.now()) / 1000 : null;
    throw new RateLimitedError(Number.isFinite(wait) ? (wait as number) : null);
  }
  if (response.status === 401) throw new GitHubApiError(401, "github-unauthorized");
  if (response.status === 404) throw new GitHubApiError(404, "github-not-found");
  if (response.status >= 500) throw new GitHubApiError(response.status, "github-retryable");
  if (!response.ok) throw new GitHubApiError(response.status, `github-${response.status}`);
  return { status: response.status, headers: response.headers, json: () => response.json() as Promise<unknown> };
}

export interface PullFile {
  path: string;
  previousPath: string | null;
  status: "added" | "modified" | "removed" | "renamed";
}

function parseLinkNext(headers: Headers): string | null {
  const link = headers.get("link");
  if (!link) return null;
  for (const part of link.split(",")) {
    const match = /<([^>]+)>;\s*rel="next"/.exec(part.trim());
    if (match?.[1]) return match[1];
  }
  return null;
}

/** PR file list with rename tracking, following pulls pagination. */
export async function getPullRequestFiles(
  options: GitHubClientOptions,
  owner: string,
  repo: string,
  number: number,
): Promise<{ files: PullFile[]; truncated: boolean }> {
  const files: PullFile[] = [];
  let truncated = false;
  let page = 1;
  for (;;) {
    const { headers, json } = await apiGet(options, `/repos/${owner}/${repo}/pulls/${number}/files`, {
      per_page: "100",
      page: String(page),
    });
    const entries = (await json()) as {
      filename?: unknown;
      status?: unknown;
      previous_filename?: unknown;
    }[];
    if (!Array.isArray(entries)) throw new GitHubApiError(200, "pull-files-shape");
    for (const entry of entries) {
      if (typeof entry.filename !== "string") continue;
      const status = entry.status;
      const mapped: PullFile["status"] =
        status === "added" || status === "removed" || status === "renamed" ? status : "modified";
      files.push({
        path: normalizePath(entry.filename),
        previousPath:
          mapped === "renamed" && typeof entry.previous_filename === "string"
            ? normalizePath(entry.previous_filename)
            : null,
        status: mapped,
      });
      if (files.length >= MAX_CHANGED_FILES) {
        truncated = true;
        return { files: files.slice(0, MAX_CHANGED_FILES), truncated };
      }
    }
    const next = parseLinkNext(headers);
    if (!next || entries.length < 100) return { files, truncated };
    page += 1;
  }
}

export interface TreeEntry {
  path: string;
  size: number | null;
}

/** Recursive tree manifest for path resolution and size pre-checks. */
export async function getTreeManifest(
  options: GitHubClientOptions,
  owner: string,
  repo: string,
  sha: string,
): Promise<{ entries: TreeEntry[]; truncated: boolean }> {
  const { json } = await apiGet(options, `/repos/${owner}/${repo}/git/trees/${sha}`, { recursive: "1" });
  const body = (await json()) as { tree?: unknown; truncated?: unknown };
  if (!Array.isArray(body.tree)) throw new GitHubApiError(200, "tree-shape");
  const entries: TreeEntry[] = [];
  for (const node of body.tree) {
    const item = node as { path?: unknown; size?: unknown; type?: unknown };
    if (item.type !== "blob" || typeof item.path !== "string") continue;
    entries.push({ path: normalizePath(item.path), size: typeof item.size === "number" ? item.size : null });
  }
  return { entries, truncated: body.truncated === true };
}

async function getBlobContent(
  options: GitHubClientOptions,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<{ content: string | null; skipped: string | null }> {
  const { json } = await apiGet(options, `/repos/${owner}/${repo}/contents/${path}`, { ref });
  const body = (await json()) as { content?: unknown; encoding?: unknown; size?: unknown };
  if (typeof body.size === "number" && body.size > MAX_FILE_BYTES) {
    return { content: null, skipped: `exceeds 1 MB file limit (${body.size} bytes)` };
  }
  if (body.encoding !== "base64" || typeof body.content !== "string") {
    return { content: null, skipped: "non-file content entry" };
  }
  const text = Buffer.from(body.content.replace(/\n/g, ""), "base64").toString("utf8");
  const check = checkEligible(path, text.length);
  if (!check.eligible) return { content: null, skipped: check.reason ?? "ineligible" };
  return { content: text, skipped: null };
}

export const MAX_TEST_CONTEXT_FILES = 200;

export interface RetrievalNotes {
  skipped: { path: string; reason: string }[];
  truncation: string[];
  forkPartial: string | null;
}

export interface RetrievedSnapshot {
  changes: FileChange[];
  unchanged: RepoFile[];
  notes: RetrievalNotes;
}

/**
 * Build an AnalysisInput from live GitHub content. Changed files carry
 * base+head; test files (bounded) restore TESTED_BY associations; every
 * skip is recorded so coverage stays honest about unchanged-file blindness.
 */
export async function retrieveSnapshot(
  options: GitHubClientOptions,
  coords: PullRequestCoords & { headOwner?: string; headRepo?: string; isFork?: boolean },
): Promise<RetrievedSnapshot> {
  const headOwner = coords.headOwner ?? coords.owner;
  const headRepo = coords.headRepo ?? coords.repo;
  const notes: RetrievalNotes = { skipped: [], truncation: [], forkPartial: null };
  let sourceOwner = coords.owner;
  let sourceRepo = coords.repo;

  if (coords.isFork === true && (headOwner !== coords.owner || headRepo !== coords.repo)) {
    sourceOwner = headOwner;
    sourceRepo = headRepo;
    // Probe head-repo access before paying for the full retrieval.
    try {
      await apiGet(options, `/repos/${sourceOwner}/${sourceRepo}/contents/package.json`, { ref: coords.headSha });
    } catch (error) {
      if (error instanceof GitHubApiError && (error.status === 404 || error.status === 401)) {
        notes.forkPartial = `Fork content at ${sourceOwner}/${sourceRepo} is not accessible; analysis covers base-side context only.`;
        sourceOwner = coords.owner;
        sourceRepo = coords.repo;
      } else {
        throw error;
      }
    }
  }

  let pullFiles: PullFile[];
  try {
    const result = await getPullRequestFiles(options, coords.owner, coords.repo, coords.number);
    pullFiles = result.files;
    if (result.truncated) notes.truncation.push(`PR file list exceeds the ${MAX_CHANGED_FILES}-file budget; remainder ignored.`);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      if (!notes.forkPartial) {
        notes.forkPartial = `PR file list for ${coords.owner}/${coords.repo}#${coords.number} is not accessible; analysis cannot proceed on content.`;
      }
      return { changes: [], unchanged: [], notes };
    }
    throw error;
  }

  let treeSizes = new Map<string, number | null>();
  try {
    const tree = await getTreeManifest(options, sourceOwner, sourceRepo, coords.headSha);
    treeSizes = new Map(tree.entries.map((entry) => [entry.path, entry.size]));
    if (tree.truncated) notes.truncation.push("Repository tree exceeded the API recursion cap; some paths may not resolve.");
  } catch (error) {
    if (!(error instanceof GitHubApiError && error.status === 404)) throw error;
    notes.truncation.push("Tree manifest unavailable; importing-file resolution is limited to changed files.");
  }

  const changes: FileChange[] = [];
  for (const file of pullFiles) {
    const size = treeSizes.get(file.path) ?? null;
    if (size !== null && size > MAX_FILE_BYTES) {
      notes.skipped.push({ path: file.path, reason: `exceeds 1 MB file limit (${size} bytes)` });
      continue;
    }
    if (file.status === "removed") {
      changes.push({ path: file.path, base: await baseContentOf(options, coords, file), head: null });
      continue;
    }
    const head = await headContentOf(options, sourceOwner, sourceRepo, file.path, coords.headSha, notes);
    if (head === null) continue;
    const base = file.status === "added" ? null : await baseContentOf(options, coords, file);
    changes.push({ path: file.path, base, head });
  }

  // Test-file context (bounded) so TESTED_BY associations survive retrieval.
  const unchanged: RepoFile[] = [];
  const candidates = [...treeSizes.keys()].filter((path) => isTestPath(path)).slice(0, MAX_TEST_CONTEXT_FILES);
  if (treeSizes.size > 0 && candidates.length === MAX_TEST_CONTEXT_FILES) {
    notes.truncation.push(`Test context capped at ${MAX_TEST_CONTEXT_FILES} files; further test relations may be missed.`);
  }
  for (const path of candidates) {
    if (changes.some((change) => change.path === path)) continue;
    const content = await headContentOf(options, sourceOwner, sourceRepo, path, coords.headSha, notes);
    if (content !== null) unchanged.push({ path, content });
  }

  return { changes, unchanged, notes };
}


async function headContentOf(
  options: GitHubClientOptions,
  owner: string,
  repo: string,
  path: string,
  ref: string,
  notes: RetrievalNotes,
): Promise<string | null> {
  try {
    const result = await getBlobContent(options, owner, repo, path, ref);
    if (result.skipped) {
      notes.skipped.push({ path, reason: result.skipped });
      return null;
    }
    return result.content;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      notes.skipped.push({ path, reason: "content not found at pinned ref" });
      return null;
    }
    throw error;
  }
}

async function baseContentOf(
  options: GitHubClientOptions,
  coords: PullRequestCoords,
  file: PullFile,
): Promise<string | null> {
  const basePath = file.status === "renamed" && file.previousPath ? file.previousPath : file.path;
  try {
    const result = await getBlobContent(options, coords.owner, coords.repo, basePath, coords.baseSha);
    return result.content;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null;
    throw error;
  }
}

export function toAnalysisInput(snapshot: RetrievedSnapshot): AnalysisInput {
  return {
    files: snapshot.unchanged,
    changes: snapshot.changes,
    retrievalNotes: snapshot.notes,
  };
}

/** Live provider: commit-pinned GitHub contents through the engine contract. */
export function githubSnapshotProvider(options: GitHubClientOptions): SnapshotProvider {
  return async (coords) => toAnalysisInput(await retrieveSnapshot(options, coords));
}

const tokenCache = new Map<number, { token: string; expiresAtMs: number }>();

/**
 * Provider selection: static installation token → App minting per
 * installation → dev fixture. Minted tokens are cached to expiry.
 */
export function snapshotProviderFromEnv(env: NodeJS.ProcessEnv = process.env): SnapshotProvider {
  return async (coords) => {
    const staticToken = env.GITHUB_INSTALLATION_TOKEN;
    if (staticToken) return githubSnapshotProvider({ token: staticToken })(coords);
    const appId = env.GITHUB_APP_ID;
    const privateKeyPem = env.GITHUB_PRIVATE_KEY_PEM;
    const installationId = coords.installationId ?? null;
    if (appId && privateKeyPem && installationId !== null) {
      const cached = tokenCache.get(installationId);
      if (cached && cached.expiresAtMs - Date.now() > 60_000) {
        return githubSnapshotProvider({ token: cached.token })(coords);
      }
      const minted = await mintInstallationToken({ appId, privateKeyPem, installationId });
      tokenCache.set(installationId, { token: minted.token, expiresAtMs: Date.parse(minted.expiresAt) });
      return githubSnapshotProvider({ token: minted.token })(coords);
    }
    return devSnapshotProvider(env)(coords);
  };
}
