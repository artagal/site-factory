import type { Metadata } from "next";
import { AdminDashboard } from "../../components/admin/admin-dashboard";
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
          This page is only for approved GoFunMotion operators. Normal users cannot approve businesses, listings, featured placement, or promoted inventory.
        </p>
      </section>
      <AdminDashboard />
    </main>
  );
}
