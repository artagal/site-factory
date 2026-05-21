import { describe, expect, it } from "vitest";
import { buildRobotsTxt } from "../scripts/generate-robots";
import { buildSitemapXml } from "../scripts/generate-sitemap";

describe("generation scripts", () => {
  it("creates sitemap XML from local routes", () => {
    const xml = buildSitemapXml(
      [
        {
          changeFrequency: "weekly",
          lastModified: "2026-05-21T00:00:00.000Z",
          path: "///",
          priority: 1
        }
      ],
      "https://site-factory.test"
    );

    expect(xml).toContain("<loc>https://site-factory.test/</loc>");
    expect(xml).toContain("<priority>1.00</priority>");
  });

  it("creates robots.txt with a sitemap pointer", () => {
    const robots = buildRobotsTxt("https://site-factory.test");

    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Sitemap: https://site-factory.test/sitemap.xml");
  });
});
