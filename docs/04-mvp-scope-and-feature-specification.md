# 04 · MVP Scope & Feature Specification

Version: 0.1 · Status: proposed · Owner: Product

## V1 feature boundary

NodeDots Code V1 is a GitHub App plus web report viewer for PR relationship intelligence. It supports GitHub-hosted selected repositories, organization membership, baseline indexing, incremental PR analysis, evidence-linked reports, advisory checks, feedback, and administrative pause/disconnect.

## Feature contract

| Feature | V1 behavior | Deferred behavior |
|---|---|---|
| Repository ingestion | Commit-pinned eligible text files | Arbitrary SCM, local filesystem, cross-repo ingestion |
| Language analysis | TS/JS imports and bounded static references | Complete runtime call graph; every language |
| API/data checks | Selected Next.js route patterns and Prisma contracts | Universal framework or live database inspection |
| Configuration | Literal environment references and example-name inventory | Production secret discovery or validation |
| Tests | Explicit imports, naming proximity as weaker evidence | Behavioral coverage certification or executing tests |
| AI enrichment | Evidence-bounded candidate gaps and explanations | Autonomous remediation or unrestricted agents |
| Publication | One advisory GitHub check and linked web report | Required merge enforcement or automatic merge |
| Feedback | Accepted/dismissed/fixed/intentional | Automated policy learning without review |

## Proposed beta limits

- Up to 10,000 eligible text files and 100 MB of eligible source per snapshot.
- Up to 500 changed files per PR analysis.
- Up to 1 MB per eligible file; skip binary, archive, dependency, generated, and lockfile content except specialized metadata extraction.
- Impact traversal depth three, at most 1,000 visited entities; show truncated paths and counts.
- Publish at most 20 prioritized actionable findings, retaining candidate counts and coverage notes. Do not hide an otherwise valid high-severity finding silently; show that additional findings exist.

Limits are initial engineering assumptions. Exceeding a limit yields a partial analysis or an explicit unsupported status before charge reservation, according to whether meaningful supported scope can be analyzed. Never trim silently to make a report look complete.

## Missing-dot rule families

1. Newly referenced environment names absent from the checked example configuration.
2. Resolved API accesses inconsistent with the parsed schema, after checking explicit mappings.
3. Changed supported symbols without detected related tests.
4. Removed or renamed exports with unresolved importers when static resolution is conclusive.

Migration/backfill, authorization, billing, and session consequences may appear as bounded AI hypotheses with evidence and uncertainty. Comprehensive migration or security verification is deferred.

## Report essentials

Changed and Affected inventories; Missing, Conflicting, Untested, and Unknown sections; before-merging checklist; snapshot and coverage metadata; distinction between deterministic facts and inferred relationships; feedback controls. Graph paths are displayed inline. A full interactive architecture map is not required for MVP.

## Scope governance

No code generation, IDE, CLI release, business compliance workflows, production write access, source execution, paid subscription collection, or universal decision assistant. An addition enters V1 only if it directly improves a PRD outcome without weakening evidence or isolation. Record rationale, acceptance changes, and operational cost.

See [PRD](02-product-requirements-document.md), [graph](09-code-intelligence-and-relationship-graph.md), and [roadmap](21-product-roadmap.md).
