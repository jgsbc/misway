# DRIFT 3D — Free / Open Asset Resource Catalog

**Lot:** `DRIFT-ASSET-GOV-00`  
**Status:** `ACTIVE RESEARCH CATALOG AFTER OWNER ACCEPTANCE`  
**Purpose:** reusable discovery sources for MISWAY before custom modeling.

This is a **research catalog**, not a blanket legal approval. Every downloaded asset still requires an entry in `DRIFT_3D_ASSET_REGISTRY.json`.

## 1. Search order

Use this order before creating new geometry:

1. existing MISWAY runtime/source asset;
2. CC0 pack/library;
3. CC BY downloadable model;
4. other explicitly compatible license;
5. custom modeling only when reuse cannot satisfy artistic/technical need.

## 2. Tier A — CC0 preferred

### Quaternius
Site: https://quaternius.com/

License policy: all models CC0; commercial use and modification allowed; attribution not required.

Particularly relevant:
- Downtown City MegaKit — 315 modular urban models, 60–70% free tier, glTF/FBX/OBJ:
  https://quaternius.com/packs/downtowncitymegakit.html
- Ultimate Animated Character Pack — 52 animated characters:
  https://quaternius.com/packs/ultimatedanimatedcharacter.html
- Stylized Nature MegaKit — 116 nature models:
  https://quaternius.com/packs/stylizednaturemegakit.html

MISWAY use:
- structural/blocking modules;
- repeated background buildings;
- low-cost distant people;
- vegetation vocabulary;
- prototyping before sourcing a more realistic hero asset.

Caution:
- stylization may conflict with Realism Bible at close range;
- use as structure/background/LOD unless visual review proves otherwise.

### Kenney
Site: https://kenney.nl/assets

License policy: game assets on asset pages are CC0; commercial use allowed; attribution not required.

Birth Yard relevant:
- City Kit (Roads), 70 files:
  https://kenney.nl/assets/city-kit-roads
- City Kit (Industrial), 25 files:
  https://kenney.nl/assets/city-kit-industrial
- City Kit (Commercial), 50 files:
  https://kenney.nl/assets/city-kit-commercial
- City Kit (Suburban), 40 files:
  https://kenney.nl/assets/city-kit-suburban
- Modular Buildings, 100 files:
  https://kenney.nl/assets/modular-buildings
- Train Kit, 100 files:
  https://kenney.nl/assets/train-kit

MISWAY use:
- road grammar;
- background modules;
- industrial/port support;
- rail/commuter kitbashing;
- collision/blocking prototypes.

### Poly Haven
Site: https://polyhaven.com/

License policy: HDRIs, textures and 3D models are CC0.

Use primarily for:
- PBR materials;
- HDRIs/reference lighting;
- rocks/vegetation/props where available.

License:
https://polyhaven.com/license

API:
https://api.polyhaven.com/
The public API was announced as free for commercial use in July 2026.

## 3. Tier B — Sketchfab CC BY

Search:
https://sketchfab.com/3d-models?features=downloadable

Sketchfab free downloadable models can carry different Creative Commons restrictions. MISWAY default acceptance:
- CC0: accept;
- CC BY: accept with attribution;
- CC BY-SA: review before use;
- NC: reject by default;
- ND: reject when adaptation is required.

Guidance:
https://sketchfab.com/blogs/community/an-introduction-to-creative-commons-licenses/

Attribution must follow the asset when required.

### Useful collection behavior

Sketchfab user collections are useful discovery aids but are **not authorities for the license of each contained model**. Re-check the individual model page before download.

## 4. Birth Yard candidate library — current researched shortlist

These are candidates, not yet production-approved.

### Shared port / Zeeland / Funky Hoo

**Dutch Canals House Amsterdam #1**  
Author: ustoopia  
License: CC BY  
Source: https://sketchfab.com/3d-models/dutch-canals-house-amsterdam-1-e81a1b1f7fa54214983fa884fde76b46  
Reported: 74.2k triangles / 40.4k vertices  
Use hypothesis: extract façade/building vocabulary; not blindly duplicate whole model.

**Windmill**  
Author: Yury Misiyuk  
License: CC BY  
Source: https://sketchfab.com/3d-models/windmill-0730705327e045bd8cb98a888bd0f954  
Reported: 2.9k triangles / 2k vertices; animated; LOD; 1K textures  
Use hypothesis: distant Zeeland landmark.

**Port pack [Update 1]**  
Author: inpakgames  
License: CC BY  
Source: https://sketchfab.com/3d-models/port-pack-update-1-67d6108926014f31806969c6b1111d57  
Reported: 8.4k triangles / 4.9k vertices  
Contains: buildings, barrel, box, trade point, wooden bridge, tent, billboard  
Use hypothesis: selective quay/port props.

### Foolfoule

**Low Detail Animated Crowd**  
Author: Shahriar Shahrabi  
License: CC BY  
Source: https://sketchfab.com/3d-models/low-detail-animated-crowd-4fe76fdec12d456f9b0db06b45cc53d6  
Reported: 10.3k triangles / 5.2k vertices  
Author states it is designed for distant viewing and uses a single material.  
Use hypothesis: background crowd layer only.

**Low-poly Billboard Pack**  
Author: staticcc  
License: CC BY  
Source: https://sketchfab.com/3d-models/low-poly-billboard-pack-f5da73b8050a4e7d9fce53b6171ccbc7  
Reported: 2k triangles / 1.2k vertices  
Use hypothesis: geometry only; replace branded/source textures with MISWAY-authored content where rights/identity require.

### Jazzypling

**Jazz Club**  
Author: 22079319  
License: CC BY  
Source: https://sketchfab.com/3d-models/jazz-club-1d9eb862d31d46b081e568718b4d3396  
Reported: 76.9k triangles / 39.8k vertices  
Use hypothesis: mine selected interior/club parts; do not assume whole scene.

Alley candidates are abundant. Prefer a visually suitable CC BY alley **after** inspecting texture/material cost; no alley candidate is frozen by this governance lot.

### Play It

**Subway station**  
Author: Pasha  
License: CC BY  
Source: https://sketchfab.com/3d-models/subway-station-fa31f1ebe8cb437f9c753b22b3fdfc55  
Reported: 32.4k triangles / 24.2k vertices  
Use hypothesis: station/commuter kit source.

Alternative lighter candidate:

**Subway Station Scene**  
Author: VictorianBlue  
License: CC BY  
Source: https://sketchfab.com/3d-models/subway-station-scene-be5ac5b18d0e4103ac8f8c9baff6c30c  
Reported: 28.1k triangles / 17k vertices  
Description says kit set itself is 4,475 tris.  
Use hypothesis: potentially better modular source after inspection.

Plus Kenney Train Kit (CC0) for low-cost rail/track vocabulary.

### Peut-être

**Haussmannien building 3**  
Author: pacpak  
License: CC BY  
Source: https://sketchfab.com/3d-models/haussmannien-building-3-9c028403d5894752bffba7b25b1b2266  
Reported: 37.8k triangles / 18.8k vertices  
Author states the building is constructed from individual pieces and can be deconstructed/rebuilt.  
Use hypothesis: strong kitbash candidate for partial-burial Paris façade language.

**Dunes Landscape**  
Author: arpermopi1971  
License: CC BY  
Source: https://sketchfab.com/3d-models/dunes-landscape-c81be12f8ea846e2a938466d33244489  
Reported: 2.8k triangles / 1.5k vertices  
Use hypothesis: geometry/material reference for accumulated sand; do not turn Peut-être into a disconnected desert biome.

### Sugared Peach

**Trumpet_Free**  
Author: AlvaWong  
License: CC BY  
Source: https://sketchfab.com/3d-models/trumpet-free-02d9fe6d3fed47d886f1e9f2a9491faa  
Reported: 1k triangles / 551 vertices  
Use hypothesis: cheap repeated trumpet prop, paired with an approved character/animation source.

Quaternius Ultimate Animated Character Pack (CC0) is a candidate for prototype animation/rig sourcing. Realism review is required before final close-range use.

## 5. User-supplied candidate requiring explicit intake

**Street City 7 for Games Free**  
Source supplied by owner:  
https://sketchfab.com/3d-models/street-city-7-for-games-free-493a69b451284ff88346c7b3e4e1b5a7

Potential use:
- Foolfoule urban canyon;
- shared Birth Yard building/street fragments.

Status:
`DISCOVERED — LICENSE/STATS/CONTENT INSPECTION REQUIRED`

Do not mark accepted until individual page/license and downloaded source are inspected.

## 6. Selection doctrine

Choose an asset based on:
1. visual identity delivered at actual camera distance;
2. license safety;
3. extractability;
4. material/texture cost;
5. draw-call structure;
6. instancing/reuse potential;
7. quality under simplification/LOD;
8. compatibility with Birth Yard shared palette;
9. provenance confidence.

Do not choose by triangle count alone.

## 7. Anti-hoarding rule

Research may identify many candidates, but the repo/runtime should not become a library dump.

For each functional need:
- shortlist maximum ~3 serious candidates;
- inspect;
- choose one preferred source or decide existing/custom is better;
- record rejected alternatives and reason;
- stop searching when the need is adequately solved.

## 8. License references

- Kenney support/license: https://kenney.nl/support
- Quaternius FAQ/license: https://quaternius.com/faq.html
- Poly Haven license: https://polyhaven.com/license
- Sketchfab CC overview: https://sketchfab.com/blogs/community/an-introduction-to-creative-commons-licenses/
- Sketchfab download API licensing/attribution guidance: https://sketchfab.com/developers/download-api/guidelines
