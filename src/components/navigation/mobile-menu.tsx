import { directItems, navActions, navText, getNavBadge, type NavGroup } from "@/config/nav";
import { DropdownPanel } from "./dropdown-panel";
import { GitHubButton } from "./github-button";
import { ThemeToggle } from "../site-header";

export function MobileMenu({ groups, openGroup, toggle, current, close, reduced }: { groups: readonly NavGroup[]; openGroup: string | null; toggle: (id: string) => void; current: (href: string) => boolean; close: () => void; reduced: boolean }) {
  return <div id="nd-mobile-navigation" className="nd-mobile-sheet" role="region" aria-label={navText.navigation}>
    {groups.map(group => <div className="nd-mobile-group" key={group.id}><button type="button" id={`nd-mobile-${group.id}-trigger`} aria-expanded={openGroup === group.id} aria-controls={`nd-mobile-${group.id}-panel`} onClick={() => toggle(group.id)}>{group.label}<span aria-hidden="true">{openGroup === group.id ? "−" : "+"}</span></button>
      {openGroup === group.id && <div id={`nd-mobile-${group.id}-panel`} role="region" aria-labelledby={`nd-mobile-${group.id}-trigger`}><DropdownPanel group={group} current={current} onSelect={close} /></div>}
    </div>)}
    <div className="nd-mobile-direct">{(reduced ? [navActions.roadmap] : directItems).map(item => <a href={item.href} key={item.id} aria-current={current(item.href) ? "page" : undefined} onClick={close}>{item.label}{getNavBadge(item) && <small className="nd-nav-badge">{getNavBadge(item)}</small>}</a>)}<GitHubButton onClick={close} /><ThemeToggle /></div>
  </div>;
}
