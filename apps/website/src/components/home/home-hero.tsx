import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Sparkles } from "lucide-react";

const trustPoints = [
  { icon: BadgeCheck, label: "Reviewed partners" },
  { icon: Clock3, label: "Availability confirmed by request" },
  { icon: ShieldCheck, label: "No payment until confirmed" }
];

export function HomeHero() {
  return (
    <section className="home-hero theme-locked-dark relative -mx-4 min-h-[32rem] overflow-hidden border-b border-white/10 bg-[#070816] md:mx-0 md:mt-6 md:min-h-[33rem] md:rounded-lg md:border">
      <Image
        alt="Friends enjoying a last-minute mini-golf night"
        className="home-hero__image object-cover object-[72%_center] md:object-center"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        src="/images/activities/fun-deals-hero-v2.webp"
      />
      <div className="home-hero__side-overlay absolute inset-0" />
      <div className="home-hero__floor-overlay absolute inset-0" />

      <div className="relative flex min-h-[32rem] max-w-3xl flex-col justify-center px-5 py-12 md:min-h-[33rem] md:px-10 lg:px-12">
        <p className="home-hero__eyebrow inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold">
          <Sparkles aria-hidden="true" size={15} />
          Local deals with open spots
        </p>
        <h1 className="home-hero__title mt-5 max-w-2xl text-4xl font-black leading-[1.04] sm:text-5xl md:text-6xl">
          Last-minute fun deals near you.
        </h1>
        <p className="home-hero__summary mt-4 max-w-xl text-base font-medium leading-7 md:text-lg">
          Save on activities, date nights, family fun, and local experiences with open spots today.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            className="home-hero__primary inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black transition"
            href="/deals?when=tonight"
          >
            Browse tonight&apos;s deals
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link
            className="home-hero__secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition"
            href="/find"
          >
            Help me choose
          </Link>
        </div>

        <div className="home-hero__trust mt-7 flex max-w-2xl flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-5">
          {trustPoints.map(({ icon: Icon, label }) => (
            <span className="home-hero__trust-point inline-flex items-center gap-2 text-xs font-semibold" key={label}>
              <Icon aria-hidden="true" className="home-hero__trust-icon" size={16} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 right-5 hidden items-end gap-3 lg:flex">
        <div className="home-hero__offer-card rounded-lg px-4 py-3 text-right shadow-2xl backdrop-blur-xl">
          <p className="home-hero__offer-label text-xs font-bold uppercase">Booking requests</p>
          <p className="home-hero__offer-value mt-1 text-2xl font-black">Request your spot</p>
          <p className="home-hero__offer-note mt-1 text-xs">The partner confirms availability.</p>
        </div>
      </div>
    </section>
  );
}
