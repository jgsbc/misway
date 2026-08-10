# DRIFT 3D — Canonical Spatial Bible

**Lot:** `DRIFT-SPATIAL-GOV-00`  
**Status:** `ACTIVE SPATIAL AUTHORITY` after owner acceptance/merge  
**Scope:** paths, track placement, era geography, spatial continuity and the workflow used to change them.  
**Non-scope:** this document does not redefine track meaning, cue timing, vehicle physics, camera behavior, materials, lighting, anomalies or signatures already governed elsewhere.

## 1. Purpose

MISWAY already contains a large artistic corpus and a functioning world. The current problem is not missing artistic information; it is that spatial information is distributed across runtime code, old era contracts, the Era/Track Atlas and later Evolution proofs.

This Bible creates one short spatial authority so an agent can answer, before touching code:

1. what each era must feel like geographically;
2. what each active track means spatially;
3. where it exists now;
4. whether that position is provisional, proven in lab or promoted;
5. how it is approached and exited when that is already known;
6. what is still genuinely open and therefore must not be invented silently.

The machine-readable companion is `docs/DRIFT_3D_SPATIAL_ATLAS.json`.

## 2. Authority order for spatial work

Use the narrowest authority that answers the question.

```text
CURRENT DELIVERED STATE
→ runtime code

CURRENT CATALOGUE / ERA MEMBERSHIP
→ src/lib/tracks.ts
→ src/lib/drift3dTopology.ts
→ DRIFT_3D_SPATIAL_ATLAS.json

APPROVED SPATIAL INTENT / PLACEMENT STATUS
→ this Bible
→ DRIFT_3D_SPATIAL_ATLAS.json

ERA IDENTITY
→ relevant DRIFT_3D_ERA_*_CONTRACT.md

TRACK MEANING / ANOMALY / SIGNATURE
→ DRIFT_3D_ERA_TRACK_ATLAS.md
→ approved Identity Contract when one exists

VISUAL REALISM / MATERIAL / LIGHT / SCALE
→ DRIFT_3D_REALISM_BIBLE.md
→ DRIFT_3D_GLOBAL_ART_DIRECTION.md
→ accepted masterframes

MUSICAL TIMING
→ approved Cue Map when one exists
```

### Critical distinction

A coordinate present in runtime code proves **where something is currently represented**. It does not by itself prove that JG artistically accepted that coordinate as final.

A later staging layer may also make the effective runtime position differ from the raw topology coordinate. Therefore the Spatial Atlas keeps both `topologyPosition` and `effectiveProductionPosition` when they differ.

No agent may collapse these concepts into one field.

## 3. Catalogue reconciliation — 2026-08-10

The active runtime catalogue is now **32 tracks**, not the 26-track catalogue recorded by the July 2026 Era/Track Atlas and era contracts.

### Entry

Entry is a threshold segment, not a catalogue track.

### Birth Yard — 7 active tracks

- A WALK IN ZEELAND
- FOOLFOULE
- JAZZYPLING
- PLAY IT
- FUNKY HOO
- PEUT-ETRE
- SUGARED PEACH

`EUX GAINENT` no longer belongs to Birth Yard.

### Older Shadows — 5 active tracks

- RISE
- BLOSSOMING
- ETHNIC STICK
- MINUIT MOINS CINQ
- PERDUE

### Vegetative Field — 6 active tracks

- MORNE, ET ?
- DAYMASON
- CHAILK
- TIME
- TANTITOM
- WHITE CLOUDS

### New Signal — 14 active tracks

- NEEKTAREUM
- ASITIS
- RELATIVE
- OVERTHINK
- HOLD THE LIGHT
- MIDNIGHT WORK
- TELATELABA
- LE MONDE S'ENDORT
- RENEE
- PANTHERE
- EUX GAINENT
- ASSOKAM
- WO-HA
- AMIDIR

`ÉTÉÉAOOÉTÉ` is retired from the active catalogue. A compatibility landmark tombstone may remain in code, but it is not a track, era member or placement target.

### Consequence for older documents

The July Era Contracts and `DRIFT_3D_ERA_TRACK_ATLAS.md` remain valuable artistic sources for the tracks they describe, but their **track counts, current memberships and closing-track assumptions are not current catalogue authority**. They must not be used to move EUX back to Birth Yard, resurrect ÉTÉÉAOOÉTÉ, or omit the seven newer active slugs.

## 4. Spatial invariants

1. `1 world unit ≈ 1 metre`.
2. Never solve scale by globally enlarging or shrinking the world, vehicle, roads or people.
3. Tracks are territories inside continuous geography, never isolated arenas pasted onto a map.
4. Routes, terrain, water, colliders, turning radius and camera clearance are one spatial problem. A mathematically reachable node is not necessarily a driveable track.
5. The world must remain interesting between tracks.
6. Each era must be recognizable without labels or UI.
7. A track must inherit its era grammar before adding its own modifiers.
8. Water must follow geography. A car must not appear to drive on dry ground through a water authority.
9. An opposite bank, horizon or enclosing landform must exist whenever the geography requires one.
10. A track reveal should be authored from the approach, not only from its center point.
11. No path/track change may silently redesign narrative, anomaly, camera, vehicle or audio behavior.
12. Promotion from `/drift-evolution` to `/drift` is a separate decision after owner spatial acceptance.

## 5. Placement status vocabulary

Every track and route must carry one explicit status.

### `current_runtime_provisional`

Exists now in runtime/topology. Useful as a baseline only. Not artistically frozen.

### `proposed`

Documented proposal only. Must not be described as delivered.

### `lab_implemented`

Implemented in `/drift-evolution` for spatial review. Production remains unchanged unless separately promoted.

### `lab_accepted`

JG has explicitly accepted the placement/route in the lab. This freezes the spatial decision, not final art detail.

### `production_promoted`

An accepted spatial decision has been separately promoted to `/drift`.

### `retired`

No longer an active track or route authority.

## 6. Provenance vocabulary

Every non-trivial spatial statement should be traceable to one of:

- `OWNER_DECISION` — explicit owner decision;
- `APPROVED_AUTHORITY` — accepted artistic document;
- `RUNTIME_FACT` — currently delivered code;
- `LAB_FACT` — current `/drift-evolution` implementation;
- `DERIVED` — mechanical consequence of accepted facts;
- `PROPOSAL` — authored suggestion awaiting acceptance;
- `OPEN` — intentionally undecided.

**Rule:** `DERIVED`, `PROPOSAL` and `OPEN` can never become `OWNER_DECISION` merely because an agent implemented them.

## 7. Era spatial contracts

### 7.1 Entry

**Role:** threshold and confinement before the first open world.  
**Geography:** dark mineral cave/corridor, single unbranching route, λ-shaped luminous exit.  
**Circulation:** one-way readable threshold; no exploration maze.  
**Transition out:** gradual density and exposure change into Birth Yard, no hard cut.  
**Spatial test:** the exit must reveal a credible next geography before the player is fully outside.

### 7.2 Birth Yard

**Narrative role:** learn to function inside a city that organizes, measures and cadences.  
**Geography:** continuous vertical port city; canals, harbour, commercial canyons, alleys/cellars, commuter/business infrastructure and newer urban memories.  
**Road language:** urban streets, quays, narrow alleys, crossings, multiple short branches and reconnecting routes.  
**Density:** highest era; pressure must increase locally without turning every road into a wall of props.  
**Water:** structural around Zeeland/harbour, never a decorative rectangle.  
**Current proven capital:** Zeeland dry-route/harbour geography and Foolfoule commercial pressure are promoted; Jazzypling has a lab-only cellar-district route proof.  
**Open work:** establish the coherent 7-track road graph and decide the exact territories for Funky Hoo, Peut-être and Sugared Peach.

### 7.3 Older Shadows

**Narrative role:** movement, altitude and risk make the visitor feel alive; freedom is beginning to become memory.  
**Geography:** mountain, open valleys, plateau, village, forest, river, col and isolated structures.  
**Road language:** mountain switchbacks, open ridges, farm roads, dirt/plateau paths and a literal decision junction.  
**Circulation:** visibly more breathable than Birth Yard; longer sightlines and more room between territories.  
**Elevation:** meaningful and authored. Grade, crest visibility and braking/turning space must be checked with the actual vehicle.  
**Open work:** the current five topology points are baseline only; author the ascent/valley/village/col/farm sequence as a driveable network.

### 7.4 Vegetative Field

**Narrative role:** everything works so smoothly that life disappears behind maintenance.  
**Geography:** repetitive suburbs/activity zones, ambiguous inaccessible architecture, white quarry, transit works, muted plain and countryside idleness.  
**Road language:** regular predictable suburban roads, worksites, service roads and unofficial traces.  
**Circulation:** long calm distances, repetition and flatness are positive design material; do not fill every gap.  
**Visibility:** repeated silhouettes should create orientation through sameness; Daymason is explicitly strengthened by indirect access rather than a direct destination road.  
**Open work:** integrate White Clouds without weakening the era's artificial-comfort register; distinguish chosen idleness from numbed routine through geography rather than UI.

### 7.5 New Signal

**Narrative role:** collapse of the old reference, then persistence and reconstruction without erasure.  
**Geography:** intentionally varied but each frame must still be dominated by one real geography: administrative forest, frozen lake, spiral well, unfinished interchange, storm moor, isolated night house, mirror maze, distant city, coastline, mixed edge territory, accepted EUX gym plus newer owner-authored territories.  
**Road language:** uncertainty and fragmentation early; more stable/persistent routes in the middle; calmer/open coastal circulation later.  
**Density:** variable. Spatial contrast is a core feature, not inconsistency.  
**Era-wide guardrail:** never stack several track geographies into a museum-like panorama. Memory from other territories may appear only as light, material, trace, distant silhouette, weather, reflection or similarly subordinate evidence.  
**Current catalogue correction:** EUX GAINENT belongs here. ÉTÉÉAOOÉTÉ is retired; AMIDIR is active.  
**Open work:** New Signal now has 14 tracks, so the old three-sub-arc ordering is source material rather than a complete current routing contract. The spatial graph must be re-authored only after Birth Yard, Older Shadows and Vegetative Field establish the route grammar.

## 8. Active track spatial index

The table below is deliberately spatial. Detailed anomaly/signature content remains delegated to the Atlas or local Identity Contract.

| Track | Era | Canonical spatial identity / requirement | Spatial authority status |
|---|---|---|---|
| A WALK IN ZEELAND | Birth Yard | Canal network + working harbour at dusk; water at eye level; dry east-bank route; Foolfoule on horizon | Existing Atlas + promoted spatial proof |
| FOOLFOULE | Birth Yard | Dense vertical commercial canyon; progressive compression from harbour openness into city pressure | Existing Atlas + promoted spatial proof |
| JAZZYPLING | Birth Yard | Crooked nocturnal cellar/alley district; small semi-interior jazz spaces | Existing Atlas + lab spatial proof |
| PLAY IT | Birth Yard | Rule-governed commuter/business district: metro, offices, parking, crossings | Existing Atlas; placement provisional |
| FUNKY HOO | Birth Yard | Amsterdam-after-dark owner meaning: harbour, red-light district, wandering foreign-city groove | Owner meaning known; exact territory OPEN |
| PEUT-ETRE | Birth Yard | Future Paris buried by sand, familiar city read archaeologically beneath desert | Owner meaning known; exact territory OPEN |
| SUGARED PEACH | Birth Yard | Playful bouncing trumpeters; exact urban/street setting still to author | Owner meaning known; exact territory OPEN |
| RISE | Older Shadows | Vertical mountain ascent corridor ending in summit view | Existing Atlas; placement provisional |
| BLOSSOMING | Older Shadows | Extreme-sport valley of momentum, cliffs/river/ramps and long sightlines | Existing Atlas; placement provisional |
| ETHNIC STICK | Older Shadows | Warm collective village circuit: market/courtyard/workshop/well/field/fire | Existing Atlas; placement provisional |
| MINUIT MOINS CINQ | Older Shadows | Literal mountain decision junction near nightfall | Existing Atlas; placement provisional |
| PERDUE | Older Shadows | Isolated farm / single slowly de-registering structure | Existing Atlas; placement provisional |
| MORNE, ET ? | Vegetative Field | Repetitive model-suburb grid linked to activity zone | Existing Atlas; placement provisional |
| DAYMASON | Vegetative Field | Large ambiguous landmark visible widely but intentionally without direct road | Existing Atlas; placement provisional |
| CHAILK | Vegetative Field | Blank white chalk quarry, fog, undrawn roads, open emptiness | Existing Atlas; placement provisional |
| TIME | Vegetative Field | Fractured transit infrastructure: station, worksites, bridges, queues, clocks | Existing Atlas; placement provisional |
| TANTITOM | Vegetative Field | Muted open plain with unofficial paths, poppies/lanterns/irregular houses | Existing Atlas; placement provisional |
| WHITE CLOUDS | Vegetative Field | Green countryside, open sky and chosen idleness | Owner meaning known; exact territory OPEN |
| NEEKTAREUM | New Signal | Dense administrative forest where signage assigns blame, not direction | Existing Atlas; placement provisional |
| ASITIS | New Signal | Sparse frozen lake/open ice expanse | Existing Atlas; placement provisional |
| RELATIVE | New Signal | Descending/ascending spiral road around a well/cavity | Existing Atlas; placement provisional |
| OVERTHINK | New Signal | Gigantic unfinished interchange capable of purging to one bare path | Existing Atlas; placement provisional |
| HOLD THE LIGHT | New Signal | Open rain-swept moorland with mud, pylons and ruins | Existing Atlas; placement provisional |
| MIDNIGHT WORK | New Signal | Isolated house defined at distance by one lit window under stars | Existing Atlas; placement provisional |
| TELATELABA | New Signal | Deliberately disorienting road/hedge/puddle/mirror maze | Existing Atlas; placement provisional |
| LE MONDE S'ENDORT | New Signal | Wide receding city skyline seen from outside it | Existing Atlas; placement provisional |
| RENEE | New Signal | Quiet low-density coastline with pebbles, driftwood, stone, small house, sea | Existing Atlas; placement provisional |
| PANTHERE | New Signal | Transitional city–vegetation–coastline edge without one central landmark | Existing Atlas; placement provisional |
| EUX GAINENT | New Signal | Glass-front gym/showroom with shallow interior; approved local identity/cues preserved | Approved local authority; placement provisional |
| ASSOKAM | New Signal | Makossa roots + electronics/modernity | Owner meaning known; exact geography OPEN |
| WO-HA | New Signal | Comic/absurd friend-voice territory, later integrating owner-supplied photo | Owner meaning known; exact geography OPEN |
| AMIDIR | New Signal | Love transmitted toward children/generations | Owner meaning known; exact geography OPEN |

## 9. Route graph model

Tracks are not just coordinates. Any new route must be represented as an edge between named spatial points or territories.

Minimum route contract:

```text
id
from
to
kind
status
width / half-width when known
surface when known
grade envelope when relevant
driving character
narrative/spatial role
terrain relationship
water relationship
source/provenance
```

Preferred route kinds:

- `spine` — primary through-route;
- `branch` — leaves a larger route and should normally reconnect unless a dead-end is intentional;
- `loop` — alternate return route;
- `junction` — decision point with several valid continuations;
- `destination` — intentional arrival/dead-end;
- `threshold` — transition between era grammars.

Do not invent generalized route infrastructure merely to satisfy this schema. The schema documents authored routes; it does not authorize a route engine rewrite.

## 10. Spatial evidence already worth preserving

### Zeeland → Foolfoule promoted proof

`src/lib/driftEvolutionZeelandGeography.ts` currently proves a dry route from the accepted Entry cave exit, past the east side of the canal/harbour system, ending at Foolfoule. It also proves a continuous canal, larger basin, opposite bank and working-port horizon. The raw topology node for Zeeland remains at `(-88, 20)` while the effective promoted target is `(-76, 23)`.

This is intentional evidence that raw topology and effective production placement may differ.

### Foolfoule promoted proof

`src/lib/driftEvolutionFoolfoule.ts` continues Zeeland's approach into an asymmetric commercial canyon. The harbour side stays open while urban compression increases eastward. The center remains `(-62, 42)`.

### Jazzypling lab proof

The Jazzypling district introduced by PR #103 is a lab spatial proof, not yet the same authority class as promoted Zeeland/Foolfoule. Its route branches from Zeeland's southern dry junction, passes through the canonical Jazzypling center `(-68, 14)`, then opens toward Play It. This is valuable route evidence but must remain distinguishable as lab state until promotion.

## 11. Per-track spatial decision record

For each track, the Spatial Atlas must keep these fields or an explicit `OPEN` equivalent:

```text
slug / title / era
source meaning
spatial identity
raw topology position
effective production position
placement status
route role
approach / exit status
terrain relationship
water relationship
sightline requirement
known neighbours
existing implementation evidence
artistic authority references
open spatial questions
```

A missing decision is not an error if it is explicitly `OPEN`. Silent invention is an error.

## 12. Codex spatial read pack

For any task whose primary goal is path design, placement, reachability, route topology or track-to-track spatial continuity, read only:

```text
1. AGENTS.md
2. docs/DRIFT_3D_SPATIAL_BIBLE.md
3. docs/DRIFT_3D_SPATIAL_ATLAS.json
4. relevant era contract only
5. relevant track Atlas entry / Identity Contract only
6. src/lib/tracks.ts
7. src/lib/drift3dTopology.ts
8. src/lib/drift3dTerrain.ts
9. relevant current/lab spatial implementation
```

Read the Realism Bible, Living World Bible, Cue Maps or systems architecture only when the requested change actually touches their domain.

This spatial read pack deliberately replaces the practice of loading the whole historical Drift corpus for a bounded placement task.

## 13. Spatial implementation workflow

Work one era at a time.

### A. Reconcile before coding

- confirm current `main` and open PRs touching the same spatial files;
- read the era + relevant track rows;
- distinguish existing runtime facts from accepted decisions and open questions;
- define the smallest route/placement delta.

### B. Author the route graph first

Before moving scenery, define:

- entry into the territory;
- exit/reconnection;
- route class;
- target driving character;
- major sightline/reveal;
- water/terrain constraints;
- nearby track footprints.

### C. Implement only in `/drift-evolution`

Unless the lot is explicitly a promotion lot, production `/drift` remains untouched.

### D. Validate driveability, not only geometry

Check with the actual vehicle/camera:

- reachability;
- no water/land contradiction;
- no hidden blocker/collider;
- turning and braking room;
- sensible grades;
- no camera clipping or underground viewpoint;
- approach reveal;
- exit readability;
- territory spacing;
- useful world between tracks.

### E. Owner gate

A green CI run does not spatially accept the result. JG must explicitly accept the route/placement before it becomes `lab_accepted`.

### F. Promote separately

Promotion to `/drift` happens in a separate, bounded PR. Do not mix spatial exploration and production promotion.

## 14. Recommended era order

```text
Birth Yard
→ Older Shadows
→ Vegetative Field
→ New Signal
→ inter-era transitions
→ global drive-through review
```

Reason: Birth Yard already has the most spatial proof; Older Shadows then establishes relief/grade grammar; Vegetative Field tests calm distance and flatness; only then should the 14-track New Signal network be re-authored.

## 15. Forbidden behaviors for spatial lots

An agent must not:

- modify `/drift` while exploring a new placement unless the lot explicitly says promotion;
- treat a raw runtime coordinate as owner-approved final placement;
- move a track to hide a technical bug;
- create a route not represented in the current lot's spatial decision;
- rebuild an era from zero when existing geography can be preserved/adapted;
- mix texture/detail polish into a topology lot;
- alter vehicle, camera, audio or dramaturgy without a demonstrated spatial necessity and explicit scope;
- turn tracks into isolated arenas;
- declare a location valid without checking terrain, water, colliders and driveability;
- promote `PROPOSAL` or `OPEN` into canon by implementation;
- use the old 26-track inventory as current catalogue truth.

## 16. Completion gate for `DRIFT-SPATIAL-GOV-00`

This governance lot is complete when:

1. this Bible exists;
2. `DRIFT_3D_SPATIAL_ATLAS.json` contains all 32 active tracks exactly once;
3. the retired ÉTÉÉAOOÉTÉ slug is explicitly non-active;
4. runtime/effective placement distinction is represented;
5. existing Zeeland/Foolfoule/Jazzypling spatial evidence is recorded without upgrading lab evidence to owner acceptance;
6. the current catalogue correction is reflected in `WORLD_CONTENT.md`;
7. `AGENTS.md` exposes the bounded spatial read pack;
8. a lightweight test checks catalogue/era/Atlas consistency;
9. no runtime world, coordinates, routes, terrain, vehicle, camera or audio are changed by this lot.
