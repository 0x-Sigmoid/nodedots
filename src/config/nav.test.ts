import { describe, expect, it } from "vitest";
import { allNavItems, navGroups, comingSoonItems, directItems } from "./nav";
describe("navigation config", () => {
  it("has complete typed entries and unique IDs within each group", () => {
    for (const group of navGroups) {
      expect(new Set(group.items.map(item => item.id)).size).toBe(group.items.length);
      for (const item of group.items) { expect(item.group).toBe(group.id); expect(item.label).toBeTruthy(); expect(item.description).toBeTruthy(); expect(item.icon).toBeTruthy(); expect(["live","planned","tba"]).toContain(item.status); }
    }
  });
  it("uses only real scoped destinations, not auth or future verticals", () => {
    for(const item of allNavItems) expect(item.href).toMatch(/^(\/|https:\/\/x\.com\/nodedots$)/);
    expect(navGroups.slice(0,3).map(group=>group.label)).toEqual(["Product","Use cases","Resources"]);
    expect(directItems.map(item=>item.label)).toEqual(["Docs","Pricing"]);
    expect(allNavItems.map(item=>item.label).join(" ")).not.toMatch(/NodeDots (Apply|Contracts|Research|Business|Verify|Decisions)|Log in|Sign up/);
  });
  it("gives each future item its own renderable stub", () => {
    for(const item of comingSoonItems)expect(item.href).toMatch(/^\/(product|resources)\/[a-z-]+$|^\/pricing$/);
    expect(new Set(comingSoonItems.map(item=>item.href)).size).toBeGreaterThan(5);
  });
});
