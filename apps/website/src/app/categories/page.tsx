import type { Metadata } from "next";
import { CategoryCard } from "../../components/gofunmotion/CategoryCard";
import { challengeCategories } from "../../lib/challenges";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Challenge Categories | GoFunMotion",
  description:
    "Explore GoFunMotion challenge modes for anti-doomscrolling, movement, social courage, city exploration, couples, friends, creativity, and mind reset.",
  path: "/categories"
});

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Challenge categories</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
        Choose your mode. Change the day.
      </h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {challengeCategories.map((category) => (
          <CategoryCard category={category} key={category} />
        ))}
      </div>
    </main>
  );
}
