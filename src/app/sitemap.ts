import type { MetadataRoute } from "next";
import { notes } from "@/lib/notes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://nodedots.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...notes.map((note) => ({
      url: `https://nodedots.com/notes/${note.slug}`,
      lastModified: new Date(note.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
