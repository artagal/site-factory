import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarHeart, Clock3, Coffee, Heart, Palette, ShieldCheck, TicketPercent, Users } from "lucide-react";
import { DealCard } from "../components/gofunmotion/deal-card";
import { DealFilters } from "../components/listings/deal-filters";
import { SeoJsonLd } from "../components/seo-json-ld";
import { getPublicListingsForServer } from "../lib/server/public-listings";
import { filterListingCollection } from "../lib/search";
import { buildSeoMetadata, createSchemaGraph, createWebPageSchema } from "../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "GoFunMotion Deals - Last-Minute Fun Deals Near You",
  description: "Save on activities, date nights, family fun, and local experiences with open spots today.",
  image: "/og/gofunmotion-og.png",
  path: "/"
});
export const revalidate = 60;

const categories = [
  { id: "date-night", label: "Date night", icon: Heart },
  { id: "friends", label: "Friends", icon: Users },
  { id: "family", label: "Family", icon: CalendarHeart },
  { id: "creative", label: "Creative", icon: Palette },
  { id: "food-drink", label: "Food & drink", icon: Coffee },
  { id: "events", label: "Events", icon: TicketPercent }
];

export default async function HomePage() {
  const listings = filterListingCollection(await getPublicListingsForServer(), { when: "tonight", sort: "tonight" }).slice(0, 6);
  return <main className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
    <SeoJsonLd id="gofunmotion-home-schema" data={createSchemaGraph([createWebPageSchema({ title: "GoFunMotion Deals", path: "/", description: "Last-minute activity deals and local open spots." })])} />
    <header className="pb-6 pt-7 md:pb-8 md:pt-10">
      <p className="text-base font-bold text-[var(--accent-lime)]">GoFunMotion Deals</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">Last-minute fun deals near you.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">Save on activities, date nights and local experiences with open spots today.</p>
    </header>
    <DealFilters input={{ when: "tonight" }} />
    <nav aria-label="Activity categories" className="scrollbar-none flex gap-2 overflow-x-auto py-4">
      {categories.map(({ id, label, icon: Icon }) => <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 text-sm font-semibold hover:bg-[var(--panel)]" href={`/deals?categoryId=${id}`} key={id}><Icon aria-hidden="true" className="text-[var(--accent-cyan)]" size={17} />{label}</Link>)}
    </nav>
    <section className="pb-8 pt-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Tonight's deals</h2>
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent-lime)]" href="/deals">All deals <ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
      {listings.some((listing) => listing.isDemo) ? <p className="mb-4 text-sm text-[var(--accent-amber)]">Demo examples. Not bookable; prices and spots are illustrative.</p> : null}
      {listings.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}</div>
        : <div className="border-y border-[var(--border-subtle)] py-8">
          <h3 className="text-xl font-bold">New local deals are on the way</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">No approved open spots for tonight yet. Explore other dates or join your city's waitlist.</p>
          <Link className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--accent-cyan)]" href="/deals">Explore upcoming deals <ArrowRight aria-hidden="true" size={17} /></Link>
        </div>}
    </section>
    <div className="grid gap-3 border-y border-[var(--border-subtle)] py-5 text-sm sm:grid-cols-3">
      <span className="flex items-center gap-2"><BadgeCheck aria-hidden="true" className="shrink-0 text-[var(--accent-lime)]" size={19} />Reviewed partners</span>
      <span className="flex items-center gap-2"><Clock3 aria-hidden="true" className="shrink-0 text-[var(--accent-cyan)]" size={19} />Availability confirmed by request</span>
      <span className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="shrink-0 text-[var(--accent-amber)]" size={19} />No payment for a booking request</span>
    </div>
    <section className="relative my-8 min-h-72 overflow-hidden rounded-lg bg-[#101510]">
      <Image alt="People making pottery together at a workshop" className="object-cover" fill sizes="(max-width: 768px) 100vw, 1200px" src="/images/activities/pottery-workshop.jpg" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative max-w-xl p-6 py-10 md:p-10">
        <p className="text-sm font-semibold text-lime-200">Something different tonight</p>
        <h2 className="mt-3 text-3xl font-bold !text-white">Make time for a little creativity.</h2>
        <p className="mt-3 text-sm leading-6 !text-white/90">Workshops, classes and new things to try together.</p>
        <Link className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold !text-[#101510]" href="/deals?categoryId=creative">Explore creative activities <ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
    </section>
    <section className="grid gap-8 border-b border-[var(--border-subtle)] py-6 md:grid-cols-2">
      <div><h2 className="text-2xl font-bold">Can't decide?</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Tell us your budget and who's going. Find a plan that fits.</p><Link className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--accent-cyan)]" href="/find">Help me choose <ArrowRight aria-hidden="true" size={17} /></Link></div>
      <div><h2 className="text-2xl font-bold">Want deals in your city?</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Join the list for new local openings.</p><Link className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--accent-cyan)]" href="/waitlist">Join city waitlist <ArrowRight aria-hidden="true" size={17} /></Link></div>
    </section>
    <section className="flex flex-col justify-between gap-5 pt-8 md:flex-row md:items-center">
      <div><h2 className="text-2xl font-bold">Have an empty slot?</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">List a last-minute offer and reach people ready to go.</p></div>
      <Link className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] px-5 font-semibold hover:bg-[var(--panel)]" href="/partner">List your business</Link>
    </section>
  </main>;
}
