# Mixamo / Adobe — licence terms note (evaluated and REJECTED for repository-bundled use, per this lot's explicit Mixamo Rule)

**Official source:** Adobe General Terms of Use, https://www.adobe.com/legal/terms.html
**Published/effective:** October 3, 2025 ("These General Terms of Use replace and supersede all prior versions").
**Retrieved:** 2026-08-03, this session, via direct browser navigation to the live page.
**Confirmed: no Mixamo-specific "Product Specific Terms" exist.** The General Terms page lists every product with its own additional terms (Acrobat Services, Acrobat Sign, ColdFusion, Collaboration Space, Developer, Express, Fonts, Generative AI, Spark, Stock, Stock Contributor, Substance 3D Assets, Substance 3D Community Assets, Behance, Business Customers, Demo Assets, Document Cloud, Frame.io, Fuse, InDesign Server, K-12/Higher Ed, Lightroom, Medium, Photoshop Express, Project Aqua, Software) — **"Mixamo" does not appear anywhere on this page** (confirmed via direct text search of the live DOM, zero matches). This means Mixamo characters/animations are governed **only** by the General Terms' own §3.6 "Content Files" clause.

**§3.6 "Content Files" — exact clause (verbatim, extracted directly from the live page):**
> "'Content Files' means Adobe assets provided as part of the Services and Software. Unless documentation or specific licenses (including but not limited to Product Specific Terms) state otherwise, we grant you a personal, non-exclusive, non-sublicensable (except if you are a Business, then sublicensable only to your Business Users), and non-transferable license to use the Content Files to create your end use (i.e., the derivative application or product authored by you) into which the Content Files, or derivations thereof, are embedded for your use ("End Use"). You may modify the Content Files prior to embedding them in the End Use. **You may reproduce and distribute Content Files only in connection with your End Use, however, under no circumstances can you distribute the Content Files on a stand-alone basis, outside of the End Use.**"

**Conclusion, applying this lot's own Mixamo Rule directly:**
- Redistribution of raw character/animation files: **prohibited on a stand-alone basis.**
- Committing source or converted Mixamo files (`.fbx`, `.glb`) to a **public GitHub repository**: this makes the raw file extractable/clonable as a stand-alone asset by anyone, independent of any compiled "End Use" — this is exactly what §3.6 forbids. **Incompatible.**
- Derived runtime distribution (e.g. shipping the static-exported Drift site with Mixamo-sourced geometry/animation baked into the built, non-extractable bundle) is closer to the "embedded in an End Use" case the clause does permit, but the repository itself (the actual deliverable of this evaluation) would still contain the raw stand-alone source files during development — still incompatible with a public repo.

**No SPDX identifier applies** — this is a proprietary Adobe click-through/terms-of-service licence, not an open-source or Creative Commons licence; no SPDX identifier is invented for it.

**Verdict: `REJECT` for repository-bundled use.** No Mixamo file was downloaded — the rejection is based entirely on the primary-source terms above, per this lot's own instruction not to download-then-reject when terms alone are already dispositive. A genuinely open alternative (Quaternius, `CC0-1.0`) was evaluated in its place — see `quaternius-terms-note.md`.
