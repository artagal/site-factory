import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarHeart, Coffee, Heart, MapPin, Palette, TicketPercent, Users } from "lucide-react";
import { DealCard } from "../components/gofunmotion/deal-card";
import { HomeHero } from "../components/home/home-hero";
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
  return <main className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
    <SeoJsonLd id="gofunmotion-home-schema" data={createSchemaGraph([createWebPageSchema({ title: "GoFunMotion Deals", path: "/", description: "Last-minute activity deals and local open spots." })])} />
    <HomeHero />
    <DealFilters input={{ when: "tonight" }} />
    <nav aria-label="Activity categories" className="scrollbar-none flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)] py-4">
      {categories.map(({ id, label, icon: Icon }) => <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-3 text-sm font-semibold transition hover:border-cyan-300/35 hover:bg-white/10" href={`/deals?categoryId=${id}&when=tonight`} key={id}><Icon aria-hidden="true" className="text-[var(--accent-cyan)]" size={17} />{label}</Link>)}
    </nav>
    <section className="pb-12 pt-8 md:pt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--accent-lime)]">Open spots worth leaving home for</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Tonight&apos;s deals</h2>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--accent-lime)] hover:text-[var(--foreground)]" href="/deals?when=tonight">Browse all deals <ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
      {listings.some((listing) => listing.isDemo) ? <p className="mb-4 text-sm text-[var(--accent-amber)]">Demo examples. Not bookable; prices and spots are illustrative.</p> : null}
      {listings.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}</div>
        : <div className="grid gap-6 rounded-lg border border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(190,242,100,0.08),rgba(103,232,249,0.05))] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <h3 className="text-2xl font-black">New local deals are on the way</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">No approved open spots for tonight yet. Explore other dates or join your city&apos;s waitlist to hear when real partner inventory goes live.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-lime-300 px-4 text-sm font-bold text-[#101510]" href="/deals">Explore upcoming deals <ArrowRight aria-hidden="true" size={17} /></Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] px-4 text-sm font-bold" href="/waitlist">Join city waitlist</Link>
          </div>
        </div>}
    </section>
    <section className="grid border-y border-[var(--border-subtle)] md:grid-cols-3">
      {[
        { icon: MapPin, step: "01", title: "Choose city and time", text: "Start with tonight, tomorrow, or this weekend." },
        { icon: TicketPercent, step: "02", title: "Compare the deal", text: "See the old price, new price, time, and spots left." },
        { icon: CalendarHeart, step: "03", title: "Request the slot", text: "The partner confirms availability before it is booked." }
      ].map(({ icon: Icon, step, title, text }, index) => <article className={`py-7 md:px-6 ${index ? "border-t border-[var(--border-subtle)] md:border-l" : ""} md:border-t-0`} key={step}>
        <div className="flex items-center gap-3"><span className="text-xs font-black text-[var(--accent-lime)]">{step}</span><Icon aria-hidden="true" className="text-[var(--accent-cyan)]" size={20} /></div>
        <h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p>
      </article>)}
    </section>
    <section className="grid gap-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
      <div><p className="text-sm font-bold text-[var(--accent-cyan)]">AI-assisted choice, grounded in available deals</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Can&apos;t decide? We&apos;ll narrow it down.</h2><p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">Tell us your city, budget, vibe, and who&apos;s going. GoFunMotion recommends a simple plan without inventing prices or availability.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row md:justify-end"><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 text-sm font-black text-[#101510]" href="/find">Help me choose <ArrowRight aria-hidden="true" size={17} /></Link><Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--border-subtle)] px-5 text-sm font-bold hover:bg-[var(--panel)]" href="/date-night">Date night ideas</Link></div>
    </section>
    <section className="grid gap-6 rounded-lg border border-cyan-300/20 bg-[linear-gradient(110deg,rgba(103,232,249,0.08),rgba(190,242,100,0.07))] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
      <div><p className="text-sm font-bold text-[var(--accent-lime)]">For local businesses</p><h2 className="mt-2 text-2xl font-black md:text-3xl">Have an empty slot tonight?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Publish a discounted last-minute offer, fill unused capacity, and receive booking requests from people ready to go.</p></div>
      <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-5 text-sm font-bold hover:border-lime-300/40" href="/partner">List your business <ArrowRight aria-hidden="true" size={17} /></Link>
    </section>
  </main>;
}
