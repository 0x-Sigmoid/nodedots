import { clarityDescription, clarityTitle } from "@/lib/marketing-copy";
import { marketingFaq } from "@/lib/marketing-faq";
import { siteUrl, socialProfile } from "@/lib/site-metadata";

export function SiteStructuredData({ path = "/", title = clarityTitle, description = clarityDescription, faq = false }: { path?: string; title?: string; description?: string; faq?: boolean }) {
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const productId = `${siteUrl}/#nodedots-code`;
  const url = new URL(path, siteUrl).href;
  const graph = [
    { "@type": "Organization", "@id": organizationId, name: "NodeDots", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/brand/icon-512.png`, width: 512, height: 512 }, sameAs: [socialProfile], slogan: "Connect the dots before you act." },
    { "@type": "WebSite", "@id": websiteId, name: "NodeDots", url: siteUrl, inLanguage: "en", publisher: { "@id": organizationId } },
    { "@type": "SoftwareApplication", "@id": productId, name: "NodeDots Code", url: `${siteUrl}/waitlist`, description: clarityDescription, applicationCategory: "DeveloperApplication", operatingSystem: "Web", publisher: { "@id": organizationId } },
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en", isPartOf: { "@id": websiteId }, about: { "@id": productId }, primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}/brand/social-card.png` } },
    ...(faq ? [{ "@type": "FAQPage", "@id": `${url}#faq`, isPartOf: { "@id": `${url}#webpage` }, mainEntity: marketingFaq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }] : []),
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />;
}
