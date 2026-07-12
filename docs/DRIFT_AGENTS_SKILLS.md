# MISWAY Drift — roles and operating skills

## Purpose

These are review roles for bounded Drift lots. They do not create runtime agents. Each role protects one part of the approved Living World contract and may stop work when its boundary is at risk.

## MISWAY_PRODUCT_AND_CREATIVE_OWNER

**Mission:** approve product meaning, artistic direction and track truth.

**Protects:** MISWAY identity, product usefulness, Living World doctrine, track interpretation and final acceptance.

**Verifies:** the lot serves the music; the artistic contract is owner-approved; the result matches the intended track; scope is worth shipping.

**Stop conditions:** invented track meaning, doctrine drift, unapproved product capability, or a result that makes the world louder but not stronger.

**Expected output:** approved contract and one of `ACCEPTED`, `ACCEPTED_WITH_FOLLOW_UP`, `REWORK_REQUIRED`, `REJECTED`.

## MISWAY_WORLD_DIRECTOR

**Mission:** translate the approved Living World and track contract into a coherent visual, narrative and behavioral result.

**Protects:** contaminated realism, readable situations, controlled humor, era progression, silhouettes and the single central anomaly per track.

**Verifies:** Living World Bible and Living Track Matrix alignment; initial/transformed states; graphic surfaces; signature situation; physical grounding and Color Script consistency.

**Stop conditions:** multiple competing anomalies, decorative randomness, generic game language, contradiction with the track contract, or loss of physical credibility.

**Expected output:** a bounded scene/behavior contract with visual QA criteria.

## MISWAY_LIVING_SYSTEMS_ARCHITECT

**Mission:** design the smallest reusable behavior needed for accepted living-world slices.

**Protects:** bounded systems, deterministic state, honest session-memory scope, cue/state separation and maintainable runtime boundaries.

**Verifies:** no generalization before a vertical slice; conceptual contracts map cleanly to code; inactive states are safe; memory and reactions do not claim persistence that does not exist.

**Stop conditions:** speculative framework, hidden global state, premature industrialization, unbounded behavior loops, or a system that cannot degrade safely.

**Expected output:** minimal technical contract, data/state boundaries, fallback behavior and targeted tests.

## MISWAY_MUSICAL_INTERACTION_DIRECTOR

**Mission:** protect the relationship between explicit listening and world reaction.

**Protects:** global audio provider, user intent, cue contracts, track continuity, silence and opt-in diegetic ambience.

**Verifies:** no second track `<audio>`; explicit play; cue behavior comes from approved track contracts; pause/seek/route changes remain coherent; ambience never impersonates track playback.

**Stop conditions:** autoplay/proximity switching, provider bypass, playback regression, invented cue data, or world audio competing with the track.

**Expected output:** cue contract, audio-safety checklist and manual playback QA.

## MISWAY_3D_TECH_AND_PERFORMANCE_GUARDIAN

**Mission:** protect the delivered R3F / Three.js world, its physical behavior and its operating budgets.

**Protects:** vehicle, terrain, physics, topology, landmarks, scatter, camera, WebGL fallback, mobile controls, reduced motion, static export and `basePath`.

**Verifies:** minimal diff; representative desktop/mobile performance; disposal and bounded animation; touch/keyboard path; fallback behavior; build/export compatibility.

**Stop conditions:** frame-rate or draw-call regression beyond budget, mobile control conflict, inaccessible essential flow, broken fallback, static-export uncertainty, or unrelated refactor.

**Expected output:** implementation review with measurements, automated results and explicit untested risks.

## MISWAY_RELEASE_MANAGER

**Mission:** enforce lot order, scope, evidence, documentation roles and owner acceptance.

**Protects:** traceability, working-tree integrity, acceptance gates, historical decisions and next-lot discipline.

**Verifies:** active lot matches the request; allowed files only; all gates have evidence; decision log is append-only; documentation map remains coherent.

**Stop conditions:** wrong lot, out-of-scope file, missing validation, claimed QA not performed, unresolved conflict, or attempt to start the next lot early.

**Expected output:** concise release report, acceptance status, risks and next-lot `READY`/`BLOCKED`.

## Operating skills

### DRIFT_READ_ONLY_AUDIT

Read code, runtime evidence and current authorities; change nothing; distinguish facts, assumptions, gaps and recommended next action.

### DRIFT_BOUNDED_PATCH

Implement one approved objective with scope in/out, no opportunistic refactor, immediate targeted validation and exact diff reporting.

### DRIFT_AUDIO_SAFE_CHANGE

Use the global provider; keep track playback explicit; never add a second track audio element; test play/pause, seek, loop, next/previous and route continuity.

### DRIFT_LIVING_VERTICAL_SLICE

Implement one approved track contract end to end before extracting common systems. Validate initial state, signature transformation, cue response, reset/fallback, mobile, reduced motion and performance.

### DRIFT_MOBILE_AND_REDUCED_MOTION_QA

Check portrait touch controls, safe areas, readable HUD, fallback access, reduced-motion behavior and conflicts with the global player.

### DRIFT_STATIC_EXPORT_GATE

Run lint/build, inspect exported route behavior where relevant, and verify asset/base-path compatibility without introducing server-only requirements.

## Role activation

| Lot type | Required roles |
|---|---|
| Governance/documentation | Product and Creative Owner, Release Manager |
| Audit | Living Systems Architect, Musical Interaction Director, 3D Tech and Performance Guardian, Release Manager |
| Living World core | World Director, Living Systems Architect, 3D Tech and Performance Guardian |
| Musical cues | Musical Interaction Director, World Director, Living Systems Architect |
| Session memory | Living Systems Architect, Product and Creative Owner, Release Manager |
| Track vertical slice | all roles |
| Industrialization gate | all roles |

## Permanent rules

- Bounded lots and honest validation.
- Track playback remains explicit through the global provider.
- No second `<audio>` for tracks.
- Mobile, reduced motion, performance and static export are required gates.
- The owner validates meaning; agents implement the approved contract.
