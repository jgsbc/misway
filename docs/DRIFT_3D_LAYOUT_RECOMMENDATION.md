# DRIFT 3D Layout Recommendation

> **IMPLEMENTED / HISTORICAL.**
> Do not treat former future targets in this document as pending work. The
> delivered runtime topology is the factual source of truth.

This document compares the current topology-derived blueprint against the candidate layout v2.

The current topology is coherent and playable, but it is still compressed for the level of
readable set design now expected from Drift. The layout v2 is recommended before 3D extrusion
because it gives the worlds more breathing room, clearer silhouettes, and stronger narrative
separation.

## Recommendation

**ADOPT_LAYOUT_V2_BEFORE_3D**

Reason:

* the current map is readable, but Birth Yard, Vegetative Field and New Signal still sit too
  close for strong scenic separation;
* the new track-level scenes need wider voids and clearer framing;
* New Signal benefits from three distinct subclusters instead of one dense right-side field;
* the candidate layout better supports future primitive set design without changing era
  assignments or deleting tracks.

## Current vs v2 planning frame

| item | current blueprint | proposed v2 blueprint | note |
|---|---|---|---|
| planning frame | `192 x 128` | `224 x 144` | more room for voids, silhouettes and no-prop corridors |
| Entry threshold | current threshold near `(-88, 12)` | same location, larger cave framing | threshold should stay near spawn and remain non-playable |
| Birth Yard | dense left-origin cluster | stronger upper-left city mass | gives the city more skyline and alley separation |
| Older Shadows | open but still near the center band | lower-left / lower-middle ridge arc | makes the travel zone feel more expedition-like |
| Vegetative Field | middle-band flat spread | wider horizontal field band | improves the "work and routine" flattening |
| New Signal | single right-side constellation | three distinct island subclusters | improves readability of inner-world logic |

## Era-by-era proposed movement table

### Entry / threshold

| element | current (x, z) | v2 proposed (x, z) | why |
|---|---:|---:|---|
| `entry-node` | `(-88, 12)` | `(-88, 12)` | keep the spawn threshold stable; make the cave framing bigger instead of moving the gate |

### Birth Yard

| track slug | current (x, z) | v2 proposed (x, z) | why |
|---|---:|---:|---|
| `a-walk-in-zeeland` | `(-84, 16)` | `(-88, 20)` | push the canal edge farther left to create a clearer lonely perimeter lane |
| `foolfoule` | `(-74, 30)` | `(-78, 34)` | move the rush-hour mass deeper into the dirty skyline cluster |
| `jazzypling` | `(-66, 12)` | `(-68, 14)` | keep the alley/cellar pocket close to the urban core |
| `play-it` | `(-58, 24)` | `(-54, 26)` | open the rule-lane toward the right edge of Birth Yard |

### Older Shadows

| track slug | current (x, z) | v2 proposed (x, z) | why |
|---|---:|---:|---|
| `rise` | `(-52, -54)` | `(-56, -68)` | make the summit path feel more like a true ascent |
| `blossoming` | `(-34, -48)` | `(-38, -56)` | widen the adrenaline ridge and separate it from the summit |
| `ethnic-stick` | `(-16, -60)` | `(-18, -72)` | pull the travel / values marker deeper into the open expedition field |
| `minuit-moins-cinq` | `(-42, -30)` | `(-46, -36)` | keep the decision gate on the transition path, not inside the city zone |
| `perdue` | `(-8, -22)` | `(-2, -28)` | move the fading line outward so the decline reads as a separate exit condition |

### Vegetative Field

| track slug | current (x, z) | v2 proposed (x, z) | why |
|---|---:|---:|---|
| `morne-et` | `(-30, 2)` | `(-38, 4)` | stretch the artificial comfort loop leftward |
| `daymason` | `(-8, -6)` | `(-14, -2)` | widen the hidden-underlayer pocket |
| `chailk` | `(14, 4)` | `(12, 8)` | keep the zero / erase mark centered in the flat band |
| `time` | `(2, 20)` | `(2, 24)` | move the collapse ring slightly higher to preserve the field plane |
| `tantitom` | `(30, 12)` | `(36, 14)` | open a gentler color-return exit on the right side |

### New Signal

| track slug | current (x, z) | v2 proposed (x, z) | why |
|---|---:|---:|---|
| `neektareum` | `(28, -22)` | `(24, -18)` | keep the responsibility pit on the west side of the signal world |
| `asitis` | `(42, 8)` | `(46, 12)` | isolate the cold acceptance gate from the west cluster |
| `relative` | `(56, -6)` | `(60, -4)` | align the rebound spiral with the center of the inner world |
| `overthink` | `(70, 22)` | `(78, 18)` | push the overload mass further right and slightly down |
| `hold-the-light` | `(48, -30)` | `(52, -28)` | keep the storm lamp between the west and south clusters |
| `midnight-work` | `(76, -38)` | `(84, -42)` | move the office island toward the southeast satellite cluster |
| `telatelaba` | `(84, -4)` | `(90, -2)` | keep the mirror labyrinth on the far right edge of the world |
| `le-monde-s-endort` | `(60, -52)` | `(70, -56)` | separate the dimming city from the office / storm corridor |
| `renee` | `(40, -44)` | `(48, -48)` | give the raw stone / beach light more room below the center line |
| `Panthere` | `(82, 30)` | `(90, 28)` | keep the placeholder shadow on the far right, but flagged for human confirmation |

## Corridor changes in v2

* The Entry to Birth lane becomes wider and more cave-like.
* Birth Yard gains a clearer alley spine and a stronger skyline edge.
* Older Shadows shifts lower, which creates a more open expedition ridge.
* Vegetative Field spreads horizontally and reads more like a band of routine.
* New Signal splits into three subclusters:
  * west cluster: `neektareum`, `asitis`, `relative`;
  * north-east cluster: `overthink`, `hold-the-light`, `telatelaba`;
  * south-east cluster: `midnight-work`, `le-monde-s-endort`, `renee`, `Panthere`.

## Why the v2 layout reads better

The current topology is already usable, but the v2 version gives the player a clearer read of:

* city pressure vs open travel vs flat routine vs inner signal;
* large scenic landmarks rather than dense symbolic patches;
* corridor separation that future 3D props can respect without blocking gameplay.

## Implementation note for a future runtime lot

If this recommendation is adopted, the later runtime topology patch would need to apply the v2
positions to `src/lib/drift3dTopology.ts`, then re-run the current rendering, reachability and
audio safety validations.

