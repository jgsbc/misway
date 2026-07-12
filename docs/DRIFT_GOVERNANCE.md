# MISWAY Drift — Living World governance

## Purpose

This document governs how the production Drift world evolves. `/drift` is already the delivered R3F / Three.js experience; governance now protects its artistic contract, runtime integrity and progressive Living World evolution.

## Principle

> Strong vision, cold execution.
> One approved artistic contract, one bounded lot, one validated result.

## Authorities

- **Owner / creative director:** validates meaning, track truth, artistic contracts and acceptance.
- **Agents:** audit and implement within the approved contract. They do not reinterpret tracks or change doctrine inside an implementation lot.

The documentary hierarchy and conflict rules are defined in `DRIFT_DOCUMENTATION_MAP.md`.

## Mandatory read pack

Before every Drift lot, read:

1. `AGENTS.md`
2. `docs/ACTIVE_LOT.md`
3. `docs/DRIFT_DOCUMENTATION_MAP.md`
4. `docs/DRIFT_GOVERNANCE.md`
5. `docs/DRIFT_3D_PRODUCT_SPEC.md`
6. `docs/DRIFT_3D_LIVING_WORLD_BIBLE.md`
7. `docs/DRIFT_3D_LIVING_TRACK_MATRIX.md`
8. `docs/DRIFT_BACKLOG.md`
9. `docs/DECISIONS_LOG.md`

Then read the Realism Bible, Color Script, runtime architecture and code files required by the lot.

## Lot contract

Every lot must state:

- one objective;
- scope in and scope out;
- approved artistic contract;
- technical contract and protected subsystems;
- files allowed and forbidden;
- acceptance criteria;
- automated validation and manual QA;
- stop conditions;
- expected documentation updates.

No generalization is allowed before a vertical slice has been accepted.

## Gates

1. **Artistic contract:** the owner-approved track/world contract is explicit.
2. **Technical contract:** runtime boundaries, budgets and protected systems are explicit.
3. **Minimal patch:** only the smallest coherent implementation is changed.
4. **Automated validation:** lint, build, targeted checks and diff integrity pass.
5. **Visual and behavioral QA:** desktop, mobile, reduced motion, audio intent and performance are checked as relevant.
6. **Owner acceptance:** the owner assigns an acceptance status.

A failed gate stops the lot. Later lots do not begin until the current result is accepted or explicitly re-scoped.

## Execution rules

- One lot equals one objective.
- Scope in and scope out are mandatory.
- Do not change doctrine in an implementation lot.
- Do not reinterpret tracks; use the Living Track Matrix.
- Do not refactor opportunistically or expand scope silently.
- Do not create abstractions or dependencies without a demonstrated lot need and explicit approval.
- Preserve `/drift` as the production 3D route and keep historical/prototype routes truthful.
- Protect the global audio provider as the single source of track playback truth.
- Track playback requires explicit user action. Never add a second `<audio>` for tracks.
- Mobile usability, performance, accessibility and reduced motion are permanent constraints.
- Static export and production `basePath` compatibility are mandatory.
- Update each document only according to its role in the documentation map.
- Report validation honestly; missing visual or device proof remains a stated gap.

## Runtime protections

### Audio

- Use the existing global provider for track playback.
- Preserve play/pause, seek, loop, next/previous and cross-route continuity.
- No proximity autoplay or unexpected track replacement.
- Diegetic ambience remains opt-in and must not compete with the music.

### Mobile, accessibility and performance

- Preserve touch usability and safe-area control placement.
- Preserve a usable reduced-motion path and WebGL fallback.
- Keep essential content reachable outside precision driving.
- Measure representative heavy scenes before increasing world density.
- Stop on material frame-rate, draw-call, memory or loading regression.

### Delivery

- Preserve `output: "export"`, trailing-slash routing and production base-path behavior.
- No server-only requirement may be introduced without a separately approved product decision.

## Documentation rules

- Product state belongs in `DRIFT_3D_PRODUCT_SPEC.md`.
- Artistic and behavioral doctrine belongs in the Living World Bible.
- Track contracts belong in the Living Track Matrix.
- Physical grounding belongs in the Realism Bible.
- Palette, light, weather and transitions belong in the Color Script.
- Execution sequencing belongs in the backlog and active lot.
- Durable decisions and deviations belong in the decision log.
- Delivered runtime truth remains verifiable in code.

Historical documents keep provenance but must display their status and replacement clearly.

## Acceptance statuses

- `ACCEPTED` — all required gates pass; the result may become a dependency.
- `ACCEPTED_WITH_FOLLOW_UP` — usable result accepted with bounded follow-up recorded.
- `REWORK_REQUIRED` — contract remains valid but the result needs another pass.
- `REJECTED` — result or contract is not suitable and must not guide later work.

## Stop conditions

Stop and report if:

- owner meaning or track truth is ambiguous;
- artistic authorities conflict and the documentation map does not resolve it;
- audio continuity or explicit playback is at risk;
- mobile, reduced-motion, accessibility or fallback behavior regresses;
- performance evidence exceeds the approved budget;
- static export or `basePath` behavior is uncertain;
- a patch needs unrelated refactoring or scope expansion;
- visual/behavioral QA cannot substantiate the acceptance claim.

## Lot report

Each lot ends with status, objective achieved, exact files changed, automated validation, manual QA, risks, documentation updates, acceptance decision and next-lot readiness.
