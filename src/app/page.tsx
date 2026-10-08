import type { Metadata } from "next";
import { NodeDotsLanding } from "@/components/nodedots-landing";
import { clarityDescription, clarityTitle } from "@/lib/marketing-copy";

export const metadata: Metadata = {
  title: { absolute: clarityTitle },
  description: clarityDescription,
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NodeDots Code",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://nodedots.com",
  slogan: "Connect the dots before you act.",
  description:
    clarityDescription,
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <NodeDotsLanding />
    </>
  );
}
