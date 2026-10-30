# Quiet, lightweight home motion

Approved direction: quick and quiet homepage motion, with viewport-triggered reveals and low resource use. A roughly 100ms microinteraction was requested as a reference; use 120ms small section movement and a local six-tile home-cover reveal ending within 180ms. Keep the cover local to the home work-note rather than a full-screen curtain. It plays once per tab session and never delays navigation or content rendering. Leave article body text static.

Retain Astro and original artwork. Use native CSS transforms/opacity, a small original SVG line motif and Intersection Observer; no animation dependency, external fonts, video, canvas or animation asset downloads. The only secondary illustration may use native lazy loading and async decode. HTML remains readable without JavaScript. Skip entry for reduced motion, hash arrivals, reload/history traversal, or unavailable session storage. Offscreen sections remain readable and are animated once when actually entering view, then unobserved. Keyboard focus, print and preference changes reveal immediately. No persistent animation loop, forced scroll, content gating or fake loading time.

References inspected 2026-10-30: Astro Nano (MIT) https://github.com/markhorn-dev/astro-nano for lightweight editorial hierarchy; Dribbble's landing-page-animation collection https://dribbble.com/tags/landing-page-animation for short staggered entry; SVGator's example roundup published 2026-02-24 https://www.svgator.com/blog/website-animation-examples-and-effects/ for line drawing and microinteractions. Use concepts only, without copying artwork, source or claimed benchmark scores. Motion's current mini package was considered but native APIs cover this scope.

- [x] Browser regression first: entry once, reduced motion, storage failure, no-JS, scroll once, focus and history/hash safety.
- [x] Implement local home cover and one-shot below-fold motion, preserving readable HTML and all locale/theme behavior.
- [x] Check both themes/viewports, representative animation frames, no layout shifts and actual added compressed resource size.
- [ ] Independent review, full required checks, PR/CI and deployed verification, then task cleanup.

## Local validation

Baseline `1c926e9`, identical locked dependencies. Full build/type/internal-link checks and 18 unit tests passed. Browser suite passed 112 locale/viewport/theme combinations, 30 articles and the added motion cases (first entry exactly six tiles; max duration+delay178ms; no replay for locale change/reload/history; reduced motion, no-JS, blocked storage, hash entry and unsupported observer fallbacks; one-shot scroll/focus handling). Independent review approved without material findings.

Production builds compared with the baseline show total gzip JS/CSS assets8064→8527bytes (+463); homepage HTML gzip adds970bytes English /1033bytes Chinese. Combined generated-asset plus individual-homepage increments are1433/1496bytes, below a2KB gzip target. These are reproducible build-size comparisons, not claims about Lighthouse scores or every browser's wire compression. No new package or media asset.

Inspected real CSS animation frames at0/80/180ms for English/Chinese at390/1440px in dark/light themes. After settling, no ongoing document animations and no horizontal overflow. The600ms script cleanup guard clears eligibility state; visual motion ends by180ms and does not hold navigation, scrolling or content rendering. All generated comparison builds/screenshots remained outside the repository.
