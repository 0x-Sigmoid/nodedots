# NodeDots documentation

Version: 0.1 · Prepared: 4 October 2026 · Status: proposed development baseline

This package turns the supplied product overview and strategy into 24 connected documents for NodeDots Code. It describes intended product behavior, not an implemented or audited service. The original [overview](../overview.md) and [strategy](../product_strategy.md) remain the source vision.

## Document index

Repository licensing is defined in [licensing policy](licensing.md),
[LICENSE](../LICENSE), and [NOTICE](../NOTICE). It is separate from the hosted
service's privacy and commercial terms.

For implementation details and local integration setup, see the
[development guide](development.md).

Account setup and the manual GitHub review beta are documented in the
[onboarding setup guide](onboarding-setup.md).

| # | Document | Priority |
|---|---|---|
| 1 | [Product Vision & Strategy](01-product-vision-and-strategy.md) | Critical |
| 2 | [Product Requirements Document](02-product-requirements-document.md) | Critical |
| 3 | [User Stories & Acceptance Criteria](03-user-stories-and-acceptance-criteria.md) | Critical |
| 4 | [MVP Scope & Feature Specification](04-mvp-scope-and-feature-specification.md) | Critical |
| 5 | [User Experience & Interaction Specification](05-user-experience-and-interaction-specification.md) | Critical |
| 6 | [Information Architecture & Screen Map](06-information-architecture-and-screen-map.md) | High |
| 7 | [System Architecture](07-system-architecture.md) | Critical |
| 8 | [Intelligence Engine Specification](08-intelligence-engine-specification.md) | Critical |
| 9 | [Code Intelligence & Relationship Graph](09-code-intelligence-and-relationship-graph.md) | Critical |
| 10 | [AI/LLM Architecture](10-ai-llm-architecture.md) | Critical |
| 11 | [Data Model & Database Schema](11-data-model-and-database-schema.md) | Critical |
| 12 | [API Specification](12-api-specification.md) | High |
| 13 | [GitHub Integration](13-github-integration.md) | Critical |
| 14 | [Security & Privacy Specification](14-security-and-privacy-specification.md) | Critical |
| 15 | [AI Safety, Confidence & Evidence Policy](15-ai-safety-confidence-and-evidence-policy.md) | Critical |
| 16 | [Testing & Evaluation Strategy](16-testing-and-evaluation-strategy.md) | Critical |
| 17 | [DevOps & Deployment](17-devops-and-deployment.md) | High |
| 18 | [Observability & Analytics](18-observability-and-analytics.md) | High |
| 19 | [Pricing & Entitlements](19-pricing-and-entitlements.md) | Later |
| 20 | [Launch & Beta Plan](20-launch-and-beta-plan.md) | High |
| 21 | [Product Roadmap](21-product-roadmap.md) | High |
| 22 | [Developer Documentation](22-developer-documentation.md) | Before launch |
| 23 | [Operational Runbook](23-operational-runbook.md) | Before production |
| 24 | [Privacy Policy, Terms & AI Disclosure](24-privacy-policy-terms-and-ai-disclosure.md) | Before public launch |

## Authority and vocabulary

The PRD owns V1 requirements. Scope owns feature boundaries. The graph specification owns extracted relationships. The intelligence specification owns their interpretation. Security and evidence policies constrain every implementation. Resolve contradictions by recording a decision and updating affected documents together; do not silently choose a convenient contract.

The five finding states are `CONFIRMED`, `MISSING`, `CONFLICTING`, `UNCERTAIN`, and `ACTION_REQUIRED`. `CHANGED`, `AFFECTED`, and `UNTESTED` are report categories or facets, not additional finding states. Severity, confidence, analysis completeness, and human disposition are separate fields.

## Proposed defaults requiring validation

- V1 supports TypeScript/JavaScript repositories, selected Next.js route conventions, Prisma schemas, environment references, and common JavaScript test conventions.
- Proposed stack: TypeScript web/API services, isolated analysis workers, PostgreSQL relational graph, object storage, and a durable queue. Hosting provider and exact libraries are undecided.
- Beta limits: 10,000 eligible text files, 100 MB eligible source per snapshot, 500 changed files per analysis; unsupported or truncated scope is always visible.
- Healthy supported analyses target p95 completion within five minutes after baseline indexing. This is a target to measure, not a service guarantee.
- Proposed default retention: raw source cache seven days; reports and graph snapshots 90 days; content-free operational logs 30 days; security audit records 180 days; backups expire within 35 days.
- Legal text is a publication draft. Operator identity, jurisdiction, provider contracts, contact channels, and actual operational controls require completion before publication.

## Build order

Read 1–4 first; then 8–11 and 13–16; then UX, API, deployment, and operations. Build ingestion and deterministic checks before AI enrichment. Establish evidence validation and tenant isolation before processing private repositories. Pricing and expansion follow beta learning.
