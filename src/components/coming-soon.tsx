import type { NavItem } from "@/config/nav";
import { Header } from "./navigation/header";
import { Footer } from "./navigation/footer";
import { WaitlistForm } from "./waitlist-form";
import { getNavBadge, navText } from "@/config/nav";
export function ComingSoon({ item }: { item: NavItem }) {
  return <div className="wl-page clarity-page"><div className="wl-glow" aria-hidden="true" /><Header /><main id="main" className="nd-coming-soon"><span className="nd-nav-badge">{navText.planned}</span>{item.status === "tba" && <span className="nd-nav-badge">{getNavBadge(item)}</span>}<h1>{item.label}</h1><p>{item.description}</p><p className="nd-coming-note">{item.status === "tba" ? "Details to be announced." : "This is a planned direction, not a released feature."}</p><div className="wl-signup"><WaitlistForm idPrefix={item.id} /></div></main><Footer /></div>;
}
