"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = [
  ["12%", "18%", 0],
  ["24%", "72%", 1],
  ["38%", "28%", 2],
  ["49%", "84%", 3],
  ["58%", "16%", 4],
  ["71%", "68%", 5],
  ["83%", "31%", 6],
  ["91%", "76%", 7]
] as const;

export function MotionBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070816]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,37,133,0.24),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(0,212,255,0.18),transparent_30%),linear-gradient(180deg,#070816_0%,#111232_48%,#070816_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <motion.div
        animate={reduceMotion ? undefined : { x: ["-12%", "10%", "-6%"], opacity: [0.12, 0.34, 0.16] }}
        className="absolute left-[-12%] top-[28%] h-24 w-[120%] rotate-[-10deg] bg-[linear-gradient(90deg,transparent,rgba(247,37,133,0.16),rgba(0,212,255,0.12),transparent)] blur-2xl"
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: ["8%", "-10%", "4%"], opacity: [0.08, 0.28, 0.1] }}
        className="absolute left-[-10%] top-[58%] h-20 w-[120%] rotate-[8deg] bg-[linear-gradient(90deg,transparent,rgba(190,242,100,0.13),rgba(124,58,237,0.16),transparent)] blur-2xl"
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, 60, -20, 0], y: [0, -40, 30, 0] }}
        className="absolute left-[8%] top-[14%] h-52 w-52 rounded-full bg-fuchsia-500/24 blur-3xl"
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, -45, 35, 0], y: [0, 35, -30, 0] }}
        className="absolute right-[10%] top-[8%] h-64 w-64 rounded-full bg-cyan-400/18 blur-3xl"
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, 30, -60, 0], y: [0, 45, -20, 0] }}
        className="absolute bottom-[14%] left-[40%] h-56 w-56 rounded-full bg-lime-300/14 blur-3xl"
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map(([left, top, index]) => (
        <motion.span
          animate={reduceMotion ? undefined : { opacity: [0.16, 0.85, 0.2], scale: [0.8, 1.35, 0.9], y: [0, -18, 0] }}
          className="absolute size-1.5 rounded-full bg-white/60 shadow-[0_0_18px_rgba(255,255,255,0.55)]"
          key={`${left}-${top}`}
          style={{ left, top }}
          transition={{ delay: index * 0.34, duration: 4 + index * 0.22, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
