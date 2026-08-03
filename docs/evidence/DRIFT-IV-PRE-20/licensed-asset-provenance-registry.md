# DRIFT-IV-PRE-20 — Licensed Asset / Provenance Registry and Import Evaluation

**Status:** `OWNER_REVIEW_REQUIRED` — research, primary-source licence verification, real downloads, real technical import inspection and visual evaluation are complete for a bounded candidate set. No candidate has been adopted into the runtime. Owner acceptance of the recommended promoted set is required before this lot can reach `DONE_PENDING_MERGE`.
**Lot:** `DRIFT-IV-PRE-20` — Licensed asset / provenance registry and import evaluation
**Branch:** `drift-iv-pre-20-licensed-asset-provenance-registry`
**Type:** Research/evidence and bounded real-download lot. No production Drift runtime file changed. No `public/audio` change. No raw third-party binary committed into the tracked repository — all downloaded archives and extracted assets live under the untracked `.tmp/drift-pre-20/` quarantine directory and are absent from this lot's diff; only small preview images (all under 400 KB) and small licence text files are committed as evidence.

---

## 1. Baseline (confirmed)

```text
Branch:  drift-iv-pre-20-licensed-asset-provenance-registry
HEAD:    e212c056cbb06d0c1bd973b16c7d1000e4052209
main:    e212c056cbb06d0c1bd973b16c7d1000e4052209  (identical)
```

Confirmed via `git branch --show-current`, `git rev-parse HEAD`, `git rev-parse e212c056cbb06d0c1bd973b16c7d1000e4052209` (identical), and `git status --short` (clean at start). `git log --oneline -8` confirms `DRIFT-IV-PRE-10` (PR #35, `e212c05`), `DRIFT-IV-PRE-00` (PR #34, `8a74a31`), `DRIFT-IV-GOV-40` (PR #33, `99eacbe`) and `DRIFT-IV-BY-EUX-30` (PR #32, `b069d09`) all present as ancestors.

**Environment confirmed this pass:**
- `three`: installed and resolved at exactly `0.185.0` (package.json declares `^0.185.0`); `@react-three/fiber` `^9.6.1`; no `@react-three/drei` dependency.
- `next.config.ts`: `output: "export"` (static site export), `images.unoptimized: true` — no server-side asset/image processing pipeline exists; any adopted asset must work as a static file.
- `public/textures/`: exactly the 5 previously-adopted Poly Haven sets (`aerial_beach_01`, `brown_planks_07`, `concrete_wall_008`, `red_brick_03`, `rock_boulder_dry`), 10 files, 1K JPG diffuse+normal-GL pairs — confirmed unchanged.
- **No `.glb`/`.gltf` file exists anywhere in the tracked repository** (confirmed via `Glob **/*.glb`) — the runtime remains 100% procedural, matching `DRIFT_3D_RUNTIME_MIGRATION_MAP.md`'s own finding.
- **No `.gitattributes` file exists; Git LFS is installed on the system (`git-lfs/3.7.1`) but not configured for this repository** — no LFS-tracked patterns exist. Recorded as a fact, not changed by this lot.
- **No third-party licence file existed anywhere in the tracked repository before this lot** — including for the 5 already-adopted Poly Haven textures, which had a code-comment citation (`drift3dTextureFactory.ts` line 6: *"Photo-sourced CC0 diffuses (Poly Haven, public/textures)"*) but no formal licence-evidence record. This lot closes that gap (§6.5 below) without changing the adopted status.
- `docs/DRIFT_3D_ASSET_REUSE_MATRIX.md` read in full: confirmed 1 `ADOPT` table (Poly Haven + 6 in-repo original-code rows), 1 `PILOT`/`REJECT` table (6 in-repo rows + the existing `Reflector.js` PILOT row), 1 `REFERENCE` table (5 category-only rows: Mixamo/Quaternius-style rigged humanoid, Kenney city packs, CC0 vehicle packs, additional Poly Haven sets, Kenney/Quaternius prop packs).

## 2. Canonical authorities read

`AGENTS.md`, `docs/ACTIVE_LOT.md`, `docs/DECISIONS_LOG.md`, `docs/DRIFT_3D_INTEGRAL_BACKLOG.md`, `docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md`, `docs/DRIFT_3D_ERA_TRACK_ATLAS.md`, `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md`, `docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`, `docs/DRIFT_3D_ASSET_REUSE_MATRIX.md` (full, see §1 above), `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md`, `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`, `docs/DRIFT_3D_REALISM_BIBLE.md`, `package.json`, `next.config.ts`. `docs/evidence/DRIFT-IV-PRE-20/` did not exist before this pass.

## 3. Scope discipline actually observed

| Limit | Cap | Actual |
|---|---|---|
| Longlisted candidates | ≤12 | **11** |
| Deeply evaluated candidates | ≤6 | **6** (Kenney Mini Characters, Kenney City Kit Commercial, Kenney Car Kit, Kenney Nature Kit, Poly Haven `snow_02`, three.js `Water.js`/`Sky.js`) |
| Competing candidates per functional need | ≤2 | Human/Crowd: Quaternius vs. Kenney (2); Urban: Kenney only (1); Vehicle: Kenney only (1); Nature: Kenney only (1); Water: three.js only (1) |
| Temporary downloaded archives, total | ≤250 MB | **~101 MB** (measured via `du -sh` per candidate directory under `.tmp/drift-pre-20/`, see §9) |
| Raw third-party binary committed to tracked repo | none, unless tiny/permitted/necessary | **Zero.** Only small preview images (≤361 KB each) and small licence `.txt`/`.md` files are committed — no `.glb`, `.fbx`, `.zip`, `.blend` file is tracked. |
| Mass/marketplace/catalogue downloads | forbidden | Not done — exactly one specific asset page per candidate was researched and, where downloaded, exactly one representative file (or the one relevant sub-kit) was fetched, never an entire creator catalogue. |

Tool versions used for inspection, recorded exactly (per this lot's own "ephemeral tool" allowance — no permanent npm dependency added):
- **Python 3.14.0**, **Pillow 12.2.0** (`pip`-installed on the host, not a project dependency) — used to decode/measure texture and preview images.
- **PowerShell 7 `Get-FileHash -Algorithm SHA256`** — used for every archive/file hash in this registry.
- **A short inline Python script using only the standard-library `struct` and `json` modules** (no third-party glTF library) — used to parse GLB binary containers directly (12-byte header + chunked JSON/BIN per the glTF 2.0 binary spec) and extract mesh/material/node/animation/skin/accessor counts. Exact script text is reproduced in §7 below for reproducibility.

## 4. Longlist (11 candidates named this pass)

| # | Candidate | Category | Domain group | Deep-evaluated? | Status |
|---|---|---|---|---|---|
| 1 | Mixamo (Adobe) | Rigged humanoid + mocap clips | A — Urban/Human | Terms researched, no download (dispositive terms found) | `REJECT` |
| 2 | Quaternius — Ultimate Modular Men Pack | Rigged humanoid + 24 clips | A — Urban/Human | Terms + folder listing researched; file download blocked (Drive quota) | `REFERENCE` |
| 3 | Quaternius — Background Posed Humans Pack | Posed (non-animated) humans | A — Urban/Human | Same Drive-quota obstacle confirmed on a second, different folder; not separately deep-evaluated | `REFERENCE` |
| 4 | Kenney — Animated Characters Protagonists | Themed animated characters (skater/cyborg/criminal) | A — Urban/Human | Page researched, passed over (too thematically specific) | not promoted, not deep-evaluated |
| 5 | Kenney — Animated Characters Survivors | Themed animated characters (zombie/survival) | A — Urban/Human | Page researched, passed over (too thematically specific) | not promoted, not deep-evaluated |
| 6 | Kenney — Mini Characters | Rigged generic people + 32 clips | A — Urban/Human | **Yes — downloaded, inspected, previewed** | `PILOT` |
| 7 | Kenney — City Kit (Commercial) | Modular buildings/towers | A — Urban/Human | **Yes — downloaded, inspected, previewed** | `PILOT` |
| 8 | Kenney — Car Kit | Background vehicles | B — Nature/Movement | **Yes — downloaded, inspected, previewed** | `PILOT` |
| 9 | Kenney — Nature Kit | Rocks/trees/foliage | B — Nature/Movement | **Yes — downloaded, inspected, previewed** | `REJECT` |
| 10 | Poly Haven — `snow_02` | PBR photo material (diff/nor_gl/rough) | C — Water/Weather/Light | **Yes — downloaded, inspected** | `ADOPT` |
| 11 | three.js — `Water.js` / `Sky.js` (bundled with the installed `three` package) | Upstream procedural water/sky mechanism | C — Water/Weather/Light | **Yes — inspected directly in `node_modules`, no download needed** | `PILOT` (upgrades existing `Reflector.js` PILOT row) |

**Deep-evaluation count: 6** (rows 6–11). **Real downloads performed: 5** (rows 6–10; row 11 needed no download, already an installed dependency).

## 5. Domain-group coverage (PRE-30 requirement)

| Group | Relevant kits | Deep-eval target | Result |
|---|---|---|---|
| **A — Urban/Human** | Urban, Human/Crowd, Animation, Interior, Machine/Prop, Signage/Screen, Secondary-Life | 1 rigged human/crowd + 1 urban/interior/prop | **Met.** Kenney Mini Characters (`PILOT`, rigged human/crowd, 32 clips) + Kenney City Kit Commercial (`PILOT`, urban). Quaternius remains `REFERENCE` (licence confirmed, access blocked); Mixamo `REJECT`ed on terms. |
| **B — Nature/Movement** | Terrain/Road, Mountain, Vegetation, Vehicle/Traffic, Animation | 1 nature/vegetation/terrain/mountain + 1 vehicle | **Met, partially via existing systems.** Kenney Car Kit (`PILOT`, vehicle) covers the vehicle target directly. Kenney Nature Kit was deep-evaluated and `REJECT`ed (unlit/untextured materials conflict with the Realism Bible's PBR mandate — see §7.4); the **existing in-repo Vegetation/Terrain system (already `ADOPT`, `docs/DRIFT_3D_ASSET_REUSE_MATRIX.md` §1)** is confirmed sufficient for this component, per this lot's own rule that "a group may rely partly on existing ADOPT/PILOT systems when the registry demonstrates that no external acquisition is needed." |
| **C — Water/Weather/Light** | Water, Weather, Lighting/Material, Transition | 1 PBR material/HDRI + 1 water/weather/light (external or verified existing mechanism) | **Met.** Poly Haven `snow_02` (`ADOPT`, PBR material) + three.js `Water.js`/`Sky.js` (`PILOT`, existing upstream MIT mechanism already installed, formally verified this pass — not a pretended external asset). |

**All three PRE-30 domain groups have at least one credible, licence-verified, technically-inspected pilot path.**

## 6. Deep-evaluation candidates — full record

### 6.1 `PRE20-A01` — Kenney Mini Characters

- **Publisher/source:** Kenney (kenney.nl), official asset page https://kenney.nl/assets/mini-characters
- **Version:** 1.0. **Retrieved:** 2026-08-03, this session.
- **Licence:** `CC0-1.0` (site badge links to https://creativecommons.org/publicdomain/zero/1.0/; archive's own `License.txt` states *"You can use this content for personal, educational, and commercial purposes... Support by crediting 'Kenney'... this is not a requirement"*).
- **Download:** `https://kenney.nl/media/pages/assets/mini-characters/bfc7e272b4-1774770718/kenney_mini-characters.zip` (self-hosted on kenney.nl, not a third-party mirror).
- **Archive:** 2,403,059 bytes. SHA-256 `9E1D48E6D7B8479EBBE84DF71EB5BD8E1B3F0DA546DEA641890DCCC8A02D0999`.
- **Licence file inside archive:** `License.txt`, 718 bytes when preserved (see `licences/kenney-mini-characters-License.txt`).
- **Contents:** `Models/{FBX,GLB,OBJ} format/`, `Textures/`, `Previews/`, `Overview.html`, `License.txt`. 25 total model files: 12 character variants (6 female + 6 male), 10 "aid" accessibility props (cane, wheelchair, hearing aid, glasses, defibrillator, mask — matching the pack's own "disability" tag), 3 wheelchair variants.
- **Technical inspection (representative file `character-male-a.glb`, parsed directly via a standard-library GLB binary parser — see §3):**

  | Property | Value |
  |---|---|
  | File size | 246,916 bytes |
  | glTF version | 2.0, generator `UnityGLTF` |
  | Meshes | 2 |
  | Materials | 1 |
  | Nodes | 10 |
  | **Animation clips** | **32**, named: `static`, `idle`, `walk`, `sprint`, `jump`, `fall`, `crouch`, `sit`, `drive`, `die`, `pick-up`, `emote-yes`, `emote-no`, `holding-right/left/both`, `holding-right/left/both-shoot`, `attack-melee-right/left`, `attack-kick-right/left`, `interact-right/left`, `wheelchair-sit`, `wheelchair-look-left/right`, `wheelchair-move-forward/back/left/right` |
  | Skins | 2, each 7 joints |
  | Textures/images | 1 |
  | Extensions used | `KHR_texture_transform` (no extensions required) |
  | Estimated triangles | 723 |

  **Skeleton note:** 7 joints is a minimal rig — closely matches `docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md` §1.4's own stated convention ("hips root, spine/chest/head chain, two arm chains, two leg chains; no finger/facial bones needed at Drift's silhouette-first read distance"), a genuinely good technical fit for a shared humanoid skeleton, not a coincidence worth ignoring.
- **Visual evaluation (official preview image, `candidate-previews/kenney-mini-characters-preview.png`):** low-poly, flat-shaded, chunky-proportioned "toy" aesthetic with saturated flat colors — **stylistically inconsistent with the five accepted masterframes' photoreal/PBR register at close range.** At Drift's own silhouette-first, distance-viewing human-presence doctrine (`DRIFT_3D_GLOBAL_ART_DIRECTION.md` §9: "every human reads through silhouette, timing and comparative behavior only"), this mismatch is far less severe than it would be for a hero/foreground asset — flat-shaded low-poly silhouettes are plausibly indistinguishable from procedural silhouettes at the distances Drift's own crowd doctrine already specifies. Not proposed for foreground/hero use under any circumstance.
- **Beneficiary eras/tracks:** Birth Yard (bridge queue, Foolfoule crowd density), background human presence world-wide.
- **Status: `PILOT`.** Real provenance, real licence, real download, real technical inspection, real visual evaluation all complete. Requires a retexturing/style-harmonization pass (or restriction to genuinely silhouette-distance background use only) before it could read as consistent with the accepted masterframes — exactly the "meaningful adaptation... suitable for controlled `PRE-30` experimentation" `PILOT` definition, not `ADOPT`.

### 6.2 `PRE20-A02` — Kenney City Kit (Commercial)

- **Publisher/source:** Kenney, https://kenney.nl/assets/city-kit-commercial
- **Version:** 2.1 ("Fixed problem skyscraper E"). **Retrieved:** 2026-08-03.
- **Licence:** `CC0-1.0`, same terms as §6.1's `License.txt` (this pack's own copy: *"City Kit Commercial (2.1)... Creation date: 21-07-2025"*, see `licences/kenney-city-kit-commercial-License.txt`).
- **Download:** `https://kenney.nl/media/pages/assets/city-kit-commercial/a742d900eb-1753115042/kenney_city-kit-commercial_2.1.zip`.
- **Archive:** 4,096,974 bytes. SHA-256 `F8B09B081C2BB88BCC126E2DEC1CB40FD0DAD7E7E591B6C26AAEFE96FB35276B`.
- **Contents:** `Models/{FBX,GLB,OBJ} format/Textures/`, 50 total files (skyscrapers, low/mid-rise buildings, street-furniture details — awnings, overhangs, parasols).
- **Technical inspection (representative file `building-a.glb`):**

  | Property | Value |
  |---|---|
  | File size | 108,936 bytes |
  | glTF version | 2.0, generator `UnityGLTF` |
  | Meshes / Materials / Nodes | 1 / 1 / 1 |
  | Animations / Skins | 0 / 0 (static architecture, correctly no rig) |
  | Images/Textures | 1 shared `colormap.png`, **512×512 RGBA** |
  | Extensions used | `KHR_texture_transform` (none required) |
  | Estimated triangles | 1,252 |
  | GLB-format total (41 files) | 3,739,924 bytes |

- **Visual evaluation (`candidate-previews/kenney-city-kit-commercial-preview.png`):** same low-poly flat-shaded "toy city" register as §6.1 — a direct mismatch against Birth Yard's own accepted masterframe (dense, atmospheric, PBR glass/concrete/brushed-metal towers "receding into blue dusk haze"). Credible only as **background/distant massing** (silhouette skyline, not foreground hero architecture) or after a full re-texturing pass.
- **Beneficiary eras/tracks:** Birth Yard (background tower massing behind the gym), New Signal (Le Monde S'endort's distant skyline).
- **Status: `PILOT`.** Real, complete evidence; genuine technical fit (single shared 512×512 colormap keeps draw-call/texture cost low — good for background use specifically) but a real, named visual-identity gap at foreground distance.

### 6.3 `PRE20-B01` — Kenney Car Kit

- **Publisher/source:** Kenney, https://kenney.nl/assets/car-kit
- **Version:** 3.1 ("Fixed character colors"; history shows 3.0 added kart racers, 2.0 was a full remake). **Retrieved:** 2026-08-03.
- **Licence:** `CC0-1.0` (this pack's own `License.txt`, *"Car Kit (3.1)... Creation date: 02-04-2026"*, see `licences/kenney-car-kit-License.txt`).
- **Download:** `https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip`.
- **Archive:** 4,814,237 bytes. SHA-256 `FAC7DACAC5C7874348CF19729AF3EF205F3D366493EDAF0A827D93F4FDF3D0C4`.
- **Contents:** 45 GLB files — sedans, SUVs, vans, trucks, taxi, police, ambulance, firetruck, tractors, karts, plus wheel variants and collision debris parts.
- **Technical inspection (representative file `sedan.glb`):**

  | Property | Value |
  |---|---|
  | File size | 172,216 bytes |
  | glTF version | 2.0, generator `UnityGLTF` |
  | Meshes / Materials / Nodes | 5 / 1 / 5 |
  | **Node structure** | **body + 4 separately-named wheel nodes** (`wheel-front-left/right`, `wheel-back-left/right`) — confirms the existing Asset Reuse Matrix's own prediction ("N/A or simple wheel-rotation rig, unconfirmed") is correct: wheels can be procedurally Y-rotated at runtime without any skeleton |
  | Animations / Skins | 0 / 0 |
  | Extensions used | `KHR_texture_transform` (none required) |
  | Estimated triangles | 2,032 |

- **Visual evaluation (`candidate-previews/kenney-car-kit-preview.png`):** same toy-flat aesthetic. Credible only as **background/non-hero traffic** (Birth Yard's "one delivery van," generic background transit), never a hero-visible vehicle — the canonical sand safari 4x4 remains the only hero vehicle in every frame; nothing here is proposed to replace or compete with it.
- **Beneficiary eras/tracks:** Birth Yard (canal-side traffic), background transit world-wide.
- **Status: `PILOT`.** Real, complete evidence; separate wheel nodes make the wheel-rotation integration technically trivial; visual register is background-only.

### 6.4 `PRE20-B02` — Kenney Nature Kit

- **Publisher/source:** Kenney, https://kenney.nl/assets/nature-kit
- **Version:** 1.0. **Retrieved:** 2026-08-03.
- **Licence:** `CC0-1.0` (this pack's own `License.txt`, see `licences/kenney-nature-kit-License.txt`).
- **Download:** `https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip`.
- **Archive:** 10,537,521 bytes. SHA-256 `FA7974A0D342BFE63C38664BA9F8EC1A4AAB8EA25F099BDC56870E33588C4D9D`.
- **Contents:** 329 GLB files (rocks, trees, bridges, beds, and more) across `DAE`/`FBX`/`GLTF`(actually `.glb`, see finding below)/`OBJ`/`STL` format folders, plus `Isometric`/`Side` 2D sprite renders.
- **Honest naming-convention finding:** the archive's own subfolder is labelled `"GLTF format"` but every file inside it is actually a binary `.glb`, not a text `.gltf` — recorded as-is, not silently corrected, since it is exactly what the archive contains.
- **Technical inspection (representative files `rock_tallA.glb`, `tree_default.glb`):**

  | Property | `rock_tallA.glb` | `tree_default.glb` |
  |---|---|---|
  | File size | 12,072 bytes | 9,428 bytes |
  | Meshes / Materials | 1 / 3 | 1 / 2 |
  | **Images** | **0** | **0** |
  | Extensions used | **`KHR_materials_unlit`** | **`KHR_materials_unlit`** |
  | Generator | `UniGLTF-1.27` | `UniGLTF-1.27` |
  | Estimated triangles | 136 | 114 |
  | Total GLB payload (329 files) | 3,034,380 bytes | — |

- **Blocking technical/artistic finding:** every inspected mesh uses **`KHR_materials_unlit`** with **zero image/texture references** — flat vertex/material-color shading, not PBR. `docs/DRIFT_3D_REALISM_BIBLE.md`'s own non-negotiable rule states *"No mesh ships without a textured PBR material"* and *"Never a flat color without a texture."* This candidate directly conflicts with that rule as-is.
- **Visual evaluation (`candidate-previews/kenney-nature-kit-preview.png`):** confirms the same low-poly flat-color register described technically above.
- **Status: `REJECT`.** Not a licence problem (licence is clean `CC0-1.0`) — a technical/artistic-identity mismatch against this project's own non-negotiable Realism Bible rule. **The existing in-repo Vegetation/Terrain system (`docs/DRIFT_3D_ASSET_REUSE_MATRIX.md` §1, already `ADOPT`, described there as "already the strongest existing shared kit in the codebase") is confirmed sufficient for Group B's nature/vegetation component** — no external acquisition is needed for this specific piece. Mountain Kit's own rock/cliff-dressing gap (a `PILOT`-adjacent need distinct from ground-cover vegetation) remains open for a future lot with a PBR-textured rock source (e.g. a future additional Poly Haven rock/cliff material set, following the exact precedent set by `PRE20-C01` below).

### 6.5 `PRE20-C01` — Poly Haven `snow_02`

- **Publisher/source:** Poly Haven, https://polyhaven.com/a/snow_02. Author: **Rob Tuytel** (credited on the asset page).
- **Retrieved:** 2026-08-03. Released (per the asset page): 7 years ago (well-established, actively-served asset, 225,326 downloads at time of retrieval — not an obscure/abandoned source).
- **Licence:** `CC0-1.0`, confirmed on the current, live `https://polyhaven.com/license` page this session (see `licences/polyhaven-terms-note.md` for the full retrieval record) — the exact same licence already governing the 5 pre-existing adopted Poly Haven sets in `public/textures/`.
- **Download (via Poly Haven's own public API, `api.polyhaven.com/files/snow_02`, 1K JPG variant, matching the existing 5 sets' own resolution/format convention exactly):**

  | File | URL | Size | SHA-256 |
  |---|---|---|---|
  | Diffuse | `dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/snow_02/snow_02_diff_1k.jpg` | 325,497 B | `523A4E69C90B96D787DD69B897F29A2B3761A017024405C60AA630D1E8E9009A` |
  | Normal (GL) | `.../snow_02_nor_gl_1k.jpg` | 1,081,858 B | `9495EC680616B8340E2CBECBD151BFF84C690CFAD4209E90CC98D2D0BA81F810` |
  | Roughness | `.../snow_02_rough_1k.jpg` | 146,089 B | `B6DEA8039AC2A5BEAED6FD41834FB55540CC76B492EDD1D48BA2DA2F30F1CB75` |

- **Technical inspection (via Pillow):** all three decode successfully; diffuse and normal-GL are **1024×1024 RGB JPEG**; roughness is **1024×1024 L (single-channel) JPEG** — a genuine roughness map, which the 5 pre-existing adopted sets do not currently ship (they use diffuse+normal-GL only) — this candidate offers a **more complete PBR channel set** than what is currently integrated.
- **Visual evaluation:** photo-sourced, physically-based snow/ice material — directly consistent with Older Shadows' own accepted masterframe ("patches of snow at the tree line") and the existing, already-integrated Poly Haven material pipeline in `drift3dTextureFactory.ts`. No stylistic mismatch of any kind — this is the same source, same convention, same integration path as the 5 assets already shipping.
- **Beneficiary eras/tracks:** Older Shadows (Rise's snow-line, the mountain plateau masterframe).
- **Status: `ADOPT`.** Zero adaptation cost — identical integration path to the existing 5 sets (`TextureLoader`, no loader dependency beyond what's already used). This is the cleanest, lowest-risk promotion in this entire registry.

### 6.6 `PRE20-C02` — three.js `Water.js` / `Sky.js` (existing upstream mechanism, not a new external asset)

- **Source:** bundled with the already-installed `three` npm package (`node_modules/three/examples/jsm/objects/Water.js`, `Water2.js`, `WaterMesh.js`, `Water2Mesh.js`, `Sky.js`, `SkyMesh.js`).
- **Installed version:** `three@0.185.0` (exact, confirmed via `node_modules/three/package.json`), matching `package.json`'s own `^0.185.0` declaration exactly — **zero new npm dependency required.**
- **Licence:** MIT — confirmed directly from `node_modules/three/LICENSE` (*"The MIT License. Copyright © 2010-2026 three.js authors"*), preserved verbatim at `licences/threejs-LICENSE.txt`.
- **Technical inspection (direct source read, no parsing tool needed):** `Water.js` (374 lines) exports a `Water` class `extends Mesh`, a real-time reflective-water shader with its own render-target-based reflection pass; its own doc-comment states explicitly *"this class can only be used with `WebGLRenderer`... When using `WebGPURenderer`, use `WaterMesh`"* — this project's `@react-three/fiber` setup uses `WebGLRenderer` by default, so `Water.js` (not the newer `WaterMesh.js`) is the directly compatible module. `Sky.js` (321 lines) is a companion atmospheric-scattering sky shader from the same upstream source.
- **Relationship to the existing Asset Reuse Matrix:** this directly extends the existing `PILOT` row for `three/examples/jsm/objects/Reflector.js` (§2 of the matrix), which that row already flagged as needing "the Water Kit's wave/erasure extension before it can serve Étééaooété's ocean requirements." `Water.js` is exactly that extension — a real, already-available, MIT-licensed, zero-new-dependency upgrade path, not a hypothetical one.
- **Beneficiary eras/tracks:** Birth Yard (canal, upgrading the current bare `Reflector` flag), New Signal (Étééaooété's ocean wave/erasure mechanic — the hardest, most load-bearing water requirement in the whole catalogue).
- **Status: `PILOT`** (this is a genuine, already-verified existing mechanism, not a "pretended external asset" per this lot's own explicit instruction) — real integration work remains (wiring wave parameters, the erasure mechanic Étééaooété's own Era Contract requires) before it is Étééaooété-ready.

## 7. Rejected candidates (with reasons, kept for the record)

| Candidate | Reason |
|---|---|
| Mixamo (Adobe) | Adobe General Terms of Use §3.6 "Content Files" clause forbids stand-alone redistribution of raw asset files outside an embedded "End Use" — incompatible with committing source files to a public GitHub repository. See `licences/mixamo-adobe-terms-note.md`. Genuinely open alternative (Quaternius/Kenney) evaluated in its place. |
| Kenney Nature Kit | Licence is clean (`CC0-1.0`); rejected on technical/artistic grounds — every inspected mesh uses `KHR_materials_unlit` with zero texture references, directly conflicting with the Realism Bible's non-negotiable PBR-material rule. The existing in-repo Vegetation/Terrain `ADOPT` system already serves this need. |

## 8. REFERENCE candidates remaining (named, not actionable this lot, reason stated)

| Candidate | Why still `REFERENCE` |
|---|---|
| Quaternius — Ultimate Modular Men Pack | Licence confirmed `CC0-1.0` (primary source). Technical/visual evaluation blocked: Google Drive's shared-folder download quota was exceeded, reproduced via two independent access methods (raw HTTP and full browser session) on two different files in two different Quaternius-hosted folders. Not a licence or artistic problem — a reproducible access obstacle. A future lot may retry (Google's own message suggests up to 24 hours), or Quaternius may be re-evaluated via an alternative distribution channel if one exists. |
| Quaternius — Background Posed Humans Pack | Same Drive-hosting, same quota obstacle confirmed independently on this pack's own folder. Also lacks animation (posed only), a lower-priority candidate than the Men Pack even if access were restored. |
| Kenney — Animated Characters Protagonists / Survivors | Licence trivially confirmable (same Kenney `CC0-1.0` pattern), but not deep-evaluated this lot — both are thematically narrow (skater/cyborg/criminal; zombie/survivor) rather than generic crowd-appropriate, so `Mini Characters` was prioritized instead within this lot's 6-candidate budget. |
| Mountain Kit's own rock/cliff-dressing external source | No specific candidate was found and evaluated this lot beyond `snow_02` (which serves the snow-line specifically, not general rock/cliff PBR dressing). Recommended: a future lot should evaluate one additional Poly Haven rock/cliff material set following the exact precedent `PRE20-C01` establishes. |

## 9. Temporary download footprint (quarantine, untracked, confirmed absent from the diff)

```text
.tmp/drift-pre-20/
  kenney-mini-characters/          16 MB (zip + extracted + preview)
  kenney-city-kit-commercial/      16 MB
  kenney-car-kit/                  20 MB
  kenney-nature-kit/               47 MB
  polyhaven-snow_02/               1.5 MB
  quaternius-ultimate-modular-men/ ~360 KB (preview image only; pack itself inaccessible)
  quaternius-background-posed-humans/ ~2 KB (failed download attempt only)
                                    ------
                                    ~101 MB total, well under the 250 MB cap
```

`.gitignore` was updated to add `/.tmp/` (this lot's own required change, per its own instruction to ensure the temporary directory "is ignored and absent from the final diff") — confirmed via `git check-ignore -v .tmp/drift-pre-20/test`.

## 10. Recommended promoted set (maximum six, this lot proposes five)

| Registry ID | Candidate | Domain group | Status | Proposed `PRE-30` use |
|---|---|---|---|---|
| `PRE20-C01` | Poly Haven `snow_02` | C | `ADOPT` | Integrate immediately alongside the existing 5 sets — Older Shadows snow-line material, zero pilot risk. |
| `PRE20-A01` | Kenney Mini Characters | A | `PILOT` | `PRE-30`'s Group A pilot: test the 7-joint skeleton against the Shared Kit Architecture's own humanoid-skeleton convention; test silhouette-distance visual read against an actual masterframe render; do not use at foreground distance without a style pass. |
| `PRE20-A02` | Kenney City Kit (Commercial) | A | `PILOT` | `PRE-30`'s Group A pilot: background/distant massing only (skyline silhouettes); confirm draw-call cost with the shared 512×512 colormap at realistic instance counts. |
| `PRE20-B01` | Kenney Car Kit | B | `PILOT` | `PRE-30`'s Group B pilot: background traffic only; wire the 4 separate wheel nodes to a simple procedural Y-rotation. |
| `PRE20-C02` | three.js `Water.js`/`Sky.js` | C | `PILOT` | `PRE-30`'s Group C pilot: prototype the Birth Yard canal upgrade first (lower risk than the ocean); defer Étééaooété's full wave/erasure mechanic to its own future Identity Contract. |

**Group B's second slot is deliberately not filled by a new external candidate** — the existing in-repo Vegetation/Terrain `ADOPT` system is confirmed sufficient (§6.4), consistent with this lot's own "prefer fewer, stronger, more reusable candidates" instruction over "six assets at all costs."

## 11. Unresolved risks

1. Quaternius's entire catalogue remains inaccessible from this environment while Google's Drive-hosted download quota is in effect (unknown reset time, up to 24h per Google's own message) — affects any future lot that wants to re-evaluate Quaternius specifically.
2. Kenney's flat-shaded/unlit visual register is a real, unresolved stylistic gap against the accepted masterframes' photoreal register for any candidate promoted here — every `PILOT` recommendation above is scoped to background/distant use specifically to manage this risk, not to hide it.
3. The Mountain Kit's own rock/cliff-dressing need (distinct from Older Shadows' snow-line, now served by `snow_02`) remains open — no candidate was found and evaluated for it this lot.
4. Kenney Mini Characters' 7-joint skeleton has not been tested against an actual animation-retargeting or IK workflow in this repository — its close match to the Shared Kit Architecture's own stated convention is a structural observation, not yet a proven integration.

## 12. Owner decision table

| Question | This lot's finding | Requires owner authority? |
|---|---|---|
| Accept the 5-candidate promoted set (§10) for `PRE-30` piloting? | Recommended | **Yes** |
| Accept Mixamo's rejection for repository-bundled use (Adobe terms §3.6)? | Recommended, primary-source-supported | Yes, if the owner wants a different Mixamo interpretation |
| Accept Kenney Nature Kit's rejection (unlit/untextured materials vs. Realism Bible)? | Recommended | Yes, if the owner wants to relax the Realism Bible's PBR rule for background-only nature dressing |
| Retroactively record `CC0-1.0` licence evidence for the 5 pre-existing Poly Haven textures (no artistic change, factual gap-closing only)? | Recommended, non-controversial | No — factual correction only, applied in §6.5/§13 |
| Retry Quaternius after the Google Drive quota resets, in a future lot? | Recommended as a named follow-up, not performed this lot | No — routine follow-up |

## 13. Explicit gate result

**`DRIFT-IV-PRE-20` GATE: `OWNER_REVIEW_REQUIRED`.**

Checked against this lot's own 15-point completion gate:
1. ✅ All 5 existing matrix `REFERENCE` categories considered (Mixamo/Quaternius-style rig, Kenney city packs, CC0 vehicle packs, additional Poly Haven sets, Kenney/Quaternius prop packs).
2. ✅ No promoted candidate lacks exact licence/provenance evidence.
3. ✅ No promoted candidate lacks a deterministic source hash (Poly Haven's 3 file hashes; the 3 promoted Kenney archives' hashes; three.js cites its own installed-package version instead of a hash, since it is not a downloaded archive).
4. ✅ No promoted candidate lacks real technical inspection (§6, all 5 promoted rows).
5. ✅ No promoted candidate lacks visual-fit evaluation (§6, all 5 promoted rows; three.js has no visual asset of its own to evaluate — it is a mechanism, not imagery).
6. ✅ Group A has a credible verified pilot path (§5).
7. ✅ Group B has a credible verified pilot path (§5).
8. ✅ Group C has a credible verified pilot path (§5).
9. ✅ `PRE-30` has a concrete proposed candidate set across all three groups (§10).
10. ✅ Raw third-party binaries are absent from the tracked diff (§9; confirmed again in the validation run below).
11. ✅ Temporary caches are untracked and absent from the diff (`.gitignore` updated, confirmed via `git check-ignore`).
12. ✅ No accepted artistic authority was rewritten to suit an asset — no Masterframe Brief, Era Contract, or Atlas entry was edited by this lot.
13. ✅ No unsupported licence conclusion is presented as fact — every `ADOPT`/`PILOT`/`REJECT` cites its exact primary source and retrieval date; Mixamo's rejection quotes the governing clause verbatim rather than asserting a conclusion.
14. ✅ The Markdown and JSON registries agree (see `licensed-asset-provenance-registry.json`, generated from the same underlying findings).
15. ✅ `DRIFT-IV-PRE-30` has not started.

**`DRIFT-IV-PRE-20 = OWNER_REVIEW_REQUIRED`. `DRIFT-IV-PRE-30` remains `BLOCKED_BY_DEPENDENCY`.**

No commit, push, or PR performed. `DRIFT-IV-PRE-30` not started.

---

## 14. Owner decision — final promoted set accepted, Quaternius evidence corrected (this pass — supersedes §13's provisional gate, does not delete §0–13)

**Everything in §0–13 above is preserved unchanged as the research record.** The owner reviewed the recommended promoted set and issued an explicit final acceptance, with bounded guardrails per candidate, plus required a precision correction to the Quaternius account. This section records both. **No new research was performed, no seventh candidate was added, and no additional broad search was run** — this section only reconciles and clarifies findings already gathered in §0–13.

### 14.1 Quaternius evidence — corrected, precise account (supersedes §11 point 1's imprecise phrasing)

**§11 point 1 above states:** *"Quaternius's entire catalogue remains inaccessible from this environment while Google's Drive-hosted download quota is in effect."* **This is imprecise and is corrected here.** Quaternius's own official website was never inaccessible — only one specific distribution channel, for two specific packs, was. The precise account:

- **Exact file successfully downloaded:** `https://quaternius.com/assets/images/fullres/modularcharacters.jpg` — the pack's own official marketing preview image, **self-hosted on quaternius.com itself, not Google Drive.** 360,869 bytes. SHA-256 `CCF065362F4035D5A62A7A18DCB092365670D1E0877E55C1DE0B5CC184652E4B`. Decoded successfully via Pillow: **1920×1080, RGB, JPEG.**
- **Official source confirmed fully accessible throughout:** every quaternius.com page visited this lot loaded normally and was read directly — the pack's own asset page (licence badge linking to the canonical CC0 deed, pack description, version/date text), the download modal's own JavaScript (`onclick` handlers, read directly from the DOM), and the preview image above. **No access problem exists anywhere on quaternius.com itself.**
- **Exact endpoint that was inaccessible:** Google Drive's own anonymous shared-file download endpoint, `https://drive.google.com/uc?export=download&id=<fileId>`, tested against **4 distinct file IDs across 2 distinct Quaternius-owned Drive folders**:
  - Ultimate Modular Men Pack folder (`1USAAquX2JJWuA2m6zol0KUkFe3UkZ8zX`): `License.txt` (id `1TTvylHa1CsiJuHFWWiv6PFGhLM-aAH5z`), `Worker.gltf` (id `14d8n7IDnnlnGt_uiATnNg3uvi_4dyd9V`), `Adventurer.gltf` (id `1fzSq1Rr037f7QkfXPWEAzmbLMNx-FpPA`) — all three inside the folder's own `Individual Characters/glTF` subfolder, itself confirmed to list 11 real character files (2.8–3.6 MB each) via the Drive folder's own directory listing (visible without authentication).
  - Background Posed Humans Pack folder (`18dWyZlA53euzsc1WobITqFYLcT5sFULz`): `License.txt` (id `1K6M5kb7ugqrPROrSx6O6dUBJA366xq-j`).
  - **2 independent access methods** were used for the first file: a bare PowerShell `Invoke-WebRequest`, and a full authenticated-session browser navigation to the identical URL (which itself redirected to `drive.usercontent.google.com` and still failed identically).
- **Exact failure mechanism, precisely characterized:** every one of these 4 attempts returned an **HTTP 200 OK** response (no exception thrown by either client, no redirect loop, **no login/authentication prompt shown at any point**) whose response **body** was Google's own static HTML page titled *"Google Drive - Quota exceeded"* / *"Le quota autorisé a été atteint"*: *"Sorry, you can't view or download this file at this time. Too many users have viewed or downloaded this file recently... it may take up to 24 hours."* This is an **application-level rate-limit on Google's own anonymous shared-file download endpoint** — not an authentication requirement, not a transport-level (DNS/TLS/timeout) failure, and not a permissions/sharing-settings problem (the folders themselves list their contents without authentication, confirming the share itself is valid). The 4 response bodies are near-identical (each exactly 2,009 bytes, identical error text) but not byte-for-byte identical — each embeds a different per-response CSP `nonce` attribute, confirming these are 4 separate, independently-generated server responses to 4 separate requests, not one cached/reused error.
- **Exact technical inspection actually performed on Quaternius material:** a Pillow decode of the one successfully-downloaded 2D preview JPG (dimensions/mode/format only, recorded above). **Zero glTF/GLB/FBX bytes were ever received for any Quaternius file** — no mesh, material, node, animation, skin, or accessor data exists to report, and none is claimed anywhere in this registry.
- **Why this evidence is insufficient for `ADOPT` or `PILOT`:** this lot's own promotion rule requires "real download; deterministic hash; real technical inspection" **of the candidate asset itself**. A marketing preview image is not the candidate asset — it was useful only for the visual-style comparison already made in §6/§9, never as a substitute for inspecting the actual rigged-character glTF files. **Per §15's pre-commit correction, this preview image was retrieved and hashed but is not tracked in the repository** — the visual-style comparison it informed was made and recorded before that decision; no repository file backs it today. No claim of mesh count, joint count, animation-clip count, or triangle count is or has ever been made for Quaternius in this registry.
- **Why the remaining Quaternius candidates stay `REFERENCE`, precisely scoped:** the blocked mechanism (Google Drive's anonymous-download quota) was confirmed identically on **2 of Quaternius's packs**, independently. Every Quaternius product page inspected this lot uses the same "Download" → Google Drive folder pattern, so this finding is *plausibly* general to the rest of the catalogue — but **this lot did not test any pack beyond these 2**, per its own bounded-scope rule (no broad/mass search). The honest, precise claim is: *"the 2 packs actually tested both failed via the identical Google Drive quota mechanism"* — not *"Quaternius is confirmed inaccessible,"* and not *"Quaternius is confirmed accessible for untested packs."* Both `PRE20-A03` (Ultimate Modular Men Pack) and `PRE20-A05` (Background Posed Humans Pack) remain `REFERENCE` for this exact, now-precise reason.

### 14.2 Final owner verdicts and bounded roles (verbatim, this pass)

| Registry ID | Candidate | Owner verdict | Registry status | Bounded role (guardrail) |
|---|---|---|---|---|
| `PRE20-C01` | Poly Haven `snow_02` | **ACCEPT** | `ADOPT` | `ADOPT` means licence-verified and approved as an available material asset — **it does not mean the texture has already been integrated into the Drift runtime.** Runtime integration remains `PRE-30` work. |
| `PRE20-A01` | Kenney Mini Characters | **ACCEPT** | `PILOT` | Authorized for skeleton, clip, retargeting, crowd-instancing and animation-architecture experiments. **Not accepted as the final visual appearance of foreground Drift humans.** No accepted masterframe or realism doctrine may be weakened to match its low-poly visual style. |
| `PRE20-A02` | Kenney City Kit (Commercial) | **ACCEPT** | `PILOT` | Authorized for greybox, urban massing, background silhouettes and modular-assembly evaluation. **Not automatically authorized as final foreground architecture.** Generic asset-store recognizability must be removed or transformed before any final artistic adoption. |
| `PRE20-B01` | Kenney Car Kit | **ACCEPT** | `PILOT` | Authorized for traffic hierarchy, wheel-node mechanics, background vehicles and secondary-motion evaluation. **Never replaces or redefines the canonical sand safari 4x4.** Not accepted as final foreground vehicle art. |
| `PRE20-C02` | three.js `Water.js` / `Sky.js` | **ACCEPT** | `PILOT` | Technical seed only. **Does not satisfy Drift's final ocean, wave, splash, weather or sky direction.** Any copied or substantially adapted MIT source must preserve the applicable three.js copyright and permission notice (§14.3 below records the exact installed version and module paths). |

**Accepted rejections:**

| Candidate | Owner verdict | Exact scope of the rejection |
|---|---|---|
| Mixamo / Adobe | **ACCEPT REJECTION** | Rejected **specifically** for repository-bundled use where raw or converted character/animation content would be redistributed through the public GitHub repo (Adobe General Terms of Use §3.6, `licences/mixamo-adobe-terms-note.md`). **Not a claim that Mixamo is forbidden for every possible end-use project** — the rejection is scoped to MISWAY's own public-repository asset workflow specifically. |
| Kenney Nature Kit | **ACCEPT REJECTION** | Rejected as a **final visual/PBR nature source for Drift** — its unlit, textureless, low-poly register conflicts with the accepted masterframes and `DRIFT_3D_REALISM_BIBLE.md`. **Must not silently return during `PRE-30` as final environment art**; the existing in-repo Vegetation/Terrain `ADOPT` system remains this need's actual answer. |

**Retroactive licence closure, accepted:** the Poly Haven licence/provenance record for the 5 pre-existing `public/textures/` sets (§6.5, `licences/polyhaven-terms-note.md`) is accepted as a **provenance/governance closure only** — it makes no new artistic decision and does not claim `DRIFT-IV-PRE-20` created those existing, already-adopted assets.

### 14.3 MIT notice obligation, recorded exactly (`PRE20-C02`)

- **Installed package:** `three@0.185.0` (exact, matching `package.json`'s `^0.185.0`).
- **Exact upstream module paths:** `node_modules/three/examples/jsm/objects/Water.js`, `node_modules/three/examples/jsm/objects/Sky.js` (and the sibling `WaterMesh.js`/`SkyMesh.js`/`Water2.js`/`Water2Mesh.js`, not selected — see §6.6).
- **Licence:** MIT, full text preserved at `licences/threejs-LICENSE.txt` (*"Copyright © 2010-2026 three.js authors"*).
- **Obligation:** any code that copies or substantially adapts these modules' source (as opposed to importing them unmodified from the installed package) must preserve the applicable three.js copyright and permission notice in the adapted file, per the standard MIT licence condition. Since `Water.js`/`Sky.js` are currently proposed to be *imported*, not copied/forked, from the installed dependency, no additional notice file is required in this repository today — this obligation is recorded now so it is not missed if a future `PRE-30`/Build lot forks or substantially rewrites either module.

### 14.4 `PRE-30` authorization boundaries (verbatim, this pass)

**`PRE-30` may test:**
- Poly Haven `snow_02` material integration.
- Kenney Mini Characters' skeleton and animation architecture.
- Kenney City Kit's modular urban assembly and background massing.
- Kenney Car Kit's traffic and wheel-node mechanics.
- `Water.js` / `Sky.js` as technical mechanisms.
- The existing in-repository `ADOPT`/`PILOT` procedural systems (Terrain, Vegetation, Lighting/Material, `Reflector.js`, etc.).

**`PRE-30` must not assume:**
- Kenney visual styles are accepted final art.
- The canonical vehicle may be replaced.
- `Water.js` alone satisfies the Étééaooété ocean requirement.
- `Sky.js` alone satisfies the accepted weather/light direction.
- Quaternius assets are available or approved.
- Any unresolved `REFERENCE` candidate (Quaternius's 2 tested packs, the 2 not-deep-evaluated Kenney character packs, the Mountain Kit rock/cliff dressing gap, the Machine/Prop pack gap) may be downloaded or adopted without its own dedicated evaluation.
- Any shared kit (per `docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`) has already been built — every kit section's own `DRIFT-IV-PRE-20` note states evaluation only, never construction.

### 14.5 Explicit gate result (final, this pass)

**`DRIFT-IV-PRE-20` GATE: `DONE_PENDING_MERGE`.**

- ✅ Final owner verdicts recorded for all 5 promoted candidates, each with its own bounded `PRE-30` role (§14.2).
- ✅ Both rejections explicitly accepted with precisely scoped reasoning (§14.2).
- ✅ Retroactive Poly Haven licence closure accepted as governance-only, no artistic claim (§14.2).
- ✅ Quaternius evidence corrected: exact file/hash/mechanism recorded, overgeneralized "entire catalogue inaccessible" phrasing superseded by a precise, endpoint-scoped account (§14.1).
- ✅ MIT notice obligation for `Water.js`/`Sky.js` recorded exactly (§14.3).
- ✅ `PRE-30` authorization boundaries recorded verbatim (§14.4).
- ✅ No seventh candidate added; no new broad search performed; bounded research scope not exceeded.
- **`DRIFT-IV-PRE-20 = DONE_PENDING_MERGE`. `DRIFT-IV-PRE-30 = READY_AFTER_MERGE` (not started).**

No commit, push, or PR performed. `DRIFT-IV-PRE-30` not started.

---

## 15. Pre-commit evidence corrections (this pass — applied before publication of the already-created local commit; supersedes two stale references in §0–14, does not delete or reopen any owner decision)

**Everything in §0–14 above is preserved unchanged as the research and decision record.** This section corrects two evidentiary details discovered while preparing this lot's local commit for publication. **No owner decision, candidate status, `ADOPT`/`PILOT`/`REJECT`/`REFERENCE` verdict, or count in §14.2 was changed.**

### 15.1 Kenney licence files — verbatim-byte whitespace exception recorded

The four downloaded Kenney `License.txt` files (`licences/kenney-mini-characters-License.txt`, `licences/kenney-city-kit-commercial-License.txt`, `licences/kenney-car-kit-License.txt`, `licences/kenney-nature-kit-License.txt`) contain their original upstream CRLF line endings and trailing whitespace, exactly as downloaded. A repository-root `.gitattributes` file now records:

```
docs/evidence/DRIFT-IV-PRE-20/licences/kenney-*-License.txt whitespace=-trailing-space,cr-at-eol
```

- **Scope:** this exception applies **only** to these four exact verbatim licence-evidence files, matched by that glob. No other path in the repository is affected.
- **No licence file was rewritten or normalized.** The exception changes only how `git diff --check` evaluates these four paths — it does not touch their bytes.
- **Their previously recorded source hashes remain valid.** Current SHA-256 of the committed copies, verified this pass:

  | File | SHA-256 |
  |---|---|
  | `kenney-mini-characters-License.txt` | `28358ae5accc85b572eb42507956afc8beae05acb4648bb9026a5714d421b785` |
  | `kenney-city-kit-commercial-License.txt` | `c38cee408d022e57e44e49f1cd655c2fe0dc881a07b881276b795215cdc0de69` |
  | `kenney-car-kit-License.txt` | `c33b7f6453d134deae7b1b8493717d9ccfa754c25ab97f6de89b88f8fda19b00` |
  | `kenney-nature-kit-License.txt` | `cb96b75e3560ac78d7a53ce6f083f4cdb5c53faea6141b62d63458dcfe1e4b9d` |

- **Normal whitespace validation remains enabled everywhere else** in the repository — this is a narrowly-scoped exception for verbatim third-party evidence, not a project-wide change.

### 15.2 Quaternius website preview — removed from the tracked repository, retained as external evidence only

The file previously tracked at `docs/evidence/DRIFT-IV-PRE-20/candidate-previews/quaternius-ultimate-modular-men-preview.jpg` has been **removed from the repository; that path no longer exists in the tracked tree.** It was successfully retrieved and hashed (§14.1), but that evidence does not independently establish redistribution rights for this standalone promotional website image — distinct from the Kenney and Poly Haven files, which carry their own explicit licence evidence justifying tracking.

- **External evidence retained (not a repository file):**
  - Official source URL: `https://quaternius.com/assets/images/fullres/modularcharacters.jpg`
  - Retrieval: 2026-08-03, HTTP 200 OK (successful retrieval)
  - Size: 360,869 bytes
  - Dimensions: 1920×1080, RGB, JPEG
  - SHA-256: `CCF065362F4035D5A62A7A18DCB092365670D1E0877E55C1DE0B5CC184652E4B`
- **`tracked_repository_path: null`**
- **`tracking_decision: NOT_TRACKED`**
- **`reason`:** *"standalone promotional-preview redistribution was not independently established and the image is unnecessary for reproducible licence or import evidence."*
- **Does not affect the Quaternius model-pack licence claim:** the official Quaternius model packs remain described as `CC0-1.0` per the packs' own official page licence badge (`licences/quaternius-terms-note.md`), independent of this preview image. `PRE20-A03` and `PRE20-A05` remain `REFERENCE` for the pre-existing reason recorded in §14.1 — no downloadable 3D asset bytes were ever obtained or technically inspected — not because of any licence concern with this preview.
- **Tracked preview count corrected: 5, not 6.** Remaining tracked previews: `kenney-mini-characters-preview.png`, `kenney-city-kit-commercial-preview.png`, `kenney-car-kit-preview.png`, `kenney-nature-kit-preview.png`, `polyhaven-snow_02-diff-preview.jpg`.
- `docs/evidence/DRIFT-IV-PRE-20/licences/quaternius-terms-note.md` corrected to match (no longer cites a repository path for this image).
- `docs/DECISIONS_LOG.md`'s `[2026-08-03] DRIFT-IV-PRE-20` entry stating "6 small preview images" is left unedited as the historical record; a new dated entry appended the same day records this correction.

### 15.3 Counts and gate status, unchanged

Longlist = 11, deep evaluations = 6, promoted = 5 (1 `ADOPT`, 4 `PILOT`), accepted rejections = 2 — **all unchanged.** `DRIFT-IV-PRE-20 = DONE_PENDING_MERGE`. `DRIFT-IV-PRE-30 = READY_AFTER_MERGE` (not started).

No commit, push, or PR performed by this pass.
