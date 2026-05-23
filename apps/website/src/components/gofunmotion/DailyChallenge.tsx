"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, SunMedium } from "lucide-react";
import { completeChallengeLocally } from "../../lib/localStorage";
import type { Challenge } from "../../types/challenge";
import { Button } from "./Button";

export const dailyChallenge: Challenge = {
  category: "Mind Reset",
  description:
    "Step outside for 10 minutes before sunset. Take one photo. Do not post it immediately. Just enjoy it first.",
  difficulty: "easy",
  id: "daily-sunset-reset",
  intensity: "low",
  locationType: ["outside", "anywhere"],
  moodTags: ["tired", "bored", "anxious"],
  safetyNote: "Choose a safe public or private place. Do not look at the sun directly.",
  timeEstimateMinutes: 10,
  title: "Today’s Mission: Sunset Reset",
  whyItHelps: "Pausing before posting turns a digital impulse into an actual memory.",
  xpReward: 50
};

export function DailyChallengeCard({ large = false }: { large?: boolean }) {
  const [accepted, setAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <motion.article
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(247,37,133,0.18),rgba(0,212,255,0.12),rgba(190,242,100,0.08))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      whileHover={{ y: -4 }}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-300 text-black">
            <SunMedium aria-hidden="true" size={25} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Daily global challenge</p>
            <p className="text-sm font-bold text-lime-200">1,284 accepted · 719 completed</p>
          </div>
        </div>
        <h2 className={`mt-6 font-black leading-tight text-white ${large ? "text-5xl" : "text-3xl"}`}>
          {dailyChallenge.title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">{dailyChallenge.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => setAccepted(true)}>{accepted ? "Accepted" : "Accept challenge"}</Button>
          <Button
            onClick={() => {
              completeChallengeLocally(dailyChallenge);
              setCompleted(true);
            }}
            variant="secondary"
          >
            {completed ? "Completed +50 XP" : "Mark complete"}
          </Button>
          <Button variant="ghost">
            <Share2 aria-hidden="true" size={18} />
            Share
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
