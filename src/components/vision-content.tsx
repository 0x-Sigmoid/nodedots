"use client";

import { useEffect } from "react";
import { Mark } from "./site-header";

// Future directions from overview.md: one relationship engine,
// specialized modes for non-code workflows. Code ships first;
// these directions stay in exploration.
const directions = [
  {
    name: "NodeDots Apply",
    state: "action",
    title: "Before you submit",
    description:
      "Check an opportunity against your documents, experience, eligibility, required materials, and deadlines.",
    example: "Applications · grants · fellowships",
  },
  {
    name: "NodeDots Contracts",
    state: "conflicting",
    title: "Before you commit",
    description:
      "Connect obligations, deliverables, notice periods, renewals, and conditions so nothing important stays hidden in the agreement.",
    example: "Payments · schedules · renewals",
  },
  {
    name: "NodeDots Research",
    state: "uncertain",
    title: "Before you conclude",
    description:
      "Trace claims back to sources, methods, datasets, and literature to reveal gaps and contradictions in a study.",
    example: "Questions · evidence · conclusions",
  },
  {
    name: "NodeDots Business",
    state: "missing",
    title: "Before you apply",
    description:
      "Map requirements, documents, forms, approvals, and ongoing obligations through complex institutional processes.",
    example: "Registration · permits · compliance",
  },
  {
    name: "NodeDots Verify",
    state: "confirmed",
    title: "Before you trust",
    description:
      "Check what a claim is actually supported by across documents, links, screenshots, messages, and reports.",
    example: "Claims · sources · context",
  },
  {
    name: "NodeDots Decisions",
    state: "action",
    title: "Before you act",
    description:
      "Make the unknowns visible: what you know, what is missing, what conflicts, and what to verify next.",
    example: "Choices · evidence · next steps",
  },
];

function VisionDot({ state }: { state: string }) {
  return <span className={`vision-dot state-${state}`} aria-hidden="true" />;
}

export function VisionContent({
  homeHref = "/",
  changeReviewHref = "/",
  signupHref = "/waitlist",
  backHref = "/",
  backLabel = "Back to waitlist",
}: {
  /** Brand + footer home. Waitlist scope passes "/waitlist" so visitors never reach marketing. */
  homeHref?: string;
  /** "Change review" nav link. Pass null to omit it (no how-it-works exposure). */
  changeReviewHref?: string | null;
  signupHref?: string;
  backHref?: string;
  backLabel?: string;
}) {
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
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
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

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header vision-header">
        <a className="brand" href={homeHref} aria-label="NodeDots home">
          <Mark />
          <span>NodeDots</span>
        </a>
        <nav aria-label="Main navigation">
          {changeReviewHref !== null && (
            <a className="explore-link" href={changeReviewHref}>
              Change review
            </a>
          )}
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
          <a className="nav-join" href={signupHref}>
            Join the waitlist <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main id="main" className="vision-page">
        <section className="vision-hero" aria-labelledby="vision-title">
          <div className="glow" aria-hidden="true" />
          <p className="product-label">
            <VisionDot state="action" /> NodeDots <span aria-hidden="true">/</span> Future directions
          </p>
          <h1 id="vision-title">
            One way of thinking.
            <br />
            Many places to use it.
          </h1>
          <p className="vision-lead">
            NodeDots starts with code. The same relationship intelligence can help connect evidence,
            requirements, and decisions before you act.
          </p>
          <div className="vision-flow" aria-label="The NodeDots way of working">
            <span>Goal</span>
            <i aria-hidden="true">→</i>
            <span>Evidence</span>
            <i aria-hidden="true">→</i>
            <span>Connections</span>
            <i aria-hidden="true">→</i>
            <span>Next step</span>
          </div>
        </section>

        <section className="directions-section" aria-labelledby="directions-title">
          <div className="section-heading">
            <h2 id="directions-title">The wider NodeDots system</h2>
            <span className="concept-label">In exploration</span>
          </div>
          <p className="directions-intro">
            Every direction uses the same core question: do all the relevant pieces actually connect?
          </p>
          <div className="directions-grid">
            {directions.map((direction) => (
              <article className="direction-card" key={direction.name}>
                <div className="direction-card-top">
                  <VisionDot state={direction.state} />
                  <span className="concept-label">{direction.name}</span>
                </div>
                <h3>{direction.title}</h3>
                <p>{direction.description}</p>
                <span className="direction-example">{direction.example}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="vision-close" aria-labelledby="close-title">
          <div>
            <p className="concept-label">Where we begin</p>
            <h2 id="close-title">Code is the first place NodeDots connects the dots.</h2>
            <p>Join the early-access list to follow NodeDots Code as it takes shape.</p>
          </div>
          <a className="button" href={signupHref}>
            Join the waitlist <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-identity">
          <a className="brand" href={homeHref} aria-label="NodeDots home">
            <Mark />
            <span>NodeDots</span>
          </a>
          <span>Connect the dots before you act.</span>
        </div>
        <div className="footer-links">
          <span>© {new Date().getFullYear()} NodeDots</span>
          <a className="text-button" href={backHref}>
            {backLabel}
          </a>
        </div>
      </footer>
    </>
  );
}
