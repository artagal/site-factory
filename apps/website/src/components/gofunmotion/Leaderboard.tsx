"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Compass, Flame, Medal, Sparkles, Target, Trophy, Users, Zap } from "lucide-react";
import {
  demoLeaderboardSnapshot,
  leaderboardFirestoreShape,
  type CategoryLeaderEntry,
  type LeaderboardEntry,
  type StreakLeaderEntry
} from "../../lib/leaderboard";

const rankTone: Record<number, string> = {
  1: "border-lime-200/60 bg-lime-200 text-black shadow-[0_0_44px_rgba(190,242,100,0.25)]",
  2: "border-cyan-200/50 bg-cyan-200 text-black shadow-[0_0_36px_rgba(103,232,249,0.2)]",
  3: "border-fuchsia-200/50 bg-fuchsia-200 text-black shadow-[0_0_36px_rgba(245,208,254,0.2)]"
};

function PodiumCard({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-[1.6rem] border p-4 ${
        index === 0 ? "border-lime-300/40 bg-lime-300/[0.09]" : "border-white/10 bg-white/[0.055]"
      }`}
      initial={{ opacity: 0, y: 18 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 140, damping: 18 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ y: -4, rotate: index === 0 ? -0.4 : 0.4 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-x-8 -top-14 h-28 rounded-full bg-white/[0.15] blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${entry.avatarGradient} text-lg font-black text-black`}>
          {entry.displayName
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${rankTone[entry.rank] ?? "border-white/10 bg-white/10 text-white"}`}>
          #{entry.rank}
        </div>
      </div>

      <div className="relative mt-5">
        <p className="text-lg font-black text-white">{entry.displayName}</p>
        <p className="text-sm text-white/[0.52]">{entry.handle}</p>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-black/[0.28] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/[0.38]">Weekly XP</p>
          <p className="mt-1 text-xl font-black text-lime-200">{entry.weeklyXp.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-black/[0.28] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/[0.38]">Completed</p>
          <p className="mt-1 text-xl font-black text-white">{entry.completedChallenges}</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/[0.72]">{entry.topCategory}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/[0.72]">{entry.streak} day streak</span>
      </div>

      <p className="relative mt-4 text-sm font-bold text-fuchsia-100">{entry.status}</p>
    </motion.div>
  );
}

function LeaderRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <motion.div
      className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-black/[0.24] p-3"
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-white text-sm font-black text-black">#{entry.rank}</div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-black text-white">{entry.displayName}</p>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/[0.48]">
            {entry.topCategory}
          </span>
        </div>
        <p className="text-sm text-white/[0.45]">
          {entry.completedChallenges} completed · {entry.streak} day streak · momentum {entry.momentumScore}
        </p>
      </div>
      <div className="text-right">
        <p className="font-black text-lime-200">{entry.weeklyXp.toLocaleString()}</p>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/[0.36]">XP</p>
      </div>
    </motion.div>
  );
}

function StreakLeaderCard({ entry, index }: { entry: StreakLeaderEntry; index: number }) {
  return (
    <motion.div
      className="rounded-[1.35rem] border border-orange-200/[0.15] bg-orange-300/[0.06] p-4"
      initial={{ opacity: 0, y: 14 }}
      transition={{ delay: index * 0.07 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-black text-white">{entry.displayName}</p>
          <p className="text-sm text-white/[0.46]">{entry.handle}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-orange-300/[0.14] px-3 py-1 text-sm font-black text-orange-100">
          <Flame className="size-4" />
          {entry.longestStreak}
        </div>
      </div>
      <p className="mt-4 text-sm text-white/[0.58]">Latest: {entry.recentMission}</p>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-lime-200">{entry.weeklyXp.toLocaleString()} weekly XP</p>
    </motion.div>
  );
}

function CategoryLeaderCard({ entry, index }: { entry: CategoryLeaderEntry; index: number }) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4"
      initial={{ opacity: 0, y: 14 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${entry.accent} opacity-35 blur-2xl transition-opacity group-hover:opacity-55`} />
      <div className="relative flex items-center justify-between gap-3">
        <span className={`rounded-full bg-gradient-to-r ${entry.accent} px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-black`}>
          {entry.category}
        </span>
        <Medal className="size-5 text-white/[0.48]" />
      </div>
      <p className="relative mt-4 text-lg font-black text-white">{entry.leaderName}</p>
      <p className="relative text-sm text-white/[0.48]">{entry.rankLabel}</p>
      <p className="relative mt-4 text-sm text-white/[0.68]">{entry.sampleMission}</p>
      <div className="relative mt-4 flex items-center justify-between text-sm">
        <span className="font-black text-lime-200">{entry.weeklyXp.toLocaleString()} XP</span>
        <span className="font-bold text-white/[0.45]">{entry.completedChallenges} completed</span>
      </div>
    </motion.div>
  );
}

export function LeaderboardPreview({ full = false }: { full?: boolean }) {
  const snapshot = demoLeaderboardSnapshot;
  const podium = snapshot.weeklyXpLeaders.slice(0, 3);
  const visibleRows = snapshot.weeklyXpLeaders.slice(full ? 0 : 0, full ? snapshot.weeklyXpLeaders.length : 3);
  const visibleCategories = snapshot.categoryLeaders.slice(0, full ? snapshot.categoryLeaders.length : 2);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080712]/[0.82] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-6">
      <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-lime-300/[0.15] blur-3xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-lime-100">
              <span className="size-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.8)]" />
              Community preview mode
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/[0.52]">
              {snapshot.periodId}
            </span>
          </div>
          <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-white md:text-5xl">
            Weekly momentum, not vanity points.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/[0.58]">
            Demo community data shows how GoFunMotion will rank XP, streaks, categories, and completed real-life missions once Firestore users are live.
          </p>
        </div>
        <a
          className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-black text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,255,255,0.22)]"
          href={full ? "/challenge" : "/leaderboard"}
        >
          {full ? "Spin a mission" : "View social layer"}
          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.communityStats.map((stat, index) => (
          <motion.div
            className="rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-4"
            initial={{ opacity: 0, y: 10 }}
            key={stat.label}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/[0.42]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {full ? (
        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          {podium.map((entry, index) => (
            <PodiumCard entry={entry} index={index} key={entry.userId} />
          ))}
        </div>
      ) : null}

      <div className="relative mt-7 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-lime-200" />
              <h3 className="text-xl font-black text-white">Weekly XP leaders</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white/[0.44]">top 5</span>
          </div>
          <div className="grid gap-3">
            {visibleRows.map((entry) => (
              <LeaderRow entry={entry} key={entry.userId} />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Flame className="size-5 text-orange-200" />
              <h3 className="text-xl font-black text-white">Streak leaders</h3>
            </div>
            <div className="grid gap-3">
              {snapshot.streakLeaders.slice(0, full ? 3 : 2).map((entry, index) => (
                <StreakLeaderCard entry={entry} index={index} key={entry.handle} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-fuchsia-200" />
            <h3 className="text-xl font-black text-white">Category leaders</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white/[0.44]">
            <Compass className="size-3.5" />
            modes with identity
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {visibleCategories.map((entry, index) => (
            <CategoryLeaderCard entry={entry} index={index} key={entry.category} />
          ))}
        </div>
      </div>

      {full ? (
        <div className="relative mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-cyan-200" />
              <h3 className="font-black text-white">Demo, but honest</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/[0.58]">
              These names are seeded community examples. The shape is ready for live weekly rankings once Firebase has real completed missions.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["weekly XP", "streaks", "categories", "completed count"].map((item) => (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/[0.58]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-lime-300/[0.15] bg-lime-300/[0.055] p-5">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-lime-200" />
              <h3 className="font-black text-white">Firestore-ready structure</h3>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-white/[0.58]">
              <code className="rounded-xl bg-black/30 px-3 py-2">{leaderboardFirestoreShape.summaryPath}</code>
              <code className="rounded-xl bg-black/30 px-3 py-2">{leaderboardFirestoreShape.entriesPath}</code>
              <code className="rounded-xl bg-black/30 px-3 py-2">{leaderboardFirestoreShape.categoryPath}</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/[0.55]">
          <Sparkles className="size-5 text-lime-200" />
          <span>Demo community mode now. Live Firestore rankings later.</span>
        </div>
      )}
    </section>
  );
}
