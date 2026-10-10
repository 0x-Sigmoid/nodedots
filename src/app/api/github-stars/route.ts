import { githubProject } from "@/config/nav";

export async function GET(request: Request) {
  const cache = typeof caches !== "undefined" ? (caches as CacheStorage & { default?: Cache }).default : undefined;
  const key = new Request(new URL("/api/github-stars", request.url));
  const cached = await cache?.match(key).catch(() => undefined);
  if (cached) return cached;
  let stars: number | null = null;
  try {
    const response = await fetch(`https://api.github.com/repos/${githubProject.repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "NodeDots-website" },
      signal: AbortSignal.timeout(4000), cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      if (data.private === false && Number.isSafeInteger(data.stargazers_count) && data.stargazers_count >= 0) stars = data.stargazers_count;
    }
  } catch { /* A missing count must never turn into an invented zero. */ }
  const result = Response.json({ stars }, { headers: { "Cache-Control": `public, max-age=${stars === null ? 60 : 600}`, "X-Content-Type-Options": "nosniff" } });
  await cache?.put(key, result.clone()).catch(() => undefined);
  return result;
}
