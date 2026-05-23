"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Share2, SunMedium, Timer, Trophy } from "lucide-react";
import { trackEvent } from "../../lib/analytics";
import { createShareText } from "../../lib/challengeEngine";
import { acceptDailyChallengeLocally, completeDailyChallengeLocally, dailyChallenge, getDailyDateId, getDailyStatus } from "../../lib/dailyChallenge";
import { completeChallengeWithSync } from "../../lib/progressActions";
import { Button } from "./Button";

export function DailyMissionBanner() {
  const dateId = useMemo(() => getDailyDateId(), []);
  const [dailyStatus, setDailyStatus] = useState(() => getDailyStatus(dateId));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function acceptMission() {
    setDailyStatus(acceptDailyChallengeLocally(dateId));
    trackEvent("challenge_started", {
      category: dailyChallenge.category,
      challengeId: dailyChallenge.id,
      date: dateId,
      placement: "home_daily_banner",
      rarity: dailyChallenge.rarity,
      title: dailyChallenge.title
    });
    setStatus("Accepted. Finish it today to keep your streak signal moving.");
  }

  async function completeMission() {
    if (busy || dailyStatus.completed) return;

    setBusy(true);
    const result = await completeChallengeWithSync(dailyChallenge, "", "daily");
    setDailyStatus(completeDailyChallengeLocally(dateId));
    setStatus(result.synced ? "Synced to your profile." : "Saved locally. Sign in later to sync.");
    trackEvent("challenge_completed", {
      category: dailyChallenge.category,
      challengeId: dailyChallenge.id,
      date: dateId,
      placement: "home_daily_banner",
      rarity: dailyChallenge.rarity,
      synced: result.synced,
      title: dailyChallenge.title,
      totalCompleted: result.progress.totalChallengesCompleted,
      xpEarned: result.progress.completedChallenges[0]?.xpEarned ?? dailyChallenge.xpReward
    });
    setBusy(false);
  }

  async function shareMission() {
    const text = createShareText(dailyChallenge);
    const canUseNativeShare = "share" in navigator;
    const method = canUseNativeShare ? "web_share" : "clipboard";

    trackEvent("challenge_shared", {
      category: dailyChallenge.category,
      challengeId: dailyChallenge.id,
      date: dateId,
      method,
      placement: "home_daily_banner",
      rarity: dailyChallenge.rarity,
      title: dailyChallenge.title
    });

    if (canUseNativeShare) {
      await navigator.share({ text, title: dailyChallenge.title, url: "https://gofunmotion.com/daily" });
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus("Mission copied.");
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 py-4 md:px-8"
      initial={{ opacity: 0, y: 10 }}
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-orange-200/20 bg-[linear-gradient(120deg,rgba(251,146,60,0.16),rgba(0,212,255,0.1),rgba(190,242,100,0.1))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200/60 to-transparent" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-200 text-black">
              <SunMedium aria-hidden="true" size={25} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-100">Today&apos;s global mission</p>
              <h2 className="mt-1 text-2xl font-black leading-tight text-white md:text-3xl">Sunset Reset</h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/68">
                Step outside before sunset for 10 minutes. Notice 3 things you normally ignore.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[auto_auto_auto] lg:items-center">
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-white/68">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/28 px-3 py-2">
                <Trophy aria-hidden="true" size={15} />
                +60 XP
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/28 px-3 py-2">
                <Timer aria-hidden="true" size={15} />
                719 completed
              </span>
            </div>
            <Button onClick={acceptMission} variant={dailyStatus.accepted ? "secondary" : "primary"}>
              {dailyStatus.accepted ? (
                <>
                  <CheckCircle2 aria-hidden="true" size={18} />
                  Accepted
                </>
              ) : (
                "Accept"
              )}
            </Button>
            <div className="flex gap-2">
              <Button disabled={busy || dailyStatus.completed} onClick={completeMission} variant="secondary">
                {dailyStatus.completed ? "Completed" : busy ? "Saving..." : "Done"}
              </Button>
              <Button aria-label="Share daily mission" onClick={shareMission} variant="ghost">
                <Share2 aria-hidden="true" size={18} />
              </Button>
            </div>
          </div>
        </div>
        {status ? <p className="relative mt-3 text-sm font-bold text-lime-100">{status}</p> : null}
      </div>
    </motion.section>
  );
}
