# DRIFT Evolution — Historical Salvage Inventory

**Status:** ACTIVE SALVAGE AUTHORITY  
**Lot:** DRIFT-EVO-10 — Historical Salvage Inventory  
**Production baseline:** `main@99b343bb13e901df49d9bed530cb00decf1134cd`  
**Protected production route:** `/drift`  
**Evolution route:** `/drift-evolution`

This inventory turns the historical DRIFT branches into a bounded source of reusable capital. It does **not** authorize a wholesale merge, a new global map, or any direct modification of `/drift`.

The classification vocabulary is deliberately simple:

- `KEEP` — already part of the protected artwork; preserve and reuse.
- `EXTRACT` — a technical capability is sufficiently isolated to recover with limited adaptation.
- `ADAPT` — high artistic/technical value, but coordinates, architecture or presentation must be rebuilt around the protected DRIFT world.
- `REFERENCE` — useful method, behavior grammar, test pattern or design lesson; do not port its visible implementation directly.
- `DISCARD` — rejected as a promotion candidate. History remains available, but the implementation must not drive the evolving artwork.

Priorities are `P0` (next / foundational), `P1` (high leverage), `P2` (useful after the P0/P1 foundations), `P3` (only when a local track need justifies inspection).

---

## 1. Executive salvage map

| Priority | Candidate | Source | Decision | What survives | Main risk / restriction |
|---|---|---|---|---|---|
| P0 | Production Entry λ cave | `main` → `src/lib/drift3dLandmarks.ts#entry-lambda-cave` | `KEEP` | Existing Entry composition, location, λ threshold, dawn opening, rock identity | Never replace the production route or topology to improve the cave |
| P0 | Fable mineral tunnel + fractured λ portal | `experiment/drift-greybox-fable` → `FableTunnel.tsx` | `ADAPT` | True cave mesh, displaced rock, thick traversable portal, irregular λ fracture, dust/drips/emergence techniques | Must be fitted to the existing Entry anchor; no Fable world/camera/vehicle/topology import |
| P0 | EUX GAINENT living scene | `main` → accepted runtime | `KEEP` | Owner-accepted living-track proof, cue behavior, semantic screen and scene grammar | Improve around it; do not silently replace accepted identity |
| P1 | Birth Yard local ground haze | Fable → `FableGroundHaze.tsx` | `EXTRACT` | Local haze-shell technique preserving distant depth while keeping port air dense | Recalibrate to current Birth Yard coordinates and atmosphere; avoid a second global fog authority |
| P1 | Zeeland canal water / bridge / barge | Fable → `FableCanal.tsx` | `ADAPT` | Light-linked water reflections, Fresnel/ripples, lifting bridge, slow barge, source-consistent reflection logic | Keep production geography; do not import Fable canal coordinates or world layout |
| P1 | Vegetation wind | historical `d77edcf` | `EXTRACT` | GPU vertex-shader wind idea on instanced vegetation | Compatibility with current materials/instancing must be proven; no visual regression |
| P1 | World-edge continuity | `740e437` + `drift-3d-20c-ocean-cliffs-world-edge-depth-v2` | `ADAPT` | Distant ocean/cliffs/hills/plains/river continuity and outside-bounds depth | Direct terrain port previously rejected; use only as a non-authoritative distant layer if visually superior |
| P1 | Fable sky grammar | Fable → `FableSky.tsx` | `ADAPT` | Dithered horizon, low sun halo, dusk gradient, era blending technique | Must cooperate with current atmosphere authority, not create a second global color script |
| P2 | Entry cinematic veil | Fable → `FablePost.tsx` | `ADAPT` | Tunnel vignette, light grain, emergence flash, scotopic cool tint | Local Entry transition only; reject if it reads as an effect layer rather than physical atmosphere |
| P2 | Track-flavoured diegetic props | historical `6c2998b` | `REFERENCE` | Moored boat, bins, cairn, jars, flamingo, mailbox, owl, driftwood bottle as track-specific ideas | Re-author locally; do not cherry-pick old landmark arrays |
| P2 | Fable secondary-life grammar | Fable → `FableLife.tsx` | `REFERENCE` | Role diversity, district-dependent density, walkers/starers/talkers/sweeper/cart-pusher, slow vans, birds | **Do not reuse the primitive human meshes as foreground art** |
| P2 | PRE-30 shared-kit pilots | `/drift-kit-lab` | `REFERENCE` | GLB loading, skeleton cloning, AnimationMixer, instancing, traffic wheel nodes, Water/Sky integration, quality-tier patterns | Kenney/pilot art remains technical/background only, never hero foreground art |
| P2 | Historical QA / Inspector methods | `67baa64`, PRs #45–#52, archive | `REFERENCE` | Teleport sweep, comparable viewpoints, renderer metrics, route/camera diagnostics | Tooling must remain subordinate to artwork; never let Inspector become the production world |
| P3 | Fable architecture/city/textures | Fable subsystem | `REFERENCE` | Massing, material, sign, city-density and procedural assembly ideas | Inspect only for a named track problem; no wholesale city import |
| P3 | Post-greybox objective test patterns | `archive/drift-post-greybox-20260809` | `REFERENCE` | Some bounded placement, route-clearance and deterministic-data tests | Visible Birth Yard results from this line are rejected; tests do not prove beauty |

---

## 2. P0 — Entry: preserve the existing place, salvage the superior cave technique

### 2.1 What production already owns

The restored map already contains `entry-lambda-cave`. It is **not** missing and must not be reconstructed from zero. The protected scene already establishes:

- the Entry location and route relationship;
- rock massing around the threshold;
- a λ-shaped rock element;
- a dark cave floor;
- a dawn backlight through the exit;
- an immediately recognizable threshold identity.

This is the spatial and artistic anchor.

### 2.2 What Fable proved better

`experiment/drift-greybox-fable/src/components/drift-3d/fable/FableTunnel.tsx` contains a materially richer cave technique:

- a real tunnel shell generated as a sequence of deformed rings rather than a collection of boxes;
- multi-octave displacement giving irregular rock surfaces;
- vertex-color shadowing / painted AO in the cave section;
- a thick cliff wall with a true traversable opening;
- a fractured λ outline whose edges are deliberately noisy, so the rock appears broken rather than vector-cut;
- sufficient wall thickness to create parallax while crossing the opening;
- reusable rock-scatter, dust, drip and emergence-light ideas.

### 2.3 Salvage decision

**`ADAPT`, not cherry-pick.**

The next evolution lot should fork only the Entry presentation needed by `/drift-evolution` and adapt those techniques to the **existing production Entry coordinates, vehicle scale, camera, terrain and topology**.

The Fable peninsula, Fable vehicle, Fable input, Fable camera, Fable audio and Fable global world must stay out of that lot.

**Success condition:** at the same approach and vehicle scale, `/drift-evolution` must retain the recognizable production Entry while making the cave physically deeper, more convincing and more memorable. If it merely becomes more complicated, reject it.

---

## 3. P1 — Birth Yard atmospheric depth and Zeeland water

### 3.1 Local port haze — `EXTRACT`

`FableGroundHaze.tsx` solves a real rendering problem elegantly: global fog can make a port atmospheric but also flatten the far bank. Fable separates the two scales by using a longer global fog plus local vertical haze shells around the port.

Useful principles:

- local haze volume follows the region rather than a global hard-coded fog replacement;
- haze is dense near ground and fades vertically;
- outer shells thin out, avoiding a visible cylindrical wall;
- local haze unmounts / hides at distance;
- distant geography can remain readable while the port keeps its own dirty air.

For `/drift-evolution`, extract the **local-atmosphere pattern**, not Fable's coordinates or global fog values.

### 3.2 Zeeland water, bridge and working canal — `ADAPT`

`FableCanal.tsx` is one of the strongest pieces of historical work. Its useful capital is not the Fable map; it is the relationship between water, light and life:

- water reads the same declared light sources that illuminate the physical scene;
- reflected light streaks are therefore causally tied to actual windows/lamps;
- ripples break those streaks rather than drawing flat neon stripes;
- a slow barge occludes reflections and gives depth;
- a lifting bridge has its own local behavior;
- quay, bridge, water and traffic form one working-place composition;
- the canonical strange element is embedded in reflection behavior rather than pasted on top.

For evolution, preserve current Zeeland placement and track identity, then transplant only the **water/reflection/kinetic-place grammar**.

---

## 4. P1 — Horizon, vegetation and sky

### 4.1 Historical world edges — `ADAPT`

The older world-edge lineage (`92f4bfd` → `740e437`) and the surviving `drift-3d-20c-ocean-cliffs-world-edge-depth-v2` branch both contain useful continuity ideas: ocean, cliffs, hills, plains and river beyond the playable bounds.

The earlier reconciliation correctly rejected a blind architectural port because those components competed with the analytic production terrain. That decision still stands.

What may be salvaged is narrower:

- distant silhouette layering outside the protected movement bounds;
- horizon continuity where the current map visibly ends;
- atmospheric depth objects that never become terrain authority;
- optional river/sea visual continuation only when it aligns with existing geography.

### 4.2 Vegetation wind — `EXTRACT`

The `d77edcf` shader patch is technically attractive because it animates instanced vegetation in the vertex shader rather than creating per-object React animation work. It should be re-tested against the current instanced scatter material, then accepted or rejected on visual coherence and cost.

### 4.3 Fable sky — `ADAPT`

`FableSky.tsx` contains a strong sky-rendering vocabulary: dusty warm horizon, cooler zenith, low-sun halo, subtle horizontal bands and dithering against banding. The implementation also demonstrates smooth era blending.

This must **not** supersede the existing atmosphere model wholesale. Candidate use is an evolved sky presentation driven by the current atmosphere state, preserving one authority for the actual color script.

---

## 5. P2 — Local cinematic transition, life grammar and technical kits

### 5.1 `FablePost.tsx` — `ADAPT`

A lightweight fullscreen shader provides tunnel vignette, grain, scotopic cool tint and an emergence flash without a full post-processing stack. It is worth trying only as a bounded Entry transition. Physical readability remains primary; the effect is rejected if it becomes visibly decorative.

### 5.2 `FableLife.tsx` — `REFERENCE`

The strongest part is behavioral, not graphical. Keep the idea of different people doing different things and district density driving activity. Specifically useful: people walking, staring, talking, sweeping, pushing a cart; slow vans; birds; non-uniform density.

The primitive box/sphere figure geometry is **not reusable foreground art**. The previous failed Birth Yard iterations already proved that technically structured figures can still look like cubes. Reuse behavior grammar only.

### 5.3 `/drift-kit-lab` — `REFERENCE`

PRE-30 remains a valid engineering toolkit:

- real GLB loading;
- skinned skeleton handling;
- `AnimationMixer`;
- instancing;
- background traffic / wheel animation;
- Water.js / Sky.js integration patterns;
- Poly Haven PBR material path;
- quality-tier patterns.

Its prior owner acceptance was technical/architectural only. Pilot assets must not be promoted into foreground art on that basis.

---

## 6. Historical work explicitly rejected for visible promotion

The following remain in Git history but must not drive `/drift-evolution` as visual targets:

| Historical work | Decision | Reason |
|---|---|---|
| Whole Fable 710×710 peninsula / topology replacement | `DISCARD` | This was the exact production-regression mechanism beginning at PR #42. Global replacement destroyed the map we wanted to preserve. |
| Fable Canvas / vehicle / input / camera / audio runtime wholesale | `DISCARD` | Parallel runtime; violates copy-on-write and duplicates already accepted production authorities. |
| PR #42–#44 wholesale geography/routes/sea takeover | `DISCARD` as promotion unit | Individual methods remain reference material, but the combined world replacement is the failed path. |
| PR #61–#67 procedural crowd visual implementations | `DISCARD` | Owner-visible result remained mannequin/cube-like and consumed too much iteration for too little perceptual gain. |
| PR #68 procedural quay/crane batch as final art | `DISCARD` | Technically coherent but not visually validated and returned to primitive-first construction. |
| PR #69 Cesium delivery model as hero art | `DISCARD` | Pipeline lessons may be referenced; selected visual asset did not provide the required leap. |
| PR #70 Khronos `RiggedFigure` as foreground human art | `DISCARD` | Explicit owner rejection: visually read as cubes despite correct skinning/animation. |
| PR #53 global terrain-resolution increase | `DISCARD` | Measured triangle cost rose substantially without sufficient visible coastline gain; already reverted historically. |

`DISCARD` here means “do not promote this implementation or aesthetic solution”. It does **not** delete the branch or prevent reuse of a narrowly isolated test/tooling technique.

---

## 7. Tooling/reference salvage

Some failed-world work remains valuable as tooling:

- `67baa64` historical QA: teleport sweep, single-audio check, cross-zone render-cost capture, mobile viewport checks;
- World Inspector PRs #45–#52: deterministic inspection points, route-aligned teleports, camera telemetry and comparable framing;
- post-greybox tests: deterministic placement, route-clearance, water-depth and data-authority tests where their semantics still apply.

These belong to evolution QA, **not to the artwork hierarchy**. A green test proves an objective invariant, never that a scene is beautiful.

---

## 8. Execution queue after DRIFT-EVO-10

### DRIFT-EVO-20 — Entry Cave Salvage / Fractured Lambda Tunnel — `P0`

Goal: make `/drift-evolution`'s Entry cave visibly superior while retaining the restored map.

Strict scope:

- fork/adapt only the Entry presentation needed by evolution;
- preserve production topology, world bounds, vehicle, controls, chase camera, audio and all non-Entry regions;
- keep the current Entry anchor and recognizable composition;
- adapt Fable's cave-shell geometry, fractured thick λ portal, rock treatment and selected dust/drip/emergence techniques;
- no Fable peninsula, route graph, vehicle, input, camera or global atmosphere import;
- compare `/drift` vs `/drift-evolution` at the same approach and vehicle scale;
- reject/rework if the evolution does not create an obvious perceptual gain.

### DRIFT-EVO-30 — Birth Yard Atmospheric Depth — `P1`

Candidate: extract the local ground-haze technique while keeping current atmosphere authority and geography.

### DRIFT-EVO-40 — Zeeland Working Canal — `P1`

Candidate: adapt Fable's source-consistent water reflections, lifting bridge and barge behavior into the current Zeeland place.

### Later, only after those prove useful

Evaluate world-edge continuity, vegetation wind, sky presentation and track-flavoured props one capability at a time.

---

## 9. Permanent anti-regression rules

1. `/drift` remains protected until an explicit promotion decision.
2. `/drift-evolution` may fork only the smallest authority required by the active visual problem.
3. Historical branches are quarries, never new baselines.
4. A historically impressive component is adapted around the restored map, not used to justify replacing the map.
5. Realism and perceptual coherence beat technical sophistication.
6. Existing accepted content is preserved unless a side-by-side comparison proves a replacement materially better.
7. Objective tests guard behavior and cost; owner/runtime visual review guards art.
8. Failed visual assets remain failed even if their loaders, tests or architecture were technically correct.
