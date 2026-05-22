import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles
} from "lucide-react";
import type { BeautyDropDeal } from "../../lib/beauty-drop";
import { getDiscountPercent } from "../../lib/beauty-drop";

export function BeautyDropShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#fffafa] text-ink">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(31,157,122,0.14),transparent_30%),linear-gradient(180deg,#fffafa_0%,#f8faf7_58%,#ffffff_100%)]">
        {children}
      </div>
    </main>
  );
}

export function BeautyDropSection({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16 ${className}`}>{children}</section>;
}

export function BeautyDropSectionHeader({
  eyebrow,
  summary,
  title
}: {
  eyebrow?: string;
  summary?: string;
  title: string;
}) {
  return (
    <div className="mb-7 max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-5xl">{title}</h2>
      {summary ? <p className="mt-4 text-base leading-7 text-ink/68 md:text-lg">{summary}</p> : null}
    </div>
  );
}

export function BeautyDropPrimaryLink({
  children,
  href
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-soft sm:w-auto"
    >
      {children}
      <ArrowRight aria-hidden="true" size={18} />
    </Link>
  );
}

export function BeautyDropSecondaryLink({
  children,
  href
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-ink/15 bg-white/85 px-5 py-3 text-sm font-black text-ink shadow-sm sm:w-auto"
    >
      {children}
    </Link>
  );
}

export function BeautyDropBenefitGrid({
  items
}: {
  items: Array<{
    text: string;
    title: string;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-lg border border-rose-100 bg-white/88 p-5 shadow-soft backdrop-blur">
          <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
            <CheckCircle2 aria-hidden="true" size={22} />
          </div>
          <h3 className="text-lg font-black text-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function BeautyDropCategoryPills({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <span
          key={category}
          className="rounded-lg border border-rose-100 bg-white/88 px-4 py-3 text-sm font-black text-ink shadow-sm"
        >
          {category}
        </span>
      ))}
    </div>
  );
}

export function BeautyDropDealCard({ deal }: { deal: BeautyDropDeal }) {
  const discountPercent = getDiscountPercent(deal);

  return (
    <article className="rounded-lg border border-rose-100 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="w-fit rounded-lg bg-rose-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-rose-600">
            {deal.category}
          </p>
          <h2 className="mt-4 text-2xl font-black text-ink">{deal.service}</h2>
        </div>
        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
          {discountPercent}% off
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm font-bold text-ink/72">
        <div className="flex items-center gap-2">
          <CalendarClock aria-hidden="true" className="text-rose-500" size={18} />
          <span>{deal.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="text-rose-500" size={18} />
          <span>{deal.location}</span>
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-5">
        <div>
          <p className="text-sm font-bold text-ink/50 line-through">${deal.originalPrice}</p>
          <p className="text-3xl font-black text-ink">${deal.dealPrice}</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-4 py-3 text-sm font-black text-white"
        >
          Request this slot
        </button>
      </div>
    </article>
  );
}

export function BeautyDropHeroPreview() {
  return (
    <aside className="w-full rounded-lg border border-white/80 bg-white/86 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
          <Sparkles aria-hidden="true" size={24} />
        </div>
        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
          Live prototype
        </span>
      </div>
      <div className="mt-6 rounded-lg border border-rose-100 bg-[#fffafa] p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-500">Today near you</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Gel manicure</h2>
        <div className="mt-5 grid gap-3 text-sm font-bold text-ink/70">
          <div className="flex items-center gap-2">
            <Clock aria-hidden="true" size={18} className="text-rose-500" />
            <span>3:30 PM opening</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeDollarSign aria-hidden="true" size={18} className="text-rose-500" />
            <span>$35 instead of $70</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {["Nails", "Lashes", "Brows"].map((item) => (
          <div key={item} className="rounded-lg bg-white p-3 text-center text-xs font-black text-ink/70 shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </aside>
  );
}

export function BeautyDropProForm() {
  return (
    <form className="grid gap-4 rounded-lg border border-rose-100 bg-white p-5 shadow-soft md:grid-cols-2">
      <label className="grid gap-2 text-sm font-black text-ink">
        Business or pro name
        <input className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" placeholder="Example Beauty Studio" />
      </label>
      <label className="grid gap-2 text-sm font-black text-ink">
        Service category
        <select className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" defaultValue="Nails">
          <option>Nails</option>
          <option>Hair</option>
          <option>Lashes</option>
          <option>Brows</option>
          <option>Facials</option>
          <option>Makeup</option>
          <option>Waxing</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-black text-ink">
        Service name
        <input className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" placeholder="Gel manicure" />
      </label>
      <label className="grid gap-2 text-sm font-black text-ink">
        Regular price
        <input className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" placeholder="$70" />
      </label>
      <label className="grid gap-2 text-sm font-black text-ink">
        Deal price
        <input className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" placeholder="$35" />
      </label>
      <label className="grid gap-2 text-sm font-black text-ink">
        Date and time
        <input className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" placeholder="Today 3:30 PM" />
      </label>
      <label className="grid gap-2 text-sm font-black text-ink md:col-span-2">
        Location
        <input className="min-h-12 rounded-lg border border-ink/15 px-4 text-sm font-medium" placeholder="Neighborhood or city placeholder" />
      </label>
      <label className="grid gap-2 text-sm font-black text-ink md:col-span-2">
        Notes
        <textarea
          className="min-h-28 rounded-lg border border-ink/15 px-4 py-3 text-sm font-medium"
          placeholder="Model-needed requirements, timing details, cancellation window, or service notes."
        />
      </label>
      <div className="md:col-span-2">
        <button
          type="button"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-black text-white sm:w-auto"
        >
          Submit open slot
        </button>
      </div>
    </form>
  );
}
