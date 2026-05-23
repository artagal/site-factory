"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, CheckCircle2, MousePointer2, Sparkles, Zap } from "lucide-react";
import { LinkButton } from "./Button";
import { StatsStrip } from "./StatsStrip";

const floatingCards = [
  "Go outside for 10 minutes",
  "Text an old friend",
  "Take a sunset photo",
  "Try a new cafe",
  "Find something blue"
];

const heroProof = [
  "No app required",
  "No forced signup",
  "Safe real-life prompts"
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-10 md:px-8 md:pb-16 md:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-200 backdrop-blur">
            <Sparkles aria-hidden="true" size={16} />
            AI real-life challenge generator
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-5xl lg:text-7xl xl:text-8xl">
            Replace scrolling
            <span className="block bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-lime-200 bg-clip-text text-transparent">
              with real life.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl lg:text-4xl">
            Bored? Pull a mission in 10 seconds.
          </p>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/74 md:text-xl">
            GoFunMotion gives you quick, safe, AI-style real-life challenges for movement, confidence, connection, exploring your city, couples, friends, and anti-doomscrolling.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton className="shadow-[0_20px_80px_rgba(247,37,133,0.38)]" href="#generator">
              Generate My Challenge
            </LinkButton>
            <LinkButton href="/categories" variant="ghost">See Challenge Modes</LinkButton>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {heroProof.map((item) => (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/64" key={item}>
                <CheckCircle2 aria-hidden="true" className="text-lime-300" size={15} />
                {item}
              </span>
            ))}
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/52">
            <ArrowDown aria-hidden="true" size={16} />
            Pick mood. Pick time. Get one real-world mission.
          </p>
        </div>
        <div className="relative min-h-[520px] md:min-h-[560px]">
          <div className="absolute left-1/2 top-1/2 z-10 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] border border-white/15 bg-black/55 p-4 shadow-[0_40px_120px_rgba(124,58,237,0.4)] backdrop-blur-2xl">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.035))] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">GoFunMotion</p>
                  <p className="mt-1 text-sm font-black text-white">Mission draw</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-lime-300 text-black">
                  <Zap aria-hidden="true" size={19} />
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-white p-5 text-black shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-700">Your next 7 minutes</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">Touch Grass Sprint</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-black/68">
                  Step outside with your phone in your pocket. Walk until you notice 3 details you usually miss.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["40 XP", "7 min", "Move"].map((item) => (
                    <div className="rounded-2xl bg-black/[0.06] p-2 text-center text-xs font-black text-black/72" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Mood", "Time", "Mission"].map((item, index) => (
                  <div className="rounded-2xl bg-white/10 p-3 text-center" key={item}>
                    <p className="mx-auto flex size-7 items-center justify-center rounded-full bg-white text-xs font-black text-black">
                      {index + 1}
                    </p>
                    <p className="mt-2 text-xs font-black text-white">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-lime-300 p-3 text-center text-sm font-black text-black">
                Start challenge
              </div>
            </div>
          </div>
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.04, 1], y: [0, -6, 0] }}
            className="absolute bottom-8 left-4 z-20 rounded-3xl border border-lime-300/20 bg-black/72 p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:left-12"
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-lime-300 text-black">
                <MousePointer2 aria-hidden="true" size={18} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">10-second flow</p>
                <p className="text-sm font-black">Mood - Time - Mission</p>
              </div>
            </div>
          </motion.div>
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
              className="absolute z-0 rounded-2xl border border-white/12 bg-white/[0.09] px-4 py-3 text-sm font-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl"
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
