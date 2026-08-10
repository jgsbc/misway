# DRIFT 3D — Asset & Performance Bible

**Lot:** `DRIFT-ASSET-GOV-00`  
**Status:** `PROPOSED — OWNER GATE REQUIRED`  
**Scope:** external 3D assets, runtime asset budgets, residency, textures, materials, instancing, LOD, measurement and performance acceptance.  
**Non-scope:** no terrain redesign, route change, vehicle physics, camera redesign, audio redesign, track placement or final-art implementation.

## 1. Purpose

MISWAY must become visually richer without becoming slower to enter, less fluid to drive, or unstable on mobile.

The governing strategy is therefore not “add more models”. It is:

> **Create the illusion of a large, continuous and richly authored world while keeping only a bounded working set of optimized assets resident at any instant.**

External assets are raw material. They are never production authority by themselves.

This document is the narrow technical authority for asset/performance work. For these questions it supersedes only the generic performance numbers in `DRIFT_3D_REALISM_BIBLE.md`; that document remains the artistic authority for realism, light, scale, materials and final-frame quality.

## 2. Current technical context

Current repo runtime stack, as of 2026-08-10:

- Next.js `16.1.7`;
- React `19.2.3`;
- `@react-three/fiber` `^9.6.1`;
- Three.js `^0.185.0`.

No engine migration is authorized by this lot.

## 3. Core invariants

1. **Initial-load performance is a feature.**
2. **Navigation fluidity is a feature.** A beautiful zone that causes a visible stall on reveal is a failed integration.
3. **Source asset != runtime asset.** ZIP/BLEND/Sketchfab source files are intake material, not deployable content.
4. **No external asset enters production without an intake record, license record and measured runtime artifact.**
5. **No arbitrary global triangle or draw-call budget may override empirical device measurements.**
6. **The baseline is the current world.** New budgets are expressed relative to measured current behavior, not guessed numbers.
7. **Mobile is a first-class gate**, not a late fallback.
8. **Do not solve loading by moving the stall.** Network preload that still decodes, uploads or compiles at reveal time is not sufficient.
9. **Do not solve stutter by keeping the whole world resident.** Residency must remain bounded.
10. **Reuse before creation.** Search CC0/CC BY libraries, existing repo assets and reusable packs before new modeling.
11. **Reuse inside MISWAY before importing more.** A shared road, façade module, lamp, tree, material or crowd rig must not be duplicated per track.
12. **One track is not one scene package.** Track identity should be a mutation of era/world vocabulary plus a small hero layer.

## 4. World asset model

```text
WORLD SHELL
├── vehicle / camera / controls
├── macro terrain + route authority
├── sky / global water authority
├── gameplay / audio / UI
└── lightweight global landmarks

ERA PALETTE
├── shared architecture modules
├── shared street props
├── shared vegetation
├── shared materials / decals
├── shared characters / crowd vocabulary
└── shared low-cost landmarks

TRACK CAPSULE
├── hero assets
├── local mutations
├── local decals / signage
├── track-specific animation
└── track-specific atmosphere bindings
```

The **Era Palette** is reused across the era. A **Track Capsule** contains only what distinguishes the track.

Birth Yard therefore remains one continuous port city whose local grammar mutates across seven tracks, consistent with `DRIFT_3D_BIRTH_YARD_SPATIAL_GRAPH.md`.

## 5. Asset intake states

Every external candidate moves through explicit states:

```text
DISCOVERED
→ LICENSE_CHECKED
→ SOURCE_ARCHIVED
→ INSPECTED
→ EXTRACTED
→ OPTIMIZED
→ VALIDATED
→ LAB_READY
→ ACCEPTED
→ PRODUCTION_READY
```

Rejected candidates remain recorded as `REJECTED` with a reason to prevent rediscovery loops.

## 6. Required intake data

Before runtime integration, record at least:

- stable MISWAY asset ID;
- source provider;
- source title;
- author/uploader;
- source URL;
- exact license and license URL;
- download date;
- source file/hash when available;
- source triangle/vertex counts;
- source material count;
- source texture count and maximum dimensions;
- animation presence;
- estimated/reported source payload;
- intended era/track usage;
- exact parts intended for reuse;
- derivative/modification notes;
- attribution string when required.

Runtime artifact data must additionally record:

- runtime file path;
- file bytes;
- triangle count;
- draw-call contributors / primitive count;
- material count;
- texture count;
- maximum texture dimensions;
- compression extensions;
- LOD tier;
- instancing eligibility;
- collision policy;
- shadow policy;
- residency policy.

## 7. Performance budget doctrine

### 7.1 No fabricated budget

The old generic figures in the Realism Bible are planning references only. `DRIFT-ASSET-GOV-00` requires a fresh empirical baseline before asset-heavy implementation.

The baseline must be measured on:

- one representative desktop profile;
- one representative smartphone profile;
- at least Entry, Zeeland/Foolfoule, a dense Birth Yard route and one wider/open segment;
- cold load and warm-cache load.

Until those measurements exist, absolute limits are `TBD_BASELINE`, not guessed.

### 7.2 Acceptance envelope

For a vertical slice to pass:

- **time-to-control:** must not regress materially versus baseline;
- **cold transferred bytes:** regression must be justified and bounded;
- **warm-cache start:** no material regression;
- **navigation:** no user-visible asset-reveal stall;
- **frame pacing:** p95/p99 frametime must remain within the accepted device envelope;
- **FPS:** must not regress below the accepted device floor;
- **GPU resources:** textures/geometries/programs must plateau rather than grow without bound;
- **memory behavior:** revisiting zones must not create a monotonic leak;
- **quality fallback:** lower-capability devices must degrade optional decoration before core geography/gameplay.

The numeric tolerance is chosen only after baseline capture and recorded in the baseline file.

## 8. Metrics to capture

### Loading
- navigation start timestamp;
- First Contentful Paint where meaningful;
- 3D shell ready;
- vehicle controllable;
- first era visually ready;
- cold/warm transfer bytes;
- request count;
- largest individual asset;
- total GLB/glTF bytes;
- total texture bytes.

### Rendering
Use `renderer.info` and frame instrumentation:
- calls;
- triangles;
- points/lines if relevant;
- active geometries;
- active textures;
- shader programs;
- FPS;
- frametime p50/p95/p99;
- long frames > 33.3 ms;
- long frames > 50 ms;
- long tasks when attributable.

### Residency lifecycle
For each capsule:
- download complete;
- parse complete;
- texture decode/transcode complete;
- GPU warm complete;
- visible;
- cool;
- disposed;
- post-dispose `renderer.info.memory` deltas.

## 9. Geometry policy

Geometry count alone does not determine performance, but source geometry must be intentional.

Rules:

- prefer extraction over blind whole-scene import;
- remove invisible interiors/backfaces/duplicates when safe;
- do not decimate hero geometry merely to hit an arbitrary number;
- simplify distant/background assets aggressively where silhouette survives;
- preserve named nodes required for interaction/animation;
- join static primitives when it reduces draw calls without destroying reuse;
- split only where culling/residency benefits justify it;
- use LOD only where measured benefit exceeds complexity.

A 2M-triangle source may be accepted if the runtime derivative uses only a small relevant portion. A 50k-triangle source may be rejected if it carries excessive materials/textures/draw calls.

## 10. Draw-call and material policy

Draw calls are a primary design constraint for dense urban content.

Default rules:

- shared geometry + shared material repeated many times → instance candidate;
- repeated props should prefer `InstancedMesh` or glTF `EXT_mesh_gpu_instancing`;
- consolidate near-identical materials;
- use atlas/palette strategies when visually appropriate;
- avoid one-material-per-small-object authoring;
- do not merge objects that need independent culling/animation merely for a lower count;
- transparent materials are exceptional and must be justified.

## 11. Texture policy

Textures are treated as both transfer and GPU-memory cost.

Default target after optimization:

| Runtime role | Normal target |
|---|---:|
| tiny/background prop | 256–512 |
| standard prop | 512–1024 |
| architecture near route | 1024 |
| hero asset | up to 2048 when justified |
| 4096 | exceptional, owner/perf justification required |

Rules:

- production does not accept source 4K texture sets unchanged by default;
- resize before KTX2 encoding;
- prefer KTX2/Basis Universal where validated on target devices;
- pack channels where workflow and material correctness permit;
- remove unused maps;
- avoid redundant copies of shared textures;
- normal/roughness detail must earn its memory cost at actual camera distance.

Three.js `KTX2Loader` and `GLTFLoader.setKTX2Loader()` are the preferred runtime path for `KHR_texture_basisu`.

## 12. Compression policy

Preferred runtime baseline:

- glTF 2.0 / GLB;
- Meshopt geometry compression when validated;
- KTX2/Basis Universal textures when validated;
- gzip/brotli at HTTP layer where hosting supports it.

Three.js `GLTFLoader` supports `EXT_meshopt_compression`, `KHR_texture_basisu` and `EXT_mesh_gpu_instancing`. Compressed assets must configure the required decoders/loaders explicitly.

Compression is not accepted solely because the file is smaller. Decode/transcode cost and frame pacing must also pass.

## 13. Shader warm-up policy

A capsule is not `WARM` merely because its bytes are downloaded.

Where a new material set can cause first-render shader compilation, use the current Three.js asynchronous precompile path:

- construct the intended object/material state;
- ensure target-scene lighting/environment are already configured;
- call `renderer.compileAsync(...)` when technically appropriate;
- only mark the capsule `WARM` after the required preparation resolves.

This is specifically intended to avoid first-render shader compilation stutter.

## 14. Residency policy

MISWAY should use **predictive staged residency**, not naive proximity streaming.

States:

```text
COLD
→ FETCHING
→ CACHED
→ PARSED
→ CPU_READY
→ GPU_PREPARING
→ WARM
→ VISIBLE
→ COOLING
→ DISPOSED
```

The player should not cross a visibility threshold that triggers heavy parse/decode/upload/compile work in the same frame.

A bounded hot set should normally include:
- current territory;
- immediately previous territory when reversal is plausible;
- most probable next territory;
- shared era palette.

Optional decoration may stream opportunistically and may be omitted on constrained devices.

## 15. Disposal policy

Removing an object from a Three.js scene is not sufficient to free GPU resources.

Every disposable capsule must have an ownership policy for:
- geometries;
- materials;
- textures;
- render targets if any;
- decoder/transcoder lifecycle when applicable.

Shared era resources must not be disposed while still referenced by another capsule.

Recommended registry fields:
- `owner`;
- `sharedKey`;
- `referenceCount`;
- `residentState`;
- `disposePolicy`.

A revisit test must prove that load → unload → reload does not grow resources indefinitely.

## 16. Mobile quality ladder

Quality reduction must preserve geography and musical identity.

Reduce in this order:

1. optional micro-props / clutter;
2. crowd density;
3. distant animated detail;
4. shadow-casting count / shadow distance;
5. expensive local FX;
6. texture resolution / mip residency where pipeline supports it;
7. LOD detail.

Do **not** remove:
- driveable route;
- water authority;
- required opposite banks/landforms;
- hero silhouette;
- track-recognition cue;
- safe camera/vehicle clearance.

## 17. Source/repo separation

Do not turn the public Git repository into a raw-asset archive.

### External/source archive
May contain:
- downloaded ZIPs;
- BLEND/FBX originals;
- large source textures;
- author source packages.

### MISWAY repo
Should contain:
- optimized runtime artifacts only;
- license/attribution text;
- source manifest + hashes;
- transformation scripts/configuration;
- documentation.

Any exception must be justified by reproducibility or licensing needs.

## 18. Legal intake policy

Priority:

1. **CC0** — preferred;
2. **CC BY** — accepted with attribution;
3. other licenses — explicit review;
4. NC / ND / unclear / suspicious provenance — reject by default.

For Sketchfab free downloads, retain attribution with author + source URL + exact Creative Commons license. Do not assume a “free” label alone is sufficient.

Third-party assets must not be re-exported as a standalone asset library when their license does not permit that.

## 19. Go / No-Go asset gate

An asset is `MISWAY_READY` only if all are true:

- [ ] source and author identified;
- [ ] license accepted;
- [ ] provenance recorded;
- [ ] intended use is explicit;
- [ ] only needed parts retained;
- [ ] runtime triangle/material/texture stats measured;
- [ ] textures meet policy;
- [ ] instancing decision made;
- [ ] shadow/collision policy made;
- [ ] runtime file validated;
- [ ] no user-visible reveal stall in lab;
- [ ] mobile test passes;
- [ ] attribution path exists when required.

## 20. Development gate

No broad Birth Yard art integration starts before:

1. current performance baseline is captured;
2. loading/residency architecture is accepted;
3. asset pipeline is accepted;
4. registry format is accepted;
5. Birth Yard asset manifest is accepted;
6. one vertical slice proves the approach without material load/navigation regression.

The next implementation lot after governance acceptance is intentionally **one vertical slice**, not seven tracks.

## 21. Primary technical references

- Three.js WebGLRenderer / `renderer.info` / `compileAsync`: https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js GLTFLoader extensions and decoder hooks: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js KTX2Loader: https://threejs.org/docs/pages/KTX2Loader.html
- meshoptimizer / gltfpack: https://meshoptimizer.org/gltf/
- glTF Transform: https://github.com/donmccurdy/glTF-Transform
- KTX 2.0: https://www.khronos.org/ktx/
