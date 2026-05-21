import Link from "next/link";
import { ArrowRight, FlaskConical, MessageSquareText, MousePointerClick } from "lucide-react";
import type { FactoryPreviewPage } from "@/lib/site-content";

const validationIcons = [MousePointerClick, MessageSquareText, FlaskConical];

export function ValidationLandingPage({ page }: { page: FactoryPreviewPage }) {
  return (
    <main>
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">
                {page.hero.eyebrow}
              </p>
              <h1 className="mt-3 max-w-3xl text-5xl font-black leading-[1.02] text-ink md:text-7xl">
                {page.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
                {page.hero.summary}
              </p>
              {page.contentHref ? (
                <Link
                  href={page.contentHref}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white"
                >
                  Open validation draft
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
              ) : null}
            </div>
            <div className="grid content-center gap-3">
              {page.highlights.map((highlight, index) => {
                const Icon = validationIcons[index] ?? FlaskConical;

                return (
                  <div
                    key={highlight.title}
                    className="grid grid-cols-[44px_1fr] gap-4 rounded-lg border border-ink/10 bg-paper p-5"
                  >
                    <div className="flex size-11 items-center justify-center rounded-lg bg-coral/10 text-coral">
                      <Icon aria-hidden="true" size={21} />
                    </div>
                    <div>
                      <h2 className="font-black text-ink">{highlight.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-ink/68">{highlight.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
