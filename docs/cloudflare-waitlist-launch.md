# Launch the NodeDots waitlist on Cloudflare

## Live deployment

Launched on 8 October 2026:

- Public waitlist: https://nodedots.com/waitlist
- Worker fallback: https://nodedots.sgukobong.workers.dev/waitlist
- Worker: nodedots; D1 database: nodedots-waitlist, bound as WAITLIST_DB.
- The route nodedots.com/* sends traffic to the Worker. Existing apex DNS
  records were preserved. Keep the hostname proxied through Cloudflare.
- PRODUCT_PREVIEW_ENABLED=0 hides reports and blocks the report/webhook APIs.
  Development webhook secrets and snapshot fixtures are blank in production.

Browser signup, duplicate handling, consent persistence, and persistence across
redeployment were verified against production D1. Test entries were removed.
Signup confirmations use Resend once its API key and verified sending domain
are configured. Invitations and launch campaigns are separate from confirmations.

The app runs on Cloudflare Workers using OpenNext. Signups are stored in D1,
including normalized email, first join time, consent, and the consent copy version.
Duplicates retain the original entry. The same D1 database keeps hashed, expiring
rate-limit buckets across Worker instances. A failed write returns 503; there is
no in-memory success fallback. D1 has no public signup-list endpoint.

## Prepare locally
Run from the project root, not the separate waitlist/ directory.

1. Install dependencies with npm install.
2. Run npm run cf:db:local to apply the local D1 migration.
3. Run npm run cf:build, then npm run cf:preview.
4. Open the preview URL and submit a test email. Restart the preview and confirm
   the record remains in local D1. Remove the test email after checking.

wrangler.jsonc already contains the production database ID. Local preview uses
a separate local D1 database; it does not write to the production waitlist.

## Connect your Cloudflare account
Authenticate locally with npx wrangler login. Complete the browser login yourself;
never put API tokens or your password in chat. Then:

1. Reuse the database configured in wrangler.jsonc. Do not create another
   database for routine deployments.
2. Run npm run cf:db:remote to apply any new migrations.
3. Run npm run cf:deploy. Keep PRODUCT_PREVIEW_ENABLED set to 0.
4. Verify /waitlist and /api/waitlist on the returned workers.dev URL. Confirm a
   test signup is actually present in D1, remains after redeployment, and dedupes.

## Connect nodedots.com
The domain is connected through the Worker route in wrangler.jsonc. Routine
deployments retain that route. Cloudflare refused the Custom Domain setup because
the hostname has externally managed DNS records; the Worker route avoids deleting
those records. No DNS changes are required for the current deployment.

If migrating to a Custom Domain later:
In Cloudflare: Workers & Pages > nodedots > Settings > Domains & Routes > Add >
Custom Domain. Enter nodedots.com. Review any existing apex DNS record before
replacing it. Cloudflare provisions the DNS routing and certificate for the Worker.
Add www.nodedots.com if you want that hostname to serve the same site.

The Next.js route already provides /waitlist: no separate DNS record is needed
for this path. Check https://nodedots.com/waitlist, submit your own test email,
confirm it is present in D1, and then remove it.

## Confirmation emails with Resend

1. Verify nodedots.com in Resend by adding its displayed DNS records in Cloudflare.
   Preserve existing mail records; Resend's receiving-email feature is not needed.
2. Create a Resend API key with sending access for the verified domain.
3. From this project, run npx wrangler secret put RESEND_API_KEY and paste the key
   only into that secure terminal prompt. Never put it in source or chat.
4. WAITLIST_EMAIL_FROM is set to NodeDots <welcome@nodedots.com> in wrangler.jsonc.
5. Apply migrations with npm run cf:db:remote, then run npm run cf:deploy.
6. Join using your own inbox and check both inbox and spam. Resend acceptance is
   recorded as sent; inbox delivery must be confirmed separately in Resend logs.

The API saves consent before attempting a confirmation. If credentials are
missing, Resend rejects the message, or the request times out, the signup remains
saved and the page says a confirmation could not be sent. The confirmation stays
pending and a later signup submission retries it. There is no scheduled mail retry
or automatic backfill of earlier subscribers. Already sent confirmations are
skipped. D1 uses atomic send claims and a five-minute lease for interrupted sends;
Resend receives the same idempotency key on retries (its deduplication lasts 24 hours).

Each confirmation includes an opaque unsubscribe link. Opening the link shows a
confirmation page; clicking Unsubscribe removes the record. GET requests never
remove consent, so email scanners cannot unsubscribe a recipient by following
the link. The List-Unsubscribe header also supports the mailbox's one-click POST.

For local simulated tests, use mocks. To intentionally send from local preview,
set RESEND_API_KEY in an ignored .dev.vars file; real recipient addresses will
receive real email. Do not use production credentials for routine automated tests.

## Review signups privately
Use the Cloudflare D1 dashboard console on nodedots-waitlist:
SELECT email, datetime(joined_at, 'unixepoch') AS joined_at, consent_version
FROM waitlist_signups ORDER BY joined_at DESC;

Export through the D1 dashboard or Wrangler only to a private location. Do not
commit an export or expose the signup table through a public route.
