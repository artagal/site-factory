import { badgeCatalog } from "../../lib/badges";
import type { GoFunMotionBadge } from "../../types/user";

export function BadgeGrid({ badges = [] }: { badges?: GoFunMotionBadge[] }) {
  const earned = new Set(badges.map((badge) => badge.id));

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
      <h2 className="text-2xl font-black text-white">Badges</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {badgeCatalog.map((badge) => (
          <div
            className={`rounded-2xl border p-4 ${
              earned.has(badge.id)
                ? "border-lime-300/30 bg-lime-300/12 text-white"
                : "border-white/10 bg-black/24 text-white/42"
            }`}
            key={badge.id}
          >
            <p className="font-black">{badge.name}</p>
            <p className="mt-2 text-xs leading-5">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
