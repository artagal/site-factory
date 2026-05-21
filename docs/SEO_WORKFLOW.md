# SEO Workflow

## Inputs

- `data/seo-keywords.yml`
- Brand context in `data/brands.yml`
- Site-specific notes in `codex-context/`
- Existing drafts in `content/sites/`

## Drafting Steps

1. Identify one primary keyword and the search intent.
2. Write a direct answer before expanding the article.
3. Add practical examples, comparison points, and FAQ candidates.
4. Keep metadata in frontmatter.
5. Run `npm.cmd run seo:audit` for a local metadata check.

## Metadata Checklist

- Title is specific and readable.
- Description explains the page value.
- Canonical path is a placeholder or local route.
- OpenGraph fields are produced by the shared SEO helper.
- FAQ schema is only emitted when real FAQ entries exist.
- Article schema is used for blog-style content.
- Breadcrumb schema is used for local content previews.

## Local SEO Audit

Run:

```powershell
npm.cmd run seo:audit
```

The audit currently checks title length, description length, and root-relative canonical paths. Treat it as a first-pass guardrail, not a replacement for human review.
