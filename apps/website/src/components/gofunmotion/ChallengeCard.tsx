"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle2, Clock, Copy, Quote, Share2, Sparkles, Trophy } from "lucide-react";
import { completeChallengeLocally, saveChallengeLocally } from "../../lib/localStorage";
import { createShareText } from "../../lib/challengeEngine";
import { formatMinutes } from "../../lib/utils";
import type { Challenge } from "../../types/challenge";
import { Button } from "./Button";

export function ChallengeCard({
  challenge,
  onGenerateAnother
}: {
  challenge: Challenge;
  onGenerateAnother?: () => void;
}) {
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <motion.article
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.055))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-6"
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      key={challenge.id}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-fuchsia-500/28 blur-3xl" />
      <div className="absolute -bottom-16 left-10 h-52 w-52 rounded-full bg-cyan-400/14 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-black">
              Mission card
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
              {challenge.category}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
            <Trophy aria-hidden="true" size={15} />
            {challenge.xpReward} XP
          </span>
        </div>
        <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/28 p-5">
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
          {challenge.safetyNote}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            className="w-full"
            onClick={() => {
              completeChallengeLocally(challenge);
              setCompleted(true);
            }}
          >
            {completed ? "Completed +" + challenge.xpReward + " XP" : "Start"}
          </Button>
          {onGenerateAnother ? (
            <Button className="w-full" onClick={onGenerateAnother} variant="ghost">
              Another
            </Button>
          ) : null}
          <Button
            aria-label="Save challenge"
            className="w-full"
            onClick={() => saveChallengeLocally(challenge)}
            variant="ghost"
          >
            <Bookmark aria-hidden="true" size={18} />
            Save
          </Button>
          <Button aria-label="Share challenge" className="w-full" onClick={shareChallenge} variant="ghost">
            {copied ? <Copy aria-hidden="true" size={18} /> : <Share2 aria-hidden="true" size={18} />}
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      </div>
      {completed ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-2xl border border-lime-300/30 bg-lime-300/12 p-4 text-sm font-bold leading-6 text-lime-100"
          initial={{ opacity: 0, y: 8 }}
        >
          Mission complete. XP added locally. Next: write one sentence about how it felt in your profile.
        </motion.div>
      ) : null}
    </motion.article>
  );
}
