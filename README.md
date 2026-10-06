# NodeDots — Connect the dots before you act

Marketing site plus the **NodeDots Code** MVP: a verification layer for code changes. It reads a pull request
in the context of the whole repository and reports what the change affects, what it missed, and what now
conflicts.

Findings fall into five states: Confirmed, Missing, Conflicting, Uncertain, Action Required.

Product definition lives in `docs/` (plus `overview.md` and `product_strategy.md`), which are the source of truth.
The separate `waitlist/` materials are preserved untouched.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest (unit + fixture suites)

## Routes

Public marketing:

- `/` — landing (hero, how it works, illustrative change-review demo, future-directions teaser)
- `/vision` — Beyond Code: Apply, Contracts, Research, Business, Verify, Decisions
- `/waitlist` — dedicated early-access page (shared signup form, same API contract)
- `/waitlist/vision` — What's coming next, scoped to the waitlist (no marketing links, no demo)
- `/api/waitlist` — waitlist signup endpoint (same JSON contract as the standalone waitlist app)

Product (gated — see below):

- `/reports` — index of deterministic impact reports (engine output over fixtures)
- `/reports/[id]` — full impact report with evidence, checklist, coverage, and feedback controls
- `/api/reports/[id]/feedback` — finding dispositions (accepted/dismissed/fixed/intentional), latest-wins

## Human feedback (persisted)

Review clicks write append-only `feedback_events` rows (memory store in zero-setup dev, Postgres
with `DATABASE_URL`); clearing records a `cleared` event rather than deleting history. The viewer
loads dispositions from the API with optimistic updates and a sync-error notice on failure.

## Bounded enrichment (docs/08 steps 5–6, doc 15 gate)

`analyze()` runs heuristic hypothesis patterns by default (billing identity, session
invalidation, migration backfill, destructive-endpoint authorization) and publishes survivors as
`UNCERTAIN` findings — capped at 5, confidence capped (single-span evidence stays low),
deterministic fingerprints win ties, secret-like text redacted, invented paths rejected. Webhook-
adjacent secrets land in Unknown, never asserted. Pass `{ enrichment: false }` for deterministic-
only output. A keyed OpenAI-compatible provider (`llmProvider`) joins through the identical gate;
prompts carry paths and titles only, never file contents, and any failure yields zero candidates.

## Beta hardening

- **Abuse control** — shared hashed-IP fixed-window limiter (`src/lib/rate-limit.ts`): waitlist
  signup 5/10 min (existing), finding reviews 30/10 min. No raw IPs retained.
- **Removal requests** — `DELETE /api/waitlist` unsubscribes idempotently with presence-indistinguishable
  responses. Review the list and purge it when the early-access campaign ends.
- **Retention** — `npm run retention` purges file report rows past `REPORT_RETENTION_DAYS` (default
  90); Postgres deployments run the scheduled `DELETE`s in `src/jobs/retention.ts`
  (`POSTGRES_RETENTION_SQL`).
- **Observability** — single-line JSON logs with delivery/analysis IDs (`src/lib/log.ts`); emails,
  tokens, raw source, and PR bodies are redacted at the boundary, never logged.
- **Eval harness** — `src/eval/eval.test.ts` pins expected rules per fixture and fails on any
  unexpected high-severity finding (false-positive proxy). Thresholds live there, not in unit tests.

## Product preview gate

Product routes are visible only when `PRODUCT_PREVIEW_ENABLED=1`. Local `.env.local` sets this for
real-time preview during development. Production must leave it unset (or `0`): public visitors to
`/reports/*` are redirected to `/waitlist` instead of seeing work in progress.

## GitHub ingestion (dev)

`POST /api/github/webhooks` receives App webhooks per docs/13: raw-body HMAC verification
(`X-Hub-Signature-256`, constant-time), delivery-ID dedupe with prompt acknowledgement, then an
in-process queue drains through snapshot → deterministic engine → persisted report → check-run
payload (neutral beta conclusion, counts-only summary, report link).

Local setup:

```bash
# .env.local (gitignored, dev only)
GITHUB_WEBHOOK_SECRET=local-dev-only-secret
DEV_SNAPSHOT_FIXTURE=env-var
```

Deliveries need real signatures — sign the raw JSON body as `sha256=<hmac>`, or forward real
events with `gh webhook forward --events pull_request --url http://localhost:3000/api/github/webhooks`
(GitHub CLI). Production needs the App webhook secret plus installation-token minting before check
runs can post; without credentials the pipeline records delivery intent and still persists the
report. Persisted analyses land in `.data/reports/` (gitignored) and render at `/reports/[analysis-id]`.

## Live snapshot retrieval

With credentials configured, the pipeline fetches commit-pinned contents instead of fixtures
(`snapshotProviderFromEnv` selects: static token → App minting per installation → dev fixture):

- PR file list (with renames) from the pulls API, contents pinned to base/head SHAs.
- Tree manifest for path resolution plus size pre-checks; bounded test-file context (200 files)
  so `TESTED_BY` associations survive retrieval.
- Fork PRs fetch through the head repository; inaccessible content becomes explicit partial
  scope, never an assumed absence. Unchanged-file contents are not yet retrieved, and the engine
  reports that blindness in coverage/Unknown.
- Rate limits surface as typed errors (`RateLimitedError`) so the queue backs off; auth and
  retryable failures are distinguished per docs/13.

## Postgres (durable ingestion state)

`DATABASE_URL` unset → in-memory outbox + file report store (zero-setup dev, unchanged behavior).
`DATABASE_URL` set → Postgres tables from `src/db/migrations/001_init.sql`
(`webhook_deliveries`, `outbox_events`, `analyses`, `findings`, `finding_evidence`).

```bash
DATABASE_URL=postgres://user:pass@host:5432/nodedots npm run db:migrate
npm test   # pg store suites run against real SQL via in-process PGlite
```

Managed Postgres (Neon/Supabase) recommended per the database decision; both accept the same
`DATABASE_URL`. Saves are idempotent upserts, so retried jobs never double-record. Auth/org tables
(users, memberships, installations) arrive with accounts — every row here already carries
owner/repo scope for that join.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Product routes are previewable locally via `.env.local`.

## Checks

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Notes

SEO, sitemap, robots, web manifest, JSON-LD, and `llms.txt` are included. Light/dark themes share one
geometry and respect the OS preference with a persistent manual override.
