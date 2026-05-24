import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, Ticket } from "lucide-react";
import { BookingRequestForm } from "../../../components/listings/booking-request-form";
import { SaveListingButton } from "../../../components/listings/save-listing-button";
import { ShareButton } from "../../../components/shared/share-button";
import { demoNotice, formatPrice, getBusinessById, getCategoryById, getListingBySlug, listings } from "../../../lib/deals-data";
import { buildSeoMetadata } from "../../../lib/seo";

type DealDetailProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({ params }: DealDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    return buildSeoMetadata({
      description: "Local activity deal not found.",
      noIndex: true,
      path: `/deals/${slug}`,
      title: "Deal Not Found | GoFunMotion"
    });
  }

  return buildSeoMetadata({
    description: listing.shortDescription,
    keywords: ["local activity deal", listing.title, listing.cityName, listing.businessName],
    path: `/deals/${listing.slug}`,
    title: `${listing.title} | GoFunMotion Deals`
  });
}

export default async function DealDetailPage({ params }: DealDetailProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const business = getBusinessById(listing.businessId);
  const category = getCategoryById(listing.categoryIds[0]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Link className="text-sm font-black text-lime-200 hover:text-white" href="/deals">
        Back to deals
      </Link>
      <section className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="min-h-[360px] rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(190,242,100,0.32),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(34,211,238,0.26),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] p-5">
            <span className="rounded-full bg-black/52 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white/80">
              Demo listing
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">{category?.name ?? "Local activity"}</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">{listing.title}</h1>
          <p className="mt-4 text-lg leading-8 text-white/66">{listing.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-bold text-white/70">
              <MapPin aria-hidden="true" size={17} />
              {listing.cityName}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-bold text-white/70">
              <CalendarClock aria-hidden="true" size={17} />
              {listing.availableSlots.join(", ")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-[#070816]">
              <Ticket aria-hidden="true" size={17} />
              {formatPrice(listing.price)}
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="#request-booking">
              Request Booking
            </a>
            <SaveListingButton listing={listing} />
            <ShareButton text={listing.shortDescription} title={listing.title} />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        <InfoBlock title="Why it fits" text={listing.whyItFits} />
        <InfoBlock title="What's included" text={`Duration: ${listing.durationMinutes} minutes. Group size: ${listing.groupSize}. Booking mode: request availability.`} />
        <InfoBlock title="Terms" text={listing.terms} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Business info</h2>
          <p className="mt-3 text-lg font-black text-white/82">{business?.name ?? listing.businessName}</p>
          <p className="mt-2 text-sm leading-6 text-white/58">{business?.description ?? "Partner profile pending."}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/24 p-6">
          <h2 className="text-2xl font-black text-white">Map placeholder</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Exact location, distance, and mapping are intentionally placeholder-only until live partner data is approved. No paid location APIs are connected.
          </p>
          <p className="mt-4 text-sm leading-6 text-white/52">{demoNotice}</p>
        </div>
      </section>

      <section className="mt-8" id="request-booking">
        <BookingRequestForm listing={listing} />
      </section>
    </main>
  );
}

function InfoBlock({ text, title }: { text: string; title: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
    </article>
  );
}
