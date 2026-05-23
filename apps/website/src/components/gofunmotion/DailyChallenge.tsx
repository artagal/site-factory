"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Flame, Share2, Sparkles, SunMedium, Timer, Trophy, Users, Zap } from "lucide-react";
import { createShareText } from "../../lib/challengeEngine";
import {
  acceptDailyChallengeLocally,
  completeDailyChallengeLocally,
  dailyChallenge,
  getDailyChallengeRecord,
  getDailyDateId,
  getDailyStatus
} from "../../lib/dailyChallenge";
import { completeChallengeWithSync } from "../../lib/progressActions";
import { getRarityXpBonus } from "../../lib/rarity";
import { formatMinutes } from "../../lib/utils";
import type { DailyChallengeRecord } from "../../types/challenge";
import type { GoFunMotionUserProgress } from "../../types/user";
import { Button } from "./Button";

function getResetCopy() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const totalMinutes = Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m left`;
}

export { dailyChallenge };

export function DailyChallengeCard({ large = false }: { large?: boolean }) {
  const dateId = useMemo(() => getDailyDateId(), []);
  const [record, setRecord] = useState<DailyChallengeRecord>(() => ({
    ...dailyChallenge,
    acceptedCount: 1284,
    completedCount: 719,
    date: dateId
  }));
  const [status, setStatus] = useState(() => getDailyStatus(dateId));
  const [completionProgress, setCompletionProgress] = useState<GoFunMotionUserProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resetCopy, setResetCopy] = useState(getResetCopy);
  const totalXp = record.xpReward + getRarityXpBonus(record.rarity);

  useEffect(() => {
    let mounted = true;

    getDailyChallengeRecord(dateId).then((nextRecord) => {
      if (mounted) setRecord(nextRecord);
    });

    const timer = window.setInterval(() => setResetCopy(getResetCopy()), 60000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [dateId]);

  function acceptDaily() {
    if (!status.accepted) {
      setRecord((current) => ({ ...current, acceptedCount: current.acceptedCount + 1 }));
    }
    setStatus(acceptDailyChallengeLocally(dateId));
    setMessage("Accepted. Keep the streak alive by completing it today.");
  }

  async function completeDailyChallenge() {
    if (status.completed || busy) return;

    setBusy(true);
    const result = await completeChallengeWithSync(record, "", "daily");
    setCompletionProgress(result.progress);
    setStatus(completeDailyChallengeLocally(dateId));
    setRecord((current) => ({
      ...current,
      acceptedCount: status.accepted ? current.acceptedCount : current.acceptedCount + 1,
      completedCount: current.completedCount + 1
    }));
    setMessage(
      result.error ??
        (result.synced
          ? "Daily mission complete. XP, streak, and history synced."
          : "Daily mission complete. XP, streak, and history saved locally.")
    );
    setBusy(false);
  }

  async function shareDailyChallenge() {
    const text = `${createShareText(record)} Today's global mission resets in ${resetCopy}.`;

    if (navigator.share) {
      await navigator.share({ text, title: record.title, url: "https://gofunmotion.com/daily" });
      return;
    }

    await navigator.clipboard.writeText(text);
    setMessage("Daily mission copied.");
  }

  return (
    <motion.article
      className="relative overflow-hidden rounded-[2.3rem] border border-orange-200/20 bg-[linear-gradient(135deg,rgba(247,37,133,0.18),rgba(0,212,255,0.12),rgba(190,242,100,0.1))] p-5 shadow-[0_28px_95px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:p-7"
      whileHover={{ y: large ? -2 : -4 }}
    >
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-lime-300/12 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-300 text-black shadow-[0_0_55px_rgba(251,146,60,0.22)]">
              <SunMedium aria-hidden="true" size={27} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-100">Today&apos;s global mission</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-white/52">
                <CalendarDays aria-hidden="true" size={15} />
                {record.date}
                <span className="text-white/24">/</span>
                <Timer aria-hidden="true" size={15} />
                {resetCopy}
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-black/28 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/42">
                <Users aria-hidden="true" size={15} />
                accepted
              </p>
              <p className="mt-1 text-2xl font-black text-white">{record.acceptedCount.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-black/28 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/42">
                <CheckCircle2 aria-hidden="true" size={15} />
                completed
              </p>
              <p className="mt-1 text-2xl font-black text-white">{record.completedCount.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-lime-300 px-4 py-3 text-black">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-black/52">
                <Trophy aria-hidden="true" size={15} />
                reward
              </p>
              <p className="mt-1 text-2xl font-black">+{totalXp} XP</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
                {record.category}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
                {record.rarity}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/72">
                {formatMinutes(record.timeEstimateMinutes)}
              </span>
            </div>
            <h2 className={`mt-5 font-black leading-[0.98] text-white ${large ? "text-5xl md:text-7xl" : "text-3xl md:text-4xl"}`}>
              {record.title}
            </h2>
            <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-white/76">{record.description}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/24 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Streak connection</p>
              <p className="mt-2 text-sm font-bold leading-6 text-white/66">
                Complete today&apos;s mission to add a daily completion to your history and keep your real-life streak moving.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.7rem] border border-white/10 bg-black/28 p-5">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-orange-100">
                <Flame aria-hidden="true" size={16} />
                Event status
              </p>
              <div className="mt-4 grid gap-2">
                {[
                  { active: status.accepted, label: "Accepted" },
                  { active: status.completed, label: "Completed" },
                  { active: Boolean(completionProgress?.streak), label: `Streak ${completionProgress?.streak ?? "ready"}` }
                ].map((item) => (
                  <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3" key={item.label}>
                    <span className="text-sm font-black text-white">{item.label}</span>
                    <span className={`size-3 rounded-full ${item.active ? "bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.5)]" : "bg-white/18"}`} />
                  </div>
                ))}
              </div>
            </div>

            <Button className="min-h-14 w-full" onClick={acceptDaily} variant={status.accepted ? "secondary" : "primary"}>
              {status.accepted ? (
                <>
                  <CheckCircle2 aria-hidden="true" size={18} />
                  Accepted
                </>
              ) : (
                "Accept today's mission"
              )}
            </Button>
            <Button className="min-h-14 w-full" disabled={busy || status.completed} onClick={completeDailyChallenge} variant="secondary">
              {status.completed ? (
                <>
                  <Zap aria-hidden="true" size={18} />
                  Momentum +{totalXp}
                </>
              ) : busy ? (
                "Saving..."
              ) : (
                "Complete mission"
              )}
            </Button>
            <Button className="min-h-14 w-full" onClick={shareDailyChallenge} variant="ghost">
              <Share2 aria-hidden="true" size={18} />
              Share daily mission
            </Button>
          </div>
        </div>

        {message ? (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm font-bold text-lime-50"
            initial={{ opacity: 0, y: 8 }}
          >
            {message}
          </motion.p>
        ) : null}

        {status.completed ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mt-5 rounded-[1.7rem] border border-lime-300/30 bg-lime-300/12 p-5"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
          >
            <p className="inline-flex items-center gap-2 text-2xl font-black text-white">
              <Sparkles aria-hidden="true" size={22} />
              Daily event complete. Come back tomorrow.
            </p>
            <p className="mt-2 text-sm font-bold text-lime-100/70">
              Today counted. Your profile now has the completion, XP, streak signal, badges, and recent activity.
            </p>
          </motion.div>
        ) : null}
      </div>
    </motion.article>
  );
}
