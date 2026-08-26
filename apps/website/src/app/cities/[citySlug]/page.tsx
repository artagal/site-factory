import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DealCard } from "../../../components/gofunmotion/deal-card";
import { PlanFinderForm } from "../../../components/planner/plan-finder-form";
import { filterListingCollection, getCityBySlug } from "../../../lib/search";
import { getPublicListingsForServer } from "../../../lib/server/public-listings";
import { demoCities } from "../../../lib/demoData";
import { buildSeoMetadata } from "../../../lib/seo";

type CityPageProps = { params: Promise<{ citySlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return demoCities.map((city) => ({ citySlug: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return buildSeoMetadata({ description: "City not found.", noIndex: true, path: `/cities/${citySlug}`, title: "City Not Found | GoFunMotion" });
  return buildSeoMetadata({
    description: `Find last-minute activity deals in ${city.name}: open slots, date night discounts, family passes, and local experiences.`,
    keywords: [`${city.name} activity deals`, `${city.name} last minute deals`, `${city.name} date night deals`],
    path: `/cities/${city.slug}`,
    title: `${city.name} Last-Minute Activity Deals | GoFunMotion`
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();
  const listings = filterListingCollection(await getPublicListingsForServer(), { cityId: city.id });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">{city.name}, {city.state}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">Last-minute activity deals in {city.name}.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">{city.description}</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "under50", city: city.name, cityId: city.id, indoorOutdoor: "either", timeAvailable: "2hours", vibe: "surprise-me", when: "today", who: "date" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => <DealCard key={listing.id} listing={listing} />)}
        {!listings.length ? <p className="text-sm leading-7">New offers in {city.name} are on the way. <Link className="underline" href={`/waitlist?cityId=${encodeURIComponent(city.id)}`}>Join the waitlist.</Link></p> : null}
      </section>
    </main>
  );
}
