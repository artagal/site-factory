import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildSeoMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  createFaqSchema,
  validateSeoFields
} from "../apps/website/src/lib/seo";

describe("SEO helpers", () => {
  it("builds canonical and OpenGraph metadata", () => {
    const metadata = buildSeoMetadata({
      canonicalBaseUrl: "https://site-factory.test",
      description: "A local preview page for Site Factory tests.",
      keywords: ["site factory", "site factory"],
      path: "/previews/work-organizer",
      title: "Work Organizer Preview"
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://site-factory.test/previews/work-organizer"
    );
    expect(metadata.openGraph?.title).toBe("Work Organizer Preview");
    expect(metadata.keywords).toEqual(["site factory"]);
  });

  it("normalizes absolute URLs", () => {
    expect(absoluteUrl("previews", "https://example.test")).toBe("https://example.test/previews");
  });

  it("creates FAQ schema only when FAQs exist", () => {
    expect(createFaqSchema([])).toBeNull();
    expect(
      createFaqSchema([
        {
          question: "Question?",
          answer: "Answer."
        }
      ])
    ).toMatchObject({
      "@type": "FAQPage"
    });
  });

  it("creates article and breadcrumb schema", () => {
    expect(
      createArticleSchema({
        description: "An article description.",
        path: "/content/example",
        title: "Example Article"
      })
    ).toMatchObject({
      "@type": "Article",
      headline: "Example Article"
    });

    expect(createBreadcrumbSchema([{ name: "Home", path: "/" }])).toMatchObject({
      "@type": "BreadcrumbList"
    });
  });

  it("validates basic SEO field lengths", () => {
    expect(
      validateSeoFields({
        description:
          "This description is long enough to satisfy the local Site Factory metadata audit rule.",
        path: "/example",
        title: "A Useful Example Page Title"
      })
    ).toEqual([]);
  });
});
