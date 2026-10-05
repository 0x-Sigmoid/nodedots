# 16 · Testing & Evaluation Strategy

Version: 0.1 · Status: proposed release framework · Owners: Engineering and AI Quality

## Two quality tracks

Software correctness covers authorization, parsing, persistence, concurrency, and publication. Intelligence quality covers grounded accuracy, useful consequences, coverage honesty, and uncertainty. Both tracks must pass; a working API does not establish that its findings are useful.

## Software verification

- Unit tests for supported import resolution, schema parsing, rule prerequisites, path bounds, and fingerprinting.
- Integration tests for tenant-scoped reads/writes, signed webhook ingress, transactional outbox, quotas, graph constraints, and evidence retrieval.
- Concurrency tests for redelivery, duplicate enqueue, lease expiry, new commits during publication, network ambiguity, and revocation during a job.
- End-to-end tests for install → index → PR → report → feedback → update → disconnect.
- Resilience tests for GitHub/provider rate limits, provider refusal, invalid schema, partial parser failures, object expiry, queue backlog, and backup restore.
- Security tests for ID guessing, repository restrictions, prompt injection, secret leakage, XSS, path traversal, and cache separation.

Use synthetic and consented fixtures. Never execute malicious repository fixtures; inspect them through the production parser boundary.

## Intelligence evaluation dataset

Build at least 100 labeled PR cases spanning supported patterns, including at least 30 with independently confirmed meaningful gaps and 30 clean/no-action cases; remaining cases emphasize ambiguity and adversarial input. Include auth changes, environment names, mapped schema fields, renamed exports, test relationships, dynamic dispatch, generated code, large diffs, and inaccessible context.

Separate development and frozen holdout cases by repository family to limit leakage. Store base/head SHAs, known relationships, expected findings, counterexamples, accepted uncertainty, and severity rationale. Two experienced reviewers label consequential cases; adjudicate disagreement rather than forcing false certainty.

## Metrics and denominators

| Metric | Definition |
|---|---|
| Finding precision | Correct consequential findings / adjudicated emitted consequential findings |
| Scoped recall | Detected labeled supported gaps / all labeled supported gaps |
| Meaningful PR yield | Eligible PRs with ≥1 developer-confirmed meaningful finding / eligible analyzed PRs |
| Citation validity | Correct accessible locations supporting claim / checked citations |
| Dismissal rate | Dismissed findings / findings receiving disposition; report participation separately |
| Resolution before merge | Accepted findings verified resolved before merge / accepted findings with observable merge outcome |
| Cost and latency | Per-stage and end-to-end distributions by repository/diff class |

Unreviewed findings are not counted as correct. Report sample size, confidence intervals, language coverage, and repository mix. Scoped recall does not imply detecting every possible consequence.

## Proposed release gates

- 100% mandatory authorization, revocation, idempotency, and stale-publication tests pass.
- No observed cross-tenant disclosure, unredacted seeded secret, or fabricated citation.
- At least 90% consequential-finding precision on ≥100 adjudicated emitted findings; report uncertainty around the estimate.
- At least 70% scoped recall on supported labeled gaps, with per-rule breakdown.
- All invalid-source and incomplete-scope cases preserve uncertainty.
- Healthy supported warm analyses meet p95 five-minute target under declared load.

These are proposed launch criteria, not measured results. If sample counts are insufficient, extend evaluation rather than claiming the gate passed.

## Change evaluation

Parser, rule, prompt, model, retrieval, and schema upgrades run the same frozen suite plus new relevant fixtures. Reject material precision or grounding regressions; compare latency and cost. Shadow new AI versions on authorized samples before a small canary. Keep rollback-compatible versions available.

## Feedback loop

Collect dispositions and developer explanations; review high-severity disputes and recurring false positives weekly during beta. Turn reproducible errors into permission-safe fixtures. Do not train on private content or export it into public evaluation datasets without explicit authorization.
