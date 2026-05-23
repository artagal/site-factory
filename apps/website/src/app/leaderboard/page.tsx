import type { Metadata } from "next";
import { Flame, ShieldCheck, Trophy, Users } from "lucide-react";
import { LeaderboardPreview } from "../../components/gofunmotion/Leaderboard";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Leaderboard | GoFunMotion Social Momentum",
  description:
    "Preview GoFunMotion community momentum with weekly XP leaders, streak leaders, category leaders, and completed real-life missions.",
  path: "/leaderboard"
});

export default function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 md:p-10">
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-400/[0.15] blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-300">Social momentum</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
              Real life has a scoreboard now.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/[0.62]">
              Weekly XP, streaks, categories, and completed missions make the community feel alive without turning GoFunMotion into a noisy feed.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Trophy, label: "Weekly XP", value: "Top movers" },
              { icon: Flame, label: "Streak leaders", value: "Daily return loop" },
              { icon: Users, label: "Community mode", value: "Demo now, live later" },
              { icon: ShieldCheck, label: "No fake pressure", value: "Clearly marked preview" }
            ].map((item) => (
              <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4" key={item.label}>
                <item.icon className="size-5 text-lime-200" />
                <p className="mt-3 font-black text-white">{item.label}</p>
                <p className="mt-1 text-sm text-white/[0.48]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8">
        <LeaderboardPreview full />
      </div>
    </main>
  );
}
