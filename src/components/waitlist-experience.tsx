import { CompactAnalysis } from "./compact-analysis";
import { ClarityFooter, ClarityHeader, ClarityHero, FindingLegend } from "./clarity-shared";
import { scenarioCaptions } from "@/lib/marketing-copy";
export function WaitlistExperience() {
  return <div className="wl-page clarity-page"><div className="wl-glow" aria-hidden="true" /><ClarityHeader compact />
    <main id="main"><ClarityHero compact /><section className="clarity-section compact-expectations" aria-labelledby="expectations-title"><h2 id="expectations-title">What you&apos;re signing up for</h2><ul><li>A review of what a pull request breaks, forgets, or leaves untested.</li><li>Early access starting with GitHub pull requests.</li><li>One email when early access opens.</li></ul></section>
      <section className="clarity-section compact-example" id="connected" aria-labelledby="compact-title"><h2 id="compact-title">See it catch something</h2><p className="scenario-caption">{scenarioCaptions.auth}</p><CompactAnalysis /><FindingLegend /></section>
    </main><ClarityFooter /></div>;
}
