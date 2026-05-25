"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { ClipboardList, Eye, MousePointerClick, PlusCircle, Send, Star } from "lucide-react";
import { LastMinuteDealEditor } from "./last-minute-deal-editor";
import { PartnerBillingPortalButton } from "./partner-billing-portal-button";
import { PartnerCheckoutButton } from "./partner-checkout-button";
import { observeUser } from "../../lib/auth";
import { demoBusinesses, demoListings } from "../../lib/demoData";
import { isFirebaseConfigured } from "../../lib/firebase";
import { readBookingRequestsForBusiness, readBusinessesForOwner, readListingsForBusiness, type BookingRequestRecord } from "../../lib/firestore";
import type { Business, Listing } from "../../types/deals";

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
      setStatus("Firebase is not configured yet. Apply first, then connect live ownership in Firebase.");
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
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
        <h2 className="text-3xl font-black text-white">Sign in to manage your business.</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">Partner dashboards are only available to authenticated business owners.</p>
        <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/login?next=/partner/dashboard">
          Sign In
        </Link>
      </section>
    );
  }

  if (isFirebaseConfigured() && user && !loading && !businesses.length) {
    return (
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
        <h2 className="text-3xl font-black text-white">No approved business is attached yet.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
          Apply first, then an admin can review the business and connect your Firebase account as an owner. Demo businesses are not shown as live owned inventory.
        </p>
        {status ? <p className="mt-4 rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/partner/apply">
            Apply to List Your Business
          </Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/partner">
            See Partner Fit
          </Link>
        </div>
      </section>
    );
  }

  const business = businesses[0] ?? demoBusinesses[0];
  const visibleListings = listings.length
    ? listings
    : business.isDemo
      ? demoListings.filter((listing) => listing.businessId === business.id)
      : [];

  return (
    <>
      {status ? <p className="mt-6 rounded-2xl bg-black/24 p-4 text-sm font-bold text-lime-100">{status}</p> : null}
      {loading ? <p className="mt-6 text-sm font-bold text-white/58">Loading partner dashboard...</p> : null}
      <section className="mt-8 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Next step</p>
            <h2 className="mt-2 text-2xl font-black text-white">Create a last-minute deal and submit it for approval.</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-white/58">Use only the key fields first: title, city, category, time, was price, now price, spots left, and booking mode.</p>
          </div>
          <a className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="#create-last-minute-deal">
            <PlusCircle aria-hidden="true" size={18} />
            Create Last-Minute Deal
          </a>
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
          <div className="mt-4 rounded-2xl bg-black/24 p-4">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-300">Partner plan</p>
            <p className="mt-2 text-2xl font-black capitalize text-white">{business.pricingTier ?? "starter"}</p>
            <p className="mt-1 text-sm font-bold text-white/54">
              Subscription: {business.subscriptionStatus ?? "not active"}.
              {business.paidAccessEnabled ? " Paid features are enabled." : " Upgrade to unlock recurring deal campaigns."}
            </p>
            {business.isDemo ? null : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {business.stripeCustomerId ? (
                  <PartnerBillingPortalButton
                    businessId={business.id}
                    className="min-h-11 w-full rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-60"
                  />
                ) : (
                  <>
                    <PartnerCheckoutButton
                      businessId={business.id}
                      className="min-h-11 w-full rounded-2xl bg-lime-300 px-4 text-sm font-black text-[#070816] hover:bg-white disabled:opacity-60"
                      email={user?.email}
                      label="Upgrade to Growth"
                      tier="growth"
                    />
                    <PartnerCheckoutButton
                      businessId={business.id}
                      className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-black text-white hover:bg-white/12 disabled:opacity-60"
                      email={user?.email}
                      label="Upgrade to Pro"
                      tier="pro"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Listings</h2>
          <div className="mt-4 grid gap-3">
            {visibleListings.length ? visibleListings.map((listing) => (
              <div className="rounded-2xl bg-black/24 p-4" key={listing.id}>
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="font-black text-white">{listing.title}</p>
                    <p className="mt-1 text-sm text-white/52">{listing.status} / {listing.approvalStatus}</p>
                  </div>
                  <Link className="text-sm font-black text-lime-200 hover:text-white" href={`/deals/${listing.slug}`}>View</Link>
                </div>
              </div>
            )) : (
              <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold leading-6 text-white/58">
                No live deals yet. Use the editor below to create a draft or submit the first last-minute offer for approval.
              </p>
            )}
          </div>
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
        <div className="mt-3 grid gap-2">
          {bookingRequests.length ? bookingRequests.map((request) => (
            <p className="rounded-xl bg-white/[0.06] p-3 text-sm font-bold text-white/62" key={request.id}>
              {request.name} - {request.requestedDate} {request.requestedTime} - {request.status}
            </p>
          )) : (
            <p className="text-sm leading-6 text-white/58">Incoming requests will appear here with pending, contacted, confirmed, cancelled, or rejected status.</p>
          )}
        </div>
      </section>
    </>
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
