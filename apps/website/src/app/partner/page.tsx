import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BadgeCheck, ClipboardList, Send } from "lucide-react";
import { dealFormatExamples, partnerDealTypes } from "../../lib/deal-taxonomy";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Partner With GoFunMotion Deals",
  description:
    "Local businesses can list discounted last-minute open slots, slow-hour activity deals, and receive booking requests through GoFunMotion Deals.",
  keywords: ["activity business marketing", "local business deals", "booking requests", "promoted listings"],
  path: "/partner"
});

const partnerBenefits = [
  { icon: ClipboardList, title: "Post open slots", text: "Create clear last-minute offers for classes, events, experiences, and unused time windows." },
  { icon: Send, title: "Receive requests", text: "Customers request the discounted window first, so your team can confirm availability before a visit is promised." },
  { icon: BadgeCheck, title: "Approval first", text: "Partner listings should require admin approval before public visibility." },
  { icon: BarChart3, title: "Grow when ready", text: "Approved partners can activate Growth or Pro for more active deals, analytics, and placement eligibility." }
];

export default function PartnerPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">For local businesses</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">
            Fill empty slots with discounted last-minute offers.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/64">
            GoFunMotion Deals is being built for businesses with unused time windows: escape rooms, studios, classes, kids activity centers, wellness businesses, tours, workshops, and local venues.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/pricing">
              View Pricing
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/partner/apply">
              Apply to List Your Business
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black text-white">Simple open-slot marketplace</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Businesses apply, create clear was/now offers, and receive booking requests. Public visibility requires admin approval; approved partners can manage subscriptions from their dashboard.
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

      <section className="mt-12">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Who can list</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
            Businesses with real openings, empty seats, or slow hours.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/60">
            GoFunMotion works best when the offer is simple: a real activity, a real time window, a clear discount, and limited remaining availability.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partnerDealTypes.map((type) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-5" key={type.id}>
              <h3 className="text-2xl font-black text-white">{type.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{type.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {type.offerTypes.slice(0, 3).map((offer) => (
                  <span className="rounded-full bg-lime-300/10 px-3 py-1.5 text-xs font-black text-lime-100" key={offer}>
                    {offer}
                  </span>
                ))}
              </div>
              <p className="mt-4 rounded-2xl bg-black/24 p-3 text-sm font-black text-white/76">{type.dealExamples[0]}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-white/38">
                Buyers: {type.customerTypes.slice(0, 3).join(", ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-200">Best deal formats</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {dealFormatExamples.map((format) => (
            <span className="rounded-full bg-black/28 px-4 py-2 text-sm font-black text-white/78" key={format}>
              {format}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-black/24 p-6 md:p-8" id="interest">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Partner application</p>
        <h2 className="mt-3 text-4xl font-black text-white">Start with a reviewed application.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
          The workflow is application, admin review, business profile, open-slot listing editor, booking requests, and dashboard. Future paid placement will still require an active plan and admin approval.
        </p>
        <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/partner/apply">
          Apply to List Your Business
        </Link>
      </section>
    </main>
  );
}
