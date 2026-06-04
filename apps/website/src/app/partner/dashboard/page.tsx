import type { Metadata } from "next";
import Link from "next/link";
import { PartnerDashboard } from "../../../components/partner/partner-dashboard";
import { buildSeoMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Partner Dashboard | GoFunMotion Deals",
  description: "Business dashboard for GoFunMotion Deals partners to manage open-slot deals, listings, and booking requests.",
  noIndex: true,
  path: "/partner/dashboard"
});

export default function PartnerDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Partner dashboard</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Manage open-slot deals and booking requests.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/64">
            Businesses can use this dashboard after approval to manage open windows, discounted listings, request status, and basic stats.
          </p>
        </div>
        <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/partner/apply">
          Apply for live access
        </Link>
      </div>
      <PartnerDashboard />
    </main>
  );
}
