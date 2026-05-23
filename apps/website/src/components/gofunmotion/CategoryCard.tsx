import Link from "next/link";
import { ArrowRight, Brain, Camera, Dumbbell, Heart, Map, MessageCircle, Moon, Shield, Sparkles, Zap } from "lucide-react";
import { categoryCopy } from "../../lib/challenges";
import type { ChallengeCategory } from "../../types/challenge";

const categoryIcons: Record<ChallengeCategory, typeof Zap> = {
  "Anti-Doomscroll": Shield,
  Confidence: Sparkles,
  Couples: Heart,
  Creative: Camera,
  Explore: Map,
  Fitness: Dumbbell,
  Friends: MessageCircle,
  "Mind Reset": Moon,
  Move: Zap,
  Social: Brain
};

export function CategoryCard({ category }: { category: ChallengeCategory }) {
  const copy = categoryCopy[category];
  const Icon = categoryIcons[category];

  return (
    <Link
      className={`group relative min-h-64 overflow-hidden rounded-[2rem] bg-gradient-to-br ${copy.gradient} p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_34px_110px_rgba(0,0,0,0.38)]`}
      href={`/challenge?category=${encodeURIComponent(category)}`}
    >
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/16 blur-2xl transition duration-500 group-hover:scale-125" />
      <div className="absolute inset-x-0 bottom-0 h-24 translate-y-8 bg-gradient-to-t from-black/34 to-transparent transition group-hover:translate-y-0" />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/72">Challenge mode</p>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-black shadow-[0_16px_50px_rgba(255,255,255,0.18)]">
              <Icon aria-hidden="true" size={21} />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-black leading-tight text-white">{category}</h3>
          <p className="mt-3 text-sm leading-6 text-white/76">{copy.blurb}</p>
        </div>
        <div>
          <p className="rounded-2xl border border-white/14 bg-white/18 p-3 text-sm font-bold text-white backdrop-blur">
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
