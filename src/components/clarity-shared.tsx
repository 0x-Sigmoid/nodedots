import { Mark, ThemeToggle } from "./site-header";
import { StateDot, type DotState } from "./state-dot";
import { WaitlistForm } from "./waitlist-form";
import { clarityDescription, clarityHeadline, clarityTrust } from "@/lib/marketing-copy";
export function ClarityHeader({ compact = false, external = false }: { compact?: boolean; external?: boolean }) {
  return <header className="clarity-header"><a className="brand" href="/" aria-label="NodeDots home"><Mark /><span>NodeDots</span></a><nav aria-label="Main navigation"><a href={compact || external ? "/#how-it-works" : "#how-it-works"}>How it works</a><a href={external ? "/#preview" : compact ? "#connected" : "#preview"}>Example</a><a href={compact || external ? "/#faq" : "#faq"}>FAQ</a></nav><div className="clarity-header-actions"><ThemeToggle /><a className="wl-pill" href={external ? "/waitlist#join" : compact ? "#join" : "#signup"}>Join the waitlist</a></div></header>;
}
export function ClarityHero({ compact = false }: { compact?: boolean }) {
  return <section className="clarity-hero" aria-labelledby="hero-title"><p className="clarity-eyebrow"><span className="availability-dot" />For GitHub pull requests</p><h1 id="hero-title">{clarityHeadline}</h1><p className="clarity-lead">{clarityDescription}</p><p className="clarity-result">An impact report for developers and teams, right on the pull request.</p><div className="wl-signup clarity-signup" id={compact ? "join" : "signup"}><WaitlistForm idPrefix={compact ? "early-access" : "hero"} /></div><p className="clarity-trust">{clarityTrust}</p>
    <div className="clarity-hero-links"><a className="clarity-example-link" href={compact ? "#connected" : "#preview"}>See an example <span aria-hidden="true">↓</span></a>
      <a className="clarity-social-button" href="https://x.com/nodedots" target="_blank" rel="noopener noreferrer" aria-label="Follow the story on X, @nodedots (opens in a new tab)">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L5.5 22H2.3l7.3-8.4L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" /></svg>
        Follow the story on X
      </a>
    </div></section>;
}
const legend: [DotState, string, string][] = [["confirmed", "Confirmed", "checks out"], ["missing", "Missing", "expected but absent"], ["conflicting", "Conflicting", "two parts disagree"], ["uncertain", "Uncertain", "not enough evidence"], ["action", "Action required", "needs your decision"]];
export function FindingLegend() {
  return <ul className="clarity-legend" aria-label="Finding states and their meanings">{legend.map(([state, label, meaning]) => <li key={state}><StateDot state={state} /><span>{label}<small>{meaning}</small></span></li>)}</ul>;
}
export function ClarityFooter() {
  return <footer className="clarity-footer"><div><a className="brand" href="/"><Mark /><span>NodeDots</span></a><p>Connect the dots before you act.</p><small>Connect the dots. Before you ship.</small></div><div className="clarity-footer-links"><a href="/privacy">Privacy</a><a href="/waitlist/vision">What&apos;s next</a><span>© {new Date().getFullYear()} NodeDots</span></div><p className="trademark-note">Logos are trademarks of their respective owners. No affiliation or endorsement implied.</p></footer>;
}
