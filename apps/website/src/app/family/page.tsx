import type { Metadata } from "next";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { filterListings } from "../../lib/deals-data";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Family Activities Near You | GoFunMotion",
  description: "Find family activities, kids plans, indoor options, weekend ideas, and local demo deal cards.",
  keywords: ["family activities", "kids activities", "rainy day family activities"],
  path: "/family"
});

export default function FamilyPage() {
  const listings = filterListings({ categoryId: "family", who: "family" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Family and kids</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Find family plans that work today.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">Filter for kids, indoor plans, weekend activities, and lower-stress options.</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "under25", city: "San Diego", indoorOutdoor: "indoor", timeAvailable: "2hours", vibe: "family-friendly", when: "weekend", who: "family" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}
      </section>
    </main>
  );
}
