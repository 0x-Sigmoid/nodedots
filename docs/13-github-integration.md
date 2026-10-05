# 13 · GitHub Integration Specification

Version: 0.1 · Status: proposed · Owner: Integrations Engineering

## Integration model

Use a GitHub App with selected-repository installation. User sign-in and installation authorization are distinct. Verify returned installation IDs through GitHub and confirm the signed-in actor can bind the account; a callback parameter alone is not authorization.

GitHub App webhooks deliver repository and PR events according to configured permissions. Event-specific permissions must be checked during registration against [GitHub webhook documentation](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps).

## Proposed minimal repository permissions

| Permission | Level | Use |
|---|---|---|
| Metadata | Read | Repository identity and installation scope |
| Contents | Read | Commit-pinned source/tree retrieval |
| Pull requests | Read | Diff, PR metadata, base/head context |
| Checks | Write | Advisory status and report link |

PR comments are deferred, avoiding additional write authority. If comments are introduced, review endpoint-specific permissions, request only the needed increase, and require GitHub installation approval. No source, workflow, deployment, or administration write permission is part of V1. Verify registration and API compatibility with [GitHub's permissions reference](https://github.com/github/docs/blob/main/content/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app.md).

## Subscribed events

- `installation`: created, deleted, suspended, unsuspended.
- `installation_repositories`: added and removed repositories.
- `pull_request`: opened, reopened, synchronize, ready_for_review, closed; relevant metadata edits may schedule intent refresh.
- `push`: invalidate baseline readiness for the selected default branch; does not replace PR event handling.
- `check_run`: supported rerequest action with verified actor/resource; ignore own routine update loops.

Confirm event action names and required permissions with the current [event reference](https://docs.github.com/en/webhooks/webhook-events-and-payloads) before registration.

## Webhook processing

1. Enforce transport and body size limits while preserving the raw body.
2. Validate `X-Hub-Signature-256` HMAC using the configured secret and constant-time comparison.
3. Validate event type and expected installation/repository scope.
4. Persist delivery ID, payload hash, routing metadata, and outbox event atomically.
5. Return success promptly; duplicate delivery IDs are acknowledged without duplicate work.
6. Worker resolves current PR state and captures immutable base/head SHAs.

Unknown supported-shape events are ignored with content-free diagnostics. Database unavailability before durable receipt returns a retryable error. IP restrictions may supplement signature checks; they do not replace cryptographic verification.

## Retrieval and fork behavior

Mint installation-scoped short-lived tokens on demand; never expose them to clients or models. Retrieve files pinned to commits, paginate tree/diff APIs, detect truncation, and fall back to bounded manifest-based retrieval when authorized. Never assume a patch payload contains full context.

Fork PRs are untrusted input. Analyze only source available through authorized GitHub access, never run code, and never broaden installation scope to retrieve inaccessible fork content. Missing fork context produces partial/unsupported status. Do not use privileged Actions execution to fetch or execute the fork.

## Publication and concurrency

Create a NodeDots check for the captured head SHA; include a stable analysis external ID. Update through queued/in-progress/completed states. Completed advisory reports use neutral conclusion regardless of detected findings during beta. Failures distinguish provider/processing failure from findings. NodeDots is not a required merge gate in V1.

Recheck current head and installation access before writing. Reconcile check IDs on ambiguous network outcomes instead of blindly creating another check. Old-head work becomes superseded. No private code excerpts appear in check summaries by default; authenticated reports hold detailed evidence.

## Revocation and rate limits

Suspension pauses retrieval/publication immediately. Removal or uninstall cancels jobs, restricts report access, and schedules deletion. Revalidate access periodically and on authorization failures. Respect rate-limit responses, use bounded retries with jitter, and show dependency delay separately from analysis quality.
