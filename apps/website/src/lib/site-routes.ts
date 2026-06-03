import { blogPosts } from "./blog";
import { categories, cities, listings } from "./deals-data";
import { absoluteUrl, getCanonicalBaseUrl } from "./seo";

export type SitemapRoute = {
  changeFrequency: "daily" | "monthly" | "weekly" | "yearly";
  lastModified: string;
  path: string;
  priority: number;
};

export const defaultLastModified =
  process.env.SITE_FACTORY_LASTMOD ?? "2026-05-23T00:00:00.000Z";

const appRoutes = [
  "/",
  "/find",
  "/deals",
  "/date-night",
  "/friends",
  "/family",
  "/partner",
  "/partner/apply",
  "/pricing",
  "/waitlist",
  "/about",
  "/blog",
  "/privacy",
  "/terms"
];

export function normalizeRoutePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
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
  const routes: SitemapRoute[] = appRoutes.map((path) => ({
    changeFrequency: path === "/" || path === "/find" || path === "/deals" ? "daily" : "weekly",
    lastModified,
    path,
    priority: path === "/" ? 1 : path === "/deals" ? 0.96 : path === "/find" ? 0.76 : 0.75
  }));

  const blogRoutes = blogPosts.map((post) => ({
    changeFrequency: "monthly" as const,
    lastModified,
    path: `/blog/${post.slug}`,
    priority: 0.68
  }));

  const dealRoutes = listings.map((listing) => ({
    changeFrequency: "weekly" as const,
    lastModified,
    path: `/deals/${listing.slug}`,
    priority: listing.featured ? 0.82 : 0.72
  }));

  const cityRoutes = cities.map((city) => ({
    changeFrequency: "weekly" as const,
    lastModified,
    path: `/cities/${city.slug}`,
    priority: city.active ? 0.76 : 0.55
  }));

  const categoryRoutes = categories.map((category) => ({
    changeFrequency: "weekly" as const,
    lastModified,
    path: `/categories/${category.slug}`,
    priority: 0.74
  }));

  return uniqueRoutes([...routes, ...dealRoutes, ...cityRoutes, ...categoryRoutes, ...blogRoutes]);
}

export function getAbsoluteFactoryRoutes(baseUrl = getCanonicalBaseUrl()) {
  return getFactoryRoutes().map((route) => ({
    ...route,
    url: absoluteUrl(route.path, baseUrl)
  }));
}
