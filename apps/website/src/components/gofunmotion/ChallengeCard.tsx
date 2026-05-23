"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, CheckCircle2, Clock, Copy, Quote, Share2, Sparkles, Trophy, Zap } from "lucide-react";
import { createShareText } from "../../lib/challengeEngine";
import { completeChallengeWithSync, saveChallengeWithSync } from "../../lib/progressActions";
import { getRarityXpBonus } from "../../lib/rarity";
import { formatMinutes } from "../../lib/utils";
import type { Challenge, ChallengeRarity } from "../../types/challenge";
import type { GoFunMotionUserProgress } from "../../types/user";
import { Button, LinkButton } from "./Button";

const rarityStyles: Record<ChallengeRarity, { glow: string; ring: string; text: string }> = {
  Common: {
    glow: "shadow-[0_0_70px_rgba(255,255,255,0.08)]",
    ring: "from-white/18 via-white/4 to-white/18",
    text: "text-white/72"
  },
  Epic: {
    glow: "shadow-[0_0_90px_rgba(247,37,133,0.2)]",
    ring: "from-fuchsia-300/70 via-cyan-300/20 to-fuchsia-300/70",
    text: "text-fuchsia-100"
  },
  Legendary: {
    glow: "shadow-[0_0_110px_rgba(190,242,100,0.24)]",
    ring: "from-lime-300 via-cyan-300/30 to-fuchsia-300",
    text: "text-lime-100"
  },
  Rare: {
    glow: "shadow-[0_0_82px_rgba(0,212,255,0.18)]",
    ring: "from-cyan-300/70 via-white/10 to-cyan-300/70",
    text: "text-cyan-100"
  }
};

export function ChallengeCard({
  challenge,
  isRevealing = false,
  onGenerateAnother
}: {
  challenge: Challenge;
  isRevealing?: boolean;
  onGenerateAnother?: () => void;
}) {
  const [completed, setCompleted] = useState(false);
  const [completionProgress, setCompletionProgress] = useState<GoFunMotionUserProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"complete" | "save" | null>(null);
  const [started, setStarted] = useState(false);
  const rarity = challenge.rarity;
  const rarityStyle = rarityStyles[rarity];
  const totalXpReward = challenge.xpReward + getRarityXpBonus(rarity);
  const unlockedBadges = completionProgress?.badges.slice(0, 3) ?? [];

  async function shareChallenge() {
    const text = createShareText(challenge);

    if (navigator.share) {
      await navigator.share({ text, title: challenge.title, url: "https://gofunmotion.com" });
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function handleSave() {
    if (busyAction) return;

    setBusyAction("save");
    const result = await saveChallengeWithSync(challenge);
    setSaved(true);
    setSyncMessage(
      result.error ??
        (result.synced
          ? "Saved to your Firebase momentum profile."
          : "Saved locally. Sign in to sync this mission across devices.")
    );
    window.setTimeout(() => setSyncMessage(""), 3400);
    setBusyAction(null);
  }

  async function handleComplete() {
    if (!started) {
      setStarted(true);
      setSyncMessage("Mission started. Do the real thing, then come back and mark it complete.");
      window.setTimeout(() => setSyncMessage(""), 2600);
      return;
    }

    if (completed || busyAction) return;

    setBusyAction("complete");
    const result = await completeChallengeWithSync(challenge, reflection);
    setCompletionProgress(result.progress);
    setCompleted(true);
    setSyncMessage(
      result.error ??
        (result.synced
          ? "Completion synced to Firebase."
          : "Completion saved locally. Sign in to keep your momentum across devices.")
    );
    window.setTimeout(() => setSyncMessage(""), 4200);
    setBusyAction(null);
  }

  return (
    <motion.article
      animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] p-5 shadow-[0_28px_110px_rgba(0,0,0,0.46)] backdrop-blur-2xl md:p-6 ${rarityStyle.glow}`}
      exit={{ opacity: 0, rotateX: -6, scale: 0.96, y: 20 }}
      initial={{ opacity: 0, rotateX: 8, scale: 0.94, y: 28 }}
      transition={{ duration: 0.45, ease: [0.18, 0.9, 0.22, 1] }}
      whileHover={{ rotateX: 1.5, rotateY: -1.5, scale: 1.01 }}
    >
      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        className={`absolute -inset-px rounded-[2rem] bg-gradient-to-r ${rarityStyle.ring} opacity-30`}
        transition={{ duration: 9, ease: "linear", repeat: Infinity }}
      />
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[#070816]/72" />
      <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-fuchsia-500/28 blur-3xl" />
      <div className="absolute -bottom-16 left-10 h-52 w-52 rounded-full bg-cyan-400/14 blur-3xl" />
      <motion.div
        aria-hidden="true"
        animate={isRevealing ? { opacity: [0.2, 0.9, 0.25], scale: [0.94, 1.03, 1] } : { opacity: 0.35, scale: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(190,242,100,0.18),transparent_34%),linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]"
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      <AnimatePresence>
        {isRevealing ? (
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.92, 1.04, 1.1] }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/38 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.85 }}
          >
            <div className="rounded-full border border-lime-300/40 bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_0_80px_rgba(190,242,100,0.42)]">
              Mission incoming
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-black">
              Live mission
            </span>
            <span className={`rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${rarityStyle.text}`}>
              {rarity}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
              {challenge.category}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
            <Trophy aria-hidden="true" size={15} />
            Momentum +{totalXpReward}
          </span>
        </div>
        <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/28 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-black">
              <Quote aria-hidden="true" size={19} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/38">gofunmotion.com</p>
          </div>
          <h2 className="text-4xl font-black leading-[0.98] text-white md:text-6xl">
            {challenge.title}
          </h2>
          <p className="mt-4 text-lg font-semibold leading-8 text-white/82">{challenge.description}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Clock, label: formatMinutes(challenge.timeEstimateMinutes) },
            { icon: Sparkles, label: challenge.difficulty },
            { icon: CheckCircle2, label: challenge.intensity }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4" key={item.label}>
                <Icon aria-hidden="true" className="text-cyan-300" size={18} />
                <p className="mt-2 text-sm font-black capitalize text-white">{item.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl bg-white/8 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-100">Why this helps</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/78">{challenge.whyItHelps}</p>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/28 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Shareable line</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
            I replaced scrolling with real life today. My GoFunMotion mission: {challenge.title}.
          </p>
        </div>
        <div className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm font-semibold leading-6 text-lime-50">
          This is the core loop: start it, do the real thing, come back, complete it. {challenge.safetyNote}
        </div>
        <AnimatePresence>
          {started && !completed ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-[1.35rem] border border-cyan-300/20 bg-cyan-300/10 p-4"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Mission active</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                Finish the mission in real life, then add one quick note before completing it.
              </p>
              <label className="mt-4 block text-xs font-black uppercase tracking-[0.14em] text-white/42" htmlFor={`reflection-${challenge.id}`}>
                How did it feel?
              </label>
              <textarea
                className="mt-2 min-h-20 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/32 focus:border-cyan-300/40"
                id={`reflection-${challenge.id}`}
                onChange={(event) => setReflection(event.target.value)}
                placeholder="Optional. One sentence is enough."
                value={reflection}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            className="w-full"
            disabled={busyAction === "complete" || completed}
            onClick={handleComplete}
          >
            {completed ? "Completed" : busyAction === "complete" ? "Saving..." : started ? "Complete" : "Start"}
          </Button>
          {onGenerateAnother ? (
            <Button className="w-full" onClick={onGenerateAnother} variant="ghost">
              Another
            </Button>
          ) : null}
          <Button
            aria-label="Save challenge"
            className="w-full"
            disabled={busyAction === "save"}
            onClick={handleSave}
            variant="ghost"
          >
            <Bookmark aria-hidden="true" size={18} />
            {busyAction === "save" ? "Saving..." : saved ? "Saved" : "Save"}
          </Button>
          <Button aria-label="Share challenge" className="w-full" onClick={shareChallenge} variant="ghost">
            {copied ? <Copy aria-hidden="true" size={18} /> : <Share2 aria-hidden="true" size={18} />}
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      </div>
      {completed ? (
        <div className="relative">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.8], x: (dot - 3.5) * 18, y: [-4, -42 - (dot % 3) * 10] }}
              className="absolute left-1/2 top-2 size-2 rounded-full bg-lime-300"
              key={dot}
              transition={{ duration: 0.95, ease: "easeOut" }}
            />
          ))}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-[1.5rem] border border-lime-300/30 bg-lime-300/12 p-5 text-sm font-bold leading-6 text-lime-100"
            initial={{ opacity: 0, y: 8 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-base text-white">
                <Zap aria-hidden="true" size={18} />
                Momentum +{completionProgress?.completedChallenges[0]?.xpEarned ?? totalXpReward}
              </span>
              <span className="rounded-full bg-black/28 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-lime-100">
                Streak {completionProgress?.streak ?? 1}
              </span>
            </div>
            <p className="mt-3 text-lime-100/82">You did one real thing. That counts. Scrolling interrupted.</p>
            {unlockedBadges.length ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/26 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-lime-100/52">Badge progress</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {unlockedBadges.map((badge) => (
                    <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-black" key={badge.id}>
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {reflection ? (
              <div className="mt-4 rounded-2xl border border-lime-300/20 bg-black/26 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-lime-100/52">Reflection</p>
                <p className="mt-2 text-sm font-semibold text-white/76">{reflection}</p>
              </div>
            ) : null}
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Button onClick={shareChallenge} variant="secondary">
                <Share2 aria-hidden="true" size={18} />
                Share win
              </Button>
              <Button disabled={busyAction === "save"} onClick={handleSave} variant="ghost">
                {saved ? "Mission saved" : "Save mission"}
              </Button>
              <LinkButton className="min-h-12" href="/login" showArrow={false} variant="ghost">
                Sign in
              </LinkButton>
            </div>
          </motion.div>
        </div>
      ) : null}
      {syncMessage ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold leading-6 text-cyan-50"
          initial={{ opacity: 0, y: 8 }}
        >
          {syncMessage}
        </motion.div>
      ) : null}
    </motion.article>
  );
}
