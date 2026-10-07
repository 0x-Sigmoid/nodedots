"use client";

import { useState } from "react";
import { Mark } from "./site-header";
import { StateDot, type DotState } from "./state-dot";

const states: Record<DotState, { label: string; meaning: string }> = {
  confirmed: { label: "Confirmed", meaning: "Matches the repo evidence." },
  missing: { label: "Missing", meaning: "An expected piece is absent." },
  conflicting: { label: "Conflicting", meaning: "Two assumptions disagree." },
  uncertain: { label: "Uncertain", meaning: "More evidence is needed." },
  action: { label: "Action required", meaning: "A next step needs completing." },
};

type Finding = {
  name: string;
  state: DotState;
  title: string;
  why: string;
  path: string;
  evidence: string;
  next: string;
};

// Illustrative scenarios drawn from docs/: auth migration impact,
// account-deletion intent gaps, and the role-enum mismatch.
const journeys: { label: string; change: string; nodes: Finding[] }[] = [
  {
    label: "Change authentication",
    change: "Replace Firebase Auth with Clerk",
    nodes: [
      {
        name: "Login",
        state: "confirmed",
        title: "Login uses the new provider",
        why: "The sign-in flow and server verification use the same Clerk identity.",
        path: "app/login/page.tsx:18",
        evidence: "SignIn renders the Clerk sign-in flow.",
        next: "Check the sign-in flow in the preview environment.",
      },
      {
        name: "Sessions",
        state: "confirmed",
        title: "Sessions use the new identity",
        why: "Session checks read the new provider's user ID before serving protected routes.",
        path: "middleware.ts:12",
        evidence: "clerkMiddleware protects authenticated routes.",
        next: "Verify that signed-out requests are redirected.",
      },
      {
        name: "User identity",
        state: "confirmed",
        title: "The user record has been updated",
        why: "New users can be linked to a Clerk ID. Downstream mappings still need to agree.",
        path: "db/schema/users.ts:24",
        evidence: "clerk_id replaces firebase_uid on the user record.",
        next: "Follow this identity into billing and existing customer records.",
      },
      {
        name: "Billing",
        state: "conflicting",
        title: "Billing still expects the old ID",
        why: "The PR switches to Clerk. Stripe customer lookup still uses a Firebase UID, so existing customers may lose their billing link.",
        path: "api/billing/customers.ts:42",
        evidence: "Customer lookup filters by firebase_uid.",
        next: "Map existing Stripe customers to Clerk IDs before merging.",
      },
      {
        name: "Tests",
        state: "missing",
        title: "The customer migration has no test",
        why: "An existing subscriber signing in with a Clerk ID is not covered by the billing tests.",
        path: "tests/billing/customer.test.ts:11",
        evidence: "Fixtures cover Firebase users only.",
        next: "Add a test that preserves the Stripe customer after the identity migration.",
      },
    ],
  },
  {
    label: "Delete an account",
    change: "Remove a user and their account data",
    nodes: [
      {
        name: "Delete button",
        state: "confirmed",
        title: "Deletion requires confirmation",
        why: "The account action asks for confirmation before sending a delete request.",
        path: "app/settings/account.tsx:67",
        evidence: "The confirmation handler calls DELETE /api/account.",
        next: "Check keyboard access to the confirmation flow.",
      },
      {
        name: "API route",
        state: "confirmed",
        title: "The route checks account ownership",
        why: "The delete handler uses the authenticated user, rather than a supplied account ID.",
        path: "api/account/route.ts:29",
        evidence: "auth.userId scopes the delete operation.",
        next: "Verify that one account cannot delete another.",
      },
      {
        name: "User record",
        state: "confirmed",
        title: "Related database rows are removed",
        why: "The transaction removes the user and their linked profile records together.",
        path: "db/users/delete.ts:18",
        evidence: "User and profile deletion run in one transaction.",
        next: "Check the remaining foreign-key relationships.",
      },
      {
        name: "File storage",
        state: "uncertain",
        title: "File cleanup is not established",
        why: "The route deletes database records, but the repo does not establish whether stored uploads are removed by a separate job.",
        path: "api/account/route.ts:46",
        evidence: "The handler calls deleteUser; no storage cleanup call is visible.",
        next: "Trace the cleanup job and verify that it removes the user's uploads.",
      },
      {
        name: "Sessions",
        state: "action",
        title: "Verify active session invalidation",
        why: "A deleted account must stop working in sessions that were already open.",
        path: "lib/auth/sessions.ts:31",
        evidence: "Session revocation is available but is not called by the delete route.",
        next: "Revoke active sessions and verify a previously signed-in browser is rejected.",
      },
    ],
  },
  {
    label: "Add team roles",
    change: "Introduce an editor role for teams",
    nodes: [
      {
        name: "Team settings",
        state: "confirmed",
        title: "Team settings write the role",
        why: "The settings flow passes the selected role to the member update endpoint.",
        path: "app/team/settings.tsx:54",
        evidence: "updateMember sends the role field.",
        next: "Check that only team owners can update another member.",
      },
      {
        name: "Permissions",
        state: "uncertain",
        title: "Editor access needs verification",
        why: "The new role exists, but the repo does not show a complete permission matrix for editor actions.",
        path: "lib/permissions.ts:22",
        evidence: "canEdit checks owner and admin; editor behavior is not defined.",
        next: "Specify the editor permissions and check each protected action.",
      },
      {
        name: "Role schema",
        state: "confirmed",
        title: "The schema accepts editor",
        why: "The member schema includes the role introduced by this PR.",
        path: "db/schema/members.ts:16",
        evidence: "Allowed values are owner, editor, and viewer.",
        next: "Compare these values with the UI and access checks.",
      },
      {
        name: "Role selector",
        state: "conflicting",
        title: "The selector and schema disagree",
        why: "The database accepts editor, but the interface still offers admin. A selection can fail validation or grant the wrong access.",
        path: "components/team/role-select.tsx:9",
        evidence: "Options are owner, admin, and viewer.",
        next: "Align the selector values with the member schema.",
      },
      {
        name: "Tests",
        state: "missing",
        title: "Editor permission tests are missing",
        why: "The new role has no test showing which team actions it can perform.",
        path: "tests/team/permissions.test.ts:14",
        evidence: "Cases cover owner and viewer only.",
        next: "Add allowed and denied action tests for editor.",
      },
    ],
  },
];

const edges = [
  "M90 150C190 150 190 72 300 72",
  "M90 150C190 150 190 228 300 228",
  "M300 72H510",
  "M300 228C405 228 400 72 510 72",
  "M300 228H510",
];
const connectedEdges = [[0, 1], [0, 2], [1, 3, 4], [2, 3], [4]];

/**
 * Interactive change-review concept. Rendered inside the marketing hero flow
 * and as a standalone waitlist-scoped demo page; the copy is identical, the
 * surrounding chrome differs.
 */
export function InteractiveDemo({
  sectionId = "preview",
  title = "See the change in context.",
  concept = "Interactive concept",
}: {
  sectionId?: string;
  title?: string;
  concept?: string;
}) {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(3);
  const [selectionVersion, setSelectionVersion] = useState(0);

  function selectNode(index: number) {
    setSelected(index);
    setSelectionVersion((value) => value + 1);
  }

  const journey = journeys[active];
  const finding = journey.nodes[selected];
  if (!journey || !finding) return null;
  const titleId = `${sectionId}-title`;

  return (
    <section className="preview-section" id={sectionId} aria-labelledby={titleId}>
      <div className="section-heading">
        <h2 id={titleId}>{title}</h2>
        <span className="concept-label">{concept}</span>
      </div>
      <div className="workspace" data-reveal>
        <div className="workspace-bar">
          <span className="workspace-name">
            <Mark /> Change review
          </span>
          <span className="workspace-meta">GitHub pull requests</span>
        </div>
        <div className="scenario-tabs" role="tablist" aria-label="Example pull request">
          {journeys.map((item, index) => (
            <button
              key={item.label}
              role="tab"
              id={`${sectionId}-tab-${index}`}
              aria-controls={`${sectionId}-panel`}
              tabIndex={index === active ? 0 : -1}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? journeys.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + journeys.length) % journeys.length;
                setActive(next);
                setSelected(3);
                setSelectionVersion(0);
                document.getElementById(`${sectionId}-tab-${next}`)?.focus();
              }}
              type="button"
              aria-selected={index === active}
              data-state={index === active ? "active" : "inactive"}
              onClick={() => {
                setActive(index);
                setSelected(3);
                setSelectionVersion(0);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`${sectionId}-panel`} aria-labelledby={`${sectionId}-tab-${active}`}>
          <div className="workspace-body">
            <div className="system-map">
              <div className="map-heading">
                <span>{journey.change}</span>
                <span>Select a dot</span>
              </div>
              <div
                className="graph-nodes"
                role="group"
                aria-label={`${journey.label}: five connected components. Select a component to read its finding and evidence.`}
              >
                <svg className="map-lines" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
                  {edges.map((edge, i) => (
                    <path key={i} d={edge} />
                  ))}
                  {selectionVersion > 0 &&
                    connectedEdges[selected].map((i) => (
                      <path
                        key={`${selectionVersion}-${i}`}
                        d={edges[i]}
                        className={`selected-edge state-${finding.state}`}
                      />
                    ))}
                </svg>
                {journey.nodes.map((node, i) => (
                  <div className="node-position" key={node.name}>
                    <button
                      className={`graph-node ${i === selected ? `selected state-${node.state}` : ""}`}
                      onClick={() => selectNode(i)}
                      aria-pressed={i === selected}
                      title="Show finding"
                      type="button"
                    >
                      <StateDot state={node.state} />
                      <span>{node.name} </span>
                      <small>{states[node.state].label}</small>
                    </button>
                  </div>
                ))}
              </div>
              <p className="map-note">One pull request. The connected repo.</p>
            </div>
            <aside className="finding" aria-label="Selected component finding" aria-live="polite">
              <span className={`finding-state state-${finding.state}`}>
                <StateDot state={finding.state} />
                {states[finding.state].label}
              </span>
              <span className="finding-component">{finding.name}</span>
              <h3>{finding.title}</h3>
              <p>{finding.why}</p>
              <div className="evidence">
                <span className="detail-label">Evidence</span>
                <code>{finding.path}</code>
                <p>{finding.evidence}</p>
              </div>
              <div className="finding-action">
                <span className="detail-label">Suggested next step</span>
                <p>{finding.next}</p>
              </div>
              <span className="finding-disclaimer">Illustrative finding · Product in development</span>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
