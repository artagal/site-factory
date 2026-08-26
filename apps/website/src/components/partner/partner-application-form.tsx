"use client";

import { useState } from "react";
import { FieldError, StatusBanner } from "../gofunmotion/product-states";
import { CategorySelectField } from "../shared/category-select-field";
import { CitySelectField } from "../shared/city-select-field";

export function PartnerApplicationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Applications are reviewed before any listing becomes public.");
  const [statusTone, setStatusTone] = useState<"info" | "success" | "danger">("info");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    if (busy || statusTone === "success") return;
    const nextErrors = validateApplication(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatusTone("danger");
      setStatus("Fix the highlighted fields before submitting.");
      return;
    }

    setBusy(true);
    setStatusTone("info");
    setStatus("Submitting your application...");
    try {
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
      setStatusTone(response.ok ? "success" : "danger");
      setStatus(response.ok ? "Application received. We will review it before anything goes public." : result?.error ?? "Could not submit yet.");
    } catch {
      setStatusTone("danger");
      setStatus("Could not confirm submission. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 md:p-6">
      <h2 className="text-3xl font-black text-white">Apply to list your business</h2>
      <div className="mt-4">
        <StatusBanner title={statusTone === "success" ? "Application status" : "Before you submit"} tone={statusTone}>
          {status}
        </StatusBanner>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field error={errors.businessName} name="businessName" placeholder="Business name" required />
        <Field error={errors.ownerName} name="ownerName" placeholder="Owner name" required />
        <Field error={errors.email} name="email" placeholder="Email" required type="email" />
        <Field name="phone" placeholder="Phone" />
        <CitySelectField label="Business city" />
        <CategorySelectField label="Business category" />
        <Field name="website" placeholder="Website" />
        <Field name="instagram" placeholder="Instagram" />
        <Field name="averagePrice" placeholder="Average price" />
      </div>
      <label className="mt-3 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">What do you want to list?</span>
        <textarea className={`mt-2 min-h-28 w-full rounded-2xl border bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none focus:border-lime-300 ${errors.description ? "border-rose-300/50" : "border-white/10"}`} name="description" placeholder="Example: pottery seats tonight, escape room at 8:30 PM, slow-hour family pass, first class trial, or cancellation slot." required />
        <FieldError>{errors.description}</FieldError>
      </label>
      <label className="mt-3 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Message</span>
        <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm font-bold text-white outline-none focus:border-lime-300" name="message" placeholder="Anything else we should know?" />
      </label>
      <label className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl bg-black/24 px-4 text-sm font-bold text-white/70">
        <input className="size-5 accent-lime-300" name="offersLastMinuteDeals" type="checkbox" />
        We can offer last-minute deals or open-slot availability.
      </label>
      <button className="mt-5 min-h-12 w-full rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-55" disabled={busy || statusTone === "success"} type="submit">
        {statusTone === "success" ? "Application received" : busy ? "Submitting..." : "Apply to List Your Business"}
      </button>
    </form>
  );
}

function Field({
  error,
  name,
  placeholder,
  required = false,
  type = "text"
}: {
  error?: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{placeholder}</span>
      <input aria-invalid={Boolean(error)} className={`mt-2 min-h-12 w-full rounded-2xl border bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300 ${error ? "border-rose-300/50" : "border-white/10"}`} name={name} placeholder={placeholder} required={required} type={type} />
      <FieldError>{error}</FieldError>
    </label>
  );
}

function validateApplication(formData: FormData) {
  const errors: Record<string, string> = {};
  const businessName = String(formData.get("businessName") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (businessName.length < 2) errors.businessName = "Enter the business name.";
  if (ownerName.length < 2) errors.ownerName = "Enter the owner or manager name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (description.length < 20) errors.description = "Add at least 20 characters so admins can understand the offer.";

  return errors;
}
