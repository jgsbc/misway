# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-10 — Scene lifecycle and cleanup

Status:
DONE — PENDING MERGE

Baseline:
main@754769f (contains DRIFT-IV-SYS-00, merged, PR #22)

Type:
Runtime service (scene lifecycle) + cleanup + documentation

Completed:
- `src/lib/drift3dSceneLifecycle.ts` created — framework-agnostic, DOM-agnostic, track-agnostic pure state machine. Five canonical states (`UNMOUNTED`, `IDLE`, `ACTIVE`, `PAUSED`, `RESETTING`), seven events (`mount`, `activate`, `pause`, `resume`, `reset`, `reset-complete`, `unmount`), seven generic reset reasons. `createDrift3DSceneLifecycleSnapshot(nowMs)` / `transitionDrift3DSceneLifecycle(previous, event, nowMs, resetReason?)` — pure, no timer, no per-frame allocation. `mountRevision` bumps only on a real `UNMOUNTED → IDLE`; `resetRevision` bumps exactly once per logical reset (entry into `RESETTING`); `lifecycleRevision` bumps on every real transition. Any repeated/invalid event (including a `reset` without a `resetReason`) is a deterministic no-op — no exception, no partial state;
- `Drift3DCanvas.tsx` integrated — a single stable `sceneLifecycleRef` (`changedAtMs: 0` deterministic init, same pattern as the audio clock). One `useEffect` governs the whole cycle: `mount` on mount, `activate` if `document.visibilityState === "visible"`, a `visibilitychange` listener driving `ACTIVE ↔ PAUSED` (`pause`/`resume`/`activate` as appropriate), and a route-unmount cleanup that transitions `reset("route-unmount")` → stops and detaches `Drift3DAmbienceEngine` → clears `pointerDriveStateRef`/`activeTouchPointersRef`/`pinchStateRef` → `reset-complete` → `unmount`, with no `setState` call after cleanup begins. A coarse React state (`sceneRuntimeActive`) drives `frameloop={sceneRuntimeActive ? "always" : "never"}` — never read/written per frame. The audio player is never referenced in this effect;
- `Drift3DScene.tsx` cleanup — the terrain `THREE.CanvasTexture` (previously never disposed) is now disposed on unmount; `KeyboardVehicleMotion` explicitly clears `pressedKeysRef` on cleanup in addition to its existing listener removal; a dev-only, per-instance-token-guarded ownership registry (`claimDrift3DDevProbe`/`releaseDrift3DDevProbe`, a small `Map`, not a generic cleanup registry or event bus) ensures a late cleanup from a replaced instance can never delete a newer instance's probe. `window.__drift3dLifecycle` (new, read-only, `Object.freeze`d, exposes only `read()`) installed alongside the existing `window.__drift3dAudioClock`; both plus `window.__drift3dRender`/`window.__drift3dDebug`/`window.__drift3dTeleport` are explicitly deleted on unmount via this ownership guard;
- `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`;
- real behavioral evidence captured in a real Chrome session (`docs/evidence/DRIFT-IV-SYS-10/`): initial mount (real, honestly `IDLE` since the automated tab reports `document.hidden === true`; `IDLE → ACTIVE` confirmed separately via a distinctly labeled `FORCED_VISIBILITY_PATH` override + real `visibilitychange` event), visibility pause/resume (`ACTIVE ↔ PAUSED`, `resetRevision` unchanged, global playback untouched), route-unmount (`UNMOUNTED`, `lastResetReason: "route-unmount"`, `resetRevision` +1 exactly, `canvasCount` 1→0, `audioCount` stays 1, global `<audio>` state byte-for-byte unchanged, all five dev globals absent), return to Drift (fresh instance, no duplicated probes, no autoplay), three repeated SPA cycles (no accumulation, zero console errors), terrain disposal (`AUTOMATED_STRUCTURAL_EVIDENCE`, confirmed by code reading), both fallbacks (reduced-motion and no-WebGL, each leaving zero residual lifecycle/probes) — all real, all PASS or honestly classified.

Bounded child audit (section 8 of the lot instructions): `Drift3DScatterField.tsx` and `Drift3DLandmark.tsx` already dispose the external resources they create (instanced geometry/material; reflector geometry/render target) and were **not modified**; `Drift3DEffects.tsx`, `Drift3DZone.tsx`, `Drift3DProp.tsx`, `Drift3DVehicle.tsx` create no external resource requiring disposal and were **not modified**. No artistic or structural refactor was performed on any of these six files.

Correction round (post-review, same PR, single amended commit):
- Fixed a Strict-Mode phantom `route-unmount`: the lifecycle effect's cleanup applied `reset("route-unmount") → reset-complete → unmount` synchronously, with no way to tell a real unmount apart from React 18 Strict Mode's dev-only `setup → cleanup → setup` replay on the same instance — so `resetRevision` was already `1` and `lastResetReason` already `"route-unmount"` before any real navigation ever happened. Fixed with a `lifecycleEffectGenerationRef` bumped on every real `setup`; the cleanup still clears listeners/resources/transient inputs immediately, but defers the logical `route-unmount` transition to a `queueMicrotask` that checks whether the generation is still the one captured at that `setup` — a same-instance Strict Mode replay changes it (no-op), a real unmount doesn't (transition applies). No timer of any kind, no `setState` in the deferred block;
- Stabilized the dev-probe ownership token: `const owner = {}` (recreated on every effect run) replaced by `devProbeOwnerRef.current` (a `useRef<object>({})`, computed once per component instance) so the contract's "same instance = same token" claim is actually true;
- `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` corrected to v1.1: §8/§11/§12 rewritten to describe the deferred-microtask mechanism and the stable per-instance token, and to state explicitly that a Strict Mode replay must never emit `route-unmount` or increment `resetRevision`;
- `docs/evidence/DRIFT-IV-SYS-10/scene-lifecycle-evidence.md`/`.json`: the original §10.1/§10.3/§10.4 findings (`mountRevision: 2`, `resetRevision: 1`, `lastResetReason: "route-unmount"` present before any real navigation) requalified `PRE_FIX_FINDING — STRICT_MODE_PHANTOM_ROUTE_UNMOUNT` (historical data preserved, not deleted); five targeted scenarios (A-E) replayed live and appended in section 12 — Strict Mode initial mount now settles at `mountRevision=1`/`resetRevision=0`/`lastResetReason=null`, a real route-unmount delivers `resetRevision` delta `+1` exactly, and a fresh remount starts clean (`resetRevision=0`, `lastResetReason=null`), not inheriting the previous instance's phantom reset.

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/AudioPlayerProvider.tsx, no src/lib/drift3dAudioClock.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no track identity contract, no Cue Map, no artistic bible touched
- no Cue Resolver, no track-local lifecycle, no signature arbitration, no quality tier, no reduced-motion contract, no no-WebGL narrative path, no residue/memory, no EUX GAINENT runtime, no new artistic scene, no autoplay, no second player, no new audio system

Next lot:
DRIFT-IV-SYS-20 — Cue resolver harness

Next status:
NEXT_AFTER_MERGE
