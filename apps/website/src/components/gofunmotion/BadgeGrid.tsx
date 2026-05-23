import { CheckCircle2, Lock, Trophy } from "lucide-react";
import { badgeCatalog } from "../../lib/badges";
import type { GoFunMotionBadge } from "../../types/user";

export function BadgeGrid({ badges = [] }: { badges?: GoFunMotionBadge[] }) {
  const earned = new Set(badges.map((badge) => badge.id));
  const unlockedCount = badges.length;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-lime-300 text-black">
            <Trophy aria-hidden="true" size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Badge grid</h2>
            <p className="text-sm font-bold text-white/42">{unlockedCount} unlocked / {badgeCatalog.length} total</p>
          </div>
        </div>
        <span className="rounded-full bg-black/28 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-lime-200">
          locked + unlocked
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {badgeCatalog.map((badge) => {
          const isUnlocked = earned.has(badge.id);

          return (
            <div
              className={`relative overflow-hidden rounded-2xl border p-4 ${
                isUnlocked
                  ? "border-lime-300/35 bg-lime-300/12 text-white shadow-[0_0_45px_rgba(190,242,100,0.1)]"
                  : "border-white/10 bg-black/28 text-white/38"
              }`}
              key={badge.id}
            >
              <div className={`mb-4 flex size-10 items-center justify-center rounded-2xl ${isUnlocked ? "bg-lime-300 text-black" : "bg-white/8 text-white/42"}`}>
                {isUnlocked ? <CheckCircle2 aria-hidden="true" size={18} /> : <Lock aria-hidden="true" size={18} />}
              </div>
              <p className="font-black">{badge.name}</p>
              <p className="mt-2 text-xs font-semibold leading-5">{badge.description}</p>
              {!isUnlocked ? <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
