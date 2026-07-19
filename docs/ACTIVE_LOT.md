# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-60 — No-WebGL narrative path

Status:
DONE — PENDING MERGE

Baseline:
main@09d8bee (contains DRIFT-IV-SYS-50, merged, PR #28)

Type:
Runtime service (generic no-WebGL access-path contract) + dedicated static panel + minimal shell/fallback integration + dev harness + documentation

Completed:
- `src/lib/drift3dNoWebGL.ts` created — framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic, cue-agnostic, scene-agnostic, reduced-motion-agnostic, quality-tier-agnostic pure no-WebGL access-path service. The no-WebGL path is a shared PRODUCT access path — never a Quality Tier, never `LOW`, never the reduced-motion contract, never an alternate 3D renderer, never a second map, never a second player. Canonical `Drift3DNoWebGLNarrativePath` (`representation: "panel"`, `requiresWebGL: false`, `mounts3DCanvas: false`, `audioAuthority: "global-player"`, `autoplay: false`, `promises3DInteraction: false`), two canonical `Drift3DNoWebGLDestination`s (`map` → `/drift-lab`, `tracks` → `/tracks`), six `Drift3DNoWebGLGuarantees` literally typed `true` (never `boolean`). The path, its destinations and its guarantees are all `Object.freeze`d — no module-scope mutable `Map`/`Set`. `getDrift3DNoWebGLNarrativePath`, `getDrift3DNoWebGLPathIssues`/`getDrift3DCanonicalNoWebGLIssues` (representation/requiresWebGL/mounts3DCanvas/audioAuthority/autoplay/promises3DInteraction non-conformance, missing/duplicate destination, invalid href/role for a known destination id, any guarantee not `true`). Does not import `drift3dQuality.ts`, `drift3dReducedMotion.ts`, `drift3dCueResolver.ts`, `drift3dSignatureArbitration.ts`, or `tracks.ts`; no React or Three.js dependency; no WebGL API usage; no functional read or runtime usage of `window`/`document`/`navigator`; no timer;
- `Drift3DNoWebGLPath.tsx` created — a static, lightweight panel: no `Canvas`, no Three.js, no audio element, no fetch, no external asset. Reuses the already-delivered "No WebGL" label/title/body copy (now living here instead of the generic `Drift3DFallback` template), adds a static "About the 3D room" panel reusing the exact pre-existing world-description sentence (extracted into an exported `DRIFT_3D_WORLD_SUMMARY` constant, shared with `Drift3DClient.tsx`'s `sr-only` description so it exists in exactly one place — deliberately without the interaction-instructions sentence that follows it there), and renders its two CTAs (`Open 2D Lab`, `Tracks`) directly from `getDrift3DNoWebGLNarrativePath().destinations`, so the UI can never drift from the pure contract;
- `Drift3DFallback.tsx` integrated — `reason === "no-webgl"` now delegates to `<Drift3DNoWebGLPath />`; `checking`/`reduced-motion` render through the unchanged generic template (their copy untouched);
- `Drift3DClient.tsx` integrated minimally — a dev-only `useEffect` installs `window.__drift3dNoWebGL` (`Object.freeze`d: `getPath()`, `validate(path)`, `validateCanonical()`) at the shell level (not `Drift3DCanvas.tsx`), for the same reason as the reduced-motion probe: the `Canvas` is intentionally absent whenever this fallback is active. The desktop driving tutorial (`ZQSD / WASD / ARROWS / DRAG / WHEEL`) is now hidden whenever any `fallbackReason` is active (checking, reduced-motion, or no-webgl) — an intentional, authorized fix that removes a false interaction promise without touching the actual 3D controls. `canUseWebGL()` and the audio logic are untouched; the gate order (`checking` → `reduced-motion` → `no-webgl` → `Canvas`) is unchanged;
- `docs/DRIFT_3D_NO_WEBGL_NARRATIVE_PATH_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`, explicitly states no-WebGL = access path never Quality Tier, distinct from reduced-motion (with its existing priority preserved), no new artistic asset, `/drift-lab`/`/tracks` as the two destinations, global player as the sole audio authority, and reserves future track-local Builds' right to add local fallback representations only under their own approved artistic contracts;
- real behavioral evidence captured in a real Chrome session (`docs/evidence/DRIFT-IV-SYS-60/`), separated into `PURE CONTRACT EVIDENCE` (canonical contract valid; runtime-immutable, unchanged after a controlled mutation attempt; 18 invalid fixtures — 6 contract-level, 6 destination-level, 6 guarantee-level, one per named guarantee — each detected with the exact expected issue type, canonical contract never mutated), `REAL NO-WEBGL SHELL EVIDENCE` (real no-WebGL runtime — `canvasCount=0`, `audioCount=1`, static panel visible with correct copy, `Open 2D Lab`/`Tracks` present, no autoplay; `/drift-lab` and `/tracks` genuinely reachable via real clicks with zero console errors, 26 distinct track links observed on `/tracks`; reduced-motion priority preserved exactly — combined `prefersReducedMotion=true` + no-WebGL still renders the reduced-motion fallback, not the no-WebGL panel; clean return to WebGL — `Canvas` remounted, panel gone, playback continuity, a genuinely new probe instance since the route fully remounted; dedicated probe cleanup/remount cycle; driving tutorial confirmed hidden on both fallbacks and visible in standard mode), `LISTENING PATH EVIDENCE` (a track explicitly launched from `/tracks`, paused/resumed via the real pre-existing global control there, then measured to keep playing, uninterrupted, on `/drift`'s no-WebGL fallback — with the honest finding that `GlobalAudioPlayer` hides itself on any `/drift*` route by pre-existing, unmodified design, so no playback control is visible on that specific route even though continuity is real), and `STRUCTURAL EVIDENCE` (zero occurrence of timers/`useFrame`, forbidden module imports, or artistic vocabulary in the new files; no dependency or functional runtime usage of Three.js/WebGL — the Canvas-vocabulary grep genuinely returns 7 matches, all reclassified as `mounts3DCanvas` contract/validator semantics plus one explanatory comment, never an actual Canvas import or mount; `AudioPlayerProvider.tsx` and all Canvas/Scene/Quality/ReducedMotion files confirmed untouched; `public/**` confirmed unchanged) — all real, all PASS, zero console errors across the entire session.

No environment incident was encountered in this lot (dev server was restarted fresh as a precaution before this evidence round).

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/AudioPlayerProvider.tsx
- no src/components/drift-3d/Drift3DCanvas.tsx, no Drift3DScene.tsx, no Drift3DScatterField.tsx, no Drift3DEffects.tsx, no Drift3DLandmark.tsx
- no src/lib/drift3dQuality.ts, no drift3dReducedMotion.ts, no drift3dAudioClock.ts, no drift3dSceneLifecycle.ts, no drift3dCueResolver.ts, no drift3dSignatureArbitration.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no track identity contract, no Cue Map, no era contract, no artistic bible touched
- `canUseWebGL()` unchanged
- no track-specific static fallback, no new artistic asset, no reimplemented map, no second player, no persisted preference

Next lot:
DRIFT-IV-SYS-70 — Evidence/performance harness

Next status:
NEXT_AFTER_MERGE
