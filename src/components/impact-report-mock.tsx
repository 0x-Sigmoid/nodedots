import { Mark } from "./site-header";
import { StateDot } from "./state-dot";
export function ImpactReportMock() {
  return <article className="impact-comment" aria-labelledby="impact-title"><div className="impact-context"><span>Pull request #184 · Firebase Auth → Clerk</span><span>Illustrative example</span></div>
    <header><Mark /><div><h3 id="impact-title">NodeDots Impact Report</h3><p>Comment on the pull request</p></div></header>
    <ul className="impact-counts" aria-label="Report summary"><li><StateDot state="confirmed" />3 confirmed</li><li><StateDot state="conflicting" />1 conflicting</li><li><StateDot state="missing" />1 missing</li></ul>
    <div className="impact-finding"><h4><StateDot state="conflicting" />Billing still expects the old ID</h4><code>api/billing/customers.ts:42</code><p>Stripe customer lookup uses a Firebase UID. The new login supplies a Clerk ID.</p></div>
    <div className="impact-finding"><h4><StateDot state="missing" />Signed-out redirect test is missing</h4><code>tests/auth/redirect.test.ts:11</code><p>The tests cover signed-in users, but not a signed-out visitor requesting a protected route.</p></div>
    <div className="impact-checklist"><h4>Before merging</h4><ul><li>Map existing Stripe customers to Clerk IDs.</li><li>Add a test for signed-out redirects.</li></ul></div></article>;
}
