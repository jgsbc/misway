# DRIFT-IV-GOV-40 — Reconciliation Ledger

**Status:** `GOVERNANCE RECONCILIATION RECORD` — `ALL OWNER DECISIONS FINAL, READY TO COMMIT` — supports `DRIFT_3D_GLOBAL_ART_DIRECTION.md`, `DRIFT_3D_ERA_TRACK_ATLAS.md`, `DRIFT_3D_ASSET_REUSE_MATRIX.md`, `DRIFT_3D_MASTERFRAME_BRIEFS.md`, `DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`, `DRIFT_3D_RUNTIME_MIGRATION_MAP.md`, the `DRIFT_3D_INTEGRAL_BACKLOG.md` v4.0 resequencing (`PRE-*` redefined), and this final pass's corrections to `DRIFT_3D_LIVING_TRACK_MATRIX.md` (PANTHERE `P3`) and `DRIFT_3D_PRODUCT_SPEC.md` (EUX GAINENT branch/commit state).
**Not an execution sequence.** Documentation-only. No runtime, asset, audio, cue, node, collider, or camera change. `PRE-00` not started; this lot is ready to commit, not merged, not delivered.

Every statement in the GOV-40 deliverables is tagged here:

- `CONFIRMED` — directly stated by an existing `ACTIVE AUTHORITY` document, quoted or accurately paraphrased.
- `CONFLICTING` — two or more active documents disagree, or a new owner instruction (this lot) explicitly reverses a prior approved decision.
- `UNDER-SPECIFIED` — approved in principle but never elaborated with usable content; the gap is named, never silently filled.
- `SUPERSEDED` — an older document's content no longer governs, and a newer one has taken its place.

---

## 1. Authority conflicts found

### 1.1 Industrialization gate order — `CONFLICTING`, resolved by this lot

- **Prior decision** (`DRIFT_3D_INTEGRAL_PACKAGE_ADOPTION.md` founding decision #9, reaffirmed by `DRIFT-IV-GOV-30`): *"Gate d'industrialisation après trois vertical slices... aucune abstraction partagée avant preuve sur au moins deux scènes."* `DRIFT_3D_INTEGRAL_BACKLOG.md` §8.1 explicitly **forbids** a shared residue registry and other cross-track abstractions before the `IND-00/10/20` gate.
- **Fact on the ground**: only **one** of the three proof slices (EUX GAINENT) has been built. MORNE, ET ? and ÉTÉÉAOOÉTÉ have not started.
- **New owner instruction** (this lot, `DRIFT-IV-GOV-40`, verbatim intent): pause track-by-track work, define reuse-first shared-world kits and gates **before** continuing track builds — the opposite sequencing.
- **Resolution**: the owner's instruction in this lot is a **new explicit decision** and formally supersedes founding decision #9's *sequencing* only. It does not reopen or weaken any *artistic* decision (North Star, era contracts, EUX GAINENT's approved identity). Recorded as superseded in `docs/DECISIONS_LOG.md` under this lot's entry. The backlog resequencing (§6 of this ledger) introduces the new `DRIFT-IV-PRE-*` gate group ahead of further track lots and marks the old "wait for 3 proof slices, then IND-00" language `SUPERSEDED_BY_GOV-40` rather than deleting it (history is preserved, not erased).

### 1.2 EUX GAINENT: two divergent runtime states — `RESOLVED` by the `DRIFT-IV-GOV-40` rebase onto `main@b069d09` (previously `CONFLICTING`, resolved only by dual accounting)

- **Historical state, as it stood before this rebase**: `main` (`d2a1c15`) shipped only the `DRIFT-IV-BY-EUX-20` proof slice (athletes as raw cylinder+sphere primitives, stations as single boxes, all inline in `EuxGainentLivingScene.tsx`), while a separate, unmerged branch (`drift-iv-by-eux-30-owner-acceptance`, commit `c5ca4da847e2dab24f39b50025384f80fe6ca857`) held a substantially reworked V2/V3 candidate not yet merged or accepted.
- **Current state, this rebase**: `DRIFT-IV-BY-EUX-30` received the owner's final `ACCEPTED` verdict and merged to `main` via **PR #32 at commit `b069d09`**. The two states are no longer divergent — `main` now ships the richer V2/V3 build directly. `docs/DRIFT_3D_RUNTIME_MIGRATION_MAP.md` §0 records the updated classification (`DONE — MERGED`, superseding the prior `UNMERGED OWNER-VALIDATED CANDIDATE` label); the historical branch-head commit `c5ca4da` is kept only as context for where the work was authored, never as the current state.
- This conflict is fully resolved, not merely dual-accounted: there is now one true state (`main@b069d09`), not two.

### 1.3 `DRIFT_3D_PRODUCT_SPEC.md` referenced a stale pre-merge state — `RESOLVED`, corrected twice (once per correction pass, then again for the `BY-EUX-30` merge)

- **First staleness** (resolved in the prior correction pass): the Product Spec previously read *"The EUX GAINENT implementation candidate is preserved on the historical branch at `ad21600` and is not yet integrated on `main`"* — stale because `BY-EUX-20` (PR #31) had already merged at `d2a1c15`, and `ad21600` was never the richer candidate's own commit. Corrected at that time to cite the `UNMERGED OWNER-VALIDATED CANDIDATE` classification at branch `drift-iv-by-eux-30-owner-acceptance`, commit `c5ca4da847e2dab24f39b50025384f80fe6ca857`.
- **Second staleness** (resolved this rebase): that correction was itself superseded within days by `DRIFT-IV-BY-EUX-30`'s own merge — the candidate was no longer unmerged. `docs/DRIFT_3D_PRODUCT_SPEC.md`'s "Current boundaries" section is now corrected again — it states both `BY-EUX-20` and `BY-EUX-30` as merged and shipped (`d2a1c15`/PR #31, `b069d09`/PR #32), and the prerequisite chain now starts from `DRIFT-IV-GOV-40`'s own merge rather than from `BY-EUX-30`'s. No longer flagged as an open item at all.

### 1.4 `docs/DRIFT_GOVERNANCE.md` is not this program's governance doc — `SUPERSEDED` / mis-scoped, not corrected in place

- `DRIFT_GOVERNANCE.md`'s own read pack, branch-naming examples and closing lot reference (`DRIFT-AUDIT-00`) all belong to the earlier, retired 2D "Drift Map" prototype track — it never mentions `DRIFT-IV`, any `GOV-*` lot, or the Integral Backlog.
- **Resolution**: this file is **not** part of GOV-40's read pack and is not cited as process authority anywhere in these deliverables. `AGENTS.md` and `DRIFT_3D_INTEGRAL_BACKLOG.md` §1/§16/§19 remain the real process/single-backlog authorities. Not edited in this lot (out of scope; a documentation-hygiene note only).

### 1.5 Two North Star statements — `CONFIRMED` reconciled, not a real conflict

`DRIFT_3D_LIVING_WORLD_BIBLE.md` §1.1 and `DRIFT_3D_INTEGRAL_PACKAGE_ADOPTION.md` founding decision #1 word the North Star differently (contamination-of-a-credible-world vs. rupture/sacrifice). The Living World Bible itself reconciles them explicitly (*"la seconde met en scène la première ; elle ne la remplace pas"*) — both are quoted together in `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §1 rather than treated as competing.

### 1.6 Track-level disagreements between `DRIFT_3D_LIVING_TRACK_MATRIX.md` and `DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md` — three `RESOLVED — OWNER-DECIDED HYBRID` (owner decision session, this correction), two unchanged

Three of these were genuine content disagreements between two documents both currently active/preliminary. GOV-40 does not ordinarily adjudicate them — a track's own Identity Contract is normally the only authority allowed to settle its anomaly/signature — but in the decision session that produced this correction, **the owner directly exercised that authority at the governance level**, an explicit, recorded exception, not a silent reinterpretation by this document's author. Exact quoted wording from both sources, the reasoning, and the final adopted text are preserved in full in the owner decision-session transcript; summarized here:

- **DAYMASON — central anomaly, `RESOLVED — OWNER-DECIDED HYBRID`.** Living Track Matrix: *"les regards peints ne suivent pas le véhicule mais son ombre"* (painted gazes track the vehicle's shadow) — a watching anomaly. Implementation Matrix V2: *"L'ombre et la brume révèlent une seconde architecture enfouie"* — no gaze content at all, purely spatial. **Owner decision: keep the Matrix's shadow-tracking gaze as the central anomaly** (directly grounded in the owner's own "hidden truth, eyes, gaze and hate" material — the reading Source B alone could not support); **use fog + the shadow relationship to reveal the offset second architecture as the signature**, combining rather than choosing. Recorded in `docs/DRIFT_3D_ERA_TRACK_ATLAS.md`'s Daymason entry. Also surfaced this session: Implementation Matrix V2's own continuity field states *"Son ombre rejoint PANTHERE"* — a third, previously unrecorded cross-era echo, not yet added to the Atlas's continuity field for either track, flagged for a future pass.
- **BLOSSOMING — signature, `RESOLVED — OWNER-DECIDED HYBRID`.** Living Track Matrix: *"wingsuit vide, kayak sans rameur et VTT sans pilote traversent successivement le paysage"* (3 objects, sequential). Implementation Matrix V2: *"Wingsuit, kayak, VTT et parapente dessinent une fleur impossible"* (4 objects, composed simultaneously). **Owner decision: sequential riderless-object crossing as the build-up, converging into one briefly-held impossible flower as the resolving signature frame** — combines both; adopts V2's fourth object (paraglider) as a non-contradictory superset. Recorded in the Atlas's Blossoming entry.
- **HOLD THE LIGHT — signature, `RESOLVED — OWNER-DECIDED HYBRID`.** Living Track Matrix: solo transformation (rain→ink, lightning→tears, moor→flat color) plus a separate hidden interaction (the player's own shadow revealed holding the light). Implementation Matrix V2: *"L'impact révèle que plusieurs personnes tiennent ailleurs"* (several people holding light elsewhere) — populous, no own-shadow content. **Owner decision: keep both the graphic halo transformation and the player's own shadow reveal; after a held stillness, additionally reveal several small distant lights held by others** — layers Source B's content onto Source A's mechanic rather than replacing it. Recorded in the Atlas's Hold The Light entry.
- **"LE MONDE S'ENDORT" apostrophe** — unchanged, not part of this decision session; still resolved by the runtime `src/lib/tracks.ts` tie-break rule (code wins on conflict).
- **New Signal's "l'intérieur déborde" tagline** — unchanged, still un-sourced against the Era Contract alone, not touched by this session.

**All three hybrid resolutions are owner-approved syntheses (`OWNER_APPROVED_SYNTHESIS`), not repository extractions** — a future Identity Contract for each track should treat them as the settled starting point and would need an equally explicit new owner decision to reopen any of them.

### 1.7 Owner-provided artistic source material — `CONFIRMED`, integrated by this correction

**The repository was never the only artistic source.** The initial GOV-40 pass reconciled only the repository's own documents (Living Track Matrix, Implementation Matrix V2, Era Contracts, runtime `shortText`/`longText`) and concluded, incorrectly, that "personal/lived source" was absent from *all* sources for all 26 tracks. That conclusion was invalid: the owner had already communicated real thematic, emotional and experiential material for Entry Ambient and every track across this project's own conversations, and this ledger's original §2 table failed to treat that conversation as a source at all. This is a methodological correction, recorded here rather than silently applied: **direct owner statements made in conversation are `OWNER_DIRECT` source material**, standing alongside repository documents, not subordinate to them.

The owner supplied the following brief, organized by era, explicitly as "OWNER-PROVIDED ARTISTIC SOURCE MATERIAL" to be reconciled with repository authorities. Reproduced here as the ledger's own citation point (the Track Atlas's per-entry **Personal/lived source** fields draw from this brief, each item used exactly once):

> **ENTRY AMBIENT** — dark mineral cave; visual continuity with the MISWAY hero image; luminous λ-shaped exit; transition from confinement into the colored world.
>
> **BIRTH YARD** (era: city, swarming life, violence, dirt, traffic, work and collective pressure) — A WALK IN ZEELAND: solitude, canals, road, sunset. FOOLFOULE: rush hour, skyscrapers, almost-robotic crowd. JAZZYPLING: dark alleys, jazz cellars and clubs. PLAY IT: suit, metro, work, rules and repetition. EUX GAINENT: athletes seen through gym windows like robots; machines train, measure and correct humans.
>
> **OLDER SHADOWS** (era: fun, African travel, extreme sports, mountain, physical freedom becoming memory) — RISE: ascent, summit, success. BLOSSOMING: confidence, adrenaline, extreme sports. ETHNIC STICK: Africa, values, ethics and encounters. MINUIT MOINS CINQ: fork between risk and routine. PERDUE: a relationship, company or person fading away.
>
> **VEGETATIVE FIELD** (era: work, daily routine, comfortable flatness, artificial happiness, functioning without fully living) — MORNE, ET ?: artificial happiness and nihilism. DAYMASON: hidden truth, eyes, gaze and hate. CHAILK: reset to zero and emptiness. TIME: collapse and temporal paradox. TANTITOM: gradual recovery of color and lightness.
>
> **NEW SIGNAL** (era: return of color, inner world, shadow and light, gold and silver, reconstruction without erasure, lambda becoming an ordinary world form) — NEEKTAREUM: responsibility, victim/actor choice, darkness. ASITIS: cold, fear and acceptance. RELATIVE: well, upward kick, self-confidence. OVERTHINK: mental loops, cracked roads, impossible forks. HOLD THE LIGHT: storm and light that must be protected. MIDNIGHT WORK: night office, solitude, windows and stars. TELATELABA: distance, mirror, here and elsewhere. LE MONDE S'ENDORT: city progressively shutting down. RENEE: raw then polished light, renewal. PANTHERE: acceptance and looking forward; repeated "en" and "r" sounds — panthère, enterre, qu'en faire, enchaîne, entraîne. ÉTÉÉAOOÉTÉ: lambda ritual on an ocean beach with immense waves.

**Reconciliation outcome:** for the large majority of tracks, this owner material *confirms* the theme/emotion already inferred in the original GOV-40 pass from runtime `shortText`/`longText` alone (e.g. MORNE ET?, CHAILK, TANTITOM, HOLD THE LIGHT, TELATELABA, LE MONDE S'ENDORT, ÉTÉÉAOOÉTÉ — near-exact or exact matches) — tagged `OWNER_DIRECT` + `REPOSITORY_AUTHORITY` in the Atlas. For several tracks it adds genuinely new content no source had previously recorded: DAYMASON's "hate" (the track's anomaly was previously known only as a `CONFLICTING` mechanic with no emotional charge attached); RELATIVE's "self-confidence, upward kick" (the prior reading was neutral-philosophical); RENEE's "raw then polished light" (a lighting-arc fact, not previously present in any source); PANTHERE's phonetic wordplay device (*panthère, enterre, qu'en faire, enchaîne, entraîne* — with no repository precedent of any kind); and Entry Ambient's MISWAY hero-image continuity (a cross-medium fact, not a repository fact). None of this is invented — it is reconciled, sourced, and tagged `OWNER_DIRECT` throughout the Atlas (see `docs/DRIFT_3D_ERA_TRACK_ATLAS.md`, every entry's **Personal/lived source** and **Source traceability** fields). Full per-track integration and the six-value source-traceability taxonomy (`OWNER_DIRECT` / `OWNER_APPROVED_SYNTHESIS` / `REPOSITORY_AUTHORITY` / `INFERENCE_REQUIRING_OWNER_REVIEW` / `MISSING` / `CONFLICTING`) are recorded there, not duplicated here.

**New Signal's "lambda becoming an ordinary world form"** is a distinct worldbuilding fact surfaced only by this owner material — no repository document states that the λ motif's exceptionality *decreases* by New Signal. **Resolved in the second, owner decision-session correction**: `docs/DRIFT_3D_GLOBAL_ART_DIRECTION.md` §11 now states the full four-stage progression (exceptional threshold → rare/embedded → increasingly recognizable → ordinary world-form), owner-decided and reworked from this document's own first proposal on the subject — see that section for the adopted wording, including the explicit withdrawal of an unsupported interpretive claim ("the world is not yet ready to recognize its own door") the first proposal had included.

---

## 2. Under-specified items (named, not invented)

| Item | Where approved | What's missing |
|---|---|---|
| Twelve silent recurring archetypes | `DRIFT_3D_INTEGRAL_PACKAGE_ADOPTION.md` decision #4 | Only the *count* and two examples are on record ("employé en retard," "personne qui attend," "enfant suivant l'invisible"); the complete list of twelve does not exist in any active document read for this reconciliation. **Unaffected by the owner decision session** — the human-presence doctrine now exists (`DRIFT_3D_GLOBAL_ART_DIRECTION.md` §9), but names none of the remaining nine archetypes; the owner's rework request was for the governing rule, not the missing names. |
| `GLOB-00` through `GLOB-90` | `DRIFT_3D_INTEGRAL_BACKLOG.md` §15 | Ten lots exist by count only; no individual lot has a stated deliverable anywhere in the backlog. Not touched by this lot's resequencing beyond noting the gap. |
| KTX2 / Meshopt / Draco policy | — | Never formalized in `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`; exists only as informal "leftover" notes in `DECISIONS_LOG.md`. `docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md` is the first document to define an actual policy — recorded there as new, not as a formalization of prior intent. |
| "Emotional question" phrased as a question, per track | — | Every source states an emotional *truth* (declarative), never a question. The Atlas phrases each track's field as a question derived from that truth, marked as authored framing, not verbatim source content. |
| Track-specific prohibited interpretations | Implementation Matrix V2 | Only 3 of 26 tracks (Eux Gainent, Ethnic Stick, Panthere) carry a track-specific prohibition beyond the identical generic era boilerplate repeated for all 26. The Atlas states the generic boilerplate once at the era level rather than repeating it 26 times, and flags the 3 real track-specific ones distinctly. |
| Motif/population candidate for TIME and RELATIVE | Era Contract §11 tables | Both explicitly marked "—" (no candidate assigned) — the only two tracks in the whole catalogue without one. Not filled in by this lot; RELATIVE's new `OWNER_DIRECT` material (self-confidence, upward kick) sharpens its emotional register but does not supply a motif/population candidate. |
| Shared-vs-unique systems split, per track | — | Implementation Matrix V2 lists one flat "systèmes pressentis" list per track with no shared/unique tagging. Only the three vertical slices (Eux Gainent, Morne Et ?, Étééaooété) have enough procedural detail to infer a split reliably. For the other 23 tracks, the Atlas's shared-vs-unique split is a reasoned inference against `DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`'s kit list, not an extraction — marked accordingly. |
| Specific Older Shadows→Vegetative Field and Vegetative Field→New Signal transition *content* | Each Era Contract owns its own outbound transition | **Partially resolved by the owner decision session**: `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §12 now states five shared transition *principles* (continuity, register-shift, density-ramp, motif-handoff, no-anomaly-doubling) — owner-required, added this session. The *specific* visual/mechanical text for these two transitions still does not exist anywhere outside a future Era Contract revision; the principles govern how it must be written, not what it says. |
| ~~Four newly-authored masterframe details~~ — **`RESOLVED`, owner `ACCEPT`ed (final reconciliation pass)** | `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md` | Birth Yard, Older Shadows, Vegetative Field `ACCEPT`ed (with additional confirmations: the deadpan gag is one example of an allowed family not a mandatory repeat; memory distributed across four registers, not one stone; one load-bearing human-error beat added). New Signal `ACCEPT WITH GUARDRAIL` — the canonical New Signal guardrail is now recorded in both the Atlas and the Masterframe Briefs. No longer an open item. |

**Resolved by the first correction, removed from this table:** *Personal/lived source, per track* — see §1.7 and `docs/DRIFT_3D_ERA_TRACK_ATLAS.md` — 27/27 segments now `OWNER_DIRECT`.

**Resolved by the owner decision session (second correction), removed from this table:**
- *Global density doctrine* — `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §4 now states per-era target bands across four axes (foreground/background/human presence/behavioral loops), owner-required, added this session. The exact numeric Quality-Tier counts per band remain a Build-lot decision, not restored to this table since that was never this gap's own scope.
- *Human presence — unified rule* — `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §9 now states one five-point doctrine, owner-required, added this session. The twelve archetypes' remaining nine names are a distinct, still-open gap, kept as its own row above.
- *DAYMASON's central anomaly (`CONFLICTING`, §1.6)* — `RESOLVED — OWNER-DECIDED HYBRID`, see §1.6 and the Atlas entry.
- *PANTHERE's `P2` artistic-validation flag* — reclassified to `P3`, owner `ACCEPT`ed final, owner-scoped to two named questions, see §1.6/Atlas entry. **The Living Track Matrix's own source vocabulary is now edited to match** (`docs/DRIFT_3D_LIVING_TRACK_MATRIX.md` §5.10 reads `P3` with a GOV-40 reconciliation note; PANTHERE removed from its "Vague 2" list) — performed in this final reconciliation pass, no longer flagged as outstanding.
- *New Signal's "lambda becoming an ordinary world form" vs. the Global Art Direction's λ doctrine* — `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §11 now states the full four-stage progression, owner-decided this session (see above, this section's own preceding paragraph).

---

## 3. Confirmed canonical coverage (runtime ground truth)

Source: `src/lib/tracks.ts` (RUNTIME TRUTH — wins over any document on conflict, per `DRIFT_DOCUMENTATION_MAP.md`'s own resolution rule).

**26 catalogue tracks, exact runtime title / slug / era, preserved verbatim including punctuation and accents:**

| # | Title (exact) | Slug | Era |
|---|---|---|---|
| 1 | A WALK IN ZEELAND | `a-walk-in-zeeland` | Birth Yard |
| 2 | FOOLFOULE | `foolfoule` | Birth Yard |
| 3 | JAZZYPLING | `jazzypling` | Birth Yard |
| 4 | PLAY IT | `play-it` | Birth Yard |
| 5 | EUX GAINENT | `eux-gainent` | Birth Yard |
| 6 | RISE | `rise` | Older Shadows |
| 7 | BLOSSOMING | `blossoming` | Older Shadows |
| 8 | ETHNIC STICK | `ethnic-stick` | Older Shadows |
| 9 | MINUIT MOINS CINQ | `minuit-moins-cinq` | Older Shadows |
| 10 | PERDUE | `perdue` | Older Shadows |
| 11 | MORNE, ET ? | `morne-et` | Vegetative Field |
| 12 | DAYMASON | `daymason` | Vegetative Field |
| 13 | CHAILK | `chailk` | Vegetative Field |
| 14 | TIME | `time` | Vegetative Field |
| 15 | TANTITOM | `tantitom` | Vegetative Field |
| 16 | NEEKTAREUM | `neektareum` | New Signal |
| 17 | ASITIS | `asitis` | New Signal |
| 18 | RELATIVE | `relative` | New Signal |
| 19 | OVERTHINK | `overthink` | New Signal |
| 20 | HOLD THE LIGHT | `hold-the-light` | New Signal |
| 21 | MIDNIGHT WORK | `midnight-work` | New Signal |
| 22 | TELATELABA | `telatelaba` | New Signal |
| 23 | LE MONDE S'ENDORT *(curly apostrophe ’ in the runtime title)* | `le-monde-s-endort` | New Signal |
| 24 | RENEE | `renee` | New Signal |
| 25 | PANTHERE | `panthere` | New Signal |
| 26 | ÉTÉÉAOOÉTÉ | `eteeaooete` | New Signal |

Plus **Entry Ambient** (1 non-catalogue segment, no track slug). **Total: 27 segments, 26 tracks — matches `DRIFT-IV-GOV-20`'s confirmed coverage exactly.**

`MORNE, ET ?`'s exact punctuation (comma + space before the question mark) is the runtime-true form; some governance prose elsewhere (Decisions Log entries) writes it without the comma ("Morne Et ?") — a minor, non-authoritative drift, noted here so it is not propagated forward. `LE MONDE S'ENDORT` uses a **typographic apostrophe (’, U+2019)** in the runtime title, not a straight quote — preserved exactly in the Track Atlas.

**Cross-era continuity threads confirmed from runtime data** (not previously documented as a "continuity" fact in any governance doc): RENEE (`longText`) is an explicit rework of PERDUE; PANTHERE (`longText`) is an explicit rework of A WALK IN ZEELAND. Both are New Signal tracks referencing earlier-era tracks — a real authored echo, distinct from adjacent-segment continuity, carried into the Track Atlas's continuity field for both pairs.

---

## 4. Runtime ground truth summary (see `DRIFT_3D_RUNTIME_MIGRATION_MAP.md` for full detail)

- The current DRIFT-3D runtime is **fully procedural/parametric geometry** — zero glTF/GLB models, zero rigged/skinned meshes, zero animation-clip system anywhere in `src/` or `public/`.
- `public/textures/` holds 5 Poly Haven CC0 photo material sets (10 JPGs); `public/audio/` holds 27 track/ambient MP3s; no `public/models/` or `public/assets/` directory exists.
- `package.json` has no `@react-three/drei`, no Draco/Meshopt/KTX2 tooling, no physics engine, no crowd/rig library — only `three` and `@react-three/fiber`.
- Genuinely reusable shared systems already exist for: vegetation/prop scatter (`drift3dScatter.ts`), terrain (`drift3dTerrain.ts`), atmosphere/lighting-by-region (`drift3dAtmosphere.ts`), diegetic ambience audio (`drift3dAmbience.ts`), and a small photo/procedural material library (`drift3dTextureFactory.ts`).
- No shared human/crowd rig, no traffic/NPC-vehicle system, no dedicated water or weather system exist — `FoolfouleCrowd` and `StormRain` are hard-anchored one-off effects for exactly one track each, not reusable kits.

This is the factual foundation for the reuse-first posture: there is currently **nothing to "prove then extract"** for humans, crowds, weather, or water — those categories have exactly one non-reusable example each (or none), so a reuse-first shared-kit definition does not compete with an already-working proven pattern; it fills a real gap.
