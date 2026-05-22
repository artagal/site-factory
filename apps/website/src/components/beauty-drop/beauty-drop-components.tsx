import Link from "next/link";
import Image from "next/image";
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

export const beautyDropHeroImage = "/images/beauty-drop/beauty-drop-hero.png";

export function BeautyDropShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#fff9f6] text-ink">
      <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f6_0%,#fff3ef_30%,#f8faf7_68%,#ffffff_100%)]">
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
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#b94a67]">
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
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#3a1323] px-5 py-3 text-sm font-black text-white shadow-soft transition hover:bg-[#4b1c30] sm:w-auto"
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
      className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#3a1323]/15 bg-white/90 px-5 py-3 text-sm font-black text-[#3a1323] shadow-sm transition hover:border-[#3a1323]/30 hover:bg-white sm:w-auto"
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
        <article key={item.title} className="rounded-lg border border-[#e9c9c3] bg-white/92 p-5 shadow-soft backdrop-blur">
          <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-[#fff0ec] text-[#b94a67]">
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
          className="rounded-lg border border-[#e9c9c3] bg-white/90 px-4 py-3 text-sm font-black text-[#3a1323] shadow-sm"
        >
          {category}
        </span>
      ))}
    </div>
  );
}

export function BeautyDropDealCard({ deal }: { deal: BeautyDropDeal }) {
  const discountPercent = getDiscountPercent(deal);
  const imagePositions: Record<string, string> = {
    Brows: "object-[67%_38%]",
    Hair: "object-[72%_56%]",
    Lashes: "object-[65%_38%]",
    Nails: "object-[66%_34%]"
  };

  return (
    <article className="overflow-hidden rounded-lg border border-[#e9c9c3] bg-white shadow-soft">
      <div className="relative h-48">
        <Image
          alt={`${deal.service} BeautyDrop appointment preview`}
          src={beautyDropHeroImage}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={`object-cover ${imagePositions[deal.category] ?? "object-center"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a1323]/78 via-[#3a1323]/14 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="w-fit rounded-lg bg-white/92 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#b94a67]">
              {deal.category}
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">{deal.service}</h2>
          </div>
          <span className="rounded-lg bg-[#d9f7ea] px-3 py-2 text-sm font-black text-[#176f55]">
            {discountPercent}% off
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/48">
              Last-minute opening
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-ink/64">
              Request the slot, then confirm details directly with the provider in the future app flow.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm font-bold text-ink/72">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden="true" className="text-[#b94a67]" size={18} />
            <span>{deal.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="text-[#b94a67]" size={18} />
            <span>{deal.location}</span>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-5">
          <div>
            <p className="text-sm font-bold text-ink/50 line-through">${deal.originalPrice}</p>
            <p className="text-3xl font-black text-[#3a1323]">${deal.dealPrice}</p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#3a1323] px-4 py-3 text-sm font-black text-white transition hover:bg-[#4b1c30]"
          >
            Request this slot
          </button>
        </div>
      </div>
    </article>
  );
}

export function BeautyDropHeroPreview() {
  return (
    <aside className="relative min-h-[460px] w-full overflow-hidden rounded-lg border border-white/80 bg-white shadow-soft">
      <Image
        alt="Premium BeautyDrop beauty appointment marketplace preview"
        src={beautyDropHeroImage}
        fill
        priority
        sizes="(min-width: 768px) 46vw, 100vw"
        className="object-cover object-[66%_50%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1323]/82 via-[#3a1323]/18 to-transparent" />
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-white/92 text-[#b94a67] shadow-sm">
          <Sparkles aria-hidden="true" size={24} />
        </div>
        <span className="rounded-lg bg-[#d9f7ea] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#176f55] shadow-sm">
          Validation ready
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/28 bg-white/92 p-4 shadow-soft backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#b94a67]">Today near you</p>
        <h2 className="mt-2 text-2xl font-black text-[#3a1323]">Gel manicure opening</h2>
        <div className="mt-5 grid gap-3 text-sm font-bold text-ink/70 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Clock aria-hidden="true" size={18} className="text-[#b94a67]" />
            <span>3:30 PM opening</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeDollarSign aria-hidden="true" size={18} className="text-[#b94a67]" />
            <span>$35 instead of $70</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function BeautyDropImageBand() {
  return (
    <div className="grid overflow-hidden rounded-lg border border-[#e9c9c3] bg-white shadow-soft lg:grid-cols-[1.08fr_0.92fr]">
      <div className="relative min-h-[360px]">
        <Image
          alt="BeautyDrop mobile marketplace lifestyle visual"
          src={beautyDropHeroImage}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[64%_48%]"
        />
      </div>
      <div className="flex flex-col justify-center bg-[#3a1323] p-6 text-white md:p-10">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ffd6cf]">
          Marketplace positioning
        </p>
        <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
          A deal feed that feels premium, not desperate
        </h2>
        <p className="mt-4 text-base leading-7 text-white/72">
          BeautyDrop should make discounted appointments feel intentional: limited-time, local, clear, and trustworthy for both customers and beauty professionals.
        </p>
      </div>
    </div>
  );
}

export function BeautyDropProForm() {
  return (
    <form className="grid gap-4 rounded-lg border border-[#e9c9c3] bg-white p-5 shadow-soft md:grid-cols-2">
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
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#3a1323] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4b1c30] sm:w-auto"
        >
          Submit open slot
        </button>
      </div>
    </form>
  );
}
