# 22 · Developer Documentation

Version: 0.1 · Status: prelaunch user-guide draft · Owner: Developer Experience

This guide describes the intended V1 experience. No live app URL, released CLI, or public API credential flow is established by these documents. Update screenshots and links against the implemented service before publication.

## What NodeDots Code does

NodeDots analyzes a GitHub PR against supported repository relationships. It explains Changed, Affected, Missing, Conflicting, Untested, and Unknown areas and creates a before-merging checklist. Findings cite source evidence and state whether a conclusion came from extraction, a deterministic rule, or AI inference.

NodeDots is advisory. No detected finding does not establish that a change is safe. Continue using tests, type checks, security tooling, and human review.

## Install and enable

1. Sign in to NodeDots and create or choose your organization.
2. An authorized owner installs the NodeDots GitHub App through the product's verified installation link.
3. Select the repositories you want analyzed in GitHub.
4. Return to NodeDots, confirm the installation, and enable an eligible repository.
5. Wait for indexing and inspect coverage, exclusions, and supported extractors.
6. Open a ready PR or request analysis of an existing PR.

Draft PRs wait for ready-for-review by default. New commits produce new snapshot analyses. Installation changes may require an owner; signing in alone does not grant repository access.

## Supported scope

Initial support targets TS/JS static references, selected Next.js routes, Prisma schemas, literal environment references, example environment names, and common test conventions. Dynamic behavior, unsupported languages, inaccessible forks, submodules, generated code, and production state can remain unknown.

Proposed beta limits are 10,000 eligible files, 100 MB eligible source, 1 MB per file, and 500 changed files. The report states which limits or exclusions applied. Actual implemented limits must be confirmed before publishing this guide.

## Read a report

- **Changed:** entities explicitly modified by the PR.
- **Affected:** related entities with inspectable dependency paths.
- **Missing:** an expected item absent from adequately checked scope.
- **Conflicting:** grounded contracts or assumptions disagree.
- **Untested:** no relevant supported test relationship detected; this is not behavioral coverage certification.
- **Unknown:** incomplete evidence or unsupported relationships require verification.

Open a finding to see consequence, sources, path, confidence, scope, and suggested action. Source links are commit-pinned. Check the head SHA before acting; older reports are labeled superseded. An expired excerpt may still have a source link if you retain GitHub access.

## Feedback and re-analysis

Mark findings accepted, dismissed, fixed, or intentional. Provide a reason for dismissal or intentional behavior. A “fixed” label records your assessment; fresh analysis verifies whether the rule is satisfied. Update the PR to trigger a new analysis. Use retry for a failed processing stage; infrastructure retries do not consume an additional analysis unit.

## Configuration and troubleshooting

V1 configuration lives in organization/repository settings: enabled status, supported exclusion patterns, example-environment path, and approved exceptions. A repository configuration file is not promised in V1.

If no check appears, verify installation repository selection, readiness, draft status, quota, and webhook/job status. If indexing is partial, inspect exclusions and limits. If a report looks stale, compare head SHAs. If provider processing fails, deterministic results may appear with a partial label. Share report ID and error code with support; do not send secrets or private source through an unapproved channel.

## Privacy and disconnect

NodeDots needs read access to selected repository content and PRs plus check publication permission. It does not execute repository code. Relevant redacted excerpts may be processed by an approved AI provider under the published policy. Owners can pause analysis, disconnect repositories, and request deletion.

## Future CLI and API

`npx nodedots check` is a future product concept, not an available installation instruction. V1 application APIs are first-party; no external API token is promised. Publish CLI/CI instructions only after versioned releases, authentication, privacy, and compatibility testing exist.
