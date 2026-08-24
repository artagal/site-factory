import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlanPanel } from "../../components/ai/plan-panel";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import {
  buildSuggestedPlan,
  demoNotice,
  filterListings,
  formatGroup,
  formatVibe,
  parsePlanFinderInput
} from "../../lib/deals-data";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Find My Plan | GoFunMotion Deals",
  description:
    "Find a simple local activity plan based on your city, mood, time, budget, and who's going.",
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
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Find My Plan</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">
            Tell us what sounds fun. We&apos;ll make the plan.
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/64">
            Pick a city, time, group, budget, vibe, and indoor/outdoor preference. GoFunMotion gives you a simple plan, matching local deals, and a backup path if your city is still coming soon.
          </p>
          <Link className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/deals?when=tonight">
            Browse tonight&apos;s deals
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <PlanFinderForm compact defaultValues={input} />
      </section>

      <PlanPanel initialPlan={plan} input={input} />

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
