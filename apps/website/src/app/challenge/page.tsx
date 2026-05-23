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
    <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-20">
      <div className="mb-5 max-w-3xl md:mb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Challenge generator</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl md:text-7xl">
          Bored? Good. That means it is time for motion.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/62 md:mt-5 md:text-lg md:leading-8">
          Pick the current mood and get one safe, real-world mission you can start today.
        </p>
      </div>
      <ChallengeGenerator compact />
    </main>
  );
}
