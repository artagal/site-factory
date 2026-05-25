"use client";

import { useState } from "react";
import { partnerDealTypes } from "../../lib/deal-taxonomy";
import { demoCategories } from "../../lib/demoData";
import { CitySelectField } from "../shared/city-select-field";

export function PartnerApplicationForm() {
  const [status, setStatus] = useState("Applications are reviewed before any listing becomes public.");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    if (busy) return;
    setBusy(true);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/partner-application", {
      body: JSON.stringify({
        ...payload,
        offersLastMinuteDeals: formData.get("offersLastMinuteDeals") === "on"
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    setStatus(response.ok ? "Application received. We will review it before anything goes public." : result?.error ?? "Could not submit yet.");
  }

  return (
    <form action={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 md:p-6">
      <h2 className="text-3xl font-black text-white">Apply to list your business</h2>
      <p className="mt-2 text-sm leading-6 text-white/58">{status}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field name="businessName" placeholder="Business name" required />
        <Field name="ownerName" placeholder="Owner name" required />
        <Field name="email" placeholder="Email" required type="email" />
        <Field name="phone" placeholder="Phone" />
        <CitySelectField label="Business city" />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Business category</span>
          <select className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" name="category" required>
            {partnerDealTypes.map((type) => (
              <option className="bg-[#070816]" key={type.id} value={type.name}>{type.name}</option>
            ))}
            {demoCategories.map((category) => (
              <option className="bg-[#070816]" key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </label>
        <Field name="website" placeholder="Website" />
        <Field name="instagram" placeholder="Instagram" />
        <Field name="averagePrice" placeholder="Average price" />
      </div>
      <label className="mt-3 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">What do you want to list?</span>
        <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none focus:border-lime-300" name="description" placeholder="Example: pottery seats tonight, escape room at 8:30 PM, slow-hour family pass, first class trial, or cancellation slot." required />
      </label>
      <label className="mt-3 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Message</span>
        <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none focus:border-lime-300" name="message" placeholder="Anything else we should know?" />
      </label>
      <label className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl bg-black/24 px-4 text-sm font-bold text-white/70">
        <input className="size-5 accent-lime-300" name="offersLastMinuteDeals" type="checkbox" />
        We can offer last-minute deals or open-slot availability.
      </label>
      <button className="mt-5 min-h-12 w-full rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-55" disabled={busy} type="submit">
        {busy ? "Submitting..." : "Apply to List Your Business"}
      </button>
    </form>
  );
}

function Field({
  name,
  placeholder,
  required = false,
  type = "text"
}: {
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{placeholder}</span>
      <input className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" name={name} placeholder={placeholder} required={required} type={type} />
    </label>
  );
}
