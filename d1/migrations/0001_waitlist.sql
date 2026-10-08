-- D1 is the source of truth for early-access consent and signup timestamps.
CREATE TABLE IF NOT EXISTS waitlist_signups (
 email TEXT PRIMARY KEY CHECK(length(email) <= 254 AND email = lower(email)),
 joined_at INTEGER NOT NULL,
 consent INTEGER NOT NULL CHECK(consent = 1),
 consent_version TEXT NOT NULL DEFAULT 'launch-updates-v1'
);
CREATE TABLE IF NOT EXISTS waitlist_rate_limits (
 key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS waitlist_rate_expiry ON waitlist_rate_limits(expires_at);
