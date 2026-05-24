"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Bookmark, CalendarClock, Heart, UserCircle2 } from "lucide-react";
import { observeUser } from "../../lib/auth";
import { isFirebaseConfigured } from "../../lib/firebase";
import {
  ensureUserProfile,
  readSavedListings,
  readSavedPlans,
  readUserBookingRequests,
  readUserProfile,
  type BookingRequestRecord,
  type SavedListingRecord,
  type SavedPlanRecord
} from "../../lib/firestore";
import type { GoFunMotionUserProfile } from "../../types/deals";

export function ProfileDashboard() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GoFunMotionUserProfile | null>(null);
  const [savedListings, setSavedListings] = useState<SavedListingRecord[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>([]);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile(nextUser: User) {
      setLoading(true);
      setStatus("");
      try {
        await ensureUserProfile(nextUser);
        const [nextProfile, nextListings, nextPlans, nextRequests] = await Promise.all([
          readUserProfile(nextUser.uid),
          readSavedListings(nextUser.uid),
          readSavedPlans(nextUser.uid),
          readUserBookingRequests(nextUser.uid)
        ]);

        if (!cancelled) {
          setProfile(nextProfile);
          setSavedListings(nextListings);
          setSavedPlans(nextPlans);
          setBookingRequests(nextRequests);
        }
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!isFirebaseConfigured()) {
      setLoading(false);
      setStatus("Firebase is not configured yet. Browse deals and demo open slots without signing in.");
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    void loadProfile(user);

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!isFirebaseConfigured() || !user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
        <UserCircle2 aria-hidden="true" className="text-cyan-300" size={36} />
        <h2 className="mt-5 text-3xl font-black text-white">Sign in to sync saved deals.</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Browse is public. Sign in is only needed for saved deals, helper plans, booking requests, partner dashboard, and admin access.
        </p>
        {status ? <p className="mt-4 rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
        <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/login">
          Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <UserCircle2 aria-hidden="true" className="text-cyan-300" size={36} />
      <h2 className="mt-5 text-3xl font-black text-white">{profile?.displayName ?? user.displayName ?? "GoFunMotion profile"}</h2>
      <p className="mt-2 text-sm font-bold text-white/52">{profile?.email ?? user.email ?? "Signed in"}</p>
      {loading ? <p className="mt-4 text-sm font-bold text-white/58">Loading saved activity...</p> : null}
      {status ? <p className="mt-4 rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric icon={Bookmark} label="Saved plans" value={savedPlans.length} />
        <Metric icon={Heart} label="Saved deals" value={savedListings.length} />
        <Metric icon={CalendarClock} label="Requests" value={bookingRequests.length} />
      </div>
      <div className="mt-6 grid gap-4">
        <ListBlock empty="Saved plans will appear here." title="Saved plans" values={savedPlans.map((item) => item.planSnapshot.title)} />
        <ListBlock empty="Saved deals will appear here." title="Saved deals" values={savedListings.map((item) => item.listingSnapshot.title)} />
        <ListBlock empty="Booking request statuses will appear here." title="Booking requests" values={bookingRequests.map((item) => `${item.name} - ${item.status}`)} />
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Bookmark; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <Icon aria-hidden="true" className="text-lime-200" size={22} />
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
    </div>
  );
}

function ListBlock({ empty, title, values }: { empty: string; title: string; values: string[] }) {
  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-3 grid gap-2">
        {values.length ? values.slice(0, 4).map((value) => <p className="text-sm font-bold text-white/62" key={value}>{value}</p>) : <p className="text-sm font-bold text-white/42">{empty}</p>}
      </div>
    </div>
  );
}
