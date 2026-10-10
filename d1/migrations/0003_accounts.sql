CREATE TABLE IF NOT EXISTS account_sessions (
 id_hash TEXT PRIMARY KEY, github_id INTEGER NOT NULL, login TEXT NOT NULL,
 token_cipher TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS account_session_expiry ON account_sessions(expires_at);
CREATE TABLE IF NOT EXISTS workspace_reviews (
 id TEXT PRIMARY KEY, github_id INTEGER NOT NULL, installation_id INTEGER NOT NULL,
 repo_id INTEGER NOT NULL, owner TEXT NOT NULL, repo TEXT NOT NULL, pr_number INTEGER NOT NULL,
 head_sha TEXT NOT NULL, base_sha TEXT NOT NULL, report_cipher TEXT NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS account_rate_limits (
 key TEXT PRIMARY KEY, expires_at INTEGER NOT NULL
);
