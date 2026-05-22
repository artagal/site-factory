import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getRepoRoot } from "../apps/website/src/lib/repo-root";
import {
  absoluteUrl,
  getCanonicalBaseUrl
} from "../apps/website/src/lib/seo";
import {
  getFactoryRoutes,
  normalizeRoutePath,
  type SitemapRoute
} from "../apps/website/src/lib/site-routes";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildSitemapXml(
  routes: SitemapRoute[],
  baseUrl = getCanonicalBaseUrl()
) {
  const normalizedRoutes = [...routes]
    .map((route) => ({
      ...route,
      path: normalizeRoutePath(route.path)
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const urls = normalizedRoutes
    .map((route) => {
      const location = absoluteUrl(route.path, baseUrl);

      return [
        "  <url>",
        `    <loc>${escapeXml(location)}</loc>`,
        `    <lastmod>${route.lastModified}</lastmod>`,
        `    <changefreq>${route.changeFrequency}</changefreq>`,
        `    <priority>${route.priority.toFixed(2)}</priority>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>"
  ].join("\n");
}

export function generateSitemap() {
  const repoRoot = getRepoRoot();
  const baseUrl = getCanonicalBaseUrl();
  const routes = getFactoryRoutes();
  const xml = buildSitemapXml(routes, baseUrl);
  const publicDirectory = path.join(repoRoot, "apps", "website", "public");
  const outputDirectory = path.join(repoRoot, "output", "generated-pages");

  mkdirSync(publicDirectory, { recursive: true });
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(path.join(publicDirectory, "sitemap.xml"), xml, "utf8");
  writeFileSync(path.join(outputDirectory, "sitemap.xml"), xml, "utf8");

  return {
    path: path.join(publicDirectory, "sitemap.xml"),
    routeCount: routes.length
  };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const result = generateSitemap();
  console.log(`Generated ${result.routeCount} sitemap routes at ${result.path}`);
}
