import type { Metadata } from "next";
import { WaitlistExperience } from "@/components/waitlist-experience";
import { clarityDescription, clarityTitle } from "@/lib/marketing-copy";

export const metadata: Metadata = {
  title: { absolute: clarityTitle },
  description: clarityDescription,
  alternates: { canonical: "/waitlist" },
};
export default function WaitlistPage() {
  return <WaitlistExperience />;
}
