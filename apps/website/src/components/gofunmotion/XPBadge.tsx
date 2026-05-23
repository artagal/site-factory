export function XPBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/42">{label}</p>
    </div>
  );
}
