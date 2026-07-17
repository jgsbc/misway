# ACTIVE_LOT.md

Current lot:
DRIFT-IV-BASE-00 — Complete runtime evidence

Status:
DONE — PENDING MERGE

Baseline:
main@1eaf8c5 (contains DRIFT-IV-BASE-00 partial-baseline PR #20, merged)

Type:
Documentation and runtime measurement only

Completed:
- `docs/DRIFT_3D_RUNTIME_BASELINE.md` updated to `ACTIVE — RUNTIME BASELINE COMPLETE` — real architecture inventory, build/lint validation, live golden-path verification, six historical runtime candidates requalified with zero code ported;
- one real foreground mobile FPS sample adopted and recorded (Foolfoule, 390×844 @ DPR 3, 50.5 fps, 173 draw calls, 197076 triangles, `visibilityState: "visible"`), classified `MEASURED — REAL FOREGROUND MOBILE SAMPLE`;
- a real cross-zone render-cost envelope recorded across Entry Node, A Walk In Zeeland, Foolfoule and ÉTÉÉAOOÉTÉ (draw calls 139–175, triangles 178644–198124), classified `MEASURED CROSS-ZONE ENVELOPE`, both well under the ≤300 draw-call / ≤1.5M triangle ceilings;
- a mobile structural check performed at a genuinely resized 390×844 viewport (no horizontal overflow, single canvas, HUD/ambiance visible, desktop tutorial hidden), classified `AUTOMATED_STRUCTURAL_EVIDENCE`; devicePixelRatio (2.0 observed vs 3 requested) and touch emulation could not be forced — no CDP-level tool was available;
- reduced-motion and no-WebGL fallbacks genuinely triggered in a real foreground browser session (forced via `MediaQueryList`/`getContext` overrides plus a same-document SPA remount) and visually confirmed live, classified `MEASURED — FALLBACK TRIGGERED IN REAL BROWSER SESSION`;
- `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.json` and `runtime-evidence.md` created with the full evidence report, per-scene visual confirmation notes, and an explicit gate decision table;
- absence of a per-zone desktop FPS figure and absence of committed screenshot binaries both explicitly recorded as `KNOWN_ENVIRONMENT_LIMITATION` (never presented as obtained measurements) — the `save_to_disk` screenshot mechanism was verified to produce an unrelated, fixed desktop-level image rather than the driven tab's content;
- performance values from `DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md` §9 kept labelled `PERFORMANCE ACCEPTANCE TARGETS — NOT CURRENT RUNTIME MEASUREMENTS`.

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
DRIFT-IV-SYS-00 — Shared audio-clock service

Next status:
NEXT_AFTER_MERGE
