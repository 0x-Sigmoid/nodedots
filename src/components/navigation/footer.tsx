import { navActions, navGroups, navText, getNavBadge } from "@/config/nav";
import {legalPages} from "@/content/legal";
import { Mark } from "../site-header";
import { NavIcon } from "./nav-icon";

export function Footer() {
  return <footer className="nd-footer"><div className="nd-footer-identity"><a className="brand" href="/" aria-label={navText.home}><Mark /><span>{navText.brand}</span></a><p>{navText.tagline}</p><a className="clarity-social-button" href={navActions.social.href} target="_blank" rel="noopener noreferrer" aria-label={navActions.social.description}><NavIcon name="x" />{navActions.social.label}</a></div>
    <nav className="nd-footer-columns" aria-label={navText.footer}>{navGroups.map(group => <div key={group.id}><h2>{group.label}</h2><ul>{group.items.map(item => <li key={item.id}><a href={item.href}>{item.label}{getNavBadge(item) && <small className="nd-nav-badge">{getNavBadge(item)}</small>}</a></li>)}</ul></div>)}</nav>
    <div className="nd-footer-bottom"><nav className="nd-legal-links" aria-label="Legal links">{legalPages.map(page=><a key={page.href} href={page.href}>{page.title}</a>)}</nav><p>{navText.trademark}</p><span>© {new Date().getFullYear()} {navText.copyright}</span></div></footer>;
}
