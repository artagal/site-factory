import { Flame } from "lucide-react";

export function StreakCounter({ streak }: { streak: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-400 px-4 py-2 text-sm font-black text-black">
      <Flame aria-hidden="true" size={18} />
      {streak} day streak
    </div>
  );
}
