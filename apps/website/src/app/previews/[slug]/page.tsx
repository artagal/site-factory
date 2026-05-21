import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AiModelPortfolioPage,
  AppLandingPage,
  ValidationLandingPage
} from "@/components/templates";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { buildSeoMetadata, createFaqSchema } from "@/lib/seo";
import { getPreviewPage, getPreviewPages } from "@/lib/site-content";

type PreviewRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPreviewPages().map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({
  params
}: PreviewRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPreviewPage(slug);

  if (!page) {
    return {};
  }

  return buildSeoMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: page.href
  });
}

export default async function PreviewPage({ params }: PreviewRouteProps) {
  const { slug } = await params;
  const page = getPreviewPage(slug);

  if (!page) {
    notFound();
  }

  const faqSchema = createFaqSchema(page.faqs);

  return (
    <>
      <SeoJsonLd id={`${page.slug}-faq-schema`} data={faqSchema} />
      {page.template === "ai-model-portfolio-page" ? (
        <AiModelPortfolioPage page={page} />
      ) : page.template === "validation-landing-page" ? (
        <ValidationLandingPage page={page} />
      ) : (
        <AppLandingPage page={page} />
      )}
    </>
  );
}
