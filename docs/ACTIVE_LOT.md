# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-40 — Quality tiers preserving identity

Status:
DONE — PENDING MERGE

Baseline:
main@393cb83 (contains DRIFT-IV-SYS-30, merged, PR #26)

Type:
Runtime service (generic identity-preserving quality tiers) + dev harness + documentation

Completed:
- `src/lib/drift3dQuality.ts` created — framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic, cue-agnostic, scene-agnostic pure quality-tier service. `Drift3DQualityTier = "low" | "medium" | "high"` names a rendering capacity budget only, never an artistic quality judgment. Three canonical `Drift3DQualityProfile`s (`low`/`medium`/`high`), each `Object.freeze`d on the profile, its `capabilities` and its `identity` — no module-scope mutable `Map`/`Set`, only a frozen object and a frozen tuple. `Drift3DQualityCapabilities` has seven ratios (`populationScale`, `scatterScale`, `dynamicTextureResolutionScale`, `renderProbeScale`, `reflectionResolutionScale`, `backgroundDetailScale`, `secondaryLoopScale`), each in `]0,1]`, canonical values `LOW`/`MEDIUM`/`HIGH` = `0.40/0.70/1`, `0.50/0.75/1`, `0.50/0.75/1`, `0.50/0.75/1`, `0.50/0.75/1`, `0.50/0.75/1`, `0.35/0.65/1`. `Drift3DQualityIdentityGuarantees` (`worldTopology`/`coreNavigation`/`signatureObjects`/`primaryCue`) are literally typed `true`, never `boolean` — identity is complete in all three tiers. `isDrift3DQualityTier`, `getDrift3DQualityProfile` (typed tier, no silent fallback), `getDrift3DQualityProfileIssues`/`getDrift3DQualityProfileSetIssues`/`getDrift3DCanonicalQualityIssues` (empty/duplicate/missing tier, non-finite/non-positive/>1 capability, identity guarantee not `true`, monotonicity `LOW <= MEDIUM <= HIGH`, `HIGH === 1`), and pure helpers `scaleDrift3DQualityCount`/`scaleDrift3DQualityDimension` (integer, `Math.floor`, clamped to `[minimum, base]`, never `NaN`/`Infinity`, mutate nothing). Does not import `drift3dAudioClock.ts`, `drift3dCueResolver.ts`, `drift3dSceneLifecycle.ts`, `drift3dSignatureArbitration.ts` or `tracks.ts`; no device/browser sniffing of any kind; no auto-selection function of any kind;
- `Drift3DCanvas.tsx` integrated — a dev-only `useEffect` installs `window.__drift3dQuality` (`Object.freeze`d: `tiers`, `getProfile(tier)`, `validate(profile)`, `validateCanonical()`, `validateSet(profiles)`, `scaleCount(baseCount, tier, capability, minimumCount?)`, `scaleDimension(baseDimension, tier, capability, minimumDimension?)`), available immediately since it lives outside the react-three-fiber tree, using the same simple reference-identity cleanup already established for the `SYS-20`/`SYS-30` probes. No `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` for this probe. Pure addition to `Drift3DCanvas.tsx` — no new React state for an active quality, no `setTier`/`applyTier`/`forceLow`/`forceHigh`, and no scene (`Drift3DScene`/`Drift3DScatterField`/`Drift3DEffects`/`Drift3DLandmark`) receives any quality wiring in this lot — none of those five files were modified;
- `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`, explicitly states quality = capacities never style, mobile/reduced-motion/no-WebGL are never assimilated to `LOW`, `SYS-40` delivers no real visual application, no auto-selection, no device detection, and reserves `SYS-50`/`SYS-60` ownership of the reduced-motion contract and no-WebGL narrative path;
- real behavioral evidence captured in a real Chrome session (`docs/evidence/DRIFT-IV-SYS-40/`) on fully synthetic bases (`130`/`2400`/`512`, `probe-*` fixtures, no artistic meaning): canonical profiles valid (zero issues, individually and collectively), runtime immutability (`Object.isFrozen` true on profile/capabilities/identity for all three tiers, canonical profile unchanged after a controlled mutation attempt), monotonicity verified on all seven capabilities, identity strictly identical (serialized equality) across the three tiers, deterministic count reduction (`130 → 52/91/130`, `2400 → 1200/1800/2400`) and dimension reduction (`512 → 256/384/512`), invalid-fixture detection (zero/negative/`>1`/infinite/`NaN` capability, identity guarantee `false`, invalid tier, and a synthetic non-monotone profile set built without touching the real canonical profiles), structural absence of device policy, and structural absence of functional style properties or logic (the module's header comment names "palette", "color script" and "fog" only to state they never appear functionally — see evidence Test I), current runtime unchanged (`canvasCount=1`, `audioCount=1`, probe limited to calculation methods), probe cleanup/remount (absent while unmounted, a genuinely new object on remount, no autoplay), and both fallbacks (reduced-motion, no-WebGL — each leaving zero residual probe) — all real, all PASS, zero console errors across the entire session.

No environment incident was encountered in this lot.

Correction during this lot (pre-evidence, same session): the initial harness only exposed `validateCanonical()` (real canonical profiles only); a `validateSet(profiles)` method was added to the probe so Test G's synthetic non-monotone fixture could be checked without ever modifying the real canonical profiles — documented in the contract (§20) and reflected in the evidence.

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/AudioPlayerProvider.tsx, no src/lib/drift3dAudioClock.ts, no src/lib/drift3dSceneLifecycle.ts, no src/lib/drift3dCueResolver.ts, no src/lib/drift3dSignatureArbitration.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no src/components/drift-3d/Drift3DScene.tsx, no Drift3DScatterField.tsx, no Drift3DEffects.tsx, no Drift3DLandmark.tsx, no drift3dTextureFactory.ts
- no track identity contract, no Cue Map, no era contract, no artistic bible touched
- no GPU auto-detection, no automatic benchmark, no automatic FPS downgrade, no adaptive algorithm, no hysteresis, no mid-session tier change, no user preference, no mobile/browser sniffing, no deviceMemory/hardwareConcurrency detection, no devicePixelRatio rule, no new menu, no visual modification of the current world, no reduced-motion policy, no no-WebGL policy

Next lot:
DRIFT-IV-SYS-50 — Reduced-motion contract

Next status:
NEXT_AFTER_MERGE
