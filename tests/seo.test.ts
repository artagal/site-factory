import { describe, expect, it } from "vitest";
import { absoluteUrl, buildSeoMetadata, createFaqSchema } from "../apps/website/src/lib/seo";

describe("SEO helpers", () => {
  it("builds canonical and OpenGraph metadata", () => {
    const metadata = buildSeoMetadata({
      canonicalBaseUrl: "https://site-factory.test",
      description: "A local preview page for Site Factory tests.",
      path: "/previews/work-organizer",
      title: "Work Organizer Preview"
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://site-factory.test/previews/work-organizer"
    );
    expect(metadata.openGraph?.title).toBe("Work Organizer Preview");
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
});
