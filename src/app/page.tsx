import { DeveloperPortfolio } from "@/components/developer-portfolio";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "NodeDots",
  url: "https://nodedots.com",
  image: "https://nodedots.com/nodedots.png",
  jobTitle: "Developer and product builder",
  description:
    "NodeDots builds thoughtful web products for learning, clarity, trust, and practical user experience.",
  sameAs: [
    "https://x.com/nodedots",
    "https://github.com/nodedots",
    "https://discord.com/users/nodedots",
    "https://t.me/nodedots",
  ],
  knowsAbout: [
    "Web product development",
    "User experience",
    "Trust-first interfaces",
    "Product strategy",
    "VennURL",
    "Tabmeet",
    "Accentta",
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
