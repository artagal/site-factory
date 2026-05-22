import { ClipboardCheck, FileSearch, Layers3 } from "lucide-react";
import {
  FeatureGrid,
  InsightPanel,
  LandingHero,
  MetricStrip,
  ProcessStrip,
  SectionHeader
} from "../landing";
import type { FactoryPreviewPage } from "../../lib/site-content";

export function AppLandingPage({ page }: { page: FactoryPreviewPage }) {
  const sectionItems = page.sections.map((section) => ({
    title: section.title,
    text: section.text,
    icon:
      section.label === "Audience"
        ? FileSearch
        : section.label === "Offer"
          ? Layers3
          : ClipboardCheck
  }));

  return (
    <main>
      <LandingHero
        actions={[
          {
            href: page.contentHref ?? "/previews",
            label: "Open draft"
          },
          {
            href: "/previews",
            label: "Preview index",
            variant: "secondary"
          }
        ]}
        aside={
          <div className="grid w-full gap-4">
            <MetricStrip
              items={[
                { label: "Mode", value: "Local" },
                { label: "CMS", value: "Off" },
                { label: "Deploy", value: "Manual" }
              ]}
            />
            <InsightPanel
              title="Page foundation"
              items={page.highlights.map((highlight) => `${highlight.title}: ${highlight.text}`)}
            />
          </div>
        }
        eyebrow={page.hero.eyebrow}
        summary={page.hero.summary}
        title={page.hero.title}
      />
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <SectionHeader
          eyebrow="Reusable landing pattern"
          summary="Each preview now uses the same page primitives future generated pages can reuse."
          title="Audience, offer, and next content plan"
          tone="coral"
        />
        <FeatureGrid items={sectionItems} tone="coral" />
      </section>
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <SectionHeader
            eyebrow="Factory workflow"
            summary="This keeps landing pages reviewable before any CMS, deployment, or service code is added."
            title="From brief to local preview"
            tone="skyline"
          />
          <ProcessStrip
            steps={[
              {
                title: "Read context",
                text: "Use brand, product, SEO, and Codex context files before drafting."
              },
              {
                title: "Draft locally",
                text: "Create Markdown, MDX, YAML, and preview data in this repository."
              },
              {
                title: "Preview",
                text: "Open the Next.js dashboard and inspect the generated page structure."
              },
              {
                title: "Review",
                text: "Run metadata checks and keep publishing as a separate manual decision."
              }
            ]}
          />
        </div>
      </section>
    </main>
  );
}
