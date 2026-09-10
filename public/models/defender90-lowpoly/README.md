# defender90-lowpoly

The Defender the player drives in DRIFT.

## Provenance

| | |
| --- | --- |
| title | Land Rover Defender 90 Lowpoly |
| author | kekis69 — https://sketchfab.com/kekis69 |
| source | https://sketchfab.com/3d-models/land-rover-defender-90-lowpoly-88e5f30687ec4d508cebafa876e014d6 |
| licence | CC-BY-4.0 — http://creativecommons.org/licenses/by/4.0/ |
| exporter | Sketchfab-14.86.0 |

The licence requires attribution. It travels with the asset in `scene.gltf`
under `asset.extras` and must survive any future repack — a test asserts it.

## Why the shipped file is not the file Sketchfab exported

LOT 04 measured the cold visit and found this model was 60.7% of everything
DRIFT downloads, and that on a throttled mobile connection the player becomes
drivable roughly 18 seconds before the vehicle appears on screen. The file was
repacked to shorten that window. **No geometry was changed.**

| | Sketchfab export | shipped |
| --- | ---: | ---: |
| `scene.bin` | 4 111 684 B | 2 783 540 B |
| `scene.gltf` | 93 472 B | 47 192 B |
| primitives | 51 | 51 |
| triangles | 100 075 | 100 075 |
| vertices | 90 962 | 90 962 |
| materials | 15 | 15 |
| POSITION / NORMAL | float32 | float32, **bit-identical** |

Two changes, both lossless for this asset:

- **`TEXCOORD_0` dropped** (−711 KB). The model declares no images, no
  textures and no sampler, and not one of its 15 materials references a
  texture; `Defender90LowpolyVehicleVisual` paints it with flat colours. The UV
  channel was therefore never sampled by anything.
  *Cost of this choice:* texturing the model later means re-exporting it from
  the Sketchfab source, or reverting this file from git history.
- **Indices narrowed from `UNSIGNED_INT` to `UNSIGNED_SHORT`** (−587 KB). The
  largest primitive holds 21 945 vertices, so every index value in the file is
  below 65 536 and survives the narrowing exactly. Checked per primitive by the
  repacker, not assumed.

The remaining shrink of `scene.gltf` is one bufferView per accessor plus the
loss of the exporter's pretty-printing.

## Regenerating

```
node scripts/repack-gltf.mjs <sketchfab-export-dir> public/models/defender90-lowpoly
```

Pass `--keep-uv` to keep the UV channel (still narrows the indices). The
repacker refuses assets with skins or animations, and refuses to drop UVs
unless the asset really declares no textures.
