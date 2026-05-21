import type { Metadata } from "next";

export type Faq = {
  answer: string;
  question: string;
};

export type SeoInput = {
  canonicalBaseUrl?: string;
  description: string;
  path: string;
  title: string;
};

export const canonicalUrlPlaceholder = "https://example.com";

export const faqSchemaPlaceholder = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: []
};

export function absoluteUrl(pathname: string, baseUrl = canonicalUrlPlaceholder) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, baseUrl).toString();
}

export function buildSeoMetadata({
  canonicalBaseUrl = canonicalUrlPlaceholder,
  description,
  path,
  title
}: SeoInput): Metadata {
  const canonical = absoluteUrl(path, canonicalBaseUrl);

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Site Factory",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export function createFaqSchema(faqs: Faq[]) {
  if (faqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}
