import type { Metadata } from "next";
import { Building2, CheckCircle2, ListChecks, MapPinned, ShieldCheck } from "lucide-react";
import { demoBusinesses, demoCategories, demoCities, demoListings } from "../../lib/demoData";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Admin Dashboard | GoFunMotion Deals",
  description: "Admin approval dashboard for GoFunMotion Deals listings, businesses, partner applications, cities, and categories.",
  noIndex: true,
  path: "/admin"
});

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Admin approval</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Review supply before it goes public.</h1>
        <p className="mt-4 text-lg leading-8 text-white/64">
          In production this route is guarded by the admins collection. Normal users cannot approve businesses, listings, featured placement, or promoted inventory.
        </p>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <AdminStat icon={ShieldCheck} label="Applications" value="Review" />
        <AdminStat icon={Building2} label="Businesses" value={String(demoBusinesses.length)} />
        <AdminStat icon={ListChecks} label="Listings" value={String(demoListings.length)} />
        <AdminStat icon={MapPinned} label="Cities" value={String(demoCities.length)} />
        <AdminStat icon={CheckCircle2} label="Categories" value={String(demoCategories.length)} />
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <AdminPanel title="Listings pending approval" items={demoListings.map((listing) => `${listing.title} - ${listing.status}/${listing.approvalStatus}`)} />
        <AdminPanel title="Managed cities" items={demoCities.map((city) => `${city.name}, ${city.state} - ${city.active ? "active" : "coming soon"}`)} />
      </section>
    </main>
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
