# 05 · User Experience & Interaction Specification

Version: 0.1 · Status: proposed · Owner: Design

## Experience principles

Lead with what a reviewer should examine and why. Evidence is one interaction away. State, severity, confidence, and completeness have separate labels. The interface must distinguish zero detected findings from a verified safe change. Nodes and paths explain relationships rather than decorate the screen.

## Onboarding journey

1. Sign in and create or join an organization.
2. Explain repository access, external AI processing, retention, and supported scope.
3. Owner installs the GitHub App and chooses repositories on GitHub.
4. NodeDots verifies the installation and shows eligible repositories.
5. Owner enables a repository; indexing starts with stage and file-count indicators.
6. Readiness view shows full/partial coverage, exclusions, and next action: open a ready PR or analyze an existing one.

Installation cancellation returns to setup with progress preserved. A callback verification failure displays a recoverable error and no repository content. A user lacking installation authority receives a clear owner-required state.

## Analysis experience

Repository overview lists PR number/title, head SHA, state, actionable finding count, coverage, and timestamp. States are queued, indexing, analyzing, publishing, completed, partial, failed, cancelled, superseded. Stage labels and elapsed time are preferable to an invented percentage or ETA.

New commits label an open report “Older commit” and offer the latest report link. Users can inspect an older snapshot while retaining the warning. Retrying shows why work is being retried and whether a prior report remains available.

## Impact Report layout

The header shows repository, PR, base/head SHAs, report version, completeness, and GitHub link. The summary includes changed/affected counts and top consequences. Sections follow: Changed, Affected, Missing, Conflicting, Untested, Unknown, Before Merging.

Default ordering is consequence severity, evidence strength, and relevance; never model verbosity. Confirmed observations support the report without crowding the actionable list. Count unique findings so an Untested facet does not double-count a Missing finding.

## Finding details

Each card contains title, primary state, severity, confidence band, origin, explanation, relationship path, source citations, checked-scope limits, and recommended next step. Opening a citation points to immutable repository content at the correct base or head SHA. Removed code points to base; new code points to head.

Reviewers may choose accepted, dismissed, fixed, or intentional. A dismissal reason is encouraged; an intentional exception requires a reason and remains scoped to this finding/snapshot unless an owner separately creates policy. “Fixed” is a reviewer assertion until re-analysis confirms resolution.

## Failure and empty states

- No findings: “No actionable findings detected in the analyzed scope,” followed by coverage and unknowns.
- Provider unavailable: show deterministic findings and incomplete enrichment if publishable; otherwise show failure with retry.
- Limit exceeded: explain excluded scope and supported alternatives.
- Access revoked: hide content and explain reconnection authority.
- Evidence unavailable: mark stale or unverified and remove unsupported claims from the actionable checklist.

## Accessibility and interaction quality

All actions are keyboard-operable with visible focus. States use text and icons alongside color. Source excerpts wrap safely, have copy controls, and never execute HTML. Loading and error changes are announced to assistive technology without reading an entire report repeatedly. Mobile supports reading and feedback; graph paths have a textual equivalent.

See [screen map](06-information-architecture-and-screen-map.md) and [stories](03-user-stories-and-acceptance-criteria.md).
