"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Building2, CheckCircle2, ListChecks, MapPinned, ShieldCheck } from "lucide-react";
import { observeUser } from "../../lib/auth";
import { demoBusinesses, demoCategories, demoCities, demoListings } from "../../lib/demoData";
import { isFirebaseConfigured } from "../../lib/firebase";
import { isAdminUser } from "../../lib/firestore";

export function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("");
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

  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <AdminStat icon={ShieldCheck} label="Applications" value="Review" />
        <AdminStat icon={Building2} label="Businesses" value={String(demoBusinesses.length)} />
        <AdminStat icon={ListChecks} label="Listings" value={String(demoListings.length)} />
        <AdminStat icon={MapPinned} label="Cities" value={String(demoCities.length)} />
        <AdminStat icon={CheckCircle2} label="Categories" value={String(demoCategories.length)} />
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <AdminPanel title="Demo listing review state" items={demoListings.map((listing) => `${listing.title} - ${listing.status}/${listing.approvalStatus}`)} />
        <AdminPanel title="Managed cities" items={demoCities.map((city) => `${city.name}, ${city.state} - ${city.active ? "active" : "coming soon"}`)} />
      </section>
    </>
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

function AdminStat({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <Icon aria-hidden="true" className="text-cyan-300" size={24} />
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
    </div>
  );
}
