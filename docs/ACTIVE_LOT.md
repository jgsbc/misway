# ACTIVE_LOT.md

Current lot:
DRIFT-IV-BASE-00 — Capture runtime baseline

Status:
REWORK_REQUIRED — FOREGROUND EVIDENCE MISSING

Baseline:
main@02b4fb2 (contains DRIFT-IV-GOV-30, merged)

Type:
Documentation and runtime measurement only

Completed:
- `docs/DRIFT_3D_RUNTIME_BASELINE.md` created — real architecture inventory (`src/components/drift-3d/`, `src/lib/drift3d*`), build/lint validation, partial live browser verification of the `/drift` golden path;
- console clean, chunk/module loading, single-canvas WebGL context, opt-in ambiance (no autoplay) and mobile tutorial-hiding confirmed live;
- no-WebGL and reduced-motion fallback paths reviewed by source code only (`Drift3DClient.tsx`) — not triggered live;
- six historical runtime candidates deferred to `DRIFT-IV-BASE-00` by `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md` requalified with zero code ported: `Drift3DWorldEdges.tsx` / `drift3dRivers.ts` / scatter river-exclusion hunk / `Drift3DScene.tsx` WorldEdges-mount hunk → `ARCHITECTURAL_PORT_REJECTED — DO NOT BLIND PORT`; `drift3dLandmarks.ts` track-flavor props hunk → `DO NOT CHERRY-PICK — REASSESS LOCALLY IN RELEVANT TRACK BUILDS`; `Drift3DScatterField.tsx` wind hunk → `CANDIDATE_FOR_FUTURE_ENHANCEMENT`, destined to a future `GLOB-*` harmonization lot if pursued, no new identifier created;
- performance values from `DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md` §9 (mobile ≥30 fps, desktop ≥50 fps, ≤300 draw calls, ≤1.5M triangles) relabeled as `PERFORMANCE ACCEPTANCE TARGETS — NOT CURRENT RUNTIME MEASUREMENTS`, not a measured baseline.

Not completed — blocks `DONE`:
- real fps;
- real draw calls;
- real triangles;
- desktop visual screenshot;
- mobile visual verification;
- real reduced-motion trigger;
- real no-WebGL trigger.

These seven items must be captured in a foreground browser session (not this automated preview environment, which reports `document.hidden === true` and cannot render a stable frame) and recorded in the evidence matrix at `docs/DRIFT_3D_RUNTIME_BASELINE.md` §8 before this lot can become `DONE`.

Protected scope:
- no src/**
- no public/**
- no runtime code changes
- no audio
- no assets
- no dependencies
- no config
- no cue timestamps changed
- no artistic contract changes
- no branch history changes
- no stash application

Next lot:
DRIFT-IV-BASE-00 — Complete runtime evidence

Next status:
CONTINUE_CURRENT_LOT
