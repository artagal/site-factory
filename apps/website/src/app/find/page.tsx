import type { Metadata } from "next";
import Link from "next/link";
import { PlanPanel } from "../../components/ai/plan-panel";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { generatePlanWithAi } from "../../lib/ai/plan-agent";
import { parsePlanFinderInput } from "../../lib/planner";
import { buildSeoMetadata } from "../../lib/seo";
import { getPublicListingsForServer } from "../../lib/server/public-listings";

export const dynamic = "force-dynamic";

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
  const listings = input.cityId ? await getPublicListingsForServer() : [];
  const result = input.cityId ? await generatePlanWithAi({ allowAi: false, input, listings }) : null;
  const matches = listings.filter((listing) => result?.plan.listingIds.includes(listing.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-sm font-bold text-lime-300">Help me choose</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">Find your next plan.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-white/65">A date, a family outing, or a night with friends. What sounds good?</p>
          <Link className="mt-5 inline-flex min-h-11 items-center font-bold text-lime-300 hover:underline" href="/deals?when=tonight">Browse tonight&apos;s deals</Link>
        </div>
        <PlanFinderForm compact defaultValues={input} key={JSON.stringify(input)} />
      </section>

      {result ? <PlanPanel initialPlan={result.plan} input={input} key={result.plan.id + JSON.stringify(input)} /> : null}

      {result?.plan.waitlistRecommended ? (
        <section className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white">No matching partner offers yet</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Your preferences haven&apos;t changed. The ideas above are suggestions, not confirmed availability.</p>
          <Link className="mt-3 inline-flex min-h-11 items-center font-bold text-lime-300 hover:underline" href={`/waitlist?cityId=${encodeURIComponent(input.cityId)}`}>Join the {input.city} waitlist</Link>
        </section>
      ) : null}

      {matches.length ? (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold text-white">Matched deals</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((listing) => <DealCard key={listing.id} listing={listing} />)}
          </div>
        </section>
      ) : null}
    </main>
  );
}
