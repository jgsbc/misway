# ACTIVE_LOT.md

## Current Lot: DRIFT-PUBLISH-TRACKS-ADD-02

**Status:** PASS.

### Objective
Integrate `ÉTÉÉAOOÉTÉ` and `EUX GAINENT` into the MISWAY catalogue, static track routes, audio path mapping, Drift 3D topology, Drift 3D landmarks and Drift documentation without changing route structure, dependencies or audio-player architecture.

### Scope Completed
- Catalogue entries added for `eteeaooete` and `eux-gainent`.
- Explicit audio filenames set for both new tracks.
- Existing `Panthere` audio casing corrected with `audioFile: "panthere.mp3"`.
- Drift 3D topology expanded to 26 track nodes.
- Drift 3D landmarks added for the glass gym and ocean lambda ritual.
- Local dawn/salt-haze atmosphere added for `eteeaooete`.
- 2D `/drift-lab` map left unchanged because its V0 design is already capped at 8 readable zones.
- Drift 3D documentation updated minimally.

### Validation
- Source sanity check: PASS (26 tracks, 26 nodes, no missing audio files, new slugs resolve).
- `npm run lint`: PASS.
- `npm run build`: PASS (38 static pages generated).
- `git diff --check`: PASS.
- `git status --short --untracked-files=all`: expected modified files only.

### Next Status
READY for owner review and visual QA of the two new Drift 3D nodes.

---

## Current Evolution Phase: UX/UI Refactor

**Phase: Light Theme & Content Simplification**

### Lot Status: IN PROGRESS (Session 3)

#### Completed in This Session:
1. ✓ Removed `/explore` route completely (directory + component deleted)
2. ✓ Adapted DriftPageClient to light theme (all styling updated)
3. ✓ Adapted TrackInlinePlayer to light theme (button + progress bar)
4. ✓ Updated light-theme.css with `.light-text-tertiary` and `.light-card-hover` utilities
5. ✓ Removed old about/page-old.tsx (stale file causing compilation error)
6. ✓ Fixed Compass import warning in Navigation.tsx
7. ✓ Full project build validation: SUCCESS (28 routes, all compiled)

#### Remaining Tasks (Priority Order):
- [ ] Manual validation of all pages for contrast, readability, visual consistency
- [ ] Verify audio player responsiveness on light backgrounds
- [ ] Test accessibility (WCAG contrast ratios) across all light theme pages
- [ ] Validate that humor/voice is preserved in adapted content

#### Build Status:
- **Compilation:** ✓ PASS
- **Routes:** 28 total (no 404s)
- **Static Export:** ✓ PASS
- **Lint:** ✓ PASS (1 unused import removed)

---

## Earlier Transformation Work

**Prior SEO/Metadata LOTs (Completed):**
- LOT 0 — Audit & strategic diagnosis: PASS ✓
- LOT 1 — Foundations: metadata, crawlability, indexation: PASS ✓
- LOT 2 — Artist credibility surfaces: PASS ✓
- LOT 3 — Catalogue & track pages: PASS ✓
- LOT 4 — Homepage under-the-fold reinforcement: PASS ✓
- LOT 5 — Commercial conversion layer: PASS ✓
- LOT 6 — Off-site alignment recommendations: PASS ✓

**SEO Final Status:**
The site is now search-friendly, commercially credible, premium brand-aligned, and actionable. Off-site alignment (SoundCloud bio, Search Console, backlinks) remains as manual action items — see LOT6_OFF_SITE_ALIGNMENT.md for checklist.

---

## Mandatory Context Reads
- /AGENTS.md (brand rules, strategic objectives, execution model)
- /docs/SEO_EXECUTION_PLAN.md (overall strategy)
- /docs/SEO_PAGE_MAP.md (page inventory)
- /docs/DECISIONS_LOG.md (all decisions made)
- validated homepage metadata
- clean build with no regressions
- updated sitemap coverage
build passes without errors
- contact flow works (no redirects)
- breadcrumb schema validates correctly
- track page CTAs are visible and functional
- homepage metadata is optimized but brand-preserving
- no regressions in existing pages
- sitemap reflects all changes
- all structured data reflects visible contented
- no generic advice
- no ubuild passes
- [ ] contact page flow validated (no redirect)
- [ ] breadcrumb schema in place and validates
- [ ] track page CTAs tested
- [ ] homepage metadata reviewed and brand-safe
- [ ] sitemap URL paths correct
- [ ] robots.txt blocks nothing
- [ ] zero regressions on existing pages
- [ ] structured data audit complete
- [ ] sitemap/robots reviewed
- [ 2 — Artist credibility surfaces (create artist/EPK page, strengthen contact positioning)

## Stop conditions
Stop if:
- build fails
- contact flow replacement breaks form submission
- breadcrumb schema validation errors
- GitHub Pages path issues emerge
- Brand identity is compromised

## Update rule
At the end of the lot:
- update this file
- mark current lot PASS or BLOCKED
- set next lot only if current lot is validated
- record all changes in DECISIONS_LOG.md
At the end of the lot:
- update this file,
- mark current lot PASS or BLOCKED,
- set next lot only if current lot is validated.
