import { WaitlistExperience } from "@/components/waitlist-experience";
import { clarityDescription } from "@/lib/marketing-copy";
import { pageMetadata } from "@/lib/site-metadata";
import { SiteStructuredData } from "@/components/site-structured-data";

const title = "NodeDots Code Waitlist | Early Access";
export const metadata = pageMetadata("/waitlist", title, clarityDescription);
export default function WaitlistPage() {
  return <><SiteStructuredData path="/waitlist" title={title} /><WaitlistExperience /></>;
}
