import { describe, expect, it } from "vitest";
import { getContentEntries } from "../apps/website/src/lib/content-files";
import { getPreviewPages } from "../apps/website/src/lib/site-content";

describe("Site Factory content", () => {
  it("registers the requested preview pages", () => {
    const slugs = getPreviewPages().map((page) => page.slug);

    expect(slugs).toEqual(["work-organizer", "contactor", "gofunmotion", "beauty-drop"]);
  });

  it("loads sample MDX content", () => {
    const entries = getContentEntries();
    const hrefs = entries.map((entry) => entry.href);

    expect(hrefs).toContain(
      "/content/work-organizer/blog/how-to-organize-work-without-another-spreadsheet"
    );
    expect(hrefs).toContain("/content/gofunmotion/models/mia-carter");
    expect(entries.every((entry) => entry.title.length > 0)).toBe(true);
    expect(entries.every((entry) => entry.readingMinutes >= 1)).toBe(true);
    expect(entries.every((entry) => entry.canonicalPath.startsWith("/"))).toBe(true);
  });
});
