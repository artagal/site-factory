import { Flame } from "lucide-react";

export function StreakCounter({ streak }: { streak: number }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-[1.35rem] border border-orange-300/30 bg-orange-300 px-4 py-3 text-sm font-black text-black shadow-[0_0_42px_rgba(251,146,60,0.24)]">
      <span className="flex size-9 items-center justify-center rounded-full bg-black text-orange-300">
        <Flame aria-hidden="true" size={19} />
      </span>
      <span>
        <span className="block text-xl leading-none">{streak}</span>
        <span className="text-xs uppercase tracking-[0.12em]">day streak</span>
      </span>
    </div>
  );
}
