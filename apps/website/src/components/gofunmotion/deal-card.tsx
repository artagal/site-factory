import Link from "next/link";
import { ArrowRight, Clock, MapPin, ShieldCheck, Sparkles, TicketPercent, Users } from "lucide-react";
import { SaveListingButton } from "../listings/save-listing-button";
import { getCategoryById, formatPrice } from "../../lib/deals-data";
import type { Listing } from "../../types/deals";

export function DealCard({ listing }: { listing: Listing }) {
  const category = getCategoryById(listing.categoryIds[0]);
  const primarySlot = listing.availableSlots[0] ?? "Request time";
  const isTonight = listing.availableDays.includes("tonight");
  const savings = listing.originalPrice ? Math.max(listing.originalPrice - listing.price, 0) : 0;
  const discountLabel = listing.discountPercent
    ? `${listing.discountPercent}% off`
    : savings > 0
      ? `Save ${formatPrice(savings)}`
      : "Open slot";
  const remainingLabel =
    listing.remainingSpots === null
      ? "Limited availability"
      : listing.remainingSpots === 1
        ? "1 spot left"
        : `${listing.remainingSpots} spots left`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-lime-300/35 hover:bg-white/[0.08] hover:shadow-[0_30px_95px_rgba(0,0,0,0.34)]">
      <div className="relative min-h-52 overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(190,242,100,0.36),transparent_30%),radial-gradient(circle_at_78%_6%,rgba(34,211,238,0.28),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] p-4">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-60" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-black/54 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white/82">
            {listing.isDemo ? "Demo / coming soon" : "Reviewed deal"}
          </span>
          <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-[#070816]">
            {discountLabel}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-black text-white/84">
              <Clock aria-hidden="true" size={14} />
              {isTonight ? "Tonight" : listing.availableDays[0] ?? "Soon"} - {primarySlot}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-[#070816]">
              <Users aria-hidden="true" size={14} />
              {remainingLabel}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/42 px-3 py-1.5 text-xs font-bold text-white/80">
            <Sparkles aria-hidden="true" size={14} />
            {category?.name ?? "Local activity"}
            </div>
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#070816]">{listing.cityName}</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <h3 className="text-2xl font-black leading-tight text-white">{listing.title}</h3>
            <p className="mt-2 text-sm font-bold text-white/54">{listing.businessName}</p>
          </div>
          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 p-3 text-left sm:text-right">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-white/38">Was</p>
            <p className="text-sm font-black text-white/45 line-through">{listing.originalPrice ? formatPrice(listing.originalPrice) : "Flexible"}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-lime-200">Now</p>
            <p className="text-3xl font-black leading-none text-lime-200">{formatPrice(listing.price)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/64">{listing.shortDescription}</p>
        <div className="mt-4 grid gap-2 text-sm font-bold text-white/66 sm:grid-cols-2">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-black/24 px-3">
            <MapPin aria-hidden="true" size={16} />
            {listing.cityName}
          </span>
          <span className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-black/24 px-3">
            <ShieldCheck aria-hidden="true" size={16} />
            Request booking
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-[#070816]">
            <TicketPercent aria-hidden="true" className="mr-1 inline" size={13} />
            Last-minute deal
          </span>
          {listing.vibeTags.slice(0, 3).map((tag) => (
            <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/66" key={tag}>
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <Link
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-[#070816] transition hover:bg-lime-200"
          href={`/deals/${listing.slug}`}
        >
          View Deal
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
        <div className="mt-3">
          <SaveListingButton listing={listing} />
        </div>
      </div>
    </article>
  );
}
