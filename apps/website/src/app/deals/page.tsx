import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Flame, SlidersHorizontal, TicketPercent, Users } from "lucide-react";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { categories, demoNotice, filterListings, parsePlanFinderInput } from "../../lib/deals-data";
import type { ListingSort } from "../../lib/search";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Last-Minute Activity Deals | GoFunMotion",
  description:
    "Browse last-minute activity deals, open slots, date night discounts, family passes, friend plans, classes, and local experience offers.",
  keywords: ["local activity deals", "last minute deals", "date night deals", "family activities"],
  path: "/deals"
});

type DealsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const input = parsePlanFinderInput({
    ...resolvedSearchParams,
    when: resolvedSearchParams.when ?? "tonight"
  });
  const categoryValue = resolvedSearchParams.category;
  const categoryId = Array.isArray(categoryValue) ? categoryValue[0] : categoryValue;
  const sortValue = readString(resolvedSearchParams.sort) as ListingSort | undefined;
  const sort: ListingSort = parseListingSort(sortValue);
  const results = filterListings({ ...input, categoryId, sort });
  const visibleResults = results.length ? results : filterListings({ city: input.city, sort });
  const bestDiscount = visibleResults.reduce((best, listing) => Math.max(best, listing.discountPercent ?? 0), 0);
  const totalOpenSpots = visibleResults.reduce((sum, listing) => sum + (listing.remainingSpots ?? 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Tonight&apos;s open slots</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Find a fun deal for tonight.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/64">
            Browse discounted activity windows with clear was/now pricing, time slots, and spots left. {demoNotice}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <DealMetric icon={Clock3} label="Default window" value={input.when === "tonight" ? "Tonight" : input.when} />
        <DealMetric icon={TicketPercent} label="Biggest discount" value={bestDiscount ? `${bestDiscount}% off` : "Open slot"} />
        <DealMetric icon={Users} label="Visible spots" value={totalOpenSpots ? `${totalOpenSpots} spots` : "Limited"} />
      </section>

      <nav aria-label="Quick deal filters" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <QuickFilter href="/deals?city=Miami&when=tonight&sort=tonight" label="Miami tonight" />
        <QuickFilter href="/deals?when=tonight&who=date&sort=date-night" label="Date night" />
        <QuickFilter href="/deals?when=tonight&who=friends&sort=tonight" label="Friends" />
        <QuickFilter href="/deals?when=weekend&who=family&sort=family-friendly" label="Family weekend" />
        <QuickFilter href="/deals?when=tonight&budget=under25&sort=under25" label="Under $25" />
        <QuickFilter href="/deals?when=tonight&sort=biggest-discount" label="Biggest discount" />
      </nav>

      <form className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/48">
          <SlidersHorizontal aria-hidden="true" size={18} />
          Find open slots
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
          <FilterInput defaultValue={input.city} label="City" name="city" />
          <FilterSelect label="Category" name="category" options={[["", "All categories"], ...categories.map((category) => [category.id, category.name])]} value={categoryId ?? ""} />
          <FilterSelect label="When" name="when" options={[["today", "Today"], ["tonight", "Tonight"], ["tomorrow", "Tomorrow"], ["weekend", "This weekend"]]} value={input.when} />
          <FilterSelect label="Who" name="who" options={[["solo", "Solo"], ["date", "Date"], ["friends", "Friends"], ["family", "Family"], ["kids", "Kids"]]} value={input.who} />
          <FilterSelect label="Budget" name="budget" options={[["flexible", "Flexible"], ["free", "Free"], ["under25", "Under $25"], ["under50", "Under $50"], ["under100", "Under $100"]]} value={input.budget} />
          <FilterSelect label="Sort" name="sort" options={[["tonight", "Tonight first"], ["featured", "Featured"], ["biggest-discount", "Biggest discount"], ["under25", "Under $25"], ["date-night", "Date night"], ["family-friendly", "Family-friendly"]]} value={sort} />
          <button className="mt-auto min-h-12 rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white" type="submit">
            See Deals
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-3 text-sm font-black text-white/64 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">Every card shows Was / Now pricing</div>
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">Time windows and spots left are visible first</div>
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">Request booking now, pay only after confirmation later</div>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Showing {visibleResults.length} deal{visibleResults.length === 1 ? "" : "s"}</p>
          <h2 className="mt-2 text-3xl font-black text-white">Open slots with real deal math.</h2>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-black text-lime-200 hover:text-white" href="/find">
          Not sure? Help me choose <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleResults.map((listing) => (
          <DealCard key={listing.id} listing={listing} />
        ))}
      </section>
    </main>
  );
}

function readString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseListingSort(value: string | undefined): ListingSort {
  return value === "featured" ||
    value === "tonight" ||
    value === "biggest-discount" ||
    value === "under25" ||
    value === "family-friendly" ||
    value === "date-night" ||
    value === "newest"
    ? value
    : "tonight";
}

function DealMetric({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <Icon aria-hidden="true" className="text-lime-200" size={22} />
      <p className="mt-3 text-2xl font-black capitalize text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
    </div>
  );
}

function QuickFilter({ href, label }: { href: string; label: string }) {
  return (
    <Link className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-white/10 bg-black/28 px-4 text-sm font-black text-white/72 hover:border-lime-300/35 hover:bg-lime-300/10 hover:text-lime-100" href={href}>
      {label}
    </Link>
  );
}

function FilterInput({ defaultValue, label, name }: { defaultValue: string; label: string; name: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{label}</span>
      <input className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" defaultValue={defaultValue} name={name} />
    </label>
  );
}

function FilterSelect({
  label,
  name,
  options,
  value
}: {
  label: string;
  name: string;
  options: string[][];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{label}</span>
      <select className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" defaultValue={value} name={name}>
        {options.map(([optionValue, optionLabel]) => (
          <option className="bg-[#070816] text-white" key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
