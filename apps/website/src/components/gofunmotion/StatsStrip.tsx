"use client";

import { motion, useReducedMotion } from "framer-motion";

export function StatsStrip() {
  const reduceMotion = useReducedMotion();
  const stats = [
    { label: "challenges generated", value: "12,842" },
    { label: "missions completed", value: "4,309" },
    { label: "people moving today", value: "231" },
    { label: "touched grass today", value: "48" }
  ];

  return (
    <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="group rounded-[1.5rem] bg-black/28 p-5 transition hover:-translate-y-1 hover:bg-white/[0.075]"
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          key={stat.label}
          transition={{ delay: index * 0.06, duration: 0.35 }}
        >
          <motion.p
            animate={reduceMotion ? undefined : { opacity: [0.72, 1, 0.86] }}
            className="text-3xl font-black text-white"
            transition={{ delay: index * 0.12, duration: 1.3, repeat: Infinity, repeatDelay: 4 }}
          >
            {stat.value}
          </motion.p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-white/42">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
