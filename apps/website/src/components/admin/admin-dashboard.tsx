"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { BadgeCheck, Building2, CalendarClock, CheckCircle2, CreditCard, Eye, ListChecks, MapPinned, Megaphone, MousePointerClick, PauseCircle, ShieldCheck, Star, XCircle } from "lucide-react";
import { getCurrentUserIdToken, observeUser } from "../../lib/auth";
import { demoBusinesses, demoCategories, demoCities, demoListings } from "../../lib/demoData";
import { isFirebaseConfigured } from "../../lib/firebase";
import { canFeatureListings, canPromoteListings, getPartnerTierCapabilities } from "../../lib/partner-limits";
import {
  isAdminUser,
  readAdminBookingRequests,
  readAdminBusinesses,
  readAdminCategories,
  readAdminCities,
  readAdminListings,
  readAdminPartnerApplications,
  readAdminPartnerSubscriptions,
  type BookingRequestRecord,
  type PartnerApplicationRecord,
  type PartnerSubscriptionRecord
} from "../../lib/firestore";
import type { Business, Category, City, Listing } from "../../types/deals";

export function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checking, setChecking] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequestRecord[]>([]);
  const [status, setStatus] = useState("");
  const [subscriptions, setSubscriptions] = useState<PartnerSubscriptionRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  useEffect(() => {
    let cancelled = false;

    async function check(nextUser: User) {
      setChecking(true);
      setStatus("");
      try {
        const nextAllowed = await isAdminUser(nextUser.uid);
        if (!cancelled) {
          setAllowed(nextAllowed);
          setStatus(nextAllowed ? "" : "This signed-in account does not have admin access yet.");
        }

        if (nextAllowed) {
          const [nextApplications, nextBusinesses, nextListings, nextSubscriptions, nextBookingRequests, nextCities, nextCategories] = await Promise.all([
            readAdminPartnerApplications(),
            readAdminBusinesses(),
            readAdminListings(),
            readAdminPartnerSubscriptions(),
            readAdminBookingRequests(),
            readAdminCities(),
            readAdminCategories()
          ]);

          if (!cancelled) {
            setApplications(nextApplications);
            setBusinesses(nextBusinesses);
            setListings(nextListings);
            setSubscriptions(nextSubscriptions);
            setBookingRequests(nextBookingRequests);
            setCities(nextCities);
            setCategories(nextCategories);
          }
        }
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not verify admin access.");
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    if (!isFirebaseConfigured()) {
      setChecking(false);
      setStatus("Admin access is not connected yet.");
      return;
    }

    if (!user) {
      setChecking(false);
      return;
    }

    void check(user);
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!isFirebaseConfigured() || !user || !allowed) {
    return (
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
        <ShieldCheck aria-hidden="true" className="text-cyan-300" size={32} />
        <h2 className="mt-4 text-3xl font-black text-white">Admin access is protected.</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Sign in with an owner account. Approval controls are visible only to accounts marked as admins.
        </p>
        {checking ? <p className="mt-4 text-sm font-bold text-white/58">Checking admin access...</p> : null}
        {status ? <p className="mt-4 rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
        {!user ? (
          <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/login?next=/admin">
            Sign In
          </Link>
        ) : null}
      </section>
    );
  }

  const visibleBusinesses = businesses.length ? businesses : demoBusinesses;
  const visibleListings = listings.length ? listings : demoListings;
  const visibleCities = cities.length ? cities : demoCities;
  const visibleCategories = categories.length ? categories : demoCategories;
  const metrics = {
    clicks: visibleListings.reduce((sum, listing) => sum + (listing.clickCount ?? 0), 0),
    requests: bookingRequests.length || visibleListings.reduce((sum, listing) => sum + (listing.requestCount ?? 0), 0),
    saves: visibleListings.reduce((sum, listing) => sum + (listing.saveCount ?? 0), 0),
    views: visibleListings.reduce((sum, listing) => sum + (listing.viewCount ?? 0), 0)
  };
  const subscriptionItems = subscriptions.length
    ? subscriptions.map((subscription) => {
      const business = visibleBusinesses.find((item) => item.id === subscription.businessId);
      const businessLabel = business?.name ?? subscription.businessId ?? "Unlinked business";
      return `${businessLabel} - ${subscription.pricingTier ?? "unknown tier"} - ${subscription.subscriptionStatus}`;
    })
    : ["No paid partner subscriptions synced yet."];

  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-7">
        <AdminStat icon={ShieldCheck} label="Applications" value={String(applications.length || "Review")} />
        <AdminStat icon={Building2} label="Businesses" value={String(visibleBusinesses.length)} />
        <AdminStat icon={ListChecks} label="Listings" value={String(visibleListings.length)} />
        <AdminStat icon={MapPinned} label="Cities" value={String(visibleCities.length)} />
        <AdminStat icon={BadgeCheck} label="Categories" value={String(visibleCategories.length)} />
        <AdminStat icon={CreditCard} label="Paid plans" value={String(subscriptions.filter((subscription) => subscription.paidAccessEnabled).length)} />
        <AdminStat icon={CalendarClock} label="Requests" value={String(bookingRequests.length)} />
      </section>
      <AdminMetricsPanel metrics={metrics} />
      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Partner applications</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-white/52">
            Search the owner by email, connect their account, then create the approved business profile.
          </p>
          <div className="mt-4 grid gap-3">
            {applications.length ? applications.map((application) => (
              <ApplicationApprovalCard application={application} key={application.id} onApproved={() => user && void refreshAdminData(user)} />
            )) : (
              <div className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/64">No live partner applications yet.</div>
            )}
          </div>
        </div>
        <AdminPanel title="Partner subscriptions" items={subscriptionItems} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">{listings.length ? "Live listing approvals" : "Demo listing review state"}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-white/52">
            Approve, reject, publish, feature, promote, pause, or expire partner-created listings.
          </p>
          <div className="mt-4 grid gap-3">
            {visibleListings.map((listing) => (
              <ListingModerationCard
                business={visibleBusinesses.find((item) => item.id === listing.businessId) ?? null}
                key={listing.id}
                listing={listing}
                live={Boolean(listings.length)}
                onModerated={() => user && void refreshAdminData(user)}
              />
            ))}
          </div>
        </div>
        <AdminCityCategoryManager
          categories={visibleCategories}
          cities={visibleCities}
          live={Boolean(cities.length || categories.length)}
          onCreated={() => user && void refreshAdminData(user)}
        />
        <AdminBookingRequestsPanel requests={bookingRequests} />
      </section>
    </>
  );

  async function refreshAdminData(nextUser: User) {
    setStatus("");
    try {
      const [nextApplications, nextBusinesses, nextListings, nextSubscriptions, nextBookingRequests, nextCities, nextCategories] = await Promise.all([
        readAdminPartnerApplications(),
        readAdminBusinesses(),
        readAdminListings(),
        readAdminPartnerSubscriptions(),
        readAdminBookingRequests(),
        readAdminCities(),
        readAdminCategories()
      ]);
      setApplications(nextApplications);
      setBusinesses(nextBusinesses);
      setListings(nextListings);
      setSubscriptions(nextSubscriptions);
      setBookingRequests(nextBookingRequests);
      setCities(nextCities);
      setCategories(nextCategories);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not refresh admin data.");
    }
  }
}

type ListingModerationAction =
  | "approve"
  | "reject"
  | "publish"
  | "pause"
  | "expire"
  | "feature"
  | "unfeature"
  | "promote"
  | "unpromote";

function ListingModerationCard({
  business,
  listing,
  live,
  onModerated
}: {
  business: Business | null;
  listing: Listing;
  live: boolean;
  onModerated: () => void;
}) {
  const [busyAction, setBusyAction] = useState<ListingModerationAction | "">("");
  const [status, setStatus] = useState("");
  const canFeature = business ? canFeatureListings(business) : false;
  const canPromote = business ? canPromoteListings(business) : false;
  const tier = business ? getPartnerTierCapabilities(business) : null;

  async function moderateListing(action: ListingModerationAction) {
    if (busyAction || !live) return;
    setBusyAction(action);
    setStatus("");

    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as an admin before moderating listings.");
        return;
      }

      const response = await fetch("/api/admin/listings/moderate", {
        body: JSON.stringify({
          action,
          listingId: listing.id
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { error?: string; status?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Listing moderation failed.");
        return;
      }

      setStatus(`Listing updated: ${action}.`);
      onModerated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Listing moderation failed.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-black text-white">{listing.title}</p>
          <p className="mt-1 text-sm font-bold text-white/52">{listing.businessName} - {listing.cityName}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/58">{listing.shortDescription}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-white/62">{listing.status}</span>
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-white/62">{listing.approvalStatus}</span>
            {tier ? <span className="rounded-full bg-white/[0.08] px-3 py-1 text-white/62">{tier.label}</span> : null}
            {listing.featured ? <span className="rounded-full bg-lime-300 px-3 py-1 text-[#070816]">Featured</span> : null}
            {listing.promoted ? <span className="rounded-full bg-cyan-300 px-3 py-1 text-[#070816]">Promoted</span> : null}
          </div>
        </div>
        <Link className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-xs font-black text-lime-200 hover:text-white" href={`/deals/${listing.slug}`}>
          <Eye aria-hidden="true" size={14} />
          View
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex min-h-10 items-center rounded-full bg-lime-300/12 px-3 text-xs font-black uppercase tracking-[0.12em] text-lime-100">
          Approval
        </span>
        <ModerationButton action="approve" busyAction={busyAction} disabled={!live || listing.approvalStatus === "approved"} icon={BadgeCheck} label="Approve & Publish" onClick={moderateListing} />
        <ModerationButton action="reject" busyAction={busyAction} disabled={!live || listing.approvalStatus === "rejected"} icon={XCircle} label="Reject" onClick={moderateListing} />
        <ModerationButton action="publish" busyAction={busyAction} disabled={!live || listing.status === "published"} icon={Eye} label="Publish" onClick={moderateListing} />
        <ModerationButton action="pause" busyAction={busyAction} disabled={!live || listing.status === "paused"} icon={PauseCircle} label="Pause" onClick={moderateListing} />
        <ModerationButton action="expire" busyAction={busyAction} disabled={!live || listing.status === "expired"} icon={XCircle} label="Expire" onClick={moderateListing} />
        <ModerationButton action={listing.featured ? "unfeature" : "feature"} busyAction={busyAction} disabled={!live || (!listing.featured && !canFeature)} icon={Star} label={listing.featured ? "Unfeature" : canFeature ? "Feature" : "Growth+ Feature"} onClick={moderateListing} />
        <ModerationButton action={listing.promoted ? "unpromote" : "promote"} busyAction={busyAction} disabled={!live || (!listing.promoted && !canPromote)} icon={Megaphone} label={listing.promoted ? "Unpromote" : canPromote ? "Promote" : "Pro Promote"} onClick={moderateListing} />
      </div>
      <div className="mt-4 grid gap-2 text-xs font-black text-white/54 sm:grid-cols-4">
        <MetricPill icon={Eye} label="Views" value={listing.viewCount ?? 0} />
        <MetricPill icon={CalendarClock} label="Requests" value={listing.requestCount ?? 0} />
        <MetricPill icon={Star} label="Saves" value={listing.saveCount ?? 0} />
        <MetricPill icon={MousePointerClick} label="Clicks" value={listing.clickCount ?? 0} />
      </div>
      {live && business && (!canFeature || !canPromote) ? (
        <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-white/50">
          Paid placement is tier-gated: Growth can be featured, Pro can be promoted. Current effective tier: {tier?.label ?? "Starter"}.
        </p>
      ) : null}
      {!live ? <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-white/50">Demo listings are read-only. Live partner listings will show active moderation controls.</p> : null}
      {status ? <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}

function MetricPill({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/[0.06] px-3">
      <Icon aria-hidden="true" className="text-cyan-300" size={14} />
      {label}: {value}
    </span>
  );
}

function ModerationButton({
  action,
  busyAction,
  disabled,
  icon: Icon,
  label,
  onClick
}: {
  action: ListingModerationAction;
  busyAction: ListingModerationAction | "";
  disabled: boolean;
  icon: typeof CheckCircle2;
  label: string;
  onClick: (action: ListingModerationAction) => Promise<void>;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-xs font-black text-white/66 hover:bg-white/[0.14] disabled:opacity-50"
      disabled={disabled || Boolean(busyAction)}
      onClick={() => void onClick(action)}
      type="button"
    >
      <Icon aria-hidden="true" size={14} />
      {busyAction === action ? "Working..." : label}
    </button>
  );
}

function ApplicationApprovalCard({
  application,
  onApproved
}: {
  application: PartnerApplicationRecord;
  onApproved: () => void;
}) {
  const [approveBusy, setApproveBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupEmail, setLookupEmail] = useState(application.email);
  const [ownerUid, setOwnerUid] = useState("");
  const [createdBusinessId, setCreatedBusinessId] = useState(application.approvedBusinessId ?? "");
  const [status, setStatus] = useState("");

  async function lookupOwnerUid() {
    if (lookupBusy) return;
    setLookupBusy(true);
    setStatus("");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as an admin before searching users.");
        return;
      }

      const response = await fetch("/api/admin/users/lookup", {
        body: JSON.stringify({ email: lookupEmail }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { displayName?: string | null; email?: string; error?: string; uid?: string } | null;

      if (!response.ok || !result?.uid) {
        setStatus(result?.error ?? "User lookup failed.");
        return;
      }

      setOwnerUid(result.uid);
      setStatus(`Found ${result.displayName ?? result.email ?? "account"}: ${result.uid}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "User lookup failed.");
    } finally {
      setLookupBusy(false);
    }
  }

  async function approveApplication() {
    if (approveBusy) return;
    setApproveBusy(true);
    setStatus("");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as an admin before approving applications.");
        return;
      }

      const response = await fetch("/api/admin/partner-applications/approve", {
        body: JSON.stringify({
          applicationId: application.id,
          ownerUid,
          status: "approved"
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { businessId?: string; error?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? "Approval failed.");
        return;
      }

      const businessId = result?.businessId ?? application.approvedBusinessId ?? "";
      setCreatedBusinessId(businessId);
      setStatus(`Business created: ${businessId || "approved"}.`);
      onApproved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Approval failed.");
    } finally {
      setApproveBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-black text-white">{application.businessName}</p>
          <p className="mt-1 text-sm font-bold text-white/52">{application.city} - {application.category} - {application.status}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/58">{application.description}</p>
          <p className="mt-2 text-xs font-bold text-white/42">{application.email}</p>
        </div>
        <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-lime-200">{application.status}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-bold text-white outline-none placeholder:text-white/32 focus:border-cyan-300/60"
          onChange={(event) => setLookupEmail(event.target.value)}
          placeholder="Owner email"
          value={lookupEmail}
        />
        <button
          className="min-h-11 rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-5 text-sm font-black text-cyan-100 hover:bg-cyan-300/18 disabled:opacity-60"
          disabled={lookupBusy || application.status === "approved"}
          onClick={lookupOwnerUid}
          type="button"
        >
          {lookupBusy ? "Searching..." : "Find UID"}
        </button>
        <input
          className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-bold text-white outline-none placeholder:text-white/32 focus:border-lime-300/60"
          onChange={(event) => setOwnerUid(event.target.value)}
          placeholder="Owner account UID"
          value={ownerUid}
        />
        <button
          className="min-h-11 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-60"
          disabled={approveBusy || application.status === "approved"}
          onClick={approveApplication}
          type="button"
        >
          {approveBusy ? "Creating..." : application.status === "approved" ? "Approved" : "Create Business"}
        </button>
      </div>
      {status ? <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
      {createdBusinessId || application.approvedBusinessId ? (
        <div className="mt-3 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
          <p className="text-sm font-black text-lime-100">Business created.</p>
          <p className="mt-1 break-all text-xs font-bold text-white/58">Business ID: {createdBusinessId || application.approvedBusinessId}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-lime-300 px-4 text-xs font-black text-[#070816] hover:bg-white" href="/partner/dashboard">
              Open Partner Dashboard
            </Link>
            <Link className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-xs font-black text-white hover:bg-white/12" href="/admin">
              Review Listings
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminMetricsPanel({ metrics }: { metrics: { clicks: number; requests: number; saves: number; views: number } }) {
  const items = [
    { icon: Eye, label: "Views", value: metrics.views },
    { icon: CalendarClock, label: "Requests", value: metrics.requests },
    { icon: Star, label: "Saves", value: metrics.saves },
    { icon: MousePointerClick, label: "Clicks", value: metrics.clicks }
  ];

  return (
    <section className="mt-5 grid gap-3 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="rounded-2xl border border-white/10 bg-black/24 p-4" key={item.label}>
            <Icon aria-hidden="true" className="text-lime-200" size={20} />
            <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{item.label}</p>
          </div>
        );
      })}
    </section>
  );
}

function AdminCityCategoryManager({
  categories,
  cities,
  live,
  onCreated
}: {
  categories: Category[];
  cities: City[];
  live: boolean;
  onCreated: () => void;
}) {
  const [busy, setBusy] = useState<"city" | "category" | "">("");
  const [status, setStatus] = useState("");

  async function createResource(kind: "city" | "category", formData: FormData) {
    if (busy) return;
    setBusy(kind);
    setStatus("");
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in as an admin before creating cities or categories.");
        return;
      }

      const payload = Object.fromEntries(formData.entries());
      const response = await fetch(kind === "city" ? "/api/admin/cities" : "/api/admin/categories", {
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as { categoryId?: string; cityId?: string; error?: string } | null;

      if (!response.ok) {
        setStatus(result?.error ?? `Could not create ${kind}.`);
        return;
      }

      setStatus(`${kind === "city" ? "City" : "Category"} created: ${result?.cityId ?? result?.categoryId ?? "saved"}.`);
      onCreated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Could not create ${kind}.`);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="text-2xl font-black text-white">Cities and categories</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-white/52">
        Create supply areas and marketplace categories without leaving admin.
      </p>
      {!live ? <p className="mt-3 rounded-2xl bg-black/24 p-3 text-xs font-bold leading-5 text-white/48">Showing demo defaults until live Firestore records exist.</p> : null}

      <div className="mt-5 grid gap-4">
        <form action={(formData) => void createResource("city", formData)} className="rounded-2xl bg-black/24 p-4">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-lime-300">Create city</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <AdminInput label="City" name="name" placeholder="Miami" required />
            <AdminInput label="State" name="state" placeholder="FL" required />
            <AdminInput defaultValue="US" label="Country" name="country" />
            <AdminInput defaultValue="America/New_York" label="Timezone" name="timezone" />
          </div>
          <AdminInput className="mt-3" label="Description" name="description" placeholder="Last-minute deals and local activity openings." />
          <button className="mt-3 min-h-11 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-60" disabled={busy === "city"} type="submit">
            {busy === "city" ? "Creating..." : "Create City"}
          </button>
        </form>

        <form action={(formData) => void createResource("category", formData)} className="rounded-2xl bg-black/24 p-4">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-300">Create category</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <AdminInput label="Category" name="name" placeholder="Comedy" required />
            <AdminInput defaultValue="Sparkles" label="Icon" name="icon" />
            <AdminInput defaultValue="#bef264" label="Accent color" name="accentColor" />
            <AdminInput defaultValue="100" label="Sort order" name="sortOrder" type="number" />
          </div>
          <AdminInput className="mt-3" label="Description" name="description" placeholder="Comedy tickets, open mics, and last-minute show deals." />
          <button className="mt-3 min-h-11 rounded-2xl bg-cyan-300 px-5 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-60" disabled={busy === "category"} type="submit">
            {busy === "category" ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AdminMiniList title="Managed cities" items={cities.slice(0, 8).map((city) => `${city.name}, ${city.state} - ${city.active ? "active" : "coming soon"}`)} />
        <AdminMiniList title="Managed categories" items={categories.slice(0, 8).map((category) => `${category.name} - ${category.active ? "active" : "inactive"}`)} />
      </div>
      {status ? <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}

function AdminMiniList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((item) => (
          <p className="text-sm font-bold text-white/58" key={item}>{item}</p>
        )) : <p className="text-sm font-bold text-white/42">No records yet.</p>}
      </div>
    </div>
  );
}

function AdminInput({
  className = "",
  defaultValue,
  label,
  name,
  placeholder,
  required = false,
  type = "text"
}: {
  className?: string;
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/42">{label}</span>
      <input
        className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-bold text-white outline-none placeholder:text-white/28 focus:border-lime-300/60"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

function AdminPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/64" key={item}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function AdminBookingRequestsPanel({ requests }: { requests: BookingRequestRecord[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="text-2xl font-black text-white">Booking requests</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-white/52">
        Admin overview of customer requests across all businesses. Businesses update contacted, confirmed, or cancelled from their dashboard.
      </p>
      <div className="mt-4 grid gap-3">
        {requests.length ? requests.slice(0, 12).map((request) => (
          <div className="rounded-2xl bg-black/24 p-4" key={request.id}>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p className="font-black text-white">{request.listingTitle ?? "Booking request"}</p>
                <p className="mt-1 text-sm font-bold text-white/54">
                  {request.businessName ?? request.businessId} - {request.requestedDate} {request.requestedTime}
                </p>
                <p className="mt-1 text-sm font-bold text-white/42">
                  {request.name} - {request.email} - party of {request.partySize}
                </p>
              </div>
              <AdminRequestStatusBadge status={request.status} />
            </div>
            {request.message ? <p className="mt-3 text-sm leading-6 text-white/50">{request.message}</p> : null}
          </div>
        )) : (
          <div className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/64">No booking requests yet.</div>
        )}
      </div>
    </div>
  );
}

function AdminRequestStatusBadge({ status }: { status: BookingRequestRecord["status"] }) {
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

function AdminStat({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <Icon aria-hidden="true" className="text-cyan-300" size={24} />
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
    </div>
  );
}
