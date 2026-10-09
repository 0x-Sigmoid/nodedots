import { describe, expect, it } from "vitest";
import { allNavItems } from "./nav";
const origin = process.env.NODEDOTS_NAV_TEST_ORIGIN;
const links = [...new Set(allNavItems.map(item => item.href).filter(href => href.startsWith("/")))];
// Run against a dev/preview server to test real routes and anchors, not a copy
// of routing logic. The regular offline unit suite does not require a server.
describe.skipIf(!origin)("navigation HTTP link resolution", () => {
  it.each(links)("resolves %s and its section anchor", async href => {
    const url = new URL(href, origin);
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    expect(response.status).toBe(200);
    if (url.hash) {
      const html = await response.text();
      const id = decodeURIComponent(url.hash.slice(1));
      expect(html).toMatch(new RegExp(`\\bid=["']${id}["']`));
    }
  }, 25000);
});
