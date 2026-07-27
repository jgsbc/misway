# ACTIVE_LOT.md

Current lot:
DRIFT-IV-BY-EUX-20 — EUX GAINENT proof-slice Build

Status:
DONE — PENDING MERGE

Baseline:
main@1ce2adb (contains DRIFT-IV-SYS-70, merged, PR #30 — SHARED PRE-GATE FOUNDATION COMPLETE)

Type:
First track-local living scene (EUX GAINENT proof slice) — track-local pure dramaturgy model, R3F living scene consuming shared services (AudioClock, Cue Resolver, Signature Arbitration) without introducing any second engine, static-shell reuse of the existing landmark, static reduced-motion/no-WebGL enrichment scene, dev-only read-only harness, minimal integration, documentation. No artistic/timing decision reopened.

Completed (BY-EUX-20):
- `src/lib/drift3dEuxGainent.ts` created — track-local pure model, consumes `drift3dCueResolver.ts`/`drift3dSignatureArbitration.ts`/`drift3dAudioClock.ts` without ever reintroducing a second cue/dramaturgy engine. Exports the eight canonical phases (`pre-cadence` → `residue`) and seven canonical cues exactly as approved in the Cue Map (never modified), the three athlete role ids (`A`/`B`/`C`, never labeled/colored/costumed in UI), and a single pure entry point `resolveEuxGainentVisualState(absoluteTimeSeconds, phaseId, phaseProgress)` computing per-athlete offset/amplitude/freeze state, the closed vocabulary order (`CADENCE` → `ÉCART` → `CONFORMITÉ` → `RENDEMENT` → `OBJECTIF DÉPLACÉ` → none), the signature window gate (`reference-inversion` only), and the interior reference-frame shift ramping to/from zero around CUE_05's own peak. No memory, no storage, no timer of its own;
- `EuxGainentLivingScene.tsx` created — reuses the existing, byte-for-byte unmodified `birth-eux-gainent-glass-gym` landmark for its static facade/strip/floor slice (`{...sourceLandmark, primitives: sourceLandmark.primitives.slice(0,3)}` rendered through the existing `Drift3DLandmark` component), rebuilds the three station/athlete/bar primitives as ref-driven animated meshes reading their geometry directly from the source primitives (never duplicated numbers), a fixed set of five glass-surface `CanvasTexture`s (one per dominant word), created once at component mount and swapped on one glass surface, disposed on unmount, resolves its narrative from the shared `AudioClock`/`Cue Resolver`/`Signature Arbitration` when inside the zone with EUX GAINENT active, and from a modulo-wrapped idle loop (bounded strictly inside `pre-cadence`, never leaking vocabulary/signature) otherwise. Installs the dev-only, read-only `window.__drift3dEuxGainent` (`read()`, `validateTimeline()`) from inside itself;
- `EuxGainentFallbackScene.tsx` created — static/discrete reduced-motion and no-WebGL enrichment, reads `useAudioPlayer()` locally (never causes `Drift3DClient` to re-render on `timeupdate`), renders nothing unless EUX GAINENT is the current track, never replaces the SYS-50/60 destinations;
- `Drift3DScene.tsx` minimally modified — excludes the EUX GAINENT landmark from the generic per-landmark render loop and mounts `<EuxGainentLivingScene>` unconditionally alongside it, passing only `audioClockRef`/`isInsideZone`/`vehicleStateRef` (never `currentTime`/`duration`/`progress` as a fast prop);
- `Drift3DClient.tsx` minimally modified — composes `EuxGainentFallbackScene` alongside the existing, untouched `Drift3DFallback`, but **only** when `fallbackReason` is `"reduced-motion"` or `"no-webgl"` — explicitly excluded from `"checking"` so the gate order `checking → reduced-motion → no-webgl → Canvas` is preserved exactly;
- `EuxGainentFallbackScene.tsx`'s positions are a fixed lookup table keyed by `phaseId` alone (`EUX_FALLBACK_POSES`) — never derived from `currentTime`/`cycleValue`/`phaseProgress` — so two `timeupdate` events landing in the same phase are provably pose-identical; no role is named anywhere in this file (no `COMPLIANT`/`CORRECTED`/`RESIDUAL`, no explanatory caption) — the three athletes are legible only through relative offset and station-activity state, per the Identity Contract's "never labeled" requirement;
- real behavioral evidence captured in a real local Chrome session (`docs/evidence/DRIFT-IV-BY-EUX-20/`): pre-build baseline, pure timeline validation (`[]`), idle-without-EUX in both the outside-zone and inside-zone-without-EUX cases (no vocabulary/signature leak), all eight phases and seven cues confirmed via pause+seek (`CADENCE`/`ÉCART`/`CONFORMITÉ`/`RENDEMENT`/`OBJECTIF DÉPLACÉ`/none in the correct windows), the signature window confirmed with a real screenshot at CUE_05's peak (glass text, frozen silhouettes, lit recalibration strip), pause during deviation and reference-inversion, four direct seeks while playing (no replay, no stuck state), a real loop wrap with no residual phase/signature leak, zone exit/re-entry (immediate correct resumption from real absolute time, no replay from zero), track change inside the zone (idle fallback), and the no-WebGL fallback composition **rejoué après l'audit pré-merge** with a fresh real screenshot (destinations preserved, no role labels, fixed poses confirmed stable per phase across `pre-cadence`/`deviation`/`correction-revelation`/`reference-inversion`/`residue`). `tsc --noEmit`, `eslint` and `next build` all `PASS`. Reduced-motion (live OS emulation) and true interactive mobile-viewport R3F rendering remain `KNOWN_ENVIRONMENT_LIMITATION` — mitigated by structural code-review evidence (see the evidence package §10-§11, §15) — and a second post-build FPS sample could not be freshly captured after the real Chrome window lost OS-level foreground focus late in the session; the pre/post-build draw-call/triangle comparison obtained earlier in the same session shows lower counts post-build but, since camera/orientation were not strictly controlled and no fresh FPS sample was obtained, this does **not** establish absence of an overall performance regression (see §12).

Protected scope (this lot):
- no `public/audio/**`, no `public/images/**`
- no `src/components/audio/**`
- no `src/lib/tracks.ts`, no `src/lib/drift3dTopology.ts`, no `src/lib/drift3dLandmarks.ts`
- no `src/lib/drift3dAudioClock.ts`, no `drift3dSceneLifecycle.ts`, no `drift3dCueResolver.ts`, no `drift3dSignatureArbitration.ts`, no `drift3dQuality.ts`, no `drift3dReducedMotion.ts`, no `drift3dNoWebGL.ts`, no `drift3dEvidence.ts`
- no `package.json`/`package-lock.json`, no `next.config.*`/`tsconfig.json`, no new dependency
- no Identity Contract or Cue Map artistic/timing decision reopened (status fields only)

Final status:
`DRIFT-IV-BY-EUX-20 = DONE — PENDING MERGE`.
`PROOF SLICE 1: BUILD COMPLETE, OWNER ACCEPTANCE PENDING.`
`DRIFT-IV-BY-EUX-30 = NEXT_AFTER_MERGE`.
Backlog: `BY-EUX-00`/`BY-EUX-10 = SATISFIED_BY_EXISTING_AUTHORITY` (unchanged), `BY-EUX-20 = DONE`, `BY-EUX-30 = READY`.

---

## Previous lot (context, merged)

DRIFT-IV-SYS-70 — Evidence/performance harness

Status:
DONE — MERGED (PR #30, commit `1ce2adb1bcadee4b4c425fc188bdab1e56db303d`)

Baseline:
main@2dd27ab (contains DRIFT-IV-SYS-60, merged, PR #29)

Type:
Runtime service (generic evidence/performance-measurement contract) + dev-only R3F frame probe + minimal shell/Canvas integration + dev harness + documentation

Completed:
- `src/lib/drift3dEvidence.ts` created — framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic, cue-agnostic, scene-agnostic, quality-tier-agnostic pure measurement/evidence service. No React import, no Three.js import, no direct `window`/`document`/`navigator`/`performance`/`requestAnimationFrame` access — every timestamp/frame count/visibility value is supplied by the caller. Four canonical, frozen classifications (`MEASURED`, `INFERRED_FROM_REPRESENTATIVE_SAMPLE`, `AUTOMATED_STRUCTURAL_EVIDENCE`, `KNOWN_ENVIRONMENT_LIMITATION`) with `isDrift3DEvidenceClassification`. `Drift3DPerformanceSnapshot` (`canvasPresent`, `cumulativeFrameCount`, `render`/`viewport` — strictly `null` iff `canvasPresent` is `false`, never a fabricated zero) built via `createDrift3DPerformanceSnapshot`. `Drift3DFpsSampleToken`/`Drift3DFpsSample` and `computeDrift3DFps(frameCount, elapsedMs)` (`fps = frameCount / (elapsedMs / 1000)`, refuses `elapsedMs<=0`/`NaN`/`Infinity`/negative or fractional `frameCount`, never returns `Infinity`); `beginDrift3DFpsSample`/`endDrift3DFpsSample` read the caller-supplied `Drift3DEvidenceRuntimeRef` and a caller-supplied timestamp — no internal timer, no autonomous rAF loop. `createDrift3DEvidenceRuntimeRef()` factory for the mutable, unbounded-history-free runtime container. `resolveDrift3DEvidenceVisibility` normalizes any non-`"visible"` value to `"hidden"` (never silently defaults to visible). `getDrift3DPerformanceSnapshotIssues`/`getDrift3DFpsSampleIssues` validate structural validity only — never a performance threshold (`fps >= 60`/`fps >= 30` are never checked). Does not import `drift3dQuality.ts`; never selects a Quality Tier; all externally-returned values `Object.freeze`d;
- `Drift3DEvidenceProbe.tsx` created — dev-only R3F component using `useThree`/`useFrame` only, mutating a caller-owned `Drift3DEvidenceRuntimeRef` in place every frame (`cumulativeFrameCount`, `drawCalls`/`triangles` from `gl.info.render`, `width`/`height`/`dpr`) — zero object/array allocation, no `console.*`, no React state, no network, no persistence in the hot path. On real Canvas mount: `canvasPresent=true`, a real initial reading, and `cumulativeFrameCount` explicitly reset to `0` (deliberate, documented choice). On unmount: `canvasPresent=false`, all render/viewport fields reset to `null` (never `0`). Reads the same Three.js renderer stats as the pre-existing `__drift3dRender` global independently — does not read from or depend on it, and does not modify it;
- `Drift3DCanvas.tsx` integrated minimally — receives an `evidenceRuntimeRef` prop, mounts `<Drift3DEvidenceProbe>` dev-only as a sibling of `Drift3DScene`, zero artistic change;
- `Drift3DClient.tsx` integrated minimally — owns the stable `Drift3DEvidenceRuntimeRef` (via `useState`'s lazy initializer, not `useRef().current` — reading a ref's `.current` during render is rejected by the `react-hooks/refs` rule), passes it to `Drift3DCanvas`, and installs a dev-only shell-level `window.__drift3dEvidence` harness (`classifications`, `snapshot()`, `beginFpsSample()`, `endFpsSample(token)`, `computeFps(frameCount, elapsedMs)`, `validateSnapshot(snapshot)`, `validateFpsSample(sample)`, `validateClassification(value)`) — owned at the shell level so it stays available (honestly reporting `canvasPresent: false`) even when the Canvas is absent (reduced-motion, no-WebGL, still checking). Never exposes `setTier`/`forceLow`/`forceReduced`/`forceNoWebGL`/`teleport`/`play`/`pause`/`seek`/`resetScene`/`setQuality`/`setPerformanceTarget`/`autoOptimize`;
- `docs/DRIFT_3D_EVIDENCE_PERFORMANCE_HARNESS_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`, covering the measurement/interpretation separation, the four classifications, the snapshot/FPS models, the zero-allocation frame probe, shell-level ownership, immutability, validation scope (never a threshold), visibility normalization, absence of hardware fingerprinting/auto-quality-selection/telemetry/persistence, relation to the pre-existing probes (autonomous, no cross-dependency), the future-Build usage workflow, and this lot's limits;
- real behavioral evidence captured across two sessions (`docs/evidence/DRIFT-IV-SYS-70/`), separated into `PURE CONTRACT EVIDENCE` (classifications, `computeDrift3DFps` math including rejection cases, **15 snapshot fixtures — 1 valid + 14 invalid, covering all 12 issue types** (`cumulative-frame-count-invalid` exercised 3x: `-1`/`1.5`/`NaN`) — 12 FPS-sample fixtures — 1 valid + 11 invalid — immutability including a real `begin`/`end` back-to-back rejection edge case AND a real **non-null**, frozen FPS sample, all `PASS`), `REAL ACTIVE-CANVAS MEASUREMENT` / `CROSS-ZONE RENDER-COST SAMPLE` / comparability with BASE-00 (all `MEASURED`, obtained in a correction-round session on a real local Chrome instance: real snapshot with `cumulativeFrameCount` observed strictly increasing, `drawCalls`/`triangles` real and non-zero; a real ~22s foreground FPS sample, `fps≈70.17`, no threshold applied; all four BASE-00 zones — Entry Node, A Walk In Zeeland, Foolfoule, ÉTÉÉAOOÉTÉ — teleported to and measured, each value exactly matching a previously observed historical BASE-00 value for that zone; draw-call/triangle comparability confirmed, FPS not compared term-to-term across different viewport contexts, no regression/gain claim), `FALLBACK/LIFECYCLE EVIDENCE` (reduced-motion and no-WebGL fallbacks both genuinely forced via faithful environment overrides; a full real Canvas remount cycle — standard → reduced-motion → standard — confirmed the same `window.__drift3dEvidence` object identity throughout, `canvasPresent` toggling `true`/`false`/`true`, and `cumulativeFrameCount` resetting to `0` on real remount then increasing again; route cleanup confirms the global disappears entirely off-route and a genuinely new instance appears on return; audio invariance confirmed both at rest and **during real, explicitly-launched playback carried across an SPA navigation, five harness calls, and the entire Canvas remount cycle**, with `paused`/`src` unaffected throughout), `STRUCTURAL EVIDENCE` (zero timers/storage/network/hardware-sniffing/track-vocabulary occurrences, with the one honest exception of 2 comment-only matches for the auto-quality-command grep, explicitly reclassified as non-functional; zero-allocation hot path confirmed under real sustained frame ticking; `lint`/`build` both `PASS`), and all eleven pre-existing `__drift3d*` dev globals confirmed present and functional alongside the new one.

An environment limitation was honestly encountered and documented during the **initial** evidence session (2026-07-25): `requestAnimationFrame` never fired in the automated browser tab used at that time (confirmed in two separate browser tools), so no live per-frame Canvas metric could be captured as `MEASURED` in that session. This is preserved in the evidence package as historical record, not deleted. A **correction-round session** (2026-07-26), run on a real local Chrome instance (`claude-in-chrome`) with sustained real navigation/interaction and sufficient real wait time, obtained genuine live Canvas measurements for all previously-blocked tests — see the evidence package §2-§4 and §6 for the full diagnostic of both sessions, including the refined root-cause understanding (an off-screen-positioned automation window is throttled by Chrome's compositor until sustained real interaction, not a permanent block; the fully sandboxed preview browser remains permanently blocked in every attempt).

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/**
- no Drift3DScene.tsx, no Drift3DScatterField.tsx, no Drift3DEffects.tsx, no Drift3DLandmark.tsx, no Drift3DFallback.tsx, no Drift3DNoWebGLPath.tsx
- no src/lib/drift3dQuality.ts, no drift3dReducedMotion.ts, no drift3dNoWebGL.ts, no drift3dAudioClock.ts, no drift3dSceneLifecycle.ts, no drift3dCueResolver.ts, no drift3dSignatureArbitration.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no Identity Contract, no Cue Map, no era contract, no artistic bible touched
- no canonical performance threshold introduced, no auto-quality selection, no runtime optimization, no track-specific logic, no timer/network/storage introduced, no telemetry

End-of-SYS-phase status: BASE-00 through SYS-70 all DONE. **SHARED PRE-GATE FOUNDATION COMPLETE.** This lot (`DRIFT-IV-BY-EUX-20`) is now `DONE — PENDING MERGE` — see the top of this file.

Next lot (after this one merges):
DRIFT-IV-BY-EUX-30 — EUX GAINENT proof-slice owner acceptance (`PROOF SLICE 1` closes only upon explicit owner acceptance in that lot — this lot never declares acceptance)

Next status:
NEXT_AFTER_MERGE
