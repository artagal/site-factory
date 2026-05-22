import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, FileText, Search } from "lucide-react";
import { MarkdownPreview } from "../../../components/markdown-preview";
import { SeoJsonLd } from "../../../components/seo-json-ld";
import {
  buildSeoMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  createFaqSchema,
  createProfilePageSchema,
  createSchemaGraph,
  createWebPageSchema
} from "../../../lib/seo";
import { getContentEntries, getContentEntryBySegments } from "../../../lib/content-files";

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
    canonicalPath: entry.canonicalPath,
    title: entry.title,
    description: entry.description,
    keywords: [entry.targetKeyword, ...entry.secondaryKeywords],
    modifiedTime: entry.modifiedDate || undefined,
    path: entry.href,
    publishedTime: entry.publishedDate || undefined,
    type: entry.contentType.includes("blog")
      ? "article"
      : entry.contentType.includes("model")
        ? "profile"
        : "website"
  });
}

export default async function ContentPreviewPage({ params }: ContentRouteProps) {
  const { slug } = await params;
  const entry = getContentEntryBySegments(slug);

  if (!entry) {
    notFound();
  }

  const faqSchema = createFaqSchema(entry.faqs);
  const articleSchema = entry.contentType.includes("blog")
    ? createArticleSchema({
        dateModified: entry.modifiedDate || undefined,
        datePublished: entry.publishedDate || undefined,
        description: entry.description,
        path: entry.canonicalPath,
        title: entry.title
      })
    : null;
  const profileSchema = entry.contentType.includes("model")
    ? createProfilePageSchema({
        description: entry.description,
        name: entry.title,
        path: entry.canonicalPath
      })
    : null;
  const webPageSchema = createWebPageSchema({
    description: entry.description,
    path: entry.canonicalPath,
    title: entry.title
  });
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Content", path: "/previews" },
    { name: entry.title, path: entry.href }
  ]);
  const schemaGraph = createSchemaGraph([
    webPageSchema,
    articleSchema,
    profileSchema,
    faqSchema,
    breadcrumbSchema
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <SeoJsonLd id={`${entry.slug}-schema-graph`} data={schemaGraph} />
      <Link
        href="/previews"
        className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to previews
      </Link>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft md:p-9">
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
            <span className="rounded-lg bg-paper px-3 py-2">{entry.readingMinutes} min read</span>
            {entry.targetKeyword ? (
              <span className="rounded-lg bg-paper px-3 py-2">{entry.targetKeyword}</span>
            ) : null}
          </div>
          <MarkdownPreview markdown={entry.body} />
        </article>
        <aside className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">
            Draft metadata
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <Clock3 aria-hidden="true" className="mt-0.5 shrink-0 text-mint" size={18} />
              <div>
                <dt className="font-black text-ink">Reading time</dt>
                <dd className="mt-1 text-ink/66">
                  {entry.readingMinutes} minutes, {entry.wordCount} words
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Search aria-hidden="true" className="mt-0.5 shrink-0 text-skyline" size={18} />
              <div>
                <dt className="font-black text-ink">SEO focus</dt>
                <dd className="mt-1 text-ink/66">
                  {entry.targetKeyword || "Add target keyword"}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText aria-hidden="true" className="mt-0.5 shrink-0 text-brass" size={18} />
              <div>
                <dt className="font-black text-ink">Canonical path</dt>
                <dd className="mt-1 break-words text-ink/66">{entry.canonicalPath}</dd>
              </div>
            </div>
          </dl>
          {entry.secondaryKeywords.length ? (
            <div className="mt-5 border-t border-ink/10 pt-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/54">
                Secondary keywords
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.secondaryKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-lg bg-paper px-3 py-2 text-xs font-bold text-ink/64">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {entry.headings.length ? (
            <nav className="mt-5 border-t border-ink/10 pt-5" aria-label="Draft outline">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/54">
                Outline
              </p>
              <ol className="mt-3 space-y-2">
                {entry.headings.map((heading) => (
                  <li key={heading.id} className={heading.depth === 3 ? "pl-3" : ""}>
                    <a
                      href={`#${heading.id}`}
                      className="block rounded-lg px-2 py-1 text-sm font-bold leading-5 text-ink/66 hover:bg-paper hover:text-ink"
                    >
                      {heading.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
