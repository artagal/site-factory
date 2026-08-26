"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import type { SmartSearchFilters } from "../../lib/ai/smart-search-agent";

type SmartSearchResponse = {
  count?: number;
  error?: string;
  filters?: SmartSearchFilters;
  provider?: "openai" | "rules";
  setupWarning?: string | null;
  summary?: string;
};

export function SmartSearch({ cityId }: { cityId?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Try: date night tonight under $50 in Miami");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || query.trim().length < 3) return;
    setBusy(true);
    setStatus("Turning your request into deal filters...");

    try {
      const response = await fetch("/api/ai/smart-search", {
        body: JSON.stringify({ defaults: { cityId: cityId || null }, query }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as SmartSearchResponse | null;
      if (!response.ok || !result?.filters) {
        setStatus(result?.error ?? "Could not understand that search yet.");
        return;
      }

      const params = new URLSearchParams();
      const filters = result.filters;
      if (filters.cityId) params.set("cityId", filters.cityId);
      if (filters.when) params.set("when", filters.when);
      if (filters.who) params.set("who", filters.who);
      if (filters.budget) params.set("budget", filters.budget);
      if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.indoorOutdoor) params.set("indoorOutdoor", filters.indoorOutdoor);
      if (filters.vibe) params.set("vibe", filters.vibe);
      params.set("sort", filters.sort);
      params.set("smart", "1");
      setStatus(`${result.summary ?? "Filters ready"} ${result.count ?? 0} matches.`);
      router.push(`/deals?${params.toString()}`);
    } catch {
      setStatus("Search is temporarily unavailable. Use the filters below.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-3 md:p-4">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Describe the deal you want</span>
          <Sparkles aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200" size={18} />
          <input
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none placeholder:text-white/34 focus:border-cyan-300/60"
            maxLength={240}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="date night tonight under $50 in Miami"
            value={query}
          />
        </label>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200 disabled:opacity-55"
          disabled={busy || query.trim().length < 3}
          type="submit"
        >
          <Search aria-hidden="true" size={17} />
          {busy ? "Matching..." : "Smart Search"}
        </button>
      </form>
      <p aria-live="polite" className="mt-2 px-1 text-xs font-bold leading-5 text-white/48">{status}</p>
    </section>
  );
}
