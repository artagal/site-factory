import type { Metadata } from "next";
import { Smartphone } from "lucide-react";
import { WaitlistForm } from "../../components/gofunmotion/WaitlistForm";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "GoFunMotion Mobile App Waitlist",
  description:
    "Join the GoFunMotion iOS and Android waitlist for streaks, friend challenges, city adventure mode, AI coaching, and social leaderboards.",
  path: "/waitlist"
});

export default function WaitlistPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <Smartphone aria-hidden="true" className="text-cyan-300" size={38} />
        <h1 className="mt-5 text-5xl font-black leading-tight text-white md:text-7xl">
          GoFunMotion is coming to your pocket.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          The mobile app will bring daily streaks, friend challenges, location-based adventures, AI coaching, real-life quests, and social leaderboards.
        </p>
      </div>
      <WaitlistForm />
    </main>
  );
}
