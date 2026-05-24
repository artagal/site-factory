import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Search, Sparkles, Target, Zap } from "lucide-react";
import { LinkButton } from "../../../components/gofunmotion/Button";
import { SeoJsonLd } from "../../../components/seo-json-ld";
import { blogPosts, getBlogPost } from "../../../lib/blog";
import {
  buildSeoMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  createFaqSchema,
  createSchemaGraph
} from "../../../lib/seo";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return {};

  return buildSeoMetadata({
    authors: ["GoFunMotion"],
    description: post.description,
    keywords: [
      post.keyword,
      "things to do today",
      "local activity deals",
      "date night ideas",
      "family activities"
    ],
    path: `/blog/${post.slug}`,
    publishedTime: post.publishedAt,
    title: `${post.title} | GoFunMotion`,
    type: "article"
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const schema = createSchemaGraph([
    createArticleSchema({
      author: "GoFunMotion",
      dateModified: post.publishedAt,
      datePublished: post.publishedAt,
      description: post.description,
      path: `/blog/${post.slug}`,
      title: post.title
    }),
    createBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` }
    ]),
    createFaqSchema(post.faqs)
  ]);

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug && (item.category === post.category || item.keyword !== post.keyword))
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
      <SeoJsonLd data={schema} id={`blog-${post.slug}-schema`} />

      <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-cyan-200" href="/blog">
            <ArrowRight aria-hidden="true" className="rotate-180" size={16} />
            Back to ideas
          </Link>

          <header className="mt-6 rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-5 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                {post.category}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                {post.readTime}
              </span>
            </div>
            <h1 className="mt-5 text-5xl font-black leading-[0.98] text-white md:text-7xl">
              {post.title}
            </h1>
            <p className="mt-5 text-xl leading-8 text-white/68">{post.description}</p>
            <div className="mt-6 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-lime-200">
                <Search aria-hidden="true" size={15} />
                Target search intent
              </p>
              <p className="mt-2 text-sm font-bold text-white/72">{post.keyword}</p>
            </div>
          </header>

          <section className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-black/24 p-5 md:grid-cols-3">
            {post.takeaways.map((takeaway) => (
              <div className="rounded-2xl bg-white/[0.055] p-4" key={takeaway}>
                <CheckCircle2 aria-hidden="true" className="text-lime-300" size={20} />
                <p className="mt-3 text-sm font-bold leading-6 text-white/72">{takeaway}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-8 text-lg leading-8 text-white/72">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-3xl font-black leading-tight text-white">{section.heading}</h2>
                <p className="mt-3">{section.body}</p>
              </section>
            ))}
          </section>

          <section className="mt-10 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5 md:p-6">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-100">
              <Target aria-hidden="true" size={16} />
              Try these plan ideas
            </p>
            <div className="mt-5 grid gap-3">
              {post.missions.map((mission) => (
                <div className="rounded-2xl border border-white/10 bg-black/28 p-4" key={mission}>
                  <p className="text-sm font-bold leading-6 text-white/76">{mission}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[2rem] border border-lime-300/20 bg-[linear-gradient(135deg,rgba(190,242,100,0.14),rgba(0,212,255,0.08),rgba(247,37,133,0.1))] p-5 md:p-7">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-lime-200">
              <Zap aria-hidden="true" size={16} />
              Turn this article into action
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white">
              Turn this idea into a plan.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">{post.generatorPrompt}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/find">Find My Plan</LinkButton>
              <LinkButton href="/deals" variant="ghost">Browse Deals</LinkButton>
            </div>
          </section>

          <section className="mt-10 grid gap-4">
            <h2 className="text-3xl font-black text-white">FAQ</h2>
            {post.faqs.map((faq) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5" key={faq.question}>
                <h3 className="font-black text-white">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/64">{faq.answer}</p>
              </div>
            ))}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-lime-200">
              <Sparkles aria-hidden="true" size={15} />
              Next real step
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-white">
              Do not just read. Find one plan.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              GoFunMotion should turn search traffic into a useful local plan.
            </p>
            <LinkButton className="mt-5 w-full" href="/find">Find My Plan</LinkButton>
          </div>

          <div className="mt-4 rounded-[2rem] border border-white/10 bg-black/24 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Related ideas</p>
            <div className="mt-4 grid gap-3">
              {relatedPosts.map((related) => (
                <Link className="rounded-2xl bg-white/[0.055] p-4 transition hover:bg-white/[0.09]" href={`/blog/${related.slug}`} key={related.slug}>
                  <p className="text-sm font-black leading-tight text-white">{related.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/50">{related.keyword}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </article>
    </main>
  );
}
