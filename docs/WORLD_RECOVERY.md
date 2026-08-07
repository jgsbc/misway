# WORLD_RECOVERY.md

**Status:** TEMPORARY MIGRATION TOOL  
**Lifecycle:** archive or delete this file once convergence is complete. It is not a permanent fifth authority.

Decisions:

- **KEEP** — correct and remains active.
- **EXTRACT** — recover a useful capability into the target authority.
- **MIGRATE** — progressively become the target implementation.
- **REFERENCE** — useful evidence, not active runtime authority.
- **ARCHIVE** — historical only.
- **DELETE** — only after remaining value has been explicitly verified as zero.

## Runtime / world recovery

| Source | Value | Target | Decision |
|---|---|---|---|
| `/drift` production shell (`Drift3DClient`, `Drift3DCanvas`) | working WebGL/reduced-motion shell, lifecycle, input/pinch, audio integration | production runtime | **KEEP** |
| canonical chase controls/camera after PR #39 | owner-validated vehicle-relative controls and chase behavior | Driving behavior in production | **KEEP** |
| canonical vehicle physics after PR #39 | validated arcade/simcade base, terrain following, airborne/collisions | Driving behavior in production | **KEEP** |
| `drift3dBase.ts`, `drift3dVehiclePhysicsBase.ts`, `Drift3DSceneBase.tsx` | exact preserved pre-migration implementations | collapse into simpler canonical modules after parity proof | **MIGRATE** |
| legacy translation-follow callback inside `Drift3DSceneBase` | historical camera behavior, currently overwritten by chase rig | none after parity proof | **ARCHIVE**, then **DELETE** only after verified redundant |
| `drift3dAudioClock`, cue resolver, signature arbitration, lifecycle | proven shared temporal contracts | production runtime / later reusable runtime | **KEEP** |
| EUX GAINENT accepted local dramaturgy/cues/living scene | accepted artistic + technical proof | MISWAY track territory / reusable patterns later | **KEEP**; selective **EXTRACT** later |
| current `drift3dTerrain` / `drift3dTopology` | current runtime truth and compatibility surface | peninsula-era production terrain/topology authority | **MIGRATE**, never bypass |
| current scatter/instancing | proven efficient population primitive | future population grammar inputs | **KEEP** / selective **EXTRACT** |
| current atmosphere/material helpers | proven reusable visual infrastructure | shared era/material capabilities | **KEEP** / extend only when needed |
| Fable peninsula spine/bounds/x-z regions | strong large-world geography and coherent era placement | production MISWAY geography | **EXTRACT** |
| Fable terrain / region weighting / bay field | coherent relief, coast and water-depth R&D | production terrain authority | **EXTRACT**, adapt behind one query authority |
| Fable route network / route distance field | route continuity + terrain influence | production route/terrain system | **EXTRACT** |
| Fable deterministic generation ideas | reproducible spatial generation | production generators where generation is real | **EXTRACT** selectively |
| Fable track territories / density doctrine | authored spatial experiments and lessons | MISWAY grammar/content | **REFERENCE**, then selective **EXTRACT** |
| Fable debug probes / immersion findings | expensive R&D evidence | World Inspector / tests | **EXTRACT** selectively |
| Fable canvas/shell/input/camera/audio/runtime | competing implementation authorities | none | **REFERENCE** during extraction, then **ARCHIVE** |
| Greybox lab/world | useful inspection/cartography R&D | World Inspector using production runtime | **MIGRATE** |
| masterframes / accepted visual references | accepted artistic targets | `WORLD_CONTENT` + production QA | **KEEP** |
| current primitive-only pilot assets | useful technical pilots, insufficient as universal final foreground art | asset strategy / references | **REFERENCE**; reuse only where quality is adequate |
| removed `src/overrides/*` chase files from #38 | zero unique value after PR #39 canonical migration | canonical runtime files | **DELETE — DONE**, after blob-preserving migration |

## Documentation recovery

| Source/family | Remaining value | Target | Classification |
|---|---|---|---|
| `DRIFT_3D_REALISM_BIBLE.md` | detailed realism doctrine | `WORLD_VISION.md` | **ACTIVE SOURCE → ABSORB** |
| `DRIFT_3D_LIVING_WORLD_BIBLE.md` | detailed world-life/narrative doctrine | `WORLD_VISION.md` / `WORLD_CONTENT.md` | **ACTIVE SOURCE → ABSORB** |
| `DRIFT_3D_GLOBAL_ART_DIRECTION.md` | accepted cross-era synthesis | `WORLD_VISION.md` / `WORLD_CONTENT.md` | **ACTIVE SOURCE → ABSORB** |
| `DRIFT_3D_ERA_TRACK_ATLAS.md` | detailed accepted/preliminary 27-segment content | `WORLD_CONTENT.md` | **ACTIVE SOURCE → ABSORB progressively** |
| accepted Identity Contracts / Cue Maps | local artistic/timing authority | `WORLD_CONTENT.md` delegation + runtime data | **KEEP LOCAL AUTHORITY** until data-driven replacement exists |
| `DRIFT_3D_MASTERFRAME_BRIEFS.md` + evidence | accepted visual targets | `WORLD_CONTENT.md` | **KEEP REFERENCE**, absorb stable decisions |
| `DRIFT_3D_RUNTIME_MIGRATION_MAP.md` | useful previous inventory, now stale vs Fable/#39 | this recovery map + `WORLD_ARCHITECTURE.md` | **HISTORICAL / REFERENCE** |
| `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`, shared-kit target docs | design ideas, often prospective | `WORLD_ARCHITECTURE.md` only when proven | **REFERENCE**, not runtime authority |
| `DRIFT_3D_INTEGRAL_BACKLOG.md` | historical 153-lot plan and traceability | `WORLD_BACKLOG.md` | **HISTORICAL**; no longer day-to-day execution authority |
| `DRIFT_DOCUMENTATION_MAP.md` | useful historical authority map, but reflects pre-convergence regime | canonical WORLD docs | **HISTORICAL / REFERENCE** |
| old art direction / set-design / implementation matrices already superseded | history/provenance only | Git history | **ARCHIVE** |
| evidence files | proof of accepted work | retained evidence | **KEEP REFERENCE** |

## Current recovery conclusion

There is no justification for a wholesale rewrite.

The highest-value convergence path is:

1. preserve the production shell, accepted driving/camera/audio and EUX GAINENT;
2. extract Fable's large geography into the existing production authority;
3. extract routes and coherent land/sea relationships;
4. convert Greybox into an inspector of that same world;
5. simplify transitional wrappers only after behavioral parity is proven;
6. generalize manifests/registries/generators only after the real world demonstrates repeated needs.

**DELETE remains exceptional.** No Fable geographic or artistic R&D is to be deleted during Campaign A.
