# MISWAY Drift Map — Governance Framework

## 1. Purpose

This document defines how the MISWAY Drift Map project must be executed.

It exists to prevent the project from becoming:

- too broad;
- too technical too early;
- visually noisy;
- harmful to the existing audio system;
- disconnected from the MISWAY identity.

The project must move lot by lot, with explicit stop conditions and validation after each step.

---

## 2. Governance principle

The Drift Map project is governed by one core rule:

> Strong vision, cold execution.

Creative ambition is welcome. Implementation must remain controlled.

Every lot must answer:

1. What is the smallest useful outcome?
2. Which existing behavior must remain untouched?
3. How will this be validated?
4. What makes the lot stop?

If a lot cannot answer these questions, it is not ready.

---

## 3. Mandatory read pack for Drift work

Before any Drift Map lot, Codex must read:

1. `AGENTS.md`
2. `docs/ACTIVE_LOT.md`
3. `docs/SEO_PAGE_MAP.md`
4. `docs/DECISIONS_LOG.md`
5. `docs/DRIFT_MAP_SPEC.md`
6. `docs/DRIFT_GOVERNANCE.md`
7. `docs/DRIFT_AGENTS_SKILLS.md`
8. `docs/DRIFT_BACKLOG.md`

For implementation lots, Codex must also read:

- `src/app/drift/page.tsx`
- `src/components/pages/DriftPageClient.tsx`
- `src/components/audio/AudioPlayerProvider.tsx`
- `src/components/audio/GlobalAudioPlayer.tsx`
- `src/components/audio/TrackPlayButton.tsx`
- `src/lib/tracks.ts`
- `src/app/layout.tsx`
- `src/lib/basePath.ts`
- `next.config.ts`

---

## 4. Execution model

### Lot discipline

Work must be split into small, bounded lots.

A lot must have:

- one objective;
- clear files in scope;
- explicit files out of scope;
- acceptance criteria;
- validation commands;
- stop conditions;
- compact report format.

### No opportunistic refactor

Do not refactor unrelated code because it looks imperfect.

Allowed exceptions:

- the issue blocks the current lot;
- the issue creates a severe risk;
- the lot explicitly includes cleanup.

### No silent scope expansion

If implementation reveals a bigger issue, stop and report instead of expanding the task.

---

## 5. Branch and commit governance

Recommended branch naming:

- `drift-doc-00`
- `drift-audit-00`
- `drift-map-00`
- `drift-map-01`
- `drift-visual-00`
- `drift-qa-00`

Recommended commit message style:

- `Add Drift Map specification`
- `Audit Drift Map implementation surface`
- `Add experimental drift-lab route`
- `Add Drift Map spatial data`
- `Connect Drift Map to global audio player`

One lot should usually produce one compact commit. If a lot becomes large, split it.

---

## 6. Documentation governance

Documentation is not decorative. It is operational.

### Documents and roles

`docs/DRIFT_MAP_SPEC.md`
- Product and technical truth.
- Defines what the project is.

`docs/DRIFT_GOVERNANCE.md`
- Execution rules.
- Defines how the project moves.

`docs/DRIFT_AGENTS_SKILLS.md`
- Role-based operating model.
- Defines what each agent protects.

`docs/DRIFT_BACKLOG.md`
- A-to-Z development plan.
- Defines lot order and acceptance criteria.

`docs/ACTIVE_LOT.md`
- Current operational status.
- Should be updated only when a lot begins or ends.

`docs/DECISIONS_LOG.md`
- Historical record of decisions.
- Should record major Drift decisions when implementation starts.

### Update rule

At the end of each implementation lot:

1. Update `docs/ACTIVE_LOT.md` if the lot was active.
2. Update `docs/DECISIONS_LOG.md` if a meaningful decision was made.
3. Do not rewrite the full spec unless the doctrine changed.
4. Record deviations explicitly.

---

## 7. Product governance

### Product priority order

1. Audio continuity.
2. User comprehension.
3. MISWAY identity.
4. Mobile usability.
5. Performance.
6. Visual novelty.
7. Future 3D possibilities.

Visual novelty never overrides audio continuity.

### Product tests

Every lot must preserve:

- normal `/tracks` access;
- normal `/drift` access until promotion;
- global player behavior;
- static export compatibility;
- navigation usability.

### Product stop condition

Stop if the map becomes more important than the music.

---

## 8. Technical governance

### V0 technical constraints

- No WebGL.
- No new dependency.
- No second audio player.
- No server dependency.
- No API route requirement.
- No change to deployment model.
- No direct mutation of the existing track catalogue model unless explicitly approved.
- No global CSS sprawl.

### Static export constraint

The project uses static export and GitHub Pages-style base path handling. All assets must respect that.

Any local asset path used in rendered components must either:

- go through existing base path handling; or
- be structured in a way already proven compatible in the repo.

### Audio constraint

The audio system is a protected subsystem.

Allowed:

- read current track state;
- call existing provider actions;
- display current track state;
- trigger play on explicit user action.

Forbidden:

- add another `<audio>`;
- bypass provider state;
- manipulate global player internals;
- auto-switch tracks on proximity in V0;
- reset playback unexpectedly.

---

## 9. Visual governance

The Drift Map must remain:

- sparse;
- deliberate;
- readable;
- strange;
- premium;
- musical.

Allowed visual language:

- off-white map surface;
- soft shadows;
- simple SVG/HTML props;
- symbolic signs;
- minimal map texture;
- subtle color zones;
- controlled motion.

Forbidden visual language:

- arcade clutter;
- cartoon overload;
- cheap game UI;
- aggressive neon everywhere;
- heavy fake 3D;
- random props without musical meaning.

---

## 10. Accessibility governance

Accessibility is mandatory from V0.

Each interactive lot must consider:

- keyboard navigation;
- focus states;
- reduced motion;
- fallback non-playable mode;
- touch size;
- color contrast;
- audio user intent.

If accessibility cannot be solved in the current approach, the approach must be simplified.

---

## 11. QA governance

### Required validation commands

Use available project commands:

```bash
npm run lint
npm run build
```

If a lot is documentation-only, build is optional. Report clearly that no code was changed.

### Required manual checks for implementation lots

- `/drift` still works.
- `/drift-lab` works if created.
- `/tracks` still works.
- Track detail pages still work.
- Global player still appears outside homepage.
- Play/pause works.
- Loop works.
- Next/previous works.
- Seek works.
- Mobile layout is not blocked by controls.
- Keyboard can exit or continue.

---

## 12. Promotion governance

`/drift-lab` can replace `/drift` only when explicitly approved.

Promotion checklist:

- product owner approves the feeling;
- audio guardian validates global player behavior;
- performance auditor validates mobile/desktop responsiveness;
- accessibility checker validates fallback and keyboard path;
- build and lint pass;
- old Drift behavior is archived or recoverable.

Until then, `/drift` remains stable.

---

## 13. Reporting format

Each Codex lot must end with:

```txt
1. Status
DONE / BLOCKED / DONE_WITH_WARNINGS

2. Summary
Short description of what changed.

3. Files changed
List only real modified files.

4. Validation
Commands run and results.

5. Risks / notes
Anything unresolved.

6. Next lot
READY / BLOCKED and recommended lot id.
```

No verbose self-justification. No invented validation.

---

## 14. Current governance conclusion

The next operational step is:

`DRIFT-AUDIT-00 — Audit technique préparatoire`

No implementation should start before that audit.
