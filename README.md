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
- `/waitlist` — dedicated early-access page (shared signup form, same API contract)
- `/vision` — Beyond Code: Apply, Contracts, Research, Business, Verify, Decisions
- `/api/waitlist` — waitlist signup endpoint (same JSON contract as the standalone waitlist app)

Product (gated — see below):

- `/reports` — index of deterministic impact reports (engine output over fixtures)
- `/reports/[id]` — full impact report with evidence, checklist, coverage, and feedback controls

## Product preview gate

Product routes are visible only when `PRODUCT_PREVIEW_ENABLED=1`. Local `.env.local` sets this for
real-time preview during development. Production must leave it unset (or `0`): public visitors to
`/reports/*` are redirected to `/waitlist` instead of seeing work in progress.

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
