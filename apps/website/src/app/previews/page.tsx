import type { Metadata } from "next";
import { FactoryCard } from "@/components/factory-card";
import { buildSeoMetadata } from "@/lib/seo";
import { getPreviewPages } from "@/lib/site-content";

export const metadata: Metadata = buildSeoMetadata({
  title: "Site Factory Previews",
  description:
    "Preview local Site Factory page drafts for Work Organizer, Contactor, GoFunMotion, and validation concepts.",
  path: "/previews"
});

export default function PreviewsPage() {
  const pages = getPreviewPages();

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
        Preview index
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-ink md:text-6xl">
        Local page concepts ready for Codex iteration
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
        These previews are file-backed and safe to edit. They are meant to help
        Codex shape page strategy, SEO structure, and reusable content patterns
        before anything moves toward publishing.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pages.map((page) => (
          <FactoryCard key={page.slug} page={page} />
        ))}
      </div>
    </main>
  );
}
