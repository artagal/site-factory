"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Clock, Edit3, PauseCircle, Plus, Send, Tag, Trash2, type LucideIcon } from "lucide-react";
import { getCurrentUserIdToken } from "../../lib/auth";
import { demoCategories } from "../../lib/demoData";
import type { Business, GroupType, IndoorOutdoor, Listing, PlanVibe } from "../../types/deals";

type SaveMode = "draft" | "submit";
type ListingAction = "submit" | "pause" | "draft" | "expire";

type DealFormState = {
  availableSlot: string;
  bookingMode: "request" | "external_link";
  bookingUrl: string;
  cancellationNote: string;
  capacity: string;
  categoryIds: string[];
  description: string;
  durationMinutes: string;
  groupSize: string;
  groupTypes: GroupType[];
  indoorOutdoor: IndoorOutdoor;
  listingId: string;
  originalPrice: string;
  price: string;
  remainingSpots: string;
  shortDescription: string;
  terms: string;
  title: string;
  vibeTags: PlanVibe[];
  whyItFits: string;
};

const GROUP_OPTIONS: Array<{ label: string; value: GroupType }> = [
  { label: "Date", value: "date" },
  { label: "Friends", value: "friends" },
  { label: "Family", value: "family" },
  { label: "Kids", value: "kids" },
  { label: "Solo", value: "solo" }
];

const VIBE_OPTIONS: Array<{ label: string; value: PlanVibe }> = [
  { label: "Chill", value: "chill" },
  { label: "Romantic", value: "romantic" },
  { label: "Active", value: "active" },
  { label: "Social", value: "social" },
  { label: "Creative", value: "creative" },
  { label: "Family-friendly", value: "family-friendly" },
  { label: "Low-energy", value: "low-energy" }
];

function blankForm(primaryCategory = "date-night"): DealFormState {
  return {
    availableSlot: "Tonight 7:00 PM",
    bookingMode: "request",
    bookingUrl: "",
    cancellationNote: "Request booking first. The business confirms availability before the customer pays or arrives.",
    capacity: "",
    categoryIds: [primaryCategory],
    description: "",
    durationMinutes: "90",
    groupSize: "2-6 people",
    groupTypes: ["date", "friends"],
    indoorOutdoor: "indoor",
    listingId: "",
    originalPrice: "",
    price: "",
    remainingSpots: "2",
    shortDescription: "",
    terms: "Last-minute deal is subject to availability and partner confirmation.",
    title: "",
    vibeTags: ["social"],
    whyItFits: "A discounted open slot for people looking for something fun today."
  };
}

function formFromListing(listing: Listing): DealFormState {
  return {
    availableSlot: listing.availableSlots[0] ?? "",
    bookingMode: listing.bookingMode === "external_link" ? "external_link" : "request",
    bookingUrl: listing.bookingUrl ?? "",
    cancellationNote: listing.cancellationNote,
    capacity: listing.capacity === null ? "" : String(listing.capacity),
    categoryIds: listing.categoryIds.length ? listing.categoryIds : ["date-night"],
    description: listing.description,
    durationMinutes: String(listing.durationMinutes),
    groupSize: listing.groupSize,
    groupTypes: listing.groupTypes,
    indoorOutdoor: listing.indoorOutdoor,
    listingId: listing.id,
    originalPrice: listing.originalPrice === null ? "" : String(listing.originalPrice),
    price: String(listing.price),
    remainingSpots: listing.remainingSpots === null ? "" : String(listing.remainingSpots),
    shortDescription: listing.shortDescription,
    terms: listing.terms,
    title: listing.title,
    vibeTags: listing.vibeTags,
    whyItFits: listing.whyItFits
  };
}

function activeLimit(tier: Business["pricingTier"]) {
  if (tier === "pro") return "Unlimited active deals";
  if (tier === "growth") return "10 active deals";
  return "1 active deal";
}

export function LastMinuteDealEditor({
  business,
  listings,
  onSaved
}: {
  business: Business;
  listings: Listing[];
  onSaved: () => void;
}) {
  const primaryCategory = business.categories[0] ?? "date-night";
  const [form, setForm] = useState<DealFormState>(() => blankForm(primaryCategory));
  const [busyMode, setBusyMode] = useState<SaveMode | null>(null);
  const [busyListingId, setBusyListingId] = useState("");
  const [status, setStatus] = useState("");

  const activeCount = useMemo(
    () => listings.filter((listing) => ["draft", "pending_approval", "published"].includes(listing.status)).length,
    [listings]
  );

  const isEditing = Boolean(form.listingId);

  function update<Key extends keyof DealFormState>(key: Key, value: DealFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray<Key extends "categoryIds" | "groupTypes" | "vibeTags">(key: Key, value: DealFormState[Key][number]) {
    setForm((current) => {
      const existing = current[key] as string[];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      return { ...current, [key]: next.length ? next : existing } as DealFormState;
    });
  }

  async function saveDeal(saveMode: SaveMode) {
    if (busyMode || business.isDemo) return;
    setBusyMode(saveMode);
    setStatus("");

    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as the business owner before saving deals.");
        return;
      }

      const response = await fetch("/api/partner/listings", {
        body: JSON.stringify({
          ...form,
          businessId: business.id,
          cityId: business.cityId,
          listingType: "deal",
          saveMode
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; listingId?: string; status?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Could not save this deal.");
        return;
      }

      setStatus(saveMode === "draft" ? "Draft saved." : "Deal submitted for admin approval.");
      setForm((current) => ({ ...current, listingId: result?.listingId ?? current.listingId }));
      onSaved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save this deal.");
    } finally {
      setBusyMode(null);
    }
  }

  async function updateListingStatus(listing: Listing, action: ListingAction) {
    if (busyListingId || business.isDemo) return;
    setBusyListingId(`${listing.id}:${action}`);
    setStatus("");

    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as the business owner before updating listings.");
        return;
      }

      const response = await fetch("/api/partner/listings", {
        body: JSON.stringify({
          action,
          businessId: business.id,
          listingId: listing.id
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "PATCH"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; status?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Could not update this listing.");
        return;
      }

      setStatus(`Listing moved to ${result?.status ?? action}.`);
      onSaved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update this listing.");
    } finally {
      setBusyListingId("");
    }
  }

  async function deleteListing(listing: Listing) {
    if (busyListingId || business.isDemo) return;
    setBusyListingId(`${listing.id}:delete`);
    setStatus("");

    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as the business owner before deleting listings.");
        return;
      }

      const response = await fetch("/api/partner/listings", {
        body: JSON.stringify({
          businessId: business.id,
          listingId: listing.id
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "DELETE"
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Could not delete this listing.");
        return;
      }

      if (form.listingId === listing.id) setForm(blankForm(primaryCategory));
      setStatus("Listing deleted.");
      onSaved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not delete this listing.");
    } finally {
      setBusyListingId("");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">Last-minute deal editor</p>
          <h2 className="mt-2 text-2xl font-black text-white">Create an open-slot offer</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">
            Deals save as drafts or go to pending approval. Partners cannot self-approve, feature, or promote listings.
          </p>
        </div>
        <div className="rounded-2xl bg-black/24 px-4 py-3 text-sm font-bold text-white/62">
          {activeCount} active / {activeLimit(business.pricingTier)}
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl bg-black/24 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-white">Your deals</h3>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white"
              onClick={() => {
                setForm(blankForm(primaryCategory));
                setStatus("");
              }}
              type="button"
            >
              <Plus aria-hidden="true" size={16} />
              New
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {listings.length ? listings.map((listing) => (
              <div
                className={`rounded-2xl border p-4 transition hover:bg-white/[0.08] ${form.listingId === listing.id ? "border-lime-300/60 bg-lime-300/10" : "border-white/10 bg-white/[0.04]"}`}
                key={listing.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{listing.title}</p>
                    <p className="mt-1 text-sm font-bold text-white/50">{listing.status} / {listing.approvalStatus}</p>
                  </div>
                  <button
                    className="inline-flex min-h-9 items-center gap-2 rounded-full bg-cyan-300/12 px-3 text-xs font-black text-cyan-100 hover:bg-cyan-300/20"
                    onClick={() => {
                      setForm(formFromListing(listing));
                      setStatus("");
                    }}
                    type="button"
                  >
                    <Edit3 aria-hidden="true" size={14} />
                    Edit
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-white/[0.08] px-3 py-1 text-white/62">Was {listing.originalPrice ? `$${listing.originalPrice}` : "n/a"}</span>
                  <span className="rounded-full bg-lime-300 px-3 py-1 text-[#070816]">Now ${listing.price}</span>
                  <span className="rounded-full bg-white/[0.08] px-3 py-1 text-white/62">{listing.availableSlots[0] ?? "Set time"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="inline-flex min-h-9 items-center rounded-full bg-white/[0.08] px-3 text-xs font-black text-lime-200 hover:text-white" href={`/deals/${listing.slug}`}>
                    View
                  </Link>
                  {listing.status !== "pending_approval" ? (
                    <ActionButton
                      busy={busyListingId === `${listing.id}:submit`}
                      icon={Send}
                      label="Submit"
                      onClick={() => void updateListingStatus(listing, "submit")}
                    />
                  ) : null}
                  {listing.status !== "paused" ? (
                    <ActionButton
                      busy={busyListingId === `${listing.id}:pause`}
                      icon={PauseCircle}
                      label="Pause"
                      onClick={() => void updateListingStatus(listing, "pause")}
                    />
                  ) : (
                    <ActionButton
                      busy={busyListingId === `${listing.id}:draft`}
                      icon={Clock}
                      label="Draft"
                      onClick={() => void updateListingStatus(listing, "draft")}
                    />
                  )}
                  {listing.status !== "published" ? (
                    <ActionButton
                      busy={busyListingId === `${listing.id}:delete`}
                      icon={Trash2}
                      label="Delete"
                      onClick={() => void deleteListing(listing)}
                    />
                  ) : null}
                </div>
              </div>
            )) : (
              <p className="rounded-2xl bg-white/[0.05] p-4 text-sm font-bold leading-6 text-white/56">
                No live deals yet. Create a draft, then submit it for admin approval.
              </p>
            )}
          </div>
        </div>

        <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Deal title">
              <input className={inputClass} onChange={(event) => update("title", event.target.value)} placeholder="Escape room open slot" value={form.title} />
            </Field>
            <Field label="Available time">
              <input className={inputClass} onChange={(event) => update("availableSlot", event.target.value)} placeholder="Tonight 8:30 PM" value={form.availableSlot} />
            </Field>
            <Field label="Was price">
              <input className={inputClass} inputMode="decimal" onChange={(event) => update("originalPrice", event.target.value)} placeholder="90" value={form.originalPrice} />
            </Field>
            <Field label="Now price">
              <input className={inputClass} inputMode="decimal" onChange={(event) => update("price", event.target.value)} placeholder="39" value={form.price} />
            </Field>
            <Field label="Spots/windows left">
              <input className={inputClass} inputMode="numeric" onChange={(event) => update("remainingSpots", event.target.value)} placeholder="2" value={form.remainingSpots} />
            </Field>
            <Field label="Duration minutes">
              <input className={inputClass} inputMode="numeric" onChange={(event) => update("durationMinutes", event.target.value)} placeholder="90" value={form.durationMinutes} />
            </Field>
          </div>

          <Field label="Short card description">
            <input className={inputClass} onChange={(event) => update("shortDescription", event.target.value)} placeholder="2 discounted spots for tonight only." value={form.shortDescription} />
          </Field>
          <Field label="Full description">
            <textarea className={`${inputClass} min-h-28 py-3`} onChange={(event) => update("description", event.target.value)} placeholder="Describe the experience, who it is best for, and what is included." value={form.description} />
          </Field>

          <ChipGroup label="Category">
            {demoCategories.slice(0, 12).map((category) => (
              <Chip active={form.categoryIds.includes(category.id)} key={category.id} label={category.name} onClick={() => toggleArray("categoryIds", category.id)} />
            ))}
          </ChipGroup>
          <ChipGroup label="Great for">
            {GROUP_OPTIONS.map((option) => (
              <Chip active={form.groupTypes.includes(option.value)} key={option.value} label={option.label} onClick={() => toggleArray("groupTypes", option.value)} />
            ))}
          </ChipGroup>
          <ChipGroup label="Vibe">
            {VIBE_OPTIONS.map((option) => (
              <Chip active={form.vibeTags.includes(option.value)} key={option.value} label={option.label} onClick={() => toggleArray("vibeTags", option.value)} />
            ))}
          </ChipGroup>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Indoor/outdoor">
              <select className={inputClass} onChange={(event) => update("indoorOutdoor", event.target.value as IndoorOutdoor)} value={form.indoorOutdoor}>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="either">Either</option>
              </select>
            </Field>
            <Field label="Group size">
              <input className={inputClass} onChange={(event) => update("groupSize", event.target.value)} placeholder="2-6 people" value={form.groupSize} />
            </Field>
            <Field label="Capacity">
              <input className={inputClass} inputMode="numeric" onChange={(event) => update("capacity", event.target.value)} placeholder="Optional" value={form.capacity} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Booking mode">
              <select className={inputClass} onChange={(event) => update("bookingMode", event.target.value as DealFormState["bookingMode"])} value={form.bookingMode}>
                <option value="request">Request booking</option>
                <option value="external_link">External booking link</option>
              </select>
            </Field>
            <Field label="Booking link">
              <input className={inputClass} onChange={(event) => update("bookingUrl", event.target.value)} placeholder="Optional booking URL" value={form.bookingUrl} />
            </Field>
          </div>

          <Field label="Why it fits">
            <input className={inputClass} onChange={(event) => update("whyItFits", event.target.value)} value={form.whyItFits} />
          </Field>
          <Field label="Terms">
            <textarea className={`${inputClass} min-h-20 py-3`} onChange={(event) => update("terms", event.target.value)} value={form.terms} />
          </Field>
          <Field label="Cancellation / confirmation note">
            <textarea className={`${inputClass} min-h-20 py-3`} onChange={(event) => update("cancellationNote", event.target.value)} value={form.cancellationNote} />
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-5 text-sm font-black text-white hover:bg-white/12 disabled:opacity-60"
              disabled={Boolean(busyMode) || business.isDemo}
              onClick={() => void saveDeal("draft")}
              type="button"
            >
              <Clock aria-hidden="true" size={17} />
              {busyMode === "draft" ? "Saving..." : "Save Draft"}
            </button>
            <button
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-60"
              disabled={Boolean(busyMode) || business.isDemo}
              onClick={() => void saveDeal("submit")}
              type="button"
            >
              <Send aria-hidden="true" size={17} />
              {busyMode === "submit" ? "Submitting..." : isEditing ? "Resubmit for Approval" : "Submit for Approval"}
            </button>
          </div>
          {business.isDemo ? <p className="rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-white/54">Demo businesses cannot create live inventory. Connect an approved Firebase business first.</p> : null}
          {status ? <p className="rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-lime-300/60";

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/42">{label}</span>
      {children}
    </label>
  );
}

function ChipGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/42">
        <Tag aria-hidden="true" size={14} />
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`min-h-10 rounded-full px-4 text-sm font-black transition ${active ? "bg-lime-300 text-[#070816]" : "bg-white/[0.08] text-white/64 hover:bg-white/[0.12]"}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ActionButton({
  busy,
  icon: Icon,
  label,
  onClick
}: {
  busy: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-xs font-black text-white/66 hover:bg-white/[0.14] disabled:opacity-60"
      disabled={busy}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" size={14} />
      {busy ? "..." : label}
    </button>
  );
}
