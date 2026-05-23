import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryCopy } from "../../lib/challenges";
import type { ChallengeCategory } from "../../types/challenge";

export function CategoryCard({ category }: { category: ChallengeCategory }) {
  const copy = categoryCopy[category];

  return (
    <Link
      className={`group relative min-h-64 overflow-hidden rounded-[2rem] bg-gradient-to-br ${copy.gradient} p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-1`}
      href={`/challenge?category=${encodeURIComponent(category)}`}
    >
      <div className="absolute inset-0 bg-black/18" />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/72">Challenge mode</p>
          <h3 className="mt-3 text-3xl font-black leading-tight text-white">{category}</h3>
          <p className="mt-3 text-sm leading-6 text-white/76">{copy.blurb}</p>
        </div>
        <div>
          <p className="rounded-2xl bg-white/18 p-3 text-sm font-bold text-white backdrop-blur">
            Sample: {copy.sample}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-white">
            Try this mode <ArrowRight aria-hidden="true" size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}
