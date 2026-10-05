# NodeDots — Connect the dots before you act

Product waitlist for **NodeDots Code**, a verification layer for code changes. It reads a pull request in the
context of the whole repository and reports what the change affects, what it missed, and what now conflicts.

Findings fall into five states: Confirmed, Missing, Conflicting, Uncertain, Action Required.

Product definition lives in `docs/` (plus `overview.md` and `product_strategy.md`), which are the source of truth.
The separate `waitlist/` materials are preserved untouched.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS

## Routes

- `/` — waitlist landing (hero, how it works, illustrative change-review demo, future-directions teaser)
- `/vision` — Beyond Code: Apply, Contracts, Research, Business, Verify, Decisions
- `/api/waitlist` — waitlist signup endpoint (same JSON contract as the standalone waitlist app)

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npx tsc --noEmit
npm run build
git diff --check
```

## Notes

SEO, sitemap, robots, web manifest, JSON-LD, and `llms.txt` are included. Light/dark themes share one
geometry and respect the OS preference with a persistent manual override.
