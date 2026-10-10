CREATE TABLE shipping_settings (
 installation_id INTEGER NOT NULL, repo_id INTEGER NOT NULL, settings_cipher TEXT NOT NULL,
 updated_by INTEGER NOT NULL, updated_at INTEGER NOT NULL,
 PRIMARY KEY(installation_id,repo_id)
);
CREATE TABLE shipping_briefs (
 installation_id INTEGER NOT NULL, repo_id INTEGER NOT NULL, pr_number INTEGER NOT NULL,
 brief_cipher TEXT NOT NULL, updated_by INTEGER NOT NULL, updated_at INTEGER NOT NULL,
 PRIMARY KEY(installation_id,repo_id,pr_number)
);
CREATE TABLE shipping_actions (
 id INTEGER PRIMARY KEY AUTOINCREMENT, review_id TEXT NOT NULL, item_key TEXT NOT NULL,
 status TEXT NOT NULL, note_cipher TEXT NOT NULL, github_id INTEGER NOT NULL, login TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 FOREIGN KEY(review_id) REFERENCES workspace_reviews(id) ON DELETE CASCADE
);
CREATE INDEX shipping_actions_review ON shipping_actions(review_id,id);
CREATE TABLE workspace_shares (
 review_id TEXT NOT NULL, github_id INTEGER NOT NULL, login TEXT NOT NULL,
 granted_by INTEGER NOT NULL, created_at INTEGER NOT NULL,
 PRIMARY KEY(review_id,github_id),
 FOREIGN KEY(review_id) REFERENCES workspace_reviews(id) ON DELETE CASCADE
);
