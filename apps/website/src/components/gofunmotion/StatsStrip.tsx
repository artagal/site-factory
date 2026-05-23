export function StatsStrip() {
  const stats = [
    { label: "challenge templates", value: "100+" },
    { label: "generated today", value: "214" },
    { label: "start time", value: "10 sec" },
    { label: "signup wall", value: "0" }
  ];

  return (
    <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div className="group rounded-[1.5rem] bg-black/28 p-5 transition hover:-translate-y-1 hover:bg-white/[0.075]" key={stat.label}>
          <p className="text-3xl font-black text-white">{stat.value}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-white/42">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
