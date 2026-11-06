# runchengxie.github.io

[简体中文](README.zh-CN.md)

Richard's personal website, built with Astro, TypeScript and Markdown and published to [GitHub Pages](https://runchengxie.github.io).

Browse selected projects, public market and factor research, market reports, and fifteen investment articles with complete English and Chinese versions. English is the default; the header language switch saves the selection when browser storage is available. The site also provides dark mode, localized RSS/Atom feeds and redirects for earlier article URLs.

## Start locally

Use Node.js 22.18.0 or newer and the pinned `pnpm@11.17.0` package manager. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server defaults to `http://localhost:4321`. Run `script/check` for type checks, the production build, internal links and unit/build tests.

## Maintenance

- [Development and publication](docs/development.md): setup, commands, article maintenance and CI
- [Language maintenance](docs/i18n.md): routes, catalogs, fallback behavior and browser checks
- [Research showcase](docs/research-showcase.md): published-source contracts and interpretation limits
- [Article references](docs/article-references.md): citations and paired source records

Project identities and URLs live in `src/data/projects.ts`; localized copy lives in `src/i18n/`. The projects page loads published aggregate research from independent sites. Those providers own the research results and their evidence boundaries.
