# Development and publication

[简体中文](development.zh-CN.md)

## Setup and commands

Use Node.js 22.18.0 or newer and `pnpm@11.17.0`, as declared in `package.json`. Run commands from the repository root.

```sh
pnpm install --frozen-lockfile
pnpm dev
script/check
```

`pnpm dev` starts Astro on port 4321 by default. `script/check` calls `pnpm run build`, which runs Astro/TypeScript diagnostics, the static build, legacy redirect generation, built-site checks and `tests/*.test.mjs`. `pnpm test` runs the same build sequence. `pnpm check` runs only Astro/TypeScript diagnostics.

Browser checks require a completed build and Chromium:

```sh
pnpm exec playwright install chromium
pnpm run test:browser
```

The browser script starts its own server on a free loopback port. It checks localized navigation, themes, motion, article pages and research panels with synthetic fixtures. Build and browser tests do not require live research services. External source availability and content need separate verification. See [language maintenance](i18n.md) and the [research showcase contract](research-showcase.md).

No separate lint command or coverage threshold is configured. The minimum-Node CI job runs `pnpm audit --audit-level=high`, which blocks high and critical advisories; lower-severity findings remain visible in its output. Run `pnpm audit` locally for the complete advisory report. A successful build alone does not establish dependency security.

## Content and routes

- `/en/` and `/zh/`: introduction, public outputs, selected projects and recent writing
- `/{locale}/projects/`: market-style and PB/ROE research panels followed by project links
- `/{locale}/about/`: interests, working approach and GitHub links
- `/{locale}/blog/`: article list and localized article bodies
- `/{locale}/notes/investment-perspective/`: the preserved investment perspective

Project identifiers and URLs live in `src/data/projects.ts`. Copy lives in `src/i18n/`; shared views live in `src/views/`. The research panels consume reviewed public aggregates and display their sample and interpretation limits. They do not calculate new research results.

## Add an article

Add paired files with the same `YYYY-MM-DD-slug.md` filename under `src/content/blog/` (Chinese) and `src/content/blog-en/` (English). For example:

```md
---
title: Article title
date: 2026-07-29
categories: [Investing, Case studies]
---

Article body.
```

`src/content.config.ts` requires a nonempty `title`, a coercible `date` and at least one nonempty `categories` entry. `reviewedAt` is optional. Preserve article identity, dates, numerical meaning, qualifications and source destinations across languages. Follow the [reference conventions](article-references.md).

## CI and deployment

`.github/workflows/pages.yml` keeps the Astro action build and artifact upload, followed by Chromium checks. A separate job uses exactly Node 22.18.0, strict engine validation and the frozen lockfile to run the full build, browser checks and dependency audit. Both jobs must pass before Pages can deploy; only the Astro action build uploads the deployment artifact. Pull requests build and test without deploying. Pushes to `main` and manual workflow runs can deploy through the dependent Pages job.

`dist/`, `.astro/` and `node_modules/` are ignored generated directories. Do not commit build output, credentials, raw research data or browser diagnostics. A source or documentation PR does not itself verify the live deployment.
