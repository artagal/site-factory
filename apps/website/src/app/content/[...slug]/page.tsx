import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { buildSeoMetadata, createFaqSchema } from "@/lib/seo";
import { getContentEntries, getContentEntryBySegments } from "@/lib/content-files";

type ContentRouteProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return getContentEntries().map((entry) => ({
    slug: entry.segments
  }));
}

export async function generateMetadata({
  params
}: ContentRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContentEntryBySegments(slug);

  if (!entry) {
    return {};
  }

  return buildSeoMetadata({
    title: entry.title,
    description: entry.description,
    path: entry.href
  });
}

export default async function ContentPreviewPage({ params }: ContentRouteProps) {
  const { slug } = await params;
  const entry = getContentEntryBySegments(slug);

  if (!entry) {
    notFound();
  }

  const faqSchema = createFaqSchema(entry.faqs);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
      <SeoJsonLd id={`${entry.slug}-faq-schema`} data={faqSchema} />
      <Link
        href="/previews"
        className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to previews
      </Link>
      <article className="mt-8 rounded-lg border border-ink/10 bg-white p-6 shadow-soft md:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
          {entry.contentType}
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
          {entry.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">{entry.description}</p>
        <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink/58">
          <span className="rounded-lg bg-paper px-3 py-2">{entry.site}</span>
          <span className="rounded-lg bg-paper px-3 py-2">{entry.status}</span>
          {entry.targetKeyword ? (
            <span className="rounded-lg bg-paper px-3 py-2">{entry.targetKeyword}</span>
          ) : null}
        </div>
        <MarkdownPreview markdown={entry.body} />
      </article>
    </main>
  );
}
