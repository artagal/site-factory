import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Heart } from "lucide-react";
import { ProfileDashboard } from "../../components/profile/profile-dashboard";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Saved Deals And Plans | GoFunMotion",
  description:
    "Save local activity deals, helper plans, booking requests, and preferences after sign in to keep GoFunMotion planning synced.",
  keywords: ["saved deals", "activity wishlist", "saved activity deals"],
  noIndex: true,
  path: "/saved"
});

export default function SavedPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 md:p-8">
        <h1 className="mt-5 text-5xl font-black leading-tight text-white md:text-6xl">Saved deals and plans.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">
          Browse without login. Sign in to sync saved deals, helper plans, booking requests, and preferences across sessions.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/24 p-5">
            <Bookmark aria-hidden="true" className="text-cyan-300" size={28} />
            <h2 className="mt-4 text-2xl font-black text-white">Saved Plans</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">Generated plan snapshots will be stored after sign in.</p>
          </div>
          <div className="rounded-2xl bg-black/24 p-5">
            <Heart aria-hidden="true" className="text-lime-200" size={28} />
            <h2 className="mt-4 text-2xl font-black text-white">Saved Deals</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">Bookable activity listings will be saved to the user profile.</p>
          </div>
        </div>
        <div className="mt-8">
          <ProfileDashboard />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/deals?when=tonight">
            Browse Deals
          </Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/login">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
