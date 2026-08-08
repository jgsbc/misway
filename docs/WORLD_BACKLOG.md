# WORLD_BACKLOG.md

**Status:** ACTIVE EXECUTION AUTHORITY  
**Format rule:** keep this file compact. Detailed implementation belongs in code/PRs, not in a new mega-backlog.

## NOW

### B — Birth Yard Hero Slice / quality proof

Kill Gate A passed on the production runtime after owner driving review and Inspector diagnosis. The large peninsula is coherent, navigable and promising enough to justify quality work without using density to hide geography.

Work only inside a limited Birth Yard road/territory slice:

- select the exact hero slice boundary around the main road and one representative territory;
- establish a real Visual Target from accepted MISWAY references/masterframes;
- preserve metric scale, current vehicle, route and geography;
- improve road surface, terrain dressing, buildings, vegetation, population, atmosphere and events only where they materially improve the slice;
- reuse existing/licensed assets before adding procedural substitutes;
- measure desktop and mobile cost as quality is added;
- identify repeated quality work only after it proves useful in the slice.

**Kill Gate B passes only when:**

> the Birth Yard slice is genuinely impressive enough that extending its quality language to other eras is worth the cost.

If not, fix the quality pipeline rather than producing four mediocre eras.

### A5b — convergence cleanup, non-blocking and behavior-equivalent only

- remove the redundant legacy translation-follow camera callback with a minimal patch; canonical chase already owns the final frame;
- collapse `*Base` / `*Legacy` recovery wrappers only where the canonical implementation can absorb them without behavior drift;
- keep each cleanup PR behavior-equivalent and independently testable;
- do not delay Hero Slice work for cleanup that does not change the running experience.

## NEXT

### C — Prove the Track Factory

Only after Campaign B is convincing:

- AssetRegistry / MaterialRegistry only where real repeated authoring proves value;
- EraManifest / TrackManifest;
- deterministic PopulationGrammar;
- AudioFeatureManifest;
- reusable event/narrative primitives;
- convert contrasting tracks such as FOOLFOULE, EUX GAINENT and A WALK IN ZEELAND;
- integrate one previously unconverted track primarily through data/assets/signature without changing world/camera/audio/terrain runtimes.

## LATER

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
- PR #45: converted `/drift-greybox-lab` into World Inspector V1 over the exact production runtime;
- PR #47–#52: stabilized Inspector teleports/camera diagnostics and restored readable chase framing across the peninsula;
- PR #54: rejected the expensive whole-terrain coast-density experiment after measurement showed poor visual return;
- PR #55–#57: corrected New Signal/Entry readability without altering geography;
- PR #56: made track/Entry atmospheric special zones truly local instead of leaking across the world;
- PR #58–#59: made vehicle headlights physically effective in dark regions;
- Kill Gate A: PASS — owner confirms navigation is good; Entry, Birth Yard, Older Shadows, Vegetative Field and New Signal are coherent enough to proceed to Hero quality work.
