# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-20 — Cue resolver harness

Status:
DONE — PENDING MERGE

Baseline:
main@0c44995 (contains DRIFT-IV-SYS-10, merged, PR #23)

Type:
Runtime service (generic cue resolver) + dev harness + documentation

Completed:
- `src/lib/drift3dCueResolver.ts` created — framework-agnostic, DOM-agnostic, track-agnostic, cue-agnostic pure resolver. `Drift3DCuePhase`/`Drift3DCueResolution`/`Drift3DCueClockResolution` types; `getDrift3DCueTimelineIssues` (validates empty/duplicate ids, non-finite/negative boundaries, `end <= start`, unsorted order, overlap — gaps are explicitly allowed and never flagged); `resolveDrift3DCueAtTime` (pure `f(timeline, absoluteTime)`, never `f(previousState, deltaTime)` — no previous phase, no accumulated progress, no mutable cursor kept between calls); `resolveDrift3DCueFromAudioClock` (reads `readDrift3DAudioClockTime`, resolves from absolute time, copies `sourceKind`/`sourceSlug`/`playbackState`/`timelineRevision` from the snapshot as-is). Intermediate phases use `[start, end)`; only the last phase also accepts its exact `endTimeSeconds` (closed interval), so `phaseProgress` reaches exactly `1` at a track's precise end. No timer, no React, no DOM, no track/slug/cue vocabulary — does not modify `drift3dAudioClock.ts` or `drift3dSceneLifecycle.ts`;
- `Drift3DCanvas.tsx` integrated — a dev-only `useEffect` installs `window.__drift3dCueResolver` (`Object.freeze`d: `validate(phases)`, `resolveAt(phases, timeSeconds, durationSeconds, timelineRevision?)`, `resolveCurrent(phases)`), available immediately since it lives outside the react-three-fiber tree (no dependency on Canvas mount or `requestAnimationFrame`, unlike the SYS-00/SYS-10 probes). Cleanup uses a simple reference-identity check (`window.__drift3dCueResolver === probe`) rather than the SYS-10 ownership `Map` — no second generic probe registry introduced. No `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` for this probe;
- `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`, explicitly states `DRIFT-IV-SYS-20` delivers no real track Cue Map and no track runtime;
- real behavioral evidence captured in a real Chrome session (`docs/evidence/DRIFT-IV-SYS-20/`) on a fully synthetic timeline (`probe-a`/`probe-b`/`probe-c`, no artistic meaning): timeline validation (valid-with-gap → 0 issues; seven invalid fixtures each detected with the exact expected issue type), deterministic boundaries (`t=0,2.5,4.999,5,10,12,20,25` all exactly matching spec, including the closed-interval last-phase boundary and the gap at `t=10`), AudioClock integration (real `sourceSlug: "foolfoule"`, real `durationSeconds`, zero hardcoded track reference in the resolver), direct reconstruction after a forward seek (`timelineRevision` +1 exact, `resolveAt` output identical to `resolveCurrent`) and a backward seek (+1 exact, no intermediate-phase replay), pause/resume (exact freeze over a real 2s wait, resume without wall-clock catch-up), restart (+1 exact, `absoluteTimeSeconds` back to exactly `0`, source unchanged), source-change (+1 exact, `sourceSlug` changes, documented duration fallback observed live), probe cleanup/remount (absent while unmounted, a genuinely new object on remount, global playback never interrupted), and both fallbacks (reduced-motion, no-WebGL — each leaving zero residual probe) — all real, all PASS.

An environment incident (a long-lived dev server process from an earlier session became unresponsive) was diagnosed, resolved by restarting the server, and is documented transparently in the evidence — it produced 4 console errors during the incident itself and zero afterward, unrelated to this lot's code.

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/AudioPlayerProvider.tsx, no src/lib/drift3dAudioClock.ts, no src/lib/drift3dSceneLifecycle.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no track identity contract, no Cue Map, no era contract, no artistic bible touched
- no real Cue Map, no artistic phase name, no track-scene activation, no track-specific animation, no EUX GAINENT runtime, no signature arbitration, no quality tier, no residue/memory, no era transition, no FFT/beat-detection/spectral analysis, no second player, no new audio system, no new shared dramaturgy abstraction

Next lot:
DRIFT-IV-SYS-30 — Signature arbitration

Next status:
NEXT_AFTER_MERGE
