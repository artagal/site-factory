import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter, slugifyHeading } from "./markdown";
import { getRepoRoot } from "./repo-root";
import type { Faq } from "./seo";

const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);

export type ContentEntry = {
  body: string;
  canonicalPath: string;
  contentType: string;
  description: string;
  excerpt: string;
  faqs: Faq[];
  filePath: string;
  headings: ContentHeading[];
  href: string;
  modifiedDate: string;
  publishedDate: string;
  rawFrontmatter: Record<string, unknown>;
  readingMinutes: number;
  segments: string[];
  secondaryKeywords: string[];
  site: string;
  slug: string;
  status: string;
  targetKeyword: string;
  title: string;
  wordCount: number;
};

export type ContentHeading = {
  depth: 2 | 3;
  id: string;
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

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim())
  );
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

export function calculateReadingMinutes(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return Math.max(1, Math.ceil(words.length / 220));
}

export function createExcerpt(markdown: string, fallback: string) {
  const firstParagraph =
    markdown
      .split(/\r?\n\r?\n/)
      .map((block) => block.replace(/^#+\s*/, "").trim())
      .find((block) => block && !block.startsWith("- ")) ?? fallback;

  return firstParagraph.length > 180 ? `${firstParagraph.slice(0, 177).trim()}...` : firstParagraph;
}

export function extractContentHeadings(markdown: string): ContentHeading[] {
  const headingCounts = new Map<string, number>();

  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const match = /^(##|###)\s+(.+)$/.exec(line.trim());

      if (!match) {
        return null;
      }

      const title = match[2].replace(/[*_`]/g, "").trim();
      const baseId = slugifyHeading(title);
      const currentCount = headingCounts.get(baseId) ?? 0;
      headingCounts.set(baseId, currentCount + 1);

      return {
        depth: match[1] === "##" ? 2 : 3,
        id: currentCount ? `${baseId}-${currentCount + 1}` : baseId,
        title
      } satisfies ContentHeading;
    })
    .filter((heading): heading is ContentHeading => Boolean(heading));
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
      const description = asString(parsed.data.description, "Local Site Factory content draft.");
      const wordCount = parsed.body
        .replace(/```[\s\S]*?```/g, " ")
        .split(/\s+/)
        .filter(Boolean).length;

      return {
        body: parsed.body,
        canonicalPath: asString(parsed.data.canonicalPath, `/content/${segments.join("/")}`),
        contentType: asString(parsed.data.contentType, "draft"),
        description,
        excerpt: createExcerpt(parsed.body, description),
        faqs: asFaqs(parsed.data.faqs),
        filePath,
        headings: extractContentHeadings(parsed.body),
        href: `/content/${segments.join("/")}`,
        modifiedDate: asString(parsed.data.modifiedDate, ""),
        publishedDate: asString(parsed.data.publishedDate, ""),
        rawFrontmatter: parsed.data,
        readingMinutes: calculateReadingMinutes(parsed.body),
        segments,
        secondaryKeywords: asStringArray(parsed.data.secondaryKeywords),
        site,
        slug,
        status: asString(parsed.data.status, "draft"),
        targetKeyword: asString(parsed.data.targetKeyword, ""),
        title,
        wordCount
      };
    })
    .sort((a, b) => a.href.localeCompare(b.href));
}

export function getContentEntryBySegments(segments: string[]) {
  const normalized = segments.join("/");
  return getContentEntries().find((entry) => entry.segments.join("/") === normalized);
}
