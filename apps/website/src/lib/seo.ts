import type { Metadata } from "next";

export type Faq = {
  answer: string;
  question: string;
};

export type SeoPageType = "article" | "profile" | "website";

export type SeoInput = {
  authors?: string[];
  canonicalBaseUrl?: string;
  canonicalPath?: string;
  description: string;
  image?: string;
  keywords?: string[];
  modifiedTime?: string;
  noIndex?: boolean;
  path: string;
  publishedTime?: string;
  title: string;
  type?: SeoPageType;
};

export const canonicalUrlPlaceholder = "https://gofunmotion.com";
export const defaultOgImage = "/og/gofunmotion-og.svg";

export const faqSchemaPlaceholder = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: []
};

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function absoluteUrl(pathname: string, baseUrl = canonicalUrlPlaceholder) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, normalizeBaseUrl(baseUrl)).toString();
}

export function normalizeBaseUrl(baseUrl = canonicalUrlPlaceholder) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return canonicalUrlPlaceholder;
  }

  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  return withProtocol;
}

export function getCanonicalBaseUrl(
  env: Record<string, string | undefined> = process.env
) {
  return normalizeBaseUrl(
    env.SITE_FACTORY_BASE_URL ??
      env.VERCEL_PROJECT_PRODUCTION_URL ??
      env.VERCEL_URL ??
      canonicalUrlPlaceholder
  );
}

export function buildSeoMetadata({
  authors = [],
  canonicalBaseUrl = getCanonicalBaseUrl(),
  canonicalPath,
  description,
  image = defaultOgImage,
  keywords = [],
  modifiedTime,
  noIndex = false,
  path,
  publishedTime,
  title,
  type = "website"
}: SeoInput): Metadata {
  const canonical = absoluteUrl(canonicalPath ?? path, canonicalBaseUrl);
  const imageUrl = absoluteUrl(image, canonicalBaseUrl);
  const normalizedKeywords = uniqueValues(keywords);
  const openGraphType = type === "article" ? "article" : "website";

  return {
    title,
    description,
    keywords: normalizedKeywords.length ? normalizedKeywords : undefined,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "GoFunMotion",
      type: openGraphType,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors
          }
        : {})
    },
    robots: noIndex
      ? {
          follow: false,
          index: false
        }
      : undefined,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
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

export function createBreadcrumbSchema(
  items: Array<{
    name: string;
    path: string;
  }>,
  baseUrl = canonicalUrlPlaceholder
) {
  if (items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, baseUrl)
    }))
  };
}

export function createArticleSchema({
  author = "Site Factory",
  baseUrl = getCanonicalBaseUrl(),
  dateModified,
  datePublished,
  description,
  path,
  title
}: {
  author?: string;
  baseUrl?: string;
  dateModified?: string;
  datePublished?: string;
  description: string;
  path: string;
  title: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Organization",
      name: author
    },
    dateModified,
    datePublished,
    mainEntityOfPage: absoluteUrl(path, baseUrl)
  };
}

export function createWebPageSchema({
  description,
  path,
  title
}: {
  description: string;
  path: string;
  title: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path)
  };
}

export function createProfilePageSchema({
  description,
  name,
  path
}: {
  description: string;
  name: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name,
    description,
    url: absoluteUrl(path),
    about: {
      "@type": "Thing",
      name,
      description: "Fictional AI model concept."
    }
  };
}

export function createSchemaGraph(items: Array<Record<string, unknown> | null>) {
  const graph = items.filter((item): item is Record<string, unknown> => Boolean(item));

  if (graph.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph.map(({ "@context": _context, ...item }) => item)
  };
}

export function validateSeoFields({
  description,
  path,
  title
}: {
  description: string;
  path: string;
  title: string;
}) {
  const issues: string[] = [];

  if (title.length < 20 || title.length > 70) {
    issues.push("Title should usually be between 20 and 70 characters.");
  }

  if (description.length < 80 || description.length > 170) {
    issues.push("Meta description should usually be between 80 and 170 characters.");
  }

  if (!path.startsWith("/")) {
    issues.push("Canonical path should be root-relative.");
  }

  return issues;
}
