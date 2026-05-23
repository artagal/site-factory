import { Brain, Footprints, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Brain,
    title: "Choose your mood",
    text: "Bored, tired, social, romantic, adventurous, anxious, or ready for something bold."
  },
  {
    icon: Sparkles,
    title: "Get a challenge",
    text: "The local engine matches time, place, intensity, and category to one safe mission."
  },
  {
    icon: Footprints,
    title: "Go do something real",
    text: "Complete it, earn XP, build streaks, and make the day feel less automatic."
  }
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">How it works</p>
        <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
          You do not need a perfect plan. You need one small mission.
        </h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl" key={step.title}>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-black">
                <Icon aria-hidden="true" size={24} />
              </div>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-white/35">Step {index + 1}</p>
              <h3 className="mt-2 text-2xl font-black text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{step.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
