# Homepage Refinement Implementation Plan

> Execute in the isolated task worktree using superpowers:executing-plans.

**Goal:** Make the homepage easier to scan and unify the decorative wave with its warm theme.
**Architecture:** Homepage-scoped editorial styles, optional compact shared-component rendering, and CSS-owned wave colors.
**Tech Stack:** Astro, TypeScript, CSS, Canvas 2D.
**Spec:** ../specs/2026-11-27-home-refinement-design.md

## Constraints
Preserve full project/blog listings, external links, bilingual parity and existing animation accessibility. No new dependencies.

## Review Focus
- English hero wrapping at tablet widths.
- Narrow-screen row layout and long repository titles.
- Static wave recoloring after theme changes.
- Keyboard access and reduced-motion content visibility.
- Research qualifications remaining visible after simplification.

## Tasks
- [x] Simplify Home.astro and add compact variants to PostList and ProjectCard; align locale copy and scope styles to the homepage.
- [x] Read wave color from CSS tokens, soften pulse and reduce mesh density; remove obsolete tile styles and update existing motion expectations.
- [ ] Run Astro check/build, built-site checks, unit and Chromium suites; review the diff, publish the PR and merge after CI passes.

## Validation
Use the package build sequence and node tests/i18n-browser.mjs. On Windows invoke each Node build command directly because package scripts use POSIX environment assignment.

## Execution record
- Source base: 958af4dfbf2cb168840919c27c3957504b3463a8.
- Independent source review found a stale wave color declaration; removed and verified with zero Astro diagnostics.
- Updated motion replay assertions to check the remaining heading animation.
- Chromium exposed the new wrapper missing from section-motion selectors; extended the selector while retaining project-page behavior.
- Local Windows checkout CRLF caused the existing redirect YAML extractor to retain a trailing carriage return. Normalized task-checkout article line endings to canonical LF for validation; article content has no Git diff.
- Static build: 63 pages; redirects: 17; links: 877 across 80 HTML files; unit tests: 18 passing.
- Visual QA: EN/ZH × light/dark × 390/1440px; no horizontal overflow.
- Chromium regression suite passed: 112 locale/viewport/theme combinations, 30 articles, motion lifecycle, storage and JavaScript fallbacks.
