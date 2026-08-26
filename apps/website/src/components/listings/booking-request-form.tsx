"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getCurrentUserIdToken } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import { toBookingTime } from "../../lib/booking-time";
import { isOpenListing } from "../../lib/listing-presentation";
import type { Listing } from "../../types/deals";

export function BookingRequestForm({ listing }: { listing: Listing }) {
  const [status, setStatus] = useState("Sign in, choose a time, and request availability. No payment is collected.");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<{ requestId: string; synced: boolean } | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  async function draftMessage() {
    if (aiBusy || listing.isDemo) return;
    setAiBusy(true);
    setStatus("Drafting an editable note from your message...");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setNeedsSignIn(true);
        setStatus("Sign in before using the booking message assistant.");
        return;
      }
      const response = await fetch("/api/ai/booking-message", {
        body: JSON.stringify({ intent: message, listingId: listing.id, listingSlug: listing.slug }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; message?: string; setupWarning?: string | null } | null;
      if (!response.ok || !result?.message) {
        setStatus(result?.error ?? "Could not draft a message yet.");
        return;
      }
      setMessage(result.message);
      setStatus(result.setupWarning ?? "Draft ready. Review and edit it before sending your request.");
    } catch {
      setStatus("Could not draft a message yet. You can write your own note below.");
    } finally {
      setAiBusy(false);
    }
  }

  async function submit(formData: FormData) {
    if (busy) return;
    setBusy(true);
    setStatus("Checking sign-in...");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setNeedsSignIn(true);
        setStatus("Please sign in before requesting booking.");
        return;
      }
      setNeedsSignIn(false);
      const payload = {
        email: String(formData.get("email") ?? ""),
        listingId: listing.id,
        listingSlug: listing.slug,
        message: String(formData.get("message") ?? ""),
        name: String(formData.get("name") ?? ""),
        partySize: Number(formData.get("partySize") ?? 1),
        phone: String(formData.get("phone") ?? ""),
        requestedDate: String(formData.get("requestedDate") ?? ""),
        requestedTime: String(formData.get("requestedTime") ?? "")
      };
      const response = await fetch("/api/booking-request", {
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; requestId?: string; synced?: boolean } | null;
      if (response.ok && result?.synced && result.requestId) {
        setConfirmation({ requestId: result.requestId, synced: true });
        trackEvent("booking_request_submitted", { listingId: listing.id, listingSlug: listing.slug });
      } else {
        setStatus(result?.error ?? "Could not send request yet.");
      }
    } catch {
      setStatus("We could not confirm whether your request was sent. Check your profile before trying again.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpenListing(listing)) {
    return <div className="rounded-lg border border-[var(--border-subtle)] p-5">
      <h2 className="text-xl font-bold">This offer is no longer available</h2>
      <Link className="mt-3 inline-flex min-h-11 items-center font-semibold underline" href={`/deals?cityId=${encodeURIComponent(listing.cityId)}`}>Find another deal</Link>
    </div>;
  }

  if (confirmation) {
    return <section aria-live="polite" className="rounded-lg border border-lime-500/30 bg-lime-400/10 p-5">
      <h2 className="text-2xl font-bold">Booking request sent</h2>
      <p className="mt-3 leading-7">Your request is pending. {listing.businessName} will confirm availability. No payment has been taken.</p>
      <Link className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-lime-300 px-4 font-semibold text-[#101510]" href="/profile">View request status</Link>
      <p className="mt-3 break-all text-xs text-[var(--muted-foreground)]">Reference: {confirmation.requestId}</p>
    </section>;
  }

  if (listing.isDemo) {
    return (
      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-200">Demo listing</p>
        <h2 className="mt-2 text-2xl font-black text-white">Booking requests are not open for this example.</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">Join the city waitlist and GoFunMotion will let you know when approved live partners are available.</p>
        <Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-[#070816] hover:bg-lime-200" href={`/waitlist?city=${encodeURIComponent(listing.cityName)}`}>
          Join city waitlist
        </Link>
      </div>
    );
  }

  return (
    <form action={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <h2 className="text-2xl font-black text-white">Request booking</h2>
      <p className="mt-2 text-sm leading-6 text-white/58" role="status">{status}</p>
      {needsSignIn ? <Link className="mt-3 inline-flex min-h-11 items-center font-bold underline" href={`/login?next=${encodeURIComponent(`/deals/${listing.slug}`)}`}>Sign in to request booking</Link> : null}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field name="name" placeholder="Name" required />
        <Field name="email" placeholder="Email" required type="email" />
        <Field name="phone" placeholder="Phone optional" />
        <Field name="requestedDate" placeholder="Requested date" required type="date" />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Time</span>
          <input className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-black/28 px-4 text-sm font-bold text-white" type="time" name="requestedTime" required defaultValue={toBookingTime(listing.availableSlots[0] ?? "")} />
          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">Local time in {listing.cityName}</span>
        </label>
        <Field min={1} max={Math.min(50, listing.remainingSpots ?? 50)} name="partySize" placeholder="Party size" required type="number" />
      </div>
      <div className="mt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-white/45" htmlFor={`booking-message-${listing.id}`}>Message</label>
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-cyan-300/12 px-3 text-xs font-black text-cyan-100 hover:bg-cyan-300/20 disabled:opacity-55"
            disabled={aiBusy}
            onClick={() => void draftMessage()}
            type="button"
          >
            <Sparkles aria-hidden="true" size={14} />
            {aiBusy ? "Drafting..." : "Draft with AI"}
          </button>
        </div>
        <textarea
          className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none focus:border-lime-300"
          id={`booking-message-${listing.id}`}
          maxLength={600}
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Anything the business should know?"
          value={message}
        />
      </div>
      <button className="mt-4 min-h-12 w-full rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-55" disabled={busy} type="submit">
        {busy ? "Sending..." : "Request Booking"}
      </button>
    </form>
  );
}

function Field({
  max,
  min,
  name,
  placeholder,
  required = false,
  type = "text"
}: {
  max?: number;
  min?: number;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{placeholder}</span>
      <input className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" max={max} min={min} name={name} placeholder={placeholder} required={required} type={type} />
    </label>
  );
}
