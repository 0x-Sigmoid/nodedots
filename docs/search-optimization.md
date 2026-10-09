# NodeDots search and sharing implementation

## What is implemented

- Unique page titles, descriptions, and absolute canonical URLs for home,
  waitlist, vision, and privacy.
- Matching Open Graph and X large-image cards with local 1200 × 630 assets,
  image descriptions, and the official `@nodedots` account.
- Organization, WebSite, SoftwareApplication, and WebPage JSON-LD identities;
  `sameAs` links NodeDots to its X profile. No invented prices, reviews, ratings,
  contact details, certifications, launch date, or offers.
- FAQ JSON-LD uses exactly the same source as the visible FAQ answers.
  It describes content; it does not promise a Google FAQ rich result.
- A sitemap containing only the primary public content URLs: `/`, `/waitlist`,
  `/vision`, and `/privacy`. The alternate `/waitlist/vision` route stays usable
  but canonicalizes to `/vision`, avoiding duplicate indexing signals.
- Removed request-time `lastModified` values. Add per-page modification dates
  only when a real, maintained content-change source exists.
- Robots allows public pages and image assets, and excludes API/report routes.
  Existing broad public-crawler permission is preserved for search and AI
  retrieval bots; no new opt-in training policy is invented.
- Private API/report/email-preference responses have `X-Robots-Tag` exclusions;
  email preferences also retain their page-level noindex directive. Robots
  directives are not access control; existing product-preview gating remains.
- Updated favicon SVG/ICO, PNG fallbacks, Apple touch icon, standard and maskable
  app icons, manifest, and theme-color metadata.
- `llms.txt`, `llms-full.txt`, and `product-facts.md` give a concise factual
  public summary with clear prelaunch and illustrative-example limitations.
- An IndexNow ownership file and `scripts/submit-indexnow.mts` allow one batch
  notification of the four canonical pages after content deployment. The script
  checks the live ownership file first. A successful submission is receipt,
  not confirmation of indexing. Do not run it repeatedly for unchanged content.

## SEO, AIO, and GEO approach

Here, AIO means AI-search optimization and GEO means generative-engine
optimization, not geographic targeting. The implementation focuses on visible,
specific answers, server-rendered content, public crawl access, consistent
entity names, citations to the canonical site, and truthful availability.

`llms.txt` is an optional reader/tool convenience, not a search-engine standard
or a guarantee of indexing, ranking, or AI citations. The site has no hidden
keyword pages, fake reviews, fabricated customer logos, unsupported country
claims, or duplicated landing pages for search manipulation.

Google says the same foundational SEO practices apply to AI features:
[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).
Structured data should match visible content:
[Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).
OpenAI documents separate search and training crawlers:
[OpenAI crawler overview](https://developers.openai.com/api/docs/bots).
URL-change notifications follow the [IndexNow protocol](https://www.indexnow.org/documentation).

## Remaining account-level setup

These require the owner's search-platform accounts; no verification values,
tokens, or account connections were supplied, so no submission is claimed.

1. In Google Search Console, add a Domain property for `nodedots.com`. Add the
   exact verification TXT value Google provides to Cloudflare DNS, then verify.
2. Submit `https://nodedots.com/sitemap.xml`. Inspect the home, waitlist, and
   vision URLs and request indexing through Search Console where appropriate.
3. Add the site to Bing Webmaster Tools (or import the verified Search Console
   property), and submit the same sitemap.
4. Check Cloudflare's AI-crawler/WAF settings and actual crawler requests.
   A public response to a simulated user agent cannot establish that real
   verified crawlers pass every firewall rule.
5. Use Google's Rich Results Test and Search Console after publication. The
   application's JSON-LD is semantically descriptive; not every type or
   prelaunch application qualifies for a Google rich-result feature.
6. Inspect social previews after publication. X and other services may retain
   cached cards until they recrawl; changing metadata does not force refresh.

## Editorial maintenance

- Update the FAQ, product facts, and social copy when launch details are confirmed.
- Keep supported-language and code-handling claims aligned with the actual product.
- Publish concrete examples with evidence instead of generic keyword articles.
- Use content coverage and real search impressions/clicks to guide future pages.
- Add analytics only with an agreed measurement and privacy policy; no tracking
  provider is introduced by this task.

The owner still needs to confirm pricing, date, language/framework coverage,
repository permissions and execution behavior, code/security/retention policies,
waitlist retention, operator identity, and privacy contact.

## Verification and deployment

On 2026-10-08, lint and the Cloudflare production build passed. Browser checks
verified all five public page entry points, canonical/Open Graph/X metadata,
JSON-LD matching visible FAQ answers, crawler-readable HTML, sitemap exclusions,
private-route noindex headers, manifest, every PNG's dimensions, favicon and
machine-readable assets. Mobile title-case headlines remain two lines at 360px,
and signup remains in the first screen. Brand gallery and ZIP downloads were checked.

Deployed Worker version: `87ad363e-e3f4-4625-93d9-94a9f712b8d7`.
IndexNow received the four canonical URLs with HTTP 202; key validation is pending.
This is not confirmation of indexing. X assets and copy are prepared; no X profile
settings or posts were published. Local development was restored at localhost:3000.
