import type { Metadata } from "next";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { filterListings } from "../../lib/deals-data";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Date Night Ideas | GoFunMotion Deals",
  description: "Find date night ideas, local activities, and demo deal scaffolding based on time, budget, and vibe.",
  keywords: ["date night ideas", "date night under 50", "romantic activities"],
  path: "/date-night"
});

export default function DateNightPage() {
  const listings = filterListings({ categoryId: "date-night", who: "date" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Date night</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Plan a date without over-searching.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">Choose a vibe and budget, then use the starter marketplace cards as the structure for future real listings.</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "under50", city: "Miami", indoorOutdoor: "either", timeAvailable: "2hours", vibe: "romantic", when: "tonight", who: "date" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}
      </section>
    </main>
  );
}
