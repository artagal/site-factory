"use client";

import { useEffect, useState } from "react";
import { getCurrentLevelProgress } from "../../lib/xp";
import { getLocalProgress } from "../../lib/localStorage";
import type { GoFunMotionUserProgress } from "../../types/user";
import { BadgeGrid } from "./BadgeGrid";
import { StreakCounter } from "./StreakCounter";
import { XPBadge } from "./XPBadge";

export function ProfileStats() {
  const [progress, setProgress] = useState<GoFunMotionUserProgress | null>(null);

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  if (!progress) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-white/60">Loading progress...</div>;
  }

  const levelProgress = getCurrentLevelProgress(progress.xp);

  return (
    <div className="grid gap-5">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Profile</p>
            <h1 className="mt-2 text-4xl font-black text-white">{progress.displayName}</h1>
          </div>
          <StreakCounter streak={progress.streak} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <XPBadge label="XP" value={progress.xp} />
          <XPBadge label="Level" value={progress.level} />
          <XPBadge label="Completed" value={progress.totalChallengesCompleted} />
          <XPBadge label="Saved" value={progress.savedChallengeIds.length} />
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs font-black uppercase tracking-[0.14em] text-white/45">
            <span>Level {levelProgress.level}</span>
            <span>{levelProgress.percent}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300" style={{ width: `${levelProgress.percent}%` }} />
          </div>
        </div>
      </div>
      <BadgeGrid badges={progress.badges} />
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
        <h2 className="text-2xl font-black text-white">Challenge history</h2>
        <div className="mt-4 grid gap-3">
          {progress.completedChallenges.length ? (
            progress.completedChallenges.slice(0, 8).map((completion) => (
              <div className="rounded-2xl bg-black/24 p-4" key={completion.completedAt + completion.challengeId}>
                <p className="font-black text-white">{completion.title}</p>
                <p className="mt-1 text-sm text-white/52">{completion.category} · +{completion.xpEarned} XP</p>
              </div>
            ))
          ) : (
            <p className="text-white/58">Generate and complete your first challenge to start your history.</p>
          )}
        </div>
      </div>
    </div>
  );
}
