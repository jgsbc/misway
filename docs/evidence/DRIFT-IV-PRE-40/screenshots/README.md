# PRE-40 screenshots — not yet captured

This directory is intentionally empty of images.

Real WebGL rendering could not be observed in this session's Browser pane. `computer{action:"screenshot"}` failed on every attempt — on the greybox lab tab itself, and, as a control, on a plain already-working production `/drift` tab and on `DRIFT-IV-PRE-30`'s own `/drift-kit-lab` tab — all with *"the Browser pane is not displayed, so the page is not compositing frames."* A direct `requestAnimationFrame` probe recorded **0 callbacks in 1.5 real seconds** in the greybox lab tab, confirming the render loop itself never ran, not just the screenshot tool. This is the identical class of limitation `DRIFT-IV-PRE-30` documented (0 callbacks in 57.7s there) and, before it, `DRIFT-IV-SYS-70`/`DRIFT-IV-BY-EUX-20`/`DRIFT-IV-BY-EUX-30`.

Per this lot's own explicit instruction — *"Do not claim browser validation that did not occur. If the environment blocks rendering, stop honestly at IN_PROGRESS. Do not substitute DOM-only validation for owner-ready visual evidence."* — no placeholder or illustrative image has been added here.

Required, still pending real browser access (17 total, per this lot's own screenshot requirement):
- `entry-desktop.png`, `entry-mobile.png`
- `birth-yard-desktop.png`, `birth-yard-mobile.png`
- `older-shadows-desktop.png`, `older-shadows-mobile.png`
- `vegetative-field-desktop.png`, `vegetative-field-mobile.png`
- `new-signal-desktop.png`, `new-signal-mobile.png`
- `transition-entry-to-birth-yard.png`
- `transition-birth-yard-to-older-shadows.png`
- `transition-older-shadows-to-vegetative-field.png`
- `transition-vegetative-field-to-new-signal.png`
- `route-overview.png`
- `reduced-motion.png`
- `no-webgl.png`

**One thing this session's real-browser attempt did find, without needing a live render:** a genuine ambient-audio autoplay defect affecting both this lab and `DRIFT-IV-PRE-30`'s own `/drift-kit-lab`, found via network/DOM inspection and fixed — see `../five-macro-world-greybox-evidence.md` §9.1. This is why the attempt was made at all rather than skipped outright: DOM/network-level checks remain valuable even when compositing is blocked.

See `docs/evidence/DRIFT-IV-PRE-40/five-macro-world-greybox-evidence.md` §9 and `performance-snapshots.json` for the full diagnostic record and for everything that *was* genuinely verified this session (TypeScript/lint/build/tests, dev-harness/pure-function correctness live in-browser, console/network cleanliness, static-export bundle isolation, basePath-prefixed asset/route resolution, the audio-autoplay defect found and fixed).
