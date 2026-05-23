"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { getRarityXpBonus } from "../../lib/rarity";
import type { Challenge, ChallengeRarity } from "../../types/challenge";

const reelRows = [
  ["Touch Grass Sprint", "Text the Friend", "Sunset Reset", "Tiny Courage Mission", "City Side Quest", "No-Phone Walk"],
  ["Anti-Doomscroll", "Move", "Explore", "Social", "Confidence", "Mind Reset"],
  ["+30 XP", "+40 XP", "+60 XP", "+80 XP", "+100 XP", "+150 XP"]
];

const rarityTone: Record<ChallengeRarity, string> = {
  Common: "from-white/70 via-white/20 to-white/70 text-white",
  Epic: "from-fuchsia-300 via-cyan-200 to-fuchsia-300 text-fuchsia-50",
  Legendary: "from-lime-300 via-cyan-200 to-fuchsia-300 text-lime-50",
  Rare: "from-cyan-300 via-white/30 to-cyan-300 text-cyan-50"
};

export function MissionMachine({
  challenge,
  delightMessage,
  isSpinning,
  onSoundToggle,
  soundEnabled,
  spinRound
}: {
  challenge: Challenge;
  delightMessage: string;
  isSpinning: boolean;
  onSoundToggle: () => void;
  soundEnabled: boolean;
  spinRound: number;
}) {
  const reduceMotion = useReducedMotion();
  const totalXp = challenge.xpReward + getRarityXpBonus(challenge.rarity);
  const hasSpun = spinRound > 0;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/32 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(190,242,100,0.18),transparent_32%),linear-gradient(120deg,rgba(247,37,133,0.14),rgba(0,212,255,0.12),rgba(190,242,100,0.1))]" />
      <motion.div
        aria-hidden="true"
        animate={isSpinning && !reduceMotion ? { opacity: [0.15, 0.6, 0.2], x: ["-30%", "38%", "100%"] } : { opacity: 0.18, x: "0%" }}
        className="absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        transition={{ duration: 1.05, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-lime-200">
            <Sparkles aria-hidden="true" size={15} />
            Mission machine
          </p>
          <p className="mt-2 text-sm font-bold text-white/58">
            Spin, reveal rarity, then do one real thing before the feed pulls you back.
          </p>
        </div>
        <button
          aria-label={soundEnabled ? "Turn sound off" : "Turn sound on"}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-lime-300"
          onClick={onSoundToggle}
          type="button"
        >
          {soundEnabled ? <Volume2 aria-hidden="true" size={15} /> : <VolumeX aria-hidden="true" size={15} />}
          {soundEnabled ? "Sound ready" : "Sound off"}
        </button>
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
        {reelRows.map((rows, reelIndex) => (
          <div
            className="relative h-24 overflow-hidden rounded-3xl border border-white/10 bg-black/46 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            key={`reel-${reelIndex}`}
          >
            <motion.div
              animate={
                isSpinning && !reduceMotion
                  ? { y: ["0%", "-72%", "-18%", "-62%"] }
                  : { y: `${-((spinRound + reelIndex) % rows.length) * 2.65}rem` }
              }
              className="grid gap-3"
              transition={
                isSpinning
                  ? { delay: reelIndex * 0.08, duration: 1.05 + reelIndex * 0.08, ease: [0.18, 0.9, 0.22, 1] }
                  : { duration: 0.35 }
              }
            >
              {[...rows, ...rows, ...rows].map((title, index) => (
                <p className="h-8 whitespace-nowrap text-lg font-black text-white" key={`${title}-${index}`}>
                  {title}
                </p>
              ))}
            </motion.div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black to-transparent" />
          </div>
        ))}
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <AnimatePresence mode="wait">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-black/30 px-4 py-3 text-sm font-black text-white/76"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={delightMessage}
            transition={{ duration: 0.28 }}
          >
            {isSpinning ? "Real life is loading..." : delightMessage}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isSpinning && hasSpun ? (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3"
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              key={`${challenge.id}-${challenge.rarity}`}
              transition={{ duration: 0.4, ease: [0.18, 0.9, 0.22, 1] }}
            >
              <motion.div
                aria-hidden="true"
                animate={{ x: ["-120%", "120%"] }}
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/22 to-transparent"
                transition={{ duration: 0.75, ease: "easeOut" }}
              />
              <p className="relative text-xs font-black uppercase tracking-[0.14em] text-white/42">Rarity reveal</p>
              <p className={`relative mt-1 bg-gradient-to-r bg-clip-text text-2xl font-black text-transparent ${rarityTone[challenge.rarity]}`}>
                {challenge.rarity}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSpinning ? (
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.92, 1.04, 1.1] }}
            className="absolute inset-0 flex items-center justify-center bg-black/42 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.95 }}
          >
            <div className="rounded-full border border-lime-300/40 bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_0_80px_rgba(190,242,100,0.42)]">
              Drawing mission
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!isSpinning && hasSpun ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-black shadow-[0_0_60px_rgba(190,242,100,0.32)]"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
          >
            <Zap aria-hidden="true" size={16} />
            +{totalXp} XP
            <Trophy aria-hidden="true" size={16} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
