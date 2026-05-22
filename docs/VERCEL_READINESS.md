# Vercel Readiness

Site Factory is prepared for a future Vercel project, but it is not deployed automatically.

## Current Configuration

- `vercel.json` keeps the project explicit for a workspace-style repository.
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next`
- Framework preset: `nextjs`

Vercel can auto-detect many frontend frameworks and lets projects customize build commands, install commands, and output directories. For monorepos, Vercel projects can be connected to a repository with project-specific build settings. See the official Vercel builds docs: <https://docs.vercel.com/docs/builds>.

This configuration assumes the Vercel project root directory is `apps/website`. With that root, `.next` resolves to `/vercel/path0/apps/website/.next`.

## Environment Variables

Use these later if a Vercel project is created:

- `SITE_FACTORY_BASE_URL`: preferred production canonical base URL.
- `SITE_FACTORY_LASTMOD`: optional deterministic sitemap timestamp.

The SEO helper can also fall back to Vercel-provided URL variables during a Vercel build.

## Safety Rules

- Do not connect a Vercel project until the user explicitly asks.
- Do not enable automatic deployment from this chat.
- Do not add WordPress, Bluehost, payment, or external API secrets.
- Keep Vercel readiness limited to config, docs, and build-compatible code.
