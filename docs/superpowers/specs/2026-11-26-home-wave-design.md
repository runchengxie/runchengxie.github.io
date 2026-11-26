# Homepage wave

The owner selected the wave prototype after comparing signal extraction and clustering studies, and requested production integration with light and dark themes.

Replace the homepage candle background with a decorative Canvas 2D wireframe wave. Keep existing localized content, navigation, page entry transitions, and the About page candles. Use the existing theme preference; choose teal ink in light mode and luminous cyan in dark mode. Include a localized pause/resume control with a remembered preference. No additional dependencies or external assets.

The renderer caps updates at 30 FPS and device pixel ratio at 1.5, reduces mesh density on narrow screens, and stops scheduling frames while hidden, outside the viewport, paused, or under reduced motion. Reduced motion draws a static wave. With JavaScript disabled or Canvas unavailable, the page remains readable and the nonfunctional control is hidden.

## Approaches

- CSS: small payload but poorly suited to this mesh.
- Canvas 2D: selected after the owner reviewed the working prototype; sufficient spatial depth without a library.
- WebGL: unnecessary complexity for this particle count.

## Verification

Build and existing browser suite, plus wave lifecycle tests covering actual pixels, theme changes while static, mobile resize, pause persistence, reduced motion changes, background/offscreen suspension and browser history. Capture English/Chinese and light/dark layouts before publication. Actual device power use is not established by these checks.
