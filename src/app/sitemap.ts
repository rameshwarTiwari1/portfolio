import type { MetadataRoute } from "next";

import { getArticles, getCaseStudies } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseStudies, articles] = await Promise.all([
    getCaseStudies(),
    getArticles(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, priority: 1, changeFrequency: "monthly" },
    { url: absoluteUrl("/work"), lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: absoluteUrl("/engineering"), lastModified: now, priority: 0.9, changeFrequency: "weekly" },
    { url: absoluteUrl("/about"), lastModified: now, priority: 0.7, changeFrequency: "yearly" },
    { url: absoluteUrl("/contact"), lastModified: now, priority: 0.6, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes,
    ...caseStudies.map((entry) => ({
      url: absoluteUrl(`/work/${entry.slug}`),
      lastModified: now,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...articles.map((entry) => ({
      url: absoluteUrl(`/engineering/${entry.slug}`),
      lastModified: entry.updatedAt
        ? new Date(entry.updatedAt)
        : new Date(entry.publishedAt),
      priority: 0.7,
      changeFrequency: "yearly" as const,
    })),
  ];
}
