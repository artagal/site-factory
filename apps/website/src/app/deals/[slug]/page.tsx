import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, Users } from "lucide-react";
import { BookingRequestForm } from "../../../components/listings/booking-request-form";
import { ListingViewTracker } from "../../../components/listings/listing-analytics";
import { ListingImage } from "../../../components/listings/listing-image";
import { SaveListingButton } from "../../../components/listings/save-listing-button";
import { ShareButton } from "../../../components/shared/share-button";
import { getCategoryById, listings } from "../../../lib/deals-data";
import { isDemoDataEnabled } from "../../../lib/demo-mode";
import { listingPresentation } from "../../../lib/listing-presentation";
import { buildListingSeoDescription } from "../../../lib/listing-seo";
import { buildSeoMetadata } from "../../../lib/seo";
import { getPublicBusinessForServer, getPublicListingBySlugForServer } from "../../../lib/server/public-listings";

type DealDetailProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return isDemoDataEnabled() ? listings.map((listing) => ({ slug: listing.slug })) : [];
}
export async function generateMetadata({ params }: DealDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlugForServer(slug);
  return buildSeoMetadata({
    description: listing ? buildListingSeoDescription(listing) : "Local activity deal not found.",
    noIndex: !listing || listing.isDemo,
    path: `/deals/${slug}`,
    title: listing ? `${listing.title} | GoFunMotion Deals` : "Deal Not Found | GoFunMotion"
  });
}
export default async function DealDetailPage({ params }: DealDetailProps) {
  const { slug } = await params;
  const listing = await getPublicListingBySlugForServer(slug);
  if (!listing) notFound();
  const facts = listingPresentation(listing);
  const business = await getPublicBusinessForServer(listing.businessId);
  const category = getCategoryById(listing.categoryIds[0]);
  const address = !listing.isDemo && business?.addressLine1
    ? [business.addressLine1, business.addressLine2, listing.cityName, business.state, business.postalCode].filter(Boolean).join(", ") : null;

  return <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
    <ListingViewTracker listingId={listing.id} listingSlug={listing.slug} />
    <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent-cyan)]" href={`/deals?cityId=${encodeURIComponent(listing.cityId)}`}><ArrowLeft aria-hidden="true" size={17} />Back to deals</Link>
    <header className="my-5">
      <p className="text-sm font-semibold text-[var(--accent-cyan)]">{category?.name ?? "Local activity"}{listing.isDemo ? " / Demo, not bookable" : ""}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{listing.title}</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{listing.businessName} / {listing.cityName}</p>
    </header>
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <section className="min-w-0">
        {facts.imageUrl ? <div className="mb-5 overflow-hidden rounded-lg"><ListingImage src={facts.imageUrl} alt={listing.title} /></div> : null}
        <div className="flex flex-wrap items-baseline gap-3"><span className="text-4xl font-bold text-[var(--accent-lime)]">{facts.priceLabel}</span>{facts.wasLabel ? <span className="text-[var(--muted-foreground)] line-through">{facts.wasLabel}</span> : null}{facts.discountLabel ? <span className="rounded-md bg-lime-500/15 px-2 py-1 text-sm font-bold text-[var(--accent-lime)]">{facts.discountLabel}</span> : null}</div>
        <dl className="my-5 grid gap-3 border-y border-[var(--border-subtle)] py-4 text-sm">
          <div className="flex gap-2"><dt><CalendarClock aria-label="Time" size={18} /></dt><dd>{facts.timeLabel}</dd></div>
          <div className="flex gap-2"><dt><Users aria-label="Availability" size={18} /></dt><dd>{facts.spotsLabel}</dd></div>
          <div className="flex gap-2"><dt><MapPin aria-label="Location" size={18} /></dt><dd>{address ?? listing.cityName}</dd></div>
        </dl>
        <p className="whitespace-pre-line text-base leading-7 text-[var(--muted-foreground)]">{listing.description}</p>
        <div className="my-5 flex flex-wrap gap-3">{!listing.isDemo ? <SaveListingButton listing={listing} /> : null}<ShareButton text={listing.shortDescription} title={listing.title} /></div>
        <Info title="Activity details" text={`${listing.durationMinutes} minutes. ${listing.indoorOutdoor === "either" ? "Indoor or outdoor" : listing.indoorOutdoor}. Group size: ${listing.groupSize}.`} />
        {listing.whyItFits ? <Info title="Why you'll like it" text={listing.whyItFits} /> : null}
        <Info title="Partner terms" text={listing.terms || "Ask the partner about offer terms before confirming."} />
        <Info title="Changes and cancellations" text={listing.cancellationNote || "Confirm cancellation terms directly with the partner."} />
        <Info title={business?.name ?? listing.businessName} text={business?.description ?? "The partner will confirm the meeting location and activity details."} />
        {address ? <a className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent-cyan)] underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} rel="noopener noreferrer" target="_blank"><MapPin aria-hidden="true" size={17} />Open directions</a> : null}
      </section>
      <section className="min-w-0" id="request-booking"><BookingRequestForm listing={listing} /><p className="mt-4 text-xs leading-6 text-[var(--muted-foreground)]">A request is not a confirmed booking. Do not share sensitive payment information in messages. Deals are subject to partner terms.</p></section>
    </div>
  </main>;
}
function Info({ title, text }: { title: string; text: string }) {
  return <section className="border-t border-[var(--border-subtle)] py-5"><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--muted-foreground)]">{text}</p></section>;
}
