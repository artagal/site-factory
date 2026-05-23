import type { Metadata } from "next";
import { LeaderboardPreview } from "../../components/gofunmotion/Leaderboard";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Leaderboard | GoFunMotion",
  description:
    "Preview GoFunMotion community momentum, XP leaders, completed challenges, and future social leaderboards.",
  path: "/leaderboard"
});

export default function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-300">Leaderboard</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
        Real life has a scoreboard now.
      </h1>
      <div className="mt-10">
        <LeaderboardPreview full />
      </div>
    </main>
  );
}
