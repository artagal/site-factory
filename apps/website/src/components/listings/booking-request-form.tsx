"use client";

import { useState } from "react";
import { getCurrentUserIdToken } from "../../lib/auth";
import type { Listing } from "../../types/deals";

export function BookingRequestForm({ listing }: { listing: Listing }) {
  const [status, setStatus] = useState("Sign in, choose a time, and request availability. No payment is collected.");
  const [busy, setBusy] = useState(false);

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
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const result = (await response.json().catch(() => null)) as { error?: string; ok?: boolean; synced?: boolean } | null;

    setBusy(false);
    setStatus(
      response.ok
        ? "Request sent. The business will confirm availability."
        : result?.error ?? "Could not send request yet."
    );
  }

  return (
    <form action={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <h2 className="text-2xl font-black text-white">Request booking</h2>
      <p className="mt-2 text-sm leading-6 text-white/58">{status}</p>
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
      <label className="mt-3 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Message</span>
        <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none focus:border-lime-300" name="message" placeholder="Anything the business should know?" />
      </label>
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
