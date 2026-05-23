import type { Metadata } from "next";
import { CalendarClock, Flame, ShieldCheck, Sparkles } from "lucide-react";
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
      <section className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">Daily challenge</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
            One global mission. One real moment.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/64">
            Daily is the reason to come back: one shared mission, one streak signal, one small real-life event before the day resets.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-lime-200">
            <CalendarClock aria-hidden="true" size={16} />
            resets tonight
          </p>
          <p className="mt-3 text-2xl font-black text-white">Accept, complete, share, return tomorrow.</p>
        </div>
      </section>

      <section className="mt-10">
        <DailyChallengeCard large />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Flame,
            title: "Streak connection",
            text: "Daily completions make the habit visible and keep the profile feeling alive."
          },
          {
            icon: Sparkles,
            title: "Shared event",
            text: "Everyone gets the same mission, so the page feels like today, not a static feature."
          },
          {
            icon: ShieldCheck,
            title: "Safe by design",
            text: "The challenge stays small, respectful, legal, and easy to finish in real life."
          }
        ].map((card) => {
          const Icon = card.icon;

          return (
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl" key={card.title}>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-black">
                <Icon aria-hidden="true" size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-white">{card.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/58">{card.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
