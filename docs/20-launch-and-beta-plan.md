# 20 · Launch & Beta Plan

Version: 0.1 · Status: proposed · Owner: Product

## Beta objective

Determine whether NodeDots reliably finds important relationship-level consequences that developers missed, at a review cost they accept. The beta is an experiment in usefulness and trust, not a showcase of finding volume.

## Cohort and recruitment

Recruit five to ten small teams with TypeScript/JavaScript GitHub products, active PR review, and optional coding-agent use. Include different supported project shapes rather than only handpicked ideal examples. Start with consented test/public repositories, then approved private repositories after isolation and disclosure gates pass.

Invite authorized repository decision-makers. Explain analyzed scope, provider processing, advisory behavior, retention, feedback handling, and pause/disconnect. Do not import customer source into public evaluation material without separate consent.

## Stages and exit criteria

| Stage | Work | Exit gate |
|---|---|---|
| Internal alpha | Synthetic fixtures, simulated failure, restore drill | Mandatory security/concurrency checks pass |
| Design-partner pilot | 2–3 teams, closely reviewed reports | Stable grounding and usable report UX |
| Private beta | 5–10 teams, observed real PR workflows | Sufficient quality sample and recurring use |
| Public beta | Controlled onboarding and documented limits | Published policies, support, abuse controls, capacity |
| General availability | Measured operating reliability and commercial readiness | Sustained usefulness; approved paid terms if charging |

Use stages rather than invented calendar deadlines. A four-week private-beta observation window is a planning assumption, extended when PR volume or labeling is insufficient.

## Proposed beta success criteria

- At least 100 eligible PR analyses across at least five active teams.
- At least 100 adjudicated consequential findings, extending collection if necessary.
- ≥90% consequential-finding precision and no known fabricated citations or cross-tenant disclosure.
- ≥20% of eligible analyzed PRs have at least one developer-confirmed meaningful finding.
- At least 60% of activated teams use NodeDots in three distinct weeks during the observation window.
- Supported warm p95 analysis time ≤ five minutes under healthy dependencies.
- A workable per-analysis cost ceiling and no unresolved critical privacy/security issue.

These targets are proposals, not results. Report confidence intervals and cohort composition. A target missed because of narrow supported coverage informs scope decisions; do not conceal unsupported analyses from funnel reporting.

## Feedback process

Ask reviewers whether a finding was correct, useful, new to them, resolved, or intentional. Capture disposition in the report; use optional interviews to understand misses and workflow friction. Review disputed/high-severity findings within two business days during the pilot. Weekly triage assigns each issue to parser, rule, inference, UX, coverage, or integration.

## Launch checklist

Complete PRD acceptance, frozen evaluation, secret redaction, tenant isolation, deletion/revocation tests, provider disclosure, GitHub App configuration, operational alerts, backup restore, and support ownership. Developer docs match actual features. Replace legal placeholders and obtain applicable review. Product pages avoid guarantees of safe code or complete coverage.

## Stop and expansion rules

Pause private onboarding for any suspected disclosure, repeated invalid evidence, or inability to honor deletion. Disable a noisy rule rather than generating more low-confidence findings. Broaden language/framework scope only after the initial supported cohort finds repeat value. Pricing research and CLI discovery may run after usefulness is established; non-code modes remain deferred.
