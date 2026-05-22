import { getContentEntries } from "./content-files";
import { absoluteUrl, getCanonicalBaseUrl } from "./seo";
import { getPreviewPages } from "./site-content";

export type SitemapRoute = {
  changeFrequency: "daily" | "monthly" | "weekly" | "yearly";
  lastModified: string;
  path: string;
  priority: number;
};

export const defaultLastModified =
  process.env.SITE_FACTORY_LASTMOD ?? "2026-05-21T00:00:00.000Z";

const staticFactoryRoutes: SitemapRoute[] = [
  {
    changeFrequency: "weekly",
    lastModified: defaultLastModified,
    path: "/beauty-drop",
    priority: 0.9
  },
  {
    changeFrequency: "weekly",
    lastModified: defaultLastModified,
    path: "/beauty-drop/deals",
    priority: 0.8
  },
  {
    changeFrequency: "weekly",
    lastModified: defaultLastModified,
    path: "/beauty-drop/pros",
    priority: 0.75
  }
];

export function normalizeRoutePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return `/${pathname.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function uniqueRoutes(routes: SitemapRoute[]) {
  const byPath = new Map<string, SitemapRoute>();

  routes.forEach((route) => {
    byPath.set(normalizeRoutePath(route.path), {
      ...route,
      path: normalizeRoutePath(route.path)
    });
  });

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

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

  return uniqueRoutes([
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
    ...staticFactoryRoutes.map((route) => ({
      ...route,
      lastModified
    })),
    ...previewRoutes,
    ...contentRoutes
  ]);
}

export function getAbsoluteFactoryRoutes(baseUrl = getCanonicalBaseUrl()) {
  return getFactoryRoutes().map((route) => ({
    ...route,
    url: absoluteUrl(route.path, baseUrl)
  }));
}
