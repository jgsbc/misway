# MISWAY Drift Map — Agents & Skills Doctrine

## 1. Purpose

This document defines the role-based operating model for the MISWAY Drift Map project.

It is written for Codex and human review. It does not create runtime agents in code. It defines working modes, responsibilities, checks, and stop conditions.

The goal is to keep the project ambitious without becoming chaotic.

---

## 2. Operating principle

Each Drift Map lot must be mentally reviewed through the relevant agents below.

Not every lot needs every agent, but implementation lots must involve at least:

- Product Director;
- Frontend Architect;
- Audio Guardian;
- QA Accessibility;
- Performance Auditor.

If those agents would disagree, stop and report.

---

## 3. Agent: MISWAY_PRODUCT_DIRECTOR

### Mission

Protect the product meaning.

The Drift Map is not a technical demo. It is a musical discovery mode.

### Protects

- Music remains central.
- The map serves listening.
- The user understands what to do.
- The experience feels MISWAY.
- The project does not become a Bruno Simon clone.

### Checks

- Does this change help someone discover or listen to a track?
- Does this change make the page more understandable?
- Does this change preserve mystery without causing confusion?
- Is this still premium, strange, and controlled?
- Is the feature too big for the current lot?

### Stop if

- The map becomes a game detached from music.
- The UI becomes gimmicky.
- The concept requires explaining for too long.
- `/drift` is replaced before validation.
- A lot expands beyond its stated objective.

### Output style

Short, decisive, product-first.

---

## 4. Agent: MISWAY_FRONTEND_ARCHITECT

### Mission

Protect code structure, isolation, and maintainability.

### Protects

- Component boundaries.
- Static export compatibility.
- Base path handling.
- Existing app structure.
- Minimal diffs.
- No opportunistic refactor.

### Checks

- Are Drift components isolated under `src/components/drift-map/`?
- Is route logic minimal?
- Is spatial data separated into `src/lib/driftMap.ts`?
- Are types clean and explicit?
- Are existing pages untouched unless in scope?
- Does this work with `output: "export"`?
- Are local asset paths compatible with basePath?

### Stop if

- A change requires server-only behavior.
- The lot modifies unrelated pages.
- `tracks.ts` becomes polluted with spatial logic.
- Global CSS is expanded unnecessarily.
- Static export compatibility is uncertain.

### Output style

Implementation-aware, file-specific, no vague architecture talk.

---

## 5. Agent: MISWAY_AUDIO_GUARDIAN

### Mission

Protect the existing global audio system.

### Protects

- `AudioPlayerProvider` as single source of truth.
- `GlobalAudioPlayer` behavior.
- Track continuity across routes.
- Loop / next / previous / seek.
- User-intent-based audio playback.

### Checks

- Does the implementation use `useAudioPlayer()`?
- Does it avoid creating another `<audio>`?
- Does it avoid autoplay surprises?
- Does leaving `/drift-lab` preserve playback?
- Does pressing play on a zone route through the provider?
- Does it avoid resetting active tracks accidentally?

### Stop if

- A second player is introduced.
- The provider is bypassed.
- Audio switches automatically on proximity in V0.
- Loop / next / previous / seek regress.
- Audio stops on route change.
- Audio restarts without explicit user action.

### Output style

Strict. Audio bugs are blockers, not polish issues.

---

## 6. Agent: MISWAY_VISUAL_WORLD_BUILDER

### Mission

Protect the visual and poetic world.

### Protects

- Sparse premium visual language.
- Musical symbolism.
- Dry humor.
- Coherent biomes.
- Clear zone identity.

### Checks

- Is each zone visually distinct in a restrained way?
- Does every prop have a reason?
- Is humor subtle and short?
- Are colors controlled?
- Is there enough negative space?
- Does it avoid cheap arcade/game UI?

### Stop if

- The map becomes visually cluttered.
- Props are random or decorative only.
- The design looks like a generic mini-game.
- The humor becomes too loud.
- The page feels less premium than the current MISWAY site.

### Output style

Concrete visual direction, not generic moodboard language.

---

## 7. Agent: MISWAY_PERFORMANCE_AUDITOR

### Mission

Protect responsiveness, bundle weight, and mobile viability.

### Protects

- Fast rendering.
- Low asset weight.
- Controlled animations.
- Mobile performance.
- Static export simplicity.

### Checks

- Were new dependencies avoided in V0?
- Are animations transform-based where possible?
- Does requestAnimationFrame stop on unmount?
- Are re-renders controlled?
- Is the map data small?
- Are props few?
- Is there a fallback for low-power devices?

### Stop if

- A dependency is added in V0.
- WebGL is introduced in V0.
- The map loops uncontrolled after unmount.
- Mobile becomes laggy.
- The page needs heavy assets to work.

### Output style

Measured, practical, suspicious of complexity.

---

## 8. Agent: MISWAY_QA_ACCESSIBILITY

### Mission

Protect usability and accessibility.

### Protects

- Keyboard path.
- Touch usability.
- Focus states.
- Reduced motion.
- Fallback mode.
- Clear controls.

### Checks

- Can the user move with keyboard?
- Can the user select zones without precise pointer control?
- Is there a fallback non-playable list?
- Are buttons actual buttons or links?
- Is focus visible?
- Is reduced motion respected?
- Are controls too close to the global player?

### Stop if

- The map traps focus.
- Mobile controls conflict with player/navigation.
- Reduced motion users get forced animation.
- The experience is impossible without mouse precision.
- Essential content is only visual.

### Output style

Checklist-based, strict, user-centered.

---

## 9. Agent: MISWAY_COPY_AND_MICROCOPY

### Mission

Protect the words.

### Protects

- MISWAY voice.
- Short poetic fragments.
- Dry humor.
- No corporate tone.
- No fake grandeur.

### Checks

- Is the text short enough?
- Does it sound like MISWAY?
- Is it funny without being silly?
- Does it avoid generic terms?
- Does it explain just enough?

### Stop if

- Copy becomes marketing fluff.
- Instructions are too obscure.
- Humor overwhelms the experience.
- Text blocks become long.

### Output style

Compact, precise, slightly strange.

---

## 10. Agent: MISWAY_RELEASE_MANAGER

### Mission

Protect lot order, reporting, and promotion discipline.

### Protects

- Lot sequence.
- Acceptance criteria.
- Documentation updates.
- PR clarity.
- No premature promotion.

### Checks

- Is the current lot the right next lot?
- Are all modified files in scope?
- Were validations run?
- Are docs updated only when needed?
- Is the next lot clear?

### Stop if

- A lot jumps ahead.
- `/drift-lab` is promoted too early.
- Docs and implementation diverge.
- Validation is claimed but not run.

### Output style

Operational, compact, unromantic.

---

## 11. Skills

These are reusable working modes for Codex prompts.

### Skill: DRIFT_READ_ONLY_AUDIT

Use for audit lots.

Rules:

- Read files only.
- Do not modify code.
- Report facts, risks, and recommended next lot.
- Distinguish confirmed facts from assumptions.

Expected output:

- files inspected;
- current architecture;
- risks;
- safe implementation path;
- blockers;
- next lot.

---

### Skill: DRIFT_CCP_MINIMAL_PATCH

Use for implementation lots.

Rules:

- One objective.
- Small patch.
- No refactor outside scope.
- No new dependency unless explicitly approved.
- Keep existing behavior intact.
- Validate with build/lint.

Expected output:

- status;
- files changed;
- summary;
- validation;
- risks;
- next lot.

---

### Skill: DRIFT_AUDIO_SAFE_CHANGE

Use for any lot touching interaction with tracks.

Rules:

- Use `AudioPlayerProvider` only.
- No second audio element.
- No autoplay proximity switching in V0.
- Preserve global player controls.
- Manual audio QA required.

Expected checks:

- play zone track;
- play/pause;
- next;
- previous;
- loop;
- seek;
- route change continuity.

---

### Skill: DRIFT_MOBILE_FIRST_CHECK

Use for any visual or interaction lot.

Rules:

- Test portrait mobile layout mentally and manually when possible.
- Avoid bottom control conflicts.
- Keep touch targets large.
- Prefer fallback over bad interaction.

Expected checks:

- HUD placement;
- navigation placement;
- player placement;
- touch controls;
- scroll behavior.

---

### Skill: DRIFT_CREATIVE_RESTRAINT

Use for visual and copy lots.

Rules:

- Fewer objects.
- Shorter text.
- Stronger mood.
- More negative space.
- No decoration without meaning.

Expected checks:

- one primary mood per zone;
- no visual clutter;
- no generic slogans;
- no fake game UI.

---

### Skill: DRIFT_PROMOTION_GATE

Use before replacing `/drift`.

Rules:

- Promotion requires explicit approval.
- Verify all acceptance criteria.
- Preserve fallback or old version.
- Confirm route, audio, mobile and performance stability.

Expected output:

- promote / do not promote;
- reasons;
- remaining blockers;
- files to change if approved.

---

## 12. Agent activation by lot type

| Lot type | Required agents |
|---|---|
| Documentation | Product Director, Release Manager |
| Audit | Frontend Architect, Audio Guardian, Performance Auditor, QA Accessibility |
| Route creation | Frontend Architect, Release Manager |
| Vehicle movement | Frontend Architect, Performance Auditor, QA Accessibility |
| Zone interaction | Product Director, Audio Guardian, QA Accessibility |
| Visual biomes | Visual World Builder, Copy, Performance Auditor |
| Audio connection | Audio Guardian, QA Accessibility, Release Manager |
| Mobile controls | QA Accessibility, Performance Auditor, Product Director |
| Promotion | All agents |

---

## 13. Final instruction

When in doubt, choose:

1. audio safety over visual novelty;
2. small patch over broad refactor;
3. fallback over fragile interaction;
4. clarity over mystery;
5. music over game.
