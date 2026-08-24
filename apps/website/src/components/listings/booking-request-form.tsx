"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getCurrentUserIdToken } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import type { Listing } from "../../types/deals";

export function BookingRequestForm({ listing }: { listing: Listing }) {
  const [status, setStatus] = useState("Sign in, choose a time, and request availability. No payment is collected.");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<{ requestId: string; synced: boolean } | null>(null);

  async function draftMessage() {
    if (aiBusy || listing.isDemo) return;
    setAiBusy(true);
    setStatus("Drafting an editable note from your message...");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
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
    const token = await getCurrentUserIdToken();

    if (!token) {
      setBusy(false);
      setStatus("Please sign in before requesting booking.");
      return;
    }

    const payload = {
      email: String(formData.get("email") ?? ""),
      businessId: listing.businessId,
      businessName: listing.businessName,
      cityId: listing.cityId,
      listingId: listing.id,
      listingSlug: listing.slug,
      listingTitle: listing.title,
      message: String(formData.get("message") ?? ""),
      name: String(formData.get("name") ?? ""),
      partySize: Number(formData.get("partySize") ?? 1),
      phone: String(formData.get("phone") ?? ""),
      requestedDate: String(formData.get("requestedDate") ?? ""),
      requestedTime: String(formData.get("requestedTime") ?? "")
    };

    const response = await fetch("/api/booking-request", {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const result = (await response.json().catch(() => null)) as { error?: string; ok?: boolean; requestId?: string; synced?: boolean } | null;

    setBusy(false);
    if (response.ok) {
      trackEvent("booking_request_submitted", { listingId: listing.id, listingSlug: listing.slug });
      setConfirmation({ requestId: result?.requestId ?? "pending", synced: result?.synced === true });
    }
    setStatus(
      response.ok
        ? "Request sent. Status: pending. The business will confirm availability before anything is charged."
        : result?.error ?? "Could not send request yet."
    );
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
      <p className="mt-2 text-sm leading-6 text-white/58">{status}</p>
      {confirmation ? (
        <div className="mt-4 rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-lime-200">Booking request sent</p>
          <p className="mt-2 text-lg font-black text-white">Your request is pending confirmation.</p>
          <p className="mt-2 text-sm leading-6 text-white/62">
            The business can mark it contacted, confirmed, or cancelled from their dashboard. You can track the status in your profile.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white" href="/profile">
              View request status
            </Link>
            <span className="inline-flex min-h-11 items-center rounded-2xl bg-black/24 px-4 text-xs font-bold text-white/50">
              Request ID: {confirmation.requestId}
            </span>
          </div>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field name="name" placeholder="Name" required />
        <Field name="email" placeholder="Email" required type="email" />
        <Field name="phone" placeholder="Phone optional" />
        <Field name="requestedDate" placeholder="Requested date" required type="date" />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Time</span>
          <select className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" name="requestedTime" required defaultValue={listing.availableSlots[0] ?? ""}>
            {listing.availableSlots.map((slot) => (
              <option className="bg-[#070816]" key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </label>
        <Field min={1} max={50} name="partySize" placeholder="Party size" required type="number" />
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
