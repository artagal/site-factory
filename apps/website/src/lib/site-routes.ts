import { blogPosts } from "./blog";
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
  "/challenge",
  "/daily",
  "/categories",
  "/profile",
  "/leaderboard",
  "/waitlist",
  "/about",
  "/blog",
  "/login",
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
    changeFrequency: path === "/" || path === "/daily" ? "daily" : "weekly",
    lastModified,
    path,
    priority: path === "/" ? 1 : path === "/challenge" ? 0.95 : 0.75
  }));

  const blogRoutes = blogPosts.map((post) => ({
    changeFrequency: "monthly" as const,
    lastModified,
    path: `/blog/${post.slug}`,
    priority: 0.68
  }));

  return uniqueRoutes([...routes, ...blogRoutes]);
}

export function getAbsoluteFactoryRoutes(baseUrl = getCanonicalBaseUrl()) {
  return getFactoryRoutes().map((route) => ({
    ...route,
    url: absoluteUrl(route.path, baseUrl)
  }));
}
