import type { Metadata } from "next";
import { Search, Sparkles } from "lucide-react";
import { BlogCard } from "../../components/gofunmotion/BlogCard";
import { LinkButton } from "../../components/gofunmotion/Button";
import { blogPosts } from "../../lib/blog";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Things To Do Instead Of Scrolling | GoFunMotion Blog",
  description:
    "Read ideas for what to do instead of scrolling, fun things to do when bored, anti-doomscrolling habits, confidence challenges, and real-life missions.",
  keywords: [
    "what to do instead of scrolling",
    "fun things to do when bored",
    "things to do instead of doomscrolling",
    "anti doomscrolling",
    "real life challenge ideas"
  ],
  path: "/blog"
});

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-5 md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-fuchsia-300/10 px-3 py-2 text-sm font-black uppercase tracking-[0.18em] text-fuchsia-200">
          <Search aria-hidden="true" size={16} />
          SEO ideas that lead to action
        </p>
        <h1 className="mt-4 max-w-5xl text-5xl font-black leading-tight text-white md:text-7xl">
          What to do instead of scrolling.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/64">
          Start with an article, then generate a real-life mission. Every GoFunMotion post is designed to move the reader from search intent to action.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/challenge">Generate a mission</LinkButton>
          <LinkButton href="/daily" variant="ghost">Try today's challenge</LinkButton>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard {...post} key={post.slug} />
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] border border-lime-300/20 bg-lime-300/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-lime-200">
              <Sparkles aria-hidden="true" size={15} />
              Content loop
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Search traffic should end in the generator.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
              These starter articles target boredom, doomscrolling, confidence, movement, and real-life challenge queries. Each article links back into `/challenge`.
            </p>
          </div>
          <LinkButton href="/challenge" variant="secondary">Open generator</LinkButton>
        </div>
      </section>
    </main>
  );
}
