-- 001_init.sql — ingestion + analysis persistence slice (docs/11).
-- Reviewed migration contract: outbox receipt, durable analysis records,
-- evidence-linked findings. Auth/org tables arrive with accounts (later
-- phase); every row here already carries owner/repo scope for that join.
-- Idempotent: safe to re-run (IF NOT EXISTS, additive only).

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  delivery_id TEXT PRIMARY KEY,
  installation_id BIGINT,
  event TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbox_events (
  id TEXT PRIMARY KEY,
  delivery_id TEXT NOT NULL REFERENCES webhook_deliveries (delivery_id),
  event TEXT NOT NULL,
  action TEXT,
  owner TEXT,
  repo TEXT,
  installation_id BIGINT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  analysis_id TEXT,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS outbox_events_status_idx ON outbox_events (status, available_at);
CREATE INDEX IF NOT EXISTS outbox_events_repo_idx ON outbox_events (owner, repo);

CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  pr_number INTEGER NOT NULL,
  head_sha TEXT NOT NULL,
  base_sha TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  completeness TEXT NOT NULL DEFAULT 'full',
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner, repo, pr_number, head_sha)
);
CREATE INDEX IF NOT EXISTS analyses_repo_idx ON analyses (owner, repo, pr_number);

CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL REFERENCES analyses (id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  state TEXT NOT NULL,
  facet TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence TEXT NOT NULL,
  confidence_explanation TEXT NOT NULL,
  origin TEXT NOT NULL,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  next_step TEXT NOT NULL,
  UNIQUE (analysis_id, fingerprint)
);
CREATE INDEX IF NOT EXISTS findings_analysis_idx ON findings (analysis_id, state, severity);

CREATE TABLE IF NOT EXISTS finding_evidence (
  id TEXT PRIMARY KEY,
  finding_id TEXT NOT NULL REFERENCES findings (id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  origin TEXT NOT NULL,
  base_side BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS finding_evidence_finding_idx ON finding_evidence (finding_id);
