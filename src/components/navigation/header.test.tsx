// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./header";
const routeState = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => routeState.path }));
vi.mock("../site-header", () => ({ Mark: () => <svg />, ThemeToggle: () => <button type="button">Theme</button> }));
let root: Root, container: HTMLDivElement;
const button = (id: string) => document.getElementById(id) as HTMLButtonElement;
const key = (element: Element, value: string) => act(() => { element.dispatchEvent(new KeyboardEvent("keydown", { key:value, bubbles:true })); });
async function render(reduced=false) { await act(async()=>root.render(<Header reduced={reduced} />)); }
beforeEach(() => {
  vi.useFakeTimers(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  routeState.path = "/";
  Object.defineProperty(window,"innerWidth",{value:1280,writable:true,configurable:true});
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>setTimeout(()=>callback(0),1)); vi.stubGlobal("cancelAnimationFrame",clearTimeout);
  container=document.createElement("div"); document.body.append(container); root=createRoot(container);
});
afterEach(async()=>{ await act(async()=>root.unmount()); container.remove(); document.body.style.overflow=""; vi.useRealTimers(); vi.unstubAllGlobals(); });
describe("Header disclosure behavior",()=>{
  it("opens with keyboard, navigates links, and restores focus on Escape",async()=>{
    await render(); const trigger=button("nd-product-trigger"); trigger.focus(); key(trigger,"Enter"); await act(async()=>vi.advanceTimersByTime(2));
    const links=document.querySelectorAll<HTMLAnchorElement>("#nd-product-panel a"); expect(document.activeElement).toBe(links[0]); expect(trigger.getAttribute("aria-expanded")).toBe("true");
    key(links[0],"ArrowDown");expect(document.activeElement).toBe(links[1]); key(links[1],"Escape");expect(document.activeElement).toBe(trigger);expect(document.getElementById("nd-product-panel")).toBeNull();
  });
  it("opens with Space and ArrowDown and keeps only one panel open",async()=>{
    await render();key(button("nd-product-trigger")," ");await act(async()=>vi.advanceTimersByTime(2));
    key(button("nd-resources-trigger"),"ArrowDown");await act(async()=>vi.advanceTimersByTime(2));expect(document.getElementById("nd-product-panel")).toBeNull();expect(document.getElementById("nd-resources-panel")).not.toBeNull();
  });
  it("waits 120ms to hover open and 200ms to close",async()=>{
    await render();const wrapper=button("nd-product-trigger").parentElement!;
    act(()=>wrapper.dispatchEvent(new MouseEvent("mouseover",{bubbles:true,relatedTarget:document.body})));await act(async()=>vi.advanceTimersByTime(119));expect(document.getElementById("nd-product-panel")).toBeNull();await act(async()=>vi.advanceTimersByTime(1));expect(document.getElementById("nd-product-panel")).not.toBeNull();
    act(()=>wrapper.dispatchEvent(new MouseEvent("mouseout",{bubbles:true,relatedTarget:document.body})));await act(async()=>vi.advanceTimersByTime(199));expect(document.getElementById("nd-product-panel")).not.toBeNull();await act(async()=>vi.advanceTimersByTime(1));expect(document.getElementById("nd-product-panel")).toBeNull();
  });
  it("closes on focus leaving the disclosure without trapping focus",async()=>{
    await render();const trigger=button("nd-product-trigger");trigger.focus();key(trigger,"ArrowDown");await act(async()=>vi.advanceTimersByTime(2));
    await act(async()=>button("nd-resources-trigger").focus());expect(document.getElementById("nd-product-panel")).toBeNull();expect(document.activeElement).toBe(button("nd-resources-trigger"));
  });
  it("locks and restores scroll, accordion exclusivity, and focus for the mobile sheet",async()=>{
    window.innerWidth=360;document.body.style.overflow="auto";await render();const menu=document.querySelector<HTMLButtonElement>(".nd-menu-button")!;
    await act(async()=>menu.click());expect(document.body.style.overflow).toBe("hidden");expect(document.activeElement).toBe(button("nd-mobile-product-trigger"));
    await act(async()=>button("nd-mobile-product-trigger").click());await act(async()=>button("nd-mobile-resources-trigger").click());expect(document.getElementById("nd-mobile-product-panel")).toBeNull();expect(document.getElementById("nd-mobile-resources-panel")).not.toBeNull();
    key(button("nd-mobile-resources-trigger"),"Escape");expect(document.body.style.overflow).toBe("auto");expect(document.activeElement).toBe(menu);expect(document.getElementById("nd-mobile-navigation")).toBeNull();
  });
  it("restores scroll on unmount and removes competing waitlist action",async()=>{
    window.innerWidth=360;await render(true);expect(document.querySelector(".nd-join")).toBeNull();expect(document.getElementById("nd-use-cases-trigger")).toBeNull();await act(async()=>document.querySelector<HTMLButtonElement>(".nd-menu-button")!.click());await act(async()=>root.render(<div />));expect(document.body.style.overflow).toBe("");
  });
  it("closes the sheet and restores scrolling on route change",async()=>{
    window.innerWidth=360;await render();await act(async()=>document.querySelector<HTMLButtonElement>(".nd-menu-button")!.click());expect(document.body.style.overflow).toBe("hidden");routeState.path="/pricing";await render();expect(document.body.style.overflow).toBe("");expect(document.getElementById("nd-mobile-navigation")).toBeNull();
  });
});
