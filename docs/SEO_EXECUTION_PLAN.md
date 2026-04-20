# SEO_EXECUTION_PLAN.md

## Objective
Turn the MISWΛY / MISWAY website into a search-friendly, commercially credible, premium artist website that preserves its artistic identity while improving discoverability, authority, and conversion.

---

## Global success criteria

The project succeeds if the site becomes:

- easier to understand by search engines,
- better aligned with brand and artist queries,
- stronger on artist identity and trust,
- stronger on track-level discovery,
- more coherent as an artist catalogue,
- more useful for collaboration / sync / licensing / serious contact.

---

## Lot structure

---

# LOT 0 — Audit & strategic diagnosis

## Goal
Produce a precise diagnosis of the site's current SEO, semantic architecture, content gaps, and commercial weaknesses.

## Scope
- no major UI rewrite
- no premature copy rewrite
- no speculative technical overhaul

## Deliverables
- current page inventory
- metadata inventory
- semantic gap analysis
- query intent assumptions by page
- risk list
- recommended priorities

## Acceptance criteria
- audit is specific
- conclusions are page-aware
- no generic SEO advice
- clear next-lot justification exists

## Validation
- repo inspected
- page types mapped
- existing strengths preserved in analysis

---

# LOT 1 — Foundations: metadata, crawlability, indexation

## Goal
Make the site technically understandable and indexable without degrading the brand.

## Scope
- global metadata
- canonical strategy
- sitemap
- robots
- title/description consistency
- GitHub Pages path sanity
- homepage metadata only if needed

## Files likely involved
- app/layout.*
- app/sitemap.*
- app/robots.*
- public/robots.txt
- public/sitemap.xml
- helpers for canonical/base URL logic

## Deliverables
- clean global metadata
- coherent canonical strategy
- working sitemap
- crawl-safe robots
- no duplicate/conflicting sitemap source

## Acceptance criteria
- build passes
- sitemap served cleanly
- robots served cleanly
- canonical logic is coherent
- no indexation contradiction

## Validation
- run build
- verify public sitemap URL
- verify public robots URL
- inspect generated output paths

---

# LOT 2 — Artist credibility surfaces

## Goal
Strengthen artist identity, trust, and commercial seriousness.

## Scope
- about page
- artist page or EPK page if justified
- contact framing
- collaboration positioning
- sonic identity clarity

## Files likely involved
- app/about/*
- app/artist/* or app/epk/*
- contact-related sections

## Deliverables
- strong artist page copy
- stronger commercial legitimacy
- clear positioning of MISWΛY / MISWAY
- no brand cheapening

## Acceptance criteria
- artist identity is explicit
- commercial usefulness increases
- tone remains premium
- page feels intentional, not salesy

## Validation
- read page in full
- check metadata
- check CTA coherence
- ensure no startup tone

---

# LOT 3 — Catalogue & track pages

## Goal
Turn tracks and catalogue pages into stronger search and conversion surfaces.

## Scope
- tracks index page
- track template
- track metadata
- internal links
- track-level structured data
- contextual copy improvement

## Files likely involved
- app/tracks/page.*
- app/tracks/[slug]/page.*
- lib/tracks.*
- any related components

## Deliverables
- stronger catalogue page
- stronger track detail pages
- better searchability for track intent
- better continuation paths inside catalogue

## Acceptance criteria
- track pages feel like real content pages
- semantic richness improves
- structured data reflects visible content
- related navigation is useful

## Validation
- check at least 3 track pages
- verify metadata generation
- verify schema integrity
- verify internal linking

---

# LOT 4 — Homepage under-the-fold reinforcement

## Goal
Preserve the homepage splashscreen while making the root URL more semantically useful.

## Scope
- keep hero minimal
- keep background isolated to first viewport
- add discreet below-the-fold semantic block
- clarify brand softly
- no landing-page transformation

## Files likely involved
- app/page.*
- possible related homepage components

## Deliverables
- premium splashscreen preserved
- discreet semantic reinforcement below fold
- no homepage bloat
- stronger root-page relevance

## Acceptance criteria
- homepage still feels like a splashscreen
- added content remains discreet
- no SEO abuse
- page remains elegant on mobile and desktop

## Validation
- visual sanity check
- viewport behavior check
- confirm below-fold content is understated
- confirm content improves understanding

---

# LOT 5 — Commercial conversion layer

## Goal
Make the site more commercially actionable without becoming vulgar.

## Scope
- collaboration framing
- sync / licensing / project inquiry cues
- strategic CTA refinement
- listening-to-contact transitions
- artist / track / about cross-conversion

## Deliverables
- more serious contact framing
- more useful CTA hierarchy
- stronger commercial utility

## Acceptance criteria
- conversion is easier
- tone remains premium
- no aggressive marketing patterns

## Validation
- trace user path from discovery to contact
- trace user path from track page to deeper exploration
- confirm subtle but clear CTA logic

---

# LOT 6 — Off-site alignment recommendations

## Goal
Align the site's message with external profiles and brand signals.

## Scope
- SoundCloud alignment recommendations
- bio consistency recommendations
- backlink targets
- Search Console recommendations
- brand query capture suggestions

## Deliverables
- off-site alignment checklist
- brand consistency recommendations
- indexing / monitoring checklist

## Acceptance criteria
- recommendations are realistic
- tightly connected to site strategy
- no fluff

## Validation
- recommendations are actionable
- recommendation quality > quantity

---

## Execution rule

The agent must:
- execute lots in order,
- never skip validation,
- never continue after a failed lot,
- update ACTIVE_LOT and DECISIONS_LOG after each lot.

---

## Priority principle

When trade-offs appear, prioritize:
1. brand integrity
2. semantic clarity
3. commercial usefulness
4. implementation simplicity
5. volume of output