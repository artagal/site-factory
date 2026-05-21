import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { FactoryPreviewPage } from "@/lib/site-content";

export function AppLandingPage({ page }: { page: FactoryPreviewPage }) {
  return (
    <main>
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1fr_0.95fr] md:px-8 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
              {page.hero.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-5xl font-black leading-[1.02] text-ink md:text-7xl">
              {page.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
              {page.hero.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={page.contentHref ?? "/previews"}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white"
              >
                Open draft
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                href="/previews"
                className="inline-flex min-h-11 items-center rounded-lg border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink"
              >
                Back to preview index
              </Link>
            </div>
          </div>
          <div className="grid content-center gap-3">
            {page.highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="grid grid-cols-[36px_1fr] gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
              >
                <CheckCircle2 aria-hidden="true" className="mt-1 text-mint" size={24} />
                <div>
                  <h2 className="text-lg font-black text-ink">{highlight.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink/68">{highlight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-ink/10 bg-white p-5">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-coral">
                {section.label}
              </p>
              <h2 className="mt-3 text-2xl font-black text-ink">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/68">{section.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
