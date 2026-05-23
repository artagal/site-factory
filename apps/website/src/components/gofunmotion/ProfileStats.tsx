"use client";

import { useEffect, useState } from "react";
import { Bookmark, CheckCircle2, Flame, History, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { getLocalProgress } from "../../lib/localStorage";
import { progressUpdatedEvent } from "../../lib/progressActions";
import { getCurrentLevelProgress } from "../../lib/xp";
import type { GoFunMotionRecentActivity, GoFunMotionUserProgress } from "../../types/user";
import { BadgeGrid } from "./BadgeGrid";
import { LinkButton } from "./Button";
import { StreakCounter } from "./StreakCounter";
import { XPBadge } from "./XPBadge";

const activityIcons: Record<GoFunMotionRecentActivity["type"], typeof CheckCircle2> = {
  badge: Trophy,
  completed: CheckCircle2,
  saved: Bookmark
};

function momentumLabel(score: number) {
  if (score >= 80) return "High motion";
  if (score >= 45) return "Building";
  if (score > 0) return "Started";
  return "Ready";
}

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "recently";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short"
  }).format(date);
}

function MomentumRing({ score }: { score: number }) {
  return (
    <div
      className="relative flex size-36 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#bef264 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
      }}
    >
      <div className="flex size-[7.6rem] flex-col items-center justify-center rounded-full bg-[#070816] text-center">
        <p className="text-4xl font-black text-white">{score}</p>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">Momentum</p>
      </div>
    </div>
  );
}

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
  const xpToNextLevel = Math.max(0, levelProgress.nextFloor - progress.xp);
  const latestCompletion = progress.completedChallenges[0];
  const latestBadge = progress.badges.at(-1);

  return (
    <div className="grid gap-5">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(190,242,100,0.12),rgba(0,212,255,0.08),rgba(247,37,133,0.1))] p-5 backdrop-blur-2xl md:p-6">
        <div className="absolute -right-14 -top-14 size-56 rounded-full bg-lime-300/14 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 size-64 rounded-full bg-fuchsia-400/12 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Momentum profile</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-6xl">{progress.displayName}</h1>
            <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-white/62">
              Complete missions to raise XP, unlock badges, build streaks, and make your real-life motion visible.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LinkButton href="/challenge">Generate mission</LinkButton>
              <LinkButton href="/login" variant="ghost">Sync progress</LinkButton>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <MomentumRing score={progress.momentumScore} />
            <StreakCounter streak={progress.streak} />
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-5">
          <XPBadge label="XP" value={progress.xp} />
          <XPBadge label="Level" value={progress.level} />
          <XPBadge label="Completed" value={progress.totalChallengesCompleted} />
          <XPBadge label="Saved" value={progress.savedChallengeIds.length} />
          <XPBadge label="Badges" value={progress.badges.length} />
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
            <div className="flex justify-between gap-3 text-xs font-black uppercase tracking-[0.14em] text-white/45">
              <span>Level {levelProgress.level}</span>
              <span>{xpToNextLevel} XP to level {levelProgress.level + 1}</span>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300" style={{ width: `${levelProgress.percent}%` }} />
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-lime-300/20 bg-lime-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-lime-200">{momentumLabel(progress.momentumScore)}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-lime-50">
              {latestCompletion ? `Last completed: ${latestCompletion.title}` : "Complete one mission to start your motion history."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-lime-300 text-black">
              <Target aria-hidden="true" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Favorite modes</h2>
              <p className="text-sm font-bold text-white/42">Based on completed missions.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {progress.categoryStats.length ? (
              progress.categoryStats.slice(0, 5).map((stat) => {
                const percent = Math.max(8, Math.round((stat.count / progress.totalChallengesCompleted) * 100));

                return (
                  <div className="rounded-2xl bg-black/24 p-4" key={stat.category}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-white">{stat.category}</p>
                      <p className="text-sm font-black text-lime-200">{stat.count} done</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-lime-300" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white/42">{stat.xp} XP from this mode</p>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/52">Complete a few missions to reveal your pattern.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300 text-black">
              <History aria-hidden="true" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Recent activity</h2>
              <p className="text-sm font-bold text-white/42">Completions, saves, and badge unlocks.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {progress.recentActivity.length ? (
              progress.recentActivity.slice(0, 7).map((activity) => {
                const Icon = activityIcons[activity.type];

                return (
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-black/24 p-4" key={activity.id}>
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-black">
                      <Icon aria-hidden="true" size={18} />
                    </div>
                    <div>
                      <p className="font-black text-white">{activity.title}</p>
                      <p className="mt-1 text-sm font-semibold text-white/48">{activity.detail}</p>
                    </div>
                    <div className="text-right">
                      {activity.xp ? <p className="text-sm font-black text-lime-200">+{activity.xp}</p> : null}
                      <p className="text-xs font-bold text-white/38">{formatActivityDate(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/52">No activity yet. Generate your first mission.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-fuchsia-300 text-black">
              <Zap aria-hidden="true" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Completed challenge history</h2>
              <p className="text-sm font-bold text-white/42">Your proof that the scroll loop broke.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {progress.completedChallenges.length ? (
              progress.completedChallenges.slice(0, 8).map((completion) => (
                <div className="rounded-2xl bg-black/24 p-4" key={completion.completedAt + completion.challengeId}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black text-white">{completion.title}</p>
                    <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-black">+{completion.xpEarned} XP</span>
                  </div>
                  <p className="mt-1 text-sm text-white/52">{completion.category} - {completion.rarity} - {formatActivityDate(completion.completedAt)}</p>
                  {completion.reflection ? <p className="mt-2 text-sm font-semibold text-white/64">{completion.reflection}</p> : null}
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-black/24 p-4 text-white/58">Generate and complete your first challenge to start your history.</p>
            )}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-black">
                <Bookmark aria-hidden="true" size={20} />
              </div>
              <h2 className="text-2xl font-black text-white">Saved missions</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {progress.savedChallenges.length ? (
                progress.savedChallenges.slice(0, 5).map((challenge) => (
                  <div className="rounded-2xl bg-black/24 p-4" key={challenge.id}>
                    <p className="font-black text-white">{challenge.title}</p>
                    <p className="mt-1 text-sm text-white/52">{challenge.category} - {challenge.rarity} - +{challenge.xpReward} XP</p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-bold text-white/52">Save a mission from the generator to build your maybe-later stack.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-lime-300/20 bg-lime-300/10 p-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-lime-300 text-black">
                <Sparkles aria-hidden="true" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Latest unlock</h2>
                <p className="text-sm font-bold text-lime-100/64">
                  {latestBadge ? `${latestBadge.name}: ${latestBadge.description}` : "Complete a mission to unlock your first badge."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BadgeGrid badges={progress.badges} />
    </div>
  );
}
