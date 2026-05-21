import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";
import { getContentEntries } from "../apps/website/src/lib/content-files";
import { getRepoRoot } from "../apps/website/src/lib/repo-root";

type KeywordData = {
  keywords?: Record<
    string,
    {
      primary?: string[];
      secondary?: string[];
    }
  >;
};

export function generateContentCalendar() {
  const repoRoot = getRepoRoot();
  const keywordPath = path.join(repoRoot, "data", "seo-keywords.yml");
  const keywordData = parse(readFileSync(keywordPath, "utf8")) as KeywordData;
  const existingEntries = new Set(getContentEntries().map((entry) => entry.targetKeyword));
  const lines = [
    "# Site Factory Content Calendar",
    "",
    "Local planning draft generated from `data/seo-keywords.yml`.",
    ""
  ];

  Object.entries(keywordData.keywords ?? {}).forEach(([site, groups]) => {
    lines.push(`## ${site}`, "");

    [...(groups.primary ?? []), ...(groups.secondary ?? [])].slice(0, 6).forEach((keyword) => {
      const status = existingEntries.has(keyword) ? "covered" : "candidate";
      lines.push(`- ${keyword} - ${status}`);
    });

    lines.push("");
  });

  const outputDirectory = path.join(repoRoot, "output", "content-calendars");
  const outputPath = path.join(outputDirectory, "site-factory-content-calendar.md");

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(outputPath, lines.join("\n"), "utf8");

  return outputPath;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  console.log(`Generated content calendar at ${generateContentCalendar()}`);
}
