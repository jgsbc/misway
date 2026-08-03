# PRE-30 screenshots — not yet captured

This directory is intentionally empty of images.

Real WebGL rendering could not be observed in this session's Browser pane (`computer{action:"screenshot"}` failed with *"the Browser pane is not displayed, so the page is not compositing frames"* on every attempt; a direct `requestAnimationFrame` probe recorded **0 callbacks in 57.7 real seconds**, confirming the render loop itself never ran, not just the screenshot tool). Claude in Chrome — the real-Chrome fallback that recovered this exact class of problem in `DRIFT-IV-SYS-70`/`DRIFT-IV-BY-EUX-20`/`DRIFT-IV-BY-EUX-30` — reported "extension isn't reachable" on two connection attempts this session. The user was asked how to proceed and chose to proceed with honest limitation documentation rather than block on browser access.

Per this lot's own explicit instruction — *"Capture only real runtime screenshots. Do not create fake screenshots or illustrative replacements."* — no placeholder or illustrative image has been added here.

Required, still pending real browser access:
- `urban-human-desktop.png`
- `urban-human-mobile.png`
- `nature-movement-desktop.png`
- `nature-movement-mobile.png`
- `water-weather-light-desktop.png`
- `water-weather-light-mobile.png`
- `reduced-motion.png`
- `no-webgl.png`

See `docs/evidence/DRIFT-IV-PRE-30/shared-kit-pilots-evidence.md` §"Known limitation" and `performance-snapshots.json` for the full diagnostic record and for everything that *was* genuinely verified this session (TypeScript/lint/build/tests, DOM/state-layer interaction, console/network cleanliness, static-export bundle isolation, basePath-prefixed asset resolution, mobile viewport structural layout).
