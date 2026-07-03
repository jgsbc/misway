# DRIFT 3D Layout V2 Implementation Target

## Decision

**V2 layout is adopted as the implementation target before 3D extrusion.**

This document does not change runtime code. It translates the candidate v2 layout into a precise
future implementation target so the next code lots can update topology, world bounds and then
extrude landmarks safely.

Current runtime topology remains the source of truth for now. The v2 layout becomes the
documented target for the later code lot `DRIFT-3D-16B`.

## Why v2

V2 is better than the current runtime layout for the following reasons:

* stronger world separation between eras;
* more breathing room for visible set design;
* clearer New Signal archipelago structure;
* clearer Older Shadows expedition / ridge space;
* wider Vegetative Field flatness and horizontal reading;
* stronger Birth Yard separation from the rest of the map;
* clearer emotional progression from entry to inner signal;
* less risk of a compressed 3D scene that reads as one dense symbolic patch.

The current layout is playable and coherent. V2 is the better implementation target because it
gives the next 3D lot enough voids, corridors and landmark spacing to create readable places.

## Source of truth used for this target

1. `docs/DRIFT_3D_LAYOUT_RECOMMENDATION.md`
2. `docs/drift-3d-set-design-blueprint-v2.svg`
3. `docs/DRIFT_3D_SET_DESIGN_BLUEPRINT.md`
4. `docs/DRIFT_3D_TRACK_SCENE_MATRIX.md`
5. `docs/DRIFT_3D_ART_DIRECTION.md`
6. `src/lib/drift3dTopology.ts`
7. `src/lib/drift3d.ts`
8. `src/lib/tracks.ts`

## Current world constants and proposed v2 target

These values are read from the current runtime code and used to derive the future target.

| item | current runtime value | proposed v2 target | note |
|---|---|---|---|
| plane width | `192` | `224` | matches the wider v2 planning frame |
| plane depth | `128` | `144` | matches the taller v2 planning frame |
| movement minX / maxX | `-92.8 / 92.8` | `-108.8 / 108.8` | derived from `224 / 2` with the current `3.2` margin pattern |
| movement minZ / maxZ | `-60.8 / 60.8` | `-68.8 / 68.8` | derived from `144 / 2` with the current `3.2` margin pattern |
| floor height | `-0.08` | keep for now | do not change unless later QA proves a grounding issue |
| zone marker Y | `-0.06` | keep for now | keep the flattened marker layer intact |
| travel Y | `0.16` | keep for now | keep the vehicle grounded above markers |
| camera base height | `4.35` | keep for now | avoid a camera-model rewrite |
| camera base depth | `7.8` | keep for now | keep the fixed oblique contract |
| camera zoom scale range | `0.82 .. 1.28` | keep for now | re-evaluate only if the larger world becomes unreadable |

Assumptions:

* the current `3.2` movement margin remains the correct safety buffer;
* the camera model does not need a redesign for the v2 adoption step;
* travel height and zone marker heights stay stable until gameplay QA proves otherwise;
* speed stays unchanged unless future reachability QA shows traversal is too slow.

## Entry threshold target

The Entry threshold remains non-playable and unchanged in position:

* `entry-node` -> `(-88, 12)`

The future code lot should keep this threshold near spawn and keep the first corridor empty.
The target is to make the cave / lambda mouth larger and clearer, not to move the gate.

## Era layout target

The following table records the current runtime centers/radii and the proposed v2 target.
The proposed values are implementation targets, not runtime changes.

| era id | current center | current radius | proposed v2 center | proposed v2 radius | reason for change | corridor / spacing effect | implementation risk |
|---|---|---:|---|---:|---|---|---|
| `birth-yard` | `(-66, 18)` | `30` | `(-74, 22)` | `36` | stronger city skyline and alley separation; city mass sits further up-left | widens the Entry -> Birth arrival lane and gives the city a stronger outer edge | medium: avoid left-edge compression |
| `older-shadows` | `(-26, -30)` | `34` | `(-32, -52)` | `40` | clearer open expedition arc; more mountain / travel breathing room | pushes the ridge zone lower and opens a stronger transition away from Birth Yard | medium: avoid overlap with Vegetative Field |
| `vegetative-field` | `(0, 10)` | `32` | `(0, 8)` | `42` | a wider horizontal band better supports the flat work / routine territory | opens the field into a broad lateral lane and reduces symbolic crowding | medium: keep the field from swallowing adjacent eras |
| `new-signal` | `(52, -8)` | `46` | `(66, -12)` | `56` | clearer archipelago logic and more subcluster separation | creates three visible island groups and stronger voids between them | high: keep travel distance acceptable and preserve anchor clarity |

Notes:

* The v2 centers are derived from the proposed v2 node clusters and the broader planning frame.
* The radii are intentionally slightly larger than the current runtime radii to leave room for
  future landmarks and no-prop buffers.
* New Signal is deliberately the most spread region; it is the most likely area to need re-checking
  after the next gameplay QA.

## Future track node layout target

The v2 coordinates below are the implementation target for the later runtime topology update.
Current positions remain the runtime truth until `DRIFT-3D-16B` is applied.

### Entry

| slug | title | era | current position | proposed v2 position | delta | narrative reason | gameplay / corridor note | legacy anchor |
|---|---|---|---|---|---|---|---|---|
| `entry-node` | Entry Node | threshold | `(-88, 12)` | `(-88, 12)` | `0, 0` | keep the cave / lambda threshold stable | do not play or clutter this gate | no |

### Birth Yard

| slug | title | era | current position | proposed v2 position | delta | narrative reason | gameplay / corridor note | legacy anchor |
|---|---|---|---|---|---|---|---|---|
| `a-walk-in-zeeland` | A WALK IN ZEELAND | Birth Yard | `(-84, 16)` | `(-88, 20)` | `(-4, +4)` | canal edge, sunset city boundary, solitary meander | keep the canal lane open; no tall mass on the water line | yes |
| `foolfoule` | FOOLFOULE | Birth Yard | `(-74, 30)` | `(-78, 34)` | `(-4, +4)` | rush-hour crowd pressure and skyscraper canyon | preserve the rush corridor; avoid pillar clogging | yes |
| `jazzypling` | JAZZYPLING | Birth Yard | `(-66, 12)` | `(-68, 14)` | `(-2, +2)` | dark alley, cellar stair, unsafe backstreet | keep the backstreet opening visible and passable | no |
| `play-it` | PLAY IT | Birth Yard | `(-58, 24)` | `(-54, 26)` | `(+4, +2)` | metro line, office grid, rule-lane, clock-in path | corridor must still read as commute and remain open | no |

### Older Shadows

| slug | title | era | current position | proposed v2 position | delta | narrative reason | gameplay / corridor note | legacy anchor |
|---|---|---|---|---|---|---|---|---|
| `rise` | RISE | Older Shadows | `(-52, -54)` | `(-56, -68)` | `(-4, -14)` | summit ascent and stronger vista separation | keep the ascent route clear; no blocking ridge mass | no |
| `blossoming` | BLOSSOMING | Older Shadows | `(-34, -48)` | `(-38, -56)` | `(-4, -8)` | adrenaline ridge, launch edge, open-air leap | protect the jump line; do not place props on the arc | no |
| `ethnic-stick` | ETHNIC STICK | Older Shadows | `(-16, -60)` | `(-18, -72)` | `(-2, -12)` | travel roots, values, warm earth ritual marker | keep the passage open; avoid clutter and cliché props | no |
| `minuit-moins-cinq` | MINUIT MOINS CINQ | Older Shadows | `(-42, -30)` | `(-46, -36)` | `(-4, -6)` | decision gate just before midnight | do not narrow the choice corridor too much | no |
| `perdue` | PERDUE | Older Shadows | `(-8, -22)` | `(-2, -28)` | `(+6, -6)` | fading relation / work / self, separate exit condition | keep the exit lane readable through the fade | no |

### Vegetative Field

| slug | title | era | current position | proposed v2 position | delta | narrative reason | gameplay / corridor note | legacy anchor |
|---|---|---|---|---|---|---|---|---|
| `morne-et` | MORNE, ET ? | Vegetative Field | `(-30, 2)` | `(-38, 4)` | `(-8, +2)` | artificial comfort loop stretched into a flatter band | stay flat; do not raise the comfort zone into a mound | no |
| `daymason` | DAYMASON | Vegetative Field | `(-8, -6)` | `(-14, -2)` | `(-6, +4)` | hidden underlayer and watching geometry | leave the seam readable; keep the underlayer low | no |
| `chailk` | CHAILK | Vegetative Field | `(14, 4)` | `(12, 8)` | `(-2, +4)` | restart from zero, empty chalk plane | keep this area almost empty; no tall props | no |
| `time` | TIME | Vegetative Field | `(2, 20)` | `(2, 24)` | `(0, +4)` | collapse ring and time fracture preserved inside the flat band | protect the fracture; do not crowd the circle | no |
| `tantitom` | TANTITOM | Vegetative Field | `(30, 12)` | `(36, 14)` | `(+6, +2)` | color return, lightness, gentle recovery path | keep the return path open and legible | no |

### New Signal

| slug | title | era | current position | proposed v2 position | delta | narrative reason | gameplay / corridor note | legacy anchor |
|---|---|---|---|---|---|---|---|---|
| `neektareum` | NEEKTAREUM | New Signal | `(28, -22)` | `(24, -18)` | `(-4, +4)` | responsibility pit with a forced forward movement | keep a clear escape route out of the pit | no |
| `asitis` | ASITIS | New Signal | `(42, 8)` | `(46, 12)` | `(+4, +4)` | cold acceptance gate, stark inner truth | preserve the cold clarity; avoid clutter | yes |
| `relative` | RELATIVE | New Signal | `(56, -6)` | `(60, -4)` | `(+4, +2)` | well / rebound / confidence return | keep the rebound corridor uncluttered | no |
| `overthink` | OVERTHINK | New Signal | `(70, 22)` | `(78, 18)` | `(+8, -4)` | overloaded thought-road and cracked accumulation | do not block the route completely; keep the break readable | yes |
| `hold-the-light` | HOLD THE LIGHT | New Signal | `(48, -30)` | `(52, -28)` | `(+4, +2)` | storm lamp, bridge, standing beacon | preserve the halo and the bridge crossing | yes |
| `midnight-work` | MIDNIGHT WORK | New Signal | `(76, -38)` | `(84, -42)` | `(+8, -4)` | nocturnal office island with stars and nature edge | keep the office island isolated but reachable | yes |
| `telatelaba` | TELATELABA | New Signal | `(84, -4)` | `(90, -2)` | `(+6, +2)` | mirror labyrinth / in-between duty | corridors must stay obvious even if the maze feels odd | yes |
| `le-monde-s-endort` | LE MONDE S’ENDORT | New Signal | `(60, -52)` | `(70, -56)` | `(+10, -4)` | dimming city strip and sleeping skyline | keep a readable route through the dimming city | no |
| `renee` | RENEE | New Signal | `(40, -44)` | `(48, -48)` | `(+8, -4)` | raw matter, polished stone, beach light, repair | keep the shore light gentle; do not make it touristy | no |
| `Panthere` | PANTHERE | New Signal | `(82, 30)` | `(90, 28)` | `(+8, -2)` | cautious placeholder: dark feline shadow, optical lambda hint, discreet power | TODO / human confirmation needed before stronger 3D meaning | no |

## Legacy anchor handling

These tracks are visually and behaviorally important anchors and must remain recognizable after the
future runtime topology update:

| anchor | why it must remain recognizable | effect of the v2 move | QA that must pass later |
|---|---|---|---|
| `a-walk-in-zeeland` | it carries the canal / sunset / solitary meander identity | stays in Birth Yard but moves deeper into the city boundary lane | verify the canal edge still reads immediately from the approach corridor |
| `foolfoule` | it carries the rush-hour crowd / skyscraper pressure identity | stays in Birth Yard but shifts into the dense skyline core | verify the oppressive vertical read still survives in the denser city mass |
| `asitis` | it is the acceptance / plain-signal anchor in New Signal | remains in New Signal, but in the colder west-side subcluster | verify the acceptance gate is still one of the first recognisable inner-signal landmarks |
| `overthink` | it is the overload / neural-loop anchor | stays in New Signal, but moves deeper into the overload cluster | verify the broken-road / collapse read is still obvious and not too close to other anchors |
| `hold-the-light` | it is the storm-lamp anchor and a strong visual handle | remains between west and south subclusters | verify the halo, bridge and storm silhouette remain clear from normal zoom |
| `midnight-work` | it is the nocturnal office anchor | moves to the southeast satellite cluster for clearer isolation | verify the office island still reads as a private night-work place |
| `telatelaba` | it is the in-between labyrinth anchor | stays on the far-right edge, in a clearer mirror corridor | verify the maze still feels dislocated but not confusing enough to break navigation |

## Corridor and no-prop strategy

The v2 layout only works if corridors remain open. The future 3D lot must treat these as
no-prop zones:

| corridor | purpose | nodes it protects | future 3D no-prop rule | expected camera readability |
|---|---|---|---|---|
| Entry -> Birth arrival corridor | first arrival from the lambda gate into the world | `entry-node`, `a-walk-in-zeeland`, `foolfoule` | keep the throat empty; no tall silhouette in the opening | the player must read the exit and the first city mass immediately |
| Birth Yard internal alley corridors | allow dense city pressure without trapping the vehicle | all Birth Yard nodes | keep the alley spines clear and avoid tall pieces on node centers | the city must read as dense but still traversable |
| Birth Yard -> Vegetative / Older transition | prevent the city from bleeding into the flat field or ridge zone | `play-it`, `minuit-moins-cinq`, `morne-et`, `rise` | keep the transition band mostly empty | the transition should feel like leaving one world and entering another |
| Older ridge route | preserve the expedition arc and summit path | all Older Shadows nodes | keep ridge triangles beside the travel lane, not inside it | the camera must see the ridge silhouette and the route at the same time |
| Vegetative horizontal field lanes | maintain the flat routine band | all Vegetative Field nodes | keep crop rows low and leave lateral movement lanes between them | the band should read as horizontal at a glance |
| New Signal island gaps | separate the inner-world subclusters | all New Signal nodes | keep voids between island pads; no tall props in the gaps | the fixed oblique camera must read the archipelago instantly |
| New Signal anchor approach lanes | preserve anchor readability inside the spread | `asitis`, `overthink`, `hold-the-light`, `midnight-work`, `telatelaba` | keep one approach lane per anchor and no towering blocker on the node center | anchors should be legible from approach distance |

## Implementation sequence recommendation

Do **not** jump directly from the v2 recommendation into landmark extrusion.

The future implementation order should be:

### A. `DRIFT-3D-16B — Apply v2 topology and world bounds`

* update `src/lib/drift3dTopology.ts` with the v2 node positions, era centers and radii;
* update `src/lib/drift3d.ts` world constants to the v2 planning frame if accepted;
* keep decor and atmosphere out of this lot;
* rerun reachability, movement, zoom and audio-safety checks.

### B. `DRIFT-3D-16C — Validate v2 topology gameplay`

* read-only and browser QA focused;
* confirm all eras and representative tracks remain reachable;
* confirm production export remains smooth;
* do not add code unless a blocker is proven.

### C. `DRIFT-3D-16D — Extrude v2 narrative blueprint into 3D landmarks`

* only after the v2 topology and bounds are validated;
* turn the track-level scenes into primitive landmarks;
* preserve corridors, node protection and explicit audio.

This sequence is preferred over any one-shot topology-plus-extrusion lot because it keeps each
failure mode isolated and easier to prove.

## Future QA checklist

The later code lots should only pass if all of the following remain true:

* all 24 nodes are still represented exactly once;
* every slug still matches `src/lib/tracks.ts`;
* `Panthere` casing is preserved;
* Entry remains non-playable;
* all legacy anchors remain reachable;
* at least one representative node in each era remains reachable;
* zoom still works and remains clamped;
* keyboard, pointer and touch movement still work;
* the vehicle remains visible and grounded;
* node markers remain flat and readable;
* runtime `<audio>` count remains 1;
* movement, zoom and blank clicks do not wake audio;
* `/drift` and `/drift-lab` remain unchanged;
* `/drift-3d-lab` stays isolated, noindex and absent from sitemap / primary nav.

## Human confirmation items

Before the runtime v2 lot is applied, a human reviewer still needs to confirm:

* the v2 SVG is visually approved;
* `Panthere` still needs caution or human clarification;
* the larger world size feels acceptable in motion;
* traversal distance does not require speed tuning after QA;
* New Signal should remain the largest and most spread region.

## Risks and assumptions

The v2 radii and centers are recommendations derived from the current node clusters and the
candidate SVG, not runtime changes. The exact values should be rechecked during `16B`, especially
for New Signal and the wider field band.

If the v2 world feels too large in motion, the later fix should first revisit world bounds and
corridor spacing before changing movement semantics.

