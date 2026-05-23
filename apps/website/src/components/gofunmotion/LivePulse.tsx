"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, Flame, Sparkles, Zap } from "lucide-react";

const pulseItems = [
  "Someone just completed: Sunset Reset",
  "214 challenges generated today",
  "37 people chose Anti-Doomscroll mode",
  "Today global mission: Touch Grass Sprint",
  "Tiny courage mission unlocked",
  "Scrolling loop detected. Motion recommended."
];

const stats = [
  { icon: Zap, label: "generated today", value: "214" },
  { icon: Flame, label: "real-life combo", value: "x3" },
  { icon: Activity, label: "momentum score", value: "82" }
];

export function LivePulse() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-2 md:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/34 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(247,37,133,0.13),rgba(0,212,255,0.08),rgba(190,242,100,0.1))]" />
        <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-lime-200">
              <Sparkles aria-hidden="true" size={15} />
              Live motion feed
            </div>
            <motion.div
              animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
              className="flex w-max gap-3"
              transition={{ duration: 22, ease: "linear", repeat: Infinity }}
            >
              {[...pulseItems, ...pulseItems].map((item, index) => (
                <span
                  className="rounded-full border border-white/10 bg-black/34 px-4 py-2 text-sm font-black text-white/82"
                  key={`${item}-${index}`}
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4" key={stat.label}>
                  <Icon aria-hidden="true" className="text-cyan-200" size={18} />
                  <p className="mt-2 text-3xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/42">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
