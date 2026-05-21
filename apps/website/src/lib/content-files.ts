import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./markdown";
import { getRepoRoot } from "./repo-root";
import type { Faq } from "./seo";

const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);

export type ContentEntry = {
  body: string;
  contentType: string;
  description: string;
  faqs: Faq[];
  filePath: string;
  href: string;
  rawFrontmatter: Record<string, unknown>;
  segments: string[];
  site: string;
  slug: string;
  status: string;
  targetKeyword: string;
  title: string;
};

function walkFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((item) => {
    const fullPath = path.join(directory, item);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return walkFiles(fullPath);
    }

    return CONTENT_EXTENSIONS.has(path.extname(item)) ? [fullPath] : [];
  });
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Record<string, unknown>;
      const question = asString(candidate.question, "");
      const answer = asString(candidate.answer, "");

      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is Faq => Boolean(item));
}

export function getContentRoot() {
  return path.join(getRepoRoot(), "content", "sites");
}

export function getContentEntries(): ContentEntry[] {
  const contentRoot = getContentRoot();

  return walkFiles(contentRoot)
    .map((filePath) => {
      const raw = readFileSync(filePath, "utf8");
      const parsed = parseFrontmatter(raw);
      const relativePath = path.relative(contentRoot, filePath).replaceAll(path.sep, "/");
      const segments = relativePath.replace(/\.(md|mdx)$/i, "").split("/");
      const slug = segments.at(-1) ?? "draft";
      const title = asString(parsed.data.title, slug.replaceAll("-", " "));
      const site = asString(parsed.data.site, segments[0] ?? "site-factory");

      return {
        body: parsed.body,
        contentType: asString(parsed.data.contentType, "draft"),
        description: asString(parsed.data.description, "Local Site Factory content draft."),
        faqs: asFaqs(parsed.data.faqs),
        filePath,
        href: `/content/${segments.join("/")}`,
        rawFrontmatter: parsed.data,
        segments,
        site,
        slug,
        status: asString(parsed.data.status, "draft"),
        targetKeyword: asString(parsed.data.targetKeyword, ""),
        title
      };
    })
    .sort((a, b) => a.href.localeCompare(b.href));
}

export function getContentEntryBySegments(segments: string[]) {
  const normalized = segments.join("/");
  return getContentEntries().find((entry) => entry.segments.join("/") === normalized);
}
