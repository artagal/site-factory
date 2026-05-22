# Site Generation Playbook

Use this playbook when a future Codex chat creates a new landing page, SEO draft, validation page, or AI model portfolio page.

## Read First

1. `codex-context/site-factory-architect.md`
2. The relevant brand file in `codex-context/`
3. `data/products.yml`, `data/brands.yml`, `data/models.yml`, or `data/seo-keywords.yml`
4. The matching template in `templates/`
5. `docs/FILE_ORGANIZATION.md` for where new files belong

## Reusable UI Components

Use the shared landing primitives in `apps/website/src/components/landing/`:

- `LandingHero` for first-screen page promises and actions.
- `FeatureGrid` for benefits, sections, model blocks, and validation proof points.
- `MetricStrip` for small dashboard-style facts.
- `ProcessStrip` for step-by-step workflows.
- `InsightPanel` for compact review notes.
- `SectionHeader` for consistent section titles.
- `ChecklistPanel` for review requirements and launch constraints.
- `GenerationLaneGrid` for index pages that explain content lanes.
- `ContentBand` for full-width section bands.

Only add a new component when a page need repeats across multiple templates.

## Metadata Requirements

Every generated page or draft should include:

- `title`
- `description`
- `canonicalPath`
- `targetKeyword` when SEO matters
- `secondaryKeywords` when available
- `faqs` when the page has real questions and answers

The Next.js app uses `buildSeoMetadata`, `createFaqSchema`, `createArticleSchema`, and `createBreadcrumbSchema` from `apps/website/src/lib/seo.ts`.

For Vercel readiness, canonical URLs prefer `SITE_FACTORY_BASE_URL` and can fall back to Vercel URL variables during a Vercel build.

## Content Rules

- Keep source content in `content/sites/`.
- Keep structured data in `data/`.
- Keep generated local artifacts in `output/`.
- Do not connect live publishing, forms, payments, analytics, WordPress, Bluehost, OpenAI, or other external APIs.

## Review Steps

Run the smallest useful checks for the change:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run seo:audit
```

Run `npm.cmd run build` when route generation, metadata, sitemap, robots, or frontend rendering changes.

## Vercel Readiness

Read `docs/VERCEL_READINESS.md` before changing Vercel settings. Vercel config changes should make the project easier to import later, but should not deploy, connect secrets, or enable live publishing.
