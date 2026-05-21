# WordPress Export Workflow

This project does not connect to WordPress yet.

## Local Draft Flow

1. Write or update a Markdown or MDX source file in `content/sites/`.
2. Run `npm.cmd run wordpress:draft`.
3. Review the generated file in `output/wordpress-drafts/`.
4. Manually copy reviewed content later if publishing is approved.

## Safety Rules

- Do not store WordPress credentials.
- Do not call the WordPress API.
- Do not auto-publish.
- Keep generated drafts human-readable and GitHub-friendly.
