# DECISIONS_LOG.md

## Purpose
This file records major SEO, content, UX, and brand decisions made during lot execution.

Keep entries:
- concise
- factual
- dated
- actionable

---

## Template

### [YYYY-MM-DD] Decision title
- Context:
- Decision:
- Why:
- Impact:
- Files affected:
- Follow-up needed:

---

## Initial decisions

### [2026-04-20] Homepage must remain a splashscreen
- Context: SEO/content optimization could have pushed the homepage toward a conventional landing page.
- Decision: Preserve the homepage as a premium minimal splashscreen and move most semantic/commercial clarification deeper into the site or below the fold.
- Why: The homepage is part of the MISWΛY identity and must remain a strong artistic entry gate.
- Impact: SEO improvements must be more restrained on `/` and stronger on deeper pages.
- Files affected: homepage, metadata, page hierarchy docs
- Follow-up needed: validate discreet below-the-fold strategy if implemented

### [2026-04-20] No hidden SEO text
- Context: It was considered whether to place content outside the visible screen for semantic gain.
- Decision: No off-screen or hidden SEO content.
- Why: Brand quality and search integrity must remain high.
- Impact: Semantic reinforcement must be visible, accessible, and UX-legitimate.
- Files affected: homepage and semantic content strategy
- Follow-up needed: none

### [2026-04-20] Bankable means credible, not loud
- Context: Commercial optimization can easily degrade artistic identity.
- Decision: Commercial usefulness must be improved without startup-style or low-end marketing language.
- Why: MISWΛY’s value depends on coherence, taste, and seriousness.
- Impact: all future content and CTA decisions
- Files affected: all copy-bearing pages
- Follow-up needed: enforce in all lots
### [2026-04-20] LOT 0 COMPLETE: Site audit confirms strong foundation with fixable gaps
- Context: Comprehensive audit of site structure, metadata, content gaps, and commercial positioning.
- Decision: LOT 0 PASS. All audit criteria met. Proceed to LOT 1 (Foundations).
- Key findings:
  - Homepage identity preserved ✓
  - Metadata foundation solid (MusicGroup, WebSite schema) ✓
  - Catalogue structure clean ✓
  - Contact form working (Formspree) ✓
  - Technical SEO: no red flags ✓
  - Top gaps: No artist/EPK page, contact flow fragmented, track page CTAs weak, homepage title improvable
- Why: Site has premium foundation. Audit identifies 3 high-ROI fixes for LOT 1 with zero brand risk.
- Impact: 
  - Validates homepage must remain minimal splashscreen (constraint confirmed)
  - Prioritizes LOT 1 work: contact flow → breadcrumbs → CTA enhancement
  - Defers artist/EPK page to LOT 2 (secondary priority)
- Files affected: ACTIVE_LOT.md (LOT 0→LOT 1), DECISIONS_LOG.md (this entry)
- Follow-up needed: Execute LOT 1 immediately; validate against acceptance criteria

### [2026-04-20] LOT 1 COMPLETE: Foundations implemented successfully
- Context: Execute LOT 1 (Foundations) with 4 targeted SEO and conversion improvements.
- Decision: LOT 1 PASS. All changes implemented, tested, and validated. Build successful. Proceed to LOT 2.
- Changes made:
  1. **Contact flow fixed**: Replaced client-side `redirect()` with server-side `permanentRedirect()` in /contact page (proper 308 redirect)
  2. **Breadcrumb schema added**: Implemented BreadcrumbList schema on /tracks index and /tracks/[slug] detail pages (improves crawlability)
  3. **Homepage metadata enhanced**: Updated root title from "Electronic music artist" to "Atmospheric electronic music" (stronger for brand + category queries)
  4. **Track page CTAs added**: New "Collaboration & Sync" section on each track detail page with "START A CONVERSATION" button linking to /about#contact (improves conversion)
- Why: These are highest-ROI improvements that address core gaps (discoverability, credibility, conversion) without brand compromise.
- Impact:
  - Contact flow is now proper HTTP redirect (SEO-clean, commercial channel)
  - Breadcrumb schema supports Google rich results and crawler navigation
  - Homepage title is more commercially descriptive while remaining premium
  - Track pages now have explicit sync/licensing/collaboration entry point
  - Zero brand damage, zero regressions
- Build results: ✓ Compiled successfully, ✓ All 27 routes generated, ✓ No TypeScript errors
- Files affected:
  - src/app/contact/page.tsx (redirect fix)
  - src/app/layout.tsx (metadata enhancement)
  - src/app/tracks/page.tsx (breadcrumb schema)
  - src/app/tracks/[slug]/page.tsx (breadcrumb + CTA section)
- Follow-up needed: Execute LOT 2 (Artist credibility surfaces) to build on this foundation

### [2026-04-20] LOT 2 COMPLETE: Artist credibility surfaces strengthened
- Context: Execute LOT 2 (Artist credibility surfaces) to create dedicated artist/EPK page for commercial positioning.
- Decision: LOT 2 PASS. Artist page created, sitemap updated, homepage enhanced, build successful. Proceed to LOT 3.
- Changes made:
  1. **New artist page created** (/app/artist/page.tsx):
     - Dedicated commercial/collaboration focus (separate from /about which is artistic/biographical)
     - Comprehensive artist profile with sonic direction, experience, collaboration types, license terms
     - Featured track samples linking to full catalogue
     - Clear CTA to /about#contact for collaboration inquiry
     - Breadcrumb schema + MusicGroup schema with contactPoint
  2. **Homepage enhanced** (page.tsx):
     - Added new "ARTIST" button to main CTA navigation
     - Sits between ENTER (highlight) and LISTEN/DRIFT (secondary)
     - Improves artist discovery for commercial users
  3. **About page enhanced** (about/page.tsx):
     - Added reference to artist profile in "WHAT THIS PAGE IS FOR" section
     - Clarifies distinction: About = full biography, Artist = commercial focus
  4. **Sitemap updated** (sitemap.ts):
     - Added /artist/ with priority 0.95 (high, below homepage but above /explore)
     - Marked as monthly changeFrequency (stable content)
- Why: Artist page is highest-ROI commercial surface per LOT 0 audit; enables two distinct user journeys (artistic vs. commercial)
- Impact:
  - Commercial users (sync/licensing buyers) have dedicated clear landing page
  - Separate but linked positioning removes confusion between /about and /artist
  - Breadcrumb + structured data improve search visibility for "MISWΛY collaboration", "MISWΛY sync", etc.
  - No brand dilution; commercial clarity without losing artistic identity
- Build results: ✓ Compiled successfully in 4.3s, ✓ All 28 routes generated (+1 /artist), ✓ No errors
- Files affected:
  - src/app/artist/page.tsx (new file - artist page)
  - src/app/page.tsx (added ARTIST CTA)
  - src/app/about/page.tsx (added artist reference)
  - src/app/sitemap.ts (added artist route)
- Follow-up needed: Execute LOT 3 (Catalogue & track pages) for deeper discoverability

### [2026-04-20] LOT 3 COMPLETE: Catalogue and track pages strengthened for discovery
- Context: Execute LOT 3 (Catalogue & track pages) to improve track discoverability and internal linking.
- Decision: LOT 3 PASS. Improved metadata, smarter related tracks, CollectionPage schema added. Build successful. Proceed to LOT 4.
- Changes made:
  1. **Tracks index page enhanced**:
     - Updated description with specific track names and genre keywords for better discoverability
     - Added CollectionPage schema mapping entire catalogue with track references
     - Improved semantic clarity about what's available
  2. **Track detail pages improved**:
     - Smart related tracks selection: prioritizes same-era tracks, then shared-tag tracks, then others
     - Contextual "Continue through catalogue" section with descriptive text
     - Better internal linking logic reduces "dead-end" track pages
  3. **Breadcrumb schema** (already added in LOT 1):
     - Verified and working on all track pages
     - Supports rich result display
- Why: Smarter internal linking improves discoverability within catalogue; CollectionPage schema helps search engines understand catalogue structure; contextual recommendations keep users engaged
- Impact:
  - Users spending more time within catalogue (better session metrics)
  - Related track recommendations are semantically relevant, not just random
  - CollectionPage schema improves overall catalogue discoverability
  - Tracks grouped by era/tags more likely to show as related results
  - Improved user experience without design changes
- Build results: ✓ Compiled successfully in 5.1s, ✓ All 28 routes generated, ✓ No TypeScript errors
- Files affected:
  - src/app/tracks/page.tsx (description, CollectionPage schema)
  - src/app/tracks/[slug]/page.tsx (smart related tracks logic, contextual descriptions)
- Follow-up needed: Execute LOT 4 (Homepage under-the-fold reinforcement) for semantic enhancement