"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { BarChart3, ClipboardList, Crown, Eye, LockKeyhole, MousePointerClick, PlusCircle, Send, Star } from "lucide-react";
import { LastMinuteDealEditor } from "./last-minute-deal-editor";
import { getCurrentUserIdToken, observeUser } from "../../lib/auth";
import { demoBusinesses, demoListings } from "../../lib/demoData";
import { isFirebaseConfigured } from "../../lib/firebase";
import { readBookingRequestsForBusiness, readBusinessesForOwner, readListingsForBusiness, type BookingRequestRecord } from "../../lib/firestore";
import { countLimitedListings, formatActiveListingLimit, getPartnerTierCapabilities, type PartnerTierCapabilities } from "../../lib/partner-limits";
import type { Business, Listing } from "../../types/deals";
import { EmptyStatePanel, LoadingRows, StatusBanner } from "../gofunmotion/product-states";

export function PartnerDashboard() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequestRecord[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  async function refreshDashboard(nextUser: User, showLoading = false) {
    if (showLoading) setLoading(true);
    setStatus("");
    try {
      const ownerBusinesses = await readBusinessesForOwner(nextUser.uid);
      const businessListings = ownerBusinesses.length ? await readListingsForBusiness(ownerBusinesses[0].id) : [];
      const requests = ownerBusinesses.length ? await readBookingRequestsForBusiness(ownerBusinesses[0].id) : [];
      setBusinesses(ownerBusinesses);
      setListings(businessListings);
      setBookingRequests(requests);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load partner dashboard.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load(nextUser: User) {
      setLoading(true);
      setStatus("");
      try {
        const ownerBusinesses = await readBusinessesForOwner(nextUser.uid);
        const businessListings = ownerBusinesses.length ? await readListingsForBusiness(ownerBusinesses[0].id) : [];
        const requests = ownerBusinesses.length ? await readBookingRequestsForBusiness(ownerBusinesses[0].id) : [];
        if (!cancelled) {
          setBusinesses(ownerBusinesses);
          setListings(businessListings);
          setBookingRequests(requests);
        }
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load partner dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!isFirebaseConfigured()) {
      setLoading(false);
      setStatus("Live partner accounts are not connected yet. Apply first, then we can connect ownership.");
      setBusinesses([demoBusinesses[0]]);
      setListings(demoListings.filter((listing) => listing.businessId === demoBusinesses[0].id));
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    void load(user);
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isFirebaseConfigured() && !user) {
    return (
      <section className="mt-8">
        <EmptyStatePanel
          action={
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/login?next=/partner/dashboard">
              Sign In
            </Link>
          }
          body="Partner dashboards are only available to authenticated business owners."
          icon={LockKeyhole}
          title="Sign in to manage your business"
        />
      </section>
    );
  }

  if (isFirebaseConfigured() && user && !loading && !businesses.length) {
    return (
      <section className="mt-8">
        <EmptyStatePanel
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/partner/apply">
                Apply to List Your Business
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/partner">
                See Partner Fit
              </Link>
            </div>
          }
          body="Apply first, then an admin can review the business and connect this account as an owner. Demo businesses are not shown as live owned inventory."
          icon={PlusCircle}
          title="No approved business is attached yet"
        />
        {status ? <div className="mt-4"><StatusBanner title="Partner account status" tone="warning">{status}</StatusBanner></div> : null}
      </section>
    );
  }

  const business = businesses[0] ?? demoBusinesses[0];
  const visibleListings = listings.length
    ? listings
    : business.isDemo
      ? demoListings.filter((listing) => listing.businessId === business.id)
      : [];
  const activeListingCount = countLimitedListings(visibleListings);
  const tierCapabilities = getPartnerTierCapabilities(business);
  const activeLimitLabel = formatActiveListingLimit(tierCapabilities.activeListings);
  const limitReached = Number.isFinite(tierCapabilities.activeListings) && activeListingCount >= tierCapabilities.activeListings;

  return (
    <>
      {status ? <div className="mt-6"><StatusBanner title="Dashboard notice" tone="warning">{status}</StatusBanner></div> : null}
      {loading ? <div className="mt-6"><LoadingRows rows={3} /></div> : null}
      <section className="mt-8 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Next step</p>
            <h2 className="mt-2 text-2xl font-black text-white">{limitReached ? "Upgrade to unlock more deals." : "Create a last-minute deal and submit it for approval."}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-white/58">
              {limitReached
                ? `${tierCapabilities.label} is at ${activeListingCount}/${activeLimitLabel} active deals. Upgrade, pause, or expire a listing to keep posting.`
                : "Use only the key fields first: title, city, category, time, was price, now price, spots left, and booking mode."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {!business.isDemo && (limitReached || tierCapabilities.tier === "starter") ? (
              <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/pricing">
                View future upgrades
              </Link>
            ) : null}
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="#create-last-minute-deal">
              <PlusCircle aria-hidden="true" size={18} />
              Create Last-Minute Deal
            </a>
          </div>
        </div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat icon={Eye} label="Listing views" value={String(visibleListings.reduce((sum, listing) => sum + listing.viewCount, 0) || (business.isDemo ? "Demo" : 0))} />
        <Stat icon={Send} label="Booking requests" value={String(bookingRequests.length)} />
        <Stat icon={Star} label="Saved count" value={String(visibleListings.reduce((sum, listing) => sum + listing.saveCount, 0))} />
        <Stat icon={MousePointerClick} label="Clicks" value={String(visibleListings.reduce((sum, listing) => sum + listing.clickCount, 0))} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Business profile</h2>
          <p className="mt-3 text-xl font-black text-white/82">{business.name}</p>
          <p className="mt-2 text-sm leading-6 text-white/58">{business.description}</p>
          <p className="mt-4 rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/58">
            Status: {business.status}. Partner-created listings stay pending until admin approval.
          </p>
          <PartnerPlanCard
            activeLimitLabel={activeLimitLabel}
            activeListingCount={activeListingCount}
            business={business}
            capabilities={tierCapabilities}
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Listings</h2>
          <PartnerListingsTable listings={visibleListings} />
        </div>
      </section>

      <section className="mt-8" id="create-last-minute-deal">
        <LastMinuteDealEditor
          business={business}
          listings={listings}
          onSaved={() => {
            if (user && isFirebaseConfigured()) void refreshDashboard(user);
          }}
        />
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-black/24 p-6">
        <ClipboardList aria-hidden="true" className="text-cyan-300" size={30} />
        <h2 className="mt-4 text-2xl font-black text-white">Booking requests</h2>
        <PartnerBookingRequestsTable
          onUpdated={() => {
            if (user && isFirebaseConfigured()) void refreshDashboard(user);
          }}
          requests={bookingRequests}
        />
      </section>
    </>
  );
}

type PartnerBookingStatusAction = "contacted" | "confirmed" | "cancelled";

function PartnerListingsTable({ listings }: { listings: Listing[] }) {
  if (!listings.length) {
    return (
      <div className="mt-4">
        <EmptyStatePanel
          body="Use the editor below to create a draft or submit the first last-minute offer for approval."
          icon={PlusCircle}
          title="No live deals yet"
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.06] text-xs font-black uppercase tracking-[0.12em] text-white/42">
            <tr>
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Demand</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {listings.map((listing) => (
              <tr className="bg-black/20 align-top" key={listing.id}>
                <td className="px-4 py-4">
                  <p className="font-black text-white">{listing.title}</p>
                  <p className="mt-1 text-xs font-bold text-white/46">{Array.isArray(listing.availableSlots) ? listing.availableSlots[0] ?? "Set a time" : "Set a time"} - {listing.cityName}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-white/76">{listing.status}</p>
                  <p className="mt-1 text-xs font-bold text-white/42">{listing.approvalStatus}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-lime-200">${listing.price}</p>
                  <p className="mt-1 text-xs font-bold text-white/42">{listing.originalPrice ? `was $${listing.originalPrice}` : "flexible was price"}</p>
                </td>
                <td className="px-4 py-4 text-xs font-bold text-white/52">
                  {listing.viewCount} views / {listing.requestCount} requests
                </td>
                <td className="px-4 py-4 text-right">
                  <Link className="text-sm font-black text-lime-200 hover:text-white" href={`/deals/${listing.slug}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {listings.map((listing) => (
          <div className="rounded-2xl bg-black/24 p-4" key={listing.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{listing.title}</p>
                <p className="mt-1 text-sm text-white/52">{listing.status} / {listing.approvalStatus}</p>
              </div>
              <Link className="text-sm font-black text-lime-200 hover:text-white" href={`/deals/${listing.slug}`}>View</Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black text-white/54">
              <span className="rounded-xl bg-white/[0.06] p-2">${listing.price}</span>
              <span className="rounded-xl bg-white/[0.06] p-2">{listing.viewCount} views</span>
              <span className="rounded-xl bg-white/[0.06] p-2">{listing.requestCount} requests</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnerBookingRequestsTable({
  onUpdated,
  requests
}: {
  onUpdated: () => void;
  requests: BookingRequestRecord[];
}) {
  if (!requests.length) {
    return (
      <div className="mt-4">
        <EmptyStatePanel
          body="Incoming requests will appear here with pending, contacted, confirmed, cancelled, or rejected status."
          icon={ClipboardList}
          title="No booking requests yet"
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.06] text-xs font-black uppercase tracking-[0.12em] text-white/42">
            <tr>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {requests.map((request) => (
              <PartnerBookingRequestRow key={request.id} onUpdated={onUpdated} request={request} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 lg:hidden">
        {requests.map((request) => (
          <PartnerBookingRequestCard key={request.id} onUpdated={onUpdated} request={request} />
        ))}
      </div>
    </div>
  );
}

function PartnerBookingRequestRow({
  onUpdated,
  request
}: {
  onUpdated: () => void;
  request: BookingRequestRecord;
}) {
  const [busyAction, setBusyAction] = useState<PartnerBookingStatusAction | "">("");
  const [status, setStatus] = useState("");

  async function updateRequest(nextStatus: PartnerBookingStatusAction) {
    if (busyAction) return;
    setBusyAction(nextStatus);
    setStatus("");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in first.");
        return;
      }

      const response = await fetch("/api/partner/booking-requests/status", {
        body: JSON.stringify({ requestId: request.id, status: nextStatus }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; status?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Could not update.");
        return;
      }

      setStatus(`Saved: ${result?.status ?? nextStatus}.`);
      onUpdated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <tr className="bg-black/20 align-top">
      <td className="px-4 py-4">
        <p className="font-black text-white">{request.listingTitle ?? "Booking request"}</p>
        {request.message ? <p className="mt-1 line-clamp-2 text-xs font-bold text-white/42">{request.message}</p> : null}
      </td>
      <td className="px-4 py-4 text-xs font-bold text-white/54">
        {request.name}<br />
        {request.email}<br />
        party of {request.partySize}
      </td>
      <td className="px-4 py-4 text-xs font-bold text-white/54">
        {request.requestedDate}<br />
        {request.requestedTime}
      </td>
      <td className="px-4 py-4">
        <RequestStatusBadge status={request.status} />
        {status ? <p className="mt-2 text-xs font-bold text-lime-100">{status}</p> : null}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <RequestStatusButton action="contacted" busyAction={busyAction} disabled={request.status === "contacted"} label="Contacted" onClick={updateRequest} />
          <RequestStatusButton action="confirmed" busyAction={busyAction} disabled={request.status === "confirmed"} label="Confirmed" onClick={updateRequest} />
          <RequestStatusButton action="cancelled" busyAction={busyAction} disabled={request.status === "cancelled"} label="Cancelled" onClick={updateRequest} />
        </div>
      </td>
    </tr>
  );
}

function PartnerPlanCard({
  activeLimitLabel,
  activeListingCount,
  business,
  capabilities
}: {
  activeLimitLabel: string;
  activeListingCount: number;
  business: Business;
  capabilities: PartnerTierCapabilities & { tier: "starter" | "growth" | "pro" };
}) {
  const featureRows = [
    {
      icon: PlusCircle,
      label: `${activeLimitLabel} active ${activeLimitLabel === "1" ? "deal" : "deals"}`,
      unlocked: true
    },
    {
      icon: BarChart3,
      label: `${capabilities.analyticsLevel} analytics`,
      unlocked: capabilities.analyticsLevel !== "basic"
    },
    {
      icon: Star,
      label: "Featured eligibility",
      unlocked: capabilities.canUseFeaturedPlacement
    },
    {
      icon: Crown,
      label: "Priority promoted campaigns",
      unlocked: capabilities.canUsePriorityPlacement
    }
  ];

  return (
    <div className="mt-4 rounded-2xl bg-black/24 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-300">Partner plan</p>
          <p className="mt-2 text-2xl font-black text-white">{capabilities.label}</p>
          <p className="mt-1 text-sm font-bold text-white/54">
            Current access: {business.paidAccessEnabled ? "approved paid-access record" : "request-first marketplace access"}.
            Payment checkout is not active yet.
          </p>
        </div>
        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/62">
          {activeListingCount}/{activeLimitLabel} active
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {featureRows.map((feature) => {
          const Icon = feature.unlocked ? feature.icon : LockKeyhole;
          return (
            <div className={`rounded-2xl border p-3 ${feature.unlocked ? "border-lime-300/20 bg-lime-300/10" : "border-white/10 bg-white/[0.04]"}`} key={feature.label}>
              <Icon aria-hidden="true" className={feature.unlocked ? "text-lime-200" : "text-white/34"} size={18} />
              <p className={`mt-2 text-sm font-black ${feature.unlocked ? "text-white" : "text-white/48"}`}>{feature.label}</p>
            </div>
          );
        })}
      </div>

      {business.isDemo ? null : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link className="min-h-11 w-full rounded-2xl bg-lime-300 px-4 text-center text-sm font-black leading-[44px] text-[#070816] hover:bg-white" href="/pricing">
            Compare future tiers
          </Link>
          <Link className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-center text-sm font-black leading-[44px] text-white hover:bg-white/12" href="/partner/apply">
            Update partner interest
          </Link>
        </div>
      )}
    </div>
  );
}

function PartnerBookingRequestCard({
  onUpdated,
  request
}: {
  onUpdated: () => void;
  request: BookingRequestRecord;
}) {
  const [busyAction, setBusyAction] = useState<PartnerBookingStatusAction | "">("");
  const [status, setStatus] = useState("");

  async function updateRequest(nextStatus: PartnerBookingStatusAction) {
    if (busyAction) return;
    setBusyAction(nextStatus);
    setStatus("");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as the business owner before updating requests.");
        return;
      }

      const response = await fetch("/api/partner/booking-requests/status", {
        body: JSON.stringify({
          requestId: request.id,
          status: nextStatus
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; status?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Could not update request.");
        return;
      }

      setStatus(`Request marked ${result?.status ?? nextStatus}.`);
      onUpdated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update request.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="font-black text-white">{request.listingTitle ?? "Booking request"}</p>
          <p className="mt-1 text-sm font-bold text-white/58">
            {request.name} - {request.email} - party of {request.partySize}
          </p>
          <p className="mt-1 text-sm font-bold text-white/48">
            {request.requestedDate} {request.requestedTime}
          </p>
          {request.message ? <p className="mt-3 text-sm leading-6 text-white/54">{request.message}</p> : null}
        </div>
        <RequestStatusBadge status={request.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <RequestStatusButton action="contacted" busyAction={busyAction} disabled={request.status === "contacted"} label="Contacted" onClick={updateRequest} />
        <RequestStatusButton action="confirmed" busyAction={busyAction} disabled={request.status === "confirmed"} label="Confirmed" onClick={updateRequest} />
        <RequestStatusButton action="cancelled" busyAction={busyAction} disabled={request.status === "cancelled"} label="Cancelled" onClick={updateRequest} />
      </div>
      {status ? <p className="mt-3 rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}

function RequestStatusButton({
  action,
  busyAction,
  disabled,
  label,
  onClick
}: {
  action: PartnerBookingStatusAction;
  busyAction: PartnerBookingStatusAction | "";
  disabled: boolean;
  label: string;
  onClick: (status: PartnerBookingStatusAction) => Promise<void>;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center rounded-full bg-black/28 px-4 text-xs font-black text-white/66 hover:bg-white/[0.12] disabled:opacity-50"
      disabled={disabled || Boolean(busyAction)}
      onClick={() => void onClick(action)}
      type="button"
    >
      {busyAction === action ? "Saving..." : label}
    </button>
  );
}

function RequestStatusBadge({ status }: { status: BookingRequestRecord["status"] }) {
  const styles: Record<BookingRequestRecord["status"], string> = {
    cancelled: "border-rose-300/25 bg-rose-300/12 text-rose-100",
    confirmed: "border-lime-300/30 bg-lime-300/14 text-lime-100",
    contacted: "border-cyan-300/25 bg-cyan-300/12 text-cyan-100",
    pending: "border-amber-300/25 bg-amber-300/12 text-amber-100",
    rejected: "border-white/10 bg-white/[0.08] text-white/60"
  };

  return (
    <span className={`inline-flex min-h-8 shrink-0 items-center rounded-full border px-3 text-xs font-black uppercase tracking-[0.12em] ${styles[status]}`}>
      {status}
    </span>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <Icon aria-hidden="true" className="text-lime-200" size={24} />
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-white/50">{label}</p>
    </div>
  );
}
