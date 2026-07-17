# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-00 — Shared audio-clock service

Status:
DONE — PENDING MERGE

Baseline:
main@d66b63b (contains DRIFT-IV-BASE-00, merged)

Type:
Runtime service (audio clock) + documentation

Completed:
- `src/lib/drift3dAudioClock.ts` created — framework-agnostic snapshot/update/read functions (`createDrift3DAudioClockSnapshot`, `updateDrift3DAudioClock`, `readDrift3DAudioClockTime`, `readDrift3DAudioClockProgress`), extrapolation bounded to 500ms, `timelineRevision` bumping only on `source-change`/`seek`/`restart`/`loop`;
- `AudioPlayerProvider.tsx` integrated — a single stable `audioClockRef` synchronized on every native `<audio>` event (`timeupdate`, `loadedmetadata`, `durationchange`, `play`, `pause`, `seeking`, `seeked`, `ratechange`, `ended`) and on every imperative action (`playTrack`, `toggleTrack`, `togglePlayback`, `toggleLoop`, `playNext`, `playPrevious`, `seekToRatio`) — seek and restart update the ref immediately, not on the next `timeupdate`; still exactly one `<audio>` element, `useAudioPlayer()` unchanged (no breaking change);
- `AudioPlayerRuntimeContext` / `useAudioPlayerRuntime()` added — coarse runtime context (`current`, `isPlaying`, `isLooping`, action callbacks, `audioClockRef`) whose memo excludes `currentTime`/`duration`/`progress`, so a `timeupdate` no longer invalidates it;
- `Drift3DClient.tsx` migrated from `useAudioPlayer()` to `useAudioPlayerRuntime()`;
- `audioClockRef` threaded as a stable dependency `Drift3DClient → Drift3DCanvas → Drift3DScene` — no per-frame prop;
- `Drift3DScene.tsx` installs a dev-only read-only getter `window.__drift3dAudioClock` via `Object.defineProperty` in a plain `useEffect` (no new `useFrame`, no timer), cleaned up on unmount;
- `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` created (now v1.1, see correction round below) — full runtime contract, `ACTIVE — RUNTIME CONTRACT`;
- real behavioral evidence captured in a real foreground Chrome session (`docs/evidence/DRIFT-IV-SYS-00/`): init (no autoplay), explicit playback (strictly increasing time), pause (frozen to 0.05s), resume (no wall-clock jump), real UI seek (immediate, revision bump), explicit track change, loop/restart, route-change coherence, zone-entry with no active track (no source change, no autoplay) — all real, all PASS.

Correction round (post-review, same PR, single amended commit):
- Fixed a `timelineRevision` double-count: command-path discontinuities (`seekToRatio`, restart, loop wrap) were bumping the revision once for the command and again via the native `seeking`/`seeked` pair they also trigger. Fixed with a `pendingDiscontinuityRef` set at each command site before mutating `audio.currentTime`, consulted and cleared by `onSeeked` — externally-originated seeks (not preceded by a command) are still counted on their own;
- `onSeeking` now sets `playbackState: "seeking"` (new, non-discontinuous reason `"seeking"` added to `Drift3DAudioClockUpdateReason`) so extrapolation is inert during a pending seek; `onSeeked` restores `playbackState` from `audio.paused`;
- `onRateChange` now re-anchors `anchorTimeSeconds: audio.currentTime` together with `playbackRate`, preventing clock drift after a rate change; `loadedmetadata`/`durationchange` audited for the same rule;
- `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` corrected to v1.1: immediacy claims split into discontinuity-target-immediate vs. play/pause-confirmed-by-native-event;
- `docs/evidence/DRIFT-IV-SYS-00/audio-clock-evidence.md`/`.json`: the old seek (1→7) and loop (8→11) findings requalified `PRE_FIX_FINDING — DUPLICATE_TIMELINE_REVISION` (historical data preserved, not deleted); six targeted scenarios (A-F) replayed live and appended in section 14 — all exact expected deltas confirmed (seek UI +1, external seek +1, restart +1, loop +1, rate-change +0 with no backward movement, pause/resume delta 0s).

Protected scope:
- no public/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency (no Playwright, no Puppeteer)
- no src/lib/tracks.ts, no src/lib/cues/**
- no track identity contract, no Cue Map, no artistic bible touched
- no cue resolver, no scene lifecycle, no signature arbitration, no quality tiers, no track-specific animation, no EUX GAINENT runtime, no FFT, no second audio source, no second player, no autoplay introduced

Next lot:
DRIFT-IV-SYS-10 — Scene lifecycle and cleanup

Next status:
NEXT_AFTER_MERGE
