# 02 · NodeDots V1 Product Requirements Document

Version: 0.1 · Status: proposed authoritative V1 baseline · Owner: Product

## Outcome

Given a GitHub PR and repository context, NodeDots produces an evidence-linked Impact Report that explains changed entities, related consequences, likely gaps, contract conflicts, test gaps, and unresolved uncertainty. Users inspect findings and record a disposition before merging.

## Personas and primary journey

An organization owner installs the GitHub App and selects repositories. A maintainer enables indexing. A developer opens or updates a PR. NodeDots captures immutable base/head snapshots, analyzes supported relationships, publishes a check with a report link, and lets reviewers inspect evidence and submit feedback. New commits create a new analysis and mark prior reports superseded.

## Functional requirements

| ID | Requirement | Release condition |
|---|---|---|
| R01 | Sign-in, organization membership, owner/member roles | Every read and mutation is tenant-authorized |
| R02 | GitHub installation binding and selected repository synchronization | Verify installation access server-side; never trust callback IDs alone |
| R03 | Index supported files into a versioned relationship graph | Record parser coverage, exclusions, failures, and commit SHA |
| R04 | Ingest PR open, ready, reopen, and synchronize events | Durable, deduplicated jobs capture base/head SHAs |
| R05 | Compute direct and bounded indirect impact | Every affected entity has a traversable evidence path |
| R06 | Detect environment-documentation, API/schema, and test relationship gaps | Each rule declares prerequisites and checked scope |
| R07 | Produce Changed, Affected, Missing, Conflicting, Untested, Unknown sections | Empty sections explain coverage rather than imply safety |
| R08 | Show finding, consequence, evidence, relationship, confidence, next step | Invalid or inaccessible citations cannot be published as proven findings |
| R09 | Publish/update one NodeDots check per analysis | Old-head work cannot overwrite the current PR report |
| R10 | Record accepted, dismissed, fixed, and intentional feedback | Feedback records actor, time, optional reason, and finding fingerprint |
| R11 | Support retry and repository pause/disconnect | Retrying is idempotent; revocation stops access and jobs |
| R12 | Expose failures, partial coverage, and provider degradation | A failed stage never becomes a clean bill of health |

## Supported input and output

V1 analyzes TypeScript/JavaScript imports and statically resolvable references; selected Next.js route conventions; Prisma models; environment-variable references and `.env.example` names; Jest/Vitest-style tests and explicit test imports. Dynamic dispatch, external service state, arbitrary frameworks, and production databases may be unknown. Coverage must be visible for every report.

PR title/body may supply intent, but are untrusted evidence. Missing intent does not prevent change analysis. Intent-to-implementation verification beyond bounded observations is a later capability.

## Nonfunctional requirements

- Supported warm analyses target p95 ≤ five minutes; first indexing is measured separately.
- The webhook ingress acknowledges only after durable receipt; expensive processing runs asynchronously.
- Duplicate deliveries and worker retries cannot duplicate publications or usage charges.
- No customer code execution, dependency installation, arbitrary outbound fetch, or cross-tenant retrieval.
- Each report is reproducible from snapshot, parser, rule, prompt, schema, and model versions, subject to provider nondeterminism.
- Keyboard access, readable state labels, and non-color indicators are required.

## Completion and release gates

All R01–R12 acceptance scenarios must pass. Security isolation and evidence validation tests are mandatory. Quality gates use the [evaluation strategy](16-testing-and-evaluation-strategy.md); launch gates use the [beta plan](20-launch-and-beta-plan.md). A supported report can complete with zero findings, but must still disclose examined scope and unknowns.

## Explicit exclusions and decisions

No CLI release, autonomous fixes, mandatory merge gate, billing collection, cross-repository graph, general architecture explorer, or non-code modes in V1. Limits and proposed stack are defined in [scope](04-mvp-scope-and-feature-specification.md) and [architecture](07-system-architecture.md). Changes to scope require a versioned decision, implementation impact, and revised acceptance criteria.
