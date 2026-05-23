import type { Metadata } from "next";
import { BlogCard } from "../../components/gofunmotion/BlogCard";
import { blogPosts } from "../../lib/blog";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Ideas Blog | GoFunMotion",
  description:
    "Read GoFunMotion ideas about anti-doomscrolling, confidence challenges, movement, boredom, social courage, and real-life momentum.",
  path: "/blog"
});

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-300">Blog and ideas</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
        Things to do before the feed eats the day.
      </h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard {...post} key={post.slug} />
        ))}
      </div>
    </main>
  );
}
