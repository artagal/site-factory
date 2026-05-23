"use client";

import { useEffect, useState } from "react";
import { getLocalProgress } from "../../lib/localStorage";
import { progressUpdatedEvent } from "../../lib/progressActions";
import { getCurrentLevelProgress } from "../../lib/xp";
import type { GoFunMotionUserProgress } from "../../types/user";
import { BadgeGrid } from "./BadgeGrid";
import { StreakCounter } from "./StreakCounter";
import { XPBadge } from "./XPBadge";

export function ProfileStats() {
  const [progress, setProgress] = useState<GoFunMotionUserProgress | null>(null);

  useEffect(() => {
    const refreshProgress = () => setProgress(getLocalProgress());

    refreshProgress();
    window.addEventListener(progressUpdatedEvent, refreshProgress);

    return () => window.removeEventListener(progressUpdatedEvent, refreshProgress);
  }, []);

  if (!progress) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-white/60">Loading progress...</div>;
  }

  const levelProgress = getCurrentLevelProgress(progress.xp);

  return (
    <div className="grid gap-5">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <div className="absolute -right-14 -top-14 size-48 rounded-full bg-lime-300/14 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Profile</p>
            <h1 className="mt-2 text-4xl font-black text-white">{progress.displayName}</h1>
            <p className="mt-2 text-sm font-bold text-white/52">Save your momentum with one click when Firebase is configured.</p>
          </div>
          <StreakCounter streak={progress.streak} />
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-5">
          <XPBadge label="XP" value={progress.xp} />
          <XPBadge label="Level" value={progress.level} />
          <XPBadge label="Completed" value={progress.totalChallengesCompleted} />
          <XPBadge label="Saved" value={progress.savedChallengeIds.length} />
          <XPBadge label="Momentum" value={progress.momentumScore} />
        </div>
        <div className="relative mt-6">
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

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Favorite modes</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {progress.favoriteCategories.length ? (
              progress.favoriteCategories.map((category) => (
                <span className="rounded-full bg-lime-300/12 px-4 py-2 text-sm font-black text-lime-100" key={category}>
                  {category}
                </span>
              ))
            ) : (
              <p className="text-sm font-bold text-white/52">Complete a few missions to reveal your pattern.</p>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Saved missions</h2>
          <div className="mt-4 grid gap-3">
            {progress.savedChallenges.length ? (
              progress.savedChallenges.slice(0, 4).map((challenge) => (
                <div className="rounded-2xl bg-black/24 p-4" key={challenge.id}>
                  <p className="font-black text-white">{challenge.title}</p>
                  <p className="mt-1 text-sm text-white/52">{challenge.category} - {challenge.rarity} - +{challenge.xpReward} XP</p>
                </div>
              ))
            ) : (
              <p className="text-sm font-bold text-white/52">Save a challenge from the generator to build your maybe-later stack.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
        <h2 className="text-2xl font-black text-white">Challenge history</h2>
        <div className="mt-4 grid gap-3">
          {progress.completedChallenges.length ? (
            progress.completedChallenges.slice(0, 8).map((completion) => (
              <div className="rounded-2xl bg-black/24 p-4" key={completion.completedAt + completion.challengeId}>
                <p className="font-black text-white">{completion.title}</p>
                <p className="mt-1 text-sm text-white/52">{completion.category} - {completion.rarity} - +{completion.xpEarned} XP</p>
                {completion.reflection ? <p className="mt-2 text-sm font-semibold text-white/64">{completion.reflection}</p> : null}
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
