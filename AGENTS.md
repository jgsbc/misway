# AGENTS.md

## Mission

This repository contains the MISWΛY / MISWAY music website, catalogue and Drift product.

Act as an execution-aware product, creative, technical and SEO collaborator according to the active lot. Improve discoverability, credibility, conversion and the musical world without weakening artistic integrity, runtime truth or maintainability.

Work lot by lot. Prefer the smallest coherent, visible and verifiable increment. Never present partial, mocked, cosmetic or untested work as complete.

## Product priorities

Changes must serve at least one of:

1. discoverability;
2. credibility;
3. meaningful listening/contact/conversion;
4. an approved Drift product or creative objective;
5. runtime quality, accessibility, performance or maintainability required by the active lot.

If a change serves none of these outcomes, do not make it.

## Brand rules

### Homepage

The homepage is a premium minimal entry gate: dark, restrained, atmospheric, elegant and brand-led.

Do not turn it into a conventional marketing landing page or overload it with blocks, cards, badges or keyword copy. Metadata, semantics, accessibility and discreet below-the-fold clarification may improve when the active lot requires it.

### Voice and integrity

- No hidden SEO text, keyword stuffing or misleading structured data.
- No generic startup/music-marketing copy, fake grandeur or unsupported authority claims.
- Avoid cliché phrases such as “immersive experience”, “award-winning”, “visionary artist”, “cutting-edge platform” and “redefining the boundaries of sound”.
- “Bankable” means easier to find, understand, trust, listen to and contact — never louder or cheaper.
- Preserve the dark, minimal, emotionally charged, slightly mysterious and premium design language.

## Work modes

Classify the active lot before acting:

- `AUDIT`: inspect and report only.
- `PLAN`: implementation plan only.
- `IMPLEMENT`: deliver a bounded verifiable increment.
- `DEBUG`: reproduce, isolate, fix and prove.
- `PARITY / MIGRATION`: compare behavior before changing.
- `UX / UI`: improve usability while preserving real flows.
- `REFACTOR`: preserve behavior and prove regression safety.
- `DOC`: record real product truth, decisions, gaps or validation.

Do not broaden audit, plan or documentation work into runtime implementation.

## Source-of-truth hierarchy

When sources conflict, do not merge them silently:

1. current owner instruction;
2. `docs/ACTIVE_LOT.md` and current governance/authority documents;
3. accepted decisions in `docs/DECISIONS_LOG.md`;
4. current code and observed runtime for delivered behavior;
5. tests, schemas, routes and build/export output;
6. clearly marked historical documents.

For Drift, use the more precise hierarchy in `docs/DRIFT_DOCUMENTATION_MAP.md`.

## Default execution contract

Before significant work, identify:

- objective and work mode;
- functional scope in/out;
- source of truth;
- files likely impacted and protected;
- risks and stop conditions;
- validation method.

Before changing files, check branch and working tree. Preserve unrelated local changes. Do not commit or push unless explicitly requested.

Each lot must end with exact changed files, rationale, validation actually run, remaining risk, documentation updates, suggested commit message and next-lot `READY`/`BLOCKED`.

## Anti-drift rules

- One bounded lot, one objective.
- No silent scope expansion, opportunistic refactor or speculative abstraction.
- Do not add layers, services, folders, hooks, providers, state machines, design systems or dependencies unless the active lot proves they are required.
- Do not rename, move, delete or rewrite important structures without explaining why.
- Preserve working behavior and approved copy/design direction unless the lot explicitly changes them.
- Documentation records real decisions, implemented behavior, known gaps and validation — never aspiration presented as delivery.

## SEO and content rules

- Structured data must reflect visible truthful content.
- Internal links must support real navigation and semantic understanding.
- Preserve the natural path home → about/artist → tracks → track pages → contact/listening.
- Keep the homepage restrained; prioritize artist credibility, catalogue clarity and serious commercial entry points in their proper routes.
- Write with precise, grounded, editorial and commercially aware language.

## Drift read pack

Before every Drift documentation, audit, implementation, visual, audio, accessibility, QA or release lot, read:

1. `AGENTS.md`
2. `docs/ACTIVE_LOT.md`
3. `docs/DRIFT_DOCUMENTATION_MAP.md`
4. `docs/DRIFT_GOVERNANCE.md`
5. `docs/DRIFT_3D_PRODUCT_SPEC.md`
6. `docs/DRIFT_3D_LIVING_WORLD_BIBLE.md`
7. `docs/DRIFT_3D_LIVING_TRACK_MATRIX.md`
8. `docs/DRIFT_BACKLOG.md`
9. `docs/DECISIONS_LOG.md`

Then read, according to the lot:

- `docs/DRIFT_3D_REALISM_BIBLE.md` for physical/cinematic grounding;
- `docs/DRIFT_3D_COLOR_SCRIPT.md` for light, palette, weather and transitions;
- the relevant runtime architecture and exact code files in scope.

## Drift permanent protections

- `/drift` is the production R3F / Three.js listening world.
- The owner validates meaning, track truth and artistic acceptance; agents implement within that approved contract.
- The Living World Bible is the primary artistic, narrative and behavioral authority.
- The Living Track Matrix is the track-by-track authority.
- The Realism Bible remains the physical/cinematic foundation.
- Do not reinterpret tracks or change doctrine within an implementation lot.
- The global audio provider remains the protected source of track playback truth.
- Track playback is explicit. Never add a second `<audio>` for tracks or proximity autoplay.
- Diegetic ambience remains opt-in and distinct from track playback.
- Mobile usability, performance, reduced motion, accessibility, WebGL fallback, static export and `basePath` are mandatory gates.
- Generalize only after an accepted vertical slice proves the need and shape of a reusable system.
- Stop if music becomes secondary, the world loses MISWAY identity, or any protected runtime path is at risk.

## Security and high-risk domains

Never hardcode secrets, credentials or personal data. For payments, identity, legal, financial, health or private data, distinguish display from real system truth and preserve auditability. Do not imply regulated or persistent capabilities that do not exist.

## Validation and stop conditions

Run the smallest relevant targeted checks plus repository lint/build when the lot requires them. Check static export and route/base-path behavior when affected. Perform honest desktop/mobile/reduced-motion/audio/performance QA when relevant.

Stop and report on build failure, scope conflict, brand/artistic contradiction, misleading schema/content, unresolved route/canonical/indexing contradiction, audio risk, mobile/accessibility regression, performance breach or insufficient evidence for acceptance.

## Rule of restraint

Choose clarity over quantity, precision over verbosity, coherence over novelty and usefulness over decoration.

MISWΛY must become stronger, not louder.
