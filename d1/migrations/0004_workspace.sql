CREATE TABLE workspace_jobs (
 id TEXT PRIMARY KEY, github_id INTEGER NOT NULL, installation_id INTEGER NOT NULL,
 repo_id INTEGER NOT NULL, owner TEXT NOT NULL, repo TEXT NOT NULL, pr_number INTEGER NOT NULL,
 title TEXT NOT NULL, head_sha TEXT NOT NULL, base_sha TEXT NOT NULL,
 token_cipher TEXT, status TEXT NOT NULL DEFAULT 'queued', stage TEXT NOT NULL DEFAULT 'queued',
 error TEXT, review_id TEXT, check_id INTEGER, automatic INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
 UNIQUE(github_id, repo_id, pr_number, head_sha, base_sha)
);
CREATE INDEX workspace_jobs_user ON workspace_jobs(github_id, created_at DESC);
CREATE TABLE workspace_preferences (
 github_id INTEGER PRIMARY KEY, installation_id INTEGER NOT NULL, repo_id INTEGER NOT NULL
);
CREATE TABLE workspace_automation (
 github_id INTEGER NOT NULL, installation_id INTEGER NOT NULL, repo_id INTEGER NOT NULL,
 enabled INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL,
 PRIMARY KEY(github_id, repo_id)
);
CREATE TABLE workspace_feedback (
 id INTEGER PRIMARY KEY AUTOINCREMENT, review_id TEXT NOT NULL, github_id INTEGER NOT NULL,
 fingerprint TEXT NOT NULL, disposition TEXT NOT NULL, reason TEXT, created_at INTEGER NOT NULL,
 FOREIGN KEY(review_id) REFERENCES workspace_reviews(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX workspace_automation_owner ON workspace_automation(installation_id,repo_id) WHERE enabled=1;
CREATE INDEX workspace_feedback_review ON workspace_feedback(review_id, github_id, id);
CREATE TABLE workspace_deliveries (id TEXT PRIMARY KEY, received_at INTEGER NOT NULL);
