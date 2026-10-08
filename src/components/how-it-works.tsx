import { ImpactReportMock } from "./impact-report-mock";
export function HowItWorks() {
  return <section id="how-it-works" className="clarity-section how-it-works" aria-labelledby="how-title"><div><p className="clarity-kicker">From pull request to review</p><h2 id="how-title">How it works</h2>
    <ol className="how-steps"><li><h3>Connect a GitHub repository.</h3><p>Give NodeDots the repository context for your review.</p></li><li><h3>Open a pull request as usual.</h3><p>Keep working in GitHub with your team and existing tools.</p></li><li><h3>Get an impact report.</h3><p>A comment on the pull request lists what it affects, what&apos;s missing, what conflicts, and a checklist to review before merging.</p></li></ol>
    <p className="dot-definition">A “dot” is a piece of your system: a file, route, table, test, or setting.</p><p className="clarity-note">This is the planned early-access workflow. The example shows the intended output.</p></div><ImpactReportMock /></section>;
}
