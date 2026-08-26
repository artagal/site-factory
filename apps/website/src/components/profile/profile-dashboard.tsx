"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Bookmark, CalendarClock, Heart, UserCircle2 } from "lucide-react";
import { observeUser } from "../../lib/auth";
import { SaveListingButton } from "../listings/save-listing-button";
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
  const [reload, setReload] = useState(0);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => observeUser((nextUser) => { setUser(nextUser?.isAnonymous ? null : nextUser); setAuthReady(true); }), []);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setSavedListings([]);
    setSavedPlans([]);
    setBookingRequests([]);

    async function loadProfile(nextUser: User) {
      setLoading(true);
      setStatus("");
      try {
        await ensureUserProfile(nextUser);
        const results = await Promise.allSettled([
          readUserProfile(nextUser.uid),
          readSavedListings(nextUser.uid),
          readSavedPlans(nextUser.uid),
          readUserBookingRequests(nextUser.uid)
        ]);

        if (!cancelled) {
          const [nextProfile, nextListings, nextPlans, nextRequests] = results;
          if (nextProfile.status === "fulfilled") setProfile(nextProfile.value);
          if (nextListings.status === "fulfilled") setSavedListings(nextListings.value);
          if (nextPlans.status === "fulfilled") setSavedPlans(nextPlans.value);
          if (nextRequests.status === "fulfilled") setBookingRequests(nextRequests.value);
          if (results.some((result) => result.status === "rejected")) setStatus("Some account items could not load. Please retry.");
        }
      } catch (error) {
        if (!cancelled) setStatus(formatProfileError(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!isFirebaseConfigured()) {
      setLoading(false);
      setStatus("Live account sync is not connected yet. Browse deals without signing in.");
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
  }, [user, reload]);

  if (!authReady) return <p className="py-6 text-sm" role="status">Loading your account...</p>;

  if (!isFirebaseConfigured() || !user) {
    return (
      <section className="py-6">
        <UserCircle2 aria-hidden="true" className="text-cyan-300" size={36} />
        <h2 className="mt-5 text-2xl font-bold text-white">Sign in to see your saved deals.</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Your saved activities and booking requests, all in one place.
        </p>
        {status ? <p className="mt-4 rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
        <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/login?next=/profile">
          Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="min-w-0 py-4">
      <UserCircle2 aria-hidden="true" className="text-cyan-300" size={36} />
      <h2 className="mt-5 text-3xl font-black text-white">{profile?.displayName ?? user.displayName ?? "GoFunMotion profile"}</h2>
      <p className="mt-2 text-sm font-bold text-white/52">{profile?.email ?? user.email ?? "Signed in"}</p>
      {loading ? <p className="mt-4 text-sm font-bold text-white/58">Loading saved activity...</p> : null}
      {status ? <p className="mt-4 text-sm text-[var(--accent-amber)]" role="status">{status}</p> : null}
      <button className="mt-3 min-h-11 text-sm font-semibold underline disabled:opacity-50" disabled={loading} onClick={() => setReload((value) => value + 1)} type="button">Refresh account</button>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric icon={Bookmark} label="Saved plans" value={loading || status ? null : savedPlans.length} />
        <Metric icon={Heart} label="Saved deals" value={loading || status ? null : savedListings.length} />
        <Metric icon={CalendarClock} label="Requests" value={loading || status ? null : bookingRequests.length} />
      </div>
      <div className="mt-6 grid gap-4">
        <section className="border-t border-[var(--border-subtle)] py-4"><h3 className="text-lg font-bold">Saved plans</h3>
          {savedPlans.map((item) => <details className="mt-3 border-b border-[var(--border-subtle)] pb-3" key={item.planId}><summary className="min-h-11 cursor-pointer py-3 font-semibold">{item.planSnapshot.title}</summary><p className="text-sm leading-6">{item.planSnapshot.summary}</p>{item.planSnapshot.items.map((step, index) => <p className="mt-3 text-sm leading-6" key={index}><strong>{step.title}</strong><br />{step.description}</p>)}</details>)}
          {!savedPlans.length && !status && !loading ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">No saved plans yet.</p> : null}
        </section>
        <section className="border-t border-[var(--border-subtle)] py-4"><h3 className="text-lg font-bold">Saved deals</h3>
          {savedListings.map((item) => <div className="mt-3 flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] py-3" key={item.listingId}><Link className="min-h-11 py-2 text-sm font-semibold underline" href={`/deals/${item.listingSnapshot.slug}`}>{item.listingSnapshot.title}</Link><SaveListingButton compact listing={item.listingSnapshot} /></div>)}
          {!savedListings.length && !status && !loading ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">No saved deals yet.</p> : null}
        </section>
        <BookingRequestsBlock requests={bookingRequests} showEmpty={!loading && !status} />
      </div>
    </section>
  );
}

function formatProfileError(error: unknown) {
  if (error instanceof Error && error.message.includes("Missing or insufficient permissions")) {
    return "Your account is signed in, but saved items are not available yet. Refresh the page or sign in again.";
  }

  return "Could not load saved items yet. Try refreshing the page.";
}

function Metric({ icon: Icon, label, value }: { icon: typeof Bookmark; label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-black/24 p-4">
      <Icon aria-hidden="true" className="text-lime-200" size={22} />
      <p className="mt-3 text-3xl font-black text-white">{value ?? "-"}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
    </div>
  );
}

function BookingRequestsBlock({ requests, showEmpty }: { requests: BookingRequestRecord[]; showEmpty: boolean }) {
  return (
    <section className="border-t border-[var(--border-subtle)] py-4">
      <h3 className="text-lg font-black text-white">Booking requests</h3>
      <div className="mt-3 grid gap-3">
        {requests.length ? requests.slice(0, 6).map((request) => (
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4" key={request.id}>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p className="font-black text-white">{request.listingTitle ?? "Requested activity"}</p>
                <p className="mt-1 text-sm font-bold text-white/54">
                  {request.businessName ?? "Local business"} - {request.requestedDate} {request.requestedTime} - party of {request.partySize}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-white/46">
              {statusCopy(request.status)}
            </p>
          </div>
        )) : showEmpty ? <p className="text-sm text-white/65">No booking requests yet.</p> : null}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: BookingRequestRecord["status"] }) {
  const styles: Record<BookingRequestRecord["status"], string> = {
    cancelled: "bg-rose-300/12 text-rose-100 border-rose-300/25",
    confirmed: "bg-lime-300/14 text-lime-100 border-lime-300/30",
    contacted: "bg-cyan-300/12 text-cyan-100 border-cyan-300/25",
    pending: "bg-amber-300/12 text-amber-100 border-amber-300/25",
    rejected: "bg-white/[0.08] text-white/60 border-white/10"
  };

  return (
    <span className={`inline-flex min-h-8 shrink-0 items-center rounded-full border px-3 text-xs font-black uppercase tracking-[0.12em] ${styles[status]}`}>
      {status}
    </span>
  );
}

function statusCopy(status: BookingRequestRecord["status"]) {
  const copy: Record<BookingRequestRecord["status"], string> = {
    cancelled: "The business cancelled this request. Choose another open slot or deal.",
    confirmed: "Confirmed by the business. Follow their instructions before arriving.",
    contacted: "The business has reached out or is checking availability.",
    pending: "Sent to the business. Waiting for availability confirmation.",
    rejected: "The business could not accept this request."
  };
  return copy[status];
}
