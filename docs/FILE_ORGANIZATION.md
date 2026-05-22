# File Organization

Use this map when adding future pages or generated drafts.

## App Code

- `apps/website/src/app/`: routes and page-level rendering.
- `apps/website/src/components/landing/`: reusable landing sections.
- `apps/website/src/components/templates/`: page templates that assemble landing sections.
- `apps/website/src/lib/`: content loading, Markdown parsing, SEO helpers, and route utilities.

## Source Content

- `content/sites/{site}/pages/`: landing and static page drafts.
- `content/sites/{site}/blog/`: SEO blog drafts.
- `content/sites/{site}/seo/`: local SEO page drafts.
- `content/sites/gofunmotion/models/`: fictional AI model portfolio drafts.
- `content/sites/validation/{concept}/`: validation landing page drafts.

## Generation Inputs

- `data/`: structured product, brand, model, and keyword data.
- `templates/`: copy-and-fill source templates for new content.
- `codex-context/`: chat-specific guidance and constraints.

## Generated Local Output

- `output/wordpress-drafts/`
- `output/seo-audits/`
- `output/generated-pages/`
- `output/content-calendars/`

Generated output files are ignored by Git except for `.gitkeep` placeholders.
