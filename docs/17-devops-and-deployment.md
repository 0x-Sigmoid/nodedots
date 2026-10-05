# 17 · DevOps & Deployment Specification

Version: 0.1 · Status: proposed · Owner: Platform Engineering

## Deployment topology

Deploy web/API, webhook ingress, analysis workers, and publication workers independently while sharing versioned contracts. Use managed PostgreSQL, encrypted object storage, durable queue, secret management, and central telemetry. Provider selection requires regional availability, private networking, retention controls, budget, and recovery review; no provider is selected by this document.

## Environments

| Environment | Data | Access and purpose |
|---|---|---|
| Local | Synthetic fixtures | Developer iteration; no production tokens |
| Test/CI | Ephemeral synthetic data | Automated contracts and isolation checks |
| Staging | Synthetic or explicitly consented test repositories | Separate GitHub App, database, keys, and AI project |
| Production | Authorized customer repositories | Least privilege, controlled releases, audited access |

Do not clone production private content into staging. Secret values are injected at runtime. Required logical settings include database/queue/object endpoints, GitHub App ID/private key/webhook secret, session secret, AI provider credentials/model, encryption settings, region, and budget ceilings. Only names and safe placeholders belong in `.env.example`.

## CI and release pipeline

1. Validate formatting, types, dependency integrity, and relevant unit/integration tests.
2. Run parser/rule fixtures and security/contract tests.
3. For AI changes, execute holdout evaluation and compare gates.
4. Build immutable artifacts with version and dependency manifest.
5. Apply backward-compatible schema expansion in staging; smoke-test ingestion and publication.
6. Deploy a production canary, monitor correctness/latency/cost, then expand.

Require human review for production code and sensitive configuration changes. Protected branches and release credentials restrict deployment. No customer repository workflow is executed by NodeDots.

## Migrations and rollback

Use expand → backfill → verify → contract. Keep application compatibility across the rollback window. Version jobs, schemas, rules, prompts, and reports. Drain or route queued old-version jobs to compatible workers before removing support. Roll back artifacts/configuration; do not reverse a destructive migration without a verified recovery plan.

Maintain a last-known-good parser/rule/model configuration. Provider degradation can disable AI enrichment while preserving labeled deterministic partial reports. Pause publication if stale-head or citation correctness is uncertain.

## Reliability targets

Initial proposed targets: 99.5% monthly authenticated report-read availability; p95 supported warm analysis ≤ five minutes under healthy dependencies; durable webhook receipt within two seconds p95 under expected beta load. Targets are internal until measured and contractually adopted.

Recovery design targets: database RPO ≤ one hour, RTO ≤ four hours. Verify provider backup settings and perform restore drills before promising these targets. Restored systems replay deletion tombstones before serving content.

## Scaling and maintenance

Scale analysis workers by queue age, memory pressure, and supported workload size. Limit per-organization concurrency to prevent one tenant monopolizing capacity. Separate publication retries from analysis jobs. Apply parser timeouts and per-job CPU/memory limits. Lifecycle policies purge temporary source and expired objects.

Backup database and essential metadata; avoid unnecessary long-lived raw source backups. Perform quarterly restore and credential-rotation drills, with more frequent drills during initial beta. Review dependency alerts and capacity weekly. See [observability](18-observability-and-analytics.md) and [runbook](23-operational-runbook.md).
