"use client";

import { motion } from "framer-motion";
import { Coffee, Moon, Smartphone, Sparkles, Sunrise, Timer, Trees, Zap } from "lucide-react";

const modes = [
  {
    accent: "from-amber-300/30 to-fuchsia-400/20",
    icon: Sunrise,
    label: "Morning Reset",
    text: "Start the day with one small physical win before the feed gets loud."
  },
  {
    accent: "from-cyan-300/24 to-lime-300/18",
    icon: Timer,
    label: "Lunch Break Mission",
    text: "A 10-minute side quest that makes the middle of the day feel less automatic."
  },
  {
    accent: "from-fuchsia-400/28 to-purple-400/20",
    icon: Moon,
    label: "Friday Night Mode",
    text: "When tonight feels wasted, pull a low-pressure plan that gets you moving."
  },
  {
    accent: "from-lime-300/24 to-cyan-300/18",
    icon: Trees,
    label: "Outside Mode",
    text: "Fresh air, city walks, sunset photos, no perfect plan needed."
  },
  {
    accent: "from-white/14 to-cyan-300/16",
    icon: Smartphone,
    label: "No Phone Challenge",
    text: "Short missions that interrupt the scroll loop without making it dramatic."
  },
  {
    accent: "from-orange-300/24 to-fuchsia-400/20",
    icon: Coffee,
    label: "Try a New Cafe",
    text: "Turn boredom into a tiny city adventure with a clear first step."
  }
];

export function RealWorldModes() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="mb-8 grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-fuchsia-300/10 px-3 py-2 text-sm font-black uppercase tracking-[0.18em] text-fuchsia-200">
            <Sparkles aria-hidden="true" size={16} />
            Real-world context
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Pick a moment. Turn it into motion.
          </h2>
        </div>
        <p className="text-lg font-semibold leading-8 text-white/62">
          GoFunMotion should feel useful in actual life: before work, after dinner, on a slow Saturday, or when your thumb is already drifting back to the feed.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.article
              className="group relative min-h-56 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
              initial={{ opacity: 0, y: 22 }}
              key={mode.label}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.accent} opacity-80 transition group-hover:opacity-100`} />
              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-white/10 blur-2xl transition group-hover:scale-125" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-black">
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <Zap aria-hidden="true" className="text-lime-200 opacity-0 transition group-hover:opacity-100" size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{mode.label}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/66">{mode.text}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
