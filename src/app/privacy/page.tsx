import type { Metadata } from "next";
import { ClarityFooter, ClarityHeader } from "@/components/clarity-shared";
export const metadata: Metadata = { title: "Waitlist privacy", alternates: { canonical: "/privacy" } };
export default function PrivacyPage() {
  return <div className="wl-page clarity-page"><ClarityHeader external /><main className="clarity-section privacy-copy"><h1>Waitlist privacy</h1><p>Joining the waitlist saves your email address, signup time, and consent so NodeDots can notify you when early access opens.</p><p>Signups are stored in Cloudflare D1. Resend sends the signup confirmation email. Emails include an unsubscribe link that lets you remove your signup.</p><p>Hashed request identifiers help limit automated abuse. The waitlist does not connect to repositories or read your code.</p><h2>Details to be announced</h2><p>Waitlist retention, the operator and privacy contact, and the full product policy for code processing, providers, storage, deletion, and security: To be announced before repository access opens.</p><a href="/waitlist">Back to the waitlist</a></main><ClarityFooter /></div>;
}
