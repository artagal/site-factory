import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DealCard } from "../../../components/gofunmotion/deal-card";
import { PlanFinderForm } from "../../../components/planner/plan-finder-form";
import { demoCategories } from "../../../lib/demoData";
import { filterListingCollection, getCategoryBySlug } from "../../../lib/search";
import { getPublicListingsForServer } from "../../../lib/server/public-listings";
import { buildSeoMetadata } from "../../../lib/seo";

type CategoryPageProps = { params: Promise<{ categorySlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return demoCategories.map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return buildSeoMetadata({ description: "Category not found.", noIndex: true, path: `/categories/${categorySlug}`, title: "Category Not Found | GoFunMotion" });
  return buildSeoMetadata({
    description: `${category.description} Browse discounted open slots and last-minute GoFunMotion Deals activity cards.`,
    keywords: [category.name, "activity deals", "last minute activity deals", "open slot deals"],
    path: `/categories/${category.slug}`,
    title: `${category.name} Deals | GoFunMotion Deals`
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const listings = filterListingCollection(await getPublicListingsForServer(), { categoryId: category.id });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: category.accentColor }}>{category.name}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">{category.name} deals and open slots.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">{category.description}</p>
      </section>
      <section className="mt-8">
        <PlanFinderForm defaultValues={{ budget: "flexible", indoorOutdoor: "either", timeAvailable: "2hours", vibe: "surprise-me", when: "today", who: category.id === "family" ? "family" : category.id === "friends" ? "friends" : "date" }} />
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.slice(0, 6).map((listing) => <DealCard key={listing.id} listing={listing} />)}
        {!listings.length ? <p className="text-sm leading-7">No open offers in this category yet. <Link className="underline" href="/waitlist">Join your city waitlist.</Link></p> : null}
      </section>
    </main>
  );
}
