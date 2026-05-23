import type { Metadata } from "next";
import { ChallengeGenerator } from "../../components/gofunmotion/ChallengeGenerator";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "AI Challenge Generator | GoFunMotion",
  description:
    "Generate a safe real-life challenge based on your mood, time, location, intensity, and challenge type.",
  path: "/challenge"
});

export default function ChallengePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Challenge generator</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
          Bored? Good. That means it’s time for motion.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Pick the current mood and get one safe, real-world mission you can start today.
        </p>
      </div>
      <ChallengeGenerator compact />
    </main>
  );
}
