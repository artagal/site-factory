const leaders = [
  { completedChallenges: 42, displayName: "Maya Motion", rank: 1, xp: 4820 },
  { completedChallenges: 37, displayName: "No Scroll Nate", rank: 2, xp: 3910 },
  { completedChallenges: 31, displayName: "City Wanderer", rank: 3, xp: 3440 },
  { completedChallenges: 24, displayName: "Courage Mode", rank: 4, xp: 2880 },
  { completedChallenges: 19, displayName: "Sunset Runner", rank: 5, xp: 2210 }
];

export function LeaderboardPreview({ full = false }: { full?: boolean }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-200">Community momentum</p>
          <h2 className="mt-2 text-3xl font-black text-white">Leaderboard</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/54">
          weekly
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {leaders.slice(0, full ? leaders.length : 3).map((leader) => (
          <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl bg-black/24 p-3" key={leader.rank}>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
              #{leader.rank}
            </div>
            <div>
              <p className="font-black text-white">{leader.displayName}</p>
              <p className="text-sm text-white/48">{leader.completedChallenges} completed</p>
            </div>
            <p className="text-sm font-black text-lime-300">{leader.xp} XP</p>
          </div>
        ))}
      </div>
    </div>
  );
}
