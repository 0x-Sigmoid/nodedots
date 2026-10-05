# 11 · Data Model & Database Schema

Version: 0.1 · Status: proposed logical schema · Owner: Engineering

## Storage model

PostgreSQL stores tenants, authorization, lifecycle, graph facts, findings, feedback, usage, and audit metadata. Object storage holds encrypted short-lived source caches. This is a logical schema and migration contract; SQL migrations must be generated and reviewed during implementation.

UUIDs identify internal resources. GitHub numeric IDs are stored losslessly as big integers or decimal strings at API boundaries. Every tenant-owned row has `org_id`, creation time, and scoped foreign keys. All timestamps use UTC; UI converts them for the viewer.

## Entity schema

| Table | Main fields | Constraints |
|---|---|---|
| `users` | id, auth_subject, display_name, email | Unique auth_subject |
| `organizations` | id, name, status, retention_policy_id | Active/deleting/deleted |
| `memberships` | org_id, user_id, role, status | Unique org/user; owner/member |
| `installations` | id, org_id, github_installation_id, account_id, status | Unique GitHub installation binding |
| `repositories` | id, org_id, installation_id, github_repo_id, full_name, enabled | Unique installation/repo; track removal |
| `repository_access` | org_id, repo_id, user_id or role_scope | Explicit repository restrictions |
| `repository_configs` | id, org_id, repo_id, version, settings_json, actor_id | Immutable versions |
| `pull_requests` | id, org_id, repo_id, github_number, base_sha, head_sha, state | Unique repo/number |
| `snapshots` | id, org_id, repo_id, commit_sha, extraction_version, status, coverage_json | Unique repo/SHA/extraction-policy version |
| `files` | id, org_id, snapshot_id, path, blob_hash, byte_size, parse_status, cache_key | Unique snapshot/path |
| `nodes` | id, org_id, snapshot_id, logical_key, kind, file_id, qualified_name, metadata_json | Unique snapshot/logical_key |
| `edges` | id, org_id, snapshot_id, source_node_id, target_node_id, relation, origin, confidence | Both endpoints in same tenant/snapshot |
| `evidence` | id, org_id, snapshot_id, file_id, commit_sha, start_line, end_line, origin, extractor_version | Valid ranges; source hash required for code |
| `edge_evidence` | org_id, edge_id, evidence_id, role | Supporting/counterevidence links |
| `analyses` | id, org_id, pr_id, base_snapshot_id, head_snapshot_id, config_id, pipeline_version, status, completeness, coverage_json | Unique analysis key |
| `findings` | id, org_id, analysis_id, fingerprint, state, facet, severity, confidence, origin, title, explanation, next_step | One primary state; immutable analyzed content |
| `finding_evidence` | org_id, finding_id, evidence_id, role | Claims trace to cited evidence |
| `finding_nodes` | org_id, finding_id, node_id, relationship_path_json | Paths validate against snapshot |
| `feedback_events` | id, org_id, finding_id, actor_id, disposition, reason, created_at | Append-only; latest event defines human disposition |
| `publications` | id, org_id, analysis_id, github_check_id, status, attempt_count | Unique analysis/target; reconcile remote effects |
| `webhook_deliveries` | delivery_id, installation_id, event, payload_hash, status, received_at | Unique GitHub delivery ID |
| `outbox_events` | id, org_id, type, resource_id, status, available_at | Written with domain transaction |
| `job_runs` | id, org_id, analysis_id, stage, lease_until, attempts, error_code | Stage/version uniqueness |
| `llm_runs` | id, org_id, analysis_id, model, prompt_version, tokens, cost, status | No raw code in ordinary metadata |
| `usage_ledger` | id, org_id, analysis_id, event_type, units, period | Unique analysis/event_type |
| `audit_events` | id, org_id, actor_id, event_type, resource_id, metadata_json | Append-only; no source or secrets |
| `deletion_jobs` | id, org_id, scope, requested_at, due_at, status | Tracks live and backup expiry completion |

## Lifecycle and invariants

Analysis states: queued → indexing → analyzing → publishing → completed or partial. Failed, cancelled, and superseded are explicit terminal states; retries create job attempts, not contradictory state rewrites. A report's completeness is `full`, `partial`, or `unsupported` within declared V1 scope, never universal completeness.

Feedback never mutates original claims. Verified resolution is recorded by linking a later analysis. Reports keep their SHA-specific evidence even when the PR advances. Source excerpts may expire while provenance metadata remains; UI must explain unavailable evidence.

## Isolation and indexes

Use composite foreign keys including `org_id`; enable row-level tenant controls where feasible and enforce service authorization regardless. Jobs establish explicit tenant context. Index repositories by installation; analyses by PR/time/head; findings by analysis/state/severity; graph endpoints in both directions; outbox by pending availability; usage by organization/period. Tenant-filter every vector or future search index.

## Retention and migrations

Apply the common proposed retention schedule from the [security specification](14-security-and-privacy-specification.md). Deletion removes object caches, graph, reports, retrieval indexes, and future job access; audit/legal exceptions must be documented separately. Use expand/backfill/contract migrations and restore tests. Do not place database credentials or installation tokens in these tables as plaintext.
