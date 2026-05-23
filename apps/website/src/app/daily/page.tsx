import type { Metadata } from "next";
import { DailyChallengeCard } from "../../components/gofunmotion/DailyChallenge";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Daily Real-Life Challenge | GoFunMotion",
  description:
    "Accept today's GoFunMotion global real-life challenge and turn a normal day into a small adventure.",
  path: "/daily"
});

export default function DailyPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">Daily challenge</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
        One global mission. One real moment.
      </h1>
      <div className="mt-10">
        <DailyChallengeCard large />
      </div>
    </main>
  );
}
