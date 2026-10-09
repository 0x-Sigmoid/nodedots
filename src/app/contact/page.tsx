import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { navActions } from "@/config/nav";
import { pageMetadata } from "@/lib/site-metadata";
export const metadata = pageMetadata("/contact", "Contact NodeDots", "Find NodeDots on X, join the conversation, and follow early-access development.");
export default function ContactPage() { return <div className="wl-page clarity-page"><div className="wl-glow" aria-hidden="true" /><Header /><main id="main" className="clarity-section privacy-copy"><h1>Join the conversation.</h1><p>Questions, feedback, or a story about something your pull request missed? Find NodeDots on X at @nodedots.</p><a className="clarity-social-button" href={navActions.social.href} target="_blank" rel="noopener noreferrer">{navActions.social.label}</a><p>A dedicated support email and response policy are to be announced. Join the waitlist to hear when early access opens.</p><a href="/waitlist">Join the waitlist</a></main><Footer /></div>; }
