import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "City Waitlist | GoFunMotion Deals",
  description:
    "Join the GoFunMotion Deals city interest list for local activities, last-minute deals, date ideas, family plans, and partner listings.",
  path: "/waitlist"
});

export default function WaitlistPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <MapPinned aria-hidden="true" className="text-cyan-300" size={38} />
        <h1 className="mt-5 text-5xl font-black leading-tight text-white md:text-7xl">
          Bring GoFunMotion Deals to your city.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Phase 1 uses a lightweight city-interest placeholder. Future phases will connect local demand with partner applications and approved listings.
        </p>
      </div>
      <form className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">City interest</p>
        <div className="mt-5 grid gap-3">
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none focus:border-lime-300" name="email" placeholder="Email" type="email" />
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none focus:border-lime-300" name="city" placeholder="City" />
          <select className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none focus:border-lime-300" name="interestType" defaultValue="user">
            <option className="bg-[#070816]" value="user">I want plans and deals</option>
            <option className="bg-[#070816]" value="business">I run a local business</option>
          </select>
          <button className="min-h-12 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816]" type="button">
            Interest Form Coming Soon
          </button>
        </div>
      </form>
    </main>
  );
}
