import { getContentEntries } from "./content-files";
import { absoluteUrl, canonicalUrlPlaceholder } from "./seo";
import { getPreviewPages } from "./site-content";

export type SitemapRoute = {
  changeFrequency: "daily" | "monthly" | "weekly" | "yearly";
  lastModified: string;
  path: string;
  priority: number;
};

export const defaultLastModified =
  process.env.SITE_FACTORY_LASTMOD ?? "2026-05-21T00:00:00.000Z";

export function getFactoryRoutes(lastModified = defaultLastModified): SitemapRoute[] {
  const previewRoutes = getPreviewPages().map((page) => ({
    changeFrequency: "weekly" as const,
    lastModified,
    path: page.href,
    priority: 0.7
  }));
  const contentRoutes = getContentEntries().map((entry) => ({
    changeFrequency: "monthly" as const,
    lastModified,
    path: entry.href,
    priority: entry.contentType.includes("seo") ? 0.65 : 0.55
  }));

  return [
    {
      changeFrequency: "weekly",
      lastModified,
      path: "/",
      priority: 1
    },
    {
      changeFrequency: "weekly",
      lastModified,
      path: "/previews",
      priority: 0.85
    },
    ...previewRoutes,
    ...contentRoutes
  ];
}

export function getAbsoluteFactoryRoutes(baseUrl = canonicalUrlPlaceholder) {
  return getFactoryRoutes().map((route) => ({
    ...route,
    url: absoluteUrl(route.path, baseUrl)
  }));
}
