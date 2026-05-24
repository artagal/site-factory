import type { Metadata } from "next";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Terms of Use | GoFunMotion",
  description: "GoFunMotion terms of use for local discovery, activity deals, booking requests, partner listings, and prototype website usage.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
      <h1 className="text-5xl font-black text-white md:text-7xl">Terms of Use</h1>
      <div className="mt-8 grid gap-5 text-base leading-7 text-white/68">
        <p>GoFunMotion Deals is a discovery platform for local activity ideas, demo listings, future partner listings, saved plans, and request-based booking workflows.</p>
        <p>Demo listings are not real production partners or live bookable inventory. Do not treat demo prices, availability, or business names as active offers.</p>
        <p>Partners are responsible for the activities they provide, their policies, safety requirements, pricing, availability, and customer communication.</p>
        <p>Partner subscriptions may be processed through Stripe Checkout where configured. Consumer booking payments, commissions, promoted placements, and Stripe Connect payouts are future features and should be governed by updated terms before launch.</p>
      </div>
    </main>
  );
}
