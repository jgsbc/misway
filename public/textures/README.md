# `public/textures/` — photo material sets

## Source and licence

Five Poly Haven material sets, `CC0-1.0` (public domain), no attribution
legally required. Source: <https://polyhaven.com/> — licence record and
retrieval evidence in
`docs/evidence/DRIFT-IV-PRE-20/licences/polyhaven-terms-note.md`.

| set | used for | Poly Haven author credit (courtesy) |
| --- | --- | --- |
| `aerial_beach_01` | `sand` | Poly Haven |
| `brown_planks_07` | `wood` | Poly Haven |
| `concrete_wall_008` | `concrete` | Poly Haven |
| `red_brick_03` | `brick` | Poly Haven |
| `rock_boulder_dry` | `rock` | Poly Haven |
| `snow_02` | shared-kit pilot (`WaterWeatherLightPilot`) | Rob Tuytel / Poly Haven |

## Two generations of files, on purpose

- `*_1k.jpg` — the originals as downloaded from Poly Haven. **Kept as the
  provenance/derivation source.** The five material sets above are no longer
  loaded at runtime by `drift3dTextureFactory.ts`; `snow_02_*_1k.jpg` still is,
  by `src/lib/drift3dKitAssets.ts`.
- `*_512.webp` — the runtime derivatives, generated locally from the `_1k.jpg`
  originals in this directory. 5.48 MB of JPEG becomes 280 KB of WebP for the
  same on-screen material (see the measurements below).

CC0 imposes no restriction on derivative works; deriving and shipping the
smaller encodes changes nothing about the licence.

## Exact derivation

Reproducible from this directory with Python + Pillow (Pillow 12.3.0,
libwebp 1.6.0 produced the committed bytes):

```python
from PIL import Image

names = ["aerial_beach_01", "brown_planks_07", "concrete_wall_008",
         "red_brick_03", "rock_boulder_dry"]

for n in names:
    for kind in ("diff", "nor_gl"):
        im = Image.open(f"{n}_{kind}_1k.jpg").convert("RGB")
        im.resize((512, 512), Image.LANCZOS).save(
            f"{n}_{kind}_512.webp", "WEBP", quality=80, method=6
        )
```

## Why 512 / WebP q80

Chosen against a budget fixed before the variants were compared (photo
textures <= 600 KB over the wire, <= 16 MB of GPU texture memory, request
count unchanged, mean-luminance deviation < 2% and perceptibly different
pixels < 8% against the 1K reference render).

| set | 1K JPEG | 512 WebP | share | diffuse PSNR | normal angular error |
| --- | ---: | ---: | ---: | ---: | ---: |
| `aerial_beach_01` | 369 KB | 65 KB | 17.7% | 38.6 dB | 4.79 deg |
| `brown_planks_07` | 898 KB | 43 KB | 4.8% | 32.1 dB | 3.17 deg |
| `concrete_wall_008` | 1108 KB | 12 KB | 1.1% | 34.6 dB | 1.05 deg |
| `red_brick_03` | 1611 KB | 90 KB | 5.6% | 27.7 dB | 7.76 deg |
| `rock_boulder_dry` | 1622 KB | 70 KB | 4.3% | 31.0 dB | 3.19 deg |
| **total** | **5610 KB** | **280 KB** | **5.0%** | | |

GPU footprint (RGBA + mipmaps) drops from 53.3 MB to 13.3 MB.

Rendered at five capture points in a 390x844 portrait viewport, the 512 set is
identical to the 1K set at four of them (0.00-0.06% of pixels differ by more
than 8/255 of luminance) and differs on 14.9% of pixels at the fifth, a
point-blank capture with the camera pressed into a sand wall. A 768 variant
(634 KB, over budget) only brought that one point to 11.3% and changed nothing
elsewhere, so it was rejected.

Two properties of the source maps worth knowing before touching this set:

- `concrete_wall_008_nor_gl` carries only 1.06 deg of mean relief in its 1K
  original — it is a near-flat normal map that cost 500 KB. Its 1.6 KB
  derivative reproduces it to within 1.05 deg.
- `red_brick_03_nor_gl` is the one map that genuinely loses relief at 512
  (7.76 deg of error against 13.09 deg of source relief), and the loss is
  driven by resolution, not by compression — even a lossless 512 encode still
  errs by 5.70 deg. If a desktop quality tier is ever added, this is the one
  asset worth spending bytes on.

## Runtime contract

`drift3dTextureFactory.ts` stores these paths repository-relative and resolves
them through `getDrift3DPhotoTextureUrl()` (i.e. `withBasePath()`). The
production export is served under `/misway`, so an unprefixed URL 404s — and a
404 texture is not a silent no-op: `TextureLoader` still hands the material a
`Texture` that never uploads, so the sampler reads three.js's 1x1
RGBA(0,0,0,0) empty texture. The diffuse multiplies to black and the normal
map decodes to `normalize(tbn * vec3(-1))`, which points the shading normal
into the surface. `src/lib/drift3dPhotoTextures.test.mts` guards both the
prefix and the presence of every declared file.
