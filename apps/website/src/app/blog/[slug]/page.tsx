import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkButton } from "../../../components/gofunmotion/Button";
import { blogPosts, getBlogPost } from "../../../lib/blog";
import { buildSeoMetadata } from "../../../lib/seo";

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
    description: post.description,
    path: `/blog/${post.slug}`,
    title: `${post.title} | GoFunMotion`,
    type: "article"
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">GoFunMotion ideas</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">{post.title}</h1>
      <p className="mt-6 text-xl leading-8 text-white/68">{post.description}</p>
      <article className="mt-10 grid gap-6 text-lg leading-8 text-white/70">
        <p>
          The feed is built to make the next swipe feel easier than the next step. GoFunMotion flips that script by making the next real-world action small, specific, and rewarding.
        </p>
        <p>
          Start with a mission that is easy enough to do today: walk for five minutes, text one person, find a new street, take a photo, breathe for sixty seconds, or make one tiny plan.
        </p>
        <p>
          The goal is not a perfect lifestyle. The goal is momentum. One small challenge gives your day a shape that scrolling rarely does.
        </p>
      </article>
      <div className="mt-10">
        <LinkButton href="/challenge">Generate a challenge</LinkButton>
      </div>
    </main>
  );
}
