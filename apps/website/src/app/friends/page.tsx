import type { Metadata } from "next";
import Link from "next/link";
import { PlanFinderForm } from "../../components/gofunmotion/plan-finder-form";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { filterListingCollection } from "../../lib/search";
import { getPublicListingsForServer } from "../../lib/server/public-listings";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Fun Things To Do With Friends | GoFunMotion",
  description: "Find group-friendly activities, last-minute friend plans, open slots, and local activity deals that make it easier for everyone to say yes.",
  keywords: ["fun things to do with friends", "group activities", "weekend plans"],
  path: "/friends"
});

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const listings = filterListingCollection(await getPublicListingsForServer(), { categoryId: "friends", who: "friends" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Friends and groups</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">More fun with friends.</h1>
        <p className="mt-4 text-base leading-7 text-white/65">Escape rooms, mini golf, and last-minute nights out for the whole group.</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "under50", indoorOutdoor: "either", timeAvailable: "2hours", vibe: "social", when: "tonight", who: "friends" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!listings.length ? <p className="text-sm leading-7">New partner deals are on the way. <Link className="underline" href="/waitlist">Join your city waitlist.</Link></p> : null}
        {listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}
      </section>
    </main>
  );
}
