import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BadgeCheck, ClipboardList, Send } from "lucide-react";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Partner With GoFunMotion Deals",
  description:
    "Local businesses can prepare to list activities, promote last-minute deals, and receive booking requests through GoFunMotion Deals.",
  keywords: ["activity business marketing", "local business deals", "booking requests", "promoted listings"],
  path: "/partner"
});

const partnerBenefits = [
  { icon: ClipboardList, title: "List activities", text: "Create clear listings for classes, events, experiences, and local deals." },
  { icon: Send, title: "Receive requests", text: "Use request-based booking while payments and checkout stay out of Phase 1." },
  { icon: BadgeCheck, title: "Approval first", text: "Partner listings should require admin approval before public visibility." },
  { icon: BarChart3, title: "Grow later", text: "Future plans can support promoted listings, subscriptions, lead fees, and commissions." }
];

export default function PartnerPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">For local businesses</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">
            Fill empty slots with people looking for something fun to do.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/64">
            GoFunMotion Deals is being built for escape rooms, studios, classes, kids activity centers, wellness businesses, tours, workshops, and local venues.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/pricing">
              View Pricing
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/partner#interest">
              Join Partner Interest List
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Phase 1 boundary</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            This starter page does not create live partner accounts, collect payments, or publish real listings. Phase 2 and Phase 3 will wire auth, Firestore, applications, dashboards, and approval.
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {partnerBenefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-6" key={benefit.title}>
              <Icon aria-hidden="true" className="text-cyan-300" size={30} />
              <h2 className="mt-5 text-2xl font-black text-white">{benefit.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/58">{benefit.text}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-black/24 p-6 md:p-8" id="interest">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Partner application coming next</p>
        <h2 className="mt-3 text-4xl font-black text-white">Business intake is prepared for Phase 3.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
          The target workflow is application, admin review, business profile, listing editor, booking requests, and dashboard. No self-approval or paid placement is enabled in Phase 1.
        </p>
      </section>
    </main>
  );
}
