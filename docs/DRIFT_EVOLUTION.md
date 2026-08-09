# DRIFT Evolution — protected-world execution contract

## 1. Two surfaces, two responsibilities

- `/drift` is the protected production artwork. Its restored baseline is `99b343bb13e901df49d9bed530cb00decf1134cd`.
- `/drift-evolution` is the world-evolution surface. It starts visually identical to `/drift` and diverges by copy-on-write only.
- `/drift-kit-lab` remains the technical asset/pipeline laboratory. It is not the evolving world and its pilot art is not automatically production art.

Production is never used as a scratchpad again.

## 2. Copy-on-write rule

The evolution route initially reuses the production runtime exactly.

When a change needs to diverge:

1. identify the smallest authority responsible for that dimension;
2. reuse the production authority if no divergence is needed;
3. otherwise extract/fork only that authority into `drift-evolution/` or `driftEvolution*`;
4. make the experiment there;
5. compare `/drift-evolution` directly with `/drift`;
6. keep/rework/reject it in the evolution surface;
7. modify production only through a later explicit promotion decision.

Never fork the entire runtime merely to change one dimension.

## 3. Construction order

For each world problem, apply this order:

1. existing production MISWAY code/content;
2. existing MISWAY assets and accepted scenes;
3. proven work from historical branches/archives;
4. mature open-source implementation or licensed asset with clear provenance;
5. procedural generation for repetition/background/variation;
6. new bespoke code/assets only when the previous layers cannot solve the need well.

Preserve → reuse → extract → adapt → integrate → measure → visually compare → promote only when manifestly better.

## 4. Salvage map

### KEEP / REUSE FIRST

- `entry-lambda-cave` in `src/lib/drift3dLandmarks.ts`: existing rock cave, sculpted λ threshold, dark floor and dawn backlight.
- EUX GAINENT living scene and accepted audio/cue behavior.
- existing track topology, landmarks, atmosphere grammar, scatter, camera, controls and vehicle scale unless a specific evolution lot proves a better replacement.

### TECHNICAL REUSE

- `/drift-kit-lab` and `src/components/drift-3d/kits/`: GLB loading, skeleton/animation, instancing, traffic mechanics, Water/Sky techniques and quality-tier patterns. Technical acceptance does not equal final-art acceptance.

### EXTRACT CANDIDATES

- `drift-3d-20c-ocean-cliffs-world-edge-depth-v2`: `Drift3DWorldEdges.tsx` contains a reusable continuity experiment — north ocean, west cliffs, east hills, south plains and river. Extract/adapt only after baseline comparison.
- `experiment/drift-greybox-fable`: R&D source for geography, roads, coastline and world-design lessons. Never wholesale-merge its world/runtime.
- `archive/drift-post-greybox-20260809`: preserves the peninsula, route, water, Inspector and Birth Yard experiments for selective salvage.

## 5. Visual gate

A technically green lot is not a successful visual lot.

Before any candidate can be considered promotable, judge the complete visible composition against `/drift` at comparable vehicle scale and viewpoint:

- metric/proportional scale;
- architecture and volumetric grammar;
- material/PBR coherence;
- lighting, exposure and color temperature;
- atmospheric depth;
- density and use logic;
- composition, sightlines and negative space;
- circulation/navigation readability;
- coherent level of detail;
- MISWAY identity: realism first, controlled strangeness second.

If the result is not visibly and meaningfully better, it stays in evolution or is rejected.

## 6. Promotion rule

`/drift` may change only after an explicit promotion decision naming:

- the evolution lot;
- the before/after visual evidence;
- objective runtime impact;
- exact production authorities that will change;
- rollback point.

The baseline-protection test intentionally fails if protected production files change without such a deliberate promotion.

## 7. Current execution direction

Do not rebuild the world from zero.

Start from the restored Drift map, inventory its strongest existing scenes, recover the best historical work one capability at a time, and evolve the duplicate until it clearly surpasses the protected artwork. The platform/general system is extracted only from patterns proven by the artwork.

## 8. Current owner spatial correction

For the evolving world, the owner has corrected the track-era placement:

- **Foolfoule** remains in **Birth Yard** and takes the exact map slot previously occupied by EUX GAINENT;
- **EUX GAINENT** belongs to **New Signal**, not Birth Yard;
- its accepted living scene, cue behavior and local identity stay intact and move with the track;
- the current evolution placement for EUX GAINENT is `(x=58, z=38)`, a free, naturally near-flat New Signal pocket with substantial clearance from the existing track nodes;
- **ÉTÉÉAOOÉTÉ remains the New Signal conclusion**;
- `/drift` remains byte-protected until a later explicit promotion decision.

This is an owner-approved target correction for `/drift-evolution`, not a reason to reopen the rest of the map or redesign either era.
