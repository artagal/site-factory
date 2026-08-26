import type { Metadata } from "next";
import Link from "next/link";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { filterListingCollection } from "../../lib/search";
import { getPublicListingsForServer } from "../../lib/server/public-listings";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Date Night Ideas | GoFunMotion Deals",
  description: "Find date night ideas, local activity deals, open-slot requests, and affordable plans by time, budget, city, and vibe.",
  keywords: ["date night ideas", "date night under 50", "romantic activities"],
  path: "/date-night"
});

export const dynamic = "force-dynamic";

export default async function DateNightPage() {
  const listings = filterListingCollection(await getPublicListingsForServer(), { categoryId: "date-night", who: "date" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Date night</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">Date night, for less.</h1>
        <p className="mt-4 text-base leading-7 text-white/65">Creative evenings, new experiences, and a reason to try somewhere different.</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "under50", indoorOutdoor: "either", timeAvailable: "2hours", vibe: "romantic", when: "tonight", who: "date" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!listings.length ? <p className="text-sm leading-7">New partner deals are on the way. <Link className="underline" href="/waitlist">Join your city waitlist.</Link></p> : null}
        {listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}
      </section>
    </main>
  );
}
