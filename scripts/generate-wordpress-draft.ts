import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getContentEntries } from "../apps/website/src/lib/content-files";
import { getRepoRoot } from "../apps/website/src/lib/repo-root";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateWordPressDraft() {
  const repoRoot = getRepoRoot();
  const entries = getContentEntries();
  const requestedPath = process.env.CONTENT_PATH;
  const entry =
    entries.find((candidate) => candidate.href === requestedPath) ??
    entries.find((candidate) => candidate.contentType === "seo-blog-post") ??
    entries[0];

  if (!entry) {
    throw new Error("No content entries found for WordPress draft generation.");
  }

  const outputDirectory = path.join(repoRoot, "output", "wordpress-drafts");
  const outputPath = path.join(outputDirectory, `${slugify(entry.title)}.md`);
  const body = [
    "---",
    `title: "${entry.title.replaceAll('"', '\\"')}"`,
    `description: "${entry.description.replaceAll('"', '\\"')}"`,
    `source: "${entry.href}"`,
    'status: "local-wordpress-draft"',
    "---",
    "",
    "<!-- Local WordPress-ready draft. Review manually before publishing. -->",
    "",
    entry.body,
    "",
    "## Suggested WordPress Metadata",
    "",
    `- Slug: ${slugify(entry.title)}`,
    `- Primary keyword: ${entry.targetKeyword || "Add primary keyword"}`,
    `- Source site: ${entry.site}`,
    ""
  ].join("\n");

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(outputPath, body, "utf8");

  return outputPath;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  console.log(`Generated local WordPress draft at ${generateWordPressDraft()}`);
}
