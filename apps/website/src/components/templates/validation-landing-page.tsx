import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FlaskConical,
  MessageSquareText,
  MousePointerClick,
  TimerReset
} from "lucide-react";
import { FeatureGrid, ProcessStrip, SectionHeader } from "../landing";
import type { FactoryPreviewPage } from "../../lib/site-content";

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
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <SectionHeader
          eyebrow="Validation template"
          summary="The goal is to test page promise and audience fit before forms, analytics, checkout, or service operations are added."
          title="What the first validation page should prove"
          tone="coral"
        />
        <FeatureGrid
          items={[
            {
              title: "Message clarity",
              text: "Visitors should understand the offer without reading a long explanation.",
              icon: MessageSquareText
            },
            {
              title: "Action intent",
              text: "The page should define the first signal to watch, even if capture stays manual for now.",
              icon: MousePointerClick
            },
            {
              title: "Decision rule",
              text: "Every validation draft should say what result means continue, change, or stop.",
              icon: BarChart3
            }
          ]}
          tone="coral"
        />
      </section>
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <SectionHeader
            eyebrow="Safe test sequence"
            title="Validate locally before building systems"
            tone="skyline"
          />
          <ProcessStrip
            steps={[
              {
                title: "Draft promise",
                text: "State the offer, audience, and first conversion action."
              },
              {
                title: "Preview page",
                text: "Inspect layout and copy in the local dashboard."
              },
              {
                title: "Choose signal",
                text: "Document the metric to watch before wiring any collection tools."
              },
              {
                title: "Decide later",
                text: "Add forms, analytics, or services only after explicit approval."
              }
            ]}
            tone="skyline"
          />
          <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink/70">
            <TimerReset aria-hidden="true" size={18} />
            Suggested first validation window: 14 days.
          </div>
        </div>
      </section>
    </main>
  );
}
