"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { LinkButton } from "./Button";
import { StatsStrip } from "./StatsStrip";

const floatingCards = [
  "Go outside for 10 minutes",
  "Find something blue",
  "Text an old friend",
  "Try a new cafe",
  "Do 20 squats",
  "Take a sunset photo",
  "Compliment a stranger"
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-200 backdrop-blur">
            <Sparkles aria-hidden="true" size={16} />
            The internet that gets you moving
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white md:text-7xl xl:text-8xl">
            Replace scrolling with real life.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
            GoFunMotion gives you fun, AI-powered real-life challenges that help you move, explore, connect, and turn boring moments into momentum.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/challenge">Generate My Challenge</LinkButton>
            <LinkButton href="/about" variant="ghost">See How It Works</LinkButton>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/52">
            <ArrowDown aria-hidden="true" size={16} />
            No app. No signup. Start in 10 seconds.
          </p>
        </div>
        <div className="relative min-h-[540px]">
          <div className="absolute left-1/2 top-1/2 h-[430px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-[2.6rem] border border-white/15 bg-black/50 p-4 shadow-[0_40px_120px_rgba(124,58,237,0.4)] backdrop-blur-2xl">
            <div className="h-full rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(247,37,133,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-4">
              <div className="mx-auto h-1.5 w-16 rounded-full bg-white/30" />
              <div className="mt-8 rounded-3xl bg-white p-4 text-black">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-700">Today mission</p>
                <h2 className="mt-3 text-2xl font-black leading-tight">Sunset Reset</h2>
                <p className="mt-3 text-sm leading-6 text-black/62">Step outside for 10 minutes before sunset. Take one photo. Enjoy it first.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["40 XP", "10 min", "Mind Reset", "Easy"].map((item) => (
                  <div className="rounded-2xl bg-white/10 p-3 text-center text-xs font-black text-white" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {floatingCards.map((card, index) => (
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, index % 2 ? 14 : -14, 0],
                      rotate: [index - 3, index % 2 ? index + 1 : index - 1, index - 3]
                    }
              }
              className="absolute rounded-2xl border border-white/12 bg-white/[0.09] px-4 py-3 text-sm font-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              key={card}
              style={{
                left: `${index % 2 ? 3 + index * 5 : 53 + index * 3}%`,
                top: `${8 + index * 12}%`
              }}
              transition={{ duration: 4 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
            >
              {card}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-7xl">
        <StatsStrip />
      </div>
    </section>
  );
}
