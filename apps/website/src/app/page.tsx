import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarHeart, Clock3, MapPin, ShieldCheck, Sparkles, TicketPercent, Users } from "lucide-react";
import { DealCard } from "../components/gofunmotion/deal-card";
import { PlanFinderForm } from "../components/gofunmotion/plan-finder-form";
import { LinkButton } from "../components/gofunmotion/Button";
import { SeoJsonLd } from "../components/seo-json-ld";
import { categories, demoNotice, getFeaturedListings } from "../lib/deals-data";
import { buildSeoMetadata, createFaqSchema, createSchemaGraph, createWebPageSchema } from "../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "GoFunMotion - Find Fun Things To Do Today",
  description:
    "Discover local activities, last-minute deals, date ideas, family fun, and spontaneous plans based on your mood, time, budget, and city.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "things to do today",
    "fun things to do near me",
    "local activity deals",
    "date night ideas",
    "family activities",
    "last minute deals",
    "activity finder",
    "weekend plans",
    "local experiences",
    "fun finder"
  ],
  path: "/"
});

const planCards = [
  { accent: "from-fuchsia-400 to-rose-300", label: "Tonight", meta: "Comedy Night", price: "$18" },
  { accent: "from-lime-300 to-emerald-300", label: "25% off", meta: "Pottery Date Night", price: "$45" },
  { accent: "from-cyan-300 to-blue-300", label: "Under $50", meta: "Low-key date plan", price: "$39" },
  { accent: "from-amber-300 to-orange-300", label: "Weekend", meta: "Kids Indoor Play", price: "$20" },
  { accent: "from-violet-300 to-fuchsia-300", label: "Last slot", meta: "Escape Room", price: "$22" },
  { accent: "from-sky-300 to-lime-300", label: "Friends", meta: "Mini Golf Plan", price: "$24" }
];

const heroStats = [
  { icon: Clock3, label: "Fast plans", value: "1 minute" },
  { icon: TicketPercent, label: "Deal-ready", value: "Request first" },
  { icon: ShieldCheck, label: "Partner safety", value: "Reviewed" }
];

const howItWorks = [
  {
    icon: MapPin,
    title: "Tell us the basics",
    text: "City, when, who's going, budget, vibe, time, and indoor or outdoor."
  },
  {
    icon: Sparkles,
    title: "Get a simple plan",
    text: "GoFunMotion returns a shortlist with one clear plan, a matching deal, and a backup."
  },
  {
    icon: BadgeCheck,
    title: "Save or request",
    text: "Save ideas for later, share the plan, or request booking when a listing fits."
  }
];

const audienceSections = [
  {
    href: "/date-night",
    title: "Date night without the planning spiral",
    text: "Find romantic, playful, relaxed, or creative plans based on time and budget.",
    icon: CalendarHeart
  },
  {
    href: "/friends",
    title: "Group plans people can agree on",
    text: "Shortlist social activities, last-minute slots, and easy backup options.",
    icon: Users
  },
  {
    href: "/family",
    title: "Family activities that work today",
    text: "Filter for kids, indoor plans, weekends, and lower-stress options.",
    icon: Sparkles
  }
];

export default function HomePage() {
  const schema = createSchemaGraph([
    createWebPageSchema({
      description:
        "GoFunMotion Deals helps people discover local activities, last-minute deals, date ideas, family activities, and spontaneous plans.",
      path: "/",
      title: "GoFunMotion Deals"
    }),
    createFaqSchema([
      {
        question: "Do I need an account to browse plans?",
        answer: "No. You can use the plan finder and browse demo deal scaffolding before signing in."
      },
      {
        question: "Can I book directly today?",
        answer: "GoFunMotion uses request-based booking for now. Payments and checkout are not implemented yet."
      }
    ])
  ]);

  return (
    <main>
      <SeoJsonLd data={schema} id="gofunmotion-home-schema" />
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 md:px-8 md:py-14 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative">
          <p className="inline-flex min-h-9 items-center rounded-full border border-lime-300/25 bg-lime-300/10 px-4 text-xs font-black uppercase tracking-[0.16em] text-lime-100">
            Local plans and activity deals
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
            Find something fun to do today.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/68 md:text-xl">
            Tell us your city, mood, time, budget, and who&apos;s going. GoFunMotion finds real plans,
            local activities, and last-minute deals you can actually do.
          </p>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-cyan-200">
            No endless searching. No fake points. Just real things to do.
          </p>
          <div className="mt-8">
            <LinkButton className="min-h-14 rounded-2xl px-6 text-base" href="/find">
              Find My Plan
            </LinkButton>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4" key={stat.label}>
                  <Icon aria-hidden="true" className="text-lime-200" size={22} />
                  <p className="mt-3 text-lg font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/42">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1024]/84 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(244,114,182,0.26),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-55 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
          <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Tonight in Miami</p>
              <p className="mt-1 text-2xl font-black text-white">3-plan shortlist ready</p>
            </div>
            <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-[#070816]">Demo</span>
          </div>
          <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
            {planCards.map((card, index) => (
              <div
                className="group flex min-h-36 flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
                key={card.meta}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-full bg-gradient-to-r ${card.accent} px-3 py-1.5 text-xs font-black text-[#070816]`}>
                    {card.label}
                  </span>
                  <span className="text-lg font-black text-white">{card.price}</span>
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-white/38">
                    {index % 2 === 0 ? "Plan" : "Deal"}
                  </span>
                  <p className="mt-2 text-2xl font-black leading-tight text-white">{card.meta}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-4 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
            <p className="text-sm font-black text-lime-100">No fake production partners. Demo inventory stays labeled until approved businesses go live.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-5 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Quick finder</p>
          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">Start with one clear plan.</h2>
        </div>
        <PlanFinderForm />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Featured demo deals</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">Local activity cards for the new marketplace.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">{demoNotice}</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-black text-lime-200 hover:text-white" href="/deals">
            Browse deals <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {getFeaturedListings().map((listing) => (
            <DealCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Popular categories</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Choose the kind of fun that fits today.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition hover:border-white/20 hover:bg-white/[0.09]"
                href={`/deals?category=${category.id}`}
                key={category.id}
              >
                <span className="text-sm font-black uppercase tracking-[0.14em]" style={{ color: category.accentColor }}>
                  {category.name}
                </span>
                <p className="mt-2 text-sm leading-6 text-white/58">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-6" key={item.title}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#070816]">
                  <Icon aria-hidden="true" size={22} />
                </div>
                <h3 className="mt-5 text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-3">
        {audienceSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              className="group rounded-2xl border border-white/10 bg-white/[0.055] p-6 transition hover:border-lime-300/35 hover:bg-white/[0.09]"
              href={section.href}
              key={section.href}
            >
              <Icon aria-hidden="true" className="text-lime-200" size={30} />
              <h2 className="mt-5 text-3xl font-black leading-tight text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{section.text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-lime-200 group-hover:text-white">
                Explore <ArrowRight aria-hidden="true" size={16} />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.055] p-6 md:p-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <BriefcaseBusiness aria-hidden="true" className="text-cyan-300" size={34} />
            <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
              Fill empty slots with people looking for something fun to do.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/64">
              Local businesses will be able to apply, create listings, promote last-minute deals, and receive booking requests after approval.
            </p>
          </div>
          <div className="grid content-center gap-3">
            {["List activities", "Promote last-minute deals", "Receive booking requests", "Require admin approval"].map((item) => (
              <div className="rounded-2xl bg-black/26 p-4 text-sm font-black text-white/78" key={item}>
                {item}
              </div>
            ))}
            <Link className="mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/partner">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-8 md:pb-24">
        <div className="rounded-2xl border border-white/10 bg-black/26 p-6 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">City waitlist</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Want GoFunMotion Deals in your city?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Tell us where you are, and GoFunMotion can connect city demand to future partner approvals and local launch planning.
          </p>
        </div>
      </section>
    </main>
  );
}
