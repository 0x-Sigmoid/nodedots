import { NodeDotsLanding } from "@/components/nodedots-landing";
import { clarityDescription, clarityTitle } from "@/lib/marketing-copy";
import { pageMetadata } from "@/lib/site-metadata";
import { SiteStructuredData } from "@/components/site-structured-data";

export const metadata = pageMetadata("/", clarityTitle, clarityDescription, undefined, "NodeDots — Connect the dots. Before you ship.");

export default function Home() {
  return (
    <>
      <SiteStructuredData faq />
      <NodeDotsLanding />
    </>
  );
}
