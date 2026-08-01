# DRIFT 3D — Shared-World Kit Architecture

**Status:** `TARGET_ARCHITECTURE — NOT RUNTIME TRUTH` (same status class as `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`, which this document extends, never contradicts).
**Reconciled under:** `DRIFT-IV-GOV-40`.
**Relationship to the Integral Systems Architecture:** that document defines the **behavioral/temporal infrastructure layer** (audio clock, cue resolver, scene lifecycle, signature arbitration, quality tier, evidence — the `PROVEN SHARED LIVING SERVICES` layer, all delivered by `SYS-00` through `SYS-70`). This document defines the **asset/content/geometry infrastructure layer** — how models, materials, animation, and instanced content are authored, loaded, LOD'd, batched and disposed. The two layers are complementary and do not overlap: a kit below may be *consumed by* a `SYS-*` service (e.g. Quality Tier governs how much of a kit's content renders), but no kit defines its own lifecycle, timing, or arbitration — those remain `SYS-*`'s exclusive domain.
**Confirmed gap, not a reinterpretation**: per `docs/DRIFT_3D_GOV40_RECONCILIATION.md` §2, no prior document names any of terrain-as-a-kit, urban, interior, mountain, water, weather, human/crowd, animation, vehicle/traffic, machine/prop, lighting/material, signage/screen, secondary-life or transition as a formal system. `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §6.4–6.5 names exactly two narrow, post-gate-only "Kit" concepts (Bureaucracy Kit, Contaminated Material Kit) — both are prop/material *content libraries*, and are treated below as a subset of the **Machine/Prop Kit** and **Signage/Screen Kit** respectively, not duplicated as separate kits.

---

## 0. Why now, not after three proof slices

`DRIFT-IV-GOV-30`'s industrialization gate (*"aucune abstraction partagée avant preuve sur au moins deux scènes"*) is explicitly **superseded for sequencing only** by this lot — see `docs/DRIFT_3D_GOV40_RECONCILIATION.md` §1.1. The reuse-first posture is not speculative: `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` shows that today, humans, crowds, weather and water each have **zero or exactly one** non-reusable, track-hardcoded example — there is no working pattern being prematurely abstracted away, only real gaps being named before 25 more tracks each invent their own one-off version.

---

## 1. Global conventions (apply to every kit below; stated once)

### 1.1 Coordinate and scale conventions
- World units = meters, matching `DRIFT_3D_REALISM_BIBLE.md` §4 human-scale numbers (doors ~2.1m, floors ~3m, streetlights ~4m, lanes ~3.5m). Any kit asset must be authored or scaled to this convention before use.
- Origin per landmark/kit-instance follows the existing `drift3dLandmarks.ts` pattern: a local `{x, z}` origin plus offsets in local space (`[x, y, z]` relative to that origin), never raw world coordinates baked into geometry. Y=0 is nominal ground; actual ground height is sampled at runtime from `drift3dTerrain.ts`, never baked into an asset.
- Forward/up axes match three.js/glTF convention (Y-up, glTF's own +Z-forward on import) — no per-kit deviation.

### 1.2 Asset pipeline and format
- **This is a real pivot, not a refinement**: the current runtime is 100% procedural (`docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` §1 — zero `.glb`/`.gltf` files anywhere in the repo today). Kits below introduce glTF/GLB as an available format *alongside*, never *replacing*, procedural geometry — procedural remains correct for simple/hero-unique forms (a bespoke landmark silhouette, a signature prop); glTF becomes correct for anything meant to be reused across ≥2 segments (a human rig, a vegetation archetype, a vehicle).
- Authoring/export target: glTF 2.0 binary (`.glb`), single file per asset (embedded textures) for props/vegetation/simple geometry; separate `.bin`+textures only for large hero assets where embedding would bloat a shared bundle.
- Compression policy (the first formal statement of this, per the reconciliation ledger's confirmed gap): **Draco** for geometry compression on any mesh >~5k triangles, **Meshopt** as the preferred alternative where a kit needs vertex-cache-friendly instancing (vegetation, crowd), **KTX2/Basis Universal** for all glTF-embedded textures above 512px. Below that threshold (small props, UI-adjacent signage), uncompressed glTF is acceptable — compression tooling overhead is not worth it for trivial geometry.
- Directory convention: `public/models/<kit-name>/<asset-name>.glb`, `public/models/<kit-name>/README.md` recording source/licence/provenance per `docs/DRIFT_3D_ASSET_REUSE_MATRIX.md`'s own required fields. No asset ships without that provenance record — this is a hard gate, not a suggestion (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §8.2 already states "documenter licence et provenance" for the existing asset tiers; this extends that rule to every kit asset).

### 1.3 Material conventions
- PBR only, matching `DRIFT_3D_REALISM_BIBLE.md` principle 2 (albedo + roughness + normal minimum; never a flat untextured color). Kit materials extend, never replace, `drift3dTextureFactory.ts`'s existing photo-sourced + procedural-canvas dual approach: photo PBR for organic/architectural surfaces, procedural `CanvasTexture` for anything textual/data-driven (signage, screens, counters — this is exactly EUX GAINENT's now-validated pattern, generalized).
- One shared material per kit archetype where geometry is instanced (see §1.5) — never a unique material instance per individual object copy.

### 1.4 Shared skeleton conventions (Human/Crowd Kit and any future rigged asset)
- One canonical humanoid skeleton (a standard, glTF-exportable bone hierarchy — hips root, spine/chest/head chain, two arm chains, two leg chains; no finger/facial bones needed at Drift's silhouette-first read distance) shared by every human-shaped asset in the world. A track's Identity Contract may vary body proportions, color, and animation clip *selection*, never the bone hierarchy — this is what makes one animation library playable across every human in every era.
- Non-human rigged assets (if any future kit needs one — e.g. a mechanical prop with moving parts) use their own minimal bone hierarchy, but never share the humanoid skeleton's namespace.

### 1.5 LOD, instancing, batching, texture atlases
- **Instancing is the default for any repeated archetype** (>~5 copies of the same asset): `THREE.InstancedMesh`, matching the already-proven pattern in `drift3dScatter.ts`/`Drift3DScatterField.tsx`. Per-instance variation (color, scale, phase offset) via instance attributes, never via unique materials or unique geometries.
- **LOD**: 3 levels, matching the existing `≤300 draw calls / ≤1.5M triangles` budget's own implied silhouette-first doctrine (Realism Bible: *"chaque POI identifiable par sa silhouette à 200m"*) — full detail near the vehicle, a mid-detail silhouette-preserving mesh at medium range, and a billboard/impostor or cull at far range. `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §6.2's one existing LOD mention ("silhouettes LOD" for recurring archetypes) is the seed of this rule, generalized to every kit here.
- **Batching**: static geometry sharing a material batches at build/load time (geometry merge), never per-frame. Explicitly forbidden (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §10's own anti-pattern, reused here): "foule en composants React individuels" — a crowd, a vegetation field, or a traffic stream is never one React component per visible instance.
- **Texture atlases**: any kit with >4 small material variants (signage fragments, prop color variants) atlases them into one shared texture rather than one draw-call-costing material swap per variant.

### 1.6 Quality-tier and mobile behavior
- Every kit's population/density is a capability the existing `DRIFT-IV-SYS-40` Quality Tier service scales (population count, scatter density, texture resolution, secondary-loop count) — kits never invent their own quality logic; they expose a single "count/density" parameter the Quality Tier already knows how to scale monotonically. Mobile is not a separate kit behavior; it is simply the low end of the same Quality Tier scale, plus the existing product-level reduced-motion/no-WebGL fallback paths (`SYS-50`/`SYS-60`), which every kit must degrade into rather than bypass.

### 1.7 Disposal and lifecycle rules
- Every kit's loaded geometry/material/texture is owned by exactly one `Drift3DSceneLifecycle` state machine instance (`SYS-10`) and disposed on that instance's `RESETTING`/`UNMOUNTED` transition — matching the existing generic scene-lifecycle contract exactly, never a parallel disposal path. glTF-loaded assets additionally dispose their `THREE.BufferGeometry`/`THREE.Material`/`THREE.Texture` objects explicitly (`.dispose()`) on unmount, since GC alone does not reclaim GPU memory — this is new (procedural geometry never needed it), and is the one genuinely new lifecycle obligation this document adds.

---

## 2. The 15 kits

Each entry: **Ownership** (who/what module owns it) · **Scope** (what it covers) · **Reuse today** (confirmed from `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md`) · **What's new here**.

### 2.1 Terrain/road kit
- **Ownership**: `src/lib/drift3dTerrain.ts` (existing, generalized).
- **Scope**: heightfield generation (peaks/ridges/craters/ramps), node-pad flattening, border highlands, road-surface sampling.
- **Reuse today**: already a genuine shared system, world-wide, no change of ownership needed.
- **New here**: none structural — this kit is confirmed already correct; only the documentation gap (never named as a "kit") is closed.

### 2.2 Urban kit
- **Ownership**: new — generalizes `Drift3DLandmark.tsx`'s primitive-array renderer plus a new glTF-capable building/façade library.
- **Scope**: street-level architecture, façades, signage-bearing surfaces, urban ground textures (Birth Yard's dominant need; also New Signal's Le Monde S'endort skyline).
- **Reuse today**: `Drift3DLandmark.tsx` already generically renders any literal primitive list — reusable as-is for procedural buildings; no glTF building asset exists yet.
- **New here**: a glTF façade/building sub-library for buildings that need more than box-primitive massing (see reuse matrix for candidate sources), while keeping the existing primitive path for simple/hero-unique structures.

### 2.3 Interior kit
- **Ownership**: new.
- **Scope**: any scene where the camera reads *inside* a structure (EUX GAINENT's glass gym is the only current example) — flooring, wall treatment, interior props, interior lighting.
- **Reuse today**: none — EUX GAINENT's interior is a fully bespoke, non-extracted build (`docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` §6).
- **New here**: the entire kit. First consumer per the migration map is EUX GAINENT's own glass-front interior, generalized rather than left as a one-off.

### 2.4 Mountain kit
- **Ownership**: extends the Terrain/Road Kit (2.1) with mountain-specific dressing — this is a content layer on top of the existing heightfield engine, not a separate engine.
- **Scope**: rock/cliff dressing, snow-line treatment, ridge silhouettes (Older Shadows' Rise/Blossoming, Vegetative Field's transition-out).
- **Reuse today**: heightfield primitives (peaks/ridges/craters) already exist in `drift3dTerrain.ts`; no dedicated rock/snow material dressing exists beyond the generic photo-PBR library.
- **New here**: rock/snow material variants, cliff-face detail geometry at LOD-near only.

### 2.5 Vegetation kit
- **Ownership**: `src/lib/drift3dScatter.ts` + `Drift3DScatterField.tsx` (existing, generalized).
- **Scope**: instanced conifer/broadleaf/bush/rock/grass/deadTree/lamppost/acacia/poppy/cityBlock archetypes, era/altitude/slope/proximity-driven placement.
- **Reuse today**: already the strongest existing shared kit in the codebase (~12 draw calls via `InstancedMesh`) — this document's §1.5 instancing convention is written *from* this system's proven pattern, not imposed on it.
- **New here**: none structural; extend the archetype list as new tracks need species not yet covered (e.g. Vegetative Field's lawns, New Signal's forest).

### 2.6 Water kit
- **Ownership**: new — generalizes the single `water: true` boolean flag currently handled inline in `Drift3DLandmark.tsx` via three.js's `Reflector`.
- **Scope**: canals (A Walk In Zeeland), lakes (Asitis), the ocean (Étééaooété), any reflective/flowing surface.
- **Reuse today**: one working mechanism (`Reflector`), but no dedicated module, no wave/flow animation beyond the reflection itself, no distinction between still water (canal) and the ocean's required wave/erasure behavior (New Signal Era Contract §13).
- **New here**: a real module wrapping `Reflector` with flow/wave parameters, since the ocean's signature erasure mechanic (Étééaooété) is a hard, already-approved requirement this kit must be able to serve.

### 2.7 Weather kit
- **Ownership**: new — generalizes `StormRain` (`Drift3DEffects.tsx`), currently hard-anchored to `hold-the-light` only.
- **Scope**: rain, fog density shifts (Vegetative Field's breakdown, the entry-cave crossing), wind (already partially present as a deferred `Drift3DScatterField.tsx` GPU wind patch per the runtime baseline notes).
- **Reuse today**: one non-reusable, node-hardcoded example.
- **New here**: parametrize `StormRain` into a real weather-state system consumable by any track's Identity Contract, plus the deferred wind patch's eventual real integration.

### 2.8 Human/crowd kit
- **Ownership**: new — the single highest-priority kit given human presence is required by nearly every era (Birth Yard: `VERY_HIGH`; Ethnic Stick's "seule foule chaleureuse"; EUX GAINENT's A/B/C athletes; New Signal's sparse single silhouettes).
- **Scope**: the shared humanoid skeleton (§1.4), a small library of body/clothing variants, a pose/animation-clip set (walk, idle, wait, work-gesture, exercise-gesture — enough to cover the twelve silent archetypes once that list is completed, see reconciliation ledger §2), and an instanced crowd renderer generalizing `FoolfouleCrowd`.
- **Reuse today**: exactly two non-reusable, one-off examples — `FoolfouleCrowd` (hardcoded to `foolfoule`) and EUX GAINENT's own cylinder+sphere stick-figure athletes (hardcoded to `eux-gainent`, index-coupled to that landmark's own primitive array). Neither is a rig; neither has a skeleton or animation clips.
- **New here**: everything except the *presence* of two proofs-of-concept. This is the kit `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` calls out as the sharpest gap between "procedural stick figures work at Drift's silhouette-first read distance" (they do, today) and "a shared, reusable, animatable human" (does not exist yet).

### 2.9 Animation kit
- **Ownership**: new.
- **Scope**: `THREE.AnimationMixer`-based clip playback, blending, and the convention for how a pure dramaturgy model's `cycleValue`/`phaseProgress` output (the existing, already-proven EUX GAINENT pattern) drives clip selection/blend weight rather than raw bone rotation.
- **Reuse today**: **none** — confirmed zero `AnimationMixer` usage anywhere in the current runtime (`docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` §3). Every current motion (athlete bob, fan rotation, conveyor travel) is a per-frame imperative transform, not a clip.
- **New here**: the entire kit. This is the one piece of new infrastructure every other kit with moving parts (Human/Crowd, Vehicle/Traffic, Machine/Prop, Secondary-Life) will eventually depend on — but per §0's reuse-first posture, it should be introduced once, generically, rather than five times as five different one-off animation drivers.

### 2.10 Vehicle/traffic kit
- **Ownership**: extends `drift3dVehiclePhysics.ts` (currently single-player-only) with a new NPC/traffic layer.
- **Scope**: background traffic, the World Transit motif (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §6.3 — trains, cable cars, cargo ships, birds, planes), any non-player vehicle.
- **Reuse today**: none — one vehicle type exists, driven only by the player; no AI/instanced vehicle rendering.
- **New here**: an instanced, non-physics-simulated (path-following is sufficient — these are background elements, never collidable) traffic layer, sharing the Vehicle/Traffic Kit's own simplified geometry library, distinct from the player's own hand-authored capsule vehicle.

### 2.11 Machine/prop kit
- **Ownership**: generalizes `Drift3DProp.tsx` (existing generic small-prop renderer) plus the Integral Systems Architecture's two named content libraries — Bureaucracy Kit (signs, stamps, ribbons, tickets, counters) and, for moving machines specifically, EUX GAINENT's station pattern (treadmill/bike/rower archetypes).
- **Scope**: any freestanding functional object — a bureaucratic prop, a machine with a moving part, a piece of street furniture.
- **Reuse today**: `Drift3DProp.tsx` is already a working generic small-primitive-assembly renderer; EUX GAINENT's three station archetypes are a real, working example of "machine with animated moving part" but are not extracted into a reusable component (`docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` §6).
- **New here**: extraction of the station pattern into a parametrized component (archetype, footprint, color, moving-part behavior) so a future track's machine doesn't re-author the same box+cylinder assembly from scratch.

### 2.12 Lighting/material kit
- **Ownership**: `drift3dAtmosphere.ts` (region-driven lighting/color-script) + `drift3dTextureFactory.ts` (material library), both existing, generalized together.
- **Scope**: per-region sky/fog/exposure/sun/hemisphere state (already a real shared system), plus the shared PBR + procedural-canvas material library.
- **Reuse today**: both halves already exist and are already shared world-wide — the strongest-existing pair of kits after Vegetation/Terrain.
- **New here**: none structural; extend the photo-PBR set as new tracks need materials not yet in the 5-set library (rock/brick/concrete/wood/sand today).

### 2.13 Signage/screen kit
- **Ownership**: generalizes `drift3dTextureFactory.ts`'s procedural-canvas path plus EUX GAINENT's now-validated dynamic `CanvasTexture` screen pattern (the P0-series-debugged narrative-text pipeline: one combined texture per distinct semantic state, swapped only on state change, never per-frame, `FrontSide`, `fog={false}`, real opacity ramp).
- **Scope**: any text/data-bearing surface — the Bureaucracy Kit's signs and stamps, a track's own narrative screen (EUX GAINENT's `CADENCE`/`CONFORMITÉ` pattern), Vegetative Field's "satisfaction" screens, New Signal's accusatory panels.
- **Reuse today**: one fully proven, owner-validated working pattern (EUX GAINENT's screen), not yet extracted from `EuxGainentLivingScene.tsx` into a reusable function.
- **New here**: extraction only — the pattern itself needs no redesign, only parametrization (facade/mount-surface geometry, headline/secondary-line content source, state-key function) so the next track's screen doesn't relearn the same fog/depth/orientation lessons EUX GAINENT's P0–P0I arc already paid for.

### 2.14 Secondary-life kit
- **Ownership**: new — formalizes the Living World Bible's own already-approved six-role object model (§7.2: Diffuser, Actor, Instrument, Trigger, Memory, Anomaly) as a reusable component pattern, generalizing EUX GAINENT's fans/towel-conveyor/dispenser (the concrete working example of "ordinary background object with a perceptible autonomous behavior").
- **Scope**: any object that exists to make a space feel alive without being the scene's central anomaly — exactly the Living World Bible's own definition, already active doctrine, just not yet given a shared implementation.
- **Reuse today**: EUX GAINENT's fans/conveyor/dispenser are the one working example, not extracted (index-coupled to that scene's own refs, per the migration map).
- **New here**: extraction of the "small perceptible autonomous loop, ≤3 states, driven by a shared trigger-priority order" pattern (Living World Bible §7.4–7.5, already-approved doctrine) into a reusable component family.

### 2.15 Transition kit
- **Ownership**: extends `drift3dAtmosphere.ts`'s existing continuous-interpolation mechanism (already proven: no hard cuts, position-driven blending) with named era-boundary transition profiles.
- **Scope**: the four inter-era transitions plus the entry-cave crossing and the ocean/return — each already textually specified by its owning Era Contract (§1 of each contract), never re-specified here, only given a shared *mechanism* to execute the already-approved transition text.
- **Reuse today**: the underlying interpolation mechanism is proven and shared (`drift3dAtmosphere.ts`); no named "transition" abstraction sits on top of it yet — each landmark/zone boundary currently just is what it is, with no explicit authored transition profile.
- **New here**: a thin profile format (start state, end state, transition distance/duration, eye-adaptation flag) so the already-approved transition text in each Era Contract has one consistent technical home instead of five different ad hoc implementations.

---

## 3. What this document does not do

It does not authorize building any of the 15 kits yet — that requires the backlog gates defined in `docs/DRIFT_3D_INTEGRAL_BACKLOG.md`'s `DRIFT-IV-PRE-*` group (see the resequencing). It does not reopen any Era Contract, Track Identity Contract, or Cue Map. It does not claim any kit exists in runtime — every "existing" claim above is cited against `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md`'s own code-grounded inventory, never asserted from this document alone.
