"use client";

import { useEffect } from "react";
import { InteractiveDemo } from "./change-review-demo";
import { Mark, ThemeToggle } from "./site-header";
import { StateDot, type DotState } from "./state-dot";
import { WaitlistForm } from "./waitlist-form";

const legend: { state: DotState; label: string }[] = [
  { state: "confirmed", label: "Confirmed" },
  { state: "missing", label: "Missing" },
  { state: "conflicting", label: "Conflicting" },
  { state: "uncertain", label: "Uncertain" },
  { state: "action", label: "Action required" },
];

export function NodeDotsLanding({ waitlistScope = false }: { waitlistScope?: boolean }) {
  const visionHref = waitlistScope ? "/waitlist/vision" : "/vision";
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try { if (localStorage.getItem("nodedots-theme")) return; } catch { /* Use OS preference. */ }
      const theme = media.matches ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="marketing-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href={waitlistScope ? "/waitlist" : "/"} aria-label="NodeDots home"><Mark /><span>NodeDots</span></a>
        <nav aria-label="Main navigation">
          <a className="nav-link" href="#preview">Explore the demo</a>
          <a className="nav-link" href={visionHref}>What&apos;s next</a>
          <ThemeToggle />
          <a className="nav-join" href="#signup">Get early access <span aria-hidden="true">↗︎</span></a>
        </nav>
      </header>
      <main id="main">
        <section className="launch-hero" aria-labelledby="hero-title">
          <div className="hero-orbit" aria-hidden="true"><span /><span /><span /><span /><span /></div>
          <p className="launch-eyebrow"><span className="availability-dot" /> NodeDots Code <span className="eyebrow-divider">/</span> Early access</p>
          <h1 id="hero-title">Connect the dots.<br /><span>Before you ship.</span></h1>
          <p className="launch-lead">Your pull request is only part of the story. See what it affects, what it missed, and what now conflicts across your repo.</p>
          <div className="launch-signup" id="signup"><WaitlistForm idPrefix={waitlistScope ? "waitlist" : "hero"} /></div>
          <p className="launch-scope">Starting with GitHub pull requests · TypeScript &amp; JavaScript</p>
          <a href="#preview" className="demo-jump">See a change in context <span aria-hidden="true">↓</span></a>
        </section>
        <div className="launch-demo">
          <div className="demo-intro"><p className="concept-label">The detail a diff can miss</p><p>Change authentication. Follow the connection to billing.<br /> Find the old assumption before it reaches production.</p></div>
          <InteractiveDemo title="A small change. A connected view." concept="Explore an example" />
          <ul className="launch-legend" aria-label="Five finding states">{legend.map(({ state, label }) => <li key={state}><StateDot state={state} />{label}</li>)}</ul>
          <p className="demo-caption">Select a scenario, then a component to see its evidence and next step.</p>
        </div>
        <section className="launch-next" aria-labelledby="next-title">
          <div><p className="concept-label">Code is the beginning</p><h2 id="next-title">More dots to connect.</h2><p>The same idea, beyond the repository. Explore what NodeDots could bring to applications, contracts, research, and decisions.</p></div>
          <a className="next-link" href={visionHref}>Explore what&apos;s next <span aria-hidden="true">↗︎</span></a>
        </section>
      </main>
      <footer className="site-footer"><div className="footer-identity"><a className="brand" href="#main" aria-label="NodeDots home"><Mark /><span>NodeDots</span></a><span>Connect the dots before you act.</span></div><div className="footer-links"><a href="#signup">Join the waitlist ↑</a><span>© {new Date().getFullYear()} NodeDots</span></div></footer>
    </div>
  );
}

