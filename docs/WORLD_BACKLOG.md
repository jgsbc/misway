# WORLD_BACKLOG.md

**Status:** ACTIVE EXECUTION AUTHORITY  
**Format rule:** keep this file compact. Detailed implementation belongs in code/PRs, not in a new mega-backlog.

## NOW

### Kill Gate A — LOOK / DRIVE / MEASURE

Campaign A foundations are technically integrated. Do **not** densify yet.

Validate the running `/drift` and `/drift-greybox-lab` on the real production runtime:

- drive Entry → Birth Yard → Older Shadows → Vegetative Field → New Signal;
- verify metric scale, route readability, grades, terrain continuity and coast/bay credibility;
- verify the validated chase camera and driving feel did not regress;
- use Inspector teleports/top-down/spatial probes to diagnose defects;
- capture current FPS / draw calls / triangles / geometries / textures where possible;
- distinguish geographic defects from missing visual density.

**Kill Gate A passes only when:**

> the large world is already coherent, pleasant and promising to traverse before additional decoration.

If not, fix geography/routes/terrain/water first.

### A5b — convergence cleanup, only after visual parity

- remove the redundant legacy translation-follow camera callback only after chase parity is visually confirmed;
- collapse `*Base` / `*Legacy` recovery wrappers only where the canonical implementation can absorb them without behavior drift;
- keep each cleanup PR behavior-equivalent and independently testable.

## NEXT

### B — Birth Yard Hero Slice / quality proof

Only after Kill Gate A passes:

- select a limited Birth Yard road/territory slice;
- establish a real Visual Target from accepted masterframes;
- use existing/licensed assets and coherent PBR materials where code-only primitives are insufficient;
- improve vehicle/road/buildings/vegetation/population/atmosphere/events only inside the slice;
- measure desktop and mobile performance;
- identify which repeated quality work deserves reusable infrastructure.

**Kill Gate B:**

> is the slice genuinely impressive enough to justify generalization?

If no, fix the quality pipeline instead of producing four mediocre eras.

## LATER

### C — Prove the Track Factory

Only after Campaigns A/B are convincing:

- AssetRegistry / MaterialRegistry only where real repeated authoring proves value;
- EraManifest / TrackManifest;
- deterministic PopulationGrammar;
- AudioFeatureManifest;
- reusable event/narrative primitives;
- convert contrasting tracks such as FOOLFOULE, EUX GAINENT and A WALK IN ZEELAND;
- integrate one previously unconverted track primarily through data/assets/signature without changing world/camera/audio/terrain runtimes.

### D — Complete MISWAY

- remaining eras/tracks/transitions/signatures;
- shared quality tiers;
- performance/memory hardening;
- mobile.

### E — Prove the platform

- minimal WalkingExperience;
- LAMBDA spike: 500–1000 m, 2–3 tracks, 1–2 eras;
- DOGGOD spike only after LAMBDA proves reuse;
- declare World Platform V1 only when materially different worlds share the proven infrastructure without forks.

### World Composer

Deferred until MISWAY + Track Factory + LAMBDA + DOGGOD spike are proven.

## DONE

- accepted EUX GAINENT proof slice and owner review on `main`;
- PR #38: chase camera + vehicle-relative controls/physics validated;
- PR #39: canonicalized chase runtime and removed hidden override aliases;
- PR #40: established compact WORLD canonical docs + temporary recovery map;
- PR #41: added runtime CI — tests / lint / TypeScript / production build;
- PR #42: recovered 710 m × 710 m Fable peninsula into `/drift` with rigid era translations and preserved local scale;
- PR #43: recovered five-route network, route distance field and route-shaped terrain; protected carriageway from legacy scatter;
- PR #44: established single sea-level authority, geographic water depth and one canonical sea surface;
- PR #45: converted `/drift-greybox-lab` into World Inspector V1 over the exact production runtime.
