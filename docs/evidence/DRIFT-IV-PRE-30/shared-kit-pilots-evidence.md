# DRIFT-IV-PRE-30 — Representative shared-kit pilots

**Status:** `IN_PROGRESS` — implementation, tests, static build and non-visual real-browser checks complete; live-render verification (screenshots, FPS, disposal-across-switches) blocked this session by a confirmed browser-pane/environment limitation, not a code defect. See §9.

**Branch:** `drift-iv-pre-30-representative-shared-kit-pilots`
**Baseline:** `main@d935144e6cb8a512ede6d72149fa4ead87ce4beb` (contains `DRIFT-IV-PRE-20` merged PR #36, `DRIFT-IV-PRE-10` merged PR #35, `DRIFT-IV-PRE-00` merged PR #34, `DRIFT-IV-GOV-40` merged PR #33, `DRIFT-IV-BY-EUX-30` merged PR #32 — all delivered)

---

## 0. Preflight confirmed

- Branch and baseline exact match confirmed via `git branch --show-current` / `git log`.
- PR #36 merged (`docs(drift): complete PRE-20 licensed asset registry`).
- Working tree: two pre-existing, out-of-this-lot's-scope items found and deliberately left untouched — `public/audio/entry-ambient.mp3` (modified) and `public/audio/gasnine.mp3` (new, untracked). Confirmed via `git log main..HEAD` that this branch has zero commits beyond `main`, so this state predates this lot's own work. `public/audio` is explicitly protected scope for this lot; neither file is referenced anywhere in the diff this lot produced.
- Environment: Node `v24.14.0`, npm `11.16.0`, `next@16.1.7`, `react@19.2.3`, `three@^0.185.0`, `@react-three/fiber@^9.6.1`, no `@react-three/drei` installed. `next.config.ts`: static export, `basePath: "/misway"` in production.
- No test framework/config existed in the repository before this lot (no jest/vitest, no `.github` CI workflow). Resolved by using Node's own built-in `node --test` against `.mts` files, with a tiny project-local ESM resolve hook (`scripts/drift3d-test-alias-hook.mjs`) so `@/lib/...` path-alias imports work outside webpack — **zero new npm dependency**.
- `GLTFLoader`, `Water.js` and `Sky.js` all ship inside the already-installed `three` package's `examples/jsm/` — zero new dependency needed for glTF loading or the water/sky pilot.
- Existing internal lab routes checked and found unsuitable for reuse: `src/app/drift-3d-lab/page.tsx` is a **retired redirect shim** to production `/drift` (*"Le lab 3D est passé en production sur /drift"*), not a lab. `src/app/drift-lab/page.tsx` is an older, unrelated 2D map shell (`DriftMapClient`, its own separate `drift-map` component family). Neither is the "established internal 3D-lab pattern" this lot's brief asks to check for — a new, isolated route was built instead, following the repository's real routing convention (`src/app/<route>/page.tsx`, not the brief's own illustrative `app/<route>/page.tsx`).

Governance updated at start: `DRIFT-IV-PRE-20 = DONE — MERGED (PR #36)`, `DRIFT-IV-PRE-30 = IN_PROGRESS`, `DRIFT-IV-PRE-40 = BLOCKED_BY_DEPENDENCY` (`docs/ACTIVE_LOT.md`).

---

## 1. Asset acquisition and provenance

Re-downloaded the exact `DRIFT-IV-PRE-20` sources and verified every hash against the recorded evidence before extracting anything — no `SOURCE_MISMATCH`:

| Registry id | Source | Recorded PRE-20 SHA-256 | Re-downloaded SHA-256 | Match |
|---|---|---|---|---|
| `PRE20-A01` | `kenney_mini-characters.zip` | `9e1d48e6...02d0999` | `9e1d48e6...02d0999` | ✅ |
| `PRE20-A02` | `kenney_city-kit-commercial_2.1.zip` | `f8b09b08...b35276b` | `f8b09b08...b35276b` | ✅ |
| `PRE20-B01` | `kenney_car-kit.zip` | `fac7daca...4fdf3d0c4` | `fac7daca...4fdf3d0c4` | ✅ |
| `PRE20-C01` | `snow_02_diff_1k.jpg` | `523a4e69...e9009a` | `523a4e69...e9009a` | ✅ |
| `PRE20-C01` | `snow_02_nor_gl_1k.jpg` | `9495ec68...ba81f810` | `9495ec68...ba81f810` | ✅ |
| `PRE20-C01` | `snow_02_rough_1k.jpg` | `b6dea803...f30f1cb75` | `b6dea803...f30f1cb75` | ✅ |

Quarantined under `.tmp/drift-pre-30/` (gitignored, never tracked). Inspected before extraction with an independent, standard-library-only Python glTF parser (same approach as `DRIFT-IV-PRE-20`) — re-confirmed: `character-male-a.glb` (7-joint skeleton × 2 skins, 32 clips), `building-a.glb`/`building-b.glb` (1 node/1 mesh each, no skin), `sedan.glb` (5 flat sibling nodes: `body`, `wheel-front-left`, `wheel-front-right`, `wheel-back-left`, `wheel-back-right`, each with its own local `translation` — no parent/child nesting).

**Discovery this lot:** every Kenney GLB references its colormap texture as an **external** glTF image URI (`Textures/colormap.png`), not embedded. The texture must ship in a `Textures/` sibling directory next to its GLB for `GLTFLoader`'s automatic relative-URL resolution to work — confirmed by placing them there and curl-verifying resolution under the production basePath (§7).

Minimum files selected per §"Tracked asset limit": one representative character GLB, two building forms (not the full ~19-form pack), one representative vehicle GLB, the three 1K snow_02 maps — no source ZIPs, no FBX/BLEND, no redundant format variants, no 2K/4K textures.

**Total tracked runtime asset size: 2,219,999 bytes ≈ 2.12 MB — well under the 30MB limit.**

Full source-to-final hash mapping: `docs/evidence/DRIFT-IV-PRE-30/asset-runtime-manifest.json`. Per-kit provenance READMEs: `public/models/human-crowd/README.md`, `public/models/urban/README.md`, `public/models/vehicle-traffic/README.md` (the `snow_02_*.jpg` textures follow the repository's existing flat `public/textures/` convention, matching the 5 pre-existing Poly Haven sets, which also carry no per-file README — provenance recorded here instead).

---

## 2. Shared configuration/asset library (pure, tested)

- `src/lib/drift3dKitAssets.ts` — the closed 10-entry asset manifest (path, registry id, sha256, size), `getDrift3DKitAssetUrl()` (basePath-prefixed), and `getDrift3DKitAssetManifestIssues()` — validates kind/path/sha256-shape/size **and now membership in the exact 4 accepted registry ids** (a real bug this lot's own tests caught: the first version only checked `PRE20-<letter><NN>` shape, which would have silently accepted `PRE20-A03`/Quaternius; fixed to an explicit allow-list before evidence was written).
- `src/lib/drift3dKitPilotConfig.ts` — pilot ids, fallback-card metadata, per-pilot Quality-Tier count mapping (wrapping the existing `drift3dQuality.ts`, never a second quality authority), deterministic traffic-path sampling, wheel-rotation math, and bounded water-preset validation.
- `src/lib/drift3dKitGltfLoader.ts` — `GLTFLoader.loadAsync` wrapper (no module-level GPU-resource cache — see §8 disposal rationale) and a generic `disposeDrift3DKitObject3D()` traversal-dispose helper.

22/22 unit tests pass — see §6.

---

## 3. Pilot 1 — Urban / Human

**File:** `src/components/drift-3d/kits/UrbanHumanPilot.tsx`

Loads `character-male-a.glb` (`PRE20-A01`) once, then builds N independent skinned clones via `SkeletonUtils.clone` (plain `Object3D` cloning would share bind skeletons across instances — this is the correct multi-instance technique for a skinned rig). Each clone gets its own `THREE.AnimationMixer` and its own `Map<clipName, AnimationAction>` cache, so switching `idle → walk → interact-right` (3.2s hold, 0.4s crossfade) never creates a duplicate action for an already-used clip — deterministic by construction, not merely by trusting three.js's own internal cache. City Kit background massing (`PRE20-A02`, `building-a.glb`/`building-b.glb`) is instanced per form via `InstancedMesh`, one shared material per form, deterministic seeded placement (same `hash()` technique as `drift3dScatter.ts`). A silhouette-only `InstancedMesh` capsule crowd covers distant density. No React component per crowd or building instance.

Quality Tier (`getDrift3DUrbanHumanCounts`) scales `animatedCharacterCount` (base 3), `silhouetteCrowdCount` (base 24) and `backgroundBuildingCount` (base 18) monotonically — unit-tested.

**Guardrails respected:** Kenney's low-poly look is never claimed as final human/foreground art; City Kit stays background/distant massing; EUX GAINENT untouched.

---

## 4. Pilot 2 — Nature / Movement

**File:** `src/components/drift-3d/kits/NatureMovementPilot.tsx`

Mounts the existing `Drift3DScatterField` **completely unmodified** — real reuse of the production Vegetation Kit, not a rebuild. Loads `sedan.glb` (`PRE20-B01`) once; its 5 named nodes (`body` + 4 wheels) are resolved by exact string match and rendered as 5 `InstancedMesh`es (one per part), geometry/material shared across every vehicle instance. Vehicles follow a deterministic closed ellipse (`sampleDrift3DTrafficPath`), staggered per-vehicle start offset for spread; wheel rotation is `distance / radius` (`computeDrift3DWheelRotationDelta`) accumulated from the same nominal speed used to derive the loop's duration, so path speed and wheel speed are the same number by design. Vehicle heading = path tangent. No rigid-body/collision simulation, no interaction with the player's own physics.

Quality Tier (`getDrift3DNatureMovementCounts`) scales `trafficVehicleCount` (base 5) monotonically — unit-tested.

**Guardrails respected:** not Older Shadows/Vegetative Field final art; no Kenney Nature Kit; the canonical sand safari 4x4 is never loaded, replaced, or referenced.

---

## 5. Pilot 3 — Water / Weather / Light

**File:** `src/components/drift-3d/kits/WaterWeatherLightPilot.tsx`

Direct imports — `import { Water } from "three/examples/jsm/objects/Water.js"`, `import { Sky } from "three/examples/jsm/objects/Sky.js"` — no source copied, no new npm dependency, no second three.js version or renderer. Two bounded technical presets (`calm-canal-seed`, `rough-open-water-seed`) toggle `distortionScale`/wave-time-multiplier/sun elevation on the existing material uniforms, never rebuilding the mesh. `snow_02` (`PRE20-C01`) diffuse/normal-GL/roughness wired into a `MeshStandardMaterial` via the exact same `TextureLoader` + colorSpace/wrap convention `drift3dTextureFactory.ts` already uses for the 5 existing Poly Haven sets, on a neutral test plane. Reflection render-target resolution scales via `scaleDrift3DQualityDimension(reflectionResolutionScale)`.

`Water.js` requires a `waterNormals` texture as a constructor option; rather than introduce a new third-party normal-map asset (which would reopen the candidate search this lot is explicitly forbidden from doing), a small procedural `CanvasTexture` normal map is generated in-code, matching the project's own established procedural-canvas convention (`drift3dTextureFactory.ts`'s `paintNoise` pattern).

**Known upstream limitation, honestly documented:** `Water.js`'s internal reflection `WebGLRenderTarget` is a `const` inside the constructor's closure — confirmed by reading the installed `node_modules/three/examples/jsm/objects/Water.js` source — with **no public accessor or `dispose()` method anywhere in the class**. This pilot disposes everything it owns directly (geometry, material, the procedural normal texture, the Sky mesh and its material) on unmount, but cannot call `.dispose()` on a render target it was never given a reference to. This is an upstream three.js addon limitation, not a gap in this pilot's own code, and is not fixable without copying/forking `Water.js`'s source — which this lot's own brief explicitly discourages except when "technically unavoidable." Flagged here rather than silently claimed as fully disposed.

**Guardrails respected:** does not implement Étééaooété or its erasure mechanic; does not complete the Water Kit; no final ocean/weather/snow-line art claimed; no giant symbolic sun.

---

## 6. Tests and build

```
npx tsc --noEmit         → PASS, 0 errors
npm run lint              → PASS, 0 errors/warnings
npm test (node --test)    → PASS, 22/22
npm run build              → PASS, 39/39 static pages (was 38/38 before this lot; +1 = /drift-kit-lab)
git diff --check           → clean
```

Test coverage (`src/lib/drift3dKitPilotConfig.test.mts`, `src/lib/drift3dKitAssets.test.mts`): pilot id validation, canonical fallback-card validation (+ missing/duplicate/empty-field detection), monotonic Quality Tier counts for all three pilots, elliptical path position/unit-tangent/wrap-around determinism, wheel-rotation math (+ all-invalid-input-returns-0 cases), bounded water-preset validation (+ out-of-bounds and missing-preset detection), asset-manifest validation (+ invalid kind/path/sha256/size/registry-id/duplicate-id detection) including the specific "PRE-20-shaped-but-not-accepted candidate must be rejected" case that caught the real allow-list bug described in §2.

---

## 7. Bundle isolation and basePath (real, measured)

- **Static export chunk analysis:** the JS chunk containing the pilot asset manifest strings (`human-crowd`, `snow_02_diff`, …) is referenced only by `out/drift-kit-lab/index.html` — not by `out/drift/index.html` or `out/index.html`.
- **Live network capture** on `/drift` (dev server): zero requests to `/models/**` or `/textures/snow_02_*`; only the 5 pre-existing Poly Haven sets requested, exactly as before this lot.
- **basePath verification:** static export served from a local HTTP server that strips a `/misway` prefix (matching `next.config.ts`'s real production `basePath`), then every tracked asset and relevant route curl-checked:

| Path | HTTP | Bytes |
|---|---|---|
| `/misway/models/human-crowd/character-male-a.glb` | 200 | 246,916 |
| `/misway/models/human-crowd/Textures/colormap.png` | 200 | 8,706 |
| `/misway/models/urban/building-b.glb` | 200 | 106,408 |
| `/misway/models/urban/Textures/colormap.png` | 200 | 11,002 |
| `/misway/models/vehicle-traffic/sedan.glb` | 200 | 172,216 |
| `/misway/models/vehicle-traffic/Textures/colormap.png` | 200 | 12,371 |
| `/misway/textures/snow_02_diff_1k.jpg` | 200 | 325,497 |
| `/misway/drift-kit-lab/` | 200 | — |
| `/misway/drift/` | 200 | — |
| `/misway/tracks/` | 200 | — |
| `/misway/models/does-not-exist.glb` (sanity check) | 404 | — |

Every byte count matches the recorded hash-verified source size exactly. `GLTFLoader`'s relative `Textures/colormap.png` resolution is confirmed correct under the prefixed path.

---

## 8. Disposal design

No module-level GPU-resource cache exists anywhere in this lot's code — each pilot mount performs its own `GLTFLoader.loadAsync` call (the browser's own HTTP cache avoids a real repeated network fetch of these static, immutable files) and owns/disposes exactly the geometries/materials/textures/mixers it created, via a `useLayoutEffect` cleanup that fires on every React unmount. Because each pilot is a structurally distinct component conditionally rendered in the same slot, switching pilots is a full React unmount of the previous one (not an update) — disposal fires by construction on every switch, not by a manually-wired "reset" call. This design deliberately avoids ever disposing a GPU resource a still-mounted consumer might depend on, at the cost of re-parsing a small (100–250KB) GLB JSON payload on every switch back to a previously-visited pilot.

The one exception is architectural, not a gap in this design: `Water.js`'s internal render target (§5) has no public disposal path at all.

---

## 9. Known limitation — live browser verification

Real WebGL rendering could not be observed this session. Diagnostic chain, in order:

1. `computer{action:"screenshot"}` failed every attempt: *"the Browser pane is not displayed, so the page is not compositing frames."*
2. A direct `requestAnimationFrame` counter probe recorded **0 callbacks in 57.7 real seconds** in the same tab — including after a real, focus-gaining click — confirming the render loop itself never started, not merely a screenshot-tool issue.
3. Claude in Chrome (the real-Chrome fallback that recovered this exact class of problem for `DRIFT-IV-SYS-70`/`DRIFT-IV-BY-EUX-20`/`DRIFT-IV-BY-EUX-30`) reported *"extension isn't reachable"* on two separate connection attempts this session.
4. The user was asked how to proceed (open the Browser pane and retry / connect Claude in Chrome and retry / proceed with honest limitation) and explicitly chose to proceed with honest limitation documentation.

This is the same class of sandboxed-automation-browser compositor block this project has documented multiple times before — not evidence of a pilot defect. What **was** genuinely verified without needing a live render: the full React/DOM state layer (pilot switching, quality-tier selection, water-preset selection — confirmed via native `.click()` + `aria-pressed`/harness inspection in separate tool calls), zero console errors across all pilot switches and `/drift` + `/tracks` smoke visits, zero pilot-asset network leakage into production routes, static-export bundle isolation, basePath-prefixed asset/route resolution (§7), and mobile-viewport structural layout (375×812: `<main>` fills the viewport exactly, 0 of 8 visible buttons overflow horizontally).

**Not fabricated:** no FPS, draw-call, triangle, geometry, or texture count is reported anywhere in this evidence package as `MEASURED` — every such field is explicitly `null` with a `KNOWN_ENVIRONMENT_LIMITATION` classification in `performance-snapshots.json`. No screenshot file exists in `screenshots/`; see `screenshots/README.md` for the same honest account instead of a placeholder image.

---

## 10. Global audio (unrelated pre-existing behavior, checked)

`entry-ambient.mp3` autoplays on page load — confirmed identical on `/about`, a route this lot never touched, so this is pre-existing, site-wide entry-audio behavior (unrelated to the Drift catalogue), not something `/drift-kit-lab` or any pilot triggers. No Drift catalogue track is played by any code this lot added.

---

## 11. Gate status (provisional, this pass — superseded by §12's owner live review, not deleted)

`DRIFT-IV-PRE-30 = IN_PROGRESS` — not yet `OWNER_REVIEW_REQUIRED`. Every completion-gate criterion checkable without a live render is satisfied (asset provenance/bounding, tracked-size limit, bundle isolation, basePath resolution, TypeScript/lint/build/tests, no unapproved candidate — including the allow-list fix caught by this lot's own tests, canonical vehicle/topology/audio untouched, `PRE-40` not started, owner verdicts `PENDING`). Criteria requiring a live browser render (pilots actually running; real screenshots; live disposal/resource-accumulation confirmation) are honestly recorded as `KNOWN_ENVIRONMENT_LIMITATION`, not claimed.

**Next step (as understood at the time this section was written):** re-run the real-browser validation pass (desktop + mobile screenshots of all 3 pilots, switch cycle, reduced-motion, no-WebGL) once the Browser pane can composite frames or Claude in Chrome is connected, then re-evaluate against the 25-point completion gate.

No commit, push, or PR performed. `DRIFT-IV-PRE-40` not started. **This gap was closed directly by the owner's own live local review — see §12.**

---

## 12. Owner live review — final decision (this pass, supersedes §11's provisional gate, does not delete §0–11)

**Everything in §0–11 above is preserved unchanged as the implementation and environment-limitation record.** The owner personally reviewed the three pilots in `Drift Kit Lab` on their own local machine — a session this document's author (the agent) did not run or observe — and issued an explicit final verdict, resolving the live-verification gap recorded in §9/§11 directly, by the owner's own first-hand observation rather than by any further agent-side browser attempt.

### 12.1 Evidence-type distinction (exact, per the owner's own instruction)

This evidence package now contains four genuinely distinct categories of claim. They are kept explicitly separate — nothing in one category is used to inflate another:

| Category | Source | What it covers | Where recorded |
|---|---|---|---|
| **Automated tests and static validation** | This agent, this repository, this session | `tsc`/`lint`/`npm test` (22/22)/`npm run build` (39/39 pages)/`git diff --check` — all `MEASURED` | §6 above |
| **Browser/runtime observations, implementation session** | This agent, the sandboxed Browser pane, this session | DOM/state-layer clicks, console/network checks, static-export bundle isolation, basePath-prefixed HTTP checks, mobile viewport layout — all `MEASURED`; live WebGL render, FPS, draw calls, disposal-across-switches — all `KNOWN_ENVIRONMENT_LIMITATION` | §7–§9 above |
| **Direct owner live review** | The owner, their own local machine, a session outside this agent's own tool access | The verbatim verdict below — `OWNER_LIVE_REVIEW`, the highest-authority classification available: a first-hand human observation of the actual running pilots, not a proxy or an automated measurement | This section |
| **Graphical realism status** | The owner's own artistic judgment, stated in the same review | Explicitly **not** accepted as final art — see §12.4 | This section |

### 12.2 Verbatim owner statement

> *"Everything is OK in Drift Kit Lab, although it is severely lacking in realistic graphics."*

### 12.3 Owner verdicts — technical/architectural acceptance, exactly three, exactly `ACCEPT`

| Pilot | Owner verdict | Scope |
|---|---|---|
| `URBAN / HUMAN` | **ACCEPT** | Technical/architectural |
| `NATURE / MOVEMENT` | **ACCEPT** | Technical/architectural |
| `WATER / WEATHER / LIGHT` | **ACCEPT** | Technical/architectural |

**These are technical and architectural acceptances only.** They confirm the three representative shared-kit pilot paths are viable, exactly as scoped by this lot's own brief — not an acceptance of final visual art (§12.4).

**Urban / Human — exact technical proof accepted:** real GLB loading; a real skeleton + `AnimationMixer` path; animation (clip) switching; background urban massing; Quality Tier scaling; shared-kit architecture viability.

**Nature / Movement — exact technical proof accepted:** reuse of the existing vegetation architecture (`Drift3DScatterField`, unmodified); background traffic path following; named wheel-node animation; deterministic movement; Quality Tier scaling; separation from player vehicle physics.

**Water / Weather / Light — exact technical proof accepted:** `Water.js` and `Sky.js` runtime integration; bounded technical presets; snow diffuse/normal/roughness material path; Quality Tier and reduced-motion behavior; reusable technical substrate viability.

### 12.4 Mandatory artistic reservation — formal, non-final-art guardrail

**`TECHNICALLY ACCEPTED — VISUAL REALISM NOT ACCEPTED AS FINAL ART`**

The current pilots severely lack realistic graphics compared with the five owner-accepted `DRIFT-IV-PRE-10` masterframes. **This observation is explicitly not a request to rework `PRE-30`.** Its precise, binding meaning:

- no Kenney visual style is accepted as final Drift art;
- no low-poly human, vehicle or building is approved for foreground final use;
- the pilots prove architecture and reusable mechanisms only;
- current models and scenes remain technical references, placeholders, background-massing candidates, or transformation inputs;
- future production lots must replace, retexture, transform, or substantially enrich them to meet the Realism Bible and the accepted masterframes;
- `DRIFT-IV-PRE-40` must not present these pilot scenes as the final artistic direction;
- no accepted artistic authority (`DRIFT_3D_REALISM_BIBLE.md`, the five `PRE-10` masterframes, any Era Contract, any approved Identity Contract or Cue Map) is weakened by this technical acceptance.

**Remaining realism gap, stated precisely:** every tracked pilot asset (`character-male-a.glb`, `building-a.glb`/`building-b.glb`, `sedan.glb`, their shared 512×512 colormaps) is Kenney's own low-poly, flat-shaded CC0 register — the same register already flagged as a foreground/hero mismatch at every point it was evaluated in `DRIFT-IV-PRE-20` (§6.1/§6.2/§6.7 of that lot's own registry) and now confirmed visually insufficient by the owner's own direct inspection. The `snow_02` PBR material (Poly Haven, photo-sourced) is the one asset in this pilot set that already matches the Realism Bible's photoreal register — the gap is specifically in the Kenney-sourced geometry/texture set, not the material pipeline itself.

### 12.5 No screenshot files supplied with this decision — stated honestly, not fabricated

The owner's review was performed live, locally, in their own browser session. **No screenshot files were supplied alongside this final decision, and none are fabricated to stand in for them.** `docs/evidence/DRIFT-IV-PRE-30/screenshots/` remains exactly as recorded in §9/`screenshots/README.md` — empty of images, with the prior session's honest diagnostic preserved. If canonical screenshot files from the owner's own reviewed session become available later, they should be added to that directory and cross-referenced here; until then, the owner's verbatim statement (§12.2) is the record of what was seen.

### 12.6 No pilot visual change performed in this pass

Per the owner's own explicit instruction, no pilot component, asset, or scene was modified in this pass — this section only records the review and its governance consequences. Confirmed via `git status`/`git diff`: no file under `src/components/drift-3d/kits/`, `src/lib/drift3dKit*`, or `public/models/**` changed between the end of the implementation pass and this section being written.

### 12.7 Final gate result

**`DRIFT-IV-PRE-30 = DONE_PENDING_MERGE`.** All three pilots owner-`ACCEPT`ed on their exact technical/architectural scope; the artistic reservation recorded as a formal, binding guardrail on every current pilot asset; no accepted artistic authority reopened or weakened. **`DRIFT-IV-PRE-40 = READY_AFTER_MERGE`, not started**, and bounded by this section's own guardrails (§12.4) in addition to the technical authorization boundaries already recorded in `docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §14.4.

No commit, push, or PR performed by this pass. `DRIFT-IV-PRE-40` not started.
