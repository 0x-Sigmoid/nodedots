import type { Metadata } from "next";
import { NodeDotsLanding } from "@/components/nodedots-landing";

export const metadata: Metadata = {
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
    "NodeDots Code reads a pull request in the context of the whole repository and reports what the change affects, what it missed, and what now conflicts.",
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <NodeDotsLanding />
    </>
  );
}
