"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowDown, CheckCircle2, MousePointer2, Sparkles } from "lucide-react";
import { LinkButton } from "./Button";
import { PhoneMissionPreview } from "./PhoneMissionPreview";
import { StatsStrip } from "./StatsStrip";

const floatingCards = [
  { label: "Sunset Reset", meta: "10 min", position: "left-[1%] top-[7%]" },
  { label: "Text the friend", meta: "Social", position: "right-[2%] top-[14%]" },
  { label: "Find something blue", meta: "Explore", position: "left-[5%] top-[48%]" },
  { label: "Walk no phone", meta: "Move", position: "right-[0%] top-[58%]" },
  { label: "Tiny Courage Mission", meta: "60 XP", position: "left-[18%] bottom-[5%]" },
  { label: "Compliment someone", meta: "Bold", position: "right-[16%] bottom-[12%]" }
];

const energyStreaks = [
  "left-[8%] top-[22%] w-24 rotate-[18deg]",
  "right-[8%] top-[40%] w-28 -rotate-[14deg]",
  "left-[14%] bottom-[28%] w-20 -rotate-[8deg]",
  "right-[22%] bottom-[26%] w-24 rotate-[10deg]"
];

const sparkPoints = [
  "left-[12%] top-[34%]",
  "left-[44%] top-[12%]",
  "right-[12%] top-[32%]",
  "right-[30%] bottom-[18%]",
  "left-[32%] bottom-[10%]"
];

const heroProof = [
  "Generate first",
  "No forced signup",
  "XP after action"
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(50);
  const cursorGlow = useMotionTemplate`radial-gradient(circle at ${cursorX}% ${cursorY}%, rgba(190,242,100,0.18), transparent 24rem)`;

  return (
    <section
      className="relative overflow-hidden px-4 pb-12 pt-10 md:px-8 md:pb-16 md:pt-16"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        cursorX.set(((event.clientX - rect.left) / rect.width) * 100);
        cursorY.set(((event.clientY - rect.top) / rect.height) * 100);
      }}
    >
      <motion.div aria-hidden="true" className="absolute inset-0 opacity-90" style={{ background: cursorGlow }} />
      <div aria-hidden="true" className="absolute inset-x-0 top-16 h-64 bg-[linear-gradient(110deg,transparent_0%,rgba(247,37,133,0.18)_22%,rgba(0,212,255,0.18)_44%,rgba(190,242,100,0.12)_62%,transparent_82%)] blur-3xl" />
      <svg aria-hidden="true" className="absolute right-0 top-20 hidden h-[520px] w-[58%] opacity-70 md:block" viewBox="0 0 720 520">
        <motion.path
          d="M36 360 C170 120 322 470 474 210 C558 64 650 106 704 36"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={reduceMotion ? { pathLength: 1, opacity: 0.42 } : { pathLength: [0.28, 1, 0.58], opacity: [0.12, 0.5, 0.22] }}
          stroke="url(#heroTrail)"
          strokeLinecap="round"
          strokeWidth="6"
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="heroTrail" x1="0" x2="1">
            <stop offset="0%" stopColor="#f72585" />
            <stop offset="52%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#bef264" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-200 backdrop-blur">
            <Sparkles aria-hidden="true" size={16} />
            The internet that gets you moving
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-5xl lg:text-7xl xl:text-8xl">
            Replace scrolling
            <span className="block bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-lime-200 bg-clip-text text-transparent">
              with real life.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl lg:text-4xl">
            Your next real-life adventure starts now.
          </p>
          <p className="mt-5 grid max-w-2xl gap-1 text-lg font-semibold leading-8 text-white/74 md:text-xl">
            <span>Choose your mood.</span>
            <span>Get one mission.</span>
            <span>Start, complete, earn XP, and keep your streak alive.</span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton className="min-w-36 whitespace-nowrap shadow-[0_20px_80px_rgba(247,37,133,0.38)]" href="#generator">
              Generate My Mission
            </LinkButton>
            <LinkButton href="/categories" variant="ghost">See Challenge Modes</LinkButton>
          </div>
          <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
            {["Mood", "Start", "Reward"].map((step, index) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur" key={step}>
                <p className="flex size-7 items-center justify-center rounded-full bg-white text-xs font-black text-black">{index + 1}</p>
                <p className="mt-2 text-sm font-black text-white">{step}</p>
              </div>
            ))}
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
            The shortest path: mood - mission - start - complete.
          </p>
        </div>
        <div className="relative z-10 min-h-[560px] md:min-h-[620px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_46%,rgba(255,255,255,0.08),transparent_28rem)]" />
          {energyStreaks.map((streak, index) => (
            <motion.span
              aria-hidden="true"
              animate={reduceMotion ? undefined : { opacity: [0.12, 0.62, 0.18], scaleX: [0.72, 1.12, 0.82] }}
              className={`absolute h-px rounded-full bg-gradient-to-r from-transparent via-lime-200/80 to-transparent ${streak}`}
              key={streak}
              transition={{ delay: index * 0.35, duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {sparkPoints.map((point, index) => (
            <motion.span
              aria-hidden="true"
              animate={reduceMotion ? undefined : { opacity: [0.18, 0.85, 0.2], y: [0, index % 2 ? 12 : -12, 0] }}
              className={`absolute size-1.5 rounded-[2px] bg-cyan-200 shadow-[0_0_18px_rgba(0,212,255,0.55)] ${point}`}
              key={point}
              transition={{ delay: index * 0.22, duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <PhoneMissionPreview />
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
              className={`absolute z-0 rounded-2xl border border-white/12 bg-white/[0.09] px-4 py-3 text-sm font-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl ${card.position}`}
              key={card.label}
              transition={{ duration: 4 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="block">{card.label}</span>
              <span className="mt-1 block text-xs text-lime-200/80">{card.meta}</span>
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
