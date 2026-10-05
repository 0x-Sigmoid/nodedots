import type { Metadata } from "next";
import { Mark, SiteHeader } from "@/components/site-header";
import { DEMO_SCENARIOS, getDemoReport } from "@/reports/demo";

export const metadata: Metadata = {
  title: "Example impact reports",
  description: "Deterministic NodeDots Code impact reports over illustrative repositories.",
  alternates: { canonical: "/reports" },
  robots: { index: false, follow: false },
};

export default function ReportsIndex() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader links={[{ href: "/", label: "Waitlist" }]} />
      <main id="main" className="reports-index">
        <p className="concept-label">NodeDots Code · Deterministic engine output</p>
        <h1>Example impact reports</h1>
        <p className="reports-lead">
          Each report is produced by the deterministic analysis engine over an illustrative repository —
          no backend, no guessing. Open one to read the findings, evidence, and checklist.
        </p>
        <ul className="reports-list">
          {DEMO_SCENARIOS.map((scenario) => {
            const report = getDemoReport(scenario.id);
            const total =
              (report?.missing.length ?? 0) +
              (report?.conflicting.length ?? 0) +
              (report?.untested.length ?? 0) +
              (report?.actionRequired.length ?? 0);
            return (
              <li key={scenario.id}>
                <a href={`/reports/${scenario.id}`}>
                  <span className="concept-label">{scenario.change}</span>
                  <h2>{scenario.title}</h2>
                  <p>{scenario.description}</p>
                  <span className="reports-count">
                    {total} {total === 1 ? "finding" : "findings"} · {report?.coverage.completeness ?? "unknown"}{" "}
                    <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
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
          <a className="text-button" href="/">
            Back to waitlist
          </a>
        </div>
      </footer>
    </>
  );
}
