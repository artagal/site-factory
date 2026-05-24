"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(formData: FormData) {
    if (busy) return;
    setBusy(true);
    setStatus("");

    try {
      const response = await fetch("/api/waitlist", {
        body: JSON.stringify({
          city: String(formData.get("city") ?? ""),
          email: String(formData.get("email") ?? ""),
          interestType: String(formData.get("interestType") ?? "user"),
          source: "waitlist-page"
        }),
        headers: { "content-type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; synced?: boolean } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Could not join waitlist.");
      setStatus(payload?.synced ? "You're on the city list." : "Saved locally for this preview. Firebase sync starts when env vars are configured.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not join waitlist.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">City interest</p>
      <div className="mt-5 grid gap-3">
        <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none focus:border-lime-300" name="email" placeholder="Email" required type="email" />
        <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none focus:border-lime-300" name="city" placeholder="City" required />
        <select className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none focus:border-lime-300" name="interestType" defaultValue="user">
          <option className="bg-[#070816]" value="user">I want plans and deals</option>
          <option className="bg-[#070816]" value="business">I run a local business</option>
        </select>
        <button className="min-h-12 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} type="submit">
          {busy ? "Joining..." : "Join City List"}
        </button>
        {status ? <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
      </div>
    </form>
  );
}
