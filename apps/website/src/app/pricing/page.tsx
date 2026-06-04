import type { Metadata } from "next";
import Link from "next/link";
import { dealFormatExamples } from "../../lib/deal-taxonomy";
import { partnerPricingTiers } from "../../lib/payments";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Partner Pricing | GoFunMotion Deals",
  description:
    "GoFunMotion Deals partner pricing for local activity businesses running discounted last-minute open-slot offers.",
  keywords: ["partner pricing", "local business listings", "promoted listings"],
  path: "/pricing"
});

const tiers = [
  ...partnerPricingTiers
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Future partner pricing</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Partner pricing for open-slot deals.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">
          Start with a reviewed free listing. Growth and Pro are planned partner tiers for more campaigns, better visibility, and deeper analytics. Payment checkout is intentionally not active yet.
        </p>
        <p className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-black text-cyan-100">
          Current monetization mode: applications, reviewed listings, and booking requests first. No consumer checkout or paid partner checkout is enabled.
        </p>
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-6" key={tier.name}>
            <h2 className="text-3xl font-black text-white">{tier.name}</h2>
            <p className="mt-3 text-4xl font-black text-lime-200">{tier.price}</p>
            <p className="mt-3 text-sm leading-6 text-white/58">{tier.description}</p>
            <ul className="mt-6 space-y-3 text-sm font-bold text-white/64">
              {tier.features.map((feature) => (
                <li className="rounded-2xl bg-black/24 p-3" key={feature}>
                  {feature}
                </li>
              ))}
            </ul>
            <Link className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href={`/partner/apply?plan=${tier.tier}`}>
              {tier.tier === "starter" ? tier.cta : "Join upgrade waitlist"}
            </Link>
          </article>
        ))}
      </section>
      <section className="mt-10 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Recommended revenue order</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Applications first", "Reviewed listings second", "Lead fees after request quality is proven", "Booking commissions only after operations are ready"].map((item) => (
            <div className="rounded-2xl bg-black/28 p-4 text-sm font-black leading-6 text-white/76" key={item}>{item}</div>
          ))}
        </div>
      </section>
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.055] p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">What partners sell</p>
        <h2 className="mt-3 text-3xl font-black text-white">Simple discounted windows, not complicated ads.</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {dealFormatExamples.map((format) => (
            <span className="rounded-full bg-black/28 px-4 py-2 text-sm font-black text-white/72" key={format}>
              {format}
            </span>
          ))}
        </div>
        <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" href="/partner/apply">
          Apply to List Your Business
        </Link>
      </section>
    </main>
  );
}
