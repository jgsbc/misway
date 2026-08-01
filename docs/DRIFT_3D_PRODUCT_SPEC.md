# DRIFT 3D — Product specification

**Status:** `ACTIVE PRODUCT CONTRACT` — authoritative description of the delivered Drift product.
**RECONCILED ON MAIN:** 2026-07-16 (`DRIFT-IV-GOV-10`).

## Product truth

Drift is MISWAY's production 3D listening world. It turns the catalogue into a drivable territory while keeping music, explicit user intent and the shared site audio system central.

## Routes

- `/drift` is the production R3F / Three.js world.
- `/drift-lab` remains a historical and secondary 2D prototype.
- `/drift-3d-lab` is a compatibility route that redirects to `/drift`.

## Delivered runtime

- React Three Fiber and Three.js rendering.
- 26 catalogue tracks represented by 26 track nodes across four eras, plus the non-track entry threshold.
- Drivable vehicle, terrain sampling, vehicle physics and collisions.
- Track landmarks, atmospheric regions and scatter systems.
- Explicit track playback: approaching a node does not start music.
- The global `AudioPlayerProvider` remains the protected source of track playback truth.
- Diegetic/world ambience is opt-in and distinct from track playback.
- WebGL capability fallback with a quieter navigation/listening path.
- Reduced-motion users receive the fallback path rather than forced 3D motion.
- Static export, trailing slashes and production `basePath` support.

## Permanent product constraints

- Music remains the primary purpose of the world.
- Track audio requires explicit user action and continues through the global provider.
- Mobile interaction, safe control placement and usable fallbacks are release gates.
- Reduced motion and non-WebGL access are product requirements.
- Performance budgets must be checked before world density grows.
- Static-export and `basePath` compatibility must remain intact.
- Track meaning comes from owner-approved artistic contracts, never runtime invention.

## Current boundaries

The delivered product contains scene landmarks, atmospheres, scatter and interaction needed by the current 3D world, plus EUX GAINENT's full proof-slice Build **and** owner-accepted V3 rework (`DRIFT-IV-BY-EUX-20` merged to `main` at commit `d2a1c15`, PR #31; `DRIFT-IV-BY-EUX-30` merged to `main` at commit `b069d09`, PR #32 — both delivered). It does **not** yet claim the Living World object's behavioral model, directed musical cue sheets or bounded session memory described by the new artistic authorities beyond what EUX GAINENT itself demonstrates.

Those capabilities are the next governed evolution. `DRIFT-IV-BASE-00` through `DRIFT-IV-SYS-70`, `DRIFT-IV-BY-EUX-20`, **and `DRIFT-IV-BY-EUX-30`** are all `DONE`. **The canonical prerequisite chain from here** (corrected, `DRIFT-IV-GOV-40` rebase-onto-`main@b069d09` resolution — the chain below reflects `DRIFT_3D_INTEGRAL_BACKLOG.md` §8.2 as resequenced and accepted, not the original pre-`GOV-40` sequence):

```text
DRIFT-IV-GOV-40 merge (this lot itself — not yet merged)
→ DRIFT-IV-PRE-00 (canonical artistic reconciliation and owner acceptance)
→ DRIFT-IV-PRE-10 (five real visual masterframes, produced and accepted)
→ DRIFT-IV-PRE-20 (licensed asset/provenance registry and import evaluation)
→ DRIFT-IV-PRE-30 (representative shared-kit pilots: urban/human, nature/movement, water/weather/light)
→ DRIFT-IV-PRE-40 (five-macro-world greybox and formal readiness gate)
→ DRIFT-IV-VF-MORNE-00 (proof slice 2, resumes track-by-track work).
```

`DRIFT-IV-PRE-00` has not started. The backlog governs the detailed execution order. Their existence must not be claimed until implemented, validated and accepted lot by lot. `GOV-40` itself must not be claimed as already merged.

**EUX GAINENT's exact current state (corrected, `DRIFT-IV-GOV-40` rebase resolution onto `main@b069d09`):** `main` now contains **both** EUX GAINENT lots, delivered — `DRIFT-IV-BY-EUX-20`'s proof-slice Build (merged, commit `d2a1c15`, PR #31) **and** `DRIFT-IV-BY-EUX-30`'s owner-accepted V3 rework (realism pass, display rework, motion pass, signature amplification — merged, commit `b069d09`, PR #32). Neither is unmerged; neither is a pending candidate. This supersedes two prior stale references in this document's own history: the original `ad21600` historical-branch reference (stale because `BY-EUX-20` had since merged, and because `ad21600` was never the richer candidate's own commit — kept only as historical context, see `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md`), and the subsequent `UNMERGED OWNER-VALIDATED CANDIDATE` classification at branch `drift-iv-by-eux-30-owner-acceptance`, commit `c5ca4da847e2dab24f39b50025384f80fe6ca857` (accurate at the time it was written, now superseded by the PR #32 merge — `c5ca4da` may still be cited as the historical branch-head commit where useful, e.g. in `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md`'s own classification history). See `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` §0 for the full updated classification.

## Sources of delivered truth

The code is authoritative for what is currently shipped, notably the `/drift` route, `src/components/drift-3d/`, `src/lib/drift3d*.ts`, `src/lib/tracks.ts`, the global audio provider, `package.json` and `next.config.ts`.
