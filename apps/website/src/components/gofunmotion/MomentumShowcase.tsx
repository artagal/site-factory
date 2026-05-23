"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame, Lock, Medal, ShieldCheck, Star, Trophy, Zap } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "First Step", state: "unlocked" },
  { icon: Flame, label: "Touch Grass", state: "unlocked" },
  { icon: Star, label: "Social Spark", state: "unlocked" },
  { icon: Trophy, label: "Explorer", state: "locked" },
  { icon: Medal, label: "No Scroll Hero", state: "locked" },
  { icon: Zap, label: "Courage Mode", state: "locked" }
];

export function MomentumShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="absolute left-1/2 top-0 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-lime-300/30 to-transparent" />
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Gamification with a pulse</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            Make real life feel playable.
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/64">
            XP, streaks, badges, levels, and momentum score turn one small real-world action into a reason to keep moving.
          </p>
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">Momentum meter</p>
                <p className="mt-2 text-3xl font-black text-white">Level 4</p>
              </div>
              <motion.div
                animate={reduceMotion ? undefined : { rotate: 360 }}
                className="relative size-24 rounded-full bg-[conic-gradient(#bef264_0_72%,rgba(255,255,255,0.12)_72%_100%)] p-2"
                transition={{ duration: 16, ease: "linear", repeat: Infinity }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#070816] text-center">
                  <span className="text-2xl font-black text-white">72%</span>
                </div>
              </motion.div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={reduceMotion ? undefined : { width: ["58%", "72%", "68%", "72%"] }}
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300"
                transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-4 text-sm font-black text-lime-100">Real-life combo x3. Wake up your day.</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_0%,rgba(247,37,133,0.22),transparent_36%),radial-gradient(circle_at_90%_40%,rgba(0,212,255,0.16),transparent_34%)] blur-xl" />
          <div className="relative grid gap-3 sm:grid-cols-2">
            {badges.map((badge, index) => {
              const Icon = badge.state === "locked" ? Lock : badge.icon;
              return (
                <motion.div
                  className={`rounded-[1.6rem] border p-5 backdrop-blur-2xl ${
                    badge.state === "unlocked"
                      ? "border-lime-300/24 bg-lime-300/10 shadow-[0_18px_70px_rgba(190,242,100,0.1)]"
                      : "border-white/10 bg-white/[0.045]"
                  }`}
                  initial={{ opacity: 0, y: 18 }}
                  key={badge.label}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: badge.state === "unlocked" ? -1.5 : 0, scale: 1.02 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${badge.state === "unlocked" ? "bg-lime-300 text-black" : "bg-white/10 text-white/42"}`}>
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <p className="mt-4 text-xl font-black text-white">{badge.label}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/42">{badge.state}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
