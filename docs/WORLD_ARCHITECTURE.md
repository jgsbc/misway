# WORLD_ARCHITECTURE.md

**Status:** ACTIVE TECHNICAL AUTHORITY  
**Rule:** this document describes the runtime that exists now plus the next bounded migration. It is not a speculative framework specification.

## Runtime truth — after PR #45

Production authority is `main` and `/drift`.

```text
/drift
→ Drift3DClient
→ Drift3DCanvas
→ Drift3DScene
   → Drift3DSceneBase
   → Drift3DRoadNetwork
   → Drift3DWaterSurface
   → canonical chase camera rig

/drift-greybox-lab
→ the same Drift3DClient / Canvas / Scene
→ World Inspector overlay + debug controls
```

There is no separate Greybox runtime anymore. The lab inspects the production world.

The hidden `src/overrides` chase authority and its `tsconfig` redirects were removed by PR #39. Canonical import paths now own the validated vehicle-relative controls, chase camera and driving physics.

The `*Base` split remains a **temporary convergence structure** preserving exact pre-migration implementations beneath canonical facades. It is migration debt, not a second authority.

## Current spatial authorities

### Metric peninsula

PR #42 promoted the useful Fable geography into production:

- world bounds: **710 m × 710 m**;
- 1 world unit ≈ 1 metre;
- folded peninsula spine and x/z macro-regions;
- deterministic massif / basin / coast / bay relief;
- era clusters translated as rigid blocks with **no scale**;
- existing local track offsets, landmarks and prop micro-layout preserved in metres.

`drift3dTopology` is the canonical production topology. `drift3dTopologyBase` is preserved migration input only.

### Terrain

`drift3dTerrain` is the canonical ground-height authority.

Current composition:

```text
Fable-derived peninsula geography
+ translated legacy local terrain detail
+ recovered route altitude field / shoulders
+ authored node flatten pads
= production terrain
```

The old terrain implementation survives as `drift3dTerrainLegacy` only to preserve already-authored local detail during convergence.

### Routes

PR #43 recovered five Fable route authorities:

- Entry → Birth Yard;
- peninsula spine;
- Older Shadows belvedere branch;
- Vegetative Field loop;
- New Signal headland branch.

`drift3dRoutes` owns the deterministic route distance/altitude field. Roads shape terrain locally; they are not merely visual ribbons. Existing deterministic scatter is filtered off the carriageway.

### Water

PR #44 established one `DRIFT_3D_SEA_LEVEL` authority and geographic water queries:

```text
water depth = max(0, seaLevel - canonical terrain height)
```

One sea surface covers the peninsula domain. Terrain depth testing determines where water is visible, so bay/coast boundaries arise from terrain/sea intersection rather than local water rectangles.

The current water shader is intentionally lightweight. Optical sophistication is a Hero Slice concern, not Campaign A foundation work.

## Driving / audio authorities worth preserving

- `Drift3DClient` / `Drift3DCanvas`: production shell, WebGL/reduced-motion handling, inputs/pinch, audio integration and lifecycle — **KEEP**.
- canonical chase controls/camera and vehicle physics: owner-validated basis — **KEEP**.
- `drift3dAudioClock`, cue resolver, signature arbitration and scene lifecycle: proven shared temporal services — **KEEP**.
- EUX GAINENT accepted local dramaturgy/cues/living scene — **KEEP**.
- scatter/instancing, atmosphere and texture/material helpers — **KEEP / EXTRACT only when repeated use proves the need**.

Driving is not yet a formal `DrivingExperience` package. Do not extract it into a platform layer until doing so solves a real reuse problem.

## Fable status

`experiment/drift-greybox-fable` remains an R&D source, not an execution branch.

Already extracted into production:

- peninsula metric geography and regions;
- deterministic macro terrain ideas;
- bay/depth logic;
- route network / route distance field;
- selected debug/inspection lessons.

Still reference-only unless a real need appears:

- track-territory experiments;
- density doctrine;
- visual/immersion experiments;
- unused debug probes.

Do **not** import Fable shells, canvases, cameras, inputs, audio authorities or full runtime.

## World Inspector

PR #45 converted `/drift-greybox-lab` into World Inspector V1 over the exact production runtime.

Current capabilities:

- safe route-centered teleports to Entry and each era;
- local top-down inspection using the same production camera;
- world coordinates / speed / heading / airborne state;
- terrain height / ground Y / sea level / water depth;
- region / era / route distance / route altitude / active and nearest nodes;
- live renderer draw calls / triangles / geometries / textures.

Future Inspector features should be added only when they materially reduce debugging cost: colliders, population layers, quality tier, chunks/LOD, layer toggles and memory probes are candidates, not commitments.

## Level-2 direction — not yet an implementation requirement

Only capabilities proven by real worlds should later move toward:

```text
WORLD CORE
→ WORLD RUNTIME
→ EXPERIENCE
→ WORLD GRAMMAR
→ PROJECT WORLD
→ TRACK TERRITORIES
```

### Core-worthiness gate

Before moving anything toward World Core:

1. needed now;
2. improves a real world;
3. project-independent;
4. stable interface;
5. two demonstrated uses, or a second use that is clearly verifiable.

Otherwise keep it MISWAY-local or driving-local.

## Performance doctrine

Runtime CI now executes on `main` PRs:

```text
npm ci
→ tests
→ lint
→ TypeScript
→ production build
```

The Inspector exposes renderer counts, but **no performance numbers are accepted as current evidence until they are measured on the running world**. Continue to measure FPS, draw calls, triangles, geometries, textures, active instances/chunks and memory growth after traversal as those capabilities become available.

## Immediate technical debt

1. `drift3dBase`, `drift3dVehiclePhysicsBase`, `Drift3DSceneBase`, `drift3dTopologyBase`, `drift3dTerrainLegacy` and `drift3dScatterBase` are temporary migration/recovery structures. Simplify only after behavior/visual parity is proven.
2. `Drift3DSceneBase` still contains the legacy translation-follow camera callback underneath the canonical chase camera. It is functionally superseded but must not be removed before parity is visually verified.
3. legacy 2D prop/scatter population remains preserved local content, not yet a peninsula-scale population grammar.
4. chunks/streaming/LOD are not yet production authorities; do not introduce them until traversal/performance evidence justifies them.
5. the new geography is technically validated but **Kill Gate A remains artistically unverified** because the running `/drift` has not yet been directly inspected and driven in this execution session.

## Next architectural move

Do **not** densify or generalize yet.

First:

```text
run /drift
→ inspect with World Inspector
→ drive the whole recovered geography
→ measure
→ fix geographic/route/scale defects only
→ pass Kill Gate A
```

Only then proceed to the Birth Yard Hero Slice and quality pipeline.
