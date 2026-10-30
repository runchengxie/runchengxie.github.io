# Make the homepage intro visible and replayable

The owner cannot see the recently shipped intro. The current head script reuses `personal-site-home-motion-v1`, so an earlier visit suppresses the new design. It also consumes that marker and starts a 600ms cleanup timer before the external stylesheet is ready. Fix the lifecycle rather than requiring incognito browsing.

Use a versioned cinematic-entry marker, written only when the visible frame animation actually starts. Initialize after DOM/styles are available and schedule auto entry after window load. A previous version marker must not suppress this version. Already-watched reloads/language/history visits stay still. A first new-version reload may play once. No forced scrolling or blocking content.

Add a small localized Replay intro button. It remains usable with blocked storage; reduced-motion preference disables it with a clear localized explanation. No-JS/unsupported-animation fallbacks keep content static and controls hidden. Replays cancel previous decoration and restart deterministically without queues. Media/history/visibility changes settle it. Keep existing 360ms silent visuals and no new dependencies/media.

- [x] Reproduce previous-marker and slow-CSS failures in browser tests.
- [x] Implement the versioned visible-start lifecycle and manual control.
- [x] Verify replay, rapid clicks, storage/reduced-motion/history/no-JS and slow styles.
- [ ] Review, full checks, PR/CI/deployment, production verification and cleanup.
