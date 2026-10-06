"use client";

import { useEffect, useState } from "react";
import type { Finding, ImpactReport } from "@/engine/types";
import {
  COMPLETENESS_LABEL,
  DISPOSITIONS,
  STATE_LABEL,
  formatEvidence,
  stateClass,
  type Disposition,
} from "@/reports/demo";
import { StateDot } from "./state-dot";
import { Mark, SiteHeader } from "./site-header";

function FindingCard({
  finding,
  disposition,
  onDisposition,
}: {
  finding: Finding;
  disposition: Disposition | null;
  onDisposition: (value: Disposition | null) => void;
}) {
  const dot = stateClass(finding.state);
  return (
    <article className={`finding-card state-${dot}`}>
      <div className="finding-card-top">
        <span className={`finding-state state-${dot}`}>
          <StateDot state={dot} />
          {STATE_LABEL[finding.state]}
        </span>
        <span className="finding-meta">
          {finding.severity} severity · {finding.confidence.band} confidence · {finding.ruleId}
        </span>
      </div>
      <h3>{finding.title}</h3>
      <p className="finding-explanation">{finding.explanation}</p>
      <p className="finding-confidence">Why this confidence: {finding.confidence.explanation}</p>
      <div className="evidence">
        <span className="detail-label">Evidence</span>
        <ul className="evidence-list">
          {finding.evidence.map((entry, index) => (
            <li key={`${entry.path}:${entry.startLine}:${index}`}>
              <code>{formatEvidence(entry)}</code>
              <p>{entry.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="finding-action">
        <span className="detail-label">Suggested next step</span>
        <p>{finding.nextStep}</p>
      </div>
      <div className="feedback-row" role="group" aria-label={`Your review of: ${finding.title}`}>
        <span className="detail-label">Your review</span>
        <div className="feedback-buttons">
          {DISPOSITIONS.map((option) => {
            const selected = disposition === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`feedback-button${selected ? " selected" : ""}`}
                aria-pressed={selected}
                onClick={() => onDisposition(selected ? null : option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function FindingSection({
  id,
  title,
  concept,
  findings,
  empty,
  feedback,
  onDisposition,
}: {
  id: string;
  title: string;
  concept: string;
  findings: Finding[];
  empty: string;
  feedback: Record<string, Disposition>;
  onDisposition: (fingerprint: string, value: Disposition | null) => void;
}) {
  return (
    <section className="report-section" aria-labelledby={id}>
      <div className="section-heading">
        <h2 id={id}>
          {title} <span className="section-count">{findings.length}</span>
        </h2>
        <span className="concept-label">{concept}</span>
      </div>
      {findings.length === 0 ? (
        <p className="empty-note">{empty}</p>
      ) : (
        <div className="finding-list">
          {findings.map((finding) => (
            <FindingCard
              key={finding.fingerprint}
              finding={finding}
              disposition={feedback[finding.fingerprint] ?? null}
              onDisposition={(value) => onDisposition(finding.fingerprint, value)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function ReportViewer({
  scenarioId,
  title,
  change,
  description,
  report,
}: {
  scenarioId: string;
  title: string;
  change: string;
  description: string;
  report: ImpactReport;
}) {
  const [feedback, setFeedback] = useState<Record<string, Disposition>>({});
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFeedback({});
    setSyncError(false);
    fetch(`/api/reports/${encodeURIComponent(scenarioId)}/feedback`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("load"))))
      .then((body: { feedback?: Record<string, Disposition> }) => {
        if (!cancelled && body.feedback) setFeedback(body.feedback);
      })
      .catch(() => {
        if (!cancelled) setSyncError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  async function handleDisposition(fingerprint: string, value: Disposition | null) {
    const previous = feedback[fingerprint];
    setFeedback((current) => {
      if (value === null) {
        const next = { ...current };
        delete next[fingerprint];
        return next;
      }
      return { ...current, [fingerprint]: value };
    });
    setSyncError(false);
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(scenarioId)}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, disposition: value }),
      });
      if (!response.ok) throw new Error("save");
      const body = (await response.json()) as { feedback?: Record<string, Disposition> };
      if (body.feedback) setFeedback(body.feedback);
    } catch {
      setFeedback((current) => {
        if (previous === undefined) {
          const next = { ...current };
          delete next[fingerprint];
          return next;
        }
        return { ...current, [fingerprint]: previous };
      });
      setSyncError(true);
    }
  }

  const reviewed = Object.keys(feedback).length;
  const total =
    report.missing.length +
    report.conflicting.length +
    report.uncertain.length +
    report.untested.length +
    report.actionRequired.length;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader links={[{ href: "/reports", label: "All reports" }]} />

      <main id="main" className="report-page">
        <section className="report-hero" aria-labelledby="report-title">
          <a className="report-back" href="/reports">
            ← All example reports
          </a>
          <p className="product-label">
            <StateDot state="action" /> NodeDots Code <span aria-hidden="true">/</span> Impact report
          </p>
          <h1 id="report-title">{title}</h1>
          <p className="report-change">{change}</p>
          <p className="report-description">{description}</p>
          <dl className="report-meta">
            <div>
              <dt>Completeness</dt>
              <dd>{COMPLETENESS_LABEL[report.coverage.completeness]}</dd>
            </div>
            <div>
              <dt>Changed</dt>
              <dd>{report.changed.length} files</dd>
            </div>
            <div>
              <dt>Affected</dt>
              <dd>{report.affected.length} components</dd>
            </div>
            <div>
              <dt>Findings</dt>
              <dd>{total} published</dd>
            </div>
            <div>
              <dt>Reviewed</dt>
              <dd>{reviewed} of {total}</dd>
            </div>
          </dl>
          <p className="report-note">Deterministic engine output · Illustrative repository · Product in development</p>
          {syncError && (
            <p className="form-message error" role="status">
              Reviews couldn&apos;t sync just now — please try again in a moment.
            </p>
          )}
        </section>

        <section className="report-section" aria-labelledby="changed-title">
          <div className="section-heading">
            <h2 id="changed-title">
              Changed <span className="section-count">{report.changed.length}</span>
            </h2>
            <span className="concept-label">What the change touched directly</span>
          </div>
          <ul className="entity-list">
            {report.changed.map((item) => (
              <li key={item.path}>
                <code>{item.path}</code>
                <span>
                  {item.change}
                  {item.symbols.length > 0 ? ` · ${item.symbols.join(", ")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="report-section" aria-labelledby="affected-title">
          <div className="section-heading">
            <h2 id="affected-title">
              Affected <span className="section-count">{report.affected.length}</span>
            </h2>
            <span className="concept-label">What moves with the change</span>
          </div>
          {report.affected.length === 0 ? (
            <p className="empty-note">No affected consumers or contracts were detected.</p>
          ) : (
            <ul className="entity-list">
              {report.affected.map((item) => (
                <li key={item.path}>
                  <code>{item.path}</code>
                  <span>{item.via.join(" → ")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <FindingSection
          id="missing-title"
          title="Missing"
          concept="Expected pieces that are absent"
          findings={report.missing}
          empty="Nothing expected is missing — every checked piece was detected."
          feedback={feedback}
          onDisposition={handleDisposition}
        />
        <FindingSection
          id="conflicting-title"
          title="Conflicting"
          concept="Contracts that disagree"
          findings={report.conflicting}
          empty="No conflicting contracts were detected."
          feedback={feedback}
          onDisposition={handleDisposition}
        />
        <FindingSection
          id="uncertain-title"
          title="Uncertain"
          concept="Bounded hypotheses to verify, not verdicts"
          findings={report.uncertain}
          empty="No uncertain consequences were hypothesized for this change."
          feedback={feedback}
          onDisposition={handleDisposition}
        />
        <FindingSection
          id="untested-title"
          title="Untested"
          concept="Changed behavior without a related test"
          findings={report.untested}
          empty="Every changed file has a related test."
          feedback={feedback}
          onDisposition={handleDisposition}
        />
        <FindingSection
          id="action-title"
          title="Action required"
          concept="Policy requires a next step"
          findings={report.actionRequired}
          empty="No policy-mandated actions apply to this change."
          feedback={feedback}
          onDisposition={handleDisposition}
        />

        <section className="report-section" aria-labelledby="unknown-title">
          <div className="section-heading">
            <h2 id="unknown-title">
              Unknown <span className="section-count">{report.unknown.length}</span>
            </h2>
            <span className="concept-label">What the analysis could not establish</span>
          </div>
          {report.unknown.length === 0 ? (
            <p className="empty-note">No unresolved areas. This never means the change is proven safe.</p>
          ) : (
            <ul className="unknown-list">
              {report.unknown.map((item, index) => (
                <li key={`${item.category}:${index}`}>
                  <strong>{item.category}</strong>
                  <p>{item.detail}</p>
                  <span>{item.paths.join(", ")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="report-section" aria-labelledby="checklist-title">
          <div className="section-heading">
            <h2 id="checklist-title">
              Before merging <span className="section-count">{report.checklist.length}</span>
            </h2>
            <span className="concept-label">Evidence-linked review checklist</span>
          </div>
          <ol className="checklist">
            {report.checklist.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="report-section" aria-labelledby="coverage-title">
          <div className="section-heading">
            <h2 id="coverage-title">Coverage</h2>
            <span className="concept-label">{COMPLETENESS_LABEL[report.coverage.completeness]}</span>
          </div>
          <dl className="coverage-grid">
            <div>
              <dt>Files analyzed</dt>
              <dd>{report.coverage.analyzedFiles}</dd>
            </div>
            <div>
              <dt>Changed analyzed</dt>
              <dd>{report.coverage.changedFilesAnalyzed}</dd>
            </div>
            <div>
              <dt>Candidates / published</dt>
              <dd>
                {report.coverage.totalCandidates} / {report.coverage.publishedFindings}
              </dd>
            </div>
            <div>
              <dt>Traversal truncated</dt>
              <dd>{report.coverage.traversalTruncated ? "Yes" : "No"}</dd>
            </div>
          </dl>
          {report.coverage.notes.map((note) => (
            <p className="coverage-note" key={note}>
              {note}
            </p>
          ))}
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
          <a className="text-button" href="/reports">
            All reports
          </a>
        </div>
      </footer>
    </>
  );
}
