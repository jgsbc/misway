# WORLD_ARCHITECTURE.md

**Status:** ACTIVE TECHNICAL AUTHORITY  
**Rule:** this document describes the runtime that exists now plus the next bounded migration. It is not a speculative framework specification.

## Runtime truth — after PR #39

Production authority is `main` and `/drift`.

Current high-level flow:

```text
/drift
→ Drift3DClient
→ Drift3DCanvas
→ Drift3DScene
   → Drift3DSceneBase
   → chase camera rig

Drift3DCanvas / Drift3DSceneBase
→ @/lib/drift3d
   → drift3dBase + validated vehicle-relative controls/chase rig
→ @/lib/drift3dVehiclePhysics
   → drift3dVehiclePhysicsBase + validated chase driving step
```

The `src/overrides` chase authority and its three `tsconfig` path redirects were removed by PR #39. The canonical import paths now own production behavior.

The `*Base` split is a **temporary convergence structure**, deliberately preserving the exact pre-migration blobs while authority is being cleaned. It is not the intended final architecture and must not grow into a second runtime.

## Existing authorities worth preserving

- `Drift3DClient` / `Drift3DCanvas`: production shell, WebGL/reduced-motion handling, input/pinch ownership, audio integration and lifecycle.
- `drift3dAudioClock`, cue resolver, signature arbitration and scene lifecycle: shared temporal services — KEEP.
- `drift3dTerrain`: current production terrain authority — KEEP until the peninsula migration replaces its geographic model behind a single terrain interface.
- `drift3dTopology`: current production topology/territory authority — KEEP until migrated, not bypassed.
- EUX GAINENT's accepted local dramaturgy and living scene — KEEP.
- scatter/instancing, atmosphere and texture/material helpers — KEEP/EXTRACT as proven capabilities when needed.

## Fable role

`experiment/drift-greybox-fable` is a R&D source, not an execution branch.

Extractable evidence includes peninsula geography, x/z regions, route fields, deterministic generation, terrain/water relationships, territory experiments, density findings and debug probes.

Do **not** import or preserve competing Fable shells, canvases, cameras, inputs, audio authorities or complete runtimes.

## Greybox role

The existing Greybox is R&D capital. It must not continue as a second world.

Target:

```text
/drift-greybox-lab
→ World Inspector
→ same real runtime/world data as /drift
```

The Inspector may later expose coordinates, terrain height, sea level/depth, regions, eras, territories, routes, colliders, chunks/LOD, population layers, quality tier and performance metrics.

## Near-term architecture

Campaign A should converge toward one spatial authority without prematurely building a platform framework:

```text
MISWAY world data
→ single terrain/topology/route/water authority
→ single production scene/runtime
→ Driving behavior
```

Only capabilities proven by real MISWAY use should later move toward the level-2 layering:

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

## Spatial invariants

- 1 unit ≈ 1 metre.
- world size comes from real distances/topology, never global scale.
- terrain must converge on one query authority equivalent to `getGroundY(x,z)`, plus surface/region queries as needs become real.
- routes influence terrain locally.
- water follows geography and a clear sea-level authority; no arbitrary water rectangles when real coast geometry exists.
- manifest + seed should progressively reproduce the same generated result.

## World-generation direction

Preferred model:

```text
base geography
+ routes / paths
+ water
+ era grammar
+ track modifiers
+ authored corrections
= final authored world
```

Population and asset placement should become deterministic rules only when they replace real repeated authoring work.

## Performance doctrine

Measure real runtime values: FPS, draw calls, triangles, geometries, textures, active instances/chunks and memory growth after traversal. Quality tiers may reduce representation cost, never alter the artistic world definition.

## Immediate technical debt

1. `*Base` wrappers introduced during PR #39 still contain the old implementations beneath canonical facades. They are temporary MIGRATE debt, not parallel authority.
2. `Drift3DSceneBase` still contains the legacy translation-follow camera callback underneath the validated chase camera. It is functionally overridden today; remove it only in a behavior-preserving cleanup.
3. production terrain/topology still describe the smaller current map; the Fable peninsula has not yet been extracted into `/drift`.
4. Greybox/Fable contain separate R&D runtime pieces that must remain non-authoritative.

The next visible architectural milestone is the real large peninsula in `/drift`, with vehicle/camera/object scale preserved.
