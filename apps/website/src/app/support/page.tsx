import type { Metadata } from "next";
import { SupportAssistant } from "../../components/ai/support-assistant";
import { LinkButton } from "../../components/gofunmotion/Button";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Support | GoFunMotion",
  description:
    "Get support for GoFunMotion accounts, saved activity plans, booking requests, partner applications, and local activity listings.",
  path: "/support"
});

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Support</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
        Help for plans, deals, and partner listings.
      </h1>
      <div className="mt-8 grid gap-5 text-base leading-7 text-white/68 md:text-lg md:leading-8">
        <p>
          GoFunMotion helps people discover local activity deals, save plans, and request
          availability from participating partners. For account help, booking request questions,
          or listing issues, contact support and include the email used for your account.
        </p>
        <p>
          If a booking request involves a local partner, the partner is responsible for confirming
          activity details, availability, arrival instructions, safety requirements, and any direct
          payment or refund policy.
        </p>
      </div>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-xl font-black text-white">Customer Support</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Saved plans, login, booking requests, profile, and account deletion.
          </p>
          <p className="mt-4 text-sm font-black text-lime-200">hello@gofunmotion.com</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-xl font-black text-white">Partner Support</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Partner applications, listings, approvals, open spots, and dashboard questions.
          </p>
          <p className="mt-4 text-sm font-black text-lime-200">partners@gofunmotion.com</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-xl font-black text-white">Safety Reports</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Report suspicious listings, incorrect details, policy issues, or account concerns.
          </p>
          <p className="mt-4 text-sm font-black text-lime-200">hello@gofunmotion.com</p>
        </div>
      </section>
      <SupportAssistant />
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/deals">Browse Deals</LinkButton>
        <LinkButton href="/privacy" variant="ghost">Privacy Policy</LinkButton>
        <LinkButton href="/terms" variant="ghost">Terms</LinkButton>
      </div>
    </main>
  );
}
