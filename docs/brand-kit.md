# NodeDots brand kit

## Identity

Keep the established NodeDots symbol: two opposing strokes around a central
ring. The SVG paths match the site header. The wordmark is always **NodeDots**.
Use the dark-purple canvas and lemon accent for social presence; keep the
website's existing light and dark themes.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#1a1030` | Dark background and light-theme text |
| Paper | `#fbfafd` | Light background and reversed wordmark |
| Lemon | `#d5ef79` | Symbol and restrained accents |
| Muted | `#b8adc9` | Secondary text on dark assets |

The site uses Geist. Editable SVG assets use Arial/Helvetica fallbacks to remain
self-contained across tools; no font files are bundled with the brand kit.

## Files in `public/brand`

All listed assets include editable `.svg` sources and ready-to-upload `.png` exports.

- `mark-dark`, `mark-light`, `mark-lemon`: transparent symbols, 64 × 64.
- `logo-dark`, `logo-light`: transparent wordmarks, 450 × 100.
- `favicon-16`, `favicon-32`: small browser icons.
- `apple-touch-icon`: 180 × 180.
- `icon-192`, `icon-512`: standard app icons.
- `icon-maskable-512`: 512 × 512, solid background with a safe centered mark.
- `social-card`: 1200 × 630, default Open Graph and X sharing image.
- `vision-card`: 1200 × 630, future-direction sharing image.
- `x-avatar`: 400 × 400, centered symbol with space for circular cropping.
- `x-cover`: 1500 × 500, text kept clear of the lower-left profile avatar.
- `x-pinned-post`: 1200 × 675, image for the pinned post.

Root `public/favicon.svg` and `public/favicon.ico` provide browser fallbacks.
The web manifest references the new matching icons. The old `public/nodedots.png`
is preserved but is no longer the manifest icon.

## Usage

Use light marks on dark backgrounds and dark marks on light backgrounds. Leave
at least one central-ring width of clear space around the visible mark. Do not
stretch, add shadows, rotate, replace the ring, or place text over the mark.

The symbol and name identify NodeDots, not a certification or affiliation with
another product. Third-party stack logos keep their separate attribution.

## Regeneration

Run `node scripts/generate-brand-assets.cjs` with Playwright and Microsoft Edge
available. If Playwright lives outside this project's dependencies, set
`NODEDOTS_PLAYWRIGHT_MODULE` to its installed module path first. Exports are
deterministic browser renders of the editable SVG sources, not AI bitmap edits.

See `docs/x-profile-kit.md` for profile copy and `docs/search-optimization.md`
for search metadata and publishing notes.
