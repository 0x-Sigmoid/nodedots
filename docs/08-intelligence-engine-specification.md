# 08 · NodeDots Intelligence Engine Specification

Version: 0.1 · Status: proposed · Owner: Intelligence Engineering

## Input and output contract

Input: user/PR intent if available, immutable base/head graph snapshots, diff entities, coverage inventory, repository policy, and versioned rule/AI configuration. Output: changed and affected inventories, evaluated findings, uncertainty records, and evidence-linked next steps.

The engine evaluates relationships in the context of a change. The graph establishes what connects; this engine establishes what the connection means. An AI suggestion is a candidate until evidence validation succeeds.

## State semantics

| Primary state | Required basis | Example |
|---|---|---|
| `CONFIRMED` | Positive evidence supports a scoped proposition | Referenced variable is documented in the checked example |
| `MISSING` | Expected item plus adequately searched scope and absence | New variable absent from fully parsed example inventory |
| `CONFLICTING` | Two grounded contracts cannot both hold in resolved context | API field disagrees with resolved model and no mapping exists |
| `UNCERTAIN` | Missing coverage or unresolved relationship prevents conclusion | Dynamic call target cannot be resolved |
| `ACTION_REQUIRED` | Explicit obligation or policy directly requires a next step | Owner policy requires manual review of an auth boundary change |

Each finding has one primary state. Missing and conflicting findings may contain recommended actions without being relabeled Action Required. `CHANGED` and `AFFECTED` describe entities; `UNTESTED` is a finding facet. Analysis completeness, confidence, severity, and disposition are independent.

## Evaluation pipeline

1. Validate snapshots, tenant scope, and coverage manifest.
2. Map diff ranges to added/modified/removed entities; retain base evidence for removals.
3. Traverse relevant graph paths with direction-aware edge rules and bounded depth.
4. Evaluate deterministic rules only where prerequisites are satisfied.
5. Retrieve bounded context for AI candidate inference; preserve counterevidence.
6. Validate claims, citations, checked scope, and inference labeling.
7. Deduplicate by rule family, affected logical entity, and requirement/contract fingerprint.
8. Rank by severity, evidence strength, relevance, and actionability.
9. Publish the report and a checklist derived from validated findings.

## Rule contract

Every rule declares ID/version, supported patterns, expected relationship, prerequisites, scope-completeness requirement, evidence template, false-positive exclusions, severity logic, and suggested action. Return one of satisfied, violated, unknown, or not-applicable before mapping to a finding state.

Example `ENV_EXAMPLE_001`: when a changed source introduces a literal environment name, compare the head inventory with the configured example path. A fully read inventory with no match produces Missing. An unreadable example produces Uncertain. An explicitly configured external-secret exception produces a Confirmed scoped exception or an informational note, not a fabricated documentation match.

Example `API_SCHEMA_001`: a resolved field access must refer to a known parsed model. Check explicit serializer/mapper aliases before flagging conflict. Unresolved model identity is Unknown. A mere difference in naming style is insufficient.

## Confidence and prioritization

Use high/medium/low bands with an origin and explanation, following [evidence policy](15-ai-safety-confidence-and-evidence-policy.md). Do not use raw model self-confidence as calibrated probability. Severity describes potential consequence, not certainty. High-severity weak evidence must remain visibly uncertain.

## Lifecycle and feedback

Analysis facts are immutable. Human feedback appends disposition events. Subsequent analysis may resolve, persist, or invalidate a finding through fresh evidence. Reuse a logical fingerprint to link history, but do not reuse stale citations. Intentional exceptions must identify actor, reason, scope, and expiry if elevated into policy.

## Worked report

A PR adds `process.env.PAYMENT_WEBHOOK_SECRET`, modifies checkout, and leaves the example inventory unchanged. Changed contains checkout; Affected contains its callers with graph paths; Missing contains the scoped environment finding; Untested may tag a separate missing-test-relationship finding; Unknown records webhook behavior outside supported extraction. The checklist asks the reviewer to document the name and verify the unmodeled webhook consequence.
