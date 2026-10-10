import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
afterEach(() => vi.unstubAllGlobals());
describe("public GitHub star count", () => {
  it("serves cached counts without another GitHub request", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);
    vi.stubGlobal("caches", { default: { match: vi.fn().mockResolvedValue(Response.json({ stars: 27 })) } });
    expect(await (await GET(new Request("https://nodedots.com/api/github-stars"))).json()).toEqual({ stars: 27 });
    expect(upstream).not.toHaveBeenCalled();
  });
  it("returns the actual public count, including zero", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ private: false, stargazers_count: 0 })));
    const response = await GET(new Request("https://nodedots.com/api/github-stars"));
    expect(await response.json()).toEqual({ stars: 0 });
    expect(response.headers.get("Cache-Control")).toContain("600");
  });
  it.each([{ private: true, stargazers_count: 42 }, { private: false, stargazers_count: -1 }, { private: false, stargazers_count: "100" }])("omits private or invalid counts: %j", async data => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(data)));
    expect(await (await GET(new Request("https://nodedots.com/api/github-stars"))).json()).toEqual({ stars: null });
  });
  it("keeps unavailable counts unknown instead of inventing zero", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
    expect(await (await GET(new Request("https://nodedots.com/api/github-stars"))).json()).toEqual({ stars: null });
  });
});
