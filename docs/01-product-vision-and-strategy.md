# 01 · Product Vision & Strategy

Version: 0.1 · Status: proposed · Owner: Product

## Product thesis

NodeDots is relationship-and-gap intelligence: it connects a user's goal to available evidence and identifies what is confirmed, missing, conflicting, uncertain, or requires action. Its promise is **Connect the dots before you act.** Its fundamental unit is a supported relationship, rather than an isolated prompt or file.

NodeDots Code is the initial wedge. Developers already have tools that generate and review code. NodeDots addresses the consequences that span files, contracts, configuration, databases, and tests: **Know what your code change affects before you ship.**

## Initial customer and problem

The first customer is a small engineering team shipping a TypeScript/JavaScript web product on GitHub, often with coding agents. The buyer is an engineering lead; users are PR authors and reviewers. These teams need a concise, inspectable answer to “What did this change forget?” without a new review ceremony.

Example: an authentication migration updates login and middleware while billing continues to join customers through the former provider's identifier. A useful report connects the migration to billing and cites the remaining dependency. A generic suggestion to “check billing” does not satisfy the product promise.

## Strategic choices

1. Enter through GitHub PRs, where changes, reviewers, and decisions already meet.
2. Prioritize a small number of consequential, evidence-backed findings.
3. Combine deterministic extraction with bounded AI inference.
4. Preserve historical provenance so relationships can later explain architecture and rationale.
5. Keep analysis advisory during V1; humans decide whether to merge.

The moat hypothesis is accumulated relationship history, useful organizational policies, workflow integration, and reviewer feedback. Model access alone is not a defensible advantage. This hypothesis must be tested through repeat use and developer-confirmed findings.

## Boundaries

V1 does not generate code, autonomously fix repositories, execute repository scripts, replace security scanners, or certify that software is safe. It does not launch the non-code product family. NodeDots focuses on relationships, evidence, and change consequences.

## Future product family

| Mode | Question |
|---|---|
| Code | What does this change affect? |
| Apply | Am I ready to submit? |
| Contracts | What do I owe, and when? |
| Research | Does the evidence support the study? |
| Business | What is required to accomplish this? |
| Verify | What is supported by the evidence? |
| Decisions | What am I missing before I act? |

These are future specializations of a shared goal → evidence → relationships → findings → actions engine. Domain rules, consent, evaluation datasets, and legal requirements must be developed separately before each mode launches.

## Validation and success

The primary metric is the percentage of eligible analyzed PRs with at least one developer-confirmed meaningful finding. Track precision, dismissals, resolution before merge, repeat repository use, analysis latency, and cost alongside it. “Number of findings” is not a success metric by itself.

Initial go/no-go targets and sample requirements live in the [beta plan](20-launch-and-beta-plan.md). Expand only after usefulness and trust are demonstrated. See the [PRD](02-product-requirements-document.md) for the implementation contract.
