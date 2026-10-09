import { VisionContent } from "@/components/vision-content";
import { pageMetadata } from "@/lib/site-metadata";
// This alternate entry point contains the same vision content; index one canonical URL.
export const metadata = pageMetadata("/vision", "NodeDots Vision | Beyond Code", "Explore future NodeDots directions in applications, contracts, research, business, verification, and decisions. These concepts are in exploration.", "/brand/vision-card.png");
export default function WaitlistVisionPage() { return <VisionContent homeHref="/waitlist" changeReviewHref={null} signupHref="/waitlist#join" backHref="/waitlist" backLabel="Back to waitlist" />; }
