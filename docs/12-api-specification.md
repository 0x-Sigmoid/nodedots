# 12 · API Specification

Version: 0.1 · Status: proposed V1 contract · Owner: Backend Engineering

## Protocol and authentication

Application APIs use JSON over HTTPS under `/api/v1`. First-party UI uses authenticated secure sessions; modifying cookie-authenticated requests require CSRF protection. Public API tokens and agent APIs are deferred. Authorization verifies organization membership, role, repository access, and current installation status on every request.

UUID resource IDs are opaque. SHAs are strings. Times are ISO 8601 UTC. List endpoints use cursor pagination (`limit` default 25, maximum 100). Responses carry a request ID. Errors expose stable codes, not stack traces or repository content.

## Endpoint contract

| Method and path | Behavior | Authority |
|---|---|---|
| `GET /me` | Current user and organizations | Signed-in |
| `POST /organizations` | Create organization and owner membership | Signed-in; abuse-limited |
| `GET /organizations/{orgId}/repositories` | Accessible repository metadata | Member |
| `POST /organizations/{orgId}/installations/bind` | Verify and bind installation callback | Owner; server verification |
| `PATCH /organizations/{orgId}/repositories/{repoId}` | Enable/pause/configure; creates config version | Owner |
| `POST /organizations/{orgId}/repositories/{repoId}/index` | Queue baseline indexing | Owner |
| `GET /organizations/{orgId}/repositories/{repoId}/coverage` | Current snapshot coverage | Repository-authorized member |
| `GET /organizations/{orgId}/repositories/{repoId}/pull-requests` | PR summaries | Repository-authorized member |
| `POST /organizations/{orgId}/repositories/{repoId}/pull-requests/{number}/analyses` | Resolve current SHAs and queue/reuse analysis | Repository-authorized member |
| `GET /organizations/{orgId}/analyses/{analysisId}` | Status and report metadata/findings | Repository-authorized member |
| `GET /organizations/{orgId}/analyses/{analysisId}/findings` | Paginated/filterable findings | Same |
| `GET /organizations/{orgId}/evidence/{evidenceId}` | Redacted immutable excerpt/location | Same; repository checked |
| `POST /organizations/{orgId}/findings/{findingId}/feedback` | Append disposition event | Same; actor derived from session |
| `POST /organizations/{orgId}/analyses/{analysisId}/retry` | Retry permitted failed stage | Same; rate-limited |
| `GET /organizations/{orgId}/usage` | Quota and usage totals | Member |
| `DELETE /organizations/{orgId}/repositories/{repoId}/data` | Stop jobs and schedule scoped deletion | Owner |
| `POST /webhooks/github` | Verify, persist, deduplicate event | GitHub signature; no UI session |

## Analysis request and response

`POST .../analyses` accepts `{ "force_refresh": false }`; the server captures authorized SHAs. Clients cannot choose arbitrary private snapshots. Optional intent is capped at 4,000 characters and treated as untrusted data. Force refresh requires a recorded reason and remains quota-limited.

```json
{
  "data": {
    "id": "analysis_uuid",
    "status": "queued",
    "base_sha": "captured_base_sha",
    "head_sha": "captured_head_sha",
    "completeness": null,
    "report_url": "/orgs/org_uuid/analyses/analysis_uuid"
  },
  "request_id": "request_uuid"
}
```

Return 202 for queued work and 200 for an existing reusable result. Completed findings include `state`, `facet`, `severity`, `confidence`, `origin`, `evidence_ids`, `next_step`, and `human_disposition`. Analysis coverage includes file counts, parser support, failed stages, and truncation reasons.

## Idempotency and errors

Mutation endpoints that schedule work accept `Idempotency-Key`, scoped to actor, organization, route, and request hash for 24 hours. Reusing the key with different input returns 409. Analysis uniqueness remains permanent for its snapshot/config/pipeline key. Feedback events can use the same mechanism to avoid double clicks.

Error envelope: `{ "error": { "code": "QUOTA_EXCEEDED", "message": "Analysis allowance reached", "retryable": false }, "request_id": "..." }`.

Use 400 invalid payload, 401 unauthenticated, 403 forbidden role, 404 unavailable resource (including cross-tenant IDs), 409 conflicting state, 413 payload too large, 422 unsupported input, 429 rate/quota limit, and 503 dependency unavailable. Retryable rate responses include `Retry-After` where known.

## Validation and versioning

Reject unknown writable fields, invalid enum values, oversized strings, and pagination abuse. Body size limits differ for signed GitHub webhooks and small application JSON. Validate all path relationships server-side. Contract tests cover authorization and examples. Breaking field/state changes require a new API version; additive fields retain existing meanings.
