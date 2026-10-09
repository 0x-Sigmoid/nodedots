import { InteractiveDemo } from "./change-review-demo";
import { ClarityFooter, ClarityHeader, ClarityHero, FindingLegend } from "./clarity-shared";
import { LogoStrip } from "./logo-strip";
import { ProblemStory } from "./problem-story";
import { HowItWorks } from "./how-it-works";
import { Faq } from "./faq";
import { WaitlistForm } from "./waitlist-form";
import { clarityTrust } from "@/lib/marketing-copy";
export function NodeDotsLanding() {
  return <div className="marketing-page wl-page clarity-page"><div className="wl-glow" aria-hidden="true" /><ClarityHeader />
    <main id="main"><ClarityHero /><LogoStrip /><ProblemStory />
      <div className="launch-demo clarity-demo"><InteractiveDemo title="See it catch something" concept="Illustrative example" /><FindingLegend /><p className="demo-caption">Choose a pull request, then select a component to see its evidence and next step.</p></div>
      <HowItWorks /><section className="clarity-section clarity-audience" aria-label="Who NodeDots is for"><div><h2>Who it&apos;s for</h2><p>Developers and small teams who ship with AI coding agents or move fast. Anyone who has been surprised by a side effect after merging.</p></div><div><h2>What it isn&apos;t</h2><p>A code generator or a replacement for tests, linters, or code review.</p><p>It checks the work around the change, so your team and your tools can trust the result.</p></div></section>
      <Faq /><section className="clarity-section clarity-final" aria-labelledby="final-title"><h2 id="final-title">Know what your next change touches.</h2><div className="wl-signup clarity-signup"><WaitlistForm idPrefix="final" /></div><p className="clarity-trust">{clarityTrust}</p></section>
    </main><ClarityFooter /></div>;
}
