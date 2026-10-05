import type { Metadata } from "next";
import { Mark, SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Get early access to NodeDots Code. One email when early access opens, plus launch updates.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    title: "Join the NodeDots waitlist",
    description: "Connect the dots. Before you ship. Get early access to NodeDots Code.",
    url: "/waitlist",
    type: "website",
  },
};

export default function WaitlistPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader brandHref="/waitlist" links={[{ href: "/waitlist/vision", label: "What's next" }]} />
      <main id="main" className="waitlist-page">
        <p className="product-label">NodeDots Code / Early access</p>
        <h1>Get early access.</h1>
        <p className="waitlist-lead">
          NodeDots reads your pull request against the whole repo and shows what it touched, what it missed,
          and what now conflicts. Leave your email and we&apos;ll write when early access opens.
        </p>
        <div className="waitlist-form-wrap" id="signup">
          <WaitlistForm idPrefix="page" />
        </div>
        <ol className="waitlist-steps">
          <li>
            <strong>You join the list.</strong>
            <span>One stored email, timestamp, and consent record. Nothing else.</span>
          </li>
          <li>
            <strong>We write when early access opens.</strong>
            <span>An invitation, not a drip campaign.</span>
          </li>
          <li>
            <strong>You can leave anytime.</strong>
            <span>Every update carries an unsubscribe option.</span>
          </li>
        </ol>
        <p className="waitlist-demo-link">
          <a className="text-button" href="/waitlist/vision">
            See what&apos;s coming next <span aria-hidden="true">↗</span>
          </a>
        </p>
      </main>
      <footer className="site-footer">
        <div className="footer-identity">
          <a className="brand" href="/waitlist" aria-label="NodeDots waitlist home">
            <Mark />
            <span>NodeDots</span>
          </a>
          <span>Connect the dots before you act.</span>
        </div>
        <div className="footer-links">
          <span>© {new Date().getFullYear()} NodeDots</span>
          <a className="text-button" href="/waitlist/vision">
            What&apos;s next
          </a>
        </div>
      </footer>
    </>
  );
}
