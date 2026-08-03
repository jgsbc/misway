# Vehicle/Traffic Kit — tracked runtime subset (`DRIFT-IV-PRE-30`)

- **Registry id:** `PRE20-B01` (see `docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §6.7, §14.2).
- **Pack:** Kenney "Car Kit", version `3.1`.
- **Author/publisher:** Kenney (kenney.nl).
- **Source page:** https://kenney.nl/assets/car-kit
- **Licence:** Creative Commons Zero, `CC0-1.0` — full text preserved at `docs/evidence/DRIFT-IV-PRE-20/licences/kenney-car-kit-License.txt`. Attribution appreciated, not required.
- **Source archive:** `https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip`, `fac7dacac5c7874348cf19729af3ef205f3d366493edaf0a827d93f4fdf3d0c4` (SHA-256), 4,814,237 bytes — re-verified against the `DRIFT-IV-PRE-20` recorded hash before extraction; exact match, no `SOURCE_MISMATCH`.

## Tracked files

| File | Selected path inside archive | Hash before transformation | Final tracked hash | Size |
|---|---|---|---|---|
| `sedan.glb` | `Models/GLB format/sedan.glb` | `b532ea7d2c59f7f6b22b138cf1955218a2c1898f1cea932af4d3fd563c3959b7` | identical (untransformed) | 172,216 bytes |
| `Textures/colormap.png` | `Models/GLB format/Textures/colormap.png` | `f3622a03a20c6696065cae9cbe391351be873508af190c2ebd1d420c055787a5` | identical (untransformed) | 12,371 bytes |

No conversion or optimization performed. `sedan.glb` references `Textures/colormap.png` as an external image URI (glTF, not embedded) — the runtime loader resolves this relative to the GLB's own directory, so both files ship together.

## Structure (independently re-inspected this lot, standard-library-only glTF parser)

5 nodes — `body`, `wheel-front-left`, `wheel-front-right`, `wheel-back-left`, `wheel-back-right` (confirmed exact names, matching `DRIFT-IV-PRE-20`'s own recorded structure) — 5 meshes, 1 material, 0 skins/animations (no skeleton needed — wheel rotation is a plain per-node Y-axis transform), ~2,032 estimated triangles, `KHR_texture_transform` used.

## Runtime role

`DRIFT-IV-PRE-30` Nature/Movement pilot: one real vehicle GLB loaded via `GLTFLoader`, its 4 named wheel nodes resolved and rotated procedurally from path speed; background-only traffic, instanced/pooled for additional non-hero vehicles sharing the same geometry/material.

## Owner guardrails (carried from `PRE20-B01`, unchanged)

This kit's low-poly flat-shaded look is **not** proposed for hero/foreground use and does not compete with or replace the canonical sand safari 4x4 in any frame — background traffic only (`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §14.2).

## Canonical evidence

`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §6.7, §14.2, §14.4 · `docs/evidence/DRIFT-IV-PRE-30/shared-kit-pilots-evidence.md` (this lot).
