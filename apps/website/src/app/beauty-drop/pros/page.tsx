import type { Metadata } from "next";
import Image from "next/image";
import {
  BeautyDropProForm,
  BeautyDropSecondaryLink,
  BeautyDropSection,
  BeautyDropSectionHeader,
  BeautyDropShell,
  beautyDropHeroImage
} from "../../../components/beauty-drop/beauty-drop-components";
import { SeoJsonLd } from "../../../components/seo-json-ld";
import { buildSeoMetadata, createSchemaGraph, createWebPageSchema } from "../../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "BeautyDrop Pros | Open Slot Submission Prototype",
  description:
    "Preview the BeautyDrop pro submission flow for beauty professionals posting cancellation spots, slow-hour deals, and model-needed appointments.",
  path: "/beauty-drop/pros",
  image: beautyDropHeroImage,
  keywords: [
    "beauty professional cancellations",
    "post beauty open slots",
    "salon cancellation deals",
    "model needed beauty appointments"
  ]
});

const submissionNotes = [
  "Post one specific appointment opening at a time.",
  "Use the discounted price only for that slot, not the whole menu.",
  "Add notes for model-needed sessions, training appointments, or portfolio requirements.",
  "Keep location broad in the prototype until real provider onboarding exists."
];

export default function BeautyDropProsPage() {
  const schemaGraph = createSchemaGraph([
    createWebPageSchema({
      description:
        "Static BeautyDrop pro submission prototype for testing open-slot posting by beauty professionals.",
      path: "/beauty-drop/pros",
      title: "BeautyDrop Pro Submission Prototype"
    })
  ]);

  return (
    <BeautyDropShell>
      <SeoJsonLd id="beauty-drop-pros-schema" data={schemaGraph} />
      <BeautyDropSection>
        <div className="grid gap-8 md:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#b94a67]">
              Pro prototype
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-[#3a1323] md:text-6xl">
              Post a last-minute beauty opening
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
              This static form tests whether beauty professionals can quickly describe a cancellation spot, slow-hour deal, or model-needed appointment.
            </p>
            <div className="mt-7">
              <BeautyDropSecondaryLink href="/beauty-drop/deals">View customer deal cards</BeautyDropSecondaryLink>
            </div>
            <div className="mt-8 overflow-hidden rounded-lg border border-[#e9c9c3] bg-white/90 shadow-soft">
              <div className="relative h-44">
                <Image
                  alt="BeautyDrop provider posting visual"
                  src={beautyDropHeroImage}
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="object-cover object-[68%_42%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3a1323]/70 to-transparent" />
                <p className="absolute bottom-4 left-4 rounded-lg bg-white/92 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#b94a67]">
                  Provider supply test
                </p>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-black text-[#3a1323]">Prototype rules</h2>
              <ul className="mt-4 grid gap-3">
                {submissionNotes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm font-bold leading-6 text-ink/70">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-[#b94a67]" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
          <BeautyDropProForm />
        </div>
      </BeautyDropSection>

      <BeautyDropSection className="pt-0">
        <BeautyDropSectionHeader
          eyebrow="What this validates"
          title="The pro-side question is speed and clarity"
          summary="Before building accounts or scheduling logic, BeautyDrop needs to know if providers will post real openings and what information they naturally include."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Can pros post fast?",
              text: "The form should feel lighter than creating a full service listing."
            },
            {
              title: "Are discounts acceptable?",
              text: "The prototype should reveal which categories can support limited-time pricing."
            },
            {
              title: "Do model-needed slots fit?",
              text: "Provider feedback should show whether this needs its own workflow later."
            }
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-[#e9c9c3] bg-white p-5 shadow-soft">
              <h3 className="text-lg font-black text-[#3a1323]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
            </article>
          ))}
        </div>
      </BeautyDropSection>
    </BeautyDropShell>
  );
}
