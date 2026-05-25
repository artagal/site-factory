"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { BadgeCheck, Building2, CheckCircle2, CreditCard, Eye, ListChecks, MapPinned, Megaphone, PauseCircle, ShieldCheck, Star, XCircle } from "lucide-react";
import { getCurrentUserIdToken, observeUser } from "../../lib/auth";
import { demoBusinesses, demoCategories, demoCities, demoListings } from "../../lib/demoData";
import { isFirebaseConfigured } from "../../lib/firebase";
import {
  isAdminUser,
  readAdminBusinesses,
  readAdminListings,
  readAdminPartnerApplications,
  readAdminPartnerSubscriptions,
  type PartnerApplicationRecord,
  type PartnerSubscriptionRecord
} from "../../lib/firestore";
import type { Business, Listing } from "../../types/deals";

export function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [checking, setChecking] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
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
          setStatus(nextAllowed ? "" : "This account is not listed in admins/{uid}.");
        }

        if (nextAllowed) {
          const [nextApplications, nextBusinesses, nextListings, nextSubscriptions] = await Promise.all([
            readAdminPartnerApplications(),
            readAdminBusinesses(),
            readAdminListings(),
            readAdminPartnerSubscriptions()
          ]);

          if (!cancelled) {
            setApplications(nextApplications);
            setBusinesses(nextBusinesses);
            setListings(nextListings);
            setSubscriptions(nextSubscriptions);
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
      setStatus("Admin access requires Firebase configuration and an admins/{uid} document.");
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
          Create an admins document for the signed-in Firebase user before approval controls are visible.
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
  const subscriptionItems = subscriptions.length
    ? subscriptions.map((subscription) => {
      const business = visibleBusinesses.find((item) => item.id === subscription.businessId);
      const businessLabel = business?.name ?? subscription.businessId ?? "Unlinked business";
      return `${businessLabel} - ${subscription.pricingTier ?? "unknown tier"} - ${subscription.subscriptionStatus}`;
    })
    : ["No paid partner subscriptions synced yet."];

  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <AdminStat icon={ShieldCheck} label="Applications" value={String(applications.length || "Review")} />
        <AdminStat icon={Building2} label="Businesses" value={String(visibleBusinesses.length)} />
        <AdminStat icon={ListChecks} label="Listings" value={String(visibleListings.length)} />
        <AdminStat icon={MapPinned} label="Cities" value={String(demoCities.length)} />
        <AdminStat icon={CreditCard} label="Paid plans" value={String(subscriptions.filter((subscription) => subscription.paidAccessEnabled).length)} />
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Partner applications</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-white/52">
            Enter the Firebase Auth UID for the partner owner, then create the approved business profile.
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
                key={listing.id}
                listing={listing}
                live={Boolean(listings.length)}
                onModerated={() => user && void refreshAdminData(user)}
              />
            ))}
          </div>
        </div>
        <AdminPanel title="Managed cities" items={demoCities.map((city) => `${city.name}, ${city.state} - ${city.active ? "active" : "coming soon"}`)} />
      </section>
    </>
  );

  async function refreshAdminData(nextUser: User) {
    setStatus("");
    try {
      const [nextApplications, nextBusinesses, nextListings, nextSubscriptions] = await Promise.all([
        readAdminPartnerApplications(),
        readAdminBusinesses(),
        readAdminListings(),
        readAdminPartnerSubscriptions()
      ]);
      setApplications(nextApplications);
      setBusinesses(nextBusinesses);
      setListings(nextListings);
      setSubscriptions(nextSubscriptions);
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
  listing,
  live,
  onModerated
}: {
  listing: Listing;
  live: boolean;
  onModerated: () => void;
}) {
  const [busyAction, setBusyAction] = useState<ListingModerationAction | "">("");
  const [status, setStatus] = useState("");

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
        <ModerationButton action="approve" busyAction={busyAction} disabled={!live || listing.approvalStatus === "approved"} icon={BadgeCheck} label="Approve & Publish" onClick={moderateListing} />
        <ModerationButton action="reject" busyAction={busyAction} disabled={!live || listing.approvalStatus === "rejected"} icon={XCircle} label="Reject" onClick={moderateListing} />
        <ModerationButton action="publish" busyAction={busyAction} disabled={!live || listing.status === "published"} icon={Eye} label="Publish" onClick={moderateListing} />
        <ModerationButton action="pause" busyAction={busyAction} disabled={!live || listing.status === "paused"} icon={PauseCircle} label="Pause" onClick={moderateListing} />
        <ModerationButton action="expire" busyAction={busyAction} disabled={!live || listing.status === "expired"} icon={XCircle} label="Expire" onClick={moderateListing} />
        <ModerationButton action={listing.featured ? "unfeature" : "feature"} busyAction={busyAction} disabled={!live} icon={Star} label={listing.featured ? "Unfeature" : "Feature"} onClick={moderateListing} />
        <ModerationButton action={listing.promoted ? "unpromote" : "promote"} busyAction={busyAction} disabled={!live} icon={Megaphone} label={listing.promoted ? "Unpromote" : "Promote"} onClick={moderateListing} />
      </div>
      {!live ? <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-white/50">Demo listings are read-only. Live partner listings will show active moderation controls.</p> : null}
      {status ? <p className="mt-3 rounded-2xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
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
      setStatus(`Found ${result.displayName ?? result.email ?? "Firebase user"}: ${result.uid}`);
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
          placeholder="Owner email in Firebase Auth"
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
          placeholder="Firebase owner UID"
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

function AdminStat({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <Icon aria-hidden="true" className="text-cyan-300" size={24} />
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
    </div>
  );
}
