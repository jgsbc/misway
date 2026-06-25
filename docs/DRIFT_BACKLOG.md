# MISWAY Drift Map — Full Development Backlog

## 1. Purpose

This backlog defines the full A-to-Z development path for the MISWAY Drift Map project.

It is intentionally staged. Codex must not jump ahead.

The current target is not a complete final map. The current target is a documented, audited, then prototyped `/drift-lab` V0.

---

## 2. Global sequence

1. `DRIFT-DOC-00` — Documentation foundation.
2. `DRIFT-AUDIT-00` — Technical audit before implementation.
3. `DRIFT-MAP-00` — Experimental route shell.
4. `DRIFT-MAP-01` — Spatial data model.
5. `DRIFT-MAP-02` — Desktop vehicle movement.
6. `DRIFT-MAP-03` — Mobile controls or fallback.
7. `DRIFT-MAP-04` — Musical zones.
8. `DRIFT-MAP-05` — Global audio connection.
9. `DRIFT-MAP-06` — Minimal HUD.
10. `DRIFT-VISUAL-00` — Biomes.
11. `DRIFT-VISUAL-01` — Props and microcopy.
12. `DRIFT-A11Y-00` — Reduced motion and fallback path.
13. `DRIFT-QA-00` — Full QA.
14. `DRIFT-QA-01` — Promotion decision.
15. `DRIFT-3D-00` — Optional WebGL spike, deferred.

---

## 3. EPIC 0 — Documentation and governance

### DRIFT-DOC-00 — Documentation foundation

Status: current documentation lot.

Objective:
- Create the project documentation base before Codex implementation.

Files in scope:
- `docs/DRIFT_MAP_SPEC.md`
- `docs/DRIFT_GOVERNANCE.md`
- `docs/DRIFT_AGENTS_SKILLS.md`
- `docs/DRIFT_BACKLOG.md`
- `AGENTS.md` read-pack reference only

Files out of scope:
- all app code;
- all audio code;
- all route files;
- all styling files;
- package dependencies.

Acceptance criteria:
- Documentation exists.
- Decisions are explicit.
- V0 constraints are clear.
- Backlog is ordered.
- Codex read pack is defined.
- No app code changed.

Validation:
- No build required if only docs changed.
- Verify files exist.
- Verify no implementation files changed.

Next lot:
- `DRIFT-AUDIT-00`.

---

## 4. EPIC 1 — Audit before implementation

### DRIFT-AUDIT-00 — Technical preparatory audit

Objective:
- Audit current Drift, audio, routing, styling and data surfaces before implementation.

Files to inspect:
- `AGENTS.md`
- `docs/ACTIVE_LOT.md`
- `docs/SEO_PAGE_MAP.md`
- `docs/DECISIONS_LOG.md`
- `docs/DRIFT_MAP_SPEC.md`
- `docs/DRIFT_GOVERNANCE.md`
- `docs/DRIFT_AGENTS_SKILLS.md`
- `docs/DRIFT_BACKLOG.md`
- `src/app/drift/page.tsx`
- `src/components/pages/DriftPageClient.tsx`
- `src/components/audio/AudioPlayerProvider.tsx`
- `src/components/audio/GlobalAudioPlayer.tsx`
- `src/components/audio/TrackPlayButton.tsx`
- `src/lib/tracks.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/light-theme.css`
- `src/lib/basePath.ts`
- `next.config.ts`

Allowed changes:
- None by default.
- Documentation note only if explicitly requested.

Output:
- audit report;
- implementation risks;
- safe file plan;
- no-code confirmation;
- recommended next lot.

Acceptance criteria:
- Confirms current audio integration path.
- Confirms `/drift` preservation path.
- Confirms basePath constraints.
- Identifies CSS/styling risks.
- Identifies mobile/player layout risks.
- Confirms whether `/drift-lab` should be in sitemap or not.

Validation:
- Read-only unless explicitly expanded.

Next lot:
- `DRIFT-MAP-00` if no blocker.

---

## 5. EPIC 2 — Route and shell

### DRIFT-MAP-00 — Create experimental route shell

Objective:
- Create `/drift-lab` as a safe experimental route.

Files in scope:
- `src/app/drift-lab/page.tsx`
- `src/components/drift-map/DriftMapClient.tsx`
- optional `src/components/drift-map/DriftFallback.tsx`

Files out of scope:
- `/drift` route;
- audio provider;
- tracks data;
- package dependencies;
- WebGL dependencies;
- global navigation unless absolutely necessary.

Expected behavior:
- `/drift-lab` renders a minimal placeholder experience.
- It states this is an experimental Drift Map lab.
- It links back to `/drift` and `/tracks`.
- It does not play audio yet.

Acceptance criteria:
- `/drift` remains unchanged.
- `/drift-lab` builds.
- No new dependency.
- No audio behavior changed.
- Static export works.

Validation:
- `npm run lint`
- `npm run build`

Next lot:
- `DRIFT-MAP-01`.

---

## 6. EPIC 3 — Spatial data

### DRIFT-MAP-01 — Add Drift Map spatial data

Objective:
- Create the spatial data model and initial V0 zones.

Files in scope:
- `src/types/drift.ts`
- `src/lib/driftMap.ts`
- optional minimal import in `DriftMapClient.tsx` to display zone count

Files out of scope:
- `src/lib/tracks.ts` structural changes;
- audio behavior;
- movement;
- visuals beyond simple data display.

Expected data:
- 6 to 8 zones.
- Every `trackSlug` must map to existing tracks.
- Biomes defined as typed union.
- Props are optional and sparse.

Acceptance criteria:
- No duplicate zone ids.
- Track slugs are valid.
- Data is typed.
- `/drift-lab` can display zones or count.
- No audio behavior changed.

Validation:
- `npm run lint`
- `npm run build`

Next lot:
- `DRIFT-MAP-02`.

---

## 7. EPIC 4 — Vehicle movement

### DRIFT-MAP-02 — Add desktop vehicle movement

Objective:
- Add a simple controllable vehicle on the map.

Files in scope:
- `src/components/drift-map/DriftVehicle.tsx`
- `src/components/drift-map/DriftMapScene.tsx`
- `src/lib/driftControls.ts`
- `src/components/drift-map/DriftMapClient.tsx`

Files out of scope:
- audio connection;
- mobile controls;
- WebGL;
- physics engine;
- global player changes.

Expected behavior:
- Vehicle starts at spawn.
- Arrow keys and WASD move it.
- Position clamps inside map bounds.
- Rotation or facing direction can be minimal.
- Movement stops when keys are released.
- Animation loop cleans up on unmount.

Acceptance criteria:
- Desktop keyboard movement works.
- No scroll hijack outside map focus/interaction plan.
- No uncontrolled animation loop after unmount.
- No audio behavior changed.
- `/drift` unchanged.

Validation:
- `npm run lint`
- `npm run build`
- manual desktop movement check

Next lot:
- `DRIFT-MAP-03`.

---

## 8. EPIC 5 — Mobile controls

### DRIFT-MAP-03 — Add mobile control path

Objective:
- Make `/drift-lab` usable on mobile or provide a strong fallback.

Files in scope:
- `src/components/drift-map/DriftControls.tsx`
- `src/components/drift-map/DriftFallback.tsx`
- `src/components/drift-map/DriftMapClient.tsx`
- optional `src/lib/driftControls.ts`

Files out of scope:
- audio connection unless fallback needs existing play buttons in a later lot;
- 3D;
- major visual polish.

Acceptable solutions:
- virtual joystick;
- directional touch controls;
- drag-to-move;
- fallback list if interaction is poor.

Acceptance criteria:
- Mobile portrait is not blocked by controls.
- Controls do not conflict with global player area.
- User can reach zone selection path.
- Fallback exists if movement is weak.
- No new dependency.

Validation:
- `npm run lint`
- `npm run build`
- manual responsive check

Next lot:
- `DRIFT-MAP-04`.

---

## 9. EPIC 6 — Zones and proximity

### DRIFT-MAP-04 — Add musical zones and proximity detection

Objective:
- Render zones and detect nearest/active zone by vehicle position.

Files in scope:
- `src/components/drift-map/DriftZone.tsx`
- `src/components/drift-map/DriftMapScene.tsx`
- `src/components/drift-map/DriftHud.tsx`
- `src/lib/driftMap.ts`

Files out of scope:
- audio playback connection;
- WebGL;
- new dependencies;
- `/drift` replacement.

Expected behavior:
- Zones appear on map.
- Nearest zone is detected.
- Zone title/microcopy appears in HUD.
- Active state does not trigger audio automatically.

Acceptance criteria:
- Proximity works predictably.
- Active zone visual state is clear.
- No automatic audio switching.
- No track route breakage.

Validation:
- `npm run lint`
- `npm run build`
- manual proximity check

Next lot:
- `DRIFT-MAP-05`.

---

## 10. EPIC 7 — Audio integration

### DRIFT-MAP-05 — Connect zones to global audio player

Objective:
- Let user explicitly play a zone track through the existing global audio system.

Files in scope:
- `src/components/drift-map/DriftMapClient.tsx`
- `src/components/drift-map/DriftHud.tsx`
- optional `src/components/drift-map/DriftFallback.tsx`

Files out of scope:
- `AudioPlayerProvider` changes unless audit proves necessary;
- `GlobalAudioPlayer` changes unless bug is directly caused by the lot;
- second audio element;
- autoplay proximity switching.

Expected behavior:
- User enters zone or presses play in HUD.
- Associated track plays through `AudioPlayerProvider`.
- Current active track can be indicated.
- Global player controls remain functional.

Acceptance criteria:
- No second `<audio>`.
- Existing play/pause works.
- Next works.
- Previous works.
- Loop works.
- Seek works.
- Leaving `/drift-lab` does not stop audio.
- Existing `/tracks` play buttons still work.

Validation:
- `npm run lint`
- `npm run build`
- manual audio QA checklist

Next lot:
- `DRIFT-MAP-06`.

---

## 11. EPIC 8 — HUD and navigation

### DRIFT-MAP-06 — Add minimal HUD and exit flow

Objective:
- Provide clear controls, current zone, and exit paths without clutter.

Files in scope:
- `src/components/drift-map/DriftHud.tsx`
- `src/components/drift-map/DriftMapClient.tsx`
- `src/components/drift-map/DriftControls.tsx`

Files out of scope:
- visual biomes beyond minimal state;
- WebGL;
- `/drift` replacement.

Expected HUD:
- current zone title;
- one line microcopy;
- play/enter button;
- link to track page;
- link to `/tracks`;
- controls hint.

Acceptance criteria:
- HUD does not hide global player.
- HUD works on mobile.
- Keyboard focus is visible.
- Exit path is clear.

Validation:
- `npm run lint`
- `npm run build`
- manual desktop/mobile check

Next lot:
- `DRIFT-VISUAL-00`.

---

## 12. EPIC 9 — Visual world

### DRIFT-VISUAL-00 — Add V0 biomes

Objective:
- Give each V0 zone a restrained visual mood.

Files in scope:
- `src/components/drift-map/DriftMapScene.tsx`
- `src/components/drift-map/DriftZone.tsx`
- `src/lib/driftMap.ts`
- optional local CSS module or tightly scoped classes

Files out of scope:
- global CSS refactor;
- heavy assets;
- 3D;
- new dependencies.

Expected biomes:
- entry-signal;
- zeeland-road;
- midnight-office;
- here-there;
- plain-signal;
- neural-loop;
- hold-light;
- birth-yard.

Acceptance criteria:
- Each biome is distinct but restrained.
- No visual clutter.
- No heavy assets.
- Performance remains good.
- Motion respects reduced-motion plan.

Validation:
- `npm run lint`
- `npm run build`
- manual visual review

Next lot:
- `DRIFT-VISUAL-01`.

---

### DRIFT-VISUAL-01 — Add sober absurd props and microcopy

Objective:
- Add symbolic objects and short dry-humor text without turning the map into a gag page.

Files in scope:
- `src/lib/driftMap.ts`
- `src/components/drift-map/DriftMapScene.tsx`
- `src/components/drift-map/DriftZone.tsx`
- `src/components/drift-map/DriftHud.tsx`

Files out of scope:
- audio changes;
- route changes;
- new assets unless tiny and justified.

Acceptance criteria:
- Props are sparse.
- Each prop has a reason.
- Microcopy stays short.
- Tone remains MISWAY.
- No cheap visual joke.

Validation:
- `npm run lint`
- `npm run build`
- manual creative review

Next lot:
- `DRIFT-A11Y-00`.

---

## 13. EPIC 10 — Accessibility and fallback

### DRIFT-A11Y-00 — Add reduced motion and fallback mode

Objective:
- Ensure Drift Map remains usable for reduced-motion users and weak interaction contexts.

Files in scope:
- `src/components/drift-map/DriftFallback.tsx`
- `src/components/drift-map/DriftMapClient.tsx`
- `src/components/drift-map/DriftControls.tsx`
- optional `src/lib/driftMap.ts`

Expected behavior:
- If reduced motion is preferred, strong motion is disabled or softened.
- A list/card fallback allows selecting zones.
- Essential actions remain available without driving.

Acceptance criteria:
- Reduced motion path exists.
- Fallback path exists.
- Buttons/links are semantic.
- Focus states visible.
- No keyboard trap.

Validation:
- `npm run lint`
- `npm run build`
- manual reduced-motion/fallback review

Next lot:
- `DRIFT-QA-00`.

---

## 14. EPIC 11 — QA and promotion

### DRIFT-QA-00 — Full QA pass

Objective:
- Validate V0 before any promotion decision.

Scope:
- no feature work unless fixing QA blockers;
- verify current implementation.

QA checklist:
- `/drift-lab` loads.
- `/drift` still loads.
- `/tracks` still loads.
- Track pages still load.
- Desktop movement works.
- Mobile path works or fallback works.
- Current zone state works.
- Global audio play works.
- Pause works.
- Loop works.
- Next works.
- Previous works.
- Seek works.
- Route change does not stop audio.
- Build passes.
- Lint passes.
- No new dependencies in V0.
- No WebGL in V0.

Output:
- QA status;
- blockers;
- fix lots if needed;
- promotion recommendation.

Next lot:
- `DRIFT-QA-01` if QA passes.
- otherwise focused fix lot.

---

### DRIFT-QA-01 — Promotion decision toward `/drift`

Objective:
- Decide whether `/drift-lab` should replace `/drift`.

Allowed outcomes:

1. `PROMOTE`
2. `DO_NOT_PROMOTE_YET`
3. `PROMOTE_WITH_FALLBACK`

Promotion requires explicit human approval.

If approved, future implementation lot should:
- preserve old Drift component if useful;
- replace `/drift` carefully;
- keep `/drift-lab` as lab or redirect depending decision;
- update docs and sitemap if needed.

Acceptance criteria:
- no promotion without approval;
- full QA evidence;
- rollback path known.

---

## 15. EPIC 12 — Optional 3D future

### DRIFT-3D-00 — WebGL spike, deferred

Objective:
- Test if React Three Fiber can enhance the experience without harming performance or identity.

This lot is explicitly deferred.

Possible dependencies:
- `three`
- `@react-three/fiber`
- `@react-three/drei`

Rules:
- spike route or isolated component only;
- no replacement of V0;
- no physics;
- no heavy assets;
- fallback required;
- explicit approval required before dependency installation.

Acceptance criteria:
- build works;
- static export works;
- mobile performance acceptable;
- fallback exists;
- visual gain is worth complexity.

---

### DRIFT-3D-01 — Low-poly vehicle, deferred

Only after `DRIFT-3D-00` passes.

---

### DRIFT-3D-02 — 3D biomes, deferred

Only after `DRIFT-3D-01` passes.

---

## 16. Current next lot

The next recommended lot is:

`DRIFT-AUDIT-00 — Technical preparatory audit`

No implementation should begin before it.
