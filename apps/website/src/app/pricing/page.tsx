import type { Metadata } from "next";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Partner Pricing | GoFunMotion Deals",
  description:
    "Preview future GoFunMotion Deals partner pricing tiers for local activity businesses. Payments are not implemented yet.",
  keywords: ["partner pricing", "local business subscriptions", "promoted listings"],
  path: "/pricing"
});

const tiers = [
  {
    name: "Starter",
    price: "Free",
    features: ["1 active listing", "Booking requests", "Basic business profile", "Admin approval required"]
  },
  {
    name: "Growth",
    price: "$29/mo",
    features: ["Up to 10 listings", "Deal campaigns", "Basic analytics", "Featured city eligibility"]
  },
  {
    name: "Pro",
    price: "$99/mo",
    features: ["Unlimited listings", "Priority placement", "Advanced analytics", "Promoted campaigns"]
  }
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Future partner pricing</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Pricing is planned, not active.</h1>
        <p className="mt-5 text-lg leading-8 text-white/64">
          These tiers define the product architecture for later. GoFunMotion does not implement checkout, Stripe, paid APIs, or live subscriptions yet.
        </p>
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-6" key={tier.name}>
            <h2 className="text-3xl font-black text-white">{tier.name}</h2>
            <p className="mt-3 text-4xl font-black text-lime-200">{tier.price}</p>
            <ul className="mt-6 space-y-3 text-sm font-bold text-white/64">
              {tier.features.map((feature) => (
                <li className="rounded-2xl bg-black/24 p-3" key={feature}>
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
