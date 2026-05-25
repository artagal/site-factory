import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { SavePlanButton } from "../../components/planner/save-plan-button";
import { ShareButton } from "../../components/shared/share-button";
import {
  buildSuggestedPlan,
  demoNotice,
  filterListings,
  formatBudget,
  formatGroup,
  formatIndoorOutdoor,
  formatVibe,
  formatWhen,
  parsePlanFinderInput
} from "../../lib/deals-data";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Help Me Choose | GoFunMotion Deals",
  description:
    "Not sure which last-minute deal to pick? GoFunMotion can choose a simple discounted activity plan based on your city, time, budget, and group.",
  keywords: ["activity deal helper", "things to do tonight", "local activity finder", "date night deals"],
  path: "/find"
});

type FindPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FindPage({ searchParams }: FindPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const input = parsePlanFinderInput(resolvedSearchParams);
  const plan = buildSuggestedPlan(input);
  const matches = filterListings(input).slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Deal helper</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">
            Not sure? We&apos;ll pick for you.
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/64">
            The main GoFunMotion screen is tonight&apos;s deal board. If you do not want to compare cards, this helper turns your city, time, budget, and group into one simple discounted plan.
          </p>
          <Link className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/deals?when=tonight">
            Browse tonight&apos;s deals
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <PlanFinderForm compact defaultValues={input} />
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl md:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Suggested deal plan</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white">{plan.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{plan.summary}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-white/58">
            <span className="rounded-2xl bg-black/28 p-3">{formatWhen(input.when)}</span>
            <span className="rounded-2xl bg-black/28 p-3">{formatBudget(input.budget)}</span>
            <span className="rounded-2xl bg-black/28 p-3">{formatIndoorOutdoor(input.indoorOutdoor)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {plan.items.map((item, index) => (
            <article className="rounded-2xl border border-white/10 bg-black/24 p-5" key={`${item.title}-${index}`}>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Step {index + 1}</span>
              <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-white/58">
                <span className="rounded-full bg-white/[0.07] px-3 py-1.5">{item.time}</span>
                <span className="rounded-full bg-white/[0.07] px-3 py-1.5">{item.estimatedPrice}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <SavePlanButton plan={plan} />
          <ShareButton label="Share plan" text={plan.summary} title={plan.title} />
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/deals">
            <Send aria-hidden="true" size={18} />
            Browse tonight&apos;s deals
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Matches</p>
            <h2 className="mt-2 text-3xl font-black text-white">Deals that fit {formatGroup(input.who)} and {formatVibe(input.vibe)}.</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">{demoNotice}</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-black text-lime-200 hover:text-white" href="/deals">
            See all deals <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(matches.length ? matches : filterListings({ city: input.city }).slice(0, 3)).map((listing) => (
            <DealCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </main>
  );
}
