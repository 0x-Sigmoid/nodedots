import type { Metadata } from "next";
import { NodeDotsLanding } from "@/components/nodedots-landing";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Get early access to NodeDots Code. See what your pull request affects, misses, and conflicts with.",
  alternates: { canonical: "/waitlist" },
};

export default function WaitlistPage() {
  return <NodeDotsLanding waitlistScope />;
}
