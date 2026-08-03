# DRIFT-IV-PRE-40 — Macro-world readiness dossier

**This dossier is provisional, this pass** — exactly like `DRIFT-IV-PRE-30`'s own §11 ("Gate status (provisional, this pass...)"), it records the honest readiness picture obtainable *without* a live render, and defers final GO/NO_GO closure to the pass that follows once live-render verification actually occurs (either this environment's Browser pane composits frames, a Claude-in-Chrome connection succeeds, or the owner performs their own local live review — the same three resolution paths `DRIFT-IV-PRE-30` itself listed, and the one PRE-30 itself was ultimately resolved by, §12 of its own evidence file).

**A GO verdict below does not mean final art exists — it means the technical/spatial foundation for that world is sound enough, on the evidence gathered, to resume track-specific production on top of it. A GO_WITH_GAPS names its gap explicitly. No NO_GO appears without a concrete, named blocker.**

All owner verdicts in this dossier are the literal string `PENDING` — no owner has reviewed anything in this pass.

---

## Per-macro-world records

### Entry

- **Masterframe reference:** Entry Era Contract; Global Art Direction §2 (realism ratio), §12 principle 1 (transition register).
- **Spatial objective:** single unbranching mineral corridor, no side passages, near-total darkness except the λ-shaped exit glow.
- **Implemented geometry:** authored primitive corridor (4.6m × 4m × 20m), raw PBR stone, sculpted λ-shape ceiling glow, unmanned administrative relay. Heightfield reused for exterior grounding only (`getDrift3DGroundY`).
- **Route/reset behavior:** spawn point (`spawnOffset` `{x:-8.1, z:-5.8}` from local origin) confirmed by config/unit test to project to `routeProgress: 0` exactly; reset restores this exact point.
- **Transition relationships:** `entry-to-birth-yard` only (17.2m).
- **Shared kits used:** Terrain/Road (heightfield grounding only), Lighting/Material (rock PBR, emissive glow) — no Human/Crowd, Vehicle/Traffic, Vegetation, or Water/Weather kit used, correctly, per its own `SPARSE` density on every axis.
- **Assets used:** none tracked (procedural geometry + existing `rock_boulder_dry` material already in `drift3dTextureFactory.ts`).
- **Human-scale evidence:** corridor width/height (4.6m/4m) and the administrative relay's own real-world proportions (0.4×0.5×0.3m housing) are dimensioned, not estimated.
- **Quality Tier behavior:** density `SPARSE` at every tier by design — component explicitly discards `qualityTier` (`void qualityTier;`), nothing to scale, confirmed by code inspection.
- **Fallback behavior:** no-WebGL fallback card records "a single unbranching mineral corridor, near-total darkness, one λ-shaped exit glow" — truthful, no promise of driving.
- **Performance:** not measured this session (§ live-render limitation).
- **Browser evidence:** structural only — see global dossier §"What was verified without a live render."
- **Realism gap:** raw primitive geometry, no track-specific bureaucracy dramaturgy (deliberately out of scope, per this lot's own brief).
- **Missing assets:** none identified.
- **Missing behaviors:** none identified beyond the deliberately-excluded track dramaturgy.
- **Excluded track-specific work:** the "it authorizes" bureaucracy-register handoff into Birth Yard.
- **Blocking risks:** none identified beyond the shared live-render verification gap (see global dossier).
- **Non-blocking risks:** none beyond the deliberately-excluded track dramaturgy above.
- **Recommended readiness status:** `GO_WITH_GAPS` — gap is exactly the shared live-render verification gap.
- **Owner verdict:** `PENDING`.

### Birth Yard

- **Masterframe reference:** Birth Yard Era Contract; Global Art Direction §4 density table (`HIGH`/`VERY_HIGH`/`VERY_HIGH`/`MEDIUM`).
- **Spatial objective:** intense density, credible scale, narrow/open contrast, vertical massing, distant crowd/traffic, driveable route, continuity from Entry.
- **Implemented geometry:** real `Reflector` canal, `InstancedMesh` towers (2 tracked City Kit forms, real height variation 1.4–4.0×), `InstancedMesh` capsule crowd, background traffic (5-part `InstancedMesh` sedan reusing PRE-30's own path/wheel math), lifting bridge with held queue.
- **Route/reset behavior:** spawn at local origin exactly (`spawnOffset {0,0}`); continuity confirmed structurally — `entry-to-birth-yard` transition's `toWorld` matches this world's own id (config-validated, zero issues).
- **Transition relationships:** `entry-to-birth-yard` (in, 17.2m), `birth-yard-to-older-shadows` (out, 85.1m).
- **Shared kits used:** Urban (City Kit towers), Human/Crowd (silhouette crowd), Vehicle/Traffic (background sedan), Water (Reflector canal), Lighting/Material.
- **Assets used:** `PRE20-A02` (`building-a.glb`/`building-b.glb`), `PRE20-B01` (`sedan.glb`) — both PRE-30 tracked assets, reused unchanged, zero new bytes added.
- **Human-scale evidence:** tower vertical-massing scale range (1.4–4.0×) and bridge/queue dimensions (6×0.3×3m deck, 0.18–0.6m vehicles) are real, dimensioned proportions.
- **Quality Tier behavior:** towers 8/12/16, crowd 16/28/40, traffic 1/2/4 (low/medium/high) — monotonic, unit-tested.
- **Fallback behavior:** no-WebGL card: "Dense canal-side port city — towers, a lifting bridge, distant crowd and traffic."
- **Performance:** not measured this session.
- **Browser evidence:** structural only.
- **Realism gap:** Kenney low-poly City Kit/Car Kit geometry — the same, already-recorded `PRE-30` §12.4 artistic reservation applies identically here (not re-litigated, only inherited).
- **Missing assets:** none identified.
- **Missing behaviors:** none identified beyond track dramaturgy.
- **Excluded track-specific work:** the "it organizes" bureaucracy-register handoff; `EUX GAINENT` intentionally not modified or referenced.
- **Blocking risks:** none beyond the shared live-render verification gap.
- **Non-blocking risks:** inherited Kenney-geometry realism gap (already accepted as non-blocking by the owner for PRE-30's own identical assets).
- **Recommended readiness status:** `GO_WITH_GAPS`.
- **Owner verdict:** `PENDING`.

### Older Shadows

- **Masterframe reference:** Older Shadows Era Contract; masterframe §3 ("the mountain itself is the architecture").
- **Spatial objective:** open distance after compression, elevation change, mountain silhouette, credible grades, snow/cold material, no canonical-vehicle replacement.
- **Implemented geometry:** production heightfield (already hand-authored peaks/ridges at this era's real coordinates) plus one refuge structure, a mixed-generation cairn trail (real terrain-sampled height), a second eroding path, footprint traces, one piece of worn equipment, `snow_02` PBR material patch.
- **Route/reset behavior:** structurally validated — `birth-yard-to-older-shadows` in, `older-shadows-to-vegetative-field` out, both config-checked with zero issues.
- **Transition relationships:** as above; elevation/grade change is inherited directly from the real, already-authored heightfield, not a new invention.
- **Shared kits used:** Terrain/Road (real heightfield), Vegetation (none new — heightfield-only), Lighting/Material (snow PBR).
- **Assets used:** `PRE20-C01` (`snow_02_diff_1k.jpg`/`snow_02_nor_gl_1k.jpg`/`snow_02_rough_1k.jpg`) — PRE-30 tracked, reused unchanged.
- **Human-scale evidence:** refuge structure (1.6×1.8×1.4m) and worn-equipment prop (0.5×0.12×0.18m) are real, dimensioned proportions relative to the vehicle/terrain scale already established in production.
- **Quality Tier behavior:** cairns 7/10/14 (low/medium/high), monotonic, unit-tested.
- **Fallback behavior:** no-WebGL card: "An open mountain traverse with a mixed-generation cairn trail and cold-altitude material."
- **Performance:** not measured this session.
- **Browser evidence:** structural only.
- **Realism gap:** primitive-geometry refuge/equipment props (deliberately low-fidelity per this lot's own greybox-quality definition); no generic safari decoration was added, confirmed by code inspection (no Kenney Nature Kit import anywhere in this file).
- **Missing assets:** none identified.
- **Missing behaviors:** none identified.
- **Excluded track-specific work:** the "it marks/flags" bureaucracy-register handoff.
- **Blocking risks:** none beyond the shared live-render verification gap.
- **Non-blocking risks:** none identified.
- **Recommended readiness status:** `GO_WITH_GAPS`.
- **Owner verdict:** `PENDING`.

### Vegetative Field

- **Masterframe reference:** Vegetative Field Era Contract; masterframe's own "identical-lotissement logic" and single-desynchronization-beat requirement.
- **Spatial objective:** distinct spatial language from Older Shadows, vegetation as controlled/repetitive structure, human-scale landmarks, no generic "green biome."
- **Implemented geometry:** repetitive housing grid (2 near-identical forms, trivial per-instance variation only), one resident with a real `AnimationMixer` walk/idle cycle carrying one deliberate 0.3s desynchronization beat per 7-second cycle.
- **Route/reset behavior:** structurally validated — `older-shadows-to-vegetative-field` in, `vegetative-field-to-new-signal` out, zero config issues.
- **Transition relationships:** as above; the outgoing transition is the one Era-Contract-flagged "sharp, perceptible break rather than a fade."
- **Shared kits used:** Urban (repetitive housing, primitive geometry, not a Kenney kit), Human/Crowd + Animation (one resident, `character-male-a.glb`, `PRE20-A01`, reused unchanged).
- **Assets used:** `PRE20-A01` (`character-male-a.glb`) — PRE-30 tracked, reused unchanged.
- **Human-scale evidence:** house massing (3.6×2.2×3.2m box + cone roof) and grid spacing (6.5m) are real, dimensioned suburban-lot proportions.
- **Quality Tier behavior:** houses 6/9/12 (low/medium/high), monotonic, unit-tested.
- **Fallback behavior:** no-WebGL card: "A repetitive suburban housing grid with one resident's almost-exact daily routine."
- **Performance:** not measured this session.
- **Browser evidence:** structural only.
- **Realism gap:** primitive-geometry housing (deliberately low-fidelity per the greybox definition); the resident reuses the same Kenney-sourced `character-male-a.glb` already reserved under PRE-30 §12.4 (not final human art).
- **Missing assets:** none identified.
- **Missing behaviors:** the "up to 55% after contamination" realism-ratio state is explicitly *not modeled* in this greybox (recorded in config's own `realismRatio` field) — a named, deliberate scope boundary, not an oversight.
- **Excluded track-specific work:** the "it anesthetizes" bureaucracy-register handoff; no MORNE Identity Contract/Cue Map/final-scene content.
- **Blocking risks:** none beyond the shared live-render verification gap.
- **Non-blocking risks:** contamination-state realism ratio not modeled (by design, out of this lot's own scope).
- **Recommended readiness status:** `GO_WITH_GAPS`.
- **Owner verdict:** `PENDING`.

### New Signal

- **Masterframe reference:** New Signal Era Contract's own binding guardrail, ratified `GOV-40`: "One real geography must dominate every New Signal frame."
- **Spatial objective:** ONE dominant real geography (coastal overlook); every other world/element only as reflection/light/signal/silhouette/weather/trace/memory.
- **Implemented geometry:** headland-road guardrail marker (the one dominant geography), one small warm distant point (single emissive sphere + point light — explicitly not a second geography), `Water`/`Sky` (`PRE20-C02`) for the final beach — small, distant, "not yet reached."
- **Route/reset behavior:** structurally validated — `vegetative-field-to-new-signal` in, endpoint of the route (`routeProgress: 1` exactly at this world's own origin, confirmed live and by unit test); this is the route's stable turnaround/endpoint, per this lot's own requirement.
- **Transition relationships:** `vegetative-field-to-new-signal` only (in, 69.0m) — no outgoing transition, correctly, as the route's own final world.
- **Shared kits used:** Water (`Water.js`), Weather/Lighting (`Sky.js`, atmosphere-driven sun direction), Secondary-Life (the single distant warm point).
- **Assets used:** none tracked — `Water.js`/`Sky.js` ship inside the already-installed `three` package; the water-normal texture is a small procedural `CanvasTexture`, duplicated locally from PRE-30's own established pattern rather than exported from its already-accepted pilot file.
- **Human-scale evidence:** ocean plane (22×16m) sized and positioned deliberately small relative to the headland frame, per the masterframe's own "small, not yet reached" instruction — a scale decision, not an arbitrary one.
- **Quality Tier behavior:** reflection texture resolution scales via `scaleDrift3DQualityDimension` (512 base, floored, minimum 128) — the one macro-world whose Quality Tier behavior is a render-cost dimension rather than a population count, correctly, since it has no repeated-instance population.
- **Fallback behavior:** no-WebGL card: "One dominant coastal overlook geography, with the final beach visible far below, not yet reached."
- **Performance:** not measured this session.
- **Browser evidence:** structural only. `dominantGeographyGuardrail: true` confirmed set on this world and this world only, both by direct config inspection and by the canonical validator (`getDrift3DCanonicalMacroWorldConfigIssues()` returns `[]`).
- **Realism gap:** `Water.js`'s known upstream disposal limitation (no public accessor for its internal reflection render target — the same limitation already documented in PRE-30 §5) applies identically here; no claim that final Étééaooété/erasure/weather/ocean art is complete.
- **Missing assets:** none identified.
- **Missing behaviors:** none identified within this lot's own explicit scope boundary.
- **Excluded track-specific work:** literal landmark accumulation, checklist panorama, museum-of-previous-worlds collage, theme-park portal lineup, generic cyberpunk city, giant symbolic sun, floating lambda — none of these appear anywhere in this file (confirmed by direct source inspection: exactly one geography mesh group, one small distant point, one small distant water/sky pair).
- **Blocking risks:** none beyond the shared live-render verification gap — this world in particular is the one whose spatial-credibility judgment ("does it read as one dominant geography, not a collage") most depends on an actual visual observation, so the live-render gap is named here with particular emphasis.
- **Non-blocking risks:** inherited `Water.js` disposal limitation (architectural, already documented, not fixable without forking three.js's own addon).
- **Recommended readiness status:** `GO_WITH_GAPS`.
- **Owner verdict:** `PENDING`.

---

## Global dossier

- **Continuity proven:** structurally — the 4-transition graph is connected end-to-end in canonical order (unit-tested, zero issues), one continuous scene (all 5 worlds + terrain + vehicle mounted simultaneously, confirmed by reading `DriftMacroWorldScene.tsx`'s own JSX tree), no streaming boundary. **Not** proven by an actual observed drive-through this session (§ live-render limitation).
- **All-5-driveable:** structurally plausible (shared vehicle-physics/terrain/camera boundary identical to production's own proven `/drift`), **not confirmed by an actual observed drive** this session.
- **All-4-transitions-proven:** structurally defined and validated (start/end world, travel length, density/atmosphere/material progression, visibility/loading/fallback strategy, known limitations, all present and config-checked), **not confirmed by actual observed traversal** this session.
- **Production isolation:** `MEASURED` — bundle isolation, live network capture, zero new tracked public assets, zero production-route file changes (§8 of the main evidence file).
- **Technical-architecture readiness:** `MEASURED` — reuse boundary confirmed by direct source inspection (Drift3DVehicle unmodified, production pure functions imported not forked, PRE-30 mechanisms imported not duplicated).
- **Asset readiness:** `MEASURED` — zero new tracked assets; all reused assets are PRE-30's own already-hash-verified, already-accepted files.
- **Artistic readiness:** **not assessable this session** — this is precisely the judgment the live-render limitation blocks; PRE-30's own §12.4 artistic reservation (`TECHNICALLY ACCEPTED — VISUAL REALISM NOT ACCEPTED AS FINAL ART`) is inherited unchanged and not weakened or re-litigated by this dossier.
- **Realism debt:** unchanged from PRE-30's own recorded debt (Kenney low-poly register on every tracked GLB/texture except `snow_02`) — this lot adds no new realism debt beyond that, and does not claim to have reduced it (greybox scope, per this lot's own brief, explicitly does not require final art).
- **Performance readiness:** `KNOWN_ENVIRONMENT_LIMITATION` — see `performance-snapshots.json`.
- **Mobile readiness:** **not assessable this session** — mobile-viewport structural layout was not separately re-checked this pass (PRE-30's own equivalent check is not directly transferable, since this route's own control layout differs); recorded as an open item, not silently assumed passing.
- **Fallback readiness:** `MEASURED` at the config/metadata level (fallback cards config-validated, zero issues; reduced-motion/no-WebGL code paths read and confirmed present by source inspection) — **not visually confirmed** this session.
- **VF-MORNE-00 implications:** remains `BLOCKED_BY_DEPENDENCY` on this lot's own closure. Once this dossier's live-render gap is resolved and an owner review closes `DRIFT-IV-PRE-40`, `VF-MORNE-00` becomes `READY_AFTER_MERGE` — its own Identity Contract/Cue Map/final-scene work is untouched and unaffected by anything in this lot, per the explicit Vegetative Field/New Signal guardrails above.
- **Global recommendation (provisional, this pass):** the three closed values (`READY_FOR_TRACK_PRODUCTION` / `READY_WITH_NON_BLOCKING_GAPS` / `REWORK_REQUIRED`) all presuppose an actual observed render, which does not exist yet this pass. If a value must be provisionally recorded, `READY_WITH_NON_BLOCKING_GAPS` best reflects the strength of the structural/automated evidence gathered — but this is explicitly **provisional**, not a substitute for the live-render resolution this dossier itself defers to a follow-up pass, matching `DRIFT-IV-PRE-30`'s own precedent exactly.
- **Owner global verdict:** `PENDING`.
