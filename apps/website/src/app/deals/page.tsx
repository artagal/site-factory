import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, SearchX, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { EmptyStatePanel, StatusBanner } from "../../components/gofunmotion/product-states";
import { CategorySelectField } from "../../components/shared/category-select-field";
import { CitySelectField } from "../../components/shared/city-select-field";
import { categories, demoNotice, parsePlanFinderInput } from "../../lib/deals-data";
import { getPublicListingsForServer } from "../../lib/server/public-listings";
import { filterListingCollection } from "../../lib/search";
import type { ListingSort } from "../../lib/search";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Tonight's Last-Minute Fun Deals | GoFunMotion",
  description:
    "Browse tonight's last-minute fun deals with clear was/now pricing, open slots, local activity discounts, date night deals, family passes, and classes.",
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
  const categoryValue = resolvedSearchParams.categoryId ?? resolvedSearchParams.category;
  const categoryId = Array.isArray(categoryValue) ? categoryValue[0] : categoryValue;
  const sortValue = readString(resolvedSearchParams.sort) as ListingSort | undefined;
  const sort: ListingSort = parseListingSort(sortValue);
  const publicListings = await getPublicListingsForServer();
  const results = filterListingCollection(publicListings, { ...input, categoryId, sort });
  const visibleResults = results.length ? results : filterListingCollection(publicListings, { city: input.city, cityId: input.cityId, sort });
  const showingClosestMatches = !results.length && visibleResults.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Tonight deals</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Last-minute fun, for less.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/64">
            Open slots, clear savings, request booking. {demoNotice}
          </p>
        </div>
        <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/find">
          Not sure? We&apos;ll pick for you
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>

      <TrustBadges />

      <form className="sticky top-14 z-20 mt-0 rounded-3xl border border-white/10 bg-[#090d1d]/95 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.30)] backdrop-blur-2xl md:top-16 md:rounded-2xl md:p-4 md:shadow-[0_20px_70px_rgba(0,0,0,0.34)]">
        <div className="grid grid-cols-2 items-center gap-2 md:grid-cols-[1fr_1fr_1.2fr_auto] md:items-end">
          <CitySelectField compact defaultCity={input.city} defaultCityId={input.cityId} dense />
          <FilterSelect label="When" name="when" options={[["tonight", "Tonight"], ["today", "Today"], ["tomorrow", "Tomorrow"], ["weekend", "Weekend"]]} value={input.when} compact dense />
          <div className="col-span-2 md:col-span-1">
            <CategorySelectField compact defaultCategoryId={categoryId} includeAll />
          </div>
          <input name="sort" type="hidden" value={sort} />
          <button className="col-span-2 h-12 rounded-2xl bg-lime-300 px-4 text-sm font-black leading-none text-[#070816] hover:bg-white md:col-span-1 md:px-5" type="submit">
            <span className="md:hidden">Show</span>
            <span className="hidden md:inline">Show Deals</span>
          </button>
        </div>
      </form>

      <nav aria-label="Quick deal filters" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <QuickFilter href="/deals?cityId=miami&when=tonight&sort=tonight" label="Miami tonight" />
        <QuickFilter href="/deals?when=tonight&who=date&sort=date-night" label="Date night" />
        <QuickFilter href="/deals?when=tonight&who=friends&sort=tonight" label="Friends" />
        <QuickFilter href="/deals?when=weekend&who=family&sort=family-friendly" label="Family weekend" />
        <QuickFilter href="/deals?when=tonight&budget=under25&sort=under25" label="Under $25" />
        <QuickFilter href="/deals?when=tonight&sort=biggest-discount" label="Biggest discount" />
      </nav>

      <form className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/48">
          <SlidersHorizontal aria-hidden="true" size={18} />
          More filters
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input name="cityId" type="hidden" value={input.cityId} />
          <input name="city" type="hidden" value={input.city} />
          <input name="categoryId" type="hidden" value={categoryId ?? ""} />
          <input name="when" type="hidden" value={input.when} />
          <FilterSelect label="Who" name="who" options={[["solo", "Solo"], ["date", "Date"], ["friends", "Friends"], ["family", "Family"], ["kids", "Kids"]]} value={input.who} />
          <FilterSelect label="Budget" name="budget" options={[["flexible", "Flexible"], ["free", "Free"], ["under25", "Under $25"], ["under50", "Under $50"], ["under100", "Under $100"]]} value={input.budget} />
          <FilterSelect label="Sort" name="sort" options={[["tonight", "Tonight first"], ["featured", "Featured"], ["biggest-discount", "Biggest discount"], ["under25", "Under $25"], ["date-night", "Date night"], ["family-friendly", "Family-friendly"]]} value={sort} />
          <button className="mt-auto min-h-12 rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white" type="submit">
            See Deals
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">{visibleResults.length} deal{visibleResults.length === 1 ? "" : "s"}</p>
          <h2 className="mt-2 text-3xl font-black text-white">Was / Now / Time / Spots.</h2>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-black text-lime-200 hover:text-white" href="/find">
          Not sure? We&apos;ll pick for you <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      {showingClosestMatches ? (
        <div className="mt-5">
          <StatusBanner title="No exact match, showing the closest deals" tone="warning">
            Try changing the category, budget, or timing to widen the search.
          </StatusBanner>
        </div>
      ) : null}

      {visibleResults.length ? (
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleResults.map((listing) => (
            <DealCard key={listing.id} listing={listing} />
          ))}
        </section>
      ) : (
        <section className="mt-8">
          <EmptyStatePanel
            action={
              <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/find">
                Build a Plan Instead
              </Link>
            }
            body="There are no approved deals for this combination yet. Change filters or use Find My Plan to get a fallback route."
            icon={SearchX}
            title="No approved deals found"
          />
        </section>
      )}
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

function QuickFilter({ href, label }: { href: string; label: string }) {
  return (
    <Link className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-white/10 bg-black/28 px-4 text-sm font-black text-white/72 hover:border-lime-300/35 hover:bg-lime-300/10 hover:text-lime-100" href={href}>
      {label}
    </Link>
  );
}

function TrustBadges() {
  const items = [
    { icon: BadgeCheck, text: "Reviewed partners" },
    { icon: Clock3, text: "Availability confirmed by request" },
    { icon: ShieldCheck, text: "No payment until confirmed" }
  ];

  return (
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-xs font-black text-white/70" key={item.text}>
            <Icon aria-hidden="true" className="text-lime-200" size={15} />
            {item.text}
          </span>
        );
      })}
    </div>
  );
}

function FilterSelect({
  compact = false,
  dense = false,
  label,
  name,
  options,
  value
}: {
  compact?: boolean;
  dense?: boolean;
  label: string;
  name: string;
  options: string[][];
  value: string;
}) {
  return (
    <label className="block">
      <span className={dense ? "sr-only md:not-sr-only md:text-xs md:font-black md:uppercase md:tracking-[0.14em] md:text-white/45" : "text-xs font-black uppercase tracking-[0.14em] text-white/45"}>{label}</span>
      <select className={`${dense ? "mt-0 h-12 rounded-2xl px-3 py-0 text-sm leading-[48px] md:mt-1 md:px-4" : `${compact ? "mt-1" : "mt-2"} h-12 rounded-2xl px-4 py-0 text-sm leading-[48px]`} w-full border border-white/10 bg-black/28 font-bold text-white outline-none focus:border-lime-300`} defaultValue={value} name={name}>
        {options.map(([optionValue, optionLabel]) => (
          <option className="bg-[#070816] text-white" key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
