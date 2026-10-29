# Personal website refresh

## Scope

Turn the existing Astro investment blog into Richard's personal website, with a personal introduction, selected projects, public research entrances, and the existing writing. The owner approved this direction and asked for implementation. Keep the current Chinese content language and existing technology; this refresh does not introduce multiple locales.

## Design decisions

The homepage introduces the author and leads with three readable public outputs: market research, the factor observatory, and market reports. It then features the data platform, shared research framework, and global market research. The project directory groups thirteen projects by purpose and explains their relationship. The about page describes the author's documented work and principles without inventing biographical details.

Keep the existing warm neutral palette, dark mode, article routes, feeds, and legacy redirects. Preserve the former about-page investment material at `/notes/investment-perspective/`. Replace the default Buffett share image with an author-specific typographic cover; retain the illustration in the preserved investment note.

A homepage-only change would leave the project portfolio and personal introduction incomplete. A framework migration would add maintenance without helping these goals, so retain Astro and add a small typed project catalog and reusable card.

## Content sources and curation

Checked the public repository inventory and the thirteen selected repository READMEs on 2026-10-30, alongside the GitHub profile README. Prefer current public projects and direct reading destinations over archived frameworks and small compatibility utilities. Include global-market-research because it now has a public research site, offline examples and current work. Keep private details out of descriptions. Explicitly retain the observatory's demonstration-sample limitation and the global project's historical-experiment boundary.

Project descriptions live in `src/data/projects.ts`; the homepage and project directory consume the same catalog. The independently deployed project sites have explicit prefixes in the local build checker. They must be checked online separately; do not suppress checks for all same-host URLs.

## Implementation and acceptance

- [x] Add the typed catalog, project card and grouped project directory.
- [x] Refresh the homepage, about page, navigation and default metadata.
- [x] Preserve articles, investment notes, feeds and compatibility routes.
- [x] Update maintenance documentation and required build outputs.
- [x] Run `script/check`, verify project destinations and inspect browser layouts at desktop and mobile widths in both themes.

## Validation

Baseline source: `e49e50e3da0d21fdb087a03c6ca440aca277b08c` (origin/main).

- `script/check`: Astro diagnostics had no errors, warnings or hints; 21 pages built; 17 compatibility redirects generated; 38 HTML files and 317 local links checked.
- Browser: Chromium checked six routes at 320, 390, 768 and 1440 pixels in both themes (48 combinations), with no horizontal overflow or JavaScript errors. Verified theme toggle persistence, main navigation, project section links, and all thirteen project cards. Inspected desktop and mobile homepage screenshots.
- Six project website entrances returned HTTP 200. The public repository inventory and all thirteen project READMEs were checked on 2026-10-30.
- Pull requests now run the existing build workflow without deployment; deployment remains restricted to non-PR events. Concurrency separates PR builds from main publication.

Generated build output stays ignored. Browser screenshots and temporary verification scripts are disposable and are not committed.
