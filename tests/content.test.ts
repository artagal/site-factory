import { describe, expect, it } from "vitest";
import { getContentEntries } from "../apps/website/src/lib/content-files";
import { getFactoryRoutes } from "../apps/website/src/lib/site-routes";
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

  it("registers BeautyDrop routes for sitemap generation", () => {
    const routes = getFactoryRoutes().map((route) => route.path);

    expect(routes).toContain("/beauty-drop");
    expect(routes).toContain("/beauty-drop/deals");
    expect(routes).toContain("/beauty-drop/pros");
  });
});
