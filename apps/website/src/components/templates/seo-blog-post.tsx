import { MarkdownPreview } from "../markdown-preview";
import type { ContentEntry } from "../../lib/content-files";

export function SeoBlogPost({ entry }: { entry: ContentEntry }) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft md:p-9">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
        SEO blog post
      </p>
      <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
        {entry.title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-ink/70">{entry.description}</p>
      <MarkdownPreview markdown={entry.body} />
    </article>
  );
}
