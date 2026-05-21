import Link from "next/link";
import { ArrowRight, Camera, Sparkles } from "lucide-react";
import type { FactoryPreviewPage } from "@/lib/site-content";

export function AiModelPortfolioPage({ page }: { page: FactoryPreviewPage }) {
  return (
    <main>
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:py-16">
          <div className="min-h-[420px] rounded-lg border border-ink/10 bg-[linear-gradient(135deg,#f8faf7_0%,#e1efe8_46%,#f3d8c6_100%)] p-5 shadow-soft">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/70 bg-white/48 p-5">
              <div className="flex justify-end">
                <span className="rounded-lg bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-ink/70">
                  Portfolio proof
                </span>
              </div>
              <div>
                <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-ink text-white">
                  <Camera aria-hidden="true" size={25} />
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ink/58">
                  Sample model
                </p>
                <h1 className="mt-2 text-5xl font-black leading-none text-ink md:text-7xl">
                  {page.name}
                </h1>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
              {page.hero.eyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-ink md:text-6xl">
              {page.hero.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/72">{page.hero.summary}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {page.highlights.map((highlight) => (
                <div key={highlight.title} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-mint/10 text-mint">
                    <Sparkles aria-hidden="true" size={19} />
                  </div>
                  <h3 className="font-black text-ink">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/68">{highlight.text}</p>
                </div>
              ))}
            </div>
            {page.contentHref ? (
              <Link
                href={page.contentHref}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white"
              >
                Open Mia Carter draft
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
