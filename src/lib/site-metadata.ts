import type { Metadata } from "next";

export const siteUrl = "https://nodedots.com";
export const socialProfile = "https://x.com/nodedots";
export const defaultSocialImage = "/brand/social-card.png";
export const socialImageAlt = "NodeDots: Catch What Your Pull Request Missed. Review GitHub changes before you merge. Early-access waitlist.";

export function pageMetadata(path: string, title: string, description: string, image = defaultSocialImage, socialTitle = title): Metadata {
  return {
    title: { absolute: title }, description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle, description, url: path, siteName: "NodeDots", type: "website", locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: image === defaultSocialImage ? socialImageAlt : "NodeDots vision: Code first. More possibilities in exploration." }],
    },
    twitter: {
      card: "summary_large_image", site: "@nodedots", creator: "@nodedots", title: socialTitle, description,
      images: [{ url: image, alt: image === defaultSocialImage ? socialImageAlt : "NodeDots vision: Code first. More possibilities in exploration." }],
    },
  };
}
