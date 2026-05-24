import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { DealCard } from "../../components/gofunmotion/deal-card";
import { categories, demoNotice, filterListings, parsePlanFinderInput } from "../../lib/deals-data";
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
  const input = parsePlanFinderInput(resolvedSearchParams);
  const categoryValue = resolvedSearchParams.category;
  const categoryId = Array.isArray(categoryValue) ? categoryValue[0] : categoryValue;
  const results = filterListings({ ...input, categoryId });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Tonight&apos;s open slots</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Last-minute fun deals near you.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/64">
            Browse discounted activity windows with clear was/now pricing, time slots, and spots left. {demoNotice}
          </p>
        </div>
      </section>

      <form className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/48">
          <SlidersHorizontal aria-hidden="true" size={18} />
          Find open slots
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <FilterInput defaultValue={input.city} label="City" name="city" />
          <FilterSelect label="Category" name="category" options={[["", "All categories"], ...categories.map((category) => [category.id, category.name])]} value={categoryId ?? ""} />
          <FilterSelect label="When" name="when" options={[["today", "Today"], ["tonight", "Tonight"], ["tomorrow", "Tomorrow"], ["weekend", "This weekend"]]} value={input.when} />
          <FilterSelect label="Who" name="who" options={[["solo", "Solo"], ["date", "Date"], ["friends", "Friends"], ["family", "Family"], ["kids", "Kids"]]} value={input.who} />
          <FilterSelect label="Budget" name="budget" options={[["flexible", "Flexible"], ["free", "Free"], ["under25", "Under $25"], ["under50", "Under $50"], ["under100", "Under $100"]]} value={input.budget} />
          <button className="mt-auto min-h-12 rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white" type="submit">
            See Deals
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-3 text-sm font-black text-white/64 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">Was / Now pricing</div>
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">Tonight and weekend windows</div>
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">Request booking, no fake checkout</div>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(results.length ? results : filterListings({ city: input.city })).map((listing) => (
          <DealCard key={listing.id} listing={listing} />
        ))}
      </section>
    </main>
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
