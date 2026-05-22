import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { FactoryCard } from "@/components/factory-card";
import {
  ChecklistPanel,
  ContentBand,
  GenerationLaneGrid,
  MetricStrip,
  ProcessStrip,
  SectionHeader
} from "@/components/landing";
import { getContentEntries } from "@/lib/content-files";
import { getPreviewPages } from "@/lib/site-content";

const workflowItems = [
  {
    icon: LayoutDashboard,
    label: "Preview",
    text: "Inspect local page drafts before anything is published."
  },
  {
    icon: Search,
    label: "SEO",
    text: "Keep titles, descriptions, keywords, and FAQ schema prompts close to the content."
  },
  {
    icon: FileText,
    label: "Drafts",
    text: "Turn Markdown or MDX into WordPress-ready local files."
  },
  {
    icon: ClipboardList,
    label: "Ship Later",
    text: "Deployment and publishing workflows stay documented, manual, and separate."
  }
];

export default function HomePage() {
  const previewPages = getPreviewPages();
  const contentEntries = getContentEntries();

  return (
    <main>
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto grid min-h-[520px] max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-mint">
              Local-first Site Factory
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] text-ink md:text-7xl">
              Site Factory dashboard and preview workspace
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
              A Codex-driven foundation for creating landing pages, SEO pages,
              blog drafts, AI model portfolio pages, validation pages, and
              WordPress-ready content without connecting to live publishing systems.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/previews"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white shadow-soft"
              >
                Open previews
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                href="/content/work-organizer/blog/how-to-organize-work-without-another-spreadsheet"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink"
              >
                View sample draft
                <FileText aria-hidden="true" size={18} />
              </Link>
            </div>
            <div className="mt-8 max-w-2xl">
              <MetricStrip
                items={[
                  { label: "Previews", value: String(previewPages.length) },
                  { label: "Drafts", value: String(contentEntries.length) },
                  { label: "Live APIs", value: "0" }
                ]}
              />
            </div>
          </div>
          <div className="grid content-center gap-4">
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-coral/10 text-coral">
                  <Sparkles aria-hidden="true" size={22} />
                </div>
                <span className="rounded-lg bg-paper px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-ink/60">
                  Foundation
                </span>
              </div>
              <h2 className="text-xl font-black text-ink">Generate, preview, review</h2>
              <p className="mt-2 text-sm leading-6 text-ink/68">
                This dashboard is the local staging area for page strategy, content structure, and metadata before anything touches a live system.
              </p>
            </div>
            {workflowItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="grid grid-cols-[44px_1fr] gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
                >
                  <div className="flex size-11 items-center justify-center rounded-lg bg-mint/10 text-mint">
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-ink">{item.label}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink/68">{item.text}</p>
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-[44px_1fr] gap-4 rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft">
              <div className="flex size-11 items-center justify-center rounded-lg bg-white/10 text-white">
                <ShieldCheck aria-hidden="true" size={22} />
              </div>
              <div>
                <h2 className="text-base font-black">Safe by default</h2>
                <p className="mt-1 text-sm leading-6 text-white/72">
                  No Bluehost, WordPress, OpenAI, payments, or automatic deployment are connected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">
              Active previews
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink">Starter sites</h2>
          </div>
          <Link
            href="/previews"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink"
          >
            Browse all
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {previewPages.map((page) => (
            <FactoryCard key={page.slug} page={page} />
          ))}
        </div>
      </section>
      <ContentBand>
        <SectionHeader
          eyebrow="Generation workflow"
          summary="Future Codex chats should reuse this sequence for landing pages, SEO drafts, model pages, validation pages, and WordPress-ready local exports."
          title="How new pages move through the factory"
          tone="skyline"
        />
        <ProcessStrip
          steps={[
            {
              title: "Brief",
              text: "Read the Codex context, brand data, target keyword, and template notes."
            },
            {
              title: "Compose",
              text: "Create or update local MDX, YAML, preview data, and metadata fields."
            },
            {
              title: "Preview",
              text: "Open the dashboard and check the page structure before generating exports."
            },
            {
              title: "Audit",
              text: "Run only the necessary local checks for types, build, tests, or SEO metadata."
            }
          ]}
        />
      </ContentBand>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <SectionHeader
          eyebrow="Factory lanes"
          summary="Each lane has a clear source folder, template, and safety boundary so future site generation stays predictable."
          title="Reusable paths for the next pages"
          tone="brass"
        />
        <GenerationLaneGrid
          items={[
            {
              label: "Landing",
              title: "Product and validation pages",
              text: "Use shared landing sections, preview routes, and local MDX before creating any live collection path."
            },
            {
              label: "SEO",
              title: "Blog and local search drafts",
              text: "Use keyword data, canonical paths, FAQ schema, and draft outlines for reviewable content."
            },
            {
              label: "Portfolio",
              title: "AI model profile pages",
              text: "Keep fictional disclosure, creative direction, and production notes visible in every generated page."
            }
          ]}
          tone="brass"
        />
      </section>
      <ContentBand className="bg-paper">
        <ChecklistPanel
          title="Vercel-ready, not deployed"
          items={[
            "Root build command stays npm.cmd run build locally and npm run build on Vercel.",
            "Canonical URL can use SITE_FACTORY_BASE_URL or Vercel URL environment variables.",
            "No WordPress, Bluehost, payment, or external API integration is connected."
          ]}
          tone="mint"
        />
      </ContentBand>
    </main>
  );
}
