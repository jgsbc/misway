# DRIFT-IV-PRE-10 — Five Visual Masterframes: Production Record

**Status:** `REWORK_REQUIRED` — five candidate images ingested, technically validated, and visually audited. One frame (New Signal) carries an objective, explicit-rule violation (embedded text + decorative λ logo). The other four are ready for owner review but **no image has received an owner verdict yet** — this record does not self-accept any frame.
**Lot:** `DRIFT-IV-PRE-10` — Five real visual masterframes
**Branch:** `drift-iv-pre-10-five-visual-masterframes`
**Type:** Five candidate masterframes now exist under `docs/evidence/DRIFT-IV-PRE-10/masterframes/`, produced externally (outside this session) per the production contract in §6 below. This pass ingests, technically validates, and visually audits them; it does **not** generate replacement imagery, does **not** auto-accept any image, and does **not** mark `DRIFT-IV-PRE-10 = DONE_PENDING_MERGE`.

---

## 0. Why this lot previously stopped before producing images (historical, superseded by §11 below)

This session (`Claude Code` running in the Claude Agent SDK, this environment) does **not** have an image-generation or 3D-rendering tool available — no diffusion model, no render-farm connector, no local Stable Diffusion/ComfyUI/Blender-headless pipeline, nothing in `package.json` or the toolchain that turns a text prompt into a raster image. The available tools were checked directly against this requirement:

- `mcp__visualize__show_widget` — renders **SVG or HTML/CSS**, explicitly for diagrams, charts, mockups, and interactive widgets. This is vector/DOM content, not photorealistic cinematic rendering, and the lot's own instructions explicitly forbid using an SVG placeholder or HTML mockup to stand in for a real masterframe.
- `DesignSync` — syncs HTML/CSS component libraries to a Claude Design project. Not an image-generation tool.
- `Bash`/`PowerShell` — no image-generation CLI or model is installed in this repository or environment (`package.json` contains no `sharp`/render/AI-image dependency; confirmed by direct search).
- Browser tools — could only reach a third-party external image-generation website, which this lot's own constraints (no external asset adoption, no download of externally-produced content standing in as a canonical asset without explicit provenance) and the general operating rules around downloading files from untrusted sources make inappropriate to use unsupervised in place of a real, owner-directed production pipeline.

Per this lot's own explicit instruction for exactly this situation, this record stops here with the complete production contract and the five exact generation prompts below, marks no status `DONE`, and states the required external/manual action.

---

## 1. Baseline (confirmed)

```text
Branch:  drift-iv-pre-10-five-visual-masterframes
HEAD:    8a74a3170712d00274fe8d6b596875f829170f06
main:    8a74a3170712d00274fe8d6b596875f829170f06  (identical)
```

Confirmed via `git branch --show-current`, `git status --short` (clean), and `git log --oneline -8`:

```text
8a74a31 docs(drift): complete PRE-00 canonical artistic acceptance gate (#34)
99eacbe docs(drift): GOV-40 holistic art direction and reuse-first reconciliation (#33)
b069d09 feat(drift): rework EUX GAINENT visuals per owner review #1-2 (V2+V3) (#32)
d2a1c15 feat(drift): build EUX GAINENT proof slice (#31)
```

`DRIFT-IV-PRE-00` merged via PR #34 at `8a74a31`. `DRIFT-IV-GOV-40` merged via PR #33 at `99eacbe`. `DRIFT-IV-BY-EUX-30` merged via PR #32 at `b069d09`. All three confirmed present as ancestors of the current `HEAD`.

**75/75 canonical field check re-run against `main`'s actual merged copy** of `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` (not assumed from memory): all 15 fields (player viewpoint, foreground, middle ground, horizon, geography/architecture, human activity, materials, light, weather, movement, anomaly, lambda treatment, reusable kits, density, mobile fallback) occur exactly 5 times each (once per masterframe), confirmed via `grep -cE "^N\. \*\*<Field>:\*\*"`. **75/75 confirmed on this baseline.**

**No existing five-masterframe deliverable found**: `docs/evidence/DRIFT-IV-PRE-10/` did not exist before this pass; no `.webp`/`.png`/`.jpg` file exists anywhere under `docs/` on this baseline.

---

## 2. Canonical authorities read

`AGENTS.md`, `docs/DRIFT_3D_PRODUCT_SPEC.md`, `docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md`, `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` (full, all five 15/15 canonical field blocks), `docs/DRIFT_3D_ERA_TRACK_ATLAS.md`, `docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`, `docs/DRIFT_3D_ASSET_REUSE_MATRIX.md`, `docs/DRIFT_3D_REALISM_BIBLE.md`, `docs/DRIFT_3D_INTEGRAL_BACKLOG.md`, `docs/evidence/DRIFT-IV-PRE-00/canonical-artistic-acceptance.md`, and the five Era Contracts (Entry, Birth Yard, Older Shadows, Vegetative Field, New Signal — existence/line counts confirmed, content previously reconciled under `GOV-40`/`PRE-00`).

## 3. Repository-owned visual inputs (exact paths, confirmed by direct inspection)

### 3.1 MISWAY hero image (Entry's compositional-continuity reference)

| Property | Value |
|---|---|
| Desktop file | `public/images/tracks-hero-1920x1080-v3.jpg` (145,242 bytes) / `.webp` (65,988 bytes) |
| Mobile file | `public/images/tracks-hero-mobile-1080x1920.jpg` / `.webp` (126,522 bytes) |
| Confirmed dimensions | Desktop **1920×1080 px**; mobile **1080×1920 px** (verified from actual image metadata, matching the filenames exactly) |
| Rendered by | `src/components/Hero.tsx` (two `next/image` `fill priority` elements, desktop/mobile variants), used on the site's home page (`src/app/page.tsx`) |
| Alt text | "Visuel lumineux centré sur le symbole lambda" |

**Composition, described from direct visual inspection of the actual file** (not assumed): a dark, smooth poured-concrete corridor shot in one-point perspective, converging toward a tall, upward-pointing **triangular (Λ)** opening at the far end — the triangle's apex near the top of the frame, its base near the middle, flanked at its base by two low waist-height concrete blocks. Warm-white light floods through the triangular opening into thin haze; the near-black corridor walls and a faintly wet/reflective floor lead the eye toward it; everything outside the triangle and its light-spill is at or near pure black. **This is the exact silhouette, proportion and framing relationship Entry's masterframe must echo** — a rock corridor instead of poured concrete, individual rock texture readable at close range instead of smooth concrete, but the same converging one-point corridor and the same centered upward-triangular light shape at the far end, flanked by low blocks at its base.

### 3.2 Canonical Drift vehicle (must appear identically across all five frames)

| Property | Value |
|---|---|
| Rendered in | `src/components/drift-3d/Drift3DVehicle.tsx`, lines 158–386 |
| Physics-only file | `src/lib/drift3dVehiclePhysics.ts` (kinematics constants only, e.g. `DRIFT_3D_VEHICLE_COLLISION_RADIUS = 0.34`; no geometry) |
| Actual shape | A detailed procedural **safari-style 4x4** (comment at lines 64–69: *"4x4 safari procédural type Defender"*) — **not** a capsule primitive. Built from ~20 box/cylinder primitives: body box, hood, cabin, windows, roof, roof rack, jerrycan, spare tire, snorkel, bull bar, round headlights/taillights, four wheels. Group scale `1.34`. |
| Hardcoded colors | `BODY_SAND = "#ab9464"`, `ROOF_WHITE = "#d8d2c2"`, `GLASS = "#22303c"`, `DARK_METAL = "#3a3833"`, `TIRE = "#17181a"` |

**Honest discrepancy, recorded not silently resolved:** `docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md` §15 and the historical `docs/DRIFT_3D_ART_DIRECTION.md` §14.2 both state *"the vehicle stays a small capsule, never a literal car model."* The actual shipped runtime code (`Drift3DVehicle.tsx`) contradicts this — it is a literal, detailed sand-colored safari 4x4, not a capsule. Per `docs/DRIFT_DOCUMENTATION_MAP.md`'s own standing rule (`RUNTIME TRUTH` wins over any document on conflict), **the prompts below depict the actual shipped vehicle** (the safari 4x4) for cross-frame consistency with what the game actually renders, not the doctrine's stated-but-unbuilt capsule. This discrepancy is not resolved by this lot — resolving which one is canonical going forward is an artistic/documentation decision outside PRE-10's own scope (documentation/evidence and image production only) and is flagged as a non-blocking follow-up in §7 below.

### 3.3 Documentation-image conventions

No prior convention exists: `docs/evidence/` contains no image files anywhere in the repository's history to date. This lot therefore establishes the first one, using the canonical output structure specified for this lot (§4).

---

## 4. Canonical output structure (populated)

```text
docs/evidence/DRIFT-IV-PRE-10/
  visual-masterframe-production.md   (this file)
  visual-masterframe-production.json
  masterframes/
    entry.webp                          <- candidate image, ingested
    birth-yard.webp                     <- candidate image, ingested
    older-shadows.webp                  <- candidate image, ingested
    vegetative-field.webp               <- candidate image, ingested
    new-signal.webp                     <- candidate image, ingested
    masterframes-contact-sheet.webp     <- generated this pass from the five files above
    manifest.json                       <- external, accompanied the candidates; cross-checked, not trusted blindly (§5)
```

All six required files exist. Five are candidate masterframes produced externally, outside this session, per the exact prompts in §6. The contact sheet was generated this pass by resizing the five *already-final* candidate files into a labeled grid — no new artistic content, no alteration of the five individual files themselves.

## 5. Target technical specification (for whichever production method is used)

- Aspect ratio: exactly **16:9**.
- Minimum resolution: **1536×864 px**; recommended generation target **1920×1080 px or higher**, then downsampled/compressed for the final stored file.
- Color space: **sRGB**.
- Format: high-quality **WebP** preferred (PNG acceptable) — final files sized reasonably for Git, not multi-tens-of-MB source renders.
- No embedded text, caption, title card, HUD, watermark, or third-party branding in the final image itself.
- Contact sheet: a simple 2-row/3-cell (or similar) grid of the five *final, owner-accepted* images only, generated after all five are accepted — never a substitute for any individual masterframe.

---

## 6. The five generation prompts

Each prompt is built **only** from the frame's own already-accepted 15-field canonical block in `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md`, the shared doctrine in `docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md`, and the two repository-owned visual inputs in §3. No detail below was invented for this lot.

### Shared elements (identical across all five prompts, for cross-frame consistency)

**Shared style suffix** (append to every positive prompt):
> physically-based rendering, cinematic real-time game-engine quality (Unreal Engine 5 / Unity HDRP look), photoreal PBR materials, volumetric atmosphere, global illumination, filmic tone mapping, medium depth of field, 35mm cinematic lens, one dominant scripted light source per scene, grounded realistic proportions, credible human scale, production-quality concept art for a driving/exploration game, no stylization, no cel-shading, no anime, no cartoon rendering

**Shared vehicle description** (insert wherever "[VEHICLE]" appears):
> a sand-tan (#ab9464) procedural safari-style 4x4 SUV with Land Rover Defender-like proportions, white roof (#d8d2c2), dark tinted windows (#22303c), dark metal bull bar and roof rack (#3a3833), black tires (#17181a), no visible brand badges or logos, small and compact in scale, viewed from a low-to-medium camera height close to the vehicle

**Shared negative prompt** (append to every negative prompt):
> no text, no captions, no title cards, no HUD, no UI overlay, no watermark, no signature, no logo, no third-party brand, no cyberpunk aesthetic, no neon, no synthwave, no glowing outlines, no anime style, no cartoon shading, no low-poly primitive look, no wireframe, no placeholder gray boxes, no photo collage, no multiple panels, no diagram arrows, no icon checklist, no miniature/diorama/tilt-shift effect, no fisheye distortion, no exaggerated motion blur, no lens-flare spam, no oversaturated colors, no minimap or game HUD, no caricatured faces, no exaggerated cartoon expression, no punchline staging, no comic speech bubble

---

### 6.1 Entry

**Source:** `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` §1 (all 15 fields), MISWAY hero image (§3.1 above).

**Positive prompt:**
> Interior of a narrow, unbranching dark mineral cave corridor, walls of raw rock close enough that individual rock texture and grain are readable, converging in one-point perspective toward a tall triangular (Λ-shaped) glowing exit sculpted directly into the rock silhouette at the far end — the same silhouette, proportion and framing relationship as a soaring triangular light shape centered in frame, apex near the top, reaching down toward the floor, flanked by two low waist-height rock blocks at its base, warm-white light spilling from the opening into thin haze, near-total darkness everywhere else. [VEHICLE] parked motionless at the exact midpoint of the corridor, facing the distant glow, occupying the full width of the drivable path. In the immediate foreground beside the corridor wall: a low mechanical relay housing built into the rock, a thin metal stamp arm caught mid-stroke, a small screen showing a glowing rejection glyph, and a stamped "NON CONFORME" mark on a nearby rock surface, unattended. One single visible water drip caught mid-fall from the ceiling, a faint ripple on the wet stone floor below it. No people anywhere in frame. [SHARED STYLE SUFFIX]

**Negative prompt:** [SHARED NEGATIVE] + no side tunnels or branching passages, no statues or carvings, no fantasy-temple aesthetic, no glowing runes or magic symbols, no crystals, no lava, no bioluminescent fungus, no floating detached triangle icon (the light shape must be carved into the rock, not overlaid on top), no more than one light source, no daylight.

**Sourced from:** fields 1 (viewpoint), 2 (foreground), 3 (middle ground), 4 (horizon), 5 (geography/architecture), 6 (human activity), 8 (light), 10 (movement) of §1's canonical block; the hero-image continuity requirement (field 4 / brief prose "Geography").

---

### 6.2 Birth Yard

**Source:** `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` §2 (all 15 fields).

**Positive prompt:**
> Dusk in a dense port city at water level, viewed low from a canal. [VEHICLE] driving mid-canal close to the water, its own reflection breaking the surface. In the near foreground on one bank: a glass-fronted gym façade catching the last warm horizontal dusk light, three athlete silhouettes visible exercising through the glass, backlit by cold blue-white fluorescent interior light contrasting the warm exterior, a towel conveyor belt visibly moving inside. At the water's edge: a lifting bridge open mid-cycle holding a small queue of four to six waiting pedestrian and cyclist silhouettes and one delivery van, one cyclist and a delivery vehicle caught in a near-miss moment of traffic friction. Rising behind and above: dense vertical concrete-and-glass commercial towers receding into blue dusk haze, several lit office windows on late, one rooftop crane still working under its own light, one delivery hoist mid-lift on another rooftop. The quay's concrete surface is worn and real — oil stains, a torn poster corner, standing puddles, a cracked curb — except the gym façade itself, which stays clean and pristine. Hidden in the scene, not staged for attention: a parking-enforcement figure calmly ticketing a bicycle that is properly chained to a "no parking" sign post. Very high density of people, traffic, and working machinery throughout foreground and background. [SHARED STYLE SUFFIX]

**Negative prompt:** [SHARED NEGATIVE] + no futuristic skyline, no flying vehicles, no neon signage, no crowd larger than the described small loose cluster at the bridge, no visible injury or aggression, no slapstick posing or exaggerated joke framing around the ticketing detail, no gore.

**Sourced from:** all 15 fields of §2's canonical block, verbatim/paraphrased.

---

### 6.3 Older Shadows

**Source:** `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` §3 (all 15 fields).

**Positive prompt:**
> Mid-morning on a wide open mountain plateau traverse between a distant forest line and an exposed rocky ridge, clear high-altitude air, one hard coherent sun casting crisp cool shadows. [VEHICLE] small in the wide frame, driving along a worn dirt trail. Directly ahead: a long cairn trail of stacked stones spanning multiple visible generations — some fresh and pale, roughly a third older, weathered and lightly lichen-covered, standing in loose uneven clusters — with one stone caught mid-motion settling into a new position by itself. Beside the trail: one faded, worn equipment strap left on the ground; a short distance away, a second older parallel path visibly eroding and half-reclaimed by the mountainside; faint half-filled footprint impressions in a patch of softer ground nearby. Taut fabric flags moving in real wind. Along the distant ridgeline: one small paraglider silhouette, just a colored canopy shape, mid-descent; closer but still small, one hiking figure on foot crossing the trail well ahead of the vehicle. One raptor bird circling at altitude. One small, distant refuge structure on the horizon. Exposed granite and rock-boulder texture, patches of snow near the tree line. [SHARED STYLE SUFFIX]

**Negative prompt:** [SHARED NEGATIVE] + no heroic close-up of any human figure, no visible faces, no extreme-sport action-shot framing, no single glowing sentimental object, no fantasy-adventure poster composition, no figures beyond the ones described, no dense crowd.

**Sourced from:** all 15 fields of §3's canonical block, verbatim/paraphrased.

---

### 6.4 Vegetative Field

**Source:** `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` §4 (all 15 fields).

**Positive prompt:**
> Flat, slightly overcast midday light over a repetitive suburban housing grid street, ordinary residential viewpoint at vehicle height. [VEHICLE] driving through at ordinary residential speed down the middle of the street. Two nearly identical houses side by side, same massing, same clean rendered stucco and fresh asphalt driveway, differing only in trivial details like a garage-door color or hedge height — everything looks freshly maintained, nothing worn or decayed. On one driveway: a single resident, shown from a distance with no facial detail, mid-routine — coiling a garden hose or wheeling a bin to the curb — caught in one small human hesitation, a half-finished coil or a beat's pause, a tiny imperfection distinguishing them from a machine. Nearby: a robot vacuum crossing the driveway on its own path, an automatic sprinkler mid-cycle throwing a fan of water droplets, and through one house window, a small screen glowing with a plain green satisfaction indicator, facing an empty room. Manicured lawns, clean hedges, no visible decay or damage anywhere. [SHARED STYLE SUFFIX]

**Negative prompt:** [SHARED NEGATIVE] + no dramatic or moody lighting, no dystopian visual cues, no barbed wire, no emphasized surveillance cameras, no literal humanoid-robot standing in for the resident, no visible contamination, glitch, decay, or damage of any kind, no horror framing.

**Sourced from:** all 15 fields of §4's canonical block, verbatim/paraphrased.

---

### 6.5 New Signal

**Source:** `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` §5 (all 15 fields) plus the canonical New Signal guardrail restated in that same section.

**Positive prompt:**
> Dawn just after a passing storm, a coastal overlook partway along a curving headland road — not the final beach arrival, which stays small and distant. [VEHICLE] stopped at the overlook, facing the view. The wet asphalt road surface in the foreground holds a brief unstable reflection showing both the retreating cool grey-blue storm-light behind and warm gold dawn light opening ahead, side by side in the same puddle without blending. Weathered stone at the road's edge carries a restrained silver, cool-toned material register. Far below and ahead, the final beach is visible only as a small distant strip, not yet reached. Along the far curve of the shoreline, barely legible at that distance: the last few lights of a sleeping city, with exactly one window burning distinctly warmer than the rest. Behind the vehicle, the storm is visibly retreating out to sea under a cool grey sky; ahead, the first gold sunlight catches the headland. Onshore wind. No people anywhere in frame. One single dominant real coastal geography — the distant city, the storm, and the reflection read only as distant silhouette, weather, light or material, never as a second competing place. [SHARED STYLE SUFFIX]

**Negative prompt:** [SHARED NEGATIVE] + no literal accumulation of separate landmark objects, no multiple competing focal geographies, no museum-panorama wide-establishing collage, no oversized or stylized sun graphic, no glowing logo or final spectacle, no close-up of the beach itself, no checklist-like arrangement of symbolic objects, no crowd, no visible human figures.

**Sourced from:** all 15 fields of §5's canonical block, plus the six-rule New Signal guardrail restated verbatim in that section — each guardrail rule is reflected directly in a negative-prompt clause above.

---

## 7. Generation provenance (per masterframe, as supplied)

Five candidate `.webp` files and one `manifest.json` were found under `docs/evidence/DRIFT-IV-PRE-10/masterframes/` at the start of this pass — produced externally, outside this session (the user's own instructions describe "a prior visual style board" existing outside the repository as reference-only; these five files are the actual candidates, not that board). The externally-supplied `manifest.json` claims each file's source as a `ChatGPT Image <date/time>.png` export. This claim is recorded as supplied **and cross-checked** against this pass's own independent SHA-256/dimension computation in §8 — every value matched exactly, so the external manifest is corroborated, not blindly trusted.

| Masterframe | Tool/model (as supplied) | Claimed source file | Repository-owned input referenced | Input path |
|---|---|---|---|---|
| Entry | ChatGPT image generation (external, outside this session) | `ChatGPT Image 2 août 2026, 11_19_22.png` | Yes — composition reference only, per §6's prompt | `public/images/tracks-hero-1920x1080-v3.jpg` |
| Birth Yard | ChatGPT image generation (external) | `ChatGPT Image 2 août 2026, 11_22_51.png` | No | — |
| Older Shadows | ChatGPT image generation (external) | `ChatGPT Image 2 août 2026, 11_22_57.png` | No | — |
| Vegetative Field | ChatGPT image generation (external) | `ChatGPT Image 2 août 2026, 11_23_16.png` | No | — |
| New Signal | ChatGPT image generation (external) | `ChatGPT Image 2 août 2026, 11_23_37.png` | No | — |

No web image was imported into the repository by this session. No external artist's work was used as a hidden image-to-image input by this session. This session did not generate, re-generate, or alter any of the five candidate images — only ingested, measured, and inspected them.

## 8. Technical validation (independently computed by this pass, not assumed from the supplied manifest)

Method: for each file, read the raw bytes and compute SHA-256 directly; decode with Pillow (`Image.open().load()`) to confirm successful decode; read `.size` for width/height; read `.format`, `.mode`, and `info.get("icc_profile")` for color data; read the OS file size. No resize, crop, recolor, or recompression was applied to any of the five candidate files themselves (the contact sheet in §10 is a separate, new file built from resized *copies*).

| Frame ID | Filename | Decodes | Width | Height | Aspect ratio (measured) | vs. exact 16:9 (1.777778) | ≥1536×864 | Format | Color mode | Embedded ICC | File size | SHA-256 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| entry | `entry.webp` | ✅ | 1672 | 941 | 1.776833 | −0.053% (0.5 px height rounding) | ✅ | WEBP | RGB | none (assume sRGB, web/WebP default) | 270,892 B | `89041738365e6cd618d044b903bd2aa6c11343d68a4024a3af508ea8d9ef583a` |
| birth-yard | `birth-yard.webp` | ✅ | 1672 | 941 | 1.776833 | −0.053% | ✅ | WEBP | RGB | none | 442,222 B | `4ef1fafdff2a1983d1567c59830d0d32b42bad178f74968f1d5969c1aec980dd` |
| older-shadows | `older-shadows.webp` | ✅ | 1672 | 941 | 1.776833 | −0.053% | ✅ | WEBP | RGB | none | 554,490 B | `c48d3918ad053d67a97b91a191c2a2f4489785ddb87c7948559545318b3484f0` |
| vegetative-field | `vegetative-field.webp` | ✅ | 1672 | 941 | 1.776833 | −0.053% | ✅ | WEBP | RGB | none | 397,928 B | `8cb93fe3422096bc40fdf4dbf40a4b05f40fe9031bb3ac0e07a2a3f7ea24ab31` |
| new-signal | `new-signal.webp` | ✅ | 1672 | 941 | 1.776833 | −0.053% | ✅ | WEBP | RGB | none | 316,384 B | `acc0d3a4bf161370934cb69df8103021be63050168513cfe62cd1ac2a278876f` |

**Findings:**
- All five files exist, decode successfully, and are non-zero size.
- All five are identically **1672×941 px**, format **WEBP**, mode **RGB**.
- **Aspect ratio is not mathematically exact 16:9**: 1672×941 gives 1.776833:1 against the exact target of 1.777778:1 — a 0.5-pixel-height rounding difference (exact 16:9 at width 1672 would be 940.5 px high, not an integer). This is a **0.053% deviation**, imperceptible visually and comfortably inside normal export rounding for an AI image generator; **not treated as a technical failure**, but stated exactly rather than silently rounded up to "confirmed exact." All five share the identical ratio, so cross-frame consistency is unaffected.
- All five comfortably exceed the 1536×864 minimum (1672×941 > 1536×864 on both axes).
- **No embedded ICC profile** in any file. Per WebP/web convention, an untagged image is treated as sRGB by default — this is recorded as an assumption, not a confirmed embedded tag, since none exists to read.
- **All five SHA-256 hashes are distinct.** No duplicate file.
- The externally-supplied `manifest.json` (dimensions, sizes, hashes) matches this independent computation exactly for all five files — corroborated, not blindly trusted.
- **No technical rework required for any frame.** `TECHNICAL_REWORK_REQUIRED` applies to none of the five.

## 9. Visual audit (inspected directly, against the criteria this lot specifies)

Each image was opened and inspected directly (including magnified crops of specific regions) against `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md`, `docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md`, `docs/DRIFT_3D_ERA_TRACK_ATLAS.md`, and this lot's own production contract (§6 above).

### 9.1 Entry
- **Composition fidelity — strong.** The converging one-point corridor toward a centered, upward-pointing triangular (Λ) light shape echoes the MISWAY hero image's silhouette/proportion/framing closely.
- **Geography credibility — matches.** Individual rock texture reads at close range; single unbranching corridor.
- **Defect (content-completeness, moderate):** the required foreground control apparatus — relay housing, stamp arm, small screen with a glyph, and the stamped "NON CONFORME" mark — is **entirely absent** from the frame, confirmed on magnified inspection of the full foreground/wall area. Field 2 (foreground) and field 11 (anomaly) of the brief's canonical block are not visually represented.
- **Light — deviation:** the cave reads as atmospherically lit throughout (visible detail and haze across the whole corridor) rather than "near-total darkness" with only the relay indicator and the λ-glow as light sources.
- **Human presence — correct:** none.
- **Vehicle — consistent** with the canonical sand-colored safari 4x4.
- **No embedded text/caption. No decorative floating lambda** — the triangular light is carved into the rock silhouette itself, matching the lambda-construction doctrine. Both explicit prohibitions clear.
- **Known defects:** missing foreground control-apparatus/anomaly elements; ambient light level departs from "near-total darkness."

### 9.2 Birth Yard
- **Composition/geography/density — strong.** Glass-fronted gym with three visible athletes on machines, dense towers with lit windows, a rooftop crane, a canal/quay with reflections, a delivery van, a small cluster of cyclists/pedestrians, torn poster and graffiti-marked street furniture, wet reflective pavement.
- **MISWAY identity — direct hit:** the gym's own storefront signage reads **"EUX GAINENT"** — the exact, correct in-world venue name from the canonical Track Atlas — rendered as diegetic shop signage, not a production caption.
- **The deadpan gag — confirmed, precisely staged:** a parking-enforcement figure (jacket labeled "PARKING") ticketing a bicycle chained directly to the post of a circular no-stopping sign, discoverable rather than announced, exactly per the brief.
- **Known defect (minor, cosmetic):** the enforcement officer's jacket carries a second line of small text beneath "PARKING" that renders as illegible AI-generated glyph noise (not real words, not a coherent caption) — a typical diffusion-model text artifact. It does not function as an explanatory caption, but it is visible text and worth naming.
- **No cyberpunk substitution, no neon overreach** — the skyline reads as a real, dense, working port city, not futuristic.
- **Human-presence and vehicle consistency — strong.**
- **Overall: the strongest of the five candidates**, one minor cosmetic defect only.

### 9.3 Older Shadows
- **Scale/composition — strong.** Vehicle small in a wide alpine plateau frame; one hiking figure crossing on foot, one small orange-canopy paraglider silhouette on the ridge, one raptor circling — all correctly sparse, distant, and silhouette-scale.
- **Defect (content-completeness, moderate):** the brief's memory device calls for a whole cairn *trail* spanning visibly mixed generations (fresh + roughly a third older/weathered/lichen-covered, in loose clusters), a second older eroding path, and faint footprint traces. The image shows only one large cairn plus one small distant cairn, fairly uniform in age, no visible second eroding path, and no visible footprint traces. A backpack beside the trail stands in reasonably for "worn equipment," though it reads as a full modern pack rather than "a faded strap or buckle."
- **One small distant refuge structure — present and correctly scaled.**
- **No heroic close-up, no fantasy-poster treatment, no visible faces** — compliant.
- **Vehicle consistency — strong.**
- **Known defect:** the multi-generational cairn-trail memory device (a named, load-bearing owner requirement) is under-represented — reads as one or two cairns, not a whole aged trail.

### 9.4 Vegetative Field
- **Composition — strong.** Two near-identical stucco/tile-roof houses; a resident at the driveway coiling a hose, shown at a distance with no facial emphasis; an active sprinkler; overcast, flat midday light; everything reads clean and maintained.
- **Satisfaction indicator — excellent, unambiguous:** a glowing green smiley-face icon lit in an upstairs window, facing an empty room — a clear, diegetic realization of the brief's "green satisfaction indicator to no one."
- **Defect (minor):** the "robot vacuum" is realized as a small robotic mower/rover positioned on the curb-side lawn rather than "crossing a driveway" — functionally analogous (an autonomous household robot on a repetitive cycle) but a literal deviation from the brief's stated object and location. A small, mostly illegible logo-like mark is visible on its housing under magnification — likely a fabricated/generic mark rather than a real third-party brand, but flagged for the owner's own judgment on the "no third-party branding" criterion.
- **No dystopian iconography, no literal humanoid robot** — compliant.
- **Vehicle consistency — strong.**
- **Overall: strong, two minor, non-rule-violating fidelity notes.**

### 9.5 New Signal
- **Atmosphere/light — strong.** Retreating storm (visible rain streaks under dark cloud) on one side, gold sunset opening ahead, distant coastal city lights along the shoreline, wet road holding a reflection, vehicle stopped at the overlook.
- **Defect — objective, explicit-rule violation, confirmed on magnified inspection:** a stone monument in the immediate foreground carries a metal plaque engraved with a literal **λ glyph** above the words **"MISWAY REGISTER"** and **"SILVER."** This single element violates three of this pass's own explicit, named prohibitions simultaneously:
  1. **"No frame may contain an embedded title, number, caption or explanatory text"** — the plaque's text is exactly that: an explanatory caption spelling out the era's "silver" motif for the viewer.
  2. **"No decorative floating lambda"** — the λ is rendered as a mounted, engraved logo/icon, the opposite of the doctrine's own "sculpted into the set, never simply added" construction rule, and this exact masterframe's own canonical field 12 ("Lambda treatment: not staged in this frame at all").
  3. **"No collage/checklist/museum panorama in New Signal"** — a plaque literally reading "REGISTER" functions as a museum-placard label, precisely what the New Signal guardrail's rule 5 ("no museum-like final panorama") forbids.
  This is not a subjective taste judgment — it is a direct, checkable violation of criteria stated explicitly in this lot's own instructions and in the already-accepted masterframe brief for this exact frame.
- **Everything else in the frame — strong:** one dominant coastal geography, the city/storm/reflection all correctly read as distant silhouette/weather/material rather than competing geographies; no humans; vehicle consistent.
- **Known defect (blocking): the fabricated "MISWAY REGISTER / SILVER" plaque must be removed or the frame regenerated without it before this frame can be reasonably presented for an `ACCEPT` verdict.**

## 10. Contact sheet

Created at `docs/evidence/DRIFT-IV-PRE-10/masterframes/masterframes-contact-sheet.webp` (1968×844 px, WEBP, SHA-256 `5a77159cda0e4b22e6e0428cf2a59f2d8ae6b1dedd2d916c0f10f8b8d215927b`) — a 3×2 labeled grid of all five *already-final* candidate files, each resized to a 640×360 thumbnail with its canonical name printed only in the contact sheet's own label bar (Entry, Birth Yard, Older Shadows, Vegetative Field, New Signal). No label, text, or alteration was added to any of the five individual files. The contact sheet does not replace or stand in for any individual masterframe.

## 11. Deterministic image manifest

| Frame ID | Filename | SHA-256 | Dimensions | Aspect ratio | Format | File size | Color mode | Production iteration | Technical status | Visual-audit status | Owner verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| entry | `entry.webp` | `8904173836...9ef583a` | 1672×941 | 1.776833 (~16:9, −0.053%) | WEBP/RGB | 270,892 B | RGB, no ICC (assume sRGB) | 1 (external, ChatGPT image) | PASS | Missing foreground control-apparatus/anomaly content; light brighter than "near-total darkness" | `PENDING` |
| birth-yard | `birth-yard.webp` | `4ef1fafd...1aec980dd` | 1672×941 | 1.776833 (~16:9, −0.053%) | WEBP/RGB | 442,222 B | RGB, no ICC | 1 (external) | PASS | One minor cosmetic AI-text artifact (illegible glyphs on uniform); otherwise strong | `PENDING` |
| older-shadows | `older-shadows.webp` | `c48d3918...18b3484f0` | 1672×941 | 1.776833 (~16:9, −0.053%) | WEBP/RGB | 554,490 B | RGB, no ICC | 1 (external) | PASS | Cairn-trail memory device under-represented (1–2 cairns, not a whole aged trail) | `PENDING` |
| vegetative-field | `vegetative-field.webp` | `8cb93fe3...7ea24ab31` | 1672×941 | 1.776833 (~16:9, −0.053%) | WEBP/RGB | 397,928 B | RGB, no ICC | 1 (external) | PASS | "Robot vacuum" realized as lawn-mower-style rover on curb, not driveway; faint illegible mark on housing | `PENDING` |
| new-signal | `new-signal.webp` | `acc0d3a4...a278876f` | 1672×941 | 1.776833 (~16:9, −0.053%) | WEBP/RGB | 316,384 B | RGB, no ICC | 1 (external) | PASS | **Explicit-rule violation: embedded "MISWAY REGISTER / SILVER" plaque with decorative λ logo** | `PENDING` |
| *(contact sheet)* | `masterframes-contact-sheet.webp` | `5a77159c...8d215927b` | 1968×844 | 2.331754 (grid, not required to be 16:9) | WEBP/RGB | 336,630 B | RGB, no ICC | generated this pass | n/a | Grid of the five final candidates, labels in sheet only | n/a |

All SHA-256 values above are truncated for table width only; untruncated values are in §8.

**Five distinct SHA-256 hashes confirmed among the five masterframes.** Zero technical rework required. One visual-audit finding (New Signal) is an objective, explicit-rule violation rather than a subjective note.

## 12. Owner-review form

| Criterion | Entry | Birth Yard | Older Shadows | Vegetative Field | New Signal |
|---|---|---|---|---|---|
| Composition fidelity | Strong — hero-image continuity achieved | Strong | Strong | Strong | Strong |
| Geography credibility | Matches | Matches | Matches | Matches | Matches |
| Material realism | Matches | Matches | Matches | Matches | Matches |
| Light/weather fidelity | Deviation — brighter than "near-total darkness" | Matches | Matches | Matches | Matches |
| Human-presence fidelity | Matches (none) | Matches | Matches | Matches | Matches (none) |
| Density fidelity | Matches (sparse) | Matches (very high) | Matches (medium/open) | Matches (medium/repetitive) | Matches (variable/sparse) |
| Anomaly/lambda fidelity | Foreground anomaly content (relay/stamp/screen) absent | n/a (dormant, correct) | n/a (correct) | n/a (correct) | **Violates: λ staged as decorative plaque logo, contradicts own "not staged" field** |
| MISWAY identity | Hero-silhouette continuity strong | "EUX GAINENT" signage exact match | n/a | n/a | n/a |
| Canonical vehicle consistency | Consistent | Consistent | Consistent | Consistent | Consistent |
| Cross-frame coherence | Consistent with other 4 | Consistent | Consistent | Consistent | Consistent |
| Prohibited-interpretation check | Clear | Clear | Clear | Clear | **Fails — embedded caption text + museum-placard framing** |
| Visible text/title/border/watermark/branding | None | Minor illegible glyph noise on uniform (cosmetic) | None | Faint illegible mark on robot housing (minor) | **"MISWAY REGISTER" / "SILVER" plaque text — explicit violation** |
| Known defects | Missing foreground apparatus; light too bright | Cosmetic text artifact only | Cairn-trail memory device under-represented | Vacuum→mower substitution; faint mark | Fabricated plaque with embedded text and decorative λ |
| **Owner verdict** | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

**No verdict has been set by this pass.** All five remain `PENDING` — only the owner may set `ACCEPT` / `REWORK` / `REJECT`.

## 13. Unresolved defects (summary)

1. **Entry** — required foreground control-apparatus/anomaly content (relay housing, stamp arm, screen, "NON CONFORME" stamp) is absent; ambient light level exceeds the brief's "near-total darkness."
2. **Birth Yard** — cosmetic-only: illegible AI-generated glyph noise on the enforcement officer's uniform.
3. **Older Shadows** — the cairn-trail memory device (an owner-required, load-bearing detail) is under-represented; only one or two cairns are visible rather than a whole trail spanning mixed generations; no second eroding path or footprint traces visible.
4. **Vegetative Field** — the "robot vacuum crossing a driveway" is realized as a mower-style rover on the curb-side lawn; a faint, likely-generic mark on its housing should be reviewed against the "no third-party branding" rule.
5. **New Signal** — **blocking**: a fabricated "MISWAY REGISTER / SILVER" stone plaque with an engraved λ logo is embedded directly in the frame, violating the no-embedded-text, no-decorative-lambda, and no-museum-panorama rules simultaneously, and directly contradicting this exact frame's own already-accepted "Lambda treatment: not staged in this frame at all" field.
6. **Repository-level, non-blocking, carried over from the previous pass:** the vehicle-as-capsule doctrine text (`docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md` §15 / `docs/DRIFT_3D_ART_DIRECTION.md` §14.2) still does not match the shipped safari-4x4 vehicle actually depicted here and in the runtime; not resolved by this lot.

## 14. Explicit gate result

**`DRIFT-IV-PRE-10` GATE: `REWORK_REQUIRED`.**

- ✅ Five candidate files ingested; all decode; all non-zero size; all five hashes distinct; all comfortably exceed the 1536×864 minimum; aspect ratio 1.776833 (−0.053% from exact 16:9, not treated as a technical failure).
- ✅ Contact sheet generated from the five final candidates; deterministic manifest built independently (§11).
- ❌ **One obvious, explicit-rule visual violation found** (New Signal's embedded plaque — §9.5) — per this lot's own status rule, this alone requires `DRIFT-IV-PRE-10 = REWORK_REQUIRED` rather than `OWNER_REVIEW_REQUIRED`.
- Two further frames (Entry, Older Shadows) carry real, named content-completeness gaps against their own already-accepted briefs; two frames (Birth Yard, Vegetative Field) carry only minor/cosmetic notes.
- **No status is marked `DONE`. No image has received an owner verdict.** `DRIFT-IV-PRE-10 = REWORK_REQUIRED`. `DRIFT-IV-PRE-20` remains `BLOCKED_BY_DEPENDENCY`.
- **Per this lot's own instruction, the accepted frames must be preserved and only the rejected/rework frames iterated** once the owner reviews the findings above — this record does not recommend restarting all five.

No commit, push, or PR performed. `DRIFT-IV-PRE-20` not started.

---

## 16. Final owner decision — all five ACCEPT (this pass — supersedes §15's REWORK/REJECT verdicts, does not delete §0–15)

**Everything in §0–15 above is preserved unchanged.** The owner reviewed the five actual masterframes directly (not only the automated audit findings) and issued an explicit final override: **Entry `ACCEPT`, Birth Yard `ACCEPT`, Older Shadows `ACCEPT`, Vegetative Field `ACCEPT`, New Signal `ACCEPT`.** This section records that decision, the technical-only normalization applied to the four remaining files, and the resulting final gate. **No image was regenerated. No visual content was retouched. No scene element was removed, added, or replaced. The owner's acceptance is not reinterpreted below.**

### 16.1 Four distinctions the owner required kept explicit

1. **Automated visual-audit observations** (§9 and §15.1) — these remain in this record as accurate descriptive findings (e.g. Entry's absent foreground apparatus, Older Shadows' under-represented cairn trail, Vegetative Field's mower-not-vacuum, New Signal's plaque). **They are observations, not blocking defects** — the owner's final acceptance explicitly states they "do not authorize regeneration or artistic alteration."
2. **Final owner artistic acceptance** (this section) — the owner accepts all five images **as produced**, including: Entry's current balance/composition; Birth Yard's current institutional-density reading; Older Shadows' current cairn and memory treatment; Vegetative Field's current autonomous-machine treatment; and **New Signal's current plaque/λ treatment as part of this accepted concept-art reference** — this specific point is recorded verbatim because it directly supersedes §9.5/§15.1's own "blocking" characterization of that same element; it is no longer treated as disqualifying.
3. **Technical normalization** (§16.2 below, and §15.3 for Birth Yard) — a separate, purely technical operation (exact resize, explicit sRGB, WebP re-encode) applied identically to all five files, changing no artistic content.
4. **Runtime implementation requirements** — explicitly out of scope here. **These five images are accepted visual-reference concept art, not literal runtime implementation contracts.** The owner's acceptance does not obligate a future runtime/Build lot to reproduce every incidental AI-generated detail (e.g., the exact plaque wording, the exact mower model, the exact number of cairns) — a future Identity Contract or Build lot remains free to interpret these references at the level the existing Masterframe Briefs and Atlas already specify, per the standing "runtime is authoritative for what is delivered" convention.

### 16.2 Technical normalization — Entry, Older Shadows, Vegetative Field, New Signal (this pass; Birth Yard already normalized in §15.3 and not reprocessed)

Per the owner's explicit instruction, each file's round-1 source bytes were preserved before any processing, then normalized **without any artistic change**: exact resize to 1664×936 (`PIL.Image.LANCZOS`), an explicit sRGB ICC profile embedded (`PIL.ImageCms.createProfile('sRGB')`), re-encoded as WebP (`quality=95, method=6`). No crop, no inpainting, no text removal, no composition change, no object replacement, no new image generated — confirmed by direct visual comparison of each source against its normalized final (below).

| Frame | Preserved source path | Source SHA-256 | Source dimensions | Final SHA-256 | Final dimensions | Final file size |
|---|---|---|---|---|---|---|
| Entry | `masterframes/source/entry.round1-source.webp` | `89041738365e6cd618d044b903bd2aa6c11343d68a4024a3af508ea8d9ef583a` | 1672×941 | `5c5d9dd56b67e951daeb206353f676436a6c0bd9f571d2f66896a7024f82b5f9` | **1664×936** | 275,566 B |
| Birth Yard | `masterframes/source/birth-yard.round1-source.webp` | `4ef1fafdff2a1983d1567c59830d0d32b42bad178f74968f1d5969c1aec980dd` | 1672×941 | `77f207548a3faef1e04d3a4ed9d3ffb48d77dfa32681f0b0cb4b5008459c9e38` (from §15.3, unchanged this pass) | **1664×936** | 461,966 B |
| Older Shadows | `masterframes/source/older-shadows.round1-source.webp` | `c48d3918ad053d67a97b91a191c2a2f4489785ddb87c7948559545318b3484f0` | 1672×941 | `17a8494e88231862c9265af62ad9d7ea1d6674bda590d525f2c9eabf1c30eb41` | **1664×936** | 563,760 B |
| Vegetative Field | `masterframes/source/vegetative-field.round1-source.webp` | `8cb93fe3422096bc40fdf4dbf40a4b05f40fe9031bb3ac0e07a2a3f7ea24ab31` | 1672×941 | `67ee3ecaeed31a13551b4e213750c5408a91e4670bb9f6927ddfe5045ce7ce18` | **1664×936** | 417,684 B |
| New Signal | `masterframes/source/new-signal.round1-source.webp` | `acc0d3a4bf161370934cb69df8103021be63050168513cfe62cd1ac2a278876f` | 1672×941 | `b1447c54b6b78f8f83dce209111bc2b557afa298dc9a9df4d6b4c60d80d8651e` | **1664×936** | 326,132 B |

**Exact processing parameters (identical for all four, and matching Birth Yard's own §15.3 method):**
```python
from PIL import Image, ImageCms
icc_bytes = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
img = Image.open(f"source/{frame}.round1-source.webp").convert("RGB")
resized = img.resize((1664, 936), Image.LANCZOS)
resized.save(f"{frame}.webp", format="WEBP", quality=95, method=6, icc_profile=icc_bytes)
```
- Resample filter: `Image.LANCZOS`. Quality: WebP `quality=95, method=6`. No crop applied to any of the four.
- **Visual comparison, performed by direct inspection of each source against its normalized final:** all four show identical composition, framing, and content to their round-1 originals — the sub-1% non-uniform scale is not visually perceptible in any of them. No element was added, removed, or altered. New Signal's plaque, Older Shadows' single cairn, and Vegetative Field's mower are all still present exactly as in round 1, per the owner's explicit "do not remove text / do not replace objects" instruction.

### 16.3 Final technical validation (all five, independently verified)

| Frame | Decodes | Dimensions | Aspect ratio | Exact 16:9 | Format/mode | Explicit sRGB ICC | Non-zero | SHA-256 |
|---|---|---|---|---|---|---|---|---|
| entry | ✅ | 1664×936 | 1.777778 | ✅ | WEBP/RGB | ✅ (588 B) | ✅ (275,566 B) | `5c5d9dd5...4f82b5f9` |
| birth-yard | ✅ | 1664×936 | 1.777778 | ✅ | WEBP/RGB | ✅ (588 B) | ✅ (461,966 B) | `77f20754...459c9e38` |
| older-shadows | ✅ | 1664×936 | 1.777778 | ✅ | WEBP/RGB | ✅ (588 B) | ✅ (563,760 B) | `17a8494e...f1c30eb41` |
| vegetative-field | ✅ | 1664×936 | 1.777778 | ✅ | WEBP/RGB | ✅ (588 B) | ✅ (417,684 B) | `67ee3eca...5045ce7ce18`† |
| new-signal | ✅ | 1664×936 | 1.777778 | ✅ | WEBP/RGB | ✅ (588 B) | ✅ (326,132 B) | `b1447c54...80d8651e` |

† Untruncated: `67ee3ecaeed31a13551b4e213750c5408a91e4670bb9f6927ddfe5045ce7ce18` (table column width only; full values are in §16.2 above).

**All five files decode successfully, are exactly 1664×936 (mathematically exact 16:9, 1664/16=104, 104×9=936), are WebP/RGB, carry an explicit embedded sRGB ICC profile (588 bytes each, identical profile), are non-zero, and have five distinct SHA-256 hashes.** Zero technical failures.

### 16.4 Contact sheet, regenerated

`docs/evidence/DRIFT-IV-PRE-10/masterframes/masterframes-contact-sheet.webp` was regenerated from the five final, owner-accepted, normalized files (1968×844, WEBP/RGB, SHA-256 `27ed5a6d689ed4dbf39637126d43e3bfb9b6cc490ef2a667e988ab980029dafd`) — same 3×2 labeled-grid method as §10, labels present only in the contact sheet, none of the five individual files altered by this step.

### 16.5 Explicit owner verdict table (final)

| Frame | Round-1 verdict (§15.1, superseded) | **Final owner verdict (this pass)** |
|---|---|---|
| Entry | `REWORK` | **`ACCEPT`** |
| Birth Yard | `ACCEPT WITH TECHNICAL NORMALIZATION` | **`ACCEPT`** (technical normalization already complete, §15.3) |
| Older Shadows | `REWORK` | **`ACCEPT`** |
| Vegetative Field | `REWORK` | **`ACCEPT`** |
| New Signal | `REJECT` | **`ACCEPT`** |

**All five images are now owner-accepted.** The round-1 `REWORK`/`REJECT` verdicts in §15.1 are superseded by this explicit final decision — they remain in this record as accurate history of what was recorded at the time, not as still-active blocking status.

### 16.6 Explicit gate result (final)

**`DRIFT-IV-PRE-10` GATE: `DONE_PENDING_MERGE`.**

- ✅ Five explicit owner `ACCEPT` verdicts recorded (§16.5).
- ✅ All five final images are exactly 1664×936, exact 16:9, WebP/RGB, explicit sRGB ICC, non-zero, five distinct hashes (§16.3).
- ✅ Contact sheet regenerated from the five final accepted files (§16.4).
- ✅ No image regenerated; no visual content retouched; no scene element removed, added, or replaced; the owner's acceptance was not reinterpreted.
- ✅ No runtime, asset, audio, cue, node, collider, camera or geography file changed.
- **`DRIFT-IV-PRE-10 = DONE_PENDING_MERGE`. `DRIFT-IV-PRE-20 = READY_AFTER_MERGE` (not started).**

No commit, push, or PR performed. `DRIFT-IV-PRE-20` not started. (this pass — supersedes §14's provisional gate call, does not delete it)

Everything in §0–14 above is preserved unchanged as the first-round record. This section records the owner's own explicit review of the five round-1 candidates and the technical correction the owner required. **No prior section was edited or removed.**

### 15.1 Exact owner verdicts (verbatim)

| Frame | Verdict | Owner's exact requirements |
|---|---|---|
| **Entry** | `REWORK` | Foreground relay housing, stamp arm and unmanned screen are missing; frame too bright for the accepted near-total-darkness register; preserve the sand safari 4x4 and the rock-sculpted λ exit; regenerate Entry only. |
| **Birth Yard** | `ACCEPT WITH TECHNICAL NORMALIZATION` | Artistic composition accepted; preserve the current image, do not regenerate it unless the visible AI-text artifact cannot be removed without damaging the scene; normalize only (technical, per §15.3). |
| **Older Shadows** | `REWORK` | Distributed memory system insufficient; final image must show a real multi-generation cairn trail (fresh, weathered and lichen-covered stones), the older eroding route, faded equipment and half-filled traces; preserve the current landscape scale, vehicle, hiker, paraglider and raptor; regenerate Older Shadows only. |
| **Vegetative Field** | `REWORK` | Replace the curb-side mower with a credible small autonomous robot vacuum/cleaning robot moving through the driveway; preserve the two near-identical houses, resident routine, sprinkler and satisfaction indicator, and the slight human desynchronization; regenerate Vegetative Field only. |
| **New Signal** | `REJECT` | Remove the fabricated plaque, all embedded explanatory text, and the engraved/decorative λ — no "MISWAY REGISTER", "SILVER" label, or museum-marker object; preserve one believable coastal road geography, the retreating storm behind, gold opening ahead, restrained silver material in the roadside stone, distant city lights and tiny distant beach; regenerate New Signal only. |

**Four frames require regeneration: Entry, Older Shadows, Vegetative Field, New Signal.** Only Birth Yard is retained, subject to technical normalization only — no artistic re-generation.

### 15.2 Technical contract correction (owner-directed)

The owner corrected this lot's own prior technical claim: **1672×941 is not exact 16:9** (it was previously reported at −0.053% deviation and *not* treated as a failure — the owner overrides that leniency). **The PRE-10 contract requires exact 16:9.** All final individual images must now be **exactly 1664×936** (an exact 16:9 multiple: 1664/16 = 104, 104×9 = 936), which exceeds the 1536×864 minimum and preserves more of the generated resolution than a narrower crop would. All final individual images must also: be WebP; decode successfully; carry or be explicitly converted to sRGB; contain no title, number, frame label, caption, watermark or border; and the five final files must have five distinct SHA-256 hashes.

### 15.3 Birth Yard — technical normalization (performed this pass; no artistic regeneration)

Per the owner's explicit instruction, the round-1 Birth Yard candidate was **not** discarded or silently overwritten. A preserved source copy was made before any processing:

```text
docs/evidence/DRIFT-IV-PRE-10/masterframes/source/birth-yard.round1-source.webp   (byte-identical to the round-1 candidate)
```

| | Source (round-1 candidate, preserved) | Final (normalized, this pass) |
|---|---|---|
| Path | `masterframes/source/birth-yard.round1-source.webp` | `masterframes/birth-yard.webp` |
| Dimensions | 1672×941 | **1664×936** |
| Aspect ratio | 1.776833 | **1.777778 (exact 16:9)** |
| Format / mode | WEBP / RGB | WEBP / RGB |
| Embedded ICC profile | none | **sRGB, 588 bytes, embedded explicitly** |
| File size | 442,222 B | 461,966 B |
| SHA-256 | `4ef1fafdff2a1983d1567c59830d0d32b42bad178f74968f1d5969c1aec980dd` | `77f207548a3faef1e04d3a4ed9d3ffb48d77dfa32681f0b0cb4b5008459c9e38` |

**Exact processing performed** (library: Python 3.14 / Pillow 12.2.0):
```python
from PIL import Image, ImageCms
img = Image.open("source/birth-yard.round1-source.webp").convert("RGB")
resized = img.resize((1664, 936), Image.LANCZOS)
icc_bytes = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
resized.save("birth-yard.webp", format="WEBP", quality=95, method=6, icc_profile=icc_bytes)
```
- Resample filter: `Image.LANCZOS` (high-quality, per the owner's instruction).
- Scale factors: 1664/1672 = 0.99522 (x-axis), 936/941 = 0.99469 (y-axis) — a **non-uniform scale of 0.05%**, i.e. well under a sub-pixel difference per typical feature size in this frame; this is the only geometric change applied.
- Quality: WebP `quality=95`, `method=6` (highest-effort WebP encoding).
- Color: explicit sRGB ICC profile embedded (was previously untagged/assumed).
- **No crop was applied.** The 0.05%×0.05% non-uniform resize was judged preferable to a crop, since the deviation from exact 16:9 was already sub-pixel at the previous resolution and a crop would discard real image content for no visual benefit.

**Before/after visual comparison, performed by direct inspection (not assumed):** the normalized `birth-yard.webp` was opened and visually compared against the preserved source — **no meaningful crop or composition change occurred.** Every element (gym storefront with "EUX GAINENT" signage, three athletes, bridge queue, crane, tower skyline, parking-enforcement figure and bicycle, canal reflection, wet quay surfaces) remains in the same relative position and fully legible; the 0.05% non-uniform scale is not visually perceptible. The previously-noted minor cosmetic defect (illegible AI-generated glyph noise on the officer's jacket, §9.2) is unchanged by this purely technical process — per the owner's own instruction, this frame is **not** re-generated to attempt to fix that artifact, since it does not "damage the scene."

**Birth Yard technical status after normalization: exact 16:9 ✅, ≥1536×864 ✅ (1664×936), WebP ✅, explicit sRGB ✅, no title/caption/watermark/border ✅ (unchanged from round-1 visual audit, §9.2), decodes successfully ✅.**

### 15.4 Frames awaiting regeneration (not yet produced)

**Entry, Older Shadows, Vegetative Field and New Signal have not been regenerated by this pass.** This session has no image-generation capability (§0); regenerating these four remains an external/manual action, exactly as it was for the original five. Until new candidates are ingested for these four, their **round-1 files remain in place at their original paths** (unchanged, still 1672×941, still carrying the defects recorded in §9) purely as historical reference — **they are not currently valid final candidates** and must not be read as such; each is superseded by its own `REWORK`/`REJECT` verdict above and awaits a fresh regenerated candidate meeting §15.2's exact-16:9/sRGB requirement.

| Frame | Round-1 file (superseded, left in place for reference only) | Round-1 SHA-256 | Required for round 2 |
|---|---|---|---|
| Entry | `entry.webp` | `89041738365e6cd618d044b903bd2aa6c11343d68a4024a3af508ea8d9ef583a` | New candidate, exact 1664×936, foreground apparatus present, darker register |
| Older Shadows | `older-shadows.webp` | `c48d3918ad053d67a97b91a191c2a2f4489785ddb87c7948559545318b3484f0` | New candidate, exact 1664×936, full multi-generation cairn trail + eroding route + equipment + traces |
| Vegetative Field | `vegetative-field.webp` | `8cb93fe3422096bc40fdf4dbf40a4b05f40fe9031bb3ac0e07a2a3f7ea24ab31` | New candidate, exact 1664×936, credible robot vacuum on driveway (not a mower on the curb) |
| New Signal | `new-signal.webp` | `acc0d3a4bf161370934cb69df8103021be63050168513cfe62cd1ac2a278876f` | New candidate, exact 1664×936, no plaque/text/decorative λ of any kind |

### 15.5 Unresolved defects (updated)

1. **Entry** — awaiting regeneration (missing foreground apparatus; light too bright) — unresolved, per owner `REWORK` verdict.
2. **Birth Yard** — technically normalized this pass (exact 16:9, explicit sRGB); the one cosmetic AI-text artifact (illegible glyphs on the officer's jacket) remains, per the owner's own instruction not to regenerate for it.
3. **Older Shadows** — awaiting regeneration (cairn-trail memory device insufficient) — unresolved, per owner `REWORK` verdict.
4. **Vegetative Field** — awaiting regeneration (mower/location substitution for the robot vacuum) — unresolved, per owner `REWORK` verdict.
5. **New Signal** — awaiting regeneration (fabricated plaque/embedded text/decorative λ) — unresolved, per owner `REJECT` verdict; this frame was rejected outright, not merely marked for rework.
6. **Repository-level, non-blocking, carried over:** the vehicle-as-capsule doctrine text still does not match the shipped safari-4x4 vehicle; not resolved by this lot.
7. **New, this pass:** the previous gate record (§8/§14) described 1672×941 as "not a technical failure" against 16:9. **This leniency is withdrawn by the owner's correction (§15.2).** The exact-16:9 requirement now governs all final individual images; §8/§14 are left unedited as an accurate record of what this pass's own first-round technical read concluded, superseded here rather than silently rewritten.

### 15.6 Explicit gate result (Round 1, final for this pass)

**`DRIFT-IV-PRE-10` GATE: `REWORK_REQUIRED`.**

- ✅ Owner review round 1 recorded: five explicit verdicts (1 accept-with-technical-normalization, 3 rework, 1 reject).
- ✅ Birth Yard technically normalized to exact 1664×936, explicit sRGB, WebP, source preserved and both hashes recorded; visually confirmed no meaningful crop/composition change.
- ❌ Four frames (Entry, Older Shadows, Vegetative Field, New Signal) still require newly generated candidates — none exist yet.
- **`DRIFT-IV-PRE-10 = REWORK_REQUIRED`.** Per the owner's explicit instruction, `OWNER_REVIEW_REQUIRED` must not be set again until: Entry corrected; Older Shadows corrected; Vegetative Field corrected; New Signal corrected; all five final files are exact 16:9; all five are explicitly sRGB; all five pass a fresh visual audit.
- `DRIFT-IV-PRE-20` remains `BLOCKED_BY_DEPENDENCY`.

No commit, push, or PR performed. `DRIFT-IV-PRE-20` not started.
