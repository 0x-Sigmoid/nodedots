"use client";

import { useEffect } from "react";
import { InteractiveDemo } from "./change-review-demo";
import { StateDot } from "./state-dot";
import { useReveal } from "./use-reveal";
import { WaitlistForm } from "./waitlist-form";

function Mark() {
  return (
    <svg viewBox="0 0 50 16" aria-hidden="true" className="brand-mark">
      <path d="M5 8H45" stroke="currentColor" strokeWidth="1" />
      <g fill="currentColor">
        <circle cx="5" cy="8" r="3.5" />
        <circle cx="15" cy="8" r="3.5" />
        <circle cx="25" cy="8" r="3.5" />
        <circle cx="45" cy="8" r="3.5" />
      </g>
      <circle className="mark-missing" cx="35" cy="8" r="3.5" strokeWidth="2" />
    </svg>
  );
}

export function NodeDotsLanding() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("nodedots-theme", next);
    } catch {
      // storage unavailable; theme still applies for this visit
    }
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");    const onChange = () => {
      try {
        if (localStorage.getItem("nodedots-theme")) return;
      } catch {
        // fall through to OS preference
      }
      const theme = media.matches ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="NodeDots home">
          <Mark />
          <span>NodeDots</span>
        </a>
        <nav aria-label="Main navigation">
          <a className="how-link" href="#how">
            How it works
          </a>
          <a className="explore-link" href="/vision">
            What&apos;s next
          </a>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Switch between light and dark theme"
            title="Switch between light and dark theme"
            type="button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <g className="theme-sun" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7 7M17 17L19 19M5 19L7 17M17 7L19 5" />
              </g>
              <path
                className="theme-moon"
                d="M20 15A8 8 0 0 1 9 4A8 8 0 1 0 20 15Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <a className="nav-join" href="#signup">
            Join the waitlist <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero hero-dots" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="product-label">
              <StateDot state="action" /> NodeDots Code <span aria-hidden="true">/</span> Early access
            </p>
            <h1 id="hero-title">
              Connect the dots.
              <br />
              <em>Before you ship.</em>
            </h1>
            <p className="hero-description">
              NodeDots reads your pull request against the whole repo and shows what it touched, what it
              missed, and what now conflicts.
            </p>
            <div className="hero-signup" id="signup">
              <WaitlistForm idPrefix="hero" />
            </div>
          </div>
          <aside className="hero-report" aria-label="Example NodeDots impact report">
            <div className="report-bar">
              <span className="report-pr">PR #184 · Add organization permissions</span>
              <span className="report-pill">Impact report</span>
            </div>
            <div className="report-stats">
              <div className="report-stat">
                <span className="report-value">12</span>
                <span className="report-key">Changed files</span>
              </div>
              <div className="report-stat">
                <span className="report-value">17</span>
                <span className="report-key">Affected components</span>
              </div>
              <div className="report-stat state-missing">
                <span className="report-value">
                  <StateDot state="missing" />3
                </span>
                <span className="report-key">Missing</span>
              </div>
              <div className="report-stat state-conflicting">
                <span className="report-value">
                  <StateDot state="conflicting" />1
                </span>
                <span className="report-key">Conflicting</span>
              </div>
              <div className="report-stat state-missing">
                <span className="report-value">
                  <StateDot state="missing" />2
                </span>
                <span className="report-key">Untested</span>
              </div>
              <div className="report-stat state-uncertain">
                <span className="report-value">
                  <StateDot state="uncertain" />1
                </span>
                <span className="report-key">Uncertain</span>
              </div>
            </div>
            <ul className="report-findings">
              <li>
                <StateDot state="missing" />
                <p>
                  <strong>Missing backfill</strong> — organization_id added, but existing users have no
                  migration path.
                </p>
              </li>
              <li>
                <StateDot state="conflicting" />
                <p>
                  <strong>Schema / UI mismatch</strong> — RoleSelector.tsx still offers the old admin value.
                </p>
              </li>
              <li>
                <StateDot state="action" />
                <p>
                  <strong>Before merging</strong> — map Stripe customers, then add an editor-permission test.
                </p>
              </li>
            </ul>
            <p className="report-note">Illustrative report · Product in development</p>
          </aside>
        </section>

        <section className="checks-strip" aria-label="What NodeDots reads" data-reveal>
          <span className="checks-label">Reads</span>
          <ul>
            <li>Dependencies</li>
            <li>API contracts</li>
            <li>Schemas</li>
            <li>Environment</li>
            <li>Tests</li>
            <li>Docs</li>
          </ul>
        </section>

        <section className="product-flow" id="how" aria-labelledby="how-title">
          <div className="section-heading">
            <h2 id="how-title">From change to clarity.</h2>
            <span className="concept-label">01 · How NodeDots works</span>
          </div>
          <div className="flow-grid">
            <article className="flow-card" data-reveal>
              <span className="flow-number">01</span>
              <h3>Read the change</h3>
              <p>Start with a pull request, then give NodeDots the context around it.</p>
            </article>
            <article className="flow-card" data-reveal>
              <span className="flow-number">02</span>
              <h3>Map what it touches</h3>
              <p>See the connected code, tests, data, and assumptions that move with it.</p>
            </article>
            <article className="flow-card" data-reveal>
              <span className="flow-number">03</span>
              <h3>Review what matters</h3>
              <p>Understand what is confirmed, missing, conflicting, or ready for action.</p>
            </article>
          </div>
        </section>

        <InteractiveDemo />


        <section className="future-teaser" aria-labelledby="future-teaser-title" data-reveal>
          <div>
            <p className="concept-label">03 · Beyond Code</p>
            <h2 id="future-teaser-title">The same intelligence can travel further.</h2>
            <p>
              Explore the future directions behind NodeDots Code, from applications and contracts to research,
              verification, and decisions.
            </p>
          </div>
          <a className="text-button" href="/vision">
            See what&apos;s next <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-identity">
          <a className="brand" href="/" aria-label="NodeDots home">
            <Mark />
            <span>NodeDots</span>
          </a>
          <span>Connect the dots before you act.</span>
        </div>
        <div className="footer-links">
          <span>© {new Date().getFullYear()} NodeDots</span>
          <a className="text-button" href="/waitlist">
            Waitlist privacy
          </a>
        </div>
      </footer>
    </>
  );
}
