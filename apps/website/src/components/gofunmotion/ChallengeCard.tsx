"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle2, Clock, Copy, Share2, Sparkles, Trophy } from "lucide-react";
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
      className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.08] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      key={challenge.id}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-fuchsia-500/24 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-black">
            {challenge.category}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
            <Trophy aria-hidden="true" size={15} />
            {challenge.xpReward} XP
          </span>
        </div>
        <h2 className="mt-5 text-3xl font-black leading-tight text-white md:text-5xl">{challenge.title}</h2>
        <p className="mt-4 text-base leading-7 text-white/72">{challenge.description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Clock, label: formatMinutes(challenge.timeEstimateMinutes) },
            { icon: Sparkles, label: challenge.difficulty },
            { icon: CheckCircle2, label: challenge.intensity }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-2xl border border-white/10 bg-black/24 p-4" key={item.label}>
                <Icon aria-hidden="true" className="text-cyan-300" size={18} />
                <p className="mt-2 text-sm font-black capitalize text-white">{item.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl bg-black/24 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">Why this helps</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{challenge.whyItHelps}</p>
        </div>
        <div className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm leading-6 text-lime-100">
          {challenge.safetyNote}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              completeChallengeLocally(challenge);
              setCompleted(true);
            }}
          >
            {completed ? "Completed +" + challenge.xpReward + " XP" : "Start challenge"}
          </Button>
          {onGenerateAnother ? (
            <Button onClick={onGenerateAnother} variant="ghost">
              Generate another
            </Button>
          ) : null}
          <Button
            aria-label="Save challenge"
            onClick={() => saveChallengeLocally(challenge)}
            variant="ghost"
          >
            <Bookmark aria-hidden="true" size={18} />
            Save
          </Button>
          <Button aria-label="Share challenge" onClick={shareChallenge} variant="ghost">
            {copied ? <Copy aria-hidden="true" size={18} /> : <Share2 aria-hidden="true" size={18} />}
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      </div>
      {completed ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-2xl border border-lime-300/30 bg-lime-300/12 p-4 text-sm font-bold text-lime-100"
          initial={{ opacity: 0, y: 8 }}
        >
          Mission accepted. Add a reflection from your profile after you do it.
        </motion.div>
      ) : null}
    </motion.article>
  );
}
