# MISWAY Drift — Living World director backlog

This backlog sequences the approved governance and Living World evolution. It does not assert that living objects, cue sheets or session memory are already implemented. Detailed artistic behavior remains authoritative only in the Living World Bible and Living Track Matrix.

## DRIFT-GOV-00 — Adopt Living World governance

- **Objective:** align documentary governance with the delivered 3D production world and adopt the Living World authorities.
- **Indicative scope:** documentation hierarchy, product truth, roles, backlog, historical statuses, Color Script, repository guidance and PR template.
- **Out of scope:** runtime, assets, dependencies, route/audio/topology changes, and `DRIFT-LW-AUDIT-00` execution.
- **Acceptance:** `/drift` documented as production 3D; new authority chain is explicit; old documents are classified; 26-track Color Script contract; active lot contains one lot; documentation-only diff.
- **Validation:** `git diff --check`, scope/status searches, file-presence checks, `npm run lint`, `npm run build`.
- **Stop conditions:** missing owner documents, runtime diff, lost decision history, unresolved authority conflict, lint/build failure.
- **Next lot:** `DRIFT-LW-AUDIT-00`.

## DRIFT-LW-AUDIT-00 — Technical preparatory audit

- **Objective:** map the current runtime against the Living World contracts and identify the smallest safe implementation surface.
- **Indicative scope:** read-only audit of world state, scene loop, audio state, data boundaries, existing effects, mobile/reduced-motion paths and budgets.
- **Out of scope:** code changes, new systems, cue implementation, memory implementation and track reinterpretation.
- **Acceptance:** confirmed facts vs gaps; protected subsystems; feasible core boundary; vertical-slice prerequisites; explicit blockers and evidence.
- **Validation:** source inventory, static/build evidence available at audit time, targeted runtime observations without mutation.
- **Stop conditions:** documentary contradiction, unverifiable audio contract, unclear owner intent, or missing performance baseline.
- **Next lot:** `DRIFT-LW-CORE-00` if accepted.

## DRIFT-LW-CORE-00 — Minimal Living World core

- **Objective:** implement only the bounded shared state/behavior substrate proven necessary by the audit.
- **Indicative scope:** minimum world-object lifecycle and safe inactive/default behavior described by the Living World Bible.
- **Out of scope:** broad content rollout, track reinterpretation, full cue sheets, session memory and premature generalization.
- **Acceptance:** one bounded contract works without changing track playback truth; safe reset/fallback; targeted tests; mobile/reduced-motion/performance gates pass.
- **Validation:** targeted tests, lint, build, desktop/mobile/reduced-motion QA, representative performance evidence.
- **Stop conditions:** speculative framework, hidden global side effects, audio-provider risk, or failure to degrade safely.
- **Next lot:** `DRIFT-LW-EUX-IDENTITY-00`.

## DRIFT-LW-EUX-IDENTITY-00 — EUX GAINENT singular identity contract

- **Objective:** define the authoritative track-specific visual, narrative, spatial and behavioral identity that turns the accepted local gym scaffold into a singular MISWAY scene contract.
- **Indicative scope:** North Star, performance-as-production dramaturgy, anomaly hierarchy, maximum three signature objects, distinct A/B/C athlete roles, music-moment mapping, cue candidates without timing, reduced-motion/mobile contracts and uniqueness gates.
- **Out of scope:** runtime or asset changes, cue timestamps, player/audio/topology/collider changes, headlights implementation, memory and the final vertical slice.
- **Acceptance:** the scene is no longer defined by generic athlete/treadmill motion; machines training and classifying people is the central inversion; cues are ready for an owner listening pass; owner review remains explicit.
- **Validation:** documentation-only diff, no runtime path, no invented timestamps, forbidden generic imagery confined to `DO NOT DO`, documentation hierarchy and lot sequence consistent.
- **Stop conditions:** contradiction with the Living Track Matrix, more than three signature objects, invented musical timing, reusable generic scene language, runtime diff or loss of mobile/reduced-motion meaning.
- **Next lot:** `DRIFT-LW-CUES-00` after owner identity acceptance and timestamp validation.

## DRIFT-LW-CUES-00 — Governed musical cue substrate

- **Objective:** establish the smallest cue mechanism required by the approved vertical slices.
- **Indicative scope:** cue contracts derived from the Living Track Matrix, explicit playback-state observation and deterministic visual/behavioral response.
- **Out of scope:** invented cue timing, audio analysis not approved by the owner, autoplay and complete 26-track rollout.
- **Acceptance:** cues are data-driven, bounded, resettable, silent when no track is played, and do not bypass the global provider.
- **Validation:** targeted cue/state tests, audio manual QA, lint/build, mobile/reduced-motion/performance checks.
- **Stop conditions:** cue data absent or ambiguous, provider bypass, playback regression, or world response that competes with music.
- **Next lot:** `DRIFT-LW-MEMORY-00`.

## DRIFT-LW-MEMORY-00 — Bounded session memory

- **Objective:** implement only the session-memory behavior approved by the Living World Bible.
- **Indicative scope:** ephemeral visit/session state and visible manifestations required by the selected slices.
- **Out of scope:** account persistence, server/database storage, analytics identity, cross-device memory and unapproved personalization.
- **Acceptance:** scope and lifetime are truthful; reset is defined; no personal data; fallback remains coherent; tests cover state boundaries.
- **Validation:** targeted state tests, route/session manual QA, lint/build, mobile/reduced-motion/performance checks.
- **Stop conditions:** persistence expectations exceed the approved contract, privacy ambiguity, or memory cannot be reset safely.
- **Next lot:** `DRIFT-LW-VS1-EUX-GAINENT`.

## DRIFT-LW-VS1-EUX-GAINENT — Vertical slice 1

- **Objective:** deliver the owner-approved `eux-gainent` Living Track contract end to end.
- **Indicative scope:** only the initial state, central anomaly, signature situation, approved cue reaction and hidden interaction defined in the Living Track Matrix.
- **Out of scope:** other tracks, generalized rollout and additional creative interpretation.
- **Acceptance:** scene is physically credible, track contract is recognizable, explicit audio is preserved, reset/fallback works, and owner acceptance is recorded.
- **Validation:** targeted tests, lint/build, desktop/mobile/reduced-motion visual and behavioral QA, audio QA and performance evidence.
- **Stop conditions:** contract ambiguity, visual mismatch, audio regression, mobile/accessibility failure or budget breach.
- **Next lot:** `DRIFT-LW-VS2-MORNE-ET`.

## DRIFT-LW-VS2-MORNE-ET — Vertical slice 2

- **Objective:** deliver the owner-approved `morne-et` Living Track contract end to end.
- **Indicative scope:** only matrix-defined initial/transformed states, anomaly, signature interaction, cue response and reset.
- **Out of scope:** other tracks, new doctrine and industrialized rollout.
- **Acceptance:** the approved routine-to-disruption contract reads clearly, protected systems hold, and owner acceptance is recorded.
- **Validation:** targeted tests, lint/build, desktop/mobile/reduced-motion visual and behavioral QA, audio QA and performance evidence.
- **Stop conditions:** same as VS1, plus failure to contain/reset the zone-wide transformation.
- **Next lot:** `DRIFT-LW-VS3-ETEEAOOETE`.

## DRIFT-LW-VS3-ETEEAOOETE — Vertical slice 3

- **Objective:** deliver the owner-approved `eteeaooete` Living Track contract end to end.
- **Indicative scope:** only matrix-defined ocean memory, λ situation, cue response, hidden interaction and reset.
- **Out of scope:** other tracks, invented memories, persistent user history and industrialized rollout.
- **Acceptance:** the approved ritual remains physically grounded and readable; memory is bounded; protected systems and owner acceptance pass.
- **Validation:** targeted tests, lint/build, desktop/mobile/reduced-motion visual and behavioral QA, audio QA and performance evidence.
- **Stop conditions:** memory exceeds approved session scope, cue/visual contract is invented, fallback fails or performance budget is breached.
- **Next lot:** `DRIFT-LW-INDUSTRIALIZATION-GATE`.

## DRIFT-LW-INDUSTRIALIZATION-GATE — Reuse decision

- **Objective:** decide, from three accepted slices, what may safely be generalized and whether rollout should continue.
- **Indicative scope:** compare proven contracts, performance, authoring cost, behavior reuse, failure modes and owner feedback.
- **Out of scope:** automatic 26-track rollout, new artistic doctrine and opportunistic refactor.
- **Acceptance:** explicit reuse/no-reuse decisions; bounded architecture proposal; revised budgets; prioritized next track wave; owner decision recorded.
- **Validation:** cross-slice regression evidence, lint/build, representative desktop/mobile/reduced-motion/performance QA and documentation consistency.
- **Stop conditions:** a slice is unaccepted, evidence is incomplete, commonality is only speculative, or industrialization would flatten track identity.
- **Next lot:** defined only after owner acceptance.
