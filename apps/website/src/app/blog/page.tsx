import type { Metadata } from "next";
import { Search, Sparkles } from "lucide-react";
import { BlogCard } from "../../components/gofunmotion/BlogCard";
import { LinkButton } from "../../components/gofunmotion/Button";
import { blogPosts } from "../../lib/blog";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Local Activity Ideas | GoFunMotion Blog",
  description:
    "Read local activity ideas, date night guides, family plans, last-minute deal strategy, and partner growth articles from GoFunMotion Deals.",
  keywords: [
    "things to do today",
    "date night ideas",
    "family activities",
    "last minute activity deals",
    "local business activity marketing"
  ],
  path: "/blog"
});

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-5 md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-fuchsia-300/10 px-3 py-2 text-sm font-black uppercase tracking-[0.18em] text-fuchsia-200">
          <Search aria-hidden="true" size={16} />
          Local ideas that lead to plans
        </p>
        <h1 className="mt-4 max-w-5xl text-5xl font-black leading-tight text-white md:text-7xl">
          Ideas for last-minute deals and local fun.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/64">
          Start with an article, then browse discounted activity openings, compare time windows, or join the partner side.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/deals?when=tonight">Browse Tonight&apos;s Deals</LinkButton>
          <LinkButton href="/find" variant="ghost">Help Me Choose</LinkButton>
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
              Search traffic should end in a useful local plan.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
              These articles target things to do tonight, date nights, family activity deals, local discounts, and partner growth. Each article points readers back to the deals screen or partner application.
            </p>
          </div>
          <LinkButton href="/deals?when=tonight" variant="secondary">Browse Deals</LinkButton>
        </div>
      </section>
    </main>
  );
}
