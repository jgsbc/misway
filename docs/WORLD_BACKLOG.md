# WORLD_BACKLOG.md

**Status:** ACTIVE EXECUTION AUTHORITY  
**Format rule:** keep this file compact. Detailed implementation belongs in code/PRs, not in a new mega-backlog.

## NOW

### A1 — Recovery + canonical documentation

- establish `WORLD_VISION.md`, `WORLD_CONTENT.md`, `WORLD_ARCHITECTURE.md`, `WORLD_BACKLOG.md`;
- maintain temporary `WORLD_RECOVERY.md` until convergence is complete;
- classify before deleting;
- stop treating the former 153-lot integral backlog as the day-to-day execution authority.

**Done when:** the five files exist, current authority is explicit, old documents are sources/historical unless still delegated by the canonical docs.

### A2 — Extract the Fable peninsula into production `/drift`

Visible goal:

> opening `/drift` reveals the real large peninsula with the existing vehicle, chase camera and object scale unchanged.

Scope:

- extract peninsula bounds/spine/x-z region geography from Fable;
- preserve production shell, audio, vehicle, controls, camera and accepted content;
- establish the new metric world bounds without global scaling;
- migrate production terrain queries to the recovered geography through one authority;
- keep the first PR focused on geography/topology only.

**Kill gate A:** the enlarged world must already feel coherent and promising to traverse before density work.

## NEXT

### A3 — Routes + terrain relationship

- extract/adapt Fable route field/network;
- make roads influence local terrain;
- validate route continuity, grades and vehicle clearance;
- add deterministic tests for route/terrain invariants.

### A4 — Sea / coast / bay

- one sea-level authority;
- coherent seabed/depth/coast relation;
- remove arbitrary water geometry only after replacement is proven;
- validate true opposite shores and accessible coastline.

### A5 — Runtime simplification + World Inspector

- remove the now-redundant legacy camera callback and collapse `*Base` migration wrappers when behavior parity is proven;
- turn Greybox into a World Inspector reading the same production world data;
- add high-value topology/terrain/water/route/perf probes.

### B — Hero quality slice

- choose a limited Birth Yard area;
- establish a real Visual Target using appropriate assets/materials rather than code-only primitives where quality demands it;
- measure performance on desktop and mobile;
- generalize nothing until the slice is genuinely impressive.

**Kill gate B:** do not industrialize mediocre quality.

## LATER

### C — Prove the Track Factory

Only after Campaigns A/B are convincing:

- AssetRegistry / MaterialRegistry where real reuse justifies them;
- EraManifest / TrackManifest;
- deterministic PopulationGrammar;
- AudioFeatureManifest;
- reusable event/narrative primitives;
- convert contrasting tracks such as FOOLFOULE, EUX GAINENT and A WALK IN ZEELAND;
- integrate one new track primarily through data/assets/signature without changing core runtimes.

### D — Complete MISWAY

- all eras/tracks/transitions/signatures;
- quality tiers;
- performance/memory hardening;
- mobile.

### E — Prove the platform

- minimal WalkingExperience;
- LAMBDA spike (500–1000 m, 2–3 tracks, 1–2 eras);
- small DOGGOD spike only after LAMBDA proves reuse;
- declare World Platform V1 only when the same core/runtime infrastructure supports materially different worlds without forks.

### World Composer

Deferred until MISWAY + Track Factory + LAMBDA + DOGGOD spike are proven.

## DONE

- accepted EUX GAINENT proof slice and owner review on `main`;
- chase camera + vehicle-relative controls/physics validated in PR #38;
- PR #39: removed hidden `src/overrides`/`tsconfig` chase authorities and made canonical runtime paths explicit while preserving previous blobs and behavior.
