# 18 · Observability & Analytics Plan

Version: 0.1 · Status: proposed · Owners: Platform and Product

## Purpose

Explain why a report is delayed, incomplete, expensive, inaccurate, or unused without leaking customer source. Operational telemetry and product analytics have separate stores, access policies, and purposes.

## Correlation and logging

Propagate request ID, delivery ID, job ID, analysis ID, tenant-scoped repository ID, stage, pipeline version, and provider request ID. Structured logs capture transition, duration, error code, attempt, queue age, and counts. Exclude raw source, credentials, PR bodies, user email, model prompts, and response text from normal logs.

Repository names and filenames can be sensitive; use opaque IDs in telemetry. Restricted debugging captures require explicit access, redaction, short expiry, and an audit trail. Traces cover ingress → outbox → queue → extraction → graph → rules → AI → validation → publication.

## Operational metrics

| Area | Metrics |
|---|---|
| Ingress | Valid/invalid signatures, durable receipt latency, duplicate delivery rate |
| Queue | Oldest job age, depth, retries, dead-letter count, tenant fairness |
| Ingestion | Files/bytes included, exclusions, API rate limits, snapshot failures |
| Graph | Resolved/unresolved references, parser coverage, traversal truncation |
| Intelligence | Candidates, validated findings, rule errors, invalid citations, rejected certainty |
| AI | Model/prompt version, input/output tokens, latency, refusal, schema error, cost |
| Publication | Lag, retries, stale-head prevention, check reconciliation failures |
| Privacy | Deletion lag, expired-object count, denied access, seeded-secret detections |

## Initial alert thresholds

- Page on suspected cross-tenant access or published secret, any fabricated-citation regression, or revocation bypass.
- Page when report-read errors exceed 5% for ten minutes with meaningful request volume.
- Warn at queue age over five minutes for ten minutes; page at 15 minutes while jobs continue arriving.
- Warn when provider failure exceeds 10% over 15 minutes with at least 20 calls.
- Alert on cost reaching 80% of daily ceiling; block new enrichment at 100% while preserving deterministic handling.
- Alert on live deletion exceeding seven days or backup expiry exceeding 35 days.

Thresholds are initial operating choices. Tune against measured beta traffic; low-volume ratios require absolute-count safeguards. Every alert links to a runbook and names an owner.

## Product events

`organization_created`, `installation_verified`, `repository_enabled`, `index_completed`, `analysis_requested`, `report_published`, `report_opened`, `finding_opened`, `feedback_submitted`, `analysis_retried`, and `repository_disconnected`.

Properties: pseudonymous organization/user IDs, analysis ID, pipeline version, state/severity categories, completeness, duration bucket, and interaction source. No source excerpts or free-text feedback enter analytics. Identify duplicate events with stable IDs. Anonymous/public analytics choices must be reflected in the final privacy policy.

## Dashboards and decisions

Operations dashboard: queue, dependencies, read availability, failures, deletion, cost. Quality dashboard: adjudicated precision/recall, citation errors, disputes by rule/version, coverage. Product dashboard: activation funnel, meaningful finding yield, review participation, repeat repository use, weekly active teams. Finance dashboard: actual cost per eligible completed analysis and per retained tenant.

Report denominator and sample size beside every quality metric. A report view is engagement, not correctness. A dismissal is not automatically a false positive; collect reviewer reason and adjudicate.

## Retention and access

Content-free logs expire after 30 days; security audit metadata after 180 days under the proposed policy. Product aggregates must be appropriately de-identified and governed by disclosed purpose. Audit telemetry access. See [security](14-security-and-privacy-specification.md) and [beta metrics](20-launch-and-beta-plan.md).
