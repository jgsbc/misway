# Urban Kit — tracked runtime subset (`DRIFT-IV-PRE-30`)

- **Registry id:** `PRE20-A02` (see `docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §6.2, §14.2).
- **Pack:** Kenney "City Kit (Commercial)", version `2.1`.
- **Author/publisher:** Kenney (kenney.nl).
- **Source page:** https://kenney.nl/assets/city-kit-commercial
- **Licence:** Creative Commons Zero, `CC0-1.0` — full text preserved at `docs/evidence/DRIFT-IV-PRE-20/licences/kenney-city-kit-commercial-License.txt`. Attribution appreciated, not required.
- **Source archive:** `https://kenney.nl/media/pages/assets/city-kit-commercial/a742d900eb-1753115042/kenney_city-kit-commercial_2.1.zip`, `f8b09b081c2bb88bcc126e2dec1cb40fd0dad7e7e591b6c26aaefe96fb35276b` (SHA-256), 4,096,974 bytes — re-verified against the `DRIFT-IV-PRE-20` recorded hash before extraction; exact match, no `SOURCE_MISMATCH`.

## Tracked files

| File | Selected path inside archive | Hash before transformation | Final tracked hash | Size |
|---|---|---|---|---|
| `building-a.glb` | `Models/GLB format/building-a.glb` | `5cf220f90ee3f21e7abe38055ca409a48aa8ef1d5ffab6e2deb99e5a5e1ed5e0` | identical (untransformed) | 108,936 bytes |
| `building-b.glb` | `Models/GLB format/building-b.glb` | `3b5d3ac0799c024781d92bb15971d42f4f8e380554dc5cf6a40c2f07d948947a` | identical (untransformed) | 106,408 bytes |
| `Textures/colormap.png` | `Models/GLB format/Textures/colormap.png` | `191bec3889aaaca5018380038fecc129ebb5c2182879a099b7b538b3fa050b5d` | identical (untransformed) | 11,002 bytes |

No conversion or optimization performed. Both building GLBs reference `Textures/colormap.png` as an external image URI (glTF, not embedded) — the runtime loader resolves this relative to each GLB's own directory, so all three files ship together. Two distinct building forms selected (out of the pack's ~19 building/skyscraper variants) — sufficient to prove "at least two building forms" per this lot's own scope; the full pack is not copied.

## Structure (independently re-inspected this lot, standard-library-only glTF parser)

Each building: 1 node, 1 mesh, 1 material, 0 skins/animations, `KHR_texture_transform` used. `building-a.glb`: ~1,252 estimated triangles. `building-b.glb`: ~1,276 estimated triangles.

## Runtime role

`DRIFT-IV-PRE-30` Urban/Human pilot: background/distant-massing buildings, loaded via `GLTFLoader`, instanced with deterministic per-instance transforms (position/rotation/scale), sharing one material per building form.

## Owner guardrails (carried from `PRE20-A02`, unchanged)

The pack's low-poly flat-shaded visual register is **not** approved for foreground/hero use against the accepted masterframes. Any pilot must stay scoped to background/distant massing (skyline silhouette) unless a retexturing pass is separately proposed and accepted (`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §14.2).

## Canonical evidence

`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md` §6.2, §14.2, §14.4 · `docs/evidence/DRIFT-IV-PRE-30/shared-kit-pilots-evidence.md` (this lot).
