"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Flame, Play, Sparkles, Trophy, Zap } from "lucide-react";

const demoMissions = [
  {
    action: "Start mission",
    category: "Move",
    description: "Go outside for 7 minutes. Phone in pocket. Notice 3 things you normally miss.",
    progress: 38,
    streak: 3,
    title: "Touch Grass Sprint",
    xp: 40
  },
  {
    action: "Complete +60 XP",
    category: "Social",
    description: "Send one genuine message to someone you appreciate. Keep it simple and real.",
    progress: 64,
    streak: 4,
    title: "Text the Friend",
    xp: 60
  },
  {
    action: "Save mission",
    category: "Explore",
    description: "Walk to a place within 10 minutes that you usually pass without noticing.",
    progress: 82,
    streak: 5,
    title: "Tiny City Quest",
    xp: 70
  }
];

function ProgressRing({ value }: { value: number }) {
  const circumference = 100;

  return (
    <div className="relative flex size-20 items-center justify-center">
      <svg aria-hidden="true" className="absolute inset-0 size-20 -rotate-90" viewBox="0 0 36 36">
        <circle className="stroke-black/10" cx="18" cy="18" fill="none" r="15.9" strokeWidth="3" />
        <motion.circle
          animate={{ strokeDashoffset: circumference - value }}
          className="stroke-lime-300"
          cx="18"
          cy="18"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          r="15.9"
          strokeDasharray={circumference}
          strokeLinecap="round"
          strokeWidth="3"
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </svg>
      <span className="text-sm font-black text-black">{value}%</span>
    </div>
  );
}

export function PhoneMissionPreview() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const mission = demoMissions[index];

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % demoMissions.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <motion.div
      animate={reduceMotion ? undefined : { rotate: [0, 1.8, -1.2, 0], y: [0, -8, 5, 0] }}
      className="absolute left-1/2 top-1/2 z-10 w-[min(92vw,390px)] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] border border-white/15 bg-black/58 p-4 shadow-[0_40px_140px_rgba(124,58,237,0.48)] backdrop-blur-2xl"
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.035))] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">GoFunMotion</p>
            <p className="mt-1 text-sm font-black text-white">Mission draw</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-lime-300 px-3 py-2 text-black">
            <Flame aria-hidden="true" size={16} />
            <span className="text-sm font-black">{mission.streak}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
          <div className="rounded-3xl bg-white p-4 text-black shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-700">Progress ring</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-black/48">Momentum</p>
                <motion.p
                  animate={{ opacity: [0.65, 1, 0.8] }}
                  className="mt-1 text-3xl font-black"
                  key={mission.xp}
                  transition={{ duration: 0.7 }}
                >
                  +{mission.xp} XP
                </motion.p>
              </div>
              <ProgressRing value={mission.progress} />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-cyan-300 text-black">
              <Sparkles aria-hidden="true" size={20} />
            </div>
            <div className="flex size-14 items-center justify-center rounded-3xl bg-fuchsia-300 text-black">
              <Trophy aria-hidden="true" size={20} />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="mt-4 rounded-3xl bg-white p-5 text-black shadow-2xl"
            exit={{ opacity: 0, x: -26, scale: 0.98 }}
            initial={{ opacity: 0, x: 26, scale: 0.98 }}
            key={mission.title}
            transition={{ duration: 0.45, ease: [0.18, 0.9, 0.22, 1] }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="rounded-full bg-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white">
                {mission.category}
              </p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-black/38">live preview</p>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight">{mission.title}</h2>
            <p className="mt-3 text-sm font-bold leading-6 text-black/68">{mission.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Start", "Complete", "Reward"].map((item, itemIndex) => (
                <div className="rounded-2xl bg-black/[0.06] p-2 text-center text-xs font-black text-black/72" key={item}>
                  {itemIndex < index + 1 ? <CheckCircle2 aria-hidden="true" className="mx-auto mb-1 text-lime-600" size={15} /> : null}
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          animate={reduceMotion ? undefined : { boxShadow: ["0 0 0 rgba(190,242,100,0)", "0 0 48px rgba(190,242,100,0.26)", "0 0 0 rgba(190,242,100,0)"] }}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-lime-300 p-3 text-center text-sm font-black text-black"
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {index === 0 ? <Play aria-hidden="true" size={16} /> : <Zap aria-hidden="true" size={16} />}
          {mission.action}
        </motion.div>
      </div>
    </motion.div>
  );
}
