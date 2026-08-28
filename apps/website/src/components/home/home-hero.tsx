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
    <section className="home-hero relative -mx-4 min-h-[31rem] overflow-hidden border-b border-white/10 md:mx-0 md:mt-6 md:min-h-[34rem] md:rounded-lg md:border">
      <Image
        alt="Friends enjoying a pottery workshop together"
        className="object-cover object-[60%_center]"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        src="/images/activities/pottery-workshop.jpg"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,22,0.98)_0%,rgba(7,8,22,0.90)_42%,rgba(7,8,22,0.34)_72%,rgba(7,8,22,0.52)_100%)] md:bg-[linear-gradient(90deg,rgba(7,8,22,0.98)_0%,rgba(7,8,22,0.82)_45%,rgba(7,8,22,0.18)_78%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,8,22,0.88)_100%)]" />

      <div className="relative flex min-h-[31rem] max-w-3xl flex-col justify-center px-4 py-12 md:min-h-[34rem] md:px-10 lg:px-12">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-2 text-xs font-bold !text-lime-200 backdrop-blur-md">
          <Sparkles aria-hidden="true" size={15} />
          GoFunMotion Deals
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] !text-white sm:text-5xl md:text-6xl">
          Last-minute fun deals near you.
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium leading-7 !text-white/80 md:text-lg">
          Save on activities, date nights, family fun, and local experiences with open spots today.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 text-sm font-black !text-[#101510] transition hover:bg-lime-200"
            href="/deals?when=tonight"
          >
            See Tonight&apos;s Deals
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/25 px-5 text-sm font-bold !text-white backdrop-blur-md transition hover:bg-white/10"
            href="/find"
          >
            Not sure? Help me choose
          </Link>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
          {trustPoints.map(({ icon: Icon, label }) => (
            <span className="inline-flex items-center gap-2 text-xs font-semibold !text-white/72" key={label}>
              <Icon aria-hidden="true" className="text-lime-200" size={15} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 right-5 hidden items-end gap-3 md:flex">
        <div className="rounded-lg border border-white/12 bg-[#070816]/80 px-4 py-3 text-right shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-bold uppercase !text-white/55">Open tonight</p>
          <p className="mt-1 text-2xl font-black !text-lime-200">Save up to 50%</p>
          <p className="mt-1 text-xs !text-white/65">Prices and availability shown on every deal</p>
        </div>
      </div>
    </section>
  );
}
