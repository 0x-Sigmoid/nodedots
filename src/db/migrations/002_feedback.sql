-- 002_feedback.sql — human disposition events (docs/08, docs/11).
-- Append-only: the latest event per (analysis, fingerprint) defines the
-- disposition; clearing records a "cleared" event rather than deleting.
-- org_id/actor_id arrive with accounts; scope columns already exist.

CREATE TABLE IF NOT EXISTS feedback_events (
  id TEXT PRIMARY KEY,
  -- No FK: demo/illustrative report ids carry feedback before any analyses row exists.
  analysis_id TEXT NOT NULL,
  finding_fingerprint TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'local',
  disposition TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS feedback_events_analysis_idx ON feedback_events (analysis_id, finding_fingerprint, created_at);
