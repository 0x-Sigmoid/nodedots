# 14 · Security & Privacy Specification

Version: 0.1 · Status: required design controls, implementation unverified · Owner: Security

## Assets and threat model

Protect private source, repository metadata, user identity, installation credentials, graph relationships, report findings, and operational records. Threat actors include malicious repository contributors, unauthorized users, compromised workers, prompt-injection authors, and attackers guessing resource IDs. Main risks: cross-tenant retrieval, credential exfiltration, forged webhooks, source execution, unsafe provider submission, and lingering data after revocation.

## Authorization

Organization membership is necessary but not sufficient: repository restrictions and active installation access must also permit the operation. Owners manage connections, membership, retention, and deletion; authorized members read reports, request analyses, and submit feedback. Enforce checks in API, workers, object access, and retrieval tools. Deny by default; never trust tenant IDs supplied by clients or model tools.

## Required controls

- Secure, HTTP-only session cookies; CSRF protection for modifying session-authenticated requests.
- TLS in transit; managed encryption at rest for database, objects, and backups.
- Credentials in a secret manager; short-lived installation tokens; key rotation and audited access.
- Signature validation for GitHub ingress; delivery deduplication and payload limits.
- Isolated bounded workers, no repository execution/install, no privileged runtime, restricted egress.
- Path normalization and traversal protection; no following symlinks outside eligible manifests.
- Escaped report rendering; no executable repository HTML or model-generated markup.
- Tenant-scoped caches and searches; no source snippets in general logs or analytics.

## Data minimization

Index only configured eligible paths. Exclude `.env` secrets, credential files, private keys, dependencies, and binaries by default. `.env.example` analysis uses variable names and redacted placeholders. Secret scanning occurs before storage intended for inference and before provider submission/publication; scanner misses remain a risk, so combine exclusions, restricted context, and redaction.

Send only evidence needed for the analysis to approved AI providers. Never train a NodeDots model on customer source without a separate explicit agreement. Actual provider processing and retention must be reflected in published disclosure; no unverified zero-retention promise.

## Proposed retention contract

| Data | Default retention | Deletion behavior |
|---|---|---|
| Raw source cache and restricted excerpts | 7 days | Purge storage and retrieval cache |
| Graph snapshots, reports, feedback | 90 days | Purge or irreversibly de-identify authorized aggregates |
| Content-free operational logs | 30 days | Automated expiry |
| Security audit metadata | 180 days | Restricted access; exceptions documented |
| Backups | Up to 35 days | Expire; restore must replay deletion tombstones |

Owners can request earlier repository/account deletion. Immediately stop access and pending jobs; target live-content purge within seven days and backup expiry within 35 days. Billing/legal records may require a separately published lawful schedule. Retention configuration cannot exceed contractual limits without consent and policy revision.

## Incident response and assurance

Test object-level access controls, signed delivery rejection, token non-disclosure, path handling, injection, cache separation, revocation races, and deletion restore behavior. Require dependency scanning and a security review before private beta. Record verified controls rather than claiming certification.

Suspected exposure invokes the [runbook](23-operational-runbook.md): contain access, preserve content-free evidence, investigate affected scope, rotate relevant credentials, and obtain legal guidance on applicable notices. Notification obligations depend on facts and jurisdiction; do not hardcode a universal deadline.

## Publication prerequisites

Complete operator identity, controller/processor role allocation, vendor agreements, data-transfer assessment, contact channel, and rights-request process. Nigerian data protection requirements need qualified review; the [Nigeria Data Protection Commission](https://ndpc.gov.ng/faqs/) identifies the governing framework. See the [legal drafts](24-privacy-policy-terms-and-ai-disclosure.md).
