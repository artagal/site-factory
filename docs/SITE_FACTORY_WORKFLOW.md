# Site Factory Workflow

Site Factory is a local-first Codex workspace for creating page drafts before any publishing system is connected.

## Core Rules

- Keep all content in local Markdown, MDX, YAML, TypeScript, or generated output files.
- Do not connect to Bluehost, WordPress, OpenAI, or paid external APIs.
- Do not deploy automatically.
- Treat `content/`, `data/`, `templates/`, and `codex-context/` as the source material Codex should read before writing.

## Landing Pages

1. Pick the matching template from `templates/app-landing-page/` or `templates/validation-landing-page/`.
2. Add or update the relevant Markdown or MDX file under `content/sites/`.
3. Confirm title, meta description, canonical path placeholder, OpenGraph intent, and FAQ candidates.
4. Reuse landing primitives from `apps/website/src/components/landing/`.
5. Preview in `apps/website` before moving toward publishing.

## SEO Blog Posts

1. Read `data/seo-keywords.yml` and the brand context.
2. Draft the post in the site's `blog/` folder.
3. Keep the answer useful before optimizing headings.
4. Add FAQ frontmatter when the topic naturally has concise questions.
5. Use `canonicalPath`, `targetKeyword`, `secondaryKeywords`, and optional dates in frontmatter.

## Model Portfolio Pages

1. Read `data/models.yml` and `codex-context/gofunmotion-ai-portfolio.md`.
2. Draft under `content/sites/gofunmotion/models/`.
3. Include AI disclosure language.
4. Keep production notes separate from claims about a real person.
5. Separate positioning, creative direction, brand fit, and production queue notes.

## Validation Pages

1. Use `templates/validation-landing-page/`.
2. Define the audience, promise, primary signal, validation window, and decision rule.
3. Keep collection systems offline unless the user explicitly asks to add them.
4. Document what will be built later instead of wiring it now.

## WordPress Drafts

Use `npm.cmd run wordpress:draft` to generate local Markdown in `output/wordpress-drafts/`. Review manually before copying into any CMS.
