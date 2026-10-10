# Workspace workflow

NodeDots Code connects a GitHub pull request to supported source relationships, observations, evidence, and reviewer decisions. Public repositories are supported in this beta. Reviews remain advisory.

## Everyday workflow

1. Sign in and choose a connected GitHub account and repository. The last repository is saved to your account and revalidated against GitHub.
2. Search the open PR inbox, or paste a canonical GitHub PR URL. URL resolution only searches installations the signed-in user can access.
3. Start a review. A D1 job records the captured base/head commits before a Cloudflare Queue message is sent. The job page shows actual retrieval, graph, rule, and report milestones; users can leave and return.
4. Inspect observations alongside the supported impact paths and evidence at the captured commit. Coverage, skipped files, unknowns, and the review checklist remain visible.
5. Record accepted, dismissed, fixed, or intentional with an optional reason. Append-only decisions are saved per user and report; “fixed” is a reviewer assertion, not a verified outcome.
6. Recheck after new commits. The new report compares fingerprints with the previous report for the same PR: new, persisting, and no longer observed. Disappearance alone does not prove a fix. Decisions do not automatically transfer between commits.

History shows the last 30 retained reviews for the selected repository. The inbox lists up to 100 open PRs. Graph rendering shows up to 24 files; the full checked scope remains in the report. Reports and jobs expire after seven days.

## Background worker

The app produces to `nodedots-reviews`. `workers/workspace-consumer.ts`, configured by `wrangler.workspace.jsonc`, consumes one job per batch and invokes the private runner endpoint using a separate `WORKSPACE_RUNNER_SECRET`. Never use `AUTH_SECRET` as the runner credential. Supply the runner secret to both Workers.

Job execution uses an atomic D1 lease. Duplicate messages cannot publish a second report while an active job runs. Interrupted requests can reclaim a three-minute stale lease. Lease fencing prevents superseded attempts from writing reports or changing newer job state. Transient GitHub failures retry up to four attempts. Delivery retries occur with a three-minute delay. A scheduled maintenance pass every 15 minutes marks abandoned jobs failed and removes expired reports, feedback, job credentials, delivery receipts, and sessions. Analysis errors become visible failed jobs with a user-controlled retry; they never become clean reports.

Source content is commit-pinned. The current PR commits are checked before and after retrieval; superseded work is rejected rather than mixing a current PR file list with an old snapshot. Repository access is revalidated before persistence and every saved-report or feedback read.

## Optional GitHub automation

Set `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY_PEM`, and `GITHUB_WEBHOOK_SECRET` in the main Worker. In GitHub App settings, enable webhooks at `https://nodedots.com/api/workspace/github`, supply the same webhook secret, and subscribe to **Pull request** events. The App needs Contents read, Pull requests read, Metadata read, and Checks write.

A repository administrator or maintainer explicitly enables automation under Repository context. One maintainer owns automation per installation/repository. Supported PR events are signature-verified and delivery-deduplicated. Installation tokens are minted per job and not persisted. Private repositories and draft PRs are excluded. New captured commits create a new report; repeated deliveries for the same commits reuse the job. GitHub checks use a neutral conclusion and link to the initiating maintainer’s authenticated report. Report owners can grant individual GitHub users access using Reviewer handoff. Every recipient must also have current repository access through the NodeDots App. Access can be revoked and expires with the report.

Turning automation off prevents queued automatic jobs from proceeding. Uninstalling/removing repository access prevents token issuance or source access. The app never executes repository code or applies fixes.

## Deployment and local development

Apply `0004_workspace.sql` `0005_job_leases.sql`, and `0006_shipping.sql` locally and remotely, create `nodedots-reviews`, configure secrets, deploy the consumer, then deploy the main app. Use `npx wrangler deploy --config wrangler.workspace.jsonc` for the consumer.

Plain `next dev` runs the same persisted job after the response using Next.js `after`, so local reviews work without a separate consumer. Restarting the dev server can interrupt these local callbacks; production uses the durable queue instead.

For local queue integration, build the app and run both Worker configurations in one Wrangler process: `npx wrangler dev -c wrangler.jsonc -c wrangler.workspace.jsonc --persist-to .wrangler/state`. Use a local consumer configuration pointing `NODEDOTS_APP_URL` to the primary Worker’s local address and provide matching local runner secrets.

References: [Cloudflare Queues configuration](https://developers.cloudflare.com/queues/configuration/configure-queues/), [local queue development](https://developers.cloudflare.com/queues/configuration/local-development/), [GitHub App authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app).

## Shipping setup and readiness

Shipping setup configures critical path prefixes, exact required CI names, expected GitHub reviewers, observation acknowledgment policy, and team release practices. Only repository administrators or maintainers can change this shared policy. Repository writers can save a change-intent brief for a real PR: outcome, acceptance criteria, and constraints. Concurrent policy/brief changes require a reload instead of silently overwriting another editor.

Every retained review shows separate freshness, coverage, unknowns, acknowledgment, CI, reviewer, and release-preparation signals. CI check runs and commit statuses come from GitHub for the report's pinned head. Neutral, skipped, failed, pending, and unavailable remain distinct. Missing or ambiguous required check names are unavailable. Up to 500 check runs, 100 commit statuses, and 100 GitHub reviews are retrieved; limits are visible. A truncated review history cannot establish approval. Expected approvals must match the reviewed head. Head or base changes make the report stale; API failure makes freshness unavailable.

The pre-ship checklist includes tests, documentation, rollout/recovery plans, analysis next steps, configured release practices, relevant migration/configuration/critical paths, and intent criteria. Done and not-applicable assessments require an evidence note or reason. These are human assessments, not executed tests. Decisions belong to one report and do not transfer to new commits. Acknowledgment includes accepted, dismissed, fixed, or intentional decisions and does not establish resolution.

Reviewer handoffs can be copied or downloaded as text. They include commit identity, CI snapshot time, consequences and source evidence, unknowns, intent, and release assessments. No external message is sent. Owners grant named GitHub users access and can revoke it. Shared reports appear in the recipient's retained history only while both the grant and repository authorization remain valid. Other report history remains private.

Policies and briefs are encrypted in D1 and persist until replaced or cleared in Shipping setup; empty fields clear their content. Shipping assessment notes are encrypted; actor identifiers, statuses, opaque item keys, and sharing grants are stored for access/audit. Assessment events and grants cascade-delete with expired reports at the existing maintenance pass. Repository uninstall prevents access but does not automatically erase retained policy/brief records.
