# ACTIVE_LOT.md

Current lot:
DRIFT-IV-GOV-30 — Finalize director backlog after era contracts

Status:
DONE — PENDING MERGE

Baseline:
main@84ecf8b or newer verified baseline containing GOV-20

Type:
Documentation and production governance only

Completed:
- mandatory pre-modification audit run and classified (ACTIVE_PRESCRIPTIVE / ACTIVE_STATUS / HISTORICAL_RECORD / ALIAS_REFERENCE / STALE);
- five duplicate lot identifiers retired as `RETIRED_ALIAS — DO NOT EXECUTE` with explicit canonical mapping;
- total canonical executable lots recalculated from 152 to 147;
- Entry special case distinguished: 27 Identity Contracts, 26 track Cue Maps, 1 Entry ambient and transition temporal map, 27 Builds, 27 Acceptances;
- new status vocabulary adopted (DONE, DONE_PENDING_MERGE, SATISFIED_BY_EXISTING_AUTHORITY, READY, PLANNED, BLOCKED_BY_DEPENDENCY, PENDING_OWNER_REVIEW, REWORK_REQUIRED, SKIPPED_BY_GATE, RETIRED_ALIAS);
- EUX GAINENT `-00` / `-10` confirmed `SATISFIED_BY_EXISTING_AUTHORITY`; `-20` / `-30` confirmed unexecuted; no EUX runtime declared delivered;
- `docs/DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md` created as a governance reconciliation record, not a second backlog;
- `docs/DRIFT_3D_INTEGRAL_BACKLOG.md` rewritten to Version 3.0, `ACTIVE — FINALIZED BY DRIFT-IV-GOV-30`, with full canonical catalogue, dependencies, gates and deployment order;
- `AGENTS.md`, `DRIFT_DOCUMENTATION_MAP.md`, `DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md` and `DRIFT_3D_PRODUCT_SPEC.md` updated to canonical identifiers only;
- EUX Identity Contract, EUX Cue Map, Living World Reconciliation and the New Signal era contract updated to canonical identifiers only, no artistic content changed;
- Integral World Program updated with the vertical-slice-is-a-proof-role rule and canonical Phase 1 identifiers; North Star untouched;
- Integral Package Adoption's historical resolution preserved verbatim; a dated GOV-30 note appended after it recording the alias retirement.

Protected scope:
- no src/**
- no public/**
- no runtime
- no audio
- no assets
- no dependencies
- no config
- no cue timestamps changed
- no artistic contract changes
- no branch history changes
- no stash application

Next lot:
DRIFT-IV-BASE-00 — Capture runtime baseline

Next status:
NEXT_AFTER_MERGE
