# 19 · Pricing & Entitlement Specification

Version: 0.1 · Status: commercial proposal, not approved pricing · Owner: Product and Finance

## Commercial principle

Charge for useful repository intelligence with understandable limits. Avoid incentives to produce excessive findings. Preserve evidence, uncertainty, security, and feedback quality across every tier. V1 private beta is invite-only and free within configured pilot allowances; paid checkout is deferred.

## Proposed post-beta tiers

| Tier | Repositories | Analyses/month | Concurrent analyses | Intended customer |
|---|---:|---:|---:|---|
| Free | 1 | 30 | 1 | Individual evaluating NodeDots |
| Pro | 5 | 300 | 2 | Small product team |
| Team | 20 | 1,500 | 5 | Growing engineering organization |
| Enterprise | Negotiated | Negotiated | Negotiated | Specialized governance and procurement |

These allowances are hypotheses. Private repositories require the same authorization and processing disclosure as public repositories. Team policy/history and enterprise controls cannot be sold as available until implemented. Monetary prices, currency, taxes, discounts, and overage rates are undecided; approve them after measured cost and willingness-to-pay research.

## Entitlement model

Maintain organization-level plan, effective dates, period, repository allowance, analysis allowance, concurrency, and feature flags. A central server-side entitlement service controls API and scheduler behavior. UI gating alone is insufficient. Overrides identify approver, reason, and expiry. Beta entitlement is a distinct non-billing plan.

An analysis is one eligible repository/PR base-head/config/pipeline evaluation. Reserve one unit atomically before enqueue. Settle on a published completed or meaningful partial report. Release reservation on system failure, cancellation before useful completion, unsupported rejection, or supersession before publication. Track those outcomes separately.

Duplicate webhooks, same-key reuse, infrastructure retry, and publication retry never consume additional units. A deliberate analysis of a new head or changed configuration is a new unit. Pipeline upgrades initiated by NodeDots should not unexpectedly charge customers to repair service errors.

## Period and quota behavior

Proposed free/beta quotas reset on UTC calendar months. Future paid periods follow the billing subscription period. Usage ledgers retain period IDs so changing billing rules does not rewrite history. Repository count covers enabled repositories; pausing stops new analyses but does not silently delete retained reports.

At 80% usage, show an in-product notice. At 100%, pause new analysis requests with a clear next-reset/upgrade explanation. Existing authorized reports remain readable within retention. No automatic paid overage in the initial paid release. Concurrent reservation and settlement must be transaction-safe.

## Billing release prerequisites

Before paid launch define approved prices, supported currency, taxes, invoicing, cancellation, downgrade timing, refunds, proration, failed-payment handling, and consumer/business terms. Signed payment webhooks need deduplication and entitlement reconciliation. Test duplicate events, partial failure, subscription cancellation, and charge disputes. Do not promise advanced controls absent from the roadmap.

## Economics validation

Measure provider cost, GitHub calls, storage, worker time, support time, and false-positive burden by repository size. Model margins under high usage and abuse, not just averages. Repository and analysis ceilings are adjustable only with clear notice and contractual consistency. See [analytics](18-observability-and-analytics.md) and [legal terms](24-privacy-policy-terms-and-ai-disclosure.md).
