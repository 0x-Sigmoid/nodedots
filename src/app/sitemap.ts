import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://nodedots.com",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://nodedots.com/vision",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://nodedots.com/waitlist",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://nodedots.com/privacy",
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
