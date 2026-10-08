# NodeDots five-second clarity test

## Four intended answers

1. **What is it?** A pull-request review tool that checks a change against the whole codebase and flags broken assumptions, forgotten work, and missing tests before merging.
2. **Who is it for?** Developers and small teams reviewing GitHub pull requests, especially those shipping quickly or using AI coding agents.
3. **What do I get?** An impact report as a comment on the pull request: affected components, missing work, conflicts, file-and-line evidence, and a before-merging checklist. The demo and report are illustrative; early access is not open yet.
4. **What do I do next?** Enter an email and join the waitlist. A signup confirmation is sent now; one notification follows when early access opens.

Both `/` and `/waitlist` use shared headline, description, audience/output line, and trust copy. The tagline appears in the footer and Open Graph title. The marketing page moves from the problem to an example, workflow/output, audience, FAQ, and final signup. The compact page gives signup expectations and the existing interactive example.

## Owner decisions still required

- Launch date and pricing, including whether early access is free.
- Supported languages and frameworks. The logo strip contains illustrative stack examples, not confirmed compatibility.
- Whether product analysis only reads code, whether anything executes, and the exact GitHub permissions.
- Code-processing policy: storage, retention, deletion, provider handling, security controls and any public security claims.
- Waitlist retention, operator identity, and privacy contact.

These are visibly marked **To be announced** in the FAQ, stack note, and privacy disclosures. Repository specifications remain design proposals, not proof of implemented controls.

## Verification

Browser checks cover both entry points at 360, 390, 768, and 1280 pixels in light and dark, with reduced motion; no horizontal overflow. The mobile headline is two lines and the exact subhead three lines at 360 pixels. The email field and signup button fit on the first screen. Check keyboard FAQ expansion, scenario captions, theme switching, marquee pause/static fallback, metadata, and mocked signup success/close. No real signup emails are sent by these UI checks.

The four answers are intended outcomes. A real five-second comprehension test with first-time visitors is still needed; browser checks cannot establish human comprehension.

Validation completed: lint passed; all 122 existing tests passed; the Cloudflare production build passed. Browser checks also verified the theme toggle, all ten local SVGs, animated marquee pause on hover/focus and its checkbox, reduced-motion static layout, keyboard FAQ expansion, scenario captions, privacy route, and signup confirmation popup with a mocked API response. Human comprehension remains unverified.

Live verification: deployed to `https://nodedots.com` and `https://nodedots.com/waitlist` on 2026-10-08 (Worker version `b4574670-b4f1-4205-b9f9-374416a5452c`). Both public pages passed the same 16 viewport/theme checks, scenario captions, keyboard FAQ, and mocked signup-popup checks without browser errors. Local development was restored at `http://localhost:3000`.
