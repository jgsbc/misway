# DRIFT-IV-PRE-40 — Five-macro-world greybox and formal readiness gate

**Status:** `IN_PROGRESS` — implementation, tests, static build, validation scans, and non-visual real-browser checks complete; live-render verification (screenshots, actual driving, transition observation, quality-tier visual scaling) blocked this session by the same confirmed browser-pane/environment limitation already documented in `DRIFT-IV-PRE-30`, not a code defect. See §9.

**Branch:** `drift-iv-pre-40-five-macro-world-greybox-readiness-gate`
**Baseline:** `main@46fff24b088f47c123b4b4feeaeacdaa66e1f1e9` (`feat(drift): build and accept PRE-30 shared-kit pilots` — PR #37, merged)

---

## 0. Preflight confirmed

- Branch and baseline exact match confirmed via `git branch --show-current` / `git log --oneline -5`.
- PR #37 merged (`DRIFT-IV-PRE-30`, owner-`ACCEPT`ed on technical/architectural scope, artistic realism reservation recorded).
- Environment: Node `v24.14.0`, npm `11.16.0`, `next@16.1.7`, `react@19.2.3`, `three@^0.185.0`, `@react-three/fiber@^9.6.1`. Static export, `basePath: "/misway"` in production (`next.config.ts`).
- Working tree at start: clean except one pre-existing unrelated item (`docs/evidence/DRIFT-IV-PRE-20/candidate-previews/quaternius-ultimate-modular-men-preview.jpg` deletion and a new `.gitattributes`, both from the prior `DRIFT-IV-PRE-20` correction pass, out of this lot's own scope and left untouched by this lot's own diff).
- Production `/drift` architecture read in full: `Drift3DClient.tsx` → `Drift3DCanvas.tsx` → `Drift3DScene.tsx`, own zone/HUD/audio/track machinery, canonical sand-safari 4x4 vehicle (`Drift3DVehicle.tsx`), heightfield terrain (`drift3dTerrain.ts`), continuous atmosphere blend (`drift3dAtmosphere.ts`), five-era topology (`drift3dTopology.ts`: `drift3dEras[]` + `drift3dThresholdNode`). None of these files were forked or modified — their exported pure functions and the vehicle component are reused directly (§4).
- Existing lab routes checked: `/drift-3d-lab` is a retired redirect shim to `/drift`; `/drift-lab` is an unrelated 2D map shell; `/drift-kit-lab` is `DRIFT-IV-PRE-30`'s own owner-accepted shared-kit pilot lab, left untouched except for one shared-infrastructure fix that also benefits it (§9.1). A new, isolated route was built: `src/app/drift-greybox-lab/page.tsx`.

Governance updated at start: `DRIFT-IV-PRE-30 = DONE — MERGED (PR #37)`, `DRIFT-IV-PRE-40 = IN_PROGRESS`, `DRIFT-IV-VF-MORNE-00 = BLOCKED_BY_DEPENDENCY` (`docs/ACTIVE_LOT.md`).

---

## 1. Architectural decision — local origins reuse the exact production topology

`src/lib/drift3dMacroWorldConfig.ts`'s own module header states the rationale in full; summarized here because it is the single decision the rest of this lot depends on: the five macro-worlds' local origins are **not** an invented, disconnected coordinate space. They are the exact existing `drift3dTopology.ts` values — `drift3dEras[].center` for Birth Yard/Older Shadows/Vegetative Field/New Signal, `drift3dThresholdNode.position` for Entry:

| Macro-world | Local origin (x, z) | Source |
|---|---|---|
| `entry` | `(-88, 12)` | `drift3dThresholdNode.position` |
| `birth-yard` | `(-74, 22)` | `drift3dEras[0].center` |
| `older-shadows` | `(-32, -52)` | `drift3dEras[1].center` |
| `vegetative-field` | `(0, 8)` | `drift3dEras[2].center` |
| `new-signal` | `(66, -12)` | `drift3dEras[3].center` |

Because `drift3dTerrain.ts` and `drift3dAtmosphere.ts` already carry real, hand-authored heightfield and light-state content at these exact coordinates for these exact eras, reusing them gives this lot's required "high fidelity in scale, composition, elevation, light" **for free**, from already-proven systems — rather than requiring a second, parallel authoring pass. Every raw coordinate in the whole feature is declared exactly once, in this one file; no greybox component hardcodes a raw world coordinate of its own (verified by inspection of all 5 `*Greybox.tsx` files — each only ever reads `getDrift3DMacroWorldConfig(id).localOrigin`).

---

## 2. Route and transition system (pure, tested)

- `src/lib/drift3dMacroWorldConfig.ts` — the 5 canonical macro-world ids/order, per-world `Drift3DMacroWorldConfig` (label, local origin, dressing radius, density targets transcribed verbatim from `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §4, spatial hints transcribed from the accepted Era Contracts/masterframes, spawn offset, realism ratio, and the `dominantGeographyGuardrail` boolean — `true` only for `new-signal`), the exactly-4 `Drift3DMacroWorldTransition` records (§3 travel lengths computed via `Math.hypot` between real origins, not estimated), the no-WebGL fallback card set, and validators for all three (`getDrift3DCanonicalMacroWorldConfigIssues`, `getDrift3DCanonicalMacroWorldTransitionIssues`, `getDrift3DCanonicalMacroWorldFallbackIssues` — all return `[]` against the shipped canonical data).
- `src/lib/drift3dMacroWorldRoute.ts` — a piecewise-linear route built from the 5 waypoints in canonical order; `getDrift3DMacroWorldRouteProjection(point)` is a **pure function of position** (no per-frame accumulated state), so a teleport or reset reconstructs `routeProgress` correctly from position alone — verified live in-browser (§9.2) and by unit test (0 exactly at Entry's own origin, 1 exactly at New Signal's own origin, monotonic through all 5 waypoints). `checkDrift3DMacroWorldBoundary(point)` classifies any position as inside a world's dressing radius, inside the route corridor (half-width 24m), or a genuine boundary violation.
- `src/lib/drift3dMacroWorldReadiness.ts` — the closed `GO` / `GO_WITH_GAPS` / `NO_GO` per-world status vocabulary, the closed 3-value global recommendation vocabulary, and a validator requiring every `NO_GO` to carry at least one recorded blocking risk and every owner verdict to be the literal string `"PENDING"` until an owner overwrites it.
- `src/lib/drift3dMacroWorldGreyboxHarness.ts` — the bounded, mutable-in-place `Drift3DMacroWorldGreyboxStatus` shape (current world, current transition, route progress, position/speed, loaded-resource/error lists, transition/reset/disposal/boundary-violation counters). No unbounded history.
- `src/lib/drift3dMacroWorldPopulation.ts` — per-world Quality-Tier population count functions, wrapping `drift3dQuality.ts`'s existing `scaleDrift3DQualityCount` exclusively (§6), extracted from inline component code specifically so monotonic scaling is unit-testable (a mid-implementation refactor, not the original structure — see the "Problem solving" note in this lot's own working notes).

30/30 unit tests pass across these four files — see §7.

---

## 3. The four transitions — real spatial passages, not menu cuts

| Transition | Travel length | Density change | Atmosphere progression |
|---|---|---|---|
| `entry-to-birth-yard` | **17.2 m** | SPARSE → VERY_HIGH, continuous | the one transition using the explicit 2–3s eye-adaptation "burn" (near-black cave → milky urban daylight) |
| `birth-yard-to-older-shadows` | **85.1 m** | VERY_HIGH → MEDIUM open | gradual register change via the existing continuous atmosphere blend, not a light-level jump |
| `older-shadows-to-vegetative-field` | **68.0 m** | MEDIUM open → MEDIUM repetitive/ordered | clear altitude light → flat, overcast, shadow-less midday light |
| `vegetative-field-to-new-signal` | **69.0 m** | MEDIUM repetitive → VARIABLE, sharp perceptible break ("une rupture nette mais brève", Era Contract) | flat overcast daylight → New Signal's existing silver night state |

Total route length: **239.3 m** (`getDrift3DMacroWorldRouteTotalLength()`). All four use one continuous mounted scene — no streaming boundary, no loading screen between worlds, matching this lot's own "transitions are part of the proof" requirement. Each transition's full record (visibility strategy, loading strategy, fallback behavior, known limitations) is transcribed from its outgoing era's own Era Contract §13 into `DRIFT_3D_MACRO_WORLD_TRANSITIONS` — see that file for the complete verbatim text; not repeated here to avoid an out-of-date second copy.

**Known limitation, honestly recorded per-transition:** each transition's `knownLimitations` field records that the real bureaucracy-register handoff (e.g. "it authorizes" → "it organizes") and Vegetative Field's own Era-Contract-flagged "genuinely open" content gap are track-dramaturgy concerns, deliberately not implemented in this greybox.

---

## 4. Per-macro-world greybox — what was actually built

### 4.1 Entry (`EntryGreybox.tsx`)

Authored primitive geometry (heightfield terrain cannot express an enclosed tunnel): a single unbranching corridor (4.6m × 4m, 20m long), raw `rock_boulder_dry` PBR material (already in the repo via `drift3dTextureFactory.ts`), near-total darkness with one small point light, a λ-shaped glow (a real two-stroke `THREE.Shape`/`ShapeGeometry`, sculpted flush into the ceiling near the exit — never a floating icon), and an unmanned administrative relay (housing + stamp arm + small emissive screen). Density is `SPARSE` on every axis at every Quality Tier — nothing to scale (confirmed: the component takes `qualityTier` as a prop and explicitly discards it with a documented `void qualityTier;`).

### 4.2 Birth Yard (`BirthYardGreybox.tsx`)

Dense canal-side port city: a real `Reflector` canal (12×30m plane, disposable via `.getRenderTarget().dispose()` — a better-disposed choice than `Water.js` for a use case that doesn't need dynamic normal-mapped waves), `InstancedMesh` commercial towers built from the two tracked City Kit forms (`PRE20-A02`, `building-a.glb`/`building-b.glb`) with real vertical-massing height variation (1.4–4.0× scale), an `InstancedMesh` capsule crowd, background traffic reusing `PRE20-B01`'s `sedan.glb` five named nodes via PRE-30's own `sampleDrift3DTrafficPath`/`computeDrift3DWheelRotationDelta` (imported, not duplicated), and a lifting bridge holding a small visible queue (3 bikes + 1 van, primitive geometry). Density targets `HIGH`/`VERY_HIGH`/`VERY_HIGH`/`MEDIUM` (foreground/background/human/behavioral-loops) — the highest of all five worlds, per the Global Art Direction's own density table.

### 4.3 Older Shadows (`OlderShadowsGreybox.tsx`)

The mountain massing itself comes free from the existing production heightfield (already hand-authored peaks/ridges at this era's exact coordinates). Added: one distant small refuge structure ("the mountain itself is the architecture" — masterframe §3), a mixed-generation cairn trail (`InstancedMesh`, real terrain-sampled height via `getDrift3DTerrainHeight`, ~⅓ deterministically marked "weathered"), a second eroding path (a low-opacity ribbon plane), faint footprint traces (4 small darkened circles), one piece of worn equipment, and the `snow_02` (`PRE20-C01`) cold-altitude PBR material patch (diffuse + normal-GL + roughness, same `TextureLoader`/colorSpace convention as `drift3dTextureFactory.ts`) near the peaks. No canonical vehicle replacement; no generic safari decoration.

### 4.4 Vegetative Field (`VegetativeFieldGreybox.tsx`)

A repetitive suburban housing grid (two near-identical house forms — same massing/materials, differentiated only by a trivial per-instance garage-accent color and hedge-height variation, per the accepted masterframe's own "identical-lotissement logic") and one resident mid-routine: a real `character-male-a.glb` (`PRE20-A01`) skinned clone via `SkeletonUtils.clone`, its own `AnimationMixer`, cycling `walk → idle` with **one deliberate desynchronization beat** — the mixer holds for 0.3s at the same point in every 7-second cycle ("the resident fumbles the routine for a single beat, never a machine's exact repeat" — the masterframe's own "what keeps them human, not a robot" requirement, implemented as a literal, code-level mechanism rather than a description). Flat, slightly overcast midday light is the existing `vegetativeFieldState` in `drift3dAtmosphere.ts` — nothing new needed.

### 4.5 New Signal (`NewSignalGreybox.tsx`)

Exactly **one** dominant real geography — a coastal overlook with a headland-road guardrail marker — matching the Era Contract's own binding guardrail (`dominantGeographyGuardrail: true`, the only world carrying it, config-validated in §2). Everything else is deliberately minor: one small warm distant point (a single emissive sphere + point light, "reflection/light/signal/silhouette/weather/trace/memory only, never a second geography"), and the final beach (Étééaooété's own, unchanged) as a small, distant `Water`/`Sky` (`PRE20-C02`, direct `three/examples/jsm` imports, no source copied) — 22×16m, positioned lower and further along the route, explicitly "small, not yet reached." Reflection texture resolution scales with Quality Tier via `scaleDrift3DQualityDimension`. **No claim that final Étééaooété/erasure/weather/ocean art is complete** — this is the same bounded technical proof PRE-30's own Water/Weather/Light pilot already established, reused here in-context rather than rebuilt (the ~15-line procedural normal-map generator is duplicated locally rather than exported from PRE-30's own already-accepted pilot file, to avoid touching accepted code during a different lot).

---

## 5. Vehicle, camera, terrain, atmosphere — reuse boundary

`DriftMacroWorldScene.tsx` mounts the canonical `Drift3DVehicle` component **unmodified**, driven by the exact production pure functions: `stepDrift3DVehiclePhysics`, `createDrift3DVehiclePhysicsState`, `getDrift3DDriveInput`/`getDrift3DDragDriveInput`/`resolveDrift3DDriveInput`, `getDrift3DGroundY`/`getDrift3DTerrainHeight`/`getDrift3DTerrainNormal`, `getDrift3DAtmosphereAt`/`smoothDrift3DAtmosphere`/`createDrift3DAtmosphereState`. `Drift3DScene.tsx`/`Drift3DClient.tsx`/`Drift3DCanvas.tsx` themselves are never imported or forked — this file re-derives only the small mesh/rig glue (`DriftGreyboxTerrainMesh`, `DriftGreyboxAtmosphereRig`, `DriftGreyboxCameraRig`) that `Drift3DScene.tsx` itself keeps as unexported local functions, so it cannot be imported directly. `Drift3DScatterField` is mounted completely unmodified (same as PRE-30's own Nature/Movement pilot).

**The canonical sand-safari 4x4 is the only player vehicle anywhere in this route.** `PRE20-B01`'s Kenney Car Kit sedan appears exclusively as non-collidable, non-player background traffic in Birth Yard (§4.2), reusing PRE-30's own path/wheel math — confirmed by inspection: `Drift3DVehicle` is instantiated exactly once, in `DriftMacroWorldScene.tsx`, and is the only mesh driven by `vehicleRef`/`stepDrift3DVehiclePhysics`.

Movement bounds (`MOVEMENT_BOUNDS`: x ∈ [-125, 110], z ∈ [-90, 45]) are sized to comfortably contain the whole 5-world route plus each world's own effective dressing extent — the terrain plane (280×200m, 112×80 segments) covers the same area, height-sampled from the exact same `getDrift3DTerrainHeight` the production route already uses.

QA-only controls (`teleportRequestRef`, `resetRequestRef`) are plain refs consumed once per frame inside the vehicle-motion `useFrame` callback — never a second physics/input authority, never reachable through normal driving (only through the dev-visible teleport buttons, §6).

---

## 6. Quality Tier (SYS-40) — monotonic scaling, identity preserved

Reuses `getDrift3DQualityProfile`/`scaleDrift3DQualityCount`/`scaleDrift3DQualityDimension` from `drift3dQuality.ts` exclusively — never a second quality authority. Computed, exact per-tier counts (floor-based scaling, `Math.min(Math.max(floor(base*scale), minimum), base)`):

| Count | low (0.4–0.5×) | medium (0.7–0.75×) | high (1×) | base | floor |
|---|---|---|---|---|---|
| Birth Yard towers | 8 | 12 | 16 | 16 | 6 |
| Birth Yard crowd | 16 | 28 | 40 | 40 | 8 |
| Birth Yard traffic | 1 | 2 | 4 | 4 | 1 |
| Older Shadows cairns | 7 | 10 | 14 | 14 | 5 |
| Vegetative Field houses | 6 | 9 | 12 | 12 | 4 |

Monotonic low ≤ medium ≤ high confirmed by unit test for all five counts (`drift3dMacroWorldPopulation.test.mts`). `getDrift3DQualityProfile`'s own `identity` flags (`worldTopology`, `coreNavigation`, `signatureObjects`, `primaryCue`) are asserted `true` at every tier by the same test file — Quality Tier never removes the main route, the canonical vehicle, transition access, or New Signal's dominant geography at any tier, by construction (no greybox component conditions its own mounting, only its instance *count*, on `qualityTier`).

---

## 7. Tests and build

```
npx tsc --noEmit           → PASS, 0 errors
npm run lint               → PASS, 0 errors/warnings
npm test (node --test)     → PASS, 52/52 (was 22/22 before this lot; +30 = macro-world config/route/readiness/population)
npm run build               → PASS, 40/40 static pages (was 39/39 before this lot; +1 = /drift-greybox-lab)
git diff --check            → clean
```

New test files: `drift3dMacroWorldConfig.test.mts` (14 tests — exactly 5 ids in canonical order, no id collision with a PRE-30 pilot id or a track slug, canonical config/transition/fallback validity, guardrail-misplacement/skip/backwards/wrong-count detection), `drift3dMacroWorldRoute.test.mts` (7 tests — 5 waypoints, deterministic projection, progress 0 at Entry/1 at New Signal, monotonic progress, boundary check, out-of-bounds/non-finite progress detection), `drift3dMacroWorldReadiness.test.mts` (7 tests — closed status/recommendation vocabularies, `NO_GO`-without-blocking-risk rejection, non-`PENDING` owner-verdict rejection, missing-world detection), `drift3dMacroWorldPopulation.test.mts` (4 tests — monotonic counts for all 3 populated worlds, Quality Tier identity preservation).

---

## 8. Validation scans (all clean)

- `git diff --check` — clean, no whitespace defects.
- Conflict-marker scan across all changed files — clean.
- `git status --short` — only `docs/ACTIVE_LOT.md` + this lot's own new files changed; **zero `DRIFT-IV-PRE-30` files touched** except the shared audio-suppression fix (§9.1, a distinct, narrowly-scoped correction, not a pilot/visual change).
- Forbidden audio/cue-change scan on changed files — no change to `drift3dCueResolver.ts`, `drift3dAudioClock.ts`, or any track/cue dramaturgy; the only audio-related change is the route-suppression allow-list fix (§9.1).
- Production-route scope scan — clean: no `src/app/drift/**` or `Drift3DScene.tsx`/`Drift3DClient.tsx`/`Drift3DCanvas.tsx` change.
- External-asset candidate scan (`quaternius`/`mixamo`/`sketchfab`/etc.) — only historical, already-rejected references inside `docs/ACTIVE_LOT.md`'s own prior-lot history; no new candidate.
- Tracked archive/executable scan (`.zip`/`.exe`/`.fbx`/`.blend`) — clean.
- `git status --short -- public/` — **empty**. PRE-40 introduces **zero new tracked runtime assets**, reusing PRE-30's existing tracked GLB/texture files (`character-male-a.glb`, `building-a.glb`/`building-b.glb`, `sedan.glb`, `snow_02_*` textures) exactly as-is.
- Static-export bundle isolation: the JS chunk containing the greybox route's own component code is referenced only by `out/drift-greybox-lab/index.html`; `out/drift/index.html`'s own referenced chunks contain zero occurrences of `drift-greybox-lab`, `DriftMacroWorldGreybox`, or `drift3dMacroWorld` (verified by a Node script reading every script `src` referenced from `/drift/index.html` and grepping each resolved chunk file).
- Live network capture on `/drift` (dev server): zero requests to any greybox-specific route/chunk; the request list is unchanged in shape from what PRE-30 recorded for `/drift`.
- basePath verification: static export served from a local Python HTTP server stripping a `/misway` prefix (identical technique to PRE-30) — `/misway/drift-greybox-lab/`, `/misway/drift/`, `/misway/drift-kit-lab/`, `/misway/tracks/` all HTTP 200; `/misway/models/human-crowd/character-male-a.glb` (a PRE-30 asset this lot reuses) HTTP 200, 246,916 bytes — byte-exact with PRE-30's own recorded size.

---

## 9. Real-browser validation — honest account

### 9.1 A real defect found and fixed via DOM/network-level inspection (not visual)

While checking `/drift-greybox-lab` in a fresh browser tab (no prior navigation), a network capture showed `GET /audio/entry-ambient.mp3 → 206 Partial Content`, and direct inspection of the page's `<audio>` element confirmed **`paused: false`, `currentTime` advancing** — the site's global ambient audio was genuinely autoplaying and audible on the greybox lab, in direct violation of this lot's own explicit "no audio autoplay" requirement.

Root cause: `src/components/audio/AudioPlayerProvider.tsx`'s `DRIFT_LAB_ROUTES` allow-list and `src/components/audio/GlobalAudioPlayer.tsx`'s `isDrift3DLabPath` regex — both written before `DRIFT-IV-PRE-30`/`DRIFT-IV-PRE-40` existed — only recognized `/drift`, `/drift-lab`, `/drift-3d-lab` as routes that must suppress the global ambient player. Neither PRE-30's `/drift-kit-lab` nor this lot's own `/drift-greybox-lab` was ever added, so both labs silently inherited the site's default "autoplay ambient audio on every non-home page" behavior. **Verified this also affects the already owner-accepted `/drift-kit-lab`** (checked live: `paused: false` there too, before the fix).

**Fixed** in both files: `DRIFT_LAB_ROUTES` and a new `DRIFT_3D_LAB_ROUTES` array now include `/drift-kit-lab` and `/drift-greybox-lab` alongside the three pre-existing entries; the `GlobalAudioPlayer.tsx` regex was replaced with the same array/`startsWith` check `AudioPlayerProvider.tsx` already used, for a single consistent rule instead of two independently-maintained pattern definitions. Re-verified live after the fix, in fresh tabs, on both `/drift-greybox-lab` and `/drift-kit-lab`: `paused: true`, `currentTime: 0` on load. Re-verified production `/drift` is unaffected (still correctly suppressed, `paused: true`, unchanged behavior) — this fix only **adds** two routes to an existing allow-list, it does not alter `/drift`'s own already-correct behavior. `tsc`/`lint`/`npm test` (52/52)/`npm run build` (40/40) all re-run clean after this fix.

This is recorded here, not filed as a silent side-fix, because it demonstrates the value of doing DOM/network-level real-browser checks even when full visual compositing is blocked (§9.2) — this defect could not have been found by code review alone (both allow-lists *looked* complete; the greybox route's own name was simply never added to either).

### 9.2 Live WebGL rendering could not be observed this session

Diagnostic chain, in order:

1. `computer{action:"screenshot"}` failed on every attempt, on both the greybox lab tab and, as a control, on a plain already-working production `/drift` tab and a plain `/drift-kit-lab` tab: *"the Browser pane is not displayed, so the page is not compositing frames."* Testing a second, unrelated page confirms this is a **pane-wide session limitation**, not something specific to this lot's own Canvas/WebGL content.
2. A direct `requestAnimationFrame` counter probe recorded **0 callbacks in 1.5 real seconds** in the greybox lab tab (consistent with PRE-30's own 0-in-57.7s finding).
3. Consequently, `canvas.width`/`canvas.height` stayed at the browser's un-set default (`300×150`), and every value the render loop itself is responsible for computing — the diagnostics panel's `world`/`route progress`/`position`/`speed` fields, which are polled by a `window.setInterval` **independent of `requestAnimationFrame`** but only ever display whatever `statusRef.current` last held — stayed pinned at their initial values after a QA teleport click, because the `useFrame` callback that would consume the teleport request and recompute those fields never ran. This is not a click-handler failure: the teleport button's `onClick` (a synchronous ref mutation, confirmed present and correctly wired by direct source inspection) fires correctly; only its *consumption*, gated behind the stalled render loop, cannot be observed.
4. What genuinely does **not** depend on the render loop was checked directly and succeeded: the dev harness `window.__drift3dMacroWorldGreybox` mounts with all 13 expected methods; `routeProjectionAt(-88, 12)` (Entry's own origin) returns `routeProgress: 0` exactly, `routeProjectionAt(66, -12)` (New Signal's own origin) returns `routeProgress: 1` exactly — both matching the unit-test expectations exactly, live, in-browser; `validateConfig()`/`validateTransitions()`/`validateFallbackCards()` all return `[]` live; all 5 teleport buttons + Reset + 3 Quality Tier buttons are present in the DOM with correct labels; zero console errors on load; all JS chunks/assets for the route resolve HTTP 200 (§8).

This is the same class of sandboxed-automation-browser compositor block `DRIFT-IV-PRE-30` (and, per that lot's own evidence, `DRIFT-IV-SYS-70`/`DRIFT-IV-BY-EUX-20`/`DRIFT-IV-BY-EUX-30` before it) documented — not evidence of a defect in this lot's own code. Per this lot's own explicit instruction — *"If the environment blocks rendering, stop honestly at IN_PROGRESS. Do not substitute DOM-only validation for owner-ready visual evidence."* — this evidence package does not claim `OWNER_REVIEW_REQUIRED`; see §11.

**Not fabricated:** no FPS, draw-call, triangle, or geometry/texture count is reported anywhere in this evidence package as `MEASURED`; every such field is `null` with a `KNOWN_ENVIRONMENT_LIMITATION` classification in `performance-snapshots.json`. No screenshot file exists in `screenshots/`; see `screenshots/README.md`.

---

## 10. Gate status

`DRIFT-IV-PRE-40 = IN_PROGRESS` — not `OWNER_REVIEW_REQUIRED`. Every completion-gate criterion checkable without a live render is satisfied: exactly 5 macro-worlds in canonical order, exactly 4 transitions forming a connected graph, canonical vehicle used and Kenney Car Kit never replaces it, PRE-30 mechanisms reused (not duplicated), production `/drift` untouched and isolated (bundle + live network), zero new unapproved candidate assets, zero new tracked runtime assets, monotonic Quality Tier scaling with identity preserved, truthful fallback metadata, `tsc`/lint/tests/build all pass, basePath resolution confirmed, all owner verdicts `PENDING`, `VF-MORNE-00` not started, no cue/audio dramaturgy changed (only a route-suppression allow-list fix), realism debt explicitly not claimed resolved. Criteria requiring a live browser render (all 5 worlds actually driven through, all 4 transitions actually observed, real desktop/mobile screenshots, quality-tier/reduced-motion/no-WebGL visual confirmation) are honestly recorded as `KNOWN_ENVIRONMENT_LIMITATION`, not claimed.

No commit, push, or PR performed. `DRIFT-IV-VF-MORNE-00` not started.
