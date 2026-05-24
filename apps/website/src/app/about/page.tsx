import type { Metadata } from "next";
import { LinkButton } from "../../components/gofunmotion/Button";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "About GoFunMotion",
  description:
    "GoFunMotion Deals helps people discover local activities, last-minute deals, date ideas, family plans, and spontaneous things to do.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">About</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
        Make local plans easier to choose.
      </h1>
      <div className="mt-8 grid gap-5 text-lg leading-8 text-white/68">
        <p>
          GoFunMotion Deals exists for the moment when someone wants to do something fun but does not want to search through tabs, maps, reviews, calendars, and group texts.
        </p>
        <p>
          The product direction is local discovery: city, mood, time, budget, and who is going in; simple plans, activity deals, and booking requests out.
        </p>
        <p>
          Today the site uses clearly marked demo scaffolding while Firebase saves, booking requests, partner dashboards, and admin approval are connected.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/find">Find My Plan</LinkButton>
        <LinkButton href="/partner" variant="ghost">Partner With Us</LinkButton>
      </div>
    </main>
  );
}
