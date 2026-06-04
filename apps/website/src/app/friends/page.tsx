import type { Metadata } from "next";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { filterListings } from "../../lib/deals-data";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Fun Things To Do With Friends | GoFunMotion",
  description: "Find group-friendly activities, last-minute friend plans, open slots, and local activity deals that make it easier for everyone to say yes.",
  keywords: ["fun things to do with friends", "group activities", "weekend plans"],
  path: "/friends"
});

export default function FriendsPage() {
  const listings = filterListings({ categoryId: "friends", who: "friends" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Friends and groups</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Make the group decision easier.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">Use filters and deal cards to shape quick plans for friends, groups, and casual nights out without sending everyone another long list.</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "under50", city: "Austin", indoorOutdoor: "either", timeAvailable: "2hours", vibe: "social", when: "tonight", who: "friends" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}
      </section>
    </main>
  );
}
