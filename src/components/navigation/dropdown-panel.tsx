import { getNavBadge, type NavGroup, type NavItem } from "@/config/nav";
import { NavIcon } from "./nav-icon";
import type { KeyboardEventHandler } from "react";

export function NavItemLink({ item, current, onClick, onKeyDown }: { item: NavItem; current?: boolean; onClick?: () => void; onKeyDown?: KeyboardEventHandler<HTMLAnchorElement> }) {
  const badge = getNavBadge(item);
  return <a className={`nd-nav-item ${item.status !== "live" ? "nd-nav-future" : ""}`} href={item.href} aria-current={current ? item.href.includes("#") ? "location" : "page" : undefined} onClick={onClick} onKeyDown={onKeyDown}>
    <span className="nd-nav-icon"><NavIcon name={item.icon} /></span><span><span className="nd-nav-item-title">{item.label}{badge && <small className="nd-nav-badge">{badge}</small>}</span><span className="nd-nav-description">{item.description}</span></span>
  </a>;
}
export function DropdownPanel({ group, current, onSelect, onItemKeyDown }: { group: NavGroup; current: (href: string) => boolean; onSelect: () => void; onItemKeyDown?: KeyboardEventHandler<HTMLAnchorElement> }) {
  const categories = [...new Set(group.items.map(item => item.category || ""))];
  return <div className={`nd-nav-columns ${group.id === "use-cases" ? "nd-nav-three" : ""}`}>
    {categories.map(category => <div key={category}>{category && <h3>{category}</h3>}<ul>{group.items.filter(item => (item.category || "") === category).map(item => <li key={item.id}><NavItemLink item={item} current={current(item.href)} onClick={onSelect} onKeyDown={onItemKeyDown} /></li>)}</ul></div>)}
  </div>;
}
