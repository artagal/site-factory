import { Bookmark, CheckCircle2, Flame, MessageCircle, Play, Share2, Sparkles } from "lucide-react";
import { LinkButton } from "./Button";

const loopSteps = [
  {
    icon: MessageCircle,
    label: "1. Mood",
    text: "Pick how you feel right now."
  },
  {
    icon: Sparkles,
    label: "2. Challenge",
    text: "Get one safe real-life mission."
  },
  {
    icon: Play,
    label: "3. Start",
    text: "Leave the feed and do it."
  },
  {
    icon: CheckCircle2,
    label: "4. Complete",
    text: "Mark it done when you return."
  },
  {
    icon: Flame,
    label: "5. Reward",
    text: "Earn XP, streak, and badges."
  },
  {
    icon: Share2,
    label: "6. Keep",
    text: "Save, share, or sign in."
  }
];

export function CoreLoop() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10" aria-labelledby="mvp-core-loop">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-lime-300/20 bg-[linear-gradient(135deg,rgba(190,242,100,0.14),rgba(0,212,255,0.1),rgba(247,37,133,0.1))] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl md:p-6">
        <div className="absolute -right-20 -top-20 size-56 rounded-full bg-lime-300/16 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-fuchsia-400/12 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/32 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-lime-200">
              <Bookmark aria-hidden="true" size={15} />
              MVP core
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl" id="mvp-core-loop">
              One short loop. One real action.
            </h2>
            <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-white/70">
              Open it bored. Leave with a mission.
            </p>
            <div className="mt-5">
              <LinkButton href="#generator">Start the loop</LinkButton>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {loopSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  className="group rounded-[1.35rem] border border-white/10 bg-black/28 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-lime-300/35 hover:bg-black/36"
                  key={step.label}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.08)]">
                      <Icon aria-hidden="true" size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">{step.label}</h3>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/58">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
