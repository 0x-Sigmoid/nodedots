import { DeveloperPortfolio } from "@/components/developer-portfolio";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "@nodedots",
  alternateName: "NodeDots",
  url: "https://nodedots.com",
  image: "https://nodedots.com/nodedots.png",
  jobTitle: "Developer",
  description:
    "NodeDots is an independent product studio building small tools for trust, clarity, and AI-assisted decisions.",
  sameAs: [
    "https://x.com/nodedots",
    "https://github.com/nodedots",
    "https://discord.com/users/nodedots",
    "https://t.me/nodedots",
  ],
  knowsAbout: [
    "Link trust",
    "Browser decision tools",
    "AI decision support",
    "Practical user experience",
    "VennURL",
    "Tabmeet",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DeveloperPortfolio />
    </>
  );
}
