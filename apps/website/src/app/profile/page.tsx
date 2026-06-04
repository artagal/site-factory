import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, CalendarClock, Heart } from "lucide-react";
import { ProfileDashboard } from "../../components/profile/profile-dashboard";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Profile | GoFunMotion Deals",
  description: "View saved deals, helper plans, booking requests, preferences, and account information on GoFunMotion Deals.",
  noIndex: true,
  path: "/profile"
});

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">User profile</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Your deals, plans, and requests.</h1>
          <p className="mt-5 text-lg leading-8 text-white/64">
            Browse without login. Sign in when you want to save deals, keep helper plans, submit booking requests, or manage partner access.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/login">
              Sign In
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/find">
              Help Me Choose
            </Link>
          </div>
        </div>
        <ProfileDashboard />
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <ProfileBlock icon={Bookmark} title="Saved plans" text="Rule-based plan snapshots sync to your signed-in profile." />
        <ProfileBlock icon={Heart} title="Saved deals" text="Listings and activities saved for later stay attached to your account." />
        <ProfileBlock icon={CalendarClock} title="Booking requests" text="Pending, contacted, confirmed, cancelled, and rejected requests are grouped here." />
      </section>
    </main>
  );
}

function ProfileBlock({ icon: Icon, text, title }: { icon: typeof Bookmark; text: string; title: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <Icon aria-hidden="true" className="text-lime-200" size={30} />
      <h2 className="mt-5 text-2xl font-black text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
    </article>
  );
}
