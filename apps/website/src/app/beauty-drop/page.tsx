import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, CalendarClock, MapPin, Sparkles, UserRoundCheck } from "lucide-react";
import {
  BeautyDropBenefitGrid,
  BeautyDropCategoryPills,
  BeautyDropHeroPreview,
  BeautyDropImageBand,
  BeautyDropPrimaryLink,
  BeautyDropSecondaryLink,
  BeautyDropSection,
  BeautyDropSectionHeader,
  BeautyDropShell,
  beautyDropHeroImage
} from "../../components/beauty-drop/beauty-drop-components";
import { SeoJsonLd } from "../../components/seo-json-ld";
import {
  beautyDropCategories,
  beautyDropFaqs,
  customerBenefits,
  modelNeededUseCases,
  proBenefits
} from "../../lib/beauty-drop";
import {
  buildSeoMetadata,
  createFaqSchema,
  createSchemaGraph,
  createWebPageSchema
} from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "BeautyDrop | Last-Minute Beauty Appointments at a Discount",
  description:
    "Find same-day and next-day beauty deals from local nail techs, hair stylists, lash artists, brow artists, and beauty professionals.",
  path: "/beauty-drop",
  image: beautyDropHeroImage,
  keywords: [
    "last-minute beauty appointments",
    "discount beauty appointments",
    "same-day beauty deals",
    "beauty cancellation slots"
  ]
});

const howItWorks = [
  {
    title: "Pro posts an open slot",
    text: "A beauty professional shares the service, time, price, location, and any notes."
  },
  {
    title: "Customer finds the deal",
    text: "Customers browse same-day and next-day openings by category and neighborhood."
  },
  {
    title: "Customer requests the appointment",
    text: "The request flow stays lightweight in the prototype before booking rules are built."
  },
  {
    title: "Pro fills empty time",
    text: "The provider turns a cancellation or slow hour into a new client opportunity."
  }
];

export default function BeautyDropPage() {
  const schemaGraph = createSchemaGraph([
    createWebPageSchema({
      description:
        "BeautyDrop helps customers find last-minute beauty appointments at a discount and helps beauty professionals fill open slots.",
      path: "/beauty-drop",
      title: "BeautyDrop Last-Minute Beauty Deals"
    }),
    createFaqSchema(beautyDropFaqs)
  ]);

  return (
    <BeautyDropShell>
      <SeoJsonLd id="beauty-drop-schema" data={schemaGraph} />
      <section className="overflow-hidden border-b border-[#e9c9c3]">
        <div className="mx-auto grid min-h-[660px] max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1.02fr_0.98fr] md:px-8 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-full border border-[#e9c9c3] bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#b94a67] shadow-sm">
              Beauty marketplace validation
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] text-[#241018] sm:text-6xl md:text-7xl">
              Last-minute beauty appointments at a discount.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#241018]/72">
              Find same-day and next-day beauty deals from local nail techs, hair stylists, lash artists, brow artists, and beauty pros.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BeautyDropPrimaryLink href="/beauty-drop/deals">I want beauty deals</BeautyDropPrimaryLink>
              <BeautyDropSecondaryLink href="/beauty-drop/pros">I am a beauty professional</BeautyDropSecondaryLink>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["30-50%", "typical savings"],
                ["Today", "open slots"],
                ["Local", "beauty pros"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-[#e9c9c3] bg-white/86 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-[#3a1323]">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#3a1323]/56">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <BeautyDropHeroPreview />
          </div>
        </div>
      </section>

      <BeautyDropSection>
        <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-lg border border-[#e9c9c3] bg-white/90 p-6 shadow-soft">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#fff0ec] text-[#b94a67]">
              <CalendarClock aria-hidden="true" size={24} />
            </div>
            <h2 className="text-2xl font-black text-[#3a1323]">The problem</h2>
            <p className="mt-3 text-base leading-7 text-ink/70">
              Beauty pros lose money when appointments cancel or slow hours stay empty. Customers want affordable beauty services without booking weeks in advance.
            </p>
          </article>
          <article className="rounded-lg border border-[#d9eadf] bg-white/90 p-6 shadow-soft">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#d9f7ea] text-[#176f55]">
              <Sparkles aria-hidden="true" size={24} />
            </div>
            <h2 className="text-2xl font-black text-[#3a1323]">The solution</h2>
            <p className="mt-3 text-base leading-7 text-ink/70">
              BeautyDrop connects open beauty slots with customers nearby, making discounted last-minute availability easy to find and easy to request.
            </p>
          </article>
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropImageBand />
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="For customers"
          title="Beauty deals without the long booking lead time"
          summary="Customers get an easy way to discover affordable appointments when providers have time they want to fill."
        />
        <BeautyDropBenefitGrid items={customerBenefits} />
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="For beauty professionals"
          title="Recover empty hours without discounting everything"
          summary="BeautyDrop is positioned as a tactical channel for cancellations, slow periods, and controlled new-client discovery."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {proBenefits.map((benefit) => (
            <article key={benefit.title} className="rounded-lg border border-[#d9eadf] bg-white p-5 shadow-soft">
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-[#d9f7ea] text-[#176f55]">
                <UserRoundCheck aria-hidden="true" size={22} />
              </div>
              <h3 className="text-lg font-black text-ink">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{benefit.text}</p>
            </article>
          ))}
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="Categories"
          title="Built for services customers already search for last-minute"
        />
        <BeautyDropCategoryPills categories={beautyDropCategories} />
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="How it works"
          title="A simple marketplace flow for validation"
          summary="The first version tests whether customers and pros understand the exchange before backend workflows are added."
        />
        <div className="grid gap-4 md:grid-cols-4">
          {howItWorks.map((step, index) => (
            <article key={step.title} className="rounded-lg border border-[#e9c9c3] bg-white p-5 shadow-soft">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[#fff0ec] text-sm font-black text-[#b94a67]">
                {index + 1}
              </div>
              <h3 className="text-lg font-black text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{step.text}</p>
            </article>
          ))}
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <div className="grid gap-6 rounded-lg border border-[#3a1323]/10 bg-[#3a1323] p-6 text-white shadow-soft md:grid-cols-[0.9fr_1.1fr] md:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-200">
              Model needed
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
              Make portfolio-building appointments easier to fill
            </h2>
            <p className="mt-4 text-base leading-7 text-white/72">
              BeautyDrop can separate model-needed sessions from standard discounts so customers understand the purpose, requirements, and expectations before requesting the slot.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modelNeededUseCases.map((item) => (
              <div key={item} className="rounded-lg bg-white/10 p-4 text-sm font-bold leading-6 text-white/82">
                {item}
              </div>
            ))}
          </div>
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="Waitlist"
          title="Choose the side of the marketplace to validate first"
          summary="These calls to action point to static prototypes for now. They are ready for later analytics or form capture when the validation plan requires it."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/beauty-drop/deals" className="group rounded-lg border border-[#e9c9c3] bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(58,19,35,0.14)]">
            <BadgeDollarSign aria-hidden="true" className="text-[#b94a67]" size={30} />
            <h3 className="mt-4 text-2xl font-black text-[#3a1323]">I want beauty deals</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              Preview discounted appointments and test customer intent around same-day beauty discovery.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-ink">
              Browse prototype deals <ArrowRight aria-hidden="true" size={17} />
            </span>
          </Link>
          <Link href="/beauty-drop/pros" className="group rounded-lg border border-[#d9eadf] bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(23,111,85,0.14)]">
            <MapPin aria-hidden="true" className="text-[#176f55]" size={30} />
            <h3 className="mt-4 text-2xl font-black text-[#3a1323]">I am a beauty professional</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              Preview the open-slot submission flow for cancellations, slow hours, and model-needed sessions.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-ink">
              Post a mock slot <ArrowRight aria-hidden="true" size={17} />
            </span>
          </Link>
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader eyebrow="FAQ" title="Common validation questions" />
        <div className="grid gap-4 md:grid-cols-2">
          {beautyDropFaqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-black text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{faq.answer}</p>
            </article>
          ))}
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <div className="rounded-lg border border-[#e9c9c3] bg-white p-6 text-center shadow-soft md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#b94a67]">
            Ready for validation
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight text-[#3a1323] md:text-5xl">
            Test demand before building the full BeautyDrop app
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/68">
            Start with the landing page, deal cards, and pro submission prototype. Add real collection only after the validation metrics justify it.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <BeautyDropPrimaryLink href="/beauty-drop/deals">View beauty deals</BeautyDropPrimaryLink>
            <BeautyDropSecondaryLink href="/beauty-drop/pros">Post an open slot</BeautyDropSecondaryLink>
          </div>
        </div>
      </BeautyDropSection>
    </BeautyDropShell>
  );
}
