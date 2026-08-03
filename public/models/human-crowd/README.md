# Human/Crowd Kit — tracked runtime subset (`DRIFT-IV-PRE-30`)

- **Registry id:** `PRE20-A01` (see `docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §6.1, §14.2).
- **Pack:** Kenney "Mini Characters", version `1.0`.
- **Author/publisher:** Kenney (kenney.nl).
- **Source page:** https://kenney.nl/assets/mini-characters
- **Licence:** Creative Commons Zero, `CC0-1.0` — full text preserved at `docs/evidence/DRIFT-IV-PRE-20/licences/kenney-mini-characters-License.txt`. Attribution appreciated, not required.
- **Source archive:** `https://kenney.nl/media/pages/assets/mini-characters/bfc7e272b4-1774770718/kenney_mini-characters.zip`, `9e1d48e6d7b8479ebbe84df71eb5bd8e1b3f0da546dea641890dccc8a02d0999` (SHA-256), 2,403,059 bytes — re-verified against the `DRIFT-IV-PRE-20` recorded hash before extraction; exact match, no `SOURCE_MISMATCH`.

## Tracked files

| File | Selected path inside archive | Hash before transformation | Final tracked hash | Size |
|---|---|---|---|---|
| `character-male-a.glb` | `Models/GLB format/character-male-a.glb` | `77572792bfe2773b715b8cd8e18644b52b3e1f155fe10450254b50f9c364382a` | identical (untransformed) | 246,916 bytes |
| `Textures/colormap.png` | `Models/GLB format/Textures/colormap.png` | `0d4947d34ff32acf4a359c7f22ca784e057e7e72f622170a9a77b6fc88fdb70e` | identical (untransformed) | 8,706 bytes |

No conversion or optimization performed — both files are copied byte-for-byte from the official archive. `character-male-a.glb` references `Textures/colormap.png` as an external image URI (glTF, not embedded); the runtime loader resolves this relative to the GLB's own directory, so both files must ship together.

## Structure (independently re-inspected this lot, standard-library-only glTF parser)

7-joint skeleton × 2 skins, 10 nodes, 2 meshes, 1 material, 32 named animation clips (`static`, `idle`, `walk`, `sprint`, `jump`, `fall`, `crouch`, `sit`, `drive`, `die`, `pick-up`, `emote-yes`, `emote-no`, `holding-*`, `attack-*`, `interact-*`, `wheelchair-*`), ~723 estimated triangles, `KHR_texture_transform` used.

## Runtime role

`DRIFT-IV-PRE-30` Urban/Human pilot: one real skinned character loaded via `GLTFLoader`, driven by a `THREE.AnimationMixer` (idle/walk/interact clip switching). Technical/animation-architecture reference only.

## Owner guardrails (carried from `PRE20-A01`, unchanged)

The pack's low-poly, flat-shaded look is **not** approved as final foreground/hero human art. No accepted masterframe or realism doctrine may be weakened to match this style. Authorized only for skeleton/clip/retargeting/crowd-instancing/animation-architecture experiments (`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §14.2).

## Canonical evidence

`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §6.1, §14.2, §14.4 · `docs/evidence/DRIFT-IV-PRE-30/shared-kit-pilots-evidence.md` (this lot).
