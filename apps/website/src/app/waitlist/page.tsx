import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import { WaitlistForm } from "../../components/shared/waitlist-form";
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
          Join the city interest list so GoFunMotion can connect local demand with partner applications and approved listings.
        </p>
      </div>
      <WaitlistForm />
    </main>
  );
}
