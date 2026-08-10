# DRIFT 3D — Loading & Residency Architecture

**Lot:** `DRIFT-ASSET-GOV-00`  
**Status:** `PROPOSED — OWNER GATE REQUIRED`  
**Parent authority:** `docs/DRIFT_3D_ASSET_PERFORMANCE_BIBLE.md`

## 1. Goal

Prevent both failure modes:

1. slow/heavy initial world load because every future zone is resident;
2. navigation stutter because a zone is fetched/parsed/uploaded only when the player reaches it.

The architecture must exploit MISWAY's constrained, authored road graph to prepare probable future content before it is visible.

## 2. Non-goals

This document does not authorize:
- a new general open-world engine;
- worker/WASM architecture rewrites without a measured need;
- a global scene graph rewrite;
- route topology changes;
- new track placement;
- invisible preloading of the entire world.

## 3. Residency layers

### Layer A — World Shell
Always resident:
- vehicle visual/pose integration;
- controls/camera;
- route/terrain authority needed for safe driving;
- global sky;
- global water authority where required;
- core UI/audio control;
- minimal collision/navigation data.

### Layer B — Era Palette
Resident while the era is active, subject to device budget:
- shared building modules;
- repeated street furniture;
- shared vegetation;
- shared materials/decals;
- reusable crowd/character assets;
- common low-cost landmarks.

### Layer C — Track Capsule
Prepared only for current/near-future territories:
- hero meshes;
- track-only façade/landmark fragments;
- local signs/decals;
- track-only animation;
- local lighting/material variants if not shared.

### Layer D — Opportunistic Decoration
Never required for route readability:
- extra crowd members;
- litter;
- secondary signage;
- additional parked props;
- cosmetic animation.

This layer is first to disappear under device pressure.

## 4. Capsule state machine

```text
COLD
  ↓
FETCH_QUEUED
  ↓
FETCHING
  ↓
CACHED
  ↓
PARSING
  ↓
CPU_READY
  ↓
GPU_PREPARING
  ↓
WARM
  ↓
VISIBLE
  ↓
COOLING
  ↓
DISPOSED
```

Failure path:

```text
<any state> → FAILED → fallback/skip optional content
```

A capsule may not become `VISIBLE` from `FETCHING`, `CACHED` or `PARSING`.

## 5. What “WARM” means

A capsule is `WARM` only when:
- payload is available;
- glTF parsing is complete;
- required texture transcode/decode is complete enough for first frame;
- runtime objects/materials exist;
- required shader compilation has been prepared where applicable;
- shared resource references are registered;
- the next visibility transition does not require a known heavy synchronous task.

## 6. Prediction model

Use the accepted spatial graph, not free-roaming distance alone.

Priority score inputs may include:
- current route edge;
- vehicle position on edge;
- vehicle heading/speed;
- junction distance;
- branch probability;
- whether a branch is a dead-end/spur;
- recently visited territory;
- era transition direction.

Do not create an ML predictor. A deterministic road-graph heuristic is sufficient.

## 7. Birth Yard initial policy

Birth Yard graph authority:

```text
Entry
→ Zeeland
→ Foolfoule
→ Sugared Peach
→ Play It
→ Jazzypling
→ Zeeland

Zeeland ↔ Funky Hoo spur
Jazzypling ↔ Peut-être spur
```

Practical residency examples:

### Entry approaching Zeeland
Resident:
- World Shell;
- minimum Entry;
- Zeeland shared waterfront/harbour palette;
- Zeeland capsule;
- lightweight Foolfoule approach assets.

Prepare:
- Foolfoule capsule.

Do not prepare:
- full Peut-être;
- full Funky Hoo;
- full Jazzypling;
- all later eras.

### Foolfoule toward Sugared Peach
Keep warm:
- Foolfoule;
- Zeeland shared era resources;
- Sugared Peach;
- Play It early shared commuter vocabulary if cheap.

Cool only after:
- reversal is no longer likely;
- shared resources are reference-safe.

### Spur entry
For Funky Hoo or Peut-être:
- prepare spur capsule before the branch commitment point;
- keep the parent junction/return path warm;
- do not dispose parent resources at the spur end.

## 8. Branch uncertainty

At a junction with two plausible next territories:
- shared low-cost assets can be prepared for both;
- expensive hero assets should be deferred until intent is clearer;
- if both cannot fit, prioritize the straight/main-loop path;
- never stall the current route to prepare an optional branch.

## 9. Transition cover

Geography and art direction may create natural low-visibility windows:
- tunnel;
- curve;
- wall/building occlusion;
- fog;
- forest density;
- bridge structure;
- elevation crest.

These are permitted to **schedule** preparation, not to excuse a blocking frame.

A cinematic/visual cover must never become a disguised loading screen unless explicitly designed and accepted as such.

## 10. Fetch scheduling

Rules:
- core/control assets first;
- current territory next;
- probable next territory after core becomes usable;
- optional decoration last;
- avoid burst-fetching many large assets simultaneously on mobile;
- reuse browser cache and immutable fingerprinted filenames when practical;
- cancellation is allowed for no-longer-probable optional fetches.

## 11. Parse/decode scheduling

Do not assume async network means async cost-free rendering.

Track separately:
- network completion;
- GLTF parse;
- Meshopt decode;
- KTX2/Basis transcode;
- material/object creation;
- shader warm-up.

If any phase creates visible frame spikes, it becomes a measured optimization target for the vertical slice.

## 12. Shader preparation

Three.js `WebGLRenderer.compileAsync(scene, camera, targetScene)` is preferred when new materials can otherwise compile on first visibility.

Guardrails:
- configure target scene lights/environment first;
- do not compile every possible world material at boot;
- precompile only the warm working set;
- measure compile cost and memory.

## 13. Resource ownership

Every runtime asset group must know whether resources are:

- `exclusive` — owned by one capsule and disposable with it;
- `era_shared` — shared by multiple track capsules;
- `world_shared` — global;
- `external_runtime` — loader/decoder resource with separate lifecycle.

Reference-count or equivalent explicit ownership is required before automated disposal.

## 14. Cool/dispose hysteresis

Avoid thrashing.

A territory is not disposed the moment the vehicle crosses an invisible boundary.

Use hysteresis based on:
- route distance behind;
- probability of immediate reversal;
- available memory tier;
- whether resource is shared;
- whether the next territory is already warm.

The vertical slice must explicitly test:
- forward traversal;
- immediate U-turn;
- repeated A↔B traversal.

## 15. Low-memory strategy

When memory pressure or mobile tier requires reduction:

1. skip opportunistic decoration;
2. reduce crowd/traffic density;
3. keep only nearest next capsule warm;
4. lower hero texture variant where prebuilt variants exist;
5. shorten warm-behind window;
6. dispose optional animation resources.

Never sacrifice collision/route authority or create dry-ground/water contradictions.

## 16. Failure behavior

Optional asset failure:
- log diagnostic;
- use era palette fallback;
- continue gameplay.

Hero capsule failure:
- preserve driveable geography;
- show bounded fallback;
- never block controls indefinitely;
- never replace with random unrelated content.

## 17. Instrumentation contract

For each capsule log timestamps:

```text
requestedAt
fetchStartedAt
fetchCompletedAt
parseStartedAt
parseCompletedAt
gpuPrepareStartedAt
gpuWarmAt
visibleAt
coolingAt
disposedAt
```

Also log:
- payload bytes;
- capsule ID;
- asset IDs;
- resource deltas;
- failure reason.

Instrumentation must be removable/disabled in normal production telemetry if it becomes costly.

## 18. Acceptance scenarios

A loading implementation is not accepted until these are smooth on the target mobile test device:

1. cold Entry → Zeeland;
2. Zeeland → Foolfoule;
3. Foolfoule → Sugared Peach → Play It;
4. Play It → Jazzypling;
5. Jazzypling → Zeeland loop close;
6. Zeeland → Funky Hoo → U-turn → Zeeland;
7. Jazzypling → Peut-être → U-turn → Jazzypling;
8. repeated loop with no monotonic GPU resource growth.

## 19. Deferred decisions

Not decided by governance:
- exact preload distance;
- exact memory MB limit;
- exact concurrency count;
- worker offloading;
- exact cache eviction duration.

Those values must come from the vertical-slice measurements.
