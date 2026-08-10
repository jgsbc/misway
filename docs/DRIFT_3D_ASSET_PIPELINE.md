# DRIFT 3D — External Asset Pipeline

**Lot:** `DRIFT-ASSET-GOV-00`  
**Status:** `PROPOSED — OWNER GATE REQUIRED`  
**Parent authority:** `docs/DRIFT_3D_ASSET_PERFORMANCE_BIBLE.md`

## 1. Goal

Turn free/external 3D content into small, traceable, reproducible MISWAY runtime assets without degrading artistic quality or violating licenses.

## 2. Toolchain

Preferred minimal toolchain:

- **Blender** — artistic extraction, cleanup, transforms, retopology/decimation where justified, material edits and baking;
- **glTF Transform** — inspection and reproducible glTF optimization;
- **meshoptimizer / gltfpack** — GPU-oriented geometry optimization/compression and optional instancing/simplification;
- **KTX-Software / Basis Universal path** — KTX2 texture encoding, normally through glTF Transform or gltfpack;
- **Three.js GLTFLoader/KTX2Loader/MeshoptDecoder** — runtime loading.

Do not add another tool if the above chain solves the requirement.

## 3. Directory doctrine

Raw downloads should not be committed by default.

Suggested local/external workspace:

```text
misway-assets-source/
└── birth-yard/
    └── <asset-id>/
        ├── source/
        ├── working/
        ├── exports/
        └── provenance.json
```

Repo runtime destination:

```text
public/models/
└── drift/
    └── <era>/
        └── <asset-id>/
            ├── <asset-id>.glb
            └── LICENSE.txt   # when required / useful
```

Machine provenance stays in `docs/DRIFT_3D_ASSET_REGISTRY.json`.

## 4. Intake

Before opening Blender:

1. copy model title;
2. author/uploader;
3. source URL;
4. exact license;
5. attribution text when available;
6. download date;
7. original format;
8. source archive checksum when practical;
9. source stats from provider;
10. intended MISWAY usage.

Reject if:
- NC conflicts with potential commercial usage;
- ND prevents planned adaptation;
- author/provenance looks suspicious;
- it appears ripped from a game/film/product without rights;
- license cannot be established.

## 5. Inspect first

Never optimize blindly.

Use:

```bash
gltf-transform inspect input.glb
```

The report is intended to reveal whether the asset is geometry-heavy, texture-heavy or draw-call-heavy.

If source is not glTF:
- inspect in Blender;
- export a faithful intermediate glTF/GLB;
- inspect that intermediate before destructive work.

Record:
- scenes/nodes;
- meshes/primitives;
- triangles;
- materials;
- texture dimensions/formats;
- animations;
- cameras/lights not needed;
- repeated meshes;
- named nodes required later.

## 6. Extract before simplify

For a large environment:

```text
whole source
→ identify MISWAY-useful parts
→ delete everything else
→ only then optimize
```

Typical retained subsets:
- façade only;
- bridge only;
- 2–5 building modules;
- street furniture;
- one landmark;
- selected rocks/vegetation.

This preserves quality better than globally decimating an irrelevant full scene.

## 7. Blender cleanup checklist

- [ ] correct unit scale (`1 unit ≈ 1 m` in MISWAY);
- [ ] apply/normalize transforms only where safe;
- [ ] remove cameras/lights from source unless intentionally reused;
- [ ] remove hidden/unneeded objects;
- [ ] remove duplicate geometry;
- [ ] verify normals;
- [ ] remove impossible internal faces if truly invisible;
- [ ] preserve UVs required for texture fidelity;
- [ ] preserve rig/animation only when used;
- [ ] consolidate materials where visual difference is negligible;
- [ ] rename hero/interactable nodes intentionally;
- [ ] define origin/pivot suitable for placement/instancing;
- [ ] bake detail when replacing heavy geometry with lower-detail geometry;
- [ ] create collision proxy separately when needed.

## 8. Texture cleanup

Before compression:
- delete unused textures;
- resize to runtime target;
- ensure correct color-space usage;
- pack roughness/metalness/AO only if the material pipeline remains correct;
- avoid alpha if not required;
- avoid oversized normals that do not resolve at gameplay camera distance.

Default dimensions are defined by `DRIFT_3D_ASSET_PERFORMANCE_BIBLE.md`.

## 9. glTF Transform workflow

Install CLI:

```bash
npm install --global @gltf-transform/cli
```

Typical first pass:

```bash
gltf-transform inspect input.glb
```

Safe optimization must be asset-specific. Example pattern:

```bash
gltf-transform optimize input.glb optimized.glb \
  --compress meshopt \
  --texture-compress ktx2 \
  --texture-size 1024
```

However:
- do not copy this command blindly to hero assets;
- inspect output;
- preserve named nodes/materials required by runtime;
- test KTX2 output on actual mobile targets;
- compare visual output before acceptance.

For targeted pipelines, prefer individual transforms when the all-in-one optimize step changes too much.

Useful capabilities include:
- `dedup`;
- `instance`;
- `flatten`;
- `join`;
- `prune`;
- `simplify`;
- `meshopt`;
- texture resizing/compression.

## 10. gltfpack workflow

`gltfpack` is a strong alternative or second-path validator.

Common relevant options from meshoptimizer documentation:
- `-cc` compressed glTF/GLB using Meshopt;
- `-tc` KTX2/Basis texture compression;
- `-mi` mesh instancing;
- `-si R` simplification ratio;
- `-kn` keep named nodes;
- `-km` keep named materials;
- `-ke` preserve extras.

Example:

```bash
gltfpack -i input.glb -o output.glb -cc -tc -mi
```

Do not use simplification flags until visual comparison confirms acceptable loss.

## 11. Compression decision

Prefer one geometry compression path per runtime artifact.

Three.js supports both Draco and Meshopt, but MISWAY should not casually ship two decoder ecosystems for equivalent assets.

Default proposal:
- prefer Meshopt for new world assets;
- retain existing Draco only where already justified;
- validate decode cost and bundle impact before standardizing.

This remains a vertical-slice decision, not a governance assumption.

## 12. Instancing conversion

Use instancing when:
- same geometry;
- same material;
- many transforms;
- no unique skeletal animation;
- object-level variation can be represented through transforms or supported attributes.

Candidates:
- lamps;
- bollards;
- benches;
- repeated windows;
- traffic signs;
- trees;
- rocks;
- distant crowd figures;
- repeated modular façade pieces.

Do not instance unique hero objects just to satisfy a metric.

## 13. LOD policy

LOD is optional, not mandatory ceremony.

Create LOD when:
- object occupies materially different screen sizes;
- simplification is visually safe;
- switching does not create objectionable popping;
- memory/asset complexity is justified by measured gain.

For very distant landmarks, a deliberately simplified silhouette mesh may be better than maintaining a formal 3-level LOD chain.

## 14. Runtime validation

Before `LAB_READY`:

```bash
gltf-transform inspect runtime.glb
```

and validate in:
- desktop `/drift-evolution`;
- target smartphone;
- cold load;
- warm load;
- approach/reveal;
- U-turn/revisit.

Check:
- orientation;
- scale;
- materials;
- missing textures;
- animation;
- shadows;
- frame pacing;
- resource disposal.

## 15. Artifact naming

Prefer stable semantic IDs:

```text
birth-yard-dutch-facade-01.glb
birth-yard-port-props-01.glb
birth-yard-crowd-distant-01.glb
birth-yard-haussmann-facade-01.glb
```

Avoid provider/model IDs as runtime-facing names. Provider identifiers remain in the registry.

## 16. Reproducibility

If optimization is scripted, record:
- tool versions;
- exact command;
- input hash;
- output hash;
- manual Blender steps that cannot be reproduced automatically.

A future agent must be able to tell whether a runtime asset can be regenerated or is a manually authored derivative.

## 17. Validation record

Each accepted derivative should have before/after values:

```text
source bytes → runtime bytes
source triangles → runtime triangles
source materials → runtime materials
source textures/max dimension → runtime textures/max dimension
source draw-call estimate → runtime draw-call estimate
```

The objective is not “maximum compression”; it is **minimum cost that preserves the intended frame**.

## 18. Primary references

- glTF Transform: https://github.com/donmccurdy/glTF-Transform
- meshoptimizer/gltfpack: https://meshoptimizer.org/gltf/
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js KTX2Loader: https://threejs.org/docs/pages/KTX2Loader.html
- Khronos KTX 2.0: https://www.khronos.org/ktx/
