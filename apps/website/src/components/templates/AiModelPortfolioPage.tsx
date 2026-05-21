import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Clapperboard, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { FeatureGrid, MetricStrip, SectionHeader } from "@/components/landing";
import type { FactoryPreviewPage } from "@/lib/site-content";

export function AiModelPortfolioPage({ page }: { page: FactoryPreviewPage }) {
  return (
    <main>
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:py-16">
          <div className="min-h-[460px] rounded-lg border border-ink/10 bg-[linear-gradient(135deg,#f8faf7_0%,#e1efe8_42%,#f3d8c6_100%)] p-5 shadow-soft">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/70 bg-white/48 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-ink px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                  AI concept
                </span>
                <span className="rounded-lg bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-ink/70">
                  Portfolio proof
                </span>
              </div>
              <div>
                <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-ink text-white">
                  <Camera aria-hidden="true" size={25} />
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ink/58">
                  Sample fictional model
                </p>
                <h1 className="mt-2 text-5xl font-black leading-none text-ink md:text-7xl">
                  {page.name}
                </h1>
                <p className="mt-4 max-w-sm text-sm font-bold leading-6 text-ink/62">
                  Transparent profile structure for positioning, brand fit, creative direction, and future production notes.
                </p>
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
            <div className="mt-8">
              <MetricStrip
                items={[
                  { label: "Disclosure", value: "Required" },
                  { label: "Assets", value: "Local" },
                  { label: "Publishing", value: "Off" }
                ]}
              />
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
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <SectionHeader
          eyebrow="Portfolio template"
          summary="Use this structure for AI model pages before image generation, video work, or publishing enters the workflow."
          title="Profile blocks future model pages should include"
          tone="mint"
        />
        <FeatureGrid
          items={[
            ...page.highlights.map((highlight) => ({
              ...highlight,
              icon: Sparkles
            })),
            {
              title: "Creative direction",
              text: "Separate visual style, scene ideas, and motion notes from the model biography.",
              icon: Palette
            },
            {
              title: "Production queue",
              text: "Track future image sets, short-form clips, and brand packages as local planning notes.",
              icon: Clapperboard
            },
            {
              title: "Disclosure safety",
              text: "Keep fictional AI model language visible in metadata, page copy, and export drafts.",
              icon: ShieldCheck
            }
          ]}
          tone="mint"
        />
      </section>
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="grid gap-4 md:grid-cols-[48px_1fr] md:items-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-coral/10 text-coral">
              <BadgeCheck aria-hidden="true" size={24} />
            </div>
            <p className="text-base font-bold leading-7 text-ink/72">
              Model portfolio pages must stay transparent: GoFunMotion samples describe fictional AI model concepts, not real people or live talent accounts.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
