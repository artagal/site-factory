# Vercel Readiness

Site Factory is prepared for a Vercel project, but deployment should still follow the explicit GoFunMotion release checklist.

Current launch runbook: `docs/GOFUNMOTION_PRODUCTION_RELEASE_CHECKLIST.md`.

## Current Configuration

- `vercel.json` keeps the project explicit for a workspace-style repository.
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next`
- Framework preset: `nextjs`

Vercel can auto-detect many frontend frameworks and lets projects customize build commands, install commands, and output directories. For monorepos, Vercel projects can be connected to a repository with project-specific build settings.

This configuration matches the current Vercel project root directory of `apps/website`. With that root, Next.js writes its production build to `apps/website/.next` in the repository, but Vercel's Output Directory setting must stay relative to the selected root as `.next`.

## Environment Variables

Use these for the GoFunMotion Vercel project:

- `SITE_FACTORY_BASE_URL`: preferred production canonical base URL, normally `https://gofunmotion.com`.
- `NEXT_PUBLIC_SITE_URL`: public app/email base URL, normally `https://gofunmotion.com`.
- `SITE_FACTORY_LASTMOD`: optional deterministic sitemap timestamp.

The SEO helper can also fall back to Vercel-provided URL variables during a Vercel build.

## Safety Rules

- Do not connect a Vercel project until the user explicitly asks.
- Do not enable automatic deployment from this chat.
- Do not add WordPress, Bluehost, payment, or external API secrets.
- Keep Vercel readiness limited to config, docs, and build-compatible code.
