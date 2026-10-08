"use client";
import { CompactAnalysis } from "./compact-analysis";
import { Mark, ThemeToggle } from "./site-header";
import { StateDot, type DotState } from "./state-dot";
import { WaitlistForm } from "./waitlist-form";

const states: { state: DotState; label: string }[] = [
  { state: "confirmed", label: "Confirmed" }, { state: "missing", label: "Missing" },
  { state: "conflicting", label: "Conflicting" }, { state: "uncertain", label: "Uncertain" },
  { state: "action", label: "Action required" },
];
export function WaitlistExperience() {


  return (
    <div className="wl-page">
      <a className="skip-link" href="#wl-main">Skip to content</a>
      <div className="wl-glow" aria-hidden="true" />
      <header className="wl-header wl-width">
        <a className="brand" href="/waitlist" aria-label="NodeDots home"><Mark /><span>NodeDots</span></a>
        <nav aria-label="Waitlist navigation"><a className="wl-nav-link" href="/waitlist/vision">What&apos;s next</a><ThemeToggle /><a className="wl-pill wl-header-join" href="#join">Join the waitlist</a></nav>
      </header>
      <main id="wl-main">
        <section className="wl-hero wl-width" aria-labelledby="wl-title">
          <p className="wl-eyebrow"><span /> NodeDots Code <span className="wl-slash">/</span> Early access</p>
          <h1 id="wl-title">Connect the dots.<br /><span>Before you ship.</span></h1>
          <p className="wl-lead">Your change has a bigger story.<br className="wl-desktop-break" /> See what it touches, what it misses, and what no longer fits.</p>
          <div className="wl-signup" id="join"><WaitlistForm idPrefix="early-access" /></div>
          <p className="wl-scope">Starting with GitHub pull requests · TypeScript &amp; JavaScript</p>
          <a className="wl-scroll" href="#connected">Follow a change <span aria-hidden="true">↓</span></a>
        </section>
        <section className="wl-example wl-width" id="connected" aria-labelledby="wl-example-title">
          <div className="wl-section-heading"><div><p className="wl-kicker">Beyond the diff</p><h2 id="wl-example-title">A small change.<br />A connected view.</h2></div><p>Switch identity providers. Follow the change through your system. Find the assumption that stayed behind.</p></div>
          <CompactAnalysis />
          <div className="wl-states"><span>Every dot has a state.</span><ul aria-label="Finding states">{states.map(({ state, label }) => <li key={state}><StateDot state={state} />{label}</li>)}</ul></div>
        </section>
        <section className="wl-future wl-width" aria-labelledby="wl-future-title">
          <div><p className="wl-kicker">Code is the beginning</p><h2 id="wl-future-title">More dots. Same clarity.</h2><p>Applications, contracts, research, decisions.<br />A glimpse of what comes next for NodeDots.</p></div>
          <a href="/waitlist/vision" className="wl-future-link">Explore the vision <span aria-hidden="true">↗</span></a>
        </section>
      </main>
      <footer className="wl-footer wl-width"><a className="brand" href="#wl-main"><Mark /><span>NodeDots</span></a><p>Connect the dots before you act.</p><span>© {new Date().getFullYear()} NodeDots</span></footer>
    </div>
  );
}
