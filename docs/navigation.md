# Navigation

`src/config/nav.ts` owns labels, descriptions, destinations, icons, status badges, groups, and shared navigation text. It drives the desktop dropdowns, mobile accordions, reduced waitlist header, and footer. Edit this file to change navigation copy.

The existing mono mark, glow, theme tokens, and pill buttons are retained. The marketing header adds Product, Use cases, Resources, Docs, Pricing, See an example, and Join the waitlist. The waitlist header has Product, Resources, What's next, and the theme toggle without a competing signup button.

## Items to fill in

| Status | Item | Destination | Work remaining |
| --- | --- | --- | --- |
| Live soon | NodeDots Code | `/#hero-title` | Release the product and confirm supported GitHub workflows before removing the badge. |
| Live soon | Pull request impact reports | `/#how-it-works` | Release working impact reports; current content describes the intended workflow. |
| Live soon | AI code verification | `/#preview` | Release verification; current demo is explicitly illustrative. |
| Planned | Pre-flight CLI | `/product/pre-flight-cli` | Build and document the CLI before publishing install or execution instructions. |
| Planned | Software memory | `/product/software-memory` | Build the memory and history experience. |
| Planned | Why does this file exist? | `/product/why-this-file` | Publish the software-memory workflow when available. |
| Planned | Spot architecture drift | `/product/architecture-drift` | Build and describe architecture drift analysis. |
| TBA | Docs | `/resources/docs` | Publish public setup, permissions, and usage documentation. |
| TBA | Changelog | `/resources/changelog` | Publish actual release notes. |
| TBA | Blog | `/resources/blog` | Publish the first product stories and examples. |
| TBA | Security and data handling | `/resources/security` | Confirm and publish code access, permissions, retention, and security policies. The waitlist privacy page already exists separately. |
| TBA | Pricing | `/pricing` | Confirm plans, amounts, and billing policy. Current copy: “Pricing to be announced. Waitlist members get first access.” |
| TODO | Contact support | `/contact` | Choose a public support email and response policy. The page currently links to the existing @nodedots account rather than inventing an inbox. |

The use-case items for review, AI-generated changes, missing tests, authentication migrations, database changes, API contracts, and dependency analysis are also marked Live soon. Their links lead to existing marketing sections and illustrative examples, not a released application. `status: "live"` identifies an available marketing destination; `liveSoon: true` supplies the product-availability badge.

The database and API links select the existing “Add team roles” example, which includes schema, migration, and route findings. The authentication link selects “Change authentication.” There is no additional integration or dedicated API-contract analyzer behind these examples.

Planned and TBA routes render the shared ComingSoon template with the configured title and description, a Planned badge (plus TBA where applicable), and the existing waitlist form. Future verticals remain on the vision page rather than in the menus. The only social account linked is the existing X account, @nodedots.

The configured `/product/[slug]` and `/resources/[slug]` pages resolve at request time. The current Cloudflare adapter returned 404s for the static-parameter versions; request-time rendering avoids that deployment limitation. Unknown slugs still return a real 404.

## Behavior and verification

- Desktop opens on hover after 120 ms and closes after 200 ms, with a pointer bridge between trigger and panel. Enter/Space toggle; ArrowDown opens and focuses the first link; arrows cycle links; Escape restores trigger focus; Tab out closes without a focus trap.
- Mobile uses one accordion at a time, a sheet below the 64 px header, body-scroll locking, Escape dismissal, route-change cleanup, and focus return. Touch controls are at least 44 px.
- The sticky header changes background and border after 8 px of scroll without changing height. Panels clamp horizontally and animate only opacity and transform; reduced motion disables the animation.
- Unit tests cover config validity, keyboard disclosure behavior, focus return, hover delays, one open panel, mobile scroll locking, route changes, and cleanup. HTTP tests read the actual nav config and verify every internal URL and fragment against a running server. External X is a known existing account, not part of the internal HTTP crawl.
- Browser checks pass at 360, 768, 1024, and 1280 px in light and dark, including panel bounds, header height, skip-link focus, keyboard interaction, mobile sheet size, scroll restoration, and the reduced waitlist header.
- Header plus local dependencies: 5,418 bytes gzipped with React and the existing Next router excluded. No production dependency was added; jsdom is a test-only dependency.
- Production verification: all 22 internal links and fragments pass on `https://nodedots.com`. Browser checks at 360 and 1280 px confirm the menus, planned-page waitlist form, reduced waitlist header, and error-free hydration. Unknown product/resource slugs correctly return 404s. All 154 local tests, lint, and the Cloudflare production build pass.

Run `npm test` and `npm run lint`. To include the real navigation URL checks, start the local app and set `NODEDOTS_NAV_TEST_ORIGIN=http://localhost:3000` before running the tests. Without that variable, the HTTP tests are intentionally skipped so offline unit tests do not require a server.
