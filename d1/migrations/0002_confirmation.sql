ALTER TABLE waitlist_signups ADD COLUMN confirmation_status TEXT NOT NULL DEFAULT 'pending' CHECK(confirmation_status IN ('pending', 'sending', 'sent'));
ALTER TABLE waitlist_signups ADD COLUMN confirmation_claimed_at INTEGER;
ALTER TABLE waitlist_signups ADD COLUMN confirmation_claim_id TEXT;
ALTER TABLE waitlist_signups ADD COLUMN confirmation_sent_at INTEGER;
ALTER TABLE waitlist_signups ADD COLUMN unsubscribe_token TEXT;
CREATE UNIQUE INDEX waitlist_unsubscribe_token ON waitlist_signups(unsubscribe_token);
