# Contextual page motion

The user requested animation for research chart interactions, near-viewport blog-list entry, and slower quiet movement on the About page. Keep native CSS/Intersection Observer/Web Animations, original static content and source-backed values. No new dependency, sound, continuous background animation, scroll hijacking or invented intermediate financial numbers.

Charts reveal final signed bars from their correct zero-side origin over 160 ms, with stagger capped at 40 ms. Exact values/labels/interpretations update immediately. Cancel previous decoration on rapid changes; reduced motion, missing API, hidden tabs or offscreen plots stay static. Keep zero-based axes/source units/failure/retry behavior intact. This is a decorative reveal of new data, not a numerical interpolation between different normalized scales.

Blog archive observes individual already-rendered rows, with 200 ms entry and bounded stagger. Home list avoids parent/child double animation. About sections use a 360 ms profile and 8 px movement, once per view entry, while initial visible content stays static. Preserve keyboard/anchor/history/reduced-motion/no-JS fallbacks.

The cinematic cover question is optional and a user preference is pending. Current site remains quiet; no audio can autoplay. Continue the independent chart/blog/about work while awaiting that preference.

- [x] Add behavioral regressions before chart implementation.
- [x] Implement native bounded chart motion and compact page profiles.
- [x] Retain the existing silent cover while the optional cinematic-reference question remains open.
- [ ] Build/unit/browser/live-source and resource checks, independent review, PR/CI/publish, task cleanup.

## Validation record

Baseline `9aa2640`. Build/type/internal-link checks and all 18 unit tests passed. Browser coverage passed 112 locale/viewport/theme combinations and 30 articles, plus final signed chart origins, rapid-update cancellation, asynchronous reduced-motion notifications, one-shot blog rows, keyboard focus, slower About timing, no scroll adjustment and no-JS/reduced-motion fallbacks. Initial chart geometry was below the viewport, correctly producing zero animations; the regression now scrolls it into view before changing controls.

Actual public payload checks passed English/Chinese at 390/1440px, including momentum negative bars, PB/ROE metric switching, all 15 server-rendered archive posts, settled animation and no page errors or overflow. Representative frames were inspected outside the repository. Independent review approved without material findings.

Matched production builds with the same locked dependencies show total gzip JS/CSS assets 8527 to 9112 bytes (+585). Per-document HTML gzip adds 197–251 bytes across the checked routes. Combined generated-assets plus individual document deltas range 782–836 bytes (about 0.8 KB). This is a build-size comparison, without a Lighthouse or per-device CPU claim. No package, audio, video or other media was added.
