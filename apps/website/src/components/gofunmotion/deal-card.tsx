import Link from "next/link";
import { ArrowRight, Clock3, MapPin, TicketPercent, Users } from "lucide-react";
import { SaveListingButton } from "../listings/save-listing-button";
import { ListingImage } from "../listings/listing-image";
import { getCategoryById } from "../../lib/deals-data";
import { listingPresentation } from "../../lib/listing-presentation";
import type { Listing } from "../../types/deals";

export function DealCard({ listing }: { listing: Listing }) {
  const facts = listingPresentation(listing);
  const category = getCategoryById(listing.categoryIds[0]);
  return (
    <article className="deal-card group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-strong)] transition hover:border-lime-500/60">
      {facts.imageUrl ? <ListingImage alt={listing.title} src={facts.imageUrl} /> : null}
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <TicketPercent aria-hidden="true" size={15} />{category?.name ?? "Local activity"}
          </span>
          <span className={listing.isDemo ? "rounded-md bg-amber-400/15 px-2 py-1 text-[var(--accent-amber)]" : "text-[var(--accent-lime)]"}>
            {listing.isDemo ? "Demo / Not bookable" : "Reviewed partner"}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-snug text-[var(--foreground)]">
            <Link className="hover:underline" href={`/deals/${listing.slug}`}>{listing.title}</Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{listing.businessName}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]"><MapPin aria-hidden="true" size={15} />{listing.cityName}</p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold text-[var(--accent-lime)]"><span className="mr-1.5 text-sm font-semibold">Now</span>{facts.priceLabel}</span>
          {facts.wasLabel ? <span className="text-sm text-[var(--muted-foreground)] line-through">{facts.wasLabel}</span> : null}
          {facts.discountLabel ? <span className="rounded-md bg-lime-400/15 px-2 py-1 text-xs font-bold text-[var(--accent-lime)]">{facts.discountLabel}</span> : null}
        </div>
        <div className="grid gap-2 border-y border-[var(--border-subtle)] py-3 text-sm font-medium">
          <span className="flex items-start gap-2"><Clock3 aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent-cyan)]" size={17} />{facts.timeLabel}</span>
          <span className="flex items-start gap-2"><Users aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent-cyan)]" size={17} />{facts.spotsLabel}</span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{listing.shortDescription}</p>
        <div className="mt-auto flex items-start gap-2">
          <Link aria-label={`View ${listing.title}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-lime-300 px-4 text-sm font-bold text-[#101510] hover:bg-lime-200" href={`/deals/${listing.slug}`}>
            {listing.isDemo ? "View example" : "View Deal"}<ArrowRight aria-hidden="true" size={16} />
          </Link>
          {!listing.isDemo ? <SaveListingButton compact listing={listing} /> : null}
        </div>
      </div>
    </article>
  );
}
