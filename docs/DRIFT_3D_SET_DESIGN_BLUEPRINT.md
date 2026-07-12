> **IMPLEMENTED / HISTORICAL.**
> Corridors, node protection and camera visibility remain useful.
>
> ⚠️ **CADUQUE pour le langage visuel (2026-07-07).**
> La source de vérité artistique est désormais
> [DRIFT_3D_REALISM_BIBLE.md](./DRIFT_3D_REALISM_BIBLE.md) : chaque zone doit
> devenir une scène figurative du monde réel, pas un assemblage de primitives
> symboliques. Restent valides ici : la topologie, les corridors, les zones
> no-prop, la protection des nœuds et la règle du quatrième mur caméra.

# DRIFT 3D Set Design Blueprint

Companion SVGs:

* [drift-3d-set-design-blueprint.svg](./drift-3d-set-design-blueprint.svg)
* [drift-3d-set-design-blueprint-v2.svg](./drift-3d-set-design-blueprint-v2.svg)

Companion docs:

* [DRIFT_3D_TRACK_SCENE_MATRIX.md](./DRIFT_3D_TRACK_SCENE_MATRIX.md)
* [DRIFT_3D_LAYOUT_RECOMMENDATION.md](./DRIFT_3D_LAYOUT_RECOMMENDATION.md)

## 1. Purpose

This document is the 2D planning layer for the next Drift 3D implementation lots.

It exists because the direct 3D atmosphere attempts were too abstract:

* fog and color variation did most of the work;
* the world did not read as places;
* Entry was not clearly a cave / lambda threshold;
* Birth Yard was not clearly a dirty city;
* the other eras were not strongly legible from the fixed oblique camera.

The goal here is to lock the scenic plan before any further 3D work.
The next lot should be able to extrude this blueprint directly into readable primitives.

## 2. Methodological pivot

The failed 3D attempts taught one clear rule: atmosphere is not enough.

Drift 3D must be built as a readable set design first, then polished.
That means:

* 2D top-down planning comes before more 3D geometry;
* each era must be understood as a place with a landmark language;
* each track must have a lived scenic cue, not only a category label;
* corridors must stay explicit;
* node protection must be visible in the plan;
* empty space is part of the composition, not a bug.

The new realism principle is not photorealism.
It is lived-scene realism:

* city / crowd / work / canals / office / routine;
* mountain / travel / risk / sports / altitude;
* flat daily life / comfort / nihilism / zero / collapse / reset;
* inner signal / shadow / light / gold / silver / storm / mirror / repair.

In short: this is not a moodboard. It is a production blueprint.

## 3. Source-of-truth extraction

### Files read

* `docs/DRIFT_3D_ART_DIRECTION.md`
* `src/lib/drift3dTopology.ts`
* `src/lib/drift3d.ts`
* `src/lib/tracks.ts`
* `src/components/drift-3d/Drift3DScene.tsx`
* `src/components/drift-3d/Drift3DVehicle.tsx`
* `src/components/drift-3d/Drift3DZone.tsx`
* `src/components/drift-3d/Drift3DHud.tsx`
* `src/components/drift-3d/Drift3DCanvas.tsx`
* `src/components/drift-3d/Drift3DClient.tsx`

### World bounds and transform

The current 3D world is defined by:

* `DRIFT_3D_PLANE_WIDTH = 192`
* `DRIFT_3D_PLANE_DEPTH = 128`
* `DRIFT_3D_FLOOR_Y = -0.08`
* `DRIFT_3D_ZONE_MARKER_Y = -0.06`
* `DRIFT_3D_TRAVEL_Y = 0.16`

The movement bounds are:

* `minX = -92.8`
* `maxX = 92.8`
* `minZ = -60.8`
* `maxZ = 60.8`

The 2D-to-3D world projection used by the route is:

* world `x` = horizontal axis
* world `z` = depth / vertical map axis
* world `y` = traversal height

For the current blueprint SVG, the transform is:

* `svgX = 928 + 8 * worldX`
* `svgY = 672 - 8 * worldZ`

That keeps the actual `x/z` world topology readable in a top-down 2D plan.

### Era records

| era id | label | order | center (x, z) | radius | role | tracks |
|---|---|---:|---:|---:|---|---:|
| `birth-yard` | Birth Yard | 1 | `(-66, 18)` | 30 | macro-region | 4 |
| `older-shadows` | Older Shadows | 2 | `(-26, -30)` | 34 | macro-region | 5 |
| `vegetative-field` | Vegetative Field | 3 | `(0, 10)` | 32 | macro-region | 5 |
| `new-signal` | New Signal | 4 | `(52, -8)` | 46 | macro-region | 10 |

### Track nodes

All 24 nodes are present exactly once in `src/lib/drift3dTopology.ts` and are tied back to
`src/lib/tracks.ts`.

#### Entry threshold

| slug | title | position (x, z) | role | playable | legacy note |
|---|---|---:|---|---|---|
| `entry-node` | Entry Node | `(-88, 12)` | threshold | no | non-playable threshold before the map |

The current vehicle start sits just beyond this threshold, so the first corridor must stay empty
and readable.

#### Current V0 anchor mapping

The legacy anchor set that must remain visually recognizable is:

* `a-walk-in-zeeland` -> `zeeland-road`
* `foolfoule` -> legacy Birth Yard anchor inside the Birth Yard cluster
* `asitis` -> `plain-signal`
* `overthink` -> `neural-loop`
* `hold-the-light` -> `hold-lamp`
* `midnight-work` -> `midnight-office`
* `telatelaba` -> `here-there-islands`

The detailed track-level narrative matrix lives in
[DRIFT_3D_TRACK_SCENE_MATRIX.md](./DRIFT_3D_TRACK_SCENE_MATRIX.md).

## 4. Design doctrine

Drift is the colorful rupture of the MISWAY site.
The site shell can stay dark, white, restrained and minimal.
Drift should not.

The visual doctrine is:

* readable places over abstract atmosphere;
* vivid and expressive over timid;
* primitive-only geometry, but large enough to be seen;
* landmarks before polish;
* corridors before decoration;
* topology before styling;
* lived scenes before category labels.

If a region reads only as color, it fails.
If a region reads as a place, the blueprint is on the right path.

## 5. Map structure

The map is structured as:

* one Entry threshold
* four eras
* 24 track nodes

The spatial narrative is:

Entry Cave
-> Birth Yard
-> Older Shadows
-> Vegetative Field
-> New Signal

The plan must preserve:

* traversal corridors between eras;
* empty travel lanes;
* node protection zones;
* no-prop zones around paths;
* room for future 3D extrusion.

The blueprint has two layers:

* **Layer A:** current-topology enriched blueprint, matching the current repo coordinates
* **Layer B:** candidate layout v2, documented in the recommendation doc and visualized in the
  companion v2 SVG

## 6. Blueprint legend

The SVG companions use these symbols:

* solid dark mass = cave / city / ridge / field / signal landmark body
* bright outline = era boundary or landmark edge
* dashed corridor = keep open for travel
* translucent corridor band = no-prop travel lane
* node circle = track node
* larger node circle = anchor node
* ring around node = protection zone
* glow block / gate = Entry threshold and lambda opening
* triangle / peak = mountain or ridge silhouette
* long horizontal strip = field row / crop band
* island disk = signal island or platform
* thin vertical rod = antenna / mast / signal pole
* small micro-icon = track-level scene cue
* note tag = future 3D extrusion cue

## 7. Era blueprint sections

### Entry

Intent:

* cave / grotto mouth
* lambda threshold
* visible from spawn
* non-playable gate before the world opens

2D symbols:

* two large side masses
* a central open throat
* a lambda-shaped gate
* a backlight block behind the gate
* a single empty approach corridor

Color family:

* black
* violet
* cyan
* cold blue glow

Track scene notes:

* the threshold itself should feel like the dark hero-image cave
* the opening should read like an exit shaped by lambda, not a generic portal

Corridors:

* one clear forward corridor from the threshold into Birth Yard
* no tall props in the opening

No-prop zones:

* the throat itself
* the first approach lane

Future 3D extrusion:

* large dark box / cone clusters
* slanted beams for the lambda
* a bright backplate plane behind the opening

### Birth Yard

Intent:

* dirty dense city
* violent swarm
* broken skyline
* compressed urban pressure

2D symbols:

* crooked rectangles
* broken wall fragments
* leaning skyline shards
* alley gaps
* a central city mass with open lanes around it

Color family:

* dirty red
* magenta
* rust
* ochre
* acid accents

Track scene notes:

* `a-walk-in-zeeland`: canals, sunset city edge, solitary path, meander maze, reflective water-lane
* `foolfoule`: rush-hour corridor, skyscraper canyon, robot crowd grid, oppressive vertical city
* `jazzypling`: dark alley, basement stair, jazz cellar door, neon fragment, unsafe backstreet
* `play-it`: metro line, office grid, suit / routine symbols, rule-lane, clock-in path

Landmarks:

* one broken skyline cluster
* one crooked alley mass
* one lower yard spine

Corridors:

* one north-south corridor through the yard
* one approach lane toward the anchor pair

No-prop zones:

* the node centers
* the main alley lanes

Future 3D extrusion:

* tall boxes
* wall shards
* posts and crooked tower fragments

### Older Shadows

Intent:

* travel
* mountain
* ridge
* expedition
* open breath after urban compression

2D symbols:

* ridge triangles
* angled mountain masses
* route poles
* passage markers
* open gaps between peaks

Color family:

* amber
* earth
* burnt orange
* deep blue shadow

Track scene notes:

* `rise`: summit, ascent path, high peak, vista marker
* `blossoming`: jump ramp, cliff edge, adrenaline arc, sport marker
* `ethnic-stick`: respectful travel marker, warm earth path, symbolic staff, value circle
* `minuit-moins-cinq`: forked path, countdown marker, risk gate, before-midnight decision point
* `perdue`: fading line, dying light, collapsing sign, extinguishing path

Landmarks:

* one main ridge
* one travel marker sequence
* one open summit gap

Corridors:

* one ridgeline travel corridor
* one open approach to the ascent node chain

No-prop zones:

* the ridge path
* the summit opening

Future 3D extrusion:

* cones
* angled prisms
* pole markers
* gate silhouettes

### Vegetative Field

Intent:

* flat
* vegetative
* growing
* horizontal
* stretched surface rhythm

2D symbols:

* long crop rows
* repeated growth bands
* low stems
* surface scars
* broad horizontal spread

Color family:

* green
* yellow-green
* cyan

Track scene notes:

* `morne-et`: flat comfort loop, artificial happiness pad
* `daymason`: hidden underlayer, eye-like marks, buried fissure, invisible pressure
* `chailk`: blank chalk line, erased board, zero mark, empty square
* `time`: broken clock ring, collapsed tiles, slow lane note, time fracture
* `tantitom`: color return gradient, small lanterns, gentle upward path, emotional thaw

Landmarks:

* one broad field spine
* one long row system
* one edge-growth marker set

Corridors:

* one clean left-right movement lane
* one central lane through the bands

No-prop zones:

* the crop lanes
* the node rings

Future 3D extrusion:

* low strips
* long boxes
* stems
* shallow rows

### New Signal

Intent:

* electric archipelago
* antennas
* islands
* signal hubs
* night logic and contrast

2D symbols:

* separated island pads
* thin rods
* rings
* beacons
* multiple subclusters

Color family:

* electric cyan
* violet
* blue
* pink

Track scene notes:

* `neektareum`: responsibility marker, fork out of pit, forward arrow into dark
* `asitis`: ice monolith, cold plane, acceptance gate, frozen shadow
* `relative`: well, springboard, upward spiral, kick mark
* `overthink`: stacked plans, broken road, cracked maze, overloaded thought pile
* `hold-the-light`: storm lines, lighthouse / lamp, bridge-between, standing beacon
* `midnight-work`: small night office, window, desk light, star field, house / nature edge
* `telatelaba`: mirror maze, offset body marker, in-between corridor, reflective labyrinth
* `le-monde-s-endort`: fading city lights, dimming grid, sleeping skyline
* `renee`: raw stone, polished edge, beach light, summer band, fragile / strong material
* `Panthere`: cautious placeholder, dark feline shadow, optical-lambda hint, discreet power

Landmarks:

* one anchor island cluster
* one loop / signal hub cluster
* one night working cluster
* one south-east satellite cluster

Corridors:

* clear water-like / void-like gaps between islands
* at least one lane to each anchor

No-prop zones:

* the spaces between islands
* the node protection circles

Future 3D extrusion:

* pads
* rings
* antenna rods
* beacon towers

## 8. Corridor and gameplay protection

The blueprint protects gameplay before it protects style.

That means:

* vehicle visibility comes first;
* node visibility comes first;
* corridors stay open;
* props stay out of traversal lanes;
* node centers stay clear;
* empty space is intentional design, not missing content.

Update (`DRIFT-3D-17`, 2026-07-06): decorative props are now solid collision
volumes (see `docs/DECISIONS_LOG.md`). This raises the stakes of the corridor
rule above rather than removing it — a prop left inside a travel lane now
physically blocks the vehicle, not just visually clutters the shot. Proximity
zones and node markers remain non-solid; only physical decor (signs, lamps,
stones, desks, speakers, synths, chairs, bridges) collides.

The fixed oblique camera still needs readable silhouettes, so the plan favors broad landmark masses at the edges of corridors rather than clutter in the center of travel.

## 9. 3D extrusion table

The detailed track-level motif list lives in
[DRIFT_3D_TRACK_SCENE_MATRIX.md](./DRIFT_3D_TRACK_SCENE_MATRIX.md).

The primitive extrusion logic remains:

| blueprint element | future 3D geometry cue |
|---|---|
| cave mass | large dark box / cone / rock-like primitive cluster |
| lambda gate | slanted beams + backplate plane |
| city block | box / tower / wall shard |
| skyline shard | leaning box / tall prism |
| ridge triangle | cone / angled prism / mountain silhouette |
| travel marker | pole / cylinder / gate |
| field row | low strip / stem / band |
| crop lane | long low box / plane |
| signal island | pad / ring / platform |
| antenna | cylinder / rod / beacon |
| corridor | must remain empty |
| node protection circle | no tall prop zone |

## 10. Human review checklist

Before the next 3D lot, a human reviewer should be able to answer:

* Do I understand the world at a glance?
* Does Entry read as cave / lambda?
* Does Birth Yard read as dirty city?
* Does Older Shadows read as ridge / travel?
* Does Vegetative Field read as field / growth?
* Does New Signal read as archipelago / signal?
* Do the track scenes feel personal rather than generic?
* Are any motifs too literal, too cliche, or too abstract?
* Which track still needs human clarification before 3D?
* Are the corridors obvious?
* Are the nodes protected?
* Can this be extruded into 3D without inventing new topology?

## 11. Pass / fail criteria

This blueprint fails if:

* it reads only as color zones;
* the 24 nodes are not all present;
* corridors are unclear;
* the SVG contradicts `src/lib/drift3dTopology.ts`;
* any era lacks a major landmark;
* any track lacks a lived scenic cue;
* the plan cannot be translated into the next 3D set-design lot.

If the blueprint passes, the next 3D lot can extrude the landmarks directly from this plan.

## 12. Layout readability review

The current topology is readable, but still slightly compressed for scenic separation.

The main pressure points are:

* Birth Yard and Vegetative Field are still close enough to blur if the 3D set design becomes dense;
* New Signal wants more voids between subclusters;
* Older Shadows benefits from a more open expedition arc;
* the track-level scenes need more breathing room than the current runtime map offers.

The candidate layout v2 therefore widens the worlds while keeping the same era assignments.
The full recommendation lives in
[DRIFT_3D_LAYOUT_RECOMMENDATION.md](./DRIFT_3D_LAYOUT_RECOMMENDATION.md)
and the visual comparison lives in
[drift-3d-set-design-blueprint-v2.svg](./drift-3d-set-design-blueprint-v2.svg).

## 13. Topology recommendation

**ADOPT_LAYOUT_V2_BEFORE_3D**

The current topology is a valid base, but the v2 layout will better support readable set design,
track-level narrative scenes, and future primitive extrusion without crowding the corridors.
