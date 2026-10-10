"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { directItems, navActions, navGroups, navText, getNavBadge } from "@/config/nav";
import { Mark, ThemeToggle } from "../site-header";
import { DropdownPanel } from "./dropdown-panel";
import { MobileMenu } from "./mobile-menu";
import { SkipLink } from "./skip-link";
import { GitHubButton } from "./github-button";

const snapshot = () => `${location.hash}|${Number(scrollY > 8)}|${innerWidth}`;
const serverSnapshot = () => "|0|1280";
function subscribe(listener: () => void) {
  for (const event of ["hashchange", "scroll", "resize"]) window.addEventListener(event, listener, { passive: true });
  return () => { for (const event of ["hashchange", "scroll", "resize"]) window.removeEventListener(event, listener); };
}
const widthFor = (id: string) => id === "use-cases" ? 820 : 460;
export function Header({ reduced = false }: { reduced?: boolean }) {
  const pathname = usePathname();
  return <HeaderNavigation key={pathname} pathname={pathname} reduced={reduced} />;
}
function HeaderNavigation({ pathname, reduced }: { pathname: string; reduced: boolean }) {
  const [hash, scrolled, viewport] = useSyncExternalStore(subscribe, snapshot, serverSnapshot).split("|");
  const mobile = Number(viewport) < 1024;
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [offset, setOffset] = useState(0);
  const root = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusFrame = useRef<number | null>(null);
  const groups = navGroups.filter(group => reduced ? ["product", "resources"].includes(group.id) : group.id !== "company");
  const current = (href: string) => href.includes("#") ? href === `${pathname}${hash}` : href === pathname;
  const cancel = () => { if (timer.current) clearTimeout(timer.current); };
  function align(id: string) {
    const trigger = document.getElementById(`nd-${id}-trigger`);
    if (!trigger) return;
    const left = trigger.getBoundingClientRect().left;
    const width = Math.min(widthFor(id), innerWidth - 32);
    setOffset(Math.max(16 - left, Math.min(0, innerWidth - 16 - left - width)));
  }
  function show(id: string, focus = false) {
    cancel(); align(id); setOpen(id);
    if (focus) {
      if (focusFrame.current) cancelAnimationFrame(focusFrame.current);
      focusFrame.current = requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#nd-${id}-panel a`)?.focus());
    }
  }
  function close(returnFocus = false) {
    cancel(); setOpen(null);
    if (focusFrame.current) cancelAnimationFrame(focusFrame.current);
    if (returnFocus && open) document.getElementById(`nd-${open}-trigger`)?.focus({ preventScroll: true });
  }
  function closeSheet() { setSheet(false); setOpen(null); }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (focusFrame.current) cancelAnimationFrame(focusFrame.current); }, []);
  useEffect(() => {
    if (!sheet) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.querySelector<HTMLButtonElement>("#nd-mobile-navigation button")?.focus({ preventScroll: true });
    const onResize = () => { if (innerWidth >= 1024) { setSheet(false); setOpen(null); } };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setSheet(false); setOpen(null); } };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("resize", onResize); window.removeEventListener("keydown", onEscape); if (menuButton.current?.isConnected) menuButton.current.focus({ preventScroll: true }); };
  }, [sheet]);
  useEffect(() => {
    if (!open || sheet) return;
    const onResize = () => { if (innerWidth < 1024) setOpen(null); else align(open); };
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(null); };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setOpen(null); if (focusFrame.current) cancelAnimationFrame(focusFrame.current); document.getElementById(`nd-${open}-trigger`)?.focus({ preventScroll: true }); } };
    window.addEventListener("resize", onResize); document.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", onEscape);
    return () => { window.removeEventListener("resize", onResize); document.removeEventListener("pointerdown", outside); window.removeEventListener("keydown", onEscape); };
  }, [open, sheet]);
  return <><SkipLink /><header ref={root} className={`nd-header ${reduced ? "nd-header-reduced" : ""} ${scrolled === "1" || sheet ? "nd-header-scrolled" : ""}`}><div className="nd-header-inner"><a className="brand" href="/" aria-label={navText.home}><Mark /><span>{navText.brand}</span></a>
    <nav className="nd-desktop-nav" aria-label={navText.navigation}>{groups.map(group => <div className="nd-dropdown" key={group.id} onMouseEnter={() => { if (!mobile) { cancel(); timer.current = setTimeout(() => show(group.id), 120); } }} onMouseLeave={() => { if (!mobile) { cancel(); timer.current = setTimeout(() => setOpen(null), 200); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) close(); }}>
      <button type="button" id={`nd-${group.id}-trigger`} className="nd-nav-trigger" aria-expanded={open === group.id && !sheet} aria-controls={`nd-${group.id}-panel`} onClick={() => open === group.id ? close() : show(group.id)} onKeyDown={event => {
        if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); if (open === group.id && event.key !== "ArrowDown") close(true); else show(group.id, true); }
      }}>{group.label}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 4 3 3 3-3" /></svg></button>
      {open === group.id && !sheet && <div id={`nd-${group.id}-panel`} className="nd-panel" style={{ left: offset, width: `min(${widthFor(group.id)}px, calc(100vw - 32px))` }} role="region" aria-labelledby={`nd-${group.id}-trigger`}><div className="nd-panel-surface"><DropdownPanel group={group} current={current} onSelect={() => close()} onItemKeyDown={event => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        const links = [...event.currentTarget.closest(".nd-panel")!.querySelectorAll<HTMLAnchorElement>("a")]; const index = links.indexOf(document.activeElement as HTMLAnchorElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        event.preventDefault(); links[next]?.focus();
      }} /></div></div>}
    </div>)}{(reduced ? [navActions.roadmap] : directItems).map(item => <a className="nd-direct-link" key={item.id} href={item.href} aria-current={current(item.href) ? "page" : undefined}>{item.label}{getNavBadge(item) && <small className="nd-nav-badge">{getNavBadge(item)}</small>}</a>)}</nav>
    <div className="nd-header-actions"><div className="nd-desktop-actions"><GitHubButton /><ThemeToggle /></div>{!reduced && <a className="wl-pill nd-join" href={navActions.join.href}>{navActions.join.label}</a>}<button className="nd-menu-button" ref={menuButton} type="button" aria-label={sheet ? navText.closeMenu : navText.openMenu} aria-expanded={sheet} aria-controls="nd-mobile-navigation" onClick={() => { cancel(); setOpen(null); setSheet(!sheet); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{sheet ? <path d="m5 5 14 14M19 5 5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg></button></div>
    {sheet && <MobileMenu groups={groups} openGroup={open} toggle={id => setOpen(open === id ? null : id)} current={current} close={closeSheet} reduced={reduced} />}
  </div></header></>;
}
