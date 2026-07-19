# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-50 — Reduced-motion contract

Status:
DONE — PENDING MERGE

Baseline:
main@652d7be (contains DRIFT-IV-SYS-40, merged, PR #27)

Type:
Runtime service (generic reduced-motion accessibility contract) + minimal shell integration + dev harness + documentation

Completed:
- `src/lib/drift3dReducedMotion.ts` created — framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic, cue-agnostic, scene-agnostic, quality-tier-agnostic, WebGL-agnostic pure reduced-motion service. Reduced motion is an accessibility contract, never a Quality Tier, never `LOW`, never a performance policy, never an alternate art direction. Two canonical `Drift3DReducedMotionMode`s (`"standard" | "reduced"`), each resolved deterministically from a boolean via `resolveDrift3DReducedMotionMode` (no `matchMedia` read inside the module). Two canonical `Drift3DReducedMotionPolicy` objects, each `Object.freeze`d on the policy, its `motion` and its `meaning` — no module-scope mutable `Map`/`Set`, only a frozen object and a frozen tuple. `Drift3DReducedMotionCapabilities` (`allowCameraShake`/`allowForcedCameraTravel`/`allowRapidPulsation`/`allowAggressiveMotion`/`allowSlowTransitions`): `standard` keeps all five `true`; `reduced` sets the first four `false` and keeps `allowSlowTransitions: true`. `Drift3DReducedMotionMeaningGuarantees` (`poses`/`states`/`lighting`/`materials`/`beforeAfter`) are literally typed `true`, never `boolean`, identical on both modes. `isDrift3DReducedMotionMode`, `getDrift3DReducedMotionPolicy` (typed mode, no silent fallback), `getDrift3DReducedMotionPolicyIssues`/`getDrift3DCanonicalReducedMotionIssues` (invalid mode, motion-capability mismatch against the declared mode's canonical pattern, meaning guarantee not `true`). No numeric millisecond duration, speed multiplier, frequency threshold or amplitude is invented. Does not import `drift3dQuality.ts`, `drift3dAudioClock.ts`, `drift3dSceneLifecycle.ts`, `drift3dCueResolver.ts`, `drift3dSignatureArbitration.ts` or `tracks.ts`;
- `Drift3DClient.tsx` integrated minimally — the existing `window.matchMedia("(prefers-reduced-motion: reduce)")` listener is preserved as-is; a new `reducedMotionMode` value formalizes the boolean → mode translation via `resolveDrift3DReducedMotionMode`, and `fallbackReason` now branches on `reducedMotionMode === "reduced"` instead of the raw boolean — behavior is identical to before this lot. A dev-only `useEffect` installs `window.__drift3dReducedMotion` (`Object.freeze`d: `modes`, `resolveMode(prefersReducedMotion)`, `getPolicy(mode)`, `validate(policy)`, `validateCanonical()`) at the shell level (`Drift3DClient`, not `Drift3DCanvas`) precisely because the `Canvas` is intentionally absent whenever reduced motion is active — a probe installed there would disappear exactly when it is most useful to inspect. No `setTier`/`applyTier`/`setReducedMotion`/`forceReduced`/`disableMotion`. `canUseWebGL()` and the audio logic are untouched; no Quality Tier is added; the `Canvas` is never opened in `reduced` mode;
- `docs/DRIFT_3D_REDUCED_MOTION_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`, explicitly states reduced motion = accessibility never quality, `matchMedia` stays in `Drift3DClient`, the current shell's reduced → fallback/no-Canvas behavior is unchanged and intentional, `SYS-50` does not deliver a 3D reduced-motion version of the 26 tracks, and reserves `SYS-60` ownership of the no-WebGL narrative path;
- real behavioral evidence captured in a real Chrome session (`docs/evidence/DRIFT-IV-SYS-50/`), separated into `PURE CONTRACT EVIDENCE` (deterministic mode resolution; canonical policies valid and runtime-immutable, unchanged after a controlled mutation attempt; `reduced` invariants — shake/forced-travel/rapid-pulsation/aggressive-motion forbidden, slow transitions kept, all five meaning guarantees `true`; `standard` invariants — all five capabilities kept; twelve invalid fixtures (1 invalid mode, 5 `reduced` motion-capability mismatches, 1 `standard` motion-capability mismatch, 5 meaning-guarantee failures) each detected with the exact expected issue type, canonical policies never mutated), `REAL SHELL BEHAVIOR` (standard runtime unchanged — `canvasCount=1`, `audioCount=1`, all four dev probes present, no autoplay; real reduced-motion runtime — `canvasCount=0`, `audioCount=1`, only the reduced-motion probe present, correct fallback copy, `Open 2D Lab` accessible, no autoplay; live preference change — `Canvas` cleanly mounted/unmounted in both directions via a controllable fake `MediaQueryList`, the shell-level probe staying the exact same instance throughout since its effect does not re-run on a preference change; global audio genuinely measured to keep playing, uninterrupted, through the reduced-motion fallback when a track was explicitly launched beforehand; no-WebGl fallback distinct from reduced-motion, reduced-motion probe still present; probe cleanup/remount on the standard path — absent while unmounted, a genuinely new object on remount), and `STRUCTURAL EVIDENCE` (zero occurrence of Quality Tier vocabulary or artistic vocabulary in the module; `Drift3DFallback.tsx`/`Drift3DCanvas.tsx`/`Drift3DScene.tsx`/`drift3dQuality.ts` all confirmed untouched) — all real, all PASS, zero console errors across the entire session.

No environment incident was encountered in this lot.

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/AudioPlayerProvider.tsx
- no src/components/drift-3d/Drift3DFallback.tsx, no Drift3DCanvas.tsx, no Drift3DScene.tsx, no Drift3DScatterField.tsx, no Drift3DEffects.tsx, no Drift3DLandmark.tsx
- no src/lib/drift3dQuality.ts, no drift3dAudioClock.ts, no drift3dSceneLifecycle.ts, no drift3dCueResolver.ts, no drift3dSignatureArbitration.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no track identity contract, no Cue Map, no era contract, no artistic bible touched
- no real track reduced-motion 3D scene, no Cue Map reduced-motion, no phase-to-pose mapping, no alternate track animation, no Canvas opened in reduced mode, no real camera change, no real shader/material change, no Drift3DFallback UI change, no new illustration, no Quality Tier change, no no-WebGL fallback change, no device/performance logic, no new user UI, no persisted preference, no "reduce motion" button

Next lot:
DRIFT-IV-SYS-60 — No-WebGL narrative path

Next status:
NEXT_AFTER_MERGE
