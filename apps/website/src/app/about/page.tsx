import type { Metadata } from "next";
import { LinkButton } from "../../components/gofunmotion/Button";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "About GoFunMotion",
  description:
    "GoFunMotion Deals helps people find discounted last-minute activity openings, date night deals, family passes, and local experiences.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">About</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
        Make last-minute fun easier to find.
      </h1>
      <div className="mt-8 grid gap-5 text-lg leading-8 text-white/68">
        <p>
          GoFunMotion Deals exists for the moment when someone wants to do something fun tonight and would rather compare clear discounted openings than search through tabs, maps, calendars, and group texts.
        </p>
        <p>
          The product direction is local open-slot deals: city and time in; was/now pricing, spots left, and booking requests out.
        </p>
        <p>
          Today the site uses clearly marked demo scaffolding while Firebase saves, booking requests, partner dashboards, and admin approval are connected.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/deals?when=tonight">Browse Tonight&apos;s Deals</LinkButton>
        <LinkButton href="/partner" variant="ghost">Partner With Us</LinkButton>
      </div>
    </main>
  );
}
