import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AiModelPortfolioPage,
  AppLandingPage,
  ValidationLandingPage
} from "../../../components/templates";
import { SeoJsonLd } from "../../../components/seo-json-ld";
import {
  buildSeoMetadata,
  createFaqSchema,
  createProfilePageSchema,
  createSchemaGraph,
  createWebPageSchema
} from "../../../lib/seo";
import { getPreviewPage, getPreviewPages } from "../../../lib/site-content";

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
  const webPageSchema = createWebPageSchema({
    description: page.seo.description,
    path: page.href,
    title: page.seo.title
  });
  const profileSchema =
    page.template === "ai-model-portfolio-page"
      ? createProfilePageSchema({
          description: page.seo.description,
          name: page.name,
          path: page.href
        })
      : null;
  const schemaGraph = createSchemaGraph([webPageSchema, profileSchema, faqSchema]);

  return (
    <>
      <SeoJsonLd id={`${page.slug}-schema-graph`} data={schemaGraph} />
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
