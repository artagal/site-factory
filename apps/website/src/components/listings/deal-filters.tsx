import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { CategorySelectField } from "../shared/category-select-field";
import { CitySelectField } from "../shared/city-select-field";
import type { ListingSearchInput } from "../../lib/search";

export function DealFilters({ input = {}, advanced = false }: { input?: ListingSearchInput; advanced?: boolean }) {
  return <form action="/deals" className="contents">
    <div className="deal-filter-bar sticky top-[var(--app-header-height)] z-30 grid grid-cols-[minmax(0,1fr)_minmax(6rem,0.6fr)_2.75rem] items-center gap-2 border-y border-[var(--border-subtle)] bg-[var(--panel-strong)] py-2 backdrop-blur-xl md:grid-cols-[1.2fr_1fr_auto] md:gap-3">
      <CitySelectField dense defaultCity={input.city} defaultCityId={input.cityId} required={false} />
      <Select dense label="When" name="when" value={input.when ?? ""} options={[["", "Any time"], ["tonight", "Tonight"], ["today", "Today"], ["tomorrow", "Tomorrow"], ["weekend", "Weekend"]]} />
      <button aria-label="Show deals" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-lime-300 text-sm font-bold text-[#101510] md:mt-auto md:h-12 md:px-5" type="submit"><Search aria-hidden="true" size={18} /><span className="hidden md:inline">Show deals</span></button>
    </div>
    {advanced ? <details className="my-3 border-b border-[var(--border-subtle)] pb-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold"><SlidersHorizontal aria-hidden="true" size={17} />More filters<span className="ml-auto text-xs text-[var(--muted-foreground)]">Category, budget, group</span></summary>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CategorySelectField defaultCategoryId={input.categoryId} includeAll />
        <Select label="Who's going" name="who" value={input.who ?? ""} options={[["", "Everyone"], ["solo", "Solo"], ["date", "Date"], ["friends", "Friends"], ["family", "Family"], ["kids", "Kids"]]} />
        <Select label="Budget per person" name="budget" value={input.budget ?? ""} options={[["", "Any budget"], ["free", "Free"], ["under25", "$25 or less"], ["under50", "$50 or less"], ["under100", "$100 or less"]]} />
        <Select label="Setting" name="indoorOutdoor" value={input.indoorOutdoor ?? ""} options={[["", "Indoor or outdoor"], ["indoor", "Indoor"], ["outdoor", "Outdoor"]]} />
        <Select label="Sort" name="sort" value={input.sort ?? "tonight"} options={[["tonight", "Tonight first"], ["featured", "Featured"], ["biggest-discount", "Biggest discount"], ["under25", "Lowest price"]]} />
        <label className="flex min-h-11 items-center gap-2 text-sm"><input className="size-5 accent-lime-500" defaultChecked={input.discountOnly} name="discountOnly" type="checkbox" value="true" />Discounts only</label>
        <button className="min-h-11 rounded-lg bg-lime-300 px-4 font-semibold text-[#101510]" type="submit">Apply filters</button>
        <Link className="inline-flex min-h-11 items-center justify-center text-sm underline" href="/deals">Clear filters</Link>
      </div>
    </details> : <input name="sort" type="hidden" value="tonight" />}
    {input.maxPrice !== undefined ? <input name="maxPrice" type="hidden" value={input.maxPrice} /> : null}
    {input.vibe ? <input name="vibe" type="hidden" value={input.vibe} /> : null}
  </form>;
}

function Select({ label, name, value, options, dense = false }: { label: string; name: string; value: string; options: string[][]; dense?: boolean }) {
  return <label className="block min-w-0">
    <span className={dense ? "sr-only md:not-sr-only md:text-xs md:font-semibold md:text-[var(--muted-foreground)]" : "text-xs font-semibold text-[var(--muted-foreground)]"}>{label}</span>
    <select className={`w-full min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-3 text-sm font-semibold ${dense ? "h-11 md:mt-1 md:h-12" : "mt-2 h-12"}`} defaultValue={value} name={name}>
      {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
    </select>
  </label>;
}
