# NodeDots licensing policy

Adopted: 10 October 2026.
SPDX identifier: `Apache-2.0`.

## Decision

NodeDots uses the unmodified Apache License, Version 2.0, in the root
[LICENSE](../LICENSE). Attribution is recorded in [NOTICE](../NOTICE).

Apache 2.0 fits a developer tool intended for community adoption, inspectable
analysis, and commercial use. Its explicit contributor patent grant is useful
for software integrations, and its permissive terms support a paid hosted
service alongside an open-source project.

This is a permissive license, not a requirement that competing hosted services
publish their changes. Commercial forks and privately modified versions are
permitted, subject to the license's conditions. This tradeoff is intentional.

## Scope

The license applies to original NodeDots code and documentation in this
repository unless an individual file or directory explicitly specifies
another license. There is no existing core/enterprise licensing split: current
first-party marketing, application, engine, and integration code here share
the same Apache 2.0 license.

Third-party code, dependencies, fonts, icons, and logos retain their original
licenses and notices. Do not replace those notices or present their authors'
work as newly licensed by NodeDots. Existing examples include
`waitlist/vendor/shadcn-tailwind-4.13.0.LICENSE.md` and
`waitlist/build/sites-vite-plugin.LICENSE`.

Apache 2.0 does not grant general trademark rights. NodeDots names and marks,
and third-party product names and marks, are subject to the license's trademark
provision and any applicable separate permissions. No affiliation or endorsement
is implied.

The source-code license does not change ownership of customer repository
content, waitlist records, private reports, or other user data. Hosted-service
privacy and commercial terms remain separate.

## Contributions and distribution

Original contributions intentionally submitted for inclusion are covered by
Apache 2.0's contribution provision unless explicitly stated otherwise.
Contributors must have the right to submit their work under those terms.
Identify third-party material and retain its notices.

When distributing the licensed work, follow the license's requirements,
including providing the license, retaining relevant notices, carrying forward
applicable NOTICE attribution, and identifying modified files. The complete
LICENSE text controls over this summary.

## Commercial direction

NodeDots may charge for managed hosting, operational convenience, support,
shared workflows, and future commercial features. A license grant is not a
promise that the NodeDots hosted service is free or that planned features
already exist. Public pricing remains to be announced.

Any future proprietary component needs its own explicit licensing boundary
before publication; this policy does not reserve existing repository code as
proprietary. Recipients of Apache-licensed releases retain the rights granted
by that license.

`package.json` remains `private: true` to prevent accidental npm publication;
that package-management setting does not change its Apache 2.0 license.

## Authoritative references

- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Apache licensing FAQ](https://www.apache.org/foundation/license-faq.html)
