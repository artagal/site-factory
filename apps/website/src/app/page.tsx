import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarHeart, Clock3, MapPin, ShieldCheck, Sparkles, TicketPercent, Users } from "lucide-react";
import { DealCard } from "../components/gofunmotion/deal-card";
import { SeoJsonLd } from "../components/seo-json-ld";
import { CategorySelectField } from "../components/shared/category-select-field";
import { CitySelectField } from "../components/shared/city-select-field";
import { partnerDealTypes } from "../lib/deal-taxonomy";
import { categories, demoNotice, filterListings } from "../lib/deals-data";
import { buildSeoMetadata, createFaqSchema, createSchemaGraph, createWebPageSchema } from "../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "GoFunMotion - Last-Minute Fun Deals Near You",
  description:
    "Find last-minute fun deals near you. Save on activities, date nights, family fun, and local experiences with open spots today.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "last minute fun deals",
    "activity deals near me",
    "things to do tonight",
    "date night deals",
    "family activity deals",
    "last minute activity deals",
    "local experience deals",
    "weekend deals"
  ],
  path: "/"
});

const heroDeals = [
  { accent: "from-lime-300 to-emerald-300", city: "Miami", now: "$39", spots: "2 spots left", time: "Tonight 7:00 PM", title: "Pottery Date Night", was: "$60" },
  { accent: "from-cyan-300 to-blue-300", city: "Austin", now: "$22", spots: "1 room left", time: "Tonight 8:30 PM", title: "Escape Room Slot", was: "$32" },
  { accent: "from-amber-300 to-orange-300", city: "San Diego", now: "$20", spots: "8 passes left", time: "Weekend", title: "Kids Indoor Play", was: "$25" },
  { accent: "from-fuchsia-300 to-rose-300", city: "New York", now: "$10", spots: "6 trial spots", time: "Tomorrow 6:30 PM", title: "Dance Trial Class", was: "$20" }
];

const dealStats = [
  { icon: BadgeCheck, label: "Reviewed partners" },
  { icon: Clock3, label: "Availability confirmed by request" },
  { icon: ShieldCheck, label: "No payment until confirmed" }
];

const howItWorks = [
  {
    icon: MapPin,
    title: "Pick your city and time",
    text: "Start with tonight, tomorrow, or this weekend. The product is built around real open slots."
  },
  {
    icon: TicketPercent,
    title: "Compare simple deals",
    text: "Every card shows the old price, new price, time window, and how many spots are left."
  },
  {
    icon: Clock3,
    title: "Request the open slot",
    text: "Until checkout is live, booking stays request-based so availability can be confirmed."
  }
];

const audienceSections = [
  {
    href: "/date-night",
    title: "Date night deals",
    text: "Last-minute creative, romantic, or low-pressure experiences that make tonight easier to choose.",
    icon: CalendarHeart
  },
  {
    href: "/friends",
    title: "Friends and group deals",
    text: "Open slots for groups that want a plan now: escape rooms, mini golf, comedy, classes, and more.",
    icon: Users
  },
  {
    href: "/family",
    title: "Family and kids deals",
    text: "Indoor passes, weekend activities, kids classes, and simple family-friendly openings.",
    icon: Sparkles
  }
];

export default function HomePage() {
  const homeListings = filterListings({ sort: "featured" }).slice(0, 6);
  const schema = createSchemaGraph([
    createWebPageSchema({
      description:
        "GoFunMotion Deals helps people find last-minute activity deals, open slots, date night deals, family activities, and local experiences.",
      path: "/",
      title: "GoFunMotion Deals"
    }),
    createFaqSchema([
      {
        question: "What is GoFunMotion Deals?",
        answer: "GoFunMotion Deals is a local deals platform for last-minute activity openings, date nights, family fun, and bookable experiences."
      },
      {
        question: "Are the current listings real production partners?",
        answer: "Current demo listings are clearly labeled. Real partner listings should be reviewed and approved before appearing as live inventory."
      }
    ])
  ]);

  return (
    <main>
      <SeoJsonLd data={schema} id="gofunmotion-home-schema" />
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-8 pt-10 md:px-8 md:pb-12 md:pt-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative">
          <p className="inline-flex min-h-9 items-center rounded-full border border-lime-300/25 bg-lime-300/10 px-4 text-xs font-black uppercase tracking-[0.16em] text-lime-100">
            Tonight's last-minute deals
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
            Tonight&apos;s last-minute deals.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/68 md:text-xl">
            Save on activities, date nights, family fun, and local experiences with open spots today.
          </p>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-cyan-200">Was / Now / Time / Spots left.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-6 text-base font-black text-[#070816] transition hover:bg-white"
              href="/deals?when=tonight"
            >
              See Tonight&apos;s Deals
              <ArrowRight aria-hidden="true" size={19} />
            </Link>
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] px-6 text-base font-black text-white transition hover:bg-white/12"
              href="/find"
            >
              Not sure? We&apos;ll pick for you
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {dealStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-xs font-black text-white/70" key={stat.label}>
                  <Icon aria-hidden="true" className="text-lime-200" size={15} />
                  {stat.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1024]/84 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(190,242,100,0.26),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-55 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
          <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Tonight&apos;s Deals</p>
              <p className="mt-1 text-2xl font-black text-white">Last-minute open slots</p>
            </div>
            <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-[#070816]">Tonight first</span>
          </div>
          <div className="relative mt-4 grid gap-3">
            {heroDeals.map((deal) => (
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:-translate-y-1 hover:border-lime-300/30 hover:bg-white/[0.08] sm:grid-cols-[1fr_auto]" key={deal.title}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full bg-gradient-to-r ${deal.accent} px-3 py-1.5 text-xs font-black text-[#070816]`}>
                      {deal.time}
                    </span>
                    <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/70">
                      {deal.spots}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black leading-tight text-white">{deal.title}</p>
                  <p className="mt-1 text-sm font-bold text-white/48">{deal.city}</p>
                </div>
                <div className="flex items-end justify-between gap-4 sm:block sm:text-right">
                  <p className="text-sm font-bold text-white/38 line-through">Was {deal.was}</p>
                  <p className="text-3xl font-black text-lime-200">Now {deal.now}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="relative mt-4 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm font-black text-lime-100">
            Clear deal math: Was $90, Now $39, Tonight 8:30 PM, 2 spots left. Demo inventory stays labeled until real businesses are approved.
          </p>
        </div>
      </section>

      <section className="sticky top-16 z-20 mx-auto max-w-7xl px-4 py-3 md:static md:px-8 md:py-8">
        <form action="/deals" className="grid gap-3 rounded-2xl border border-white/10 bg-[#090d1d]/95 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:grid-cols-[1fr_0.9fr_1.1fr_auto] md:p-4">
          <CitySelectField defaultCityId="miami" />
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">When</span>
            <select className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none focus:border-lime-300" defaultValue="tonight" name="when">
              <option className="bg-[#070816]" value="tonight">Tonight</option>
              <option className="bg-[#070816]" value="today">Today</option>
              <option className="bg-[#070816]" value="tomorrow">Tomorrow</option>
              <option className="bg-[#070816]" value="weekend">This weekend</option>
            </select>
          </label>
          <CategorySelectField includeAll />
          <button className="mt-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" type="submit">
            Show Deals
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Last-minute deals</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">More cards. Faster decisions.</h2>
            <p className="mt-3 max-w-2xl text-xs font-bold uppercase tracking-[0.12em] text-white/42">{demoNotice}</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-black text-lime-200 hover:text-white" href="/deals?when=tonight">
            Browse all deals <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homeListings.map((listing) => (
            <DealCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Popular deal types</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Choose the kind of opening you want.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.slice(0, 8).map((category) => (
              <Link
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition hover:border-white/20 hover:bg-white/[0.09]"
                href={`/deals?category=${category.id}&when=tonight`}
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
              Fill empty slots with discounted last-minute offers.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/64">
              Local businesses can turn unused capacity into new customers by listing open windows, slow-hour deals, and last-minute availability.
            </p>
          </div>
          <div className="grid content-center gap-3">
            {["Post an open slot", "Set was / now pricing", "Show spots left", "Receive booking requests"].map((item) => (
              <div className="rounded-2xl bg-black/26 p-4 text-sm font-black text-white/78" key={item}>
                {item}
              </div>
            ))}
            <Link className="mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white px-5 text-sm font-black text-[#070816] hover:bg-lime-200" href="/partner">
              List Your Business
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {partnerDealTypes.slice(0, 4).map((type) => (
            <Link className="rounded-2xl border border-white/10 bg-black/24 p-4 transition hover:border-lime-300/30 hover:bg-white/[0.07]" href="/partner" key={type.id}>
              <p className="text-sm font-black text-white">{type.name}</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{type.dealExamples[0]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-8 md:pb-24">
        <div className="rounded-2xl border border-white/10 bg-black/26 p-6 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">City waitlist</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Want last-minute activity deals in your city?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Tell us where you are. GoFunMotion will use city demand to prioritize partner outreach and approved local inventory.
          </p>
        </div>
      </section>
    </main>
  );
}
