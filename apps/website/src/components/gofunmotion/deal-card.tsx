import Link from "next/link";
import { Clock, MapPin, Sparkles, Tag } from "lucide-react";
import { getCategoryById, formatPrice } from "../../lib/deals-data";
import type { Listing } from "../../types/deals";

export function DealCard({ listing }: { listing: Listing }) {
  const category = getCategoryById(listing.categoryIds[0]);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="relative min-h-44 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(190,242,100,0.34),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] p-4">
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-black/52 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white/80">
            Demo listing
          </span>
          {listing.discountPercent ? (
            <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-black">
              {listing.discountPercent}% off
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/42 px-3 py-1.5 text-xs font-bold text-white/80">
            <Sparkles aria-hidden="true" size={14} />
            {category?.name ?? "Local activity"}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black leading-tight text-white">{listing.title}</h3>
            <p className="mt-2 text-sm font-bold text-white/54">{listing.businessName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-lime-200">{formatPrice(listing.price)}</p>
            {listing.originalPrice ? (
              <p className="text-sm font-bold text-white/38 line-through">{formatPrice(listing.originalPrice)}</p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/64">{listing.shortDescription}</p>
        <div className="mt-4 grid gap-2 text-sm font-bold text-white/58 sm:grid-cols-3">
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" size={16} />
            {listing.cityName}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock aria-hidden="true" size={16} />
            {listing.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-2">
            <Tag aria-hidden="true" size={16} />
            {listing.availableSlots[0]}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {listing.vibeTags.slice(0, 3).map((tag) => (
            <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/66" key={tag}>
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <Link
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-black text-[#070816] transition hover:bg-lime-200"
          href={`/deals/${listing.slug}`}
        >
          View Deal
        </Link>
      </div>
    </article>
  );
}
