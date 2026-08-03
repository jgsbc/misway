# DRIFT 3D — Runtime Migration Map

**Status:** `GOVERNANCE RECONCILIATION RECORD` — classifies existing runtime code and assets against `docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`.
**Reconciled under:** `DRIFT-IV-GOV-40`. Documentation only — classifies, does not change, any file listed here.
**Method:** grounded entirely in a direct code inventory (see `docs/DRIFT_3D_GOV40_RECONCILIATION.md` §4 for the summary and full agent findings). Per the Documentation Map's own resolution rule, **code is runtime truth** — this map describes what exists today on `main` (`d2a1c15`), with one explicit exception noted in §0.

Classifications: **KEEP** (correct as-is, no kit migration needed) · **GENERALIZE** (already a de facto shared system; extract/parametrize into a named kit without a behavioral rewrite) · **REWORK** (real but non-reusable; needs redesign to serve more than one track) · **REPLACE** (current approach is a placeholder that a kit should fully supersede) · **REMOVE AFTER MIGRATION** (safe to delete once its replacement kit ships, not before).

---

## 0. A note on branch state (read before using this map)

**Updated, `DRIFT-IV-GOV-40` rebase resolution onto `main@b069d09`:** this map originally classified against `main` (`d2a1c15`), which shipped only the `DRIFT-IV-BY-EUX-20` proof slice. `main` has since advanced: `DRIFT-IV-BY-EUX-30`'s richer V2/V3 rework merged via PR #32 at commit `b069d09` — EUX GAINENT's athletes/stations/screen are **no longer** the simple inline cylinder+sphere build; the richer, extracted, owner-accepted version is now what `main` actually ships. This section's classification is corrected accordingly.

The richer candidate — extracted `EuxGainentAthlete.tsx`/`EuxGainentStation.tsx`/`drift3dEuxGainentMaterials.ts`, archetype-specific motion, and the dynamic screen pipeline this lot's brief refers to as "now-validated" — carries this exact, current classification:

> **Classification: `DONE — MERGED` (superseding the prior `UNMERGED OWNER-VALIDATED CANDIDATE` classification)**
> **Delivered on:** `main`, commit `b069d09d636318bb711694d4c948af851143b947`, PR #32 (`feat(drift): rework EUX GAINENT visuals per owner review #1-2 (V2+V3)`)
> **Historical branch-head commit (context only, no longer current):** `drift-iv-by-eux-30-owner-acceptance` at `c5ca4da847e2dab24f39b50025384f80fe6ca857` — this was the pre-merge branch tip; the content is now on `main` at `b069d09`.
> **Owner status:** the full V2/V3 artistic candidate received the owner's final `ACCEPTED` verdict under `DRIFT-IV-BY-EUX-30`, which is itself `DONE — MERGED`. "EUX GAINENT ACCEPTED." "PROOF SLICE 1 ACCEPTED."
> **This must now be read, cited, and reported as delivered on `main`** — the prior instruction to never do so applied only while the candidate was genuinely unmerged; that condition no longer holds. Every reference to this candidate elsewhere in the GOV-40 documentation set (Track Atlas, Asset Reuse Matrix, this map's own §4) should be read accordingly.

**This map's EUX GAINENT entries (§4) classify against this now-merged V2/V3 build**, since that is what `main` actually ships today. No entry below needs to hedge about "richer version not yet on `main`" — it is.

---

## 1. Confirmed technical baseline

- **Zero glTF/GLB models anywhere in the repository.** Every mesh — vehicle, landmarks, athletes, props, scatter instances, HUD geometry — is built from primitive R3F geometries (`box`/`cylinder`/`sphere`/`cone`/`plane`) authored directly in TS/TSX. `public/models/` does not exist.
- **Zero rigged/skinned meshes, zero `AnimationMixer` usage.** All current motion is per-frame imperative transform assignment, driven by pure dramaturgy-model outputs (`cycleValue`, `phaseProgress`) — never a clip.
- `public/textures/` holds 5 Poly Haven CC0 photo material sets (10 JPGs: `aerial_beach_01`, `brown_planks_07`, `concrete_wall_008`, `red_brick_03`, `rock_boulder_dry`). `public/audio/` holds 27 track/ambient MP3s. `public/images/` holds flat 2D marketing/cover art, unrelated to the 3D scene.
- `package.json`'s only 3D dependencies are `three` and `@react-three/fiber` — no `@react-three/drei`, no Draco/Meshopt/KTX2 tooling, no physics engine, no crowd/rig library.

---

## 2. Generic infrastructure (`SYS-00`–`SYS-70`) — out of scope, already correct

`drift3dAudioClock.ts`, `drift3dSceneLifecycle.ts`, `drift3dCueResolver.ts`, `drift3dSignatureArbitration.ts`, `drift3dQuality.ts`, `drift3dReducedMotion.ts`, `drift3dNoWebGL.ts`, `drift3dEvidence.ts`, and their component-side integration points (`Drift3DEvidenceProbe.tsx`, `Drift3DNoWebGLPath.tsx`, `Drift3DFallback.tsx`, `Drift3DClient.tsx`, `Drift3DCanvas.tsx`).

**Classification: KEEP.** These are the `SYS-*` behavioral/temporal layer, not the asset/content layer this lot's kit architecture addresses. No file here is touched by any kit migration.

---

## 3. World shell and existing shared systems

| File(s) | Current role | Classification | Target kit / rationale |
|---|---|---|---|
| `drift3dTerrain.ts` | Analytical heightfield engine (peaks/ridges/craters/ramps, node flattening, border highlands) | **KEEP** | Already the Terrain/Road Kit (2.1) exactly as-is; only its documentation status changes (now formally named a kit). |
| `drift3dScatter.ts` + `Drift3DScatterField.tsx` | Instanced vegetation/prop archetypes (conifer, broadleaf, bush, rock, grass, deadTree, lamppost, acacia, poppy, cityBlock), ~12 draw calls via `InstancedMesh` | **KEEP** | Already the Vegetation Kit (2.5) exactly as-is; the codebase's strongest existing proof that the instancing convention in `DRIFT_3D_SHARED_KIT_ARCHITECTURE.md` §1.5 works. |
| `drift3dAtmosphere.ts` | Per-region sky/fog/exposure/sun/hemisphere lighting, continuously position-blended | **KEEP**, extend later | Already the Lighting half of the Lighting/Material Kit (2.12) and the mechanism the Transition Kit (2.15) builds on. |
| `drift3dTextureFactory.ts` | 5 photo PBR material sets + procedural `CanvasTexture` generation (windows day/night, plaster, granite, thatch) | **KEEP**, extend later | Already the Material half of the Lighting/Material Kit (2.12); extend the set as new tracks need materials, never rewrite the mechanism. |
| `drift3dAmbience.ts` | 6 synthesized WebAudio diegetic layers, position-driven | **KEEP** | Out of kit scope (audio, not geometry/asset) but already correctly generic — no migration needed. |
| `drift3dVehiclePhysics.ts` | Arcade physics for the single player vehicle; collider aggregation from props/landmarks/scatter | **KEEP** (player half); **GENERALIZE** (traffic half doesn't exist yet) | The player-vehicle physics stay as-is. A new, separate, non-physics-simulated NPC layer is the Vehicle/Traffic Kit (2.10) — additive, not a rework of this file. |
| `Drift3DLandmark.tsx` | Generic renderer turning a literal primitive list into meshes, with camera-occlusion fade and `Reflector` water handling | **KEEP** (renderer); **REWORK** (water) | The primitive-list rendering mechanism stays exactly as-is (Urban Kit 2.2 and Interior Kit 2.3 both keep using it for procedural structures). The inline `water: true` boolean + bare `Reflector` call is real but too thin to serve the ocean's required wave/erasure behavior — see Water Kit (2.6). |
| `Drift3DProp.tsx` | Generic small-primitive-assembly renderer (sign, lamp, speaker, desk, stone, synth, chair, bridge…) | **KEEP** | Already the working core of the Machine/Prop Kit (2.11); no rewrite needed, only a parametrized "moving part" extension (see EUX station entry below). |
| `Drift3DZone.tsx` | Era-region rendering + per-node zone rings/cores/markers | **KEEP** | Generic, correct, out of kit scope. |
| `drift3dLandmarks.ts` | Literal per-landmark primitive-array data, 28 landmarks | **KEEP** (as authoring pattern for hero/unique structures); **feeds** Urban/Interior/Mountain kits' "when NOT to use glTF" case | This is the confirmed data-authoring convention this lot's Urban Kit (2.2) explicitly preserves alongside a new glTF path — not a file to migrate away from. |

---

## 4. Track-specific one-offs — the real migration targets

| File(s) / behavior | Current state | Classification | Target kit / rationale |
|---|---|---|---|
| **EUX GAINENT — audio/cue/lifecycle/signature wiring** (`drift3dEuxGainent.ts`'s pure dramaturgy model, its consumption of `drift3dCueResolver.ts`/`drift3dSignatureArbitration.ts`/`drift3dAudioClock.ts`) | Real, working, owner-approved (Identity Contract + Cue Map), never a second engine | **KEEP** | Explicitly named in this lot's own brief: keep as-is. This is the confirmed correct pattern every future track's Identity/Cue Map/Build cycle should follow — a pure, track-local model consuming the shared `SYS-*` services, never reinventing them. |
| **EUX GAINENT — dynamic screen pipeline** (the V2/V3 build's `CanvasTexture`-per-semantic-state pattern: one combined texture per distinct `(headline, secondaryLines)` state, swapped only on state change, `FrontSide`, `fog={false}`, real animated opacity ramp — the pipeline debugged through this repo's own P0–P0I forensic arc) | `DONE — MERGED` (see §0 — `main`, commit `b069d09`, PR #32; historical branch-head `drift-iv-by-eux-30-owner-acceptance` at `c5ca4da847e2dab24f39b50025384f80fe6ca857`); owner-accepted; delivered on `main`; not yet extracted from `EuxGainentLivingScene.tsx` into a shared kit function | **KEEP the pattern, GENERALIZE the implementation** | This is the confirmed working seed of the Signage/Screen Kit (2.13). No redesign needed — only extraction into a reusable function (facade geometry, content source and state-key as parameters) so the next track's screen doesn't repeat the fog/depth/orientation debugging this one already paid for. |
| **EUX GAINENT — procedural athletes** (V1, superseded on `main`: raw cylinder+sphere primitives, geometry read by array-index from the landmark's own primitive list; V2/V3, now `main`'s own shipped state via PR #32: extracted but still bespoke, index-coupled `EuxGainentAthlete.tsx`, no shared skeleton, no animation clips) | Real, readable at gameplay distance (both versions), but neither is reusable by another track without copy-paste | **REWORK** | Confirmed by the runtime inventory: "nothing here is packaged for reuse... would need real extraction before another track could adopt the same pattern." Migrates to the Human/Crowd Kit (2.8) once that kit's shared skeleton (§1.4) and Animation Kit (2.9) exist. Until then, the current procedural build is not wrong — it is the correct interim choice, matching the Realism Bible's silhouette-first doctrine — just not yet shared infrastructure. |
| **EUX GAINENT — procedural machines/stations** (treadmill/bike/rower archetypes, box+cylinder assemblies, animated moving part) | Real, working, one genuinely reusable *pattern* (archetype + footprint + moving-part behavior), not yet extracted as a parametrized component | **GENERALIZE** | Seeds the Machine/Prop Kit's (2.11) "machine with animated moving part" extension of `Drift3DProp.tsx`. Lower migration cost than the athletes (no skeleton/rig dependency), could move first. |
| **EUX GAINENT — opaque-glass facade treatment** (the storefront window rendered as a fully opaque wall — no `opacity` field on the primitive — with the screen mounted just outside it; this exact configuration was the root of the whole P0-series screen-visibility investigation) | Real, working (screen visibility now confirmed correct given the opaque-wall geometry), but the Identity Contract itself calls this glass *"simultaneously storefront, transparent cage, observation boundary"* — the current material is not literally translucent | **RECONSIDER** (explicitly named by this lot's own brief, not a KEEP/REWORK/REPLACE call this document makes unilaterally) | Flagged, not resolved: a future artistic pass may want genuine transparency/reflection balance for the storefront read the Identity Contract describes, without breaking the depth-occlusion lesson the P0 arc already learned (any translucent treatment must still resolve which face genuinely faces the camera before code changes, exactly as the P0C/P0D fixes did). This is a `DRIFT_3D_ASSET_REUSE_MATRIX.md`-adjacent material question, not a kit-extraction question — recorded here so it isn't lost, not decided here. |
| **EUX GAINENT — local prop construction** (fans, towel conveyor, dispenser: real, perceptible autonomous behaviors, index-coupled to this scene's own refs) | Real, working, matches the Living World Bible's already-approved six-role object doctrine exactly, but implemented as scene-local one-offs | **GENERALIZE** | Seeds the Secondary-Life Kit (2.14) — the doctrine (§7.2/§7.4/§7.5 of the Living World Bible) is already approved and correct; only the implementation needs to become a reusable component family. |
| `FoolfouleCrowd` (`Drift3DEffects.tsx`) | Hard-anchored InstancedMesh marching-figure crowd, `foolfoule` node only | **REWORK** | Real proof that instanced crowd rendering is technically viable at Drift's scale — but the node-hardcoding must be removed before the Human/Crowd Kit (2.8) can serve Birth Yard's `VERY_HIGH` density requirement across all 5 of its tracks, not just one. |
| `StormRain` (`Drift3DEffects.tsx`) | Hard-anchored rain effect, `hold-the-light` node only | **REWORK** | Same shape of problem as `FoolfouleCrowd` — real, working, single-track-hardcoded. Seeds the Weather Kit (2.7). |
| `FloatingParticles` (`Drift3DEffects.tsx`) | Hard-anchored to `ethnic-stick`/`midnight-work` | **REWORK** | Smallest-effort rework of the three `Drift3DEffects.tsx` one-offs — already used by two tracks, closest to proof-on-two-scenes of any current effect. Candidate to migrate first into the Secondary-Life Kit (2.14) or Weather Kit (2.7) depending on final parametrization. |
| Single player vehicle (`Drift3DVehicle.tsx`) | One hand-authored capsule-vehicle mesh, no variation | **KEEP** | Out of scope for the Vehicle/Traffic Kit (2.10), which only adds a *separate* NPC/background layer — the player vehicle's identity (*"a small capsule, not a literal car model"*, `DRIFT_3D_ART_DIRECTION.md` §14.2, surviving gameplay rule) is not touched by any kit. |

---

## 5. What does not exist yet — REPLACE-class gaps (not files to migrate, gaps a kit must fill from nothing)

No current file occupies these roles, so there is nothing to KEEP/GENERALIZE/REWORK — the classification is **REPLACE** in the specific sense of "replace the absence with a first real implementation," to be built only after the `DRIFT-IV-PRE-*` gates in the resequenced backlog:

- A shared humanoid skeleton and animation-clip library (Human/Crowd Kit 2.8, Animation Kit 2.9) — confirmed zero rig/clip infrastructure exists.
- A parametrized water module beyond the bare `Reflector` flag (Water Kit 2.6) — needed before Étééaooété's approved ocean erasure mechanic can be built.
- A background traffic/World Transit layer (Vehicle/Traffic Kit 2.10) — the Integral Systems Architecture names "trains, télécabines, cargos, trafic, oiseaux, avions, météo" (§6.3) but none of it is implemented.
- A KTX2/Meshopt/Draco compression pipeline (all kits, via `DRIFT_3D_SHARED_KIT_ARCHITECTURE.md` §1.2) — confirmed absent from tooling and dependencies entirely.

**`DRIFT-IV-PRE-30` addendum (2026-08-03):** the first three gaps above (a skeleton/`AnimationMixer` path, a real `Water`/`Sky` module, a background traffic layer) now each have a real, owner-`ACCEPT`ed pilot at `/drift-kit-lab` (`UrbanHumanPilot.tsx`, `WaterWeatherLightPilot.tsx`, `NatureMovementPilot.tsx` — see `docs/evidence/DRIFT-IV-PRE-30/`). **This is still not a migration** — none of the three pilots is wired into any track's own scene, none replaces `FoolfouleCrowd`/the bare `Reflector` flag/any EUX GAINENT one-off in production `/drift`, and the owner's own acceptance is explicitly bounded to technical/architectural viability, not final art (`TECHNICALLY ACCEPTED — VISUAL REALISM NOT ACCEPTED AS FINAL ART`). The KTX2/Meshopt/Draco compression pipeline gap remains fully open — none of the three pilots needed it at this scale (≤2.12MB tracked). §6's own standing rule is unchanged: nothing shared is extracted into a track's production scene without proof on that consuming scene itself, which `PRE-30` deliberately did not attempt.

---

## 6. REMOVE AFTER MIGRATION — none yet

No file is classified `REMOVE AFTER MIGRATION` in this pass. Every current one-off (`FoolfouleCrowd`, `StormRain`, `FloatingParticles`, EUX GAINENT's athletes/stations/props) remains the *correct, working, shipped* implementation for its own track until its target kit is built, proven, and that specific track's own Build lot is re-opened to consume it — per `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`'s own standing rule, nothing shared is extracted without proof on the consuming scene itself. This map identifies migration targets; it does not schedule or authorize deleting anything.
