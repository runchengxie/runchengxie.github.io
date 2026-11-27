# Shared wave cover

The personal homepage adopts the same Enrichr particle-wave renderer as A Study in Small Caps, pinned to publication revision `57fed8a60a689686dfeafff282de51aa2474c129`. Both use warm light/dark palettes, pointer interaction, a slow lateral wave and scroll-driven text/camera motion. The personal page retains its own introduction and links to Featured projects.

The renderer and original source/licence notices are vendored locally, so neither site depends on the other at runtime. See `public/third-party-notices/enrichr/`. The footer credits Enrichr. The export's preview licence permits personal/client use; no MIT licence is asserted.

`src/lib/home-wave.ts` adapts locale, theme and persisted pause preferences. Reduced motion produces a still image, offscreen/hidden documents stop scheduling, and unsupported WebGL retains readable text and the entry link. Decorative candles contain no market data. The renderer retains the research site's 32,000-particle field, single draw call and 1.8 pixel-ratio cap.

Validation uses the existing build and browser suite. The wave tests check the visible scroll hint, pointer/camera response, pause persistence, theme changes, reduced motion, responsive entry links and unavailable-WebGL/no-JavaScript fallbacks.

If local Chromium reports renderer crashes or `ERR_INSUFFICIENT_RESOURCES`, inspect free space in the temporary filesystem before changing the renderer. The browser suite disables `/dev/shm` use, so a full temporary directory can break composition. A controlled local run passed after setting `TMPDIR` to a task-owned directory on a disk with free space, without changing browser flags. Keep the path short enough for Chromium's Unix socket, and retain failure/success logs. Do not delete unrelated temporary files to make a test pass.
