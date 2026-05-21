import { parse } from "yaml";

export type ParsedMarkdown = {
  body: string;
  data: Record<string, unknown>;
};

export function parseFrontmatter(source: string): ParsedMarkdown {
  if (!source.startsWith("---")) {
    return {
      body: source.trim(),
      data: {}
    };
  }

  const closingMarker = source.indexOf("\n---", 3);

  if (closingMarker === -1) {
    return {
      body: source.trim(),
      data: {}
    };
  }

  const frontmatter = source.slice(3, closingMarker).trim();
  const body = source.slice(closingMarker + 4).trim();
  const data = parse(frontmatter) as Record<string, unknown> | null;

  return {
    body,
    data: data ?? {}
  };
}
