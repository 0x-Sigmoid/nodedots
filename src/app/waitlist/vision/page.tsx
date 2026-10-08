import type { Metadata } from "next";
import { VisionContent } from "@/components/vision-content";

export const metadata: Metadata = {
  title: "What's coming next",
  description:
    "NodeDots starts with code. Explore future directions: Apply, Contracts, Research, Business, Verify, and Decisions.",
  alternates: { canonical: "/waitlist/vision" },
  openGraph: {
    title: "What's coming next — NodeDots",
    description: "One way of thinking. Many places to use it.",
    url: "/waitlist/vision",
    type: "website",
  },
};

export default function WaitlistVisionPage() {
  return (
    <VisionContent
      homeHref="/waitlist"
      changeReviewHref={null}
      signupHref="/waitlist#join"
      backHref="/waitlist"
      backLabel="Back to waitlist"
    />
  );
}
