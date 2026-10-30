# Contextual page motion

The user requested animation for research chart interactions, near-viewport blog-list entry, and slower quiet movement on the About page. Keep native CSS/Intersection Observer/Web Animations, original static content and source-backed values. No new dependency, sound, continuous background animation, scroll hijacking or invented intermediate financial numbers.

Charts reveal final signed bars from their correct zero-side origin over 160 ms, with stagger capped at 40 ms. Exact values/labels/interpretations update immediately. Cancel previous decoration on rapid changes; reduced motion, missing API, hidden tabs or offscreen plots stay static. Keep zero-based axes/source units/failure/retry behavior intact. This is a decorative reveal of new data, not a numerical interpolation between different normalized scales.

Blog archive observes individual already-rendered rows, with 200 ms entry and bounded stagger. Home list avoids parent/child double animation. About sections use a 360 ms profile and 8 px movement, once per view entry, while initial visible content stays static. Preserve keyboard/anchor/history/reduced-motion/no-JS fallbacks.

After the user asked to continue, use the quiet default for the cinematic cover. Keep it silent and readable, with two staggered title lines (160 ms plus 24 ms) and a single thin vector-frame drawing (360 ms). Retain the small 178 ms six-tile cover, session/reduced-motion/history guards and 600 ms stale-state cleanup. No audio or video is added.

- [x] Add behavioral regressions before chart implementation.
- [x] Implement native bounded chart motion and compact page profiles.
- [x] Continue the quiet default cover without audio after the user asked to proceed.
- [ ] Build/unit/browser/live-source and resource checks, independent review, PR/CI/publish, task cleanup.

## Validation record

Baseline `9aa2640`. Build/type/internal-link checks and all 18 unit tests passed. Browser coverage passed 112 locale/viewport/theme combinations and 30 articles, plus final signed chart origins, rapid-update cancellation, asynchronous reduced-motion notifications, one-shot blog rows, keyboard focus, slower About timing, no scroll adjustment and no-JS/reduced-motion fallbacks. Initial chart geometry was below the viewport, correctly producing zero animations; the regression now scrolls it into view before changing controls.

Actual public payload checks passed English/Chinese at 390/1440px, including momentum negative bars, PB/ROE metric switching, all 15 server-rendered archive posts, settled animation and no page errors or overflow. Representative frames were inspected outside the repository. Independent review approved without material findings.

Matched production builds with the same locked dependencies show total gzip JS/CSS assets 8527 to 9112 bytes (+585). Non-home HTML gzip adds 245–251 bytes across the checked routes, for combined deltas of 830–836 bytes. The cinematic home adds 569–601 HTML bytes, for combined deltas of 1154–1186 bytes (about 1.2 KB). This is a build-size comparison, without a Lighthouse or per-device CPU claim. No package, audio, video or other media was added.

The user then asked to continue with the cinematic direction. The quiet default uses two directly readable title lines (160 ms, second delayed 24 ms) and a decorative one-pass 360 ms SVG frame. Existing tiles remain bounded at 178 ms. The cover stays silent and reuses the session/reduced-motion/history guards. Home CSS is delivered through its named head slot as trusted build-time inline CSS, avoiding delivery on other routes. Added regression checks confirmed two title animations, the frame's duration, no audio/video, all original fallback behavior, and settled state. Independent review approved both the visual addition and head-slot packaging.
