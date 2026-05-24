"use client";

import { useState } from "react";
import { trackEvent } from "../../lib/analytics";
import { addWaitlistEntryLocally } from "../../lib/localStorage";
import { Button } from "./Button";

const interests = ["Daily streaks", "Friend challenges", "Couples mode", "City quests", "AI coach", "Creator packs"];

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(["Daily streaks"]);
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    if (!email.includes("@")) {
      setStatus("Add a valid email first.");
      return;
    }

    const response = await fetch("/api/waitlist", {
      body: JSON.stringify({
        email,
        interests: selected,
        source: "website"
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    }).catch(() => null);
    const result = response?.ok ? ((await response.json()) as { synced?: boolean }) : null;

    if (!result?.synced) {
      addWaitlistEntryLocally(email, selected);
    }

    trackEvent("waitlist_submitted", {
      emailDomain: email.split("@")[1]?.toLowerCase() ?? "unknown",
      interestCount: selected.length,
      interests: selected,
      source: "website",
      synced: Boolean(result?.synced)
    });
    setStatus("You are on the list. Mobile app momentum incoming.");
    setEmail("");
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">iOS and Android coming soon</p>
      <h2 className="mt-3 text-3xl font-black text-white">Join the mobile app waitlist</h2>
      <p className="mt-3 text-sm leading-6 text-white/62">
        Streaks, friend challenges, city adventures, AI coaching, and social leaderboards are planned for the app.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <button
            className={`min-h-11 rounded-full px-3 py-2 text-xs font-black transition ${
              selected.includes(interest) ? "bg-lime-300 text-black" : "bg-white/8 text-white/62"
            }`}
            key={interest}
            onClick={() =>
              setSelected((current) =>
                current.includes(interest)
                  ? current.filter((item) => item !== interest)
                  : [...current, interest]
              )
            }
            type="button"
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/24 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-lime-300"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <Button onClick={submit}>Join waitlist</Button>
      </div>
      {status ? <p className="mt-3 text-sm font-bold text-lime-200">{status}</p> : null}
    </div>
  );
}
