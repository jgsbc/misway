# DRIFT 3D — Living World history reconciliation report

**Status:** `HISTORICAL RECONCILIATION AUTHORITY`
**Date:** 2026-07-16
**Lot:** `DRIFT-IV-GOV-10 — Reconcile Living World branches`

This report proves the decisions made to preserve, adopt or defer the Living World/CUES history. It is evidence of governance decisions. It is **not** proof of runtime state — the code on `main` remains the only authority for what is actually delivered.

---

# 1. Git evidence

## 1.1 Refs verified at preflight

| Ref | Value | Role |
|---|---|---|
| `origin/main` (baseline) | `522477d141c53a9c1bf5c6e8a1f24d34e7336ba5` | Current production baseline, contains `DRIFT-IV-GOV-00` |
| `origin/drift-lw-cues-00-eux-gainent` | `ad216009349e2d848c39917bbf0a440e5629cc0f` | Full historical Living World/CUES line |
| `archive/drift-lw-cues-implemented-20260713` | `ad216009349e2d848c39917bbf0a440e5629cc0f` | Immutable anchor tag, identical to the branch tip |
| `origin/drift-3d-20f-production-qa-mobile-polish` | `46930a1c398e870375baf8bc86a37c5b4b62a7d4` | Intermediate rescue ref, identical to the Cue Map commit |
| `origin/rescue/drift-lw-eux-cue-map` | `46930a1c398e870375baf8bc86a37c5b4b62a7d4` | Intermediate rescue ref, identical to the Cue Map commit |
| Merge-base(`main`, historical) | `77a35a547d3bedc0201c65f77569b37c7c5e87fa` | Point of divergence (2026-07-09, "Colorize Drift home CTA") |

All five values matched the expected preflight baseline exactly. No discrepancy to document.

## 1.2 Two comparisons — not interchangeable

- **`origin/main...origin/drift-lw-cues-00-eux-gainent`** (triple dot, from merge-base): isolates exactly what the historical line itself produced since it diverged. This is the correct basis for reconciliation decisions. It returns **33 files** across 10 commits.
- **`origin/main..origin/drift-lw-cues-00-eux-gainent`** (double dot, direct tip-to-tip): also reflects everything `main` did **independently** since the merge-base (the entire SITE-IDENTITY program, the Integral World Program adoption, `about`/`artist`/`tracks` pages, `Navigation.tsx`, `GlobalAudioPlayer.tsx`, `tracks.ts`, and four brand-new Integral docs that show as `D` simply because they postdate the historical branch's divergence point). None of that is Living World/CUES content. **This report uses the triple-dot (33-file) result only.** The double-dot result is not used for any classification decision — using it would have wrongly implicated ~26 unrelated SITE-IDENTITY/GOV files.

## 1.3 Commit count

```powershell
git log --reverse --oneline origin/main..origin/drift-lw-cues-00-eux-gainent
```

returned exactly the ten expected commits, in the expected order. No discrepancy from the expected list.

```text
92f4bfd Add Drift 3D world-edge depth
740e437 Rework Drift 3D world edges: continuity, ridges, river
d77edcf Add Drift 3D vegetation wind
6c2998b Add Drift 3D track-flavored scene details
67baa64 Document Drift 3D production QA sign-off
541ea7b Adopt Living World governance for Drift
a15fba9 Add EUX GAINENT Living World core states
5eed84a Define EUX GAINENT singular identity contract
46930a1 Map EUX GAINENT musical dramaturgy
ad21600 Add deterministic EUX GAINENT musical cues
```

## 1.4 File count

`33 files changed, 4711 insertions(+), 1808 deletions(-)` on the triple-dot comparison. All 33 files fall exactly into the four groups anticipated by the lot instructions (9 governance + 8 visual doctrine + 5 Living World + 11 runtime = 33). No file is unaccounted for.

---

# 2. Classification of the ten historical commits

Decision classes used: `ADOPT_DOCUMENT`, `ADOPT_DOCUMENT_WITH_MINIMAL_RECONCILIATION`, `HISTORICAL_EVIDENCE_ONLY`, `SUPERSEDED_BY_MAIN`, `DEFER_RUNTIME_TO_BASE_00`, `DEFER_RUNTIME_TO_SYS_00`, `DEFER_RUNTIME_TO_BY_EUX_20_30`, `REJECT`. (`DEFER_RUNTIME_TO_BY_EUX_20_30` was recorded at the time this lot ran as `DEFER_RUNTIME_TO_VS1_00`; `DRIFT-IV-GOV-30` retired `DRIFT-IV-VS1-00` as an alias and renamed this class to its canonical target — see `docs/DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md`.)

## 2.1 `541ea7b` — Adopt Living World governance for Drift

- **Intention:** adopt the branch's own Living World governance package: a rewritten `AGENTS.md`, `README.md`, `DRIFT_BACKLOG.md`, `DRIFT_GOVERNANCE.md`, `DRIFT_AGENTS_SKILLS.md`, `DRIFT_DOCUMENTATION_MAP.md`, a new PR template, plus the three founding Living World documents (Product Spec, Living World Bible, Living Track Matrix) and light banner edits on seven visual-doctrine docs.
- **Files:** 20 files (`.github/pull_request_template.md`, `AGENTS.md`, `README.md`, `docs/ACTIVE_LOT.md`, `docs/DECISIONS_LOG.md`, `docs/DRIFT_3D_ART_DIRECTION.md`, `docs/DRIFT_3D_COLOR_SCRIPT.md`, `docs/DRIFT_3D_LAYOUT_RECOMMENDATION.md`, `docs/DRIFT_3D_LAYOUT_V2_IMPLEMENTATION_TARGET.md`, `docs/DRIFT_3D_LIVING_TRACK_MATRIX.md`, `docs/DRIFT_3D_LIVING_WORLD_BIBLE.md`, `docs/DRIFT_3D_PRODUCT_SPEC.md`, `docs/DRIFT_3D_REALISM_BIBLE.md`, `docs/DRIFT_3D_SET_DESIGN_BLUEPRINT.md`, `docs/DRIFT_3D_TRACK_SCENE_MATRIX.md`, `docs/DRIFT_AGENTS_SKILLS.md`, `docs/DRIFT_BACKLOG.md`, `docs/DRIFT_DOCUMENTATION_MAP.md`, `docs/DRIFT_GOVERNANCE.md`, `docs/DRIFT_MAP_SPEC.md`).
- **Dependencies:** root of the historical line; nothing precedes it.
- **Overlap with `main`:** severe on governance files. `main`'s own `AGENTS.md`, `DRIFT_BACKLOG.md` and `DRIFT_DOCUMENTATION_MAP.md` have since been independently and more recently rewritten twice (`SITE-IDENTITY` closure, then `DRIFT-IV-GOV-00`/`GOV-10`) around a personal, non-commercial mission. This commit's `AGENTS.md` predates that closure and cannot be assumed free of the retired commercial framing.
- **Contradictions:** **confirmed and resolved.** This commit's edit to `docs/DRIFT_3D_REALISM_BIBLE.md` demoted it from "source de vérité artistique" to a subordinate "FOUNDATION" under a Living World Bible hierarchy — directly contradicting this lot's mandate that the Realism Bible remains the active visual authority on `main`. That specific hunk is **rejected**; `docs/DRIFT_3D_REALISM_BIBLE.md` is left untouched by this lot, and no document adopted or edited by `GOV-10` demotes it anywhere. The adopted `DRIFT_3D_LIVING_WORLD_BIBLE.md` now states a non-hierarchical authority split instead (Realism Bible = visual/material/light/geometry/scale/physical credibility/readability/performance; Living World Bible = narrative/behavioral/autonomous life/anomaly/population/continuity/memory; Living Track Matrix = track-by-track narrative vision; an approved Identity Contract = dominant local authority) — visual conflicts are still resolved in the Realism Bible's favor. Separately, the Living World Bible's own North Star ("un monde crédible progressivement contaminé par l'imaginaire MISWAY") is framed differently from the Integral World Program's North Star adopted in `GOV-00` ("un monde mental qui s'est organisé pour continuer à fonctionner après une rupture"). This is now resolved by an explicit relation recorded in `DRIFT_3D_LIVING_WORLD_BIBLE.md`: the Integral Program's North Star is the global narrative meaning, and the Living World Bible's North Star is its perceptual mode of revelation — the second stages the first, it does not replace it. Neither North Star's own wording was rewritten.
- **Artistic value:** very high for the three founding documents (Product Spec, Living World Bible, Living Track Matrix) — they are the missing artistic foundation this lot exists to reconcile. Zero adoption value for the governance-file rewrites, which are superseded in full by `main`'s current, more recent governance model.
- **Technical value:** none (documentation only).
- **QA evidence:** self-reported on the historical `DECISIONS_LOG.md` as `DRIFT-GOV-00 — ACCEPTED. Documentation-only scope, lint, static build and governance checks passed.` This is historical evidence of that branch's own state at that time; it is not QA of the current `main`.
- **Decision:** **split.** Product Spec / Living World Bible / Living Track Matrix → `ADOPT_DOCUMENT_WITH_MINIMAL_RECONCILIATION`. `AGENTS.md`, `README.md`, `DRIFT_BACKLOG.md`, `DRIFT_GOVERNANCE.md`, `DRIFT_AGENTS_SKILLS.md`, `DRIFT_DOCUMENTATION_MAP.md`, `.github/pull_request_template.md` → `SUPERSEDED_BY_MAIN`. The seven minor visual-doctrine banner edits → `HISTORICAL_EVIDENCE_ONLY` (their intent is already satisfied by `main`'s own Realism Bible caducity banners, with the one exception rejected above).
- **Target lot:** `DRIFT-IV-GOV-10` (this lot, documents only).

## 2.2 `a15fba9` — Add EUX GAINENT Living World core states

- **Intention:** first Living World runtime proof — mount a track-local `EuxGainentLivingScene` that wakes, freezes and resets from the global playback state, with no cues, memory or generic architecture.
- **Files:** `src/components/drift-3d/Drift3DCanvas.tsx`, `src/components/drift-3d/Drift3DScene.tsx`, `src/components/drift-3d/EuxGainentLivingScene.tsx` (new), plus `docs/ACTIVE_LOT.md` and `docs/DECISIONS_LOG.md`.
- **Dependencies:** none from earlier in this list; depends conceptually on the governance adopted in `541ea7b`.
- **Overlap with `main`:** none — `EuxGainentLivingScene.tsx` does not exist on `main`; `Drift3DCanvas.tsx` and `Drift3DScene.tsx` exist on `main` but have evolved independently (heightfield terrain, vehicle physics, scatter fields) and were never given this hunk.
- **Contradictions:** none conceptual.
- **Artistic value:** medium-high — proves the track-local scene pattern demanded by the Integral Systems Architecture (§4, "TRACK-LOCAL LIVING SCENES").
- **Technical value:** medium-high — small, deterministic, ref-owned local phase; no new dependency, timer or generic engine, per the commit's own log.
- **QA evidence:** self-reported `Status: PENDING_OWNER_REVIEW. Automated technical gates passed; owner visual acceptance remains required.` Even on its own branch this was never owner-accepted. Not QA of `main`.
- **Decision:** `DEFER_RUNTIME_TO_BY_EUX_20_30`.
- **Target lot:** `DRIFT-IV-BY-EUX-20` (build) / `DRIFT-IV-BY-EUX-30` (owner acceptance).

## 2.3 `5eed84a` — Define EUX GAINENT singular identity contract

- **Intention:** produce the full EUX GAINENT Identity Contract (North Star, title interpretation, normal/hidden reading, anomaly hierarchy, visual grammar, signature objects, athlete roles, music relationship, reduced-motion and mobile contracts, DO-NOT-DO, uniqueness contract, acceptance test).
- **Files:** `docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md` (new), plus `docs/ACTIVE_LOT.md`, `docs/DECISIONS_LOG.md`, `docs/DRIFT_BACKLOG.md`, `docs/DRIFT_DOCUMENTATION_MAP.md` (all four superseded governance files touched again).
- **Dependencies:** depends on `a15fba9` (core states) and the Living World Bible/Living Track Matrix from `541ea7b`.
- **Overlap with `main`:** none — this document does not exist on `main` before this lot.
- **Contradictions:** **found and resolved.** The contract as originally authored simultaneously recorded a "Resolved owner decisions" list (interior reference-frame illusion, immobile shell/collider/node/footprint, `CADENCE → ÉCART → CONFORMITÉ → RENDEMENT` vocabulary, `OBJECTIF DÉPLACÉ` as the unique signature text, deferred headlights) and a contradicting "Unresolved owner decisions" §21 that reopened two of those exact same points (the spatial-signature carrier, the control-language wording) as still open. This lot corrected §21 to `Required implementation follow-up`, containing only genuine listening/QA follow-up (human audition of the canonical source, bounded timestamp adjustments if audition justifies them, visual/musical QA of the future runtime, owner acceptance of `DRIFT-IV-BY-EUX-30`) — no previously approved identity decision reappears as open. Otherwise none with the Integral Matrix V2's own EUX GAINENT entry — inspiration, anomaly, signature object and Do-not-do descriptions are compatible in substance, though the Identity Contract is far more detailed.
- **Artistic value:** very high — this is the exact "Approved Track Identity Contract" the Integral World Program's pipeline (§6, T0) requires before any EUX build lot.
- **Technical value:** high — contains a reusable cue-candidate structure and explicit reduced-motion/mobile contracts.
- **QA evidence:** none applicable — a document is reviewed, not QA-tested. Identity is approved and closed; only listening/QA follow-up and `DRIFT-IV-BY-EUX-30`'s own owner acceptance remain open, per the corrected §21.
- **Decision:** `ADOPT_DOCUMENT` (identity contract itself); the four touched governance files → `SUPERSEDED_BY_MAIN` (already covered under `541ea7b`).
- **Target lot:** `DRIFT-IV-GOV-10` (this lot, document only). Runtime remains deferred to `DRIFT-IV-BY-EUX-20` / `DRIFT-IV-BY-EUX-30`.

## 2.4 `46930a1` — Map EUX GAINENT musical dramaturgy

- **Intention:** produce the EUX GAINENT Cue Map: canonical audio source verification, four analytical substitute passes (no human audition was possible in the execution environment), full musical structure table, seven final cues with timestamps, reduced-motion and mobile cue tables, confidence table, and a deterministic pause/seek/loop/zone-exit policy.
- **Files:** `docs/DRIFT_3D_EUX_GAINENT_CUE_MAP.md` (new), plus `docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md` (9-line update), `docs/ACTIVE_LOT.md`, `docs/DECISIONS_LOG.md`, `docs/DRIFT_BACKLOG.md`, `docs/DRIFT_DOCUMENTATION_MAP.md`.
- **Dependencies:** depends on `5eed84a` (identity contract) and the canonical `public/audio/eux-gainent.mp3` (confirmed present at 7,216,482 bytes, `03:45.455` duration).
- **Overlap with `main`:** none — the Cue Map does not exist on `main` before this lot. `eux-gainent.mp3` and its `tracks.ts` mapping already exist on `main` independently (added in an earlier, unrelated publish lot) and are unaffected.
- **Contradictions:** **found and resolved.** As originally authored, the document mixed an `OWNER_APPROVED_FOR_IMPLEMENTATION` status line with a closing statement that "all cue timing remains `ANALYTICAL_DRAFT`" until a listening pass, plus a reference to a blocked historical lot (`DRIFT-LW-CUES-00 remains blocked pending owner timestamp validation`) — an approved-and-blocked status held simultaneously. This lot resolved it to a single non-contradictory status: `OWNER_APPROVED_INITIAL_IMPLEMENTATION_BASELINE` with `Evidence level: ANALYTICAL — NOT HUMAN-AUDITIONED`. The timestamps are authorized as the baseline for `DRIFT-IV-BY-EUX-20`'s first implementation; they are not a final musical truth; a future listening pass may only produce bounded adjustments within the approved structural windows, not new events or text. §20–21 were reworded accordingly (`Contract ready for initial implementation`, `Required listening and calibration follow-up`) without touching the underlying structural analysis, timestamps or confidence table.
- **Artistic value:** high — rigorous, falsifiable structural analysis tied to measured audio features rather than invented drama beats.
- **Technical value:** high — ready-to-implement timestamp table, explicit pause/seek/loop resolution rules per cue.
- **QA evidence:** self-reported on the historical `DECISIONS_LOG.md` as `DRIFT-LW-EUX-CUE-MAP-00 — ACCEPTED_WITH_FOLLOW_UP. The owner approved the analytical timestamps as the initial runtime implementation baseline; bounded timing adjustments remain possible after real listening and visual QA.` This is a genuine, recorded owner decision (accepting analytical timestamps as an implementation baseline) — it is preserved as such, but it is not evidence that the cue **runtime** is built or verified on `main`.
- **Decision:** `ADOPT_DOCUMENT` (cue map itself); the four touched governance files → `SUPERSEDED_BY_MAIN` (already covered).
- **Target lot:** `DRIFT-IV-GOV-10` (this lot, document only). Runtime remains deferred to `DRIFT-IV-BY-EUX-20` / `DRIFT-IV-BY-EUX-30`.

## 2.5 `ad21600` — Add deterministic EUX GAINENT musical cues

- **Intention:** wire the seven approved cues into runtime — a stable audio-clock ref synchronized from the global provider, a pure constant-time EUX cue resolver, and an extended `EuxGainentLivingScene` `useFrame` deriving athlete/machine transforms from absolute musical time, deterministic under pause, seek, loop, track change and zone re-entry.
- **Files:** `src/lib/drift3dAudioClock.ts` (new), `src/lib/drift3dEuxGainentCues.ts` (new), `src/components/drift-3d/Drift3DClient.tsx`, `src/components/drift-3d/Drift3DCanvas.tsx`, `src/components/drift-3d/Drift3DScene.tsx`, `src/components/drift-3d/EuxGainentLivingScene.tsx`, plus `docs/ACTIVE_LOT.md` and `docs/DECISIONS_LOG.md`.
- **Dependencies:** depends on `a15fba9` (scene base) and `46930a1` (cue timing).
- **Overlap with `main`:** none of the five runtime files exist on `main`.
- **Contradictions:** none conceptual; the commit's own log is explicit that continuous-play visual timing could not be verified because the execution environment cannot play audio — only pause/seek/track-replacement behavior was harness-tested.
- **Artistic value:** high — this is the runtime expression of the approved Cue Map.
- **Technical value:** high — `drift3dAudioClock.ts` is architecturally a shared, track-agnostic service (matches Integral Systems Architecture §5.1, "AudioClockRef"), while the cue resolver and scene wiring are strictly EUX-local.
- **QA evidence:** self-reported `Status: PENDING_OWNER_REVIEW. Automated gates and bounded runtime QA passed; final musical and visual cue timing requires owner QA.` A resolver harness of "21 cue cases plus clock extrapolation, pause, paused seek and track replacement" plus lint/build passed on that branch's own state. Not QA of `main`; continuous-play behavior was never verified even there.
- **Decision:** **split by architectural role**, per the Integral Systems Architecture's own boundary between shared services and track-local scenes. `src/lib/drift3dAudioClock.ts` → `DEFER_RUNTIME_TO_SYS_00` (it is the shared audio-clock service, not EUX-specific). `src/lib/drift3dEuxGainentCues.ts`, `EuxGainentLivingScene.tsx`, and the `Drift3DCanvas.tsx` / `Drift3DClient.tsx` / `Drift3DScene.tsx` wiring → `DEFER_RUNTIME_TO_BY_EUX_20_30`. `docs/ACTIVE_LOT.md` → `SUPERSEDED_BY_MAIN`; `docs/DECISIONS_LOG.md` entry → `HISTORICAL_EVIDENCE_ONLY`.
- **Target lot:** `DRIFT-IV-SYS-00` (audio clock) and `DRIFT-IV-BY-EUX-20` / `DRIFT-IV-BY-EUX-30` (EUX cue wiring and scene, build then owner acceptance).

## 2.6 `67baa64` — Document Drift 3D production QA sign-off

- **Intention:** record a QA sign-off entry (`DRIFT-3D-20F`) claiming the pre-Living-World 3D world (26 nodes, mobile polish, perf sweep) was production-ready.
- **Files:** `docs/DECISIONS_LOG.md` only (16 lines appended).
- **Dependencies:** depends on the prior visual/scatter/edge work already reflected in that historical log (a different sub-lineage than the EUX/Living-World commits).
- **Overlap with `main`:** none direct. `main` has its own, much longer and independently evolved `DECISIONS_LOG.md`.
- **Contradictions:** **important caution, not a contradiction of fact.** The sign-off's claims ("26/26 nœuds… zéro TRACK MISSING", specific fps/draw-call numbers, mobile checks) describe the historical branch's state on 2026-07-09. That runtime state was never merged to `main` and no longer represents `main`'s current Drift 3D world, which has since gained its own independent terrain/physics/vehicle work. **This sign-off must never be cited as QA evidence for the current `main` runtime.**
- **Artistic value:** none — it is a QA record, not an artistic contribution.
- **Technical value:** none directly adoptable, but its methodology (teleport-sweep across all nodes, single-`<audio>` check, per-zone draw-call/fps capture, mobile viewport check, route-by-route 200 check) is a useful reference method for a future `DRIFT-IV-BASE-00` audit.
- **QA evidence:** this commit **is** the QA record — entirely about a divergent, unmerged branch state.
- **Decision:** `HISTORICAL_EVIDENCE_ONLY`.
- **Target lot:** none. Its method may inform `DRIFT-IV-BASE-00`'s own audit design; it is not itself adopted.

## 2.7 `6c2998b` — Add Drift 3D track-flavored scene details

- **Intention:** add one to two small diegetic props (moored boat, bins, cairn, jars, garden flamingo, overflowing mailbox, owl silhouette, driftwood bottle) to eight existing landmarks.
- **Files:** `src/lib/drift3dLandmarks.ts`, `docs/DECISIONS_LOG.md`.
- **Dependencies:** depends on the landmark data structure as it stood on the historical branch at that point.
- **Overlap with `main`:** `src/lib/drift3dLandmarks.ts` exists on `main` and has evolved independently and substantially (the realism pivot, photo-PBR materials, figurative scenes, EUX GAINENT and ÉTÉÉAOOÉTÉ landmarks were all added directly on `main`'s own line). A blind cherry-pick would risk duplicate or conflicting entries.
- **Contradictions:** none conceptual — the props are consistent with the Realism Bible's anti-abstract, diegetic-object rules — but compatibility with `main`'s current landmark schema is unverified and must be audited, not assumed.
- **Artistic value:** medium — small, characterful, on-brief per the Realism Bible.
- **Technical value:** low-medium — roughly 50 additional primitives; self-reported perf headroom (~160 draw calls / 172k triangles against ≤300/≤1.5M budgets).
- **QA evidence:** self-reported lint/build PASS and browser QA, on the historical branch's own state only — not verified against `main`'s current landmark file.
- **Decision:** `DEFER_RUNTIME_TO_BASE_00`.
- **Target lot:** `DRIFT-IV-BASE-00`.

## 2.8 `d77edcf` — Add Drift 3D vegetation wind

- **Intention:** add a zero-extra-cost GPU vertex-shader wind patch (`onBeforeCompile`) to scattered vegetation instances.
- **Files:** `src/components/drift-3d/Drift3DScatterField.tsx`, `docs/DECISIONS_LOG.md`.
- **Dependencies:** depends on `Drift3DScatterField.tsx`'s structure as it stood on the historical branch.
- **Overlap with `main`:** `Drift3DScatterField.tsx` exists on `main` and has evolved independently (instanced scatter field with ten archetypes, per `main`'s own `DECISIONS_LOG.md`). Compatibility of the shader patch with `main`'s current material/instancing setup is unverified.
- **Contradictions:** none conceptual.
- **Artistic value:** medium — matches the Realism Bible's own language ("blé qui ondule", "la crête au vent").
- **Technical value:** medium-high — a genuinely reusable, zero-draw-call technique worth evaluating on its own merit.
- **QA evidence:** self-reported lint/build PASS, perf reported unchanged (145 calls / 171k triangles) on the historical branch's own state only.
- **Decision:** `DEFER_RUNTIME_TO_BASE_00`.
- **Target lot:** `DRIFT-IV-BASE-00`.

## 2.9 `740e437` — Rework Drift 3D world edges: continuity, ridges, river

- **Intention:** rework the ocean/cliffs/hills/plains/river background depth layer for continuity — a low-poly ridge generator, a ground "apron" hiding plane seams, an animated flat ocean, and a river module with variable-width banks that excludes itself from scatter placement.
- **Files:** `src/components/drift-3d/Drift3DWorldEdges.tsx`, `src/lib/drift3dRivers.ts` (new), `src/lib/drift3dScatter.ts`, `docs/DECISIONS_LOG.md`.
- **Dependencies:** depends on `92f4bfd` (initial world-edge depth), which it substantially reworks.
- **Overlap with `main`:** `Drift3DWorldEdges.tsx` and `drift3dRivers.ts` are both **absent** from `main` — but `main` independently built its own heightfield terrain system (`src/lib/drift3dTerrain.ts`, per `main`'s own `DECISIONS_LOG.md` entries "DRIFT-3D-27/28/30", dated 2026-07-08) that represents ocean/cliffs/hills/plains as part of one analytic heightfield rather than as a separate flat "world edges" background component. **This is a real architectural divergence, not a simple gap** — the two lines solved the same problem (world-edge depth) with incompatible approaches at roughly the same time.
- **Contradictions:** confirmed architectural divergence with `main`'s heightfield terrain, as above. Direct adoption would very likely duplicate or conflict with terrain `main` already has.
- **Artistic value:** high — detailed cardinal geography, continuity and river integration.
- **Technical value:** medium, but built against a terrain model `main` may no longer use the same way — reconciliation, not blind adoption, is required.
- **QA evidence:** self-reported lint/build PASS and browser QA on the historical branch's own state (139–143 draw calls / 171k triangles) — not verified against `main`.
- **Decision:** `DEFER_RUNTIME_TO_BASE_00`, explicitly flagged for architecture reconciliation against `drift3dTerrain.ts` before any porting is attempted.
- **Target lot:** `DRIFT-IV-BASE-00`.

## 2.10 `92f4bfd` — Add Drift 3D world-edge depth

- **Intention:** first version of the background depth layer (ocean, cliffs, hills, plains, a first river ribbon), non-collidable, outside the movement bounds.
- **Files:** `src/components/drift-3d/Drift3DWorldEdges.tsx` (new), `src/components/drift-3d/Drift3DScene.tsx`, `docs/DECISIONS_LOG.md`.
- **Dependencies:** none preceding it in this list; superseded within its own lineage by `740e437`.
- **Overlap with `main`:** same architectural divergence with `drift3dTerrain.ts` as `740e437`, above.
- **Contradictions:** superseded in its own line by `740e437`'s rework; same terrain-model divergence with `main`.
- **Artistic value:** medium — mostly of historical/evolutionary interest, since `740e437` reworks nearly all of it.
- **Technical value:** low standalone value; useful only as the design history behind `740e437`.
- **QA evidence:** self-reported lint/build PASS, 180 draw calls / 181k triangles at worst zoom, on the historical branch's own state only.
- **Decision:** `DEFER_RUNTIME_TO_BASE_00`, to be evaluated together with `740e437` as one lineage, not separately.
- **Target lot:** `DRIFT-IV-BASE-00`.

---

# 3. Exhaustive file matrix

All 33 files returned by `git diff --name-status origin/main...origin/drift-lw-cues-00-eux-gainent`.

## 3.1 Gouvernance historique (9 files)

| Fichier | État historique | État sur main | Valeur | Risque | Décision | Lot cible |
|---|---|---|---|---|---|---|
| `.github/pull_request_template.md` | Created by `541ea7b`; generic PR checklist | Absent | Low/utility | None — generic content | `HISTORICAL_EVIDENCE_ONLY` | None (future governance lot if desired) |
| `AGENTS.md` | Rewritten by `541ea7b` around the branch's own Living World framing, predating the SITE-IDENTITY closure | Rewritten twice since (`SITE-IDENTITY` close, `GOV-00`, this lot) around a personal non-commercial mission | Superseded | Would silently reintroduce retired commercial-adjacent framing if merged blindly | `SUPERSEDED_BY_MAIN` | None — never merge |
| `README.md` | Modified by `541ea7b` (51 lines) | Independently current | Superseded | Low, unverified — out of this lot's scope | `SUPERSEDED_BY_MAIN` | None |
| `docs/ACTIVE_LOT.md` | Rewritten by every one of the 10 commits (always the live lot tracker) | Rewritten by `GOV-00`, about to be rewritten again by this lot | Superseded by design | None — this file is always fully replaced, never merged | `SUPERSEDED_BY_MAIN` | None |
| `docs/DECISIONS_LOG.md` | 10 append-only entries, extracted as evidence into §2 above | Append-only current log (`SITE-IDENTITY` + `GOV-00`, about to receive a `GOV-10` entry) | Evidence, not authority | None — append-only; must never be bulk-replaced | `HISTORICAL_EVIDENCE_ONLY` | None — append only, already done in §2 |
| `docs/DRIFT_AGENTS_SKILLS.md` | Rewritten by `541ea7b` (503 lines net removed) | Unchanged legacy V0/V1 doc, already orphaned from the active read pack | Superseded | Out of scope for `GOV-10` | `SUPERSEDED_BY_MAIN` | None — cleanup candidate for a future lot |
| `docs/DRIFT_BACKLOG.md` | Rewritten by `541ea7b`, then touched by `5eed84a`/`46930a1` | Already reduced to a redirect stub pointing to `DRIFT_3D_INTEGRAL_BACKLOG.md` (`GOV-00`) | Superseded | None | `SUPERSEDED_BY_MAIN` | None |
| `docs/DRIFT_GOVERNANCE.md` | Rewritten by `541ea7b` (411 lines net) | Unchanged legacy V0 doc, already orphaned from the active read pack | Superseded | Out of scope for `GOV-10` | `SUPERSEDED_BY_MAIN` | None — cleanup candidate for a future lot |
| `docs/DRIFT_DOCUMENTATION_MAP.md` | Created by `541ea7b`, extended by `5eed84a`/`46930a1` — a different, earlier documentation map | `main`'s own, more elaborate map (`GOV-00`), being extended by this very lot | Superseded | None | `SUPERSEDED_BY_MAIN` | None |

## 3.2 Doctrine et documents visuels historiques (8 files)

| Fichier | État historique | État sur main | Valeur | Risque | Décision | Lot cible |
|---|---|---|---|---|---|---|
| `docs/DRIFT_3D_ART_DIRECTION.md` | 7 lines changed by `541ea7b` — pointer update toward the Living World Bible | Already carries its own caducity banner pointing to the Realism Bible; gameplay rules kept valid | Already present in spirit | None | `HISTORICAL` — déjà présente en substance | None |
| `docs/DRIFT_3D_COLOR_SCRIPT.md` | 44 lines changed by `541ea7b` — additions for contamination/anomaly state per track | Unchanged base color script | Encore pertinente mais à reporter | None immediate | `HISTORICAL_EVIDENCE_ONLY` — future enhancement candidate | None assigned yet (candidate for `GOV-20` or a dedicated content lot) |
| `docs/DRIFT_3D_LAYOUT_RECOMMENDATION.md` | 4 lines changed (minor pointer edit) | Unchanged | Trivial | None | `HISTORICAL_EVIDENCE_ONLY` | None |
| `docs/DRIFT_3D_LAYOUT_V2_IMPLEMENTATION_TARGET.md` | 4 lines changed (minor pointer edit) | Unchanged | Trivial | None | `HISTORICAL_EVIDENCE_ONLY` | None |
| `docs/DRIFT_3D_REALISM_BIBLE.md` | **12 lines changed by `541ea7b` — demotes it from unique artistic authority to a subordinate "FOUNDATION"** | Remains the unmodified, active visual authority | Contradictory | **Confirmed contradiction** with this lot's explicit mandate | `REJECT` (this specific hunk) | None — file left untouched on `main` |
| `docs/DRIFT_3D_SET_DESIGN_BLUEPRINT.md` | 3 lines changed (minor) | Unchanged | Trivial | None | `HISTORICAL_EVIDENCE_ONLY` | None |
| `docs/DRIFT_3D_TRACK_SCENE_MATRIX.md` | 6 lines changed by `541ea7b` | Unchanged; already caducated with gameplay rules valid, per current documentation map | Already covered | None | `HISTORICAL_EVIDENCE_ONLY` | None |
| `docs/DRIFT_MAP_SPEC.md` | 4 lines changed (minor) | Unchanged legacy V0 2D `/drift-lab` spec, already orphaned from the active read pack | Trivial | Out of scope | `HISTORICAL_EVIDENCE_ONLY` | None — cleanup candidate for a future lot |

## 3.3 Documents Living World adoptés dans ce lot (5 files)

| Fichier | État historique | État sur main | Valeur | Risque | Décision | Lot cible |
|---|---|---|---|---|---|---|
| `docs/DRIFT_3D_PRODUCT_SPEC.md` | Created by `541ea7b` — product truth, routes, delivered runtime, permanent constraints, current boundaries | Absent before this lot | Very high | Minor factual drift (dated to `DRIFT-LW-AUDIT-00`, a lot that was never the actual next lot) — corrected in §6.1 of the adoption | `ADOPT_DOCUMENT_WITH_MINIMAL_RECONCILIATION` | `DRIFT-IV-GOV-10` (docs only) |
| `docs/DRIFT_3D_LIVING_WORLD_BIBLE.md` | Created by `541ea7b` — North Star, artistic positioning, era curve, graphic/object/interaction/memory grammar, 18 sections | Absent before this lot | Very high | Resolved: the demoting "Hiérarchie documentaire proposée" was replaced by a non-hierarchical authority split, and an explicit relation was added between this document's North Star and the Integral World Program's (global meaning vs. perceptual expression — the second stages the first, neither wording rewritten) | `ADOPT_DOCUMENT_WITH_MINIMAL_RECONCILIATION` | `DRIFT-IV-GOV-10` (docs only) |
| `docs/DRIFT_3D_LIVING_TRACK_MATRIX.md` | Created by `541ea7b` — six-element contract for all 26 tracks + Entry, vertical-slice synthesis, recommended order | Absent before this lot | Very high | None — internally consistent with 26 tracks / Entry, cross-checked | `ADOPT_DOCUMENT_WITH_MINIMAL_RECONCILIATION` | `DRIFT-IV-GOV-10` (docs only) |
| `docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md` | Created by `5eed84a`, referenced by `46930a1` | Absent before this lot | Very high | Resolved: §21 no longer reopens already-approved identity decisions (interior reference-frame illusion, immobile shell/collider/node, vocabulary, `OBJECTIF DÉPLACÉ`, deferred headlights); it is now `Required implementation follow-up` (listening, bounded timestamp adjustment, QA, `DRIFT-IV-BY-EUX-30` owner acceptance) | `ADOPT_DOCUMENT` | `DRIFT-IV-GOV-10` (docs only) |
| `docs/DRIFT_3D_EUX_GAINENT_CUE_MAP.md` | Created by `46930a1` | Absent before this lot | High | Resolved: single status `OWNER_APPROVED_INITIAL_IMPLEMENTATION_BASELINE` / `Evidence level: ANALYTICAL — NOT HUMAN-AUDITIONED` replaces the prior approved-and-blocked mix; timestamps stand as the initial implementation baseline, refinable only within bounded adjustments | `ADOPT_DOCUMENT` | `DRIFT-IV-GOV-10` (docs only) |

## 3.4 Runtime historique différé (11 files)

None of these files are modified or created in this lot.

| Fichier | État historique | État sur main | Valeur | Risque | Décision | Lot cible |
|---|---|---|---|---|---|---|
| `src/components/drift-3d/Drift3DWorldEdges.tsx` | Created by `92f4bfd`, reworked by `740e437` | Absent | High (superseded internally by its own rework) | Architectural divergence vs. `main`'s heightfield terrain (`drift3dTerrain.ts`) | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` (evaluated by `DRIFT-IV-BASE-00`, not ported; functional intent not proven satisfied) | None — see `docs/DRIFT_3D_RUNTIME_BASELINE.md` §7 |
| `src/lib/drift3dRivers.ts` | Created by `740e437` | Absent | Medium | Same terrain-model divergence as above | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` (evaluated by `DRIFT-IV-BASE-00`, not ported; functional intent not proven satisfied) | None — see `docs/DRIFT_3D_RUNTIME_BASELINE.md` §7 |
| `src/lib/drift3dScatter.ts` (river-corridor exclusion hunk) | Modified by `740e437` | Independently evolved (10 scatter archetypes) | Low-medium | Depends on `drift3dRivers.ts` above | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` (evaluated by `DRIFT-IV-BASE-00`, not ported) | None — see `docs/DRIFT_3D_RUNTIME_BASELINE.md` §7 |
| `src/components/drift-3d/Drift3DScatterField.tsx` (wind hunk) | Modified by `d77edcf` | Independently evolved instanced scatter field | Medium-high | Shader-patch compatibility with `main`'s current material/instancing setup unverified | `CANDIDATE_FOR_FUTURE_ENHANCEMENT` (evaluated by `DRIFT-IV-BASE-00`, not ported this lot; destination is a future `GLOB-*` harmonization lot, no new identifier) | None yet — see `docs/DRIFT_3D_RUNTIME_BASELINE.md` §7 |
| `src/lib/drift3dLandmarks.ts` (track-flavor props hunk) | Modified by `6c2998b` | Independently evolved (photo-PBR figurative scenes, EUX/ÉTÉÉAOOÉTÉ landmarks added directly on `main`) | Medium | Duplicate/conflicting entries likely on blind cherry-pick | `DO NOT CHERRY-PICK` — `REASSESS LOCALLY IN RELEVANT TRACK BUILDS` (evaluated by `DRIFT-IV-BASE-00`; line count is not proof of functional parity) | None — see `docs/DRIFT_3D_RUNTIME_BASELINE.md` §7 |
| `src/lib/drift3dAudioClock.ts` | Created by `ad21600` | Absent | High — shared service per Integral Systems Architecture §5.1 | None conceptual; needs its own acceptance pass | `DEFER_RUNTIME_TO_SYS_00` | `DRIFT-IV-SYS-00` |
| `src/lib/drift3dEuxGainentCues.ts` | Created by `ad21600` | Absent | High — EUX-local cue resolver | Depends on `SYS-00`'s audio clock landing first | `DEFER_RUNTIME_TO_BY_EUX_20_30` | `DRIFT-IV-BY-EUX-20` |
| `src/components/drift-3d/EuxGainentLivingScene.tsx` | Created by `a15fba9`, extended by `ad21600` | Absent | High | Never owner-accepted even on its own branch (`PENDING_OWNER_REVIEW`) | `DEFER_RUNTIME_TO_BY_EUX_20_30` | `DRIFT-IV-BY-EUX-20` |
| `src/components/drift-3d/Drift3DCanvas.tsx` (EUX wiring hunks) | Modified by `a15fba9`, `ad21600` | Independently evolved | Medium | Wiring only meaningful once `EuxGainentLivingScene.tsx` lands | `DEFER_RUNTIME_TO_BY_EUX_20_30` | `DRIFT-IV-BY-EUX-20` |
| `src/components/drift-3d/Drift3DClient.tsx` (audio clock sync hunk) | Modified by `ad21600` | Independently evolved | Medium | Depends on `SYS-00`'s audio clock | `DEFER_RUNTIME_TO_BY_EUX_20_30` | `DRIFT-IV-BY-EUX-20` |
| `src/components/drift-3d/Drift3DScene.tsx` (EUX mount + WorldEdges mount hunks) | Modified by `92f4bfd`, `a15fba9`, `ad21600` | Independently evolved (terrain, vehicle physics, scatter) | Medium | Mixed: its WorldEdges-mount hunk belongs with `BASE-00`; its EUX-mount hunk belongs with the EUX GAINENT proof slice — must be split, not ported as one hunk | EUX mount: `DEFER_RUNTIME_TO_BY_EUX_20_30` · WorldEdges mount: `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` (evaluated by `DRIFT-IV-BASE-00`, not ported — moot since `Drift3DWorldEdges.tsx` itself is rejected) | `DRIFT-IV-BY-EUX-20` (EUX mount) |

No file in this group is modified, created or ported by `DRIFT-IV-GOV-10`. The six `BASE-00`-targeted rows above were closed by `DRIFT-IV-GOV-30`'s successor lot `DRIFT-IV-BASE-00` — see `docs/DRIFT_3D_RUNTIME_BASELINE.md` §6 for the reconciliation rationale. No file in this group is modified, created or ported by `DRIFT-IV-BASE-00` either: it is a documentation and measurement lot only.

---

# 4. Runtime deferral summary

| Target lot | Files | Nature |
|---|---|---|
| `DRIFT-IV-BASE-00` (evaluated, not ported; `DRIFT-IV-BASE-00` itself remains `REWORK_REQUIRED` pending performance/fallback evidence — see `docs/DRIFT_3D_RUNTIME_BASELINE.md`) | `Drift3DWorldEdges.tsx`, `drift3dRivers.ts`, `drift3dScatter.ts` (river exclusion), `Drift3DScatterField.tsx` (wind), `drift3dLandmarks.ts` (track-flavor props), `Drift3DScene.tsx` (WorldEdges mount) | World-edge depth, vegetation wind and landmark detail candidates. `DRIFT-IV-BASE-00` reconciled all six: world-edges/rivers/scatter-exclusion/WorldEdges-mount are `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` (confirmed architectural divergence against `main`'s own heightfield terrain; functional intent not proven satisfied) ; landmarks props hunk is `DO NOT CHERRY-PICK` — `REASSESS LOCALLY IN RELEVANT TRACK BUILDS` ; the scatter-field wind hunk is `CANDIDATE_FOR_FUTURE_ENHANCEMENT`, not ported, destined to a future `GLOB-*` harmonization lot if pursued. No new lot identifier created. See `docs/DRIFT_3D_RUNTIME_BASELINE.md` §7. |
| `DRIFT-IV-SYS-00` | `drift3dAudioClock.ts` | Shared audio-clock service, track-agnostic per the Integral Systems Architecture |
| `DRIFT-IV-BY-EUX-20` / `DRIFT-IV-BY-EUX-30` | `EuxGainentLivingScene.tsx`, `drift3dEuxGainentCues.ts`, `Drift3DCanvas.tsx` (EUX hunks), `Drift3DClient.tsx`, `Drift3DScene.tsx` (EUX mount hunk) | EUX GAINENT proof-slice runtime — track-local scene, cue resolver and wiring (build), then owner acceptance, gated by the now-adopted Identity Contract and Cue Map |

*(At the time this reconciliation ran, the target lot above was recorded as `DRIFT-IV-VS1-00`. `DRIFT-IV-GOV-30` retired that identifier as an alias — see `docs/DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md` — and this document was updated to the canonical `DRIFT-IV-BY-EUX-20` / `DRIFT-IV-BY-EUX-30` pair without changing which files or decisions were classified.)*

## 4.1 Runtime status of EUX GAINENT

**Runtime status: NOT YET INTEGRATED ON MAIN.** The implementation candidate is preserved at `ad21600` (and the intermediate states at `a15fba9`, `46930a1`, `5eed84a`) and must be reimplemented or selectively ported in `DRIFT-IV-BY-EUX-20` (build), then accepted in `DRIFT-IV-BY-EUX-30`, against `main`'s current `Drift3DScene.tsx` / `Drift3DCanvas.tsx` / `Drift3DClient.tsx`, not cherry-picked as-is.

## 4.2 Coexistence rule recorded

The Realism Bible governs visual authority, material, light, geometry, scale, physical credibility, readability and performance. The Living World Bible governs narrative and behavioral authority, autonomous life, anomaly, population and continuity. The Living Track Matrix governs track-by-track narrative vision. An approved Identity Contract remains the dominant local authority for its track. This is recorded as a non-hierarchical authority split inside the adopted `docs/DRIFT_3D_LIVING_WORLD_BIBLE.md`, replacing the branch's own earlier "Hiérarchie documentaire proposée" (which had ranked the Realism Bible third, below the Living World Bible and Living Track Matrix). On visual conflict specifically, the Realism Bible still prevails — that line is kept verbatim. No document adopted or edited by this lot demotes the Realism Bible anywhere.

The same document now also records an explicit relation between the two North Stars: the Integral World Program's North Star (`GOV-00`) is the global narrative meaning — a mental world organized to keep functioning after a rupture; the Living World Bible's own North Star is its perceptual mode of revelation — a credible world progressively contaminated by MISWAY's anomalies, behaviors and memories. The second stages the first; it does not replace it. Neither North Star's own wording was rewritten to produce this relation.

## 4.3 Final wording cleanup

A last pass removed four remaining wording residues from the adopted documents, without touching the commit (§2) or file (§3) classification matrices:

- the Living World Bible's status line no longer claims visual authority (`primary artistic, narrative and behavioral authority` → `primary narrative and behavioral authority`) — the Realism Bible remains the sole visual authority, per §4.2 above;
- the retired commercial framing `la partie « bankable » de MISWAY` is removed from the Living World Bible's active doctrine (replaced by `une source majeure de singularité pour MISWAY`), while the underlying professional, industrial and entrepreneurial material it draws on is fully preserved as artistic substance;
- the EUX Identity Contract no longer implies it assigns timing itself (`Timing must come from an owner-led listening pass` → it now explicitly defers all timing authority to `DRIFT_3D_EUX_GAINENT_CUE_MAP.md`, with bounded calibration adjustments possible before `DRIFT-IV-BY-EUX-30` acceptance);
- the EUX Cue Map no longer frames itself as pending future approval (`Timing data ready for implementation after owner approval` → `Owner-approved initial timing data for implementation`; `No cue may become runtime authority before owner approval` → owner approval is already recorded for the initial baseline, and the cues become delivered runtime only after `DRIFT-IV-BY-EUX-20` implementation, `DRIFT-IV-BY-EUX-30` QA and acceptance).

None of these four fixes touched a timestamp, a structural window, a confidence level, a pause/seek/loop/reset rule, or the 10/10 commit and 33/33 file counts established above.

---

# 5. Branch and tag preservation policy

No branch, tag or stash was deleted, merged, rebased or cherry-picked in this lot.

- `origin/drift-lw-cues-00-eux-gainent` remains the complete historical source. It is the only place the full commit sequence and the pre-reconciliation state of every touched file can be re-inspected.
- `archive/drift-lw-cues-implemented-20260713` (identical to `ad21600`) is the immutable anchor tag for that state.
- `origin/drift-3d-20f-production-qa-mobile-polish` and `origin/rescue/drift-lw-eux-cue-map` (both identical to `46930a1`) are intermediate rescue refs preserved as backups of the Cue Map commit.
- Deletion of any of these refs can only be decided after the runtime candidates deferred above have been recovered and accepted in `DRIFT-IV-SYS-00` and `DRIFT-IV-BY-EUX-20` / `DRIFT-IV-BY-EUX-30`. No new tag was created by this lot; the existing anchor is sufficient.
