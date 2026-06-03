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
    <div aria-hidden="true" className="motion-background pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="motion-background__wash absolute inset-0" />
      <div className="motion-background__grid absolute inset-0 bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <motion.div
        animate={reduceMotion ? undefined : { x: ["-12%", "10%", "-6%"], opacity: [0.12, 0.34, 0.16] }}
        className="motion-background__beam motion-background__beam-one absolute left-[-12%] top-[28%] h-24 w-[120%] rotate-[-10deg] blur-2xl"
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: ["8%", "-10%", "4%"], opacity: [0.08, 0.28, 0.1] }}
        className="motion-background__beam motion-background__beam-two absolute left-[-10%] top-[58%] h-20 w-[120%] rotate-[8deg] blur-2xl"
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, 60, -20, 0], y: [0, -40, 30, 0] }}
        className="motion-background__glow motion-background__glow-pink absolute left-[8%] top-[14%] h-52 w-52 rounded-full blur-3xl"
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, -45, 35, 0], y: [0, 35, -30, 0] }}
        className="motion-background__glow motion-background__glow-cyan absolute right-[10%] top-[8%] h-64 w-64 rounded-full blur-3xl"
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={reduceMotion ? undefined : { x: [0, 30, -60, 0], y: [0, 45, -20, 0] }}
        className="motion-background__glow motion-background__glow-lime absolute bottom-[14%] left-[40%] h-56 w-56 rounded-full blur-3xl"
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map(([left, top, index]) => (
        <motion.span
          animate={reduceMotion ? undefined : { opacity: [0.16, 0.85, 0.2], scale: [0.8, 1.35, 0.9], y: [0, -18, 0] }}
          className="motion-background__particle absolute size-1.5 rounded-full"
          key={`${left}-${top}`}
          style={{ left, top }}
          transition={{ delay: index * 0.34, duration: 4 + index * 0.22, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
