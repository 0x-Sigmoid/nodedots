# 06 · Information Architecture & Screen Map

Version: 0.1 · Status: proposed · Owner: Design

## Navigation hierarchy

```text
Public
  Product → Documentation → Privacy / Terms / AI disclosure
  Sign in
Application
  Organization switcher
  Overview
  Repositories
    Repository detail
      Index status / Coverage
      Pull requests
        Analysis report
          Finding detail / Evidence / Feedback
  Settings
    Members
    GitHub installation
    Repository configuration
    Usage
    Data and deletion
```

No product-mode selector for Apply, Contracts, or other future modes appears in V1. The initial interface consistently identifies itself as NodeDots Code.

## Proposed routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Product explanation and installation entry | Public |
| `/docs` | Developer help | Public |
| `/legal/privacy`, `/legal/terms`, `/legal/ai` | Published approved policies | Public |
| `/sign-in` | Authentication | Public |
| `/onboarding` | Organization and installation setup | Signed-in |
| `/orgs/:orgId` | Health of indexing and recent analyses | Organization member |
| `/orgs/:orgId/repos` | Selected repositories and readiness | Organization member |
| `/orgs/:orgId/repos/:repoId` | PR list, snapshot status, coverage | Repository-authorized member |
| `/orgs/:orgId/analyses/:analysisId` | Immutable analysis report | Repository-authorized member |
| `/orgs/:orgId/analyses/:analysisId/findings/:findingId` | Deep-linked finding | Same as report |
| `/orgs/:orgId/settings/*` | Membership, configuration, usage, deletion | Owner for mutations |

Web routes and API resource IDs are opaque identifiers. Possession of a link confers no access. A GitHub check link redirects unauthenticated users to sign-in and rechecks membership and repository authorization afterward.

## Page contents and hierarchy

Overview prioritizes installations needing action, indexing failures, and recent current-head reports. Repository detail separates baseline readiness from PR analysis status. Report pages preserve base/head context while navigating findings. Settings group operational configuration separately from destructive deletion controls.

Finding deep links preserve analysis version; they do not silently jump to a new report with different evidence. Latest-analysis links explicitly resolve the current head. Breadcrumbs: Organization → Repository → PR → Analysis → Finding.

## Shared components

Organization selector, repository selector, analysis-state badge, completeness notice, finding card, evidence drawer, relationship path, feedback control, pagination, retry control, and safe error banner. A single dictionary supplies state labels across UI and GitHub publication.

## Search and filtering

V1 filters reports by repository and status and findings by state/severity/disposition. Search is scoped to authorized organization metadata. Full repository semantic search and architecture browsing are deferred.

## Authorization and deleted resources

Server-side checks govern all routes and API reads. Repository restrictions are enforced in addition to organization membership. Deleted or revoked resources return a content-free unavailable page. Cross-tenant guesses produce the same unavailable response as nonexistent IDs. See [security](14-security-and-privacy-specification.md).
