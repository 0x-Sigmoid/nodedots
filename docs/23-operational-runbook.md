# 23 · Operational Runbook

Version: 0.1 · Status: preproduction procedure · Owner: Operations

## Readiness and incident authority

Before production, assign named primary/backup incident leads, engineering responder, security/privacy owner, and customer communications owner; record actual paging/support channels in the secured operational directory. This document does not establish staffed 24/7 support.

SEV1: suspected data disclosure, credential exposure, cross-tenant access, or broad integrity compromise. SEV2: sustained report outage, stuck processing, repeated stale publication, or serious grounding regression. SEV3: isolated recoverable failure with no exposure. Incident lead may pause ingestion, analysis, AI enrichment, or publication to contain impact.

## First response

1. Acknowledge the alert and assign incident severity/lead.
2. Determine affected tenants, versions, time window, and stages using content-free IDs.
3. Contain the risky capability with the narrowest effective switch.
4. Preserve relevant metadata in a restricted incident record; do not paste source or credentials into ordinary chat/logs.
5. Communicate confirmed impact and next update time through approved channels.
6. Restore only after the relevant correctness and security checks pass.

## Webhook receipt failures

Check signature-rejection counts, secret version, ingress availability, durable database receipt, outbox backlog, and GitHub delivery status. Reject unsigned/invalid events even during outage. After recovery, replay authorized deliveries through normal deduplication. Compare delivery IDs and analysis keys; do not enqueue duplicate work blindly.

## Queue backlog or stuck jobs

Inspect oldest age, worker health, dependency rate limits, lease expiration, and tenant load. Pause new enrichment if cost or provider limits are causal; preserve deterministic handling. Reclaim expired leases using stage idempotency. Move repeatedly failing jobs to a dead-letter queue with stable error codes. Replay only after correcting the cause; preserve snapshot/version keys and usage reservations.

## GitHub authorization or publication failures

For 401/403, revalidate installation/suspension, selected repository access, permission changes, and token expiry. Do not increase permissions as an automatic repair. For rate limits, respect retry windows. For ambiguous check creation, reconcile remote check external IDs before retrying. Compare current PR head before every update; cancel/supersede old-head work.

## AI/provider failures or quality regression

Check provider status, request metadata, model/prompt version, schema validation, token ceiling, and circuit breaker. Retry transient failures within budget. Publish valid deterministic results as partial where possible. For fabricated citations, injection susceptibility, or precision regression, disable the affected enrichment/rule version and restore last-known-good configuration. Revalidate already-published affected reports and label or withdraw unsupported claims.

## Suspected data or secret exposure

Stop affected retrieval/publication; restrict credentials and rotate compromised keys. Record affected resources, recipients, provider requests, and exposure duration without reproducing sensitive content. Security lead investigates with least-privilege access. Legal/privacy owner determines required notifications from applicable law/contracts and incident facts. Do not assert containment or a universal notification deadline before verification.

## Deletion failure and database recovery

Immediately maintain deny-access tombstones and cancel work. Reconcile database records, objects, caches, retrieval indexes, and publication links. Retry scoped purge idempotently; escalate retention deadline breaches. Backups expire within the approved schedule.

For restore, select verified backup, restore into an isolated environment, validate integrity and tenant controls, replay deletion tombstones, reconcile outbox/usage/publication state, then cut over. Avoid replaying expired jobs or publishing stale reports. Measure actual RPO/RTO against deployment targets.

## Closeout and drills

An incident closes after restoration, validation, impact assessment, communication, and assigned follow-ups. Record timeline, cause, detection gaps, corrective owner/date, and relevant regression fixtures. Run restore, revocation, provider outage, publication ambiguity, and deletion drills before production and periodically thereafter.
