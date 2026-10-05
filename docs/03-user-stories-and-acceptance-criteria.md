# 03 · User Stories & Acceptance Criteria

Version: 0.1 · Status: proposed · Owners: Product and Engineering

These scenarios implement the [PRD](02-product-requirements-document.md). “Then” statements are release checks, not illustrative aspirations.

## S01 · Connect an authorized repository — R01, R02

As an organization owner, I can connect repositories my installation can access.

- Given an authenticated owner completes installation, when the callback returns, then the backend verifies the installation and account before binding it to the organization.
- Given a member lacks owner privileges, when they change installation settings, then the request is denied and audited.
- Given installation access excludes a repository, then that repository cannot be selected through either UI or API.

## S02 · Understand indexing coverage — R03

As a maintainer, I can see whether repository understanding is ready.

- Given a supported repository, when indexing completes, then the UI shows snapshot SHA, eligible/indexed/skipped file counts, supported extractors, and completion time.
- Given generated files or binary files, then they are excluded with a reason.
- Given limits or parser failures, then status becomes partial and affected scope is disclosed; it is not presented as fully indexed.

## S03 · Receive a current report — R04, R09

As a PR author, I receive an analysis of the current change.

- Given a PR opens, then a single job is created for its snapshot and configuration version.
- Given the same webhook is redelivered, then no duplicate charge or report is created.
- Given a new commit arrives during analysis, then older work is superseded and cannot update the current-head check.
- Given a draft PR, then automatic analysis waits until it becomes ready unless a user explicitly requests analysis.

## S04 · Inspect impact — R05, R07, R08

As a reviewer, I can trace why an unchanged component is affected.

- Given an imported function changes, then directly affected importers have a cited relationship path.
- Given indirect impact exceeds the traversal budget, then truncation is visible.
- Given an ambiguous runtime relationship, then the report explains uncertainty rather than inventing a dependency.

## S05 · Detect a missing environment dot — R06

- Given a new literal environment reference in included source and a fully checked `.env.example`, when the name is absent, then a Missing finding cites the reference and checked configuration inventory.
- Given `.env.example` was excluded or unreadable, then the outcome is Uncertain rather than a proven absence.
- Given an example contains a real credential, then publication redacts its value and the provider receives no credential.

## S06 · Detect a conflict and a test gap — R06

- Given an API reads a Prisma field that does not exist in the same resolved model, then a Conflicting finding cites both contracts.
- Given mapping code translates the field name, then the rule does not report a direct mismatch.
- Given a changed function has no detected test relationship, then Untested is framed as “no related test detected in checked scope,” not “this behavior has no tests.”

## S07 · Resolve findings — R10

- Given a reviewer marks a finding intentional, then the actor and reason are retained without removing original evidence.
- Given a subsequent snapshot no longer satisfies the rule, then the finding is marked resolved by re-analysis; a human “fixed” label alone is not verification.
- Given the same fingerprint reappears, then earlier disposition is visible; dismissal does not silently suppress new evidence.

## S08 · Recover and disconnect — R11, R12

- Given transient provider failure, then bounded retries occur and deterministic results remain labeled partial if AI fails.
- Given a user retries, then the existing successful analysis is reused or a versioned replacement is created without duplicate metering.
- Given installation revocation, then pending retrieval and publication stop, reports become access-restricted, and deletion follows policy.
- Given user A guesses organization B's report ID, then no content or existence detail is exposed.

## Definition of done

Each story includes success, failure, authorization, and accessibility verification where relevant. Store fixture SHA and expected evidence alongside integration tests. Any accepted deviation updates the PRD and this file before release.
