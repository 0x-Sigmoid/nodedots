# GitHub onboarding and first review

Get Started now leads to `/onboarding`, then GitHub authorization, selected-repository installation, `/workspace`, and a private commit-pinned review. This is an initial manual-review beta, separate from the preview-only webhook pipeline.

## Deployment status · 10 October 2026

The app is registered at https://github.com/apps/nodedots-code. Production variables and encrypted-token secrets are configured on the `nodedots` Worker; migration `0003_accounts.sql` is applied to remote D1. Production uses `https://nodedots.com` and keeps private repositories disabled. Local development prefers `.env.local` for its localhost callback. Visitors starting authorization through the Workers preview are redirected to the production hostname before an OAuth cookie is set.

Desktop and mobile onboarding, PKCE redirect parameters, secure HTTP-only cookies, anonymous workspace rejection, cross-origin rejection, and forged callback rejection were checked against the live deployment. Real account consent, repository installation, and a first analysis still require the user's GitHub sign-in; they have not been represented as an end-to-end production pass. Twenty focused auth/configuration tests pass, alongside the previously completed core test suite and production build.

## Register the new GitHub App

Create the app at https://github.com/settings/apps/new under the account or organization that will own NodeDots. Suggested name: **NodeDots Code** (GitHub app names are globally unique; record the actual slug).

- Homepage: `https://nodedots.com`
- User authorization callback: `https://nodedots.com/api/account/callback`
- Add a second callback for local development: `http://localhost:3000/api/account/callback`
- Setup URL after installation: `https://nodedots.com/onboarding`
- Disable "Request user authorization (OAuth) during installation": sign-in happens first and the installation redirects back to onboarding separately.
- Leave expiring user access tokens enabled. Sessions last at most eight hours; the beta requires signing in again rather than retaining refresh tokens.
- Repository permissions: **Contents: read**, **Pull requests: read**, **Metadata: read**, **Checks: write**. No organization permissions or source write access.
- Installation availability: any account for a public beta; selected repositories are chosen by each installer.
- Disable webhooks for this first manual-review phase. Automatic PR checks require a separate durable webhook worker rollout; the existing preview webhook endpoint is not a production queue.

Generate a client secret in the app settings. Do not commit it or paste it into chat.

## Configure local development

Add these values to the ignored `.env.local`:

```dotenv
NODEDOTS_APP_URL=http://localhost:3000
GITHUB_APP_SLUG=your-actual-app-slug
GITHUB_CLIENT_ID=your-app-client-id
GITHUB_CLIENT_SECRET=your-app-client-secret
AUTH_SECRET=at-least-32-characters-of-random-secret-material
```

Generate AUTH_SECRET with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Keep this secret stable: rotating it invalidates encrypted tokens and saved reports.

Run `npm run cf:db:local`, then restart `npm run dev`. The waitlist remains available and PRODUCT_PREVIEW_ENABLED need not be enabled for onboarding.

## Configure Cloudflare

Apply `npm run cf:db:remote`. Store the client secret and AUTH_SECRET using `npx wrangler secret put GITHUB_CLIENT_SECRET` and `npx wrangler secret put AUTH_SECRET` (interactive prompts; no secrets in command arguments). Configure `GITHUB_CLIENT_ID`, `GITHUB_APP_SLUG`, and `NODEDOTS_APP_URL=https://nodedots.com` as Worker variables before deploying. Use the same AUTH_SECRET through normal redeploys.

Until all configuration is present, onboarding displays an honest setup-pending state and does not fake a connection. Creating the app and configuring credentials are required before real user sign-in can succeed.

## Security and beta boundaries

- OAuth state is encrypted in a ten-minute HTTP-only cookie with PKCE. Session cookies contain only random identifiers; their hashes and encrypted GitHub tokens are stored in D1.
- User access tokens expose only the intersection of the user's access and app installation access. Installations, repositories, and saved-report access are revalidated against GitHub. A submitted installation ID or report URL alone grants no authority.
- Reviews are scoped to their initiating GitHub user. Shared team workspaces and shared reports are not implemented.
- Logout removes the D1 session; revoked or expired GitHub access fails closed. Refresh tokens are not retained.
- Same-origin checks protect mutations. The review API permits at most one new review per user per minute.
- Retrieval is bounded, commit-pinned, and does not execute repository code. The existing deterministic engine is used; no external AI provider is invoked by this endpoint.
- Report JSON is encrypted in D1, expires after seven days, and expired rows are purged when another review is saved. Session cleanup runs on sign-in. Scheduled physical purging is a follow-up operational task.
- Manual reviews do not publish GitHub checks yet. Finding dispositions are temporary browser-memory state and are labeled accordingly.
- Public repositories are the default beta scope. Private repositories are filtered out and rejected server-side unless `ALLOW_PRIVATE_REPOSITORIES=1` is explicitly configured after the documented privacy and security prerequisites are complete.
- Requests have an approximate 90-second retrieval budget. Large repositories can fail with a retry message; a durable background job queue is the next scaling step.
- App-only pages are noindex. The marketing page and dedicated waitlist are unchanged apart from product CTAs.

## Verify before opening beta

Use a public test repository first. Sign in, install on only that repository, create an open PR, and request a review. Check that another account cannot read the report and that removing the repository from the installation blocks access to an existing report. Test cancellation, expired sign-in, logout, and a PR with inaccessible fork context. Private beta requires completing the privacy/operator documentation and the security review described in the existing specification.
