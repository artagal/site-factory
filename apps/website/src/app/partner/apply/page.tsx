import type { Metadata } from "next";
import { PartnerApplicationForm } from "../../../components/partner/partner-application-form";
import { buildSeoMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Apply To List Your Business | GoFunMotion Deals",
  description: "Apply to list your local activity business, classes, deals, events, or last-minute availability on GoFunMotion Deals.",
  keywords: ["list your business", "activity marketplace", "local business leads"],
  path: "/partner/apply"
});

export default function PartnerApplyPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 md:py-16 lg:grid-cols-[0.85fr_1.15fr]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Partner application</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Bring your local experience to people ready to go out.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">
          Businesses can apply now. Listings stay pending until reviewed, so GoFunMotion does not present unapproved partners as live inventory.
        </p>
        <div className="mt-8 grid gap-3">
          {["Escape rooms", "Dance and fitness studios", "Pottery and cooking classes", "Kids activity centers", "Comedy, wellness, tours, workshops"].map((item) => (
            <div className="rounded-2xl bg-white/[0.06] p-4 text-sm font-black text-white/72" key={item}>{item}</div>
          ))}
        </div>
      </section>
      <PartnerApplicationForm />
    </main>
  );
}
