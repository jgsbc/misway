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
| `/drift` production shell (`Drift3DClient`, `Drift3DCanvas`) | working shell, lifecycle, inputs/pinch, audio integration | production runtime | **KEEP** |
| canonical chase controls/camera | owner-validated vehicle-relative controls and chase behavior | production driving | **KEEP** |
| canonical vehicle physics | validated arcade/simcade base, terrain following, airborne/collisions | production driving | **KEEP** |
| `drift3dBase`, `drift3dVehiclePhysicsBase`, `Drift3DSceneBase` | preserved pre-migration implementations | simpler canonical modules after parity proof | **MIGRATE — OPEN** |
| legacy translation-follow callback in `Drift3DSceneBase` | superseded camera behavior | none after parity proof | **ARCHIVE → DELETE only after visual parity** |
| `drift3dTopologyBase`, `drift3dTerrainLegacy`, `drift3dScatterBase` | preserved local production data/behavior used during recovery | canonical spatial/population authorities | **MIGRATE — OPEN** |
| `drift3dAudioClock`, cue resolver, signature arbitration, lifecycle | proven shared temporal contracts | production / later reusable runtime | **KEEP** |
| EUX GAINENT accepted dramaturgy/cues/living scene | accepted artistic + technical proof | MISWAY track territory / reusable patterns later | **KEEP**; selective **EXTRACT** later |
| canonical `drift3dTopology` / `drift3dTerrain` | production peninsula/topology/ground truth after #42/#43 | production spatial authority | **KEEP — RECOVERY DONE** |
| canonical `drift3dRoutes` | five recovered routes + deterministic distance/altitude field | production route authority | **KEEP — RECOVERY DONE** |
| canonical `drift3dWater` + sea surface | geographic water depth + single sea-level rendering authority | production water authority | **KEEP — RECOVERY DONE** |
| current scatter/instancing | proven efficient local population primitive | future population grammar inputs | **KEEP**; selective **EXTRACT** only when justified |
| atmosphere / texture / material helpers | proven reusable visual infrastructure | current visual runtime | **KEEP** |
| Fable peninsula spine/bounds/x-z regions | large-world geography and coherent era placement | production MISWAY geography | **EXTRACT — DONE in #42** |
| Fable terrain / region weighting / bay field | relief, coast and depth R&D | production terrain | **EXTRACT — DONE/ADAPTED in #42/#44** |
| Fable route network / route distance field | route continuity + terrain influence | production route/terrain | **EXTRACT — DONE in #43** |
| Fable deterministic generation ideas | reproducible spatial generation | current geography/routes and future proven generators | **PARTIAL EXTRACT — KEEP REFERENCE** |
| Fable track territories / density doctrine | authored spatial experiments and lessons | future MISWAY grammar/content | **REFERENCE** |
| Fable debug probes / immersion findings | expensive R&D evidence | tests / World Inspector | **PARTIAL EXTRACT — KEEP REFERENCE** |
| Fable canvas/shell/input/camera/audio/runtime | competing authorities | none | **REFERENCE → ARCHIVE**, never merge wholesale |
| old Greybox lab/world | cartography/debug R&D | World Inspector | **MIGRATE — DONE in #45** |
| `/drift-greybox-lab` after #45 | Inspector over exact production runtime | debugging authority | **KEEP** |
| masterframes / accepted visual references | accepted artistic targets | `WORLD_CONTENT` + visual QA | **KEEP** |
| primitive-only pilot assets | useful technical pilots, insufficient as universal final foreground art | Hero Slice / asset strategy | **REFERENCE**; reuse only where quality is adequate |
| removed `src/overrides/*` chase files | zero unique value after canonical migration | canonical runtime | **DELETE — DONE in #39** |

## Documentation recovery

| Source/family | Remaining value | Target | Classification |
|---|---|---|---|
| `DRIFT_3D_REALISM_BIBLE.md` | detailed realism doctrine | `WORLD_VISION.md` | **SOURCE → ABSORB as touched** |
| `DRIFT_3D_LIVING_WORLD_BIBLE.md` | detailed world-life/narrative doctrine | `WORLD_VISION.md` / `WORLD_CONTENT.md` | **SOURCE → ABSORB as touched** |
| `DRIFT_3D_GLOBAL_ART_DIRECTION.md` | accepted cross-era synthesis | canonical WORLD docs | **SOURCE → ABSORB as touched** |
| `DRIFT_3D_ERA_TRACK_ATLAS.md` | detailed 27-segment content | `WORLD_CONTENT.md` | **SOURCE → ABSORB progressively** |
| accepted Identity Contracts / Cue Maps | local artistic/timing authority | runtime data / `WORLD_CONTENT` delegation | **KEEP LOCAL AUTHORITY** until data-driven replacement exists |
| masterframe briefs + evidence | accepted visual targets | `WORLD_CONTENT.md` | **KEEP REFERENCE** |
| `DRIFT_3D_RUNTIME_MIGRATION_MAP.md` | previous inventory | canonical WORLD docs / Git history | **HISTORICAL / REFERENCE** |
| integral systems/shared-kit target docs | prospective ideas | `WORLD_ARCHITECTURE.md` only when proven | **REFERENCE**, not runtime authority |
| `DRIFT_3D_INTEGRAL_BACKLOG.md` | historical 153-lot traceability | `WORLD_BACKLOG.md` | **HISTORICAL** |
| `DRIFT_DOCUMENTATION_MAP.md` | pre-convergence authority map | canonical WORLD docs | **HISTORICAL / REFERENCE** |
| superseded implementation matrices | provenance only | Git history | **ARCHIVE** |
| evidence files | proof of accepted work | retained evidence | **KEEP REFERENCE** |

## Recovery state after Campaign A foundations

The major R&D harvest is complete enough to stop treating Fable/Greybox as alternative products:

1. production shell, driving, audio and accepted content were preserved;
2. Fable peninsula geography was extracted into production;
3. Fable routes and route-shaped terrain were extracted;
4. canonical sea/coast/bay queries and rendering were established;
5. Greybox became an Inspector of the same runtime.

Remaining recovery work is **cleanup, not a rewrite**. Do not delete the `*Base` / `*Legacy` sources until the running world has passed Kill Gate A and each preserved behavior has an equivalent canonical home.

**DELETE remains exceptional.** Fable artistic/geographic R&D remains available in branch history even when no longer authoritative.
