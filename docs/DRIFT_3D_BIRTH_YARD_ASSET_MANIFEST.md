# DRIFT 3D — Birth Yard Asset Manifest

**Lot:** `DRIFT-ASSET-GOV-00`  
**Status:** `PROPOSED — OWNER GATE REQUIRED`  
**Parent authorities:**
- `docs/DRIFT_3D_SPATIAL_BIBLE.md`
- `docs/DRIFT_3D_BIRTH_YARD_SPATIAL_GRAPH.md`
- `docs/DRIFT_3D_ASSET_PERFORMANCE_BIBLE.md`
- `docs/DRIFT_3D_LOADING_ARCHITECTURE.md`

**Machine companion:** `docs/DRIFT_3D_BIRTH_YARD_ASSET_MANIFEST.json`

## 1. Governing idea

Birth Yard is **one continuous northern-European port city with several local mutations**, not seven independently loaded dioramas.

The asset strategy must therefore maximize:

- shared urban vocabulary;
- selective hero assets;
- kitbashing/extraction rather than whole-scene imports;
- reuse of Zeeland's accepted water/harbour geography;
- visual identity per track without duplicating infrastructure;
- bounded runtime residency and mobile performance.

```text
BIRTH YARD SHARED PALETTE
│
├── roads / quays
├── modular urban fabric
├── industrial/port support
├── commercial support
├── shared props/materials
└── reusable people vocabulary

        +

TRACK MUTATION
│
├── 1–3 hero asset sources
├── local decals/signage
├── lighting/atmosphere mutation
└── small track-specific animation/event layer
```

A downloaded external model is never assumed to be a runtime scene. It is a source from which the smallest useful derivative is produced.

## 2. Shared Birth Yard palette — solve this first

### Required roles

1. road / curb / sidewalk grammar;
2. modular urban façades and massing;
3. industrial / quay vocabulary;
4. commercial frontage vocabulary;
5. reusable street furniture;
6. low-cost population vocabulary;
7. shared PBR materials: brick, wet asphalt, concrete, metal, painted wood, glass;
8. shared decals: grime, rust, posters, road wear;
9. lightweight distant skyline/landmark vocabulary.

### Current candidates

| Need | Preferred candidate | License | Intended use |
|---|---|---|---|
| urban modules | Quaternius Downtown City MegaKit | CC0 | structure/background modules after realism review |
| roads | Kenney City Kit (Roads) | CC0 | road/module source, not necessarily final visual authority |
| industrial/port | Kenney City Kit (Industrial) | CC0 | support geometry / background / prototypes |
| commercial | Kenney City Kit (Commercial) | CC0 | support geometry / storefront vocabulary |
| people | Quaternius Ultimate Animated Character Pack | CC0 | prototype/background candidates; close-range realism review required |
| materials | Poly Haven | CC0 | primary PBR material source |

### Shared-palette anti-goals

Do not:
- paste a complete Quaternius/Kenney city unchanged;
- let low-poly stylization override the Realism Bible at close range;
- duplicate a building/prop per track when one shared runtime source works;
- create separate road/material systems for individual songs;
- create a second harbour/water authority.

## 3. A WALK IN ZEELAND

### Spatial/artistic role

First open Birth Yard reveal. Canal/working harbour at dusk, Dutch brick language, dry route, broad horizon, solitude.

### Asset needs

**Shared:**
- quay/road modules;
- brick/stone/wet-surface materials;
- industrial port support.

**Hero:**
1. recognizable Dutch canal façade vocabulary;
2. one distant Dutch landmark/silhouette;
3. selective quay/port props.

### Candidates

- `birth-yard-dutch-house-01` — Dutch Canals House Amsterdam #1 — CC BY;
- `birth-yard-windmill-01` — Windmill — CC BY;
- `birth-yard-port-pack-01` — Port pack [Update 1] — CC BY.

### Intended transformations

- extract façade/building language rather than cloning a street wall repeatedly;
- reduce/material-consolidate as required;
- use windmill only if it supports the accepted Zeeland horizon without becoming postcard décor;
- select only useful port props from pack;
- preserve existing structural water/shore authority.

### Anti-goals

- second harbour;
- decorative water rectangles;
- dense prop wall that destroys Zeeland openness;
- tourist-Holland theme park;
- water/road contradiction.

## 4. FOOLFOULE

### Spatial/artistic role

Commercial canyon and social pressure. Density increases from Zeeland; crowd and advertising create compression without blocking the drive corridor.

### Asset needs

**Shared:**
- urban modules;
- commercial frontage;
- road/street furniture.

**Hero:**
1. convincing dense vertical street fragments;
2. cheap animated/distant crowd;
3. repeated billboard/sign structures.

### Candidates

- `birth-yard-street-city-7` — Street City 7 for Games Free — license/stats still unverified;
- `birth-yard-crowd-distant-01` — Low Detail Animated Crowd — CC BY;
- `birth-yard-billboard-pack-01` — Low-poly Billboard Pack — CC BY.

### Intended transformations

- inspect Street City 7 before any download/runtime decision;
- if accepted, extract a few useful façades/roadside masses only;
- use background crowd at appropriate distance, never as close hero humans;
- instance repeated crowd/sign geometry where technically suitable;
- replace source/branded billboard imagery with MISWAY-owned graphics where rights or identity require.

### Anti-goals

- importing an entire city scene unchanged;
- one unique material/texture per billboard;
- close-up low-detail crowd;
- visual clutter that makes the route unreadable;
- performance pressure from dozens of transparent/emissive signs.

## 5. SUGARED PEACH

### Spatial/artistic role

A small comic/physical release pocket between Foolfoule pressure and Play It order. Three hopping brass figures are ordinary street absurdity, not a circus destination.

### Asset needs

**Shared:**
- small irregular street pocket;
- people/animation base.

**Hero:**
1. lightweight trumpet prop;
2. three animated performers or one reusable rig instantiated/varied.

### Candidates

- `birth-yard-trumpet-01` — Trumpet_Free — CC BY;
- `birth-yard-quaternius-animated-characters` — Ultimate Animated Character Pack — CC0, prototype/background candidate.

### Intended transformations

- trumpet can be repeated/instanced if material/geometry is shared;
- animation should remain low-cost and readable from vehicle distance;
- if Quaternius characters fail realism review, retain only animation/rig inspiration and source a better compatible character solution.

### Anti-goals

- circus/stage/plaza world;
- large crowd;
- blocked road;
- three unique heavy hero characters when reuse suffices.

## 6. PLAY IT

### Spatial/artistic role

Urban order tightens into commuter/business cadence: crossings, metro/rail language, aligned façades, repetition and rules.

### Asset needs

**Shared:**
- commercial/office urban fabric;
- road markings / crossings.

**Hero:**
1. station/metro entrance or visible shallow station language;
2. rail/train components;
3. repeated ordered pedestrian/commuter cues.

### Candidates

- `birth-yard-subway-pasha-01` — Subway station — CC BY;
- `birth-yard-subway-victorianblue-01` — Subway Station Scene — CC BY;
- `birth-yard-kenney-train` — Train Kit — CC0.

### Selection rule

Inspect both subway sources and choose the **smallest convincing modular derivative**, not the most complete scene.

### Intended transformations

- extract station entrance/platform/signage fragments as needed;
- avoid full interior if the player never sees it;
- use repeated rail/commuter elements rhythmically;
- keep transition from Sugared Peach visible in street organization before the track center.

### Anti-goals

- full underground environment loaded unnecessarily;
- isolated train-station diorama;
- transport assets that do not contribute to the visible route;
- expensive crowd simulation.

## 7. JAZZYPLING

### Spatial/artistic role

Crooked nocturnal cellar/alley district. The same city reveals its musical underside through warm interior leakage and compact semi-interior spaces.

### Asset needs

**Shared:**
- service/back-street modules;
- brick/wet pavement;
- street props.

**Hero:**
1. selected club/cellar fragments;
2. small musical landmark/prop if needed;
3. restrained signage/door lighting.

### Candidate

- `birth-yard-jazz-club-01` — Jazz Club — CC BY.

Alley geometry remains an open sourcing need; shortlist only after the shared city palette is inspected, because a new alley source may be unnecessary.

### Intended transformations

- mine a few convincing interior/club fragments;
- create shallow views through doors/windows rather than loading a large interior if gameplay does not enter it;
- allow music/light to imply more space than is geometrically present.

### Anti-goals

- standalone jazz-club diorama;
- neon theme park;
- giant interior behind every door;
- widening the district until it loses cellar/backstreet character.

## 8. FUNKY HOO

### Spatial/artistic role

West-quay nightlife spur. Same harbour city after dark: Dutch/Amsterdam memory, service spaces, wet pavement, restrained red-window register and port residue.

### Asset needs

**Shared:**
- Zeeland harbour/water authority;
- industrial/quay palette;
- road/material palette.

**Hero:**
1. selected Dutch façade(s);
2. quay/service props;
3. local night-frontage details.

### Candidates

- `birth-yard-dutch-house-01` — Dutch Canals House Amsterdam #1 — CC BY;
- `birth-yard-port-pack-01` — Port pack [Update 1] — CC BY;
- `birth-yard-kenney-industrial` — City Kit (Industrial) — CC0.

### Intended transformations

- reuse Zeeland water and harbour geography;
- change frontage, activity, wetness, light and density rather than rebuilding Amsterdam;
- create shallow interiors/windows instead of full buildings where possible;
- share Dutch façade/material derivatives with Zeeland when visually appropriate.

### Anti-goals

- second canal network;
- Amsterdam postcard;
- red-light theme park;
- duplicate water shader/authority;
- full heavy city pack resident for one spur.

## 9. PEUT-ÊTRE

### Spatial/artistic role

Southern Birth Yard fringe where recognizable Parisian urban fabric is partially buried by accumulated sand. City first; sand mutation second.

### Asset needs

**Shared:**
- southern urban/service-edge vocabulary;
- road infrastructure.

**Hero:**
1. modular Haussmann fragments;
2. light sand/dune geometry/material language;
3. partially buried civic/street props from shared palette.

### Candidates

- `birth-yard-haussmann-building-03` — Haussmannien building 3 — CC BY;
- `birth-yard-dunes-01` — Dunes Landscape — CC BY.

### Intended transformations

- deconstruct Haussmann source into a few façade modules;
- partially bury/occlude modules rather than building full Paris;
- use lightweight sand geometry and/or terrain/material blend;
- preserve Birth Yard road/city continuity into the fringe.

### Anti-goals

- separate desert biome;
- Sahara teleport;
- full Paris recreation;
- giant Eiffel Tower requirement;
- sand geometry that breaks driving/collision authority.

## 10. Acquisition priority

Do not download every candidate at once.

### P0 — shared palette + vertical-slice preparation

1. inspect and verify `Street City 7 for Games Free` license, author, formats, textures and source stats;
2. obtain/inspect free Quaternius Downtown City MegaKit subset;
3. obtain/inspect Kenney City Kit Roads;
4. obtain/inspect Kenney City Kit Industrial;
5. obtain Dutch Canals House Amsterdam #1;
6. obtain Port pack [Update 1];
7. choose a small CC0 Poly Haven material set for brick/wet asphalt/concrete as required.

Purpose: determine whether **Funky Hoo** can be built as a convincing mutation of existing Zeeland/shared Birth Yard without creating a large new asset payload.

### P1 — only after shared palette inspection

- optional additional background urban modules;
- one or two reusable props/materials that close obvious gaps.

Do not fill the library preemptively.

### P2 — later track-specific sourcing

- Foolfoule crowd + billboards;
- one selected subway source + Train Kit;
- Jazz Club fragments;
- Haussmann source + Dunes source;
- Trumpet + selected character/animation solution.

## 11. Runtime capsule doctrine by track

Each track capsule should normally contain only:

- hero geometry not already in the Era Palette;
- track-only decals/signs;
- track-only animation data;
- track-only material/light variants;
- optional track-specific audio/interaction bindings outside this asset manifest.

Do not duplicate shared roads, bricks, lamps, crowd rigs, Dutch façade modules or port props into each capsule package.

## 12. Candidate status does not equal approval

A candidate in this manifest means:
- worth downloading/inspecting;
- likely compatible in license/role based on available source information.

It does **not** mean:
- visually accepted;
- performance accepted;
- downloaded;
- optimized;
- production-ready.

Final acceptance requires the Asset & Performance Bible `MISWAY_READY` gate.

## 13. First vertical slice

After governance acceptance **and** performance baseline capture, the recommended next lot is:

`DRIFT-ASSET-BY-10 — Funky Hoo Vertical Slice`

Why Funky Hoo:
- reuses already-proven Zeeland harbour/water authority;
- exercises shared Birth Yard architecture and port props;
- exercises external CC0/CC BY intake;
- exercises texture/material optimization;
- exercises a destination spur and U-turn residency case;
- exercises night-light/material preparation;
- can prove major visual uplift without replacing all seven tracks.

### Boundaries

Allowed:
- minimal shared-palette subset needed for the slice;
- Funky Hoo hero subset;
- asset intake/optimization scripts/configuration;
- predictive warm/residency proof;
- performance instrumentation required by the baseline protocol.

Forbidden:
- seven-track visual replacement;
- world-engine rewrite;
- route graph redesign;
- new water authority;
- vehicle/camera/physics redesign;
- broad new dependency stack without measured justification.

## 14. Go gate before `DRIFT-ASSET-BY-10`

- [ ] owner accepts `DRIFT-ASSET-GOV-00` doctrine;
- [ ] current desktop performance baseline measured;
- [ ] current smartphone performance baseline measured;
- [ ] acceptance envelope populated;
- [ ] P0 source licenses verified;
- [ ] P0 candidates inspected for materials/textures/geometry;
- [ ] exact Funky Hoo source subset chosen;
- [ ] estimated runtime payload documented;
- [ ] no broad asset hoarding in repo.

Only then does implementation begin.
