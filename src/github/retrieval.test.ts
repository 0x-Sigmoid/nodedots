import { generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createAppJwt, mintInstallationToken } from "./app-auth";
import {
  GitHubApiError,
  RateLimitedError,
  getPullRequestFiles,
  retrieveSnapshot,
  snapshotProviderFromEnv,
  toAnalysisInput,
} from "./retrieval";

function stubFetch(routes: Record<string, { status: number; headers?: Record<string, string>; body: unknown }>) {
  const calls: string[] = [];
  const get = (async (url: string) => {
    calls.push(url);
    const route = routes[url];
    if (!route) {
      return { ok: false, status: 404, headers: new Headers(), json: () => Promise.resolve({}) };
    }
    return {
      ok: route.status >= 200 && route.status < 300,
      status: route.status,
      headers: new Headers(route.headers ?? {}),
      json: () => Promise.resolve(route.body),
    };
  }) as unknown as typeof fetch;
  return { get, calls };
}

const b64 = (text: string) => Buffer.from(text, "utf8").toString("base64");

describe("app auth", () => {
  it("signs a verifiable RS256 JWT", () => {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    const jwt = createAppJwt("12345", pem, 1_700_000_000);
    const [header, payload, signature] = jwt.split(".");
    expect(JSON.parse(Buffer.from(header ?? "", "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    const claims = JSON.parse(Buffer.from(payload ?? "", "base64url").toString()) as Record<string, number | string>;
    expect(claims.iss).toBe("12345");
    expect(claims.exp).toBe(1_700_000_000 + 600);
    expect(
      verify("RSA-SHA256", Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature ?? "", "base64url")),
    ).toBe(true);
  });

  it("mints installation tokens with the app JWT", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    const posts: { url: string; auth: string }[] = [];
    const post = (async (url: string, init: { headers: Record<string, string> }) => {
      posts.push({ url, auth: init.headers.Authorization });
      return {
        ok: true,
        status: 201,
        headers: new Headers(),
        json: () => Promise.resolve({ token: "tok", expires_at: "2030-01-01T00:00:00Z" }),
      };
    }) as unknown as typeof fetch;
    const result = await mintInstallationToken({ appId: "1", privateKeyPem: pem, installationId: 9 }, post);
    expect(result.token).toBe("tok");
    expect(posts[0]?.url).toBe("https://api.github.com/app/installations/9/access_tokens");
    expect(posts[0]?.auth.startsWith("Bearer ey")).toBe(true);
  });
});

const API = "https://api.github.com";
const COORDS = { owner: "octo", repo: "demo", number: 7, baseSha: "b".repeat(40), headSha: "a".repeat(40) };

describe("retrieval", () => {
  it("lists PR files with rename tracking", async () => {
    const { get } = stubFetch({
      [`${API}/repos/octo/demo/pulls/7/files?per_page=100&page=1`]: {
        status: 200,
        headers: { link: `<${API}/repos/octo/demo/pulls/7/files?per_page=100&page=2>; rel="next"` },
        body: [{ filename: "a.ts", status: "modified" }],
      },
      [`${API}/repos/octo/demo/pulls/7/files?per_page=100&page=2`]: { status: 200, body: [] },
    });
    const result = await getPullRequestFiles({ token: null, get }, "octo", "demo", 7);
    expect(result.files).toEqual([{ path: "a.ts", previousPath: null, status: "modified" }]);
    expect(result.truncated).toBe(false);
  });

  it("builds base/head changes and fetches bounded test context", async () => {
    const aHead = "export const a = 2;\n";
    const aBase = "export const a = 1;\n";
    const { get } = stubFetch({
      [`${API}/repos/octo/demo/pulls/7/files?per_page=100&page=1`]: {
        status: 200,
        body: [{ filename: "lib/a.ts", status: "modified" }],
      },
      [`${API}/repos/octo/demo/git/trees/${"a".repeat(40)}?recursive=1`]: {
        status: 200,
        body: {
          truncated: false,
          tree: [
            { path: "lib/a.ts", size: 20, type: "blob" },
            { path: "tests/a.test.ts", size: 30, type: "blob" },
          ],
        },
      },
      [`${API}/repos/octo/demo/contents/lib/a.ts?ref=${"a".repeat(40)}`]: {
        status: 200,
        body: { content: b64(aHead), encoding: "base64", size: aHead.length },
      },
      [`${API}/repos/octo/demo/contents/lib/a.ts?ref=${"b".repeat(40)}`]: {
        status: 200,
        body: { content: b64(aBase), encoding: "base64", size: aBase.length },
      },
      [`${API}/repos/octo/demo/contents/tests/a.test.ts?ref=${"a".repeat(40)}`]: {
        status: 200,
        body: { content: b64("import { a } from '../lib/a';\ntest('a', () => {});\n"), encoding: "base64", size: 40 },
      },
    });
    const snapshot = await retrieveSnapshot({ token: "tok", get }, COORDS);
    expect(snapshot.changes).toEqual([{ path: "lib/a.ts", base: aBase, head: aHead }]);
    expect(snapshot.unchanged.map((file) => file.path)).toEqual(["tests/a.test.ts"]);
    expect(snapshot.notes.skipped).toEqual([]);
    const input = toAnalysisInput(snapshot);
    expect(input.retrievalNotes?.forkPartial).toBeNull();
  });

  it("marks inaccessible fork content as partial, never absent", async () => {
    const { get } = stubFetch({});
    const snapshot = await retrieveSnapshot({ token: "tok", get }, { ...COORDS, headOwner: "fork", headRepo: "demo", isFork: true });
    expect(snapshot.notes.forkPartial).toContain("fork");
    expect(snapshot.changes).toEqual([]);
  });

  it("maps rate limits, auth, and retryable failures", async () => {
    const limited = stubFetch({
      [`${API}/repos/octo/demo/pulls/7/files?per_page=100&page=1`]: {
        status: 403,
        headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1999999999" },
        body: {},
      },
    });
    await expect(getPullRequestFiles({ token: "tok", get: limited.get }, "octo", "demo", 7)).rejects.toBeInstanceOf(
      RateLimitedError,
    );
    const denied = stubFetch({
      [`${API}/repos/octo/demo/pulls/7/files?per_page=100&page=1`]: { status: 401, body: {} },
    });
    await expect(getPullRequestFiles({ token: "bad", get: denied.get }, "octo", "demo", 7)).rejects.toMatchObject({
      status: 401,
    });
    const broken = stubFetch({
      [`${API}/repos/octo/demo/pulls/7/files?per_page=100&page=1`]: { status: 500, body: {} },
    });
    await expect(
      getPullRequestFiles({ token: "tok", get: broken.get }, "octo", "demo", 7),
    ).rejects.toBeInstanceOf(GitHubApiError);
  });

  it("selects static token, then minting, then fixtures", async () => {
    const withToken = snapshotProviderFromEnv({
      NODE_ENV: "test" as const,
      GITHUB_INSTALLATION_TOKEN: "tok",
    } as NodeJS.ProcessEnv);
    const realFetch = globalThis.fetch;
    let authorized = "";
    globalThis.fetch = (async (url: string, init?: { headers?: Record<string, string> }) => {
      authorized = init?.headers?.Authorization ?? "";
      if (url.includes("/pulls/")) {
        return { ok: true, status: 200, headers: new Headers(), json: () => Promise.resolve([]) };
      }
      return { ok: true, status: 200, headers: new Headers(), json: () => Promise.resolve({ tree: [] }) };
    }) as unknown as typeof fetch;
    try {
      const input = await withToken(COORDS);
      expect(authorized).toBe("Bearer tok");
      expect(input.changes).toEqual([]);
    } finally {
      globalThis.fetch = realFetch;
    }
    const fallback = snapshotProviderFromEnv({} as NodeJS.ProcessEnv);
    const fixture = await fallback(COORDS);
    expect(fixture.changes.length).toBeGreaterThan(0);
  });
});
