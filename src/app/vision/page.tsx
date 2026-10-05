import type { Metadata } from "next";
import { VisionContent } from "@/components/vision-content";

export const metadata: Metadata = {
  title: "Beyond Code — the wider NodeDots system",
  description:
    "NodeDots starts with code. Explore future directions: Apply, Contracts, Research, Business, Verify, and Decisions.",
  alternates: { canonical: "/vision" },
  openGraph: {
    title: "Beyond Code — the wider NodeDots system",
    description: "One way of thinking. Many places to use it.",
    url: "/vision",
    type: "website",
  },
};

export default function VisionPage() {
  return <VisionContent />;
}
