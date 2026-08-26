import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { SmartSearch } from "../../components/ai/smart-search";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { DealFilters } from "../../components/listings/deal-filters";
import { getPublicListingsForServer } from "../../lib/server/public-listings";
import { filterListingCollection, parseListingSearchInput } from "../../lib/search";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Tonight's Last-Minute Fun Deals | GoFunMotion",
  description: "Browse local activity deals by city, time, budget and category. See prices and request an available spot.",
  path: "/deals"
});

export default async function DealsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const input = parseListingSearchInput(params);
  const results = filterListingCollection(await getPublicListingsForServer(), input);
  const quickLink = (changes: Record<string, string>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      const text = Array.isArray(value) ? value[0] : value;
      if (text) query.set(key, text);
    }
    for (const [key, value] of Object.entries(changes)) query.set(key, value);
    return `/deals?${query}`;
  };

  return <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 md:px-8 md:pt-8">
    <header className="mb-5">
      <p className="text-sm font-semibold text-[var(--accent-lime)]">GoFunMotion Deals</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Last-minute fun, for less.</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Choose a city. Find an open spot. Request availability.</p>
    </header>
    <DealFilters advanced input={input} key={JSON.stringify(input)} />
    <nav aria-label="Quick deal filters" className="scrollbar-none flex gap-2 overflow-x-auto py-2">
      {[["Tonight", { when: "tonight" }], ["Date night", { who: "date" }], ["With friends", { who: "friends" }], ["Family", { who: "family" }], ["Under $25", { budget: "under25" }]].map(([label, changes]) =>
        <Link className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-[var(--border-subtle)] px-3 text-sm font-semibold hover:bg-[var(--panel)]" href={quickLink(changes as Record<string, string>)} key={String(label)}>{String(label)}</Link>
      )}
    </nav>
    <details className="my-3 border-b border-[var(--border-subtle)] pb-3">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-[var(--accent-cyan)]">Not sure what to choose? Ask AI</summary>
      <SmartSearch cityId={input.cityId} />
    </details>
    <div className="my-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold">{results.length} {results.length === 1 ? "deal" : "deals"} found</h2>
      {input.maxPrice !== undefined ? <span className="text-sm">Up to $${input.maxPrice}</span> : null}
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent-cyan)]" href="/find">Help me choose <ArrowRight aria-hidden="true" size={16} /></Link>
    </div>
    {results.some((listing) => listing.isDemo) ? <p className="mb-4 text-sm text-[var(--accent-amber)]">Demo examples are not bookable. Prices and spots are illustrative.</p> : null}
    {results.length ? <section aria-label="Matching deals" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {results.map((listing) => <DealCard key={listing.id} listing={listing} />)}
    </section> : <section className="py-12 text-center">
      <SearchX aria-hidden="true" className="mx-auto text-[var(--muted-foreground)]" size={32} />
      <h2 className="mt-4 text-2xl font-bold">No open deals match yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">Try another time or fewer filters. Join the city waitlist for new local offers.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-4">
        <Link className="inline-flex min-h-11 items-center rounded-lg bg-lime-300 px-5 font-semibold text-[#101510]" href="/deals">Clear filters</Link>
        <Link className="inline-flex min-h-11 items-center font-semibold underline" href={`/waitlist?city=${encodeURIComponent(input.city ?? input.cityId ?? "")}`}>Join city waitlist</Link>
      </div>
    </section>}
  </main>;
}
