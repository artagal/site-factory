import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getContentEntries } from "../apps/website/src/lib/content-files";
import { getRepoRoot } from "../apps/website/src/lib/repo-root";
import { validateSeoFields } from "../apps/website/src/lib/seo";
import { getPreviewPages } from "../apps/website/src/lib/site-content";

export type SeoAuditItem = {
  descriptionLength: number;
  href: string;
  issues: string[];
  title: string;
  titleLength: number;
};

function auditItem(title: string, description: string, href: string): SeoAuditItem {
  const issues = validateSeoFields({ title, description, path: href });

  return {
    descriptionLength: description.length,
    href,
    issues,
    title,
    titleLength: title.length
  };
}

export function auditSeoEntries() {
  const previewItems = getPreviewPages().map((page) =>
    auditItem(page.seo.title, page.seo.description, page.href)
  );
  const contentItems = getContentEntries().map((entry) =>
    auditItem(entry.title, entry.description, entry.canonicalPath)
  );

  return [...previewItems, ...contentItems];
}

export function writeSeoAudit() {
  const repoRoot = getRepoRoot();
  const results = auditSeoEntries();
  const issueCount = results.reduce((total, item) => total + item.issues.length, 0);
  const lines = [
    "# Site Factory SEO Audit",
    "",
    `Audited pages: ${results.length}`,
    `Issues found: ${issueCount}`,
    "",
    ...results.flatMap((item) => [
      `## ${item.title}`,
      "",
      `- Path: ${item.href}`,
      `- Title length: ${item.titleLength}`,
      `- Description length: ${item.descriptionLength}`,
      `- Issues: ${item.issues.length ? item.issues.join(" ") : "None"}`,
      ""
    ])
  ];
  const outputDirectory = path.join(repoRoot, "output", "seo-audits");

  mkdirSync(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, "site-factory-seo-audit.md");
  writeFileSync(outputPath, lines.join("\n"), "utf8");

  return {
    issueCount,
    outputPath,
    pageCount: results.length
  };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const result = writeSeoAudit();
  console.log(
    `Audited ${result.pageCount} pages with ${result.issueCount} issues. Report: ${result.outputPath}`
  );
}
