import type { Metadata } from "next";
import {
  BeautyDropDealCard,
  BeautyDropPrimaryLink,
  BeautyDropSecondaryLink,
  BeautyDropSection,
  BeautyDropSectionHeader,
  BeautyDropShell
} from "../../../components/beauty-drop/beauty-drop-components";
import { SeoJsonLd } from "../../../components/seo-json-ld";
import { beautyDropDeals } from "../../../lib/beauty-drop";
import { buildSeoMetadata, createSchemaGraph, createWebPageSchema } from "../../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "BeautyDrop Deals | Same-Day Beauty Appointment Prototype",
  description:
    "Browse sample same-day and next-day beauty deal cards for BeautyDrop, a local validation prototype for discounted beauty appointment openings.",
  path: "/beauty-drop/deals",
  keywords: [
    "same-day beauty deals",
    "discount nail appointments",
    "lash appointment deals",
    "last-minute beauty slots"
  ]
});

export default function BeautyDropDealsPage() {
  const schemaGraph = createSchemaGraph([
    createWebPageSchema({
      description:
        "Sample BeautyDrop deal cards for testing customer interest in same-day and next-day discounted beauty appointments.",
      path: "/beauty-drop/deals",
      title: "BeautyDrop Deals Prototype"
    })
  ]);

  return (
    <BeautyDropShell>
      <SeoJsonLd id="beauty-drop-deals-schema" data={schemaGraph} />
      <BeautyDropSection>
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-500">
              Customer prototype
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-ink md:text-6xl">
              Same-day and next-day beauty deals near you
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
              These static cards show the first customer-facing validation flow: browse a discounted opening, compare the original price, and request the slot.
            </p>
          </div>
          <div className="rounded-lg border border-rose-100 bg-white/88 p-5 shadow-soft">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-ink/54">
              Prototype status
            </p>
            <p className="mt-3 text-base leading-7 text-ink/70">
              No backend, payments, maps, provider accounts, or live reservations are connected. Buttons are intentionally static until validation capture is selected.
            </p>
          </div>
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="Available examples"
          title="Sample deal cards"
          summary="Each card includes category, appointment time, original price, discounted price, percent off, location placeholder, and a request action."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {beautyDropDeals.map((deal) => (
            <BeautyDropDealCard key={`${deal.service}-${deal.time}`} deal={deal} />
          ))}
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <div className="rounded-lg border border-ink/10 bg-ink p-6 text-white shadow-soft md:p-8">
          <h2 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            Need more supply before testing customer traffic?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
            Use the pro submission prototype to test whether local beauty professionals understand the open-slot posting flow.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <BeautyDropPrimaryLink href="/beauty-drop/pros">Open pro prototype</BeautyDropPrimaryLink>
            <BeautyDropSecondaryLink href="/beauty-drop">Back to landing page</BeautyDropSecondaryLink>
          </div>
        </div>
      </BeautyDropSection>
    </BeautyDropShell>
  );
}
