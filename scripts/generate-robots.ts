import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getRepoRoot } from "../apps/website/src/lib/repo-root";
import { absoluteUrl, getCanonicalBaseUrl } from "../apps/website/src/lib/seo";

export function buildRobotsTxt(
  baseUrl = getCanonicalBaseUrl(),
  disallow: string[] = ["/api/", "/drafts/"]
) {
  return [
    "User-agent: *",
    "Allow: /",
    ...disallow.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml", baseUrl)}`,
    ""
  ].join("\n");
}

export function generateRobots() {
  const repoRoot = getRepoRoot();
  const baseUrl = getCanonicalBaseUrl();
  const body = buildRobotsTxt(baseUrl);
  const publicDirectory = path.join(repoRoot, "apps", "website", "public");
  const outputDirectory = path.join(repoRoot, "output", "generated-pages");

  mkdirSync(publicDirectory, { recursive: true });
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(path.join(publicDirectory, "robots.txt"), body, "utf8");
  writeFileSync(path.join(outputDirectory, "robots.txt"), body, "utf8");

  return path.join(publicDirectory, "robots.txt");
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  console.log(`Generated robots.txt at ${generateRobots()}`);
}
