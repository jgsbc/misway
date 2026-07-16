# DRIFT 3D — Backlog intégral de mise en œuvre

- **Version :** 2.0
- **Date :** 2026-07-15
- **Statut :** `ACTIVE`
- **Couverture :** 27 segments, 26 tracks, 108 lots track standardisés, 152 lots directeurs au total.

---

# 1. Règles

- un lot = un objectif ;
- aucun code track sans Identity Contract accepté ;
- aucune cue runtime sans Cue Map approuvée ;
- aucun `PASS` sans owner review ;
- aucune abstraction partagée avant le gate de trois vertical slices ;
- tous les lots définissent scope, fichiers, budgets, fallbacks, tests et stop conditions ;
- l'exhaustivité désigne la couverture du monde, pas l'obligation de produire chaque idée au coût maximal.

---

# 2. État d'entrée à vérifier dans Git

État factuel constaté au 2026-07-16, au moment de l'adoption du programme (`DRIFT-IV-GOV-00`) :

- `main` ne contient pas encore l'implémentation Living World/CUES ;
- l'implémentation CUES est sécurisée sur la branche `drift-lw-cues-00-eux-gainent`, commit `ad21600` ;
- la Cue Map est sécurisée sur le commit `46930a1` ;
- le tag `archive/drift-lw-cues-implemented-20260713` existe et fige cet état ;
- cette ligne historique doit être réconciliée dans `DRIFT-IV-GOV-10` ;
- elle ne doit pas être mergée directement dans ce lot ni dans un lot antérieur à sa réconciliation explicite.

GOV-10 outcome:
- five Living World authorities reconciled onto main;
- historical CUES runtime remains outside main;
- audio clock assigned to SYS-00;
- EUX living scene and cue wiring assigned to VS1-00;
- world-edge, river, vegetation and scatter candidates assigned to BASE-00;
- archive tag and historical branches retained;
- direct merge remains prohibited.

GOV-20 outcome:
- five era and transition authorities created;
- 27 segments and 26 tracks mapped exactly once;
- transition ownership assigned to source eras;
- era density envelopes established;
- recurring population, bureaucracy and seven motifs governed;
- ocean synthesis and transformed return contracted;
- no runtime or numeric performance baseline claimed;
- GOV-30 remains responsible for reconciling lot identifiers,
  dependencies, gates and rollout order.

---

# 3. Vague A — Gouvernance et fondations

| Lot | Titre | Type | Acceptance |
|---|---|---|---|
| `DRIFT-IV-GOV-00` | Adopt Integral World program | Docs only | Adoption package, authority map, status and owner decision. |
| `DRIFT-IV-GOV-10` | Reconcile Living World branches | Git/history | Reconcile Cue Map/CUES work, clean branch graph and factual runtime status. |
| `DRIFT-IV-GOV-20` | Create era contracts | Docs only | Five authoritative era contracts including transitions and density rules. |
| `DRIFT-IV-GOV-30` | Finalize director backlog after era contracts | Docs only | Reconcile the five approved era contracts with lot identifiers, dependencies, gates and rollout order; confirm one active director backlog and no competing sequence before BASE-00. |
| `DRIFT-IV-BASE-00` | Capture runtime baseline | Audit | Performance, visuals, file architecture, audio, mobile and fallback baseline. |
| `DRIFT-IV-SYS-00` | Harden audio clock | Runtime | Complete CUES acceptance, playback QA and regression evidence. |
| `DRIFT-IV-SYS-10` | Scene lifecycle contract | Runtime | Prove activation, pause, reset and cleanup boundaries. |
| `DRIFT-IV-SYS-20` | Cue resolver harness | Tooling | Reusable test harness without global cue registry. |
| `DRIFT-IV-SYS-30` | Signature arbitration | Runtime | One major signature event at a time, track priority and cleanup. |
| `DRIFT-IV-SYS-40` | Quality tier substrate | Runtime | High/medium/low capability selection without identity loss. |
| `DRIFT-IV-SYS-50` | Reduced-motion contract | Accessibility | Track scene state-based fallbacks and evidence process. |
| `DRIFT-IV-SYS-60` | No-WebGL narrative path | Accessibility | Useful listening path preserving catalogue and scene meaning. |
| `DRIFT-IV-SYS-70` | Performance evidence harness | Tooling | Renderer/fps/budgets captured per zone and lot. |
| `DRIFT-IV-VS1-00` | Complete EUX GAINENT vertical slice | Track implementation | Conformity window, recalibration strip, reference illusion, signature text and owner QA. |
| `DRIFT-IV-VS2-00` | MORNE, ET ? identity and cue contract | Docs/audio | Approve routine, reaction chain, persistence and deadpan tone. |
| `DRIFT-IV-VS2-10` | MORNE, ET ? vertical slice | Track implementation | Zone-wide controlled breakdown, reset and residue. |
| `DRIFT-IV-VS3-00` | ÉTÉÉAOOÉTÉ identity and cue contract | Docs/audio | Approve ocean ritual, wave, trace and memory map. |
| `DRIFT-IV-VS3-10` | ÉTÉÉAOOÉTÉ vertical slice | Track implementation | Ocean, λ composition, wave erasure and bounded memory. |
| `DRIFT-IV-IND-00` | Three-slice industrialization audit | Audit | Compare code, authoring, performance, fallbacks and identity. |
| `DRIFT-IV-IND-10` | Approve thin shared substrate | Governance | Explicit reuse/no-reuse decisions and migration limits. |
| `DRIFT-IV-IND-20` | Refactor only proven common code | Runtime | Extract shared services without changing accepted visuals. |

---

# 4. Vague B — Cycle exhaustif des segments

## 4.1 Cycle standard

| Suffixe | Lot | Livrable |
|---|---|---|
| `-00` | Identity Contract | North Star, monde, vie, anomalie, signature, continuité, fallbacks, budgets |
| `-10` | Cue Map | Structure audio, timestamps, pause/seek/loop, owner approval |
| `-20` | Build | Runtime, assets, tests, documentation, fallbacks |
| `-30` | Acceptance | QA propriétaire, performance, mobile, accessibilité, décision |

## 4.2 Catalogue

| Ère | Segment | Identity | Cue Map | Build | Acceptance |
|---|---|---|---|---|---|
| ENTRY | ENTRY AMBIENT | `DRIFT-IV-ENTRY-ENTRY-00` | `DRIFT-IV-ENTRY-ENTRY-10` | `DRIFT-IV-ENTRY-ENTRY-20` | `DRIFT-IV-ENTRY-ENTRY-30` |
| BY | A WALK IN ZEELAND | `DRIFT-IV-BY-AWZ-00` | `DRIFT-IV-BY-AWZ-10` | `DRIFT-IV-BY-AWZ-20` | `DRIFT-IV-BY-AWZ-30` |
| BY | FOOLFOULE | `DRIFT-IV-BY-FOOL-00` | `DRIFT-IV-BY-FOOL-10` | `DRIFT-IV-BY-FOOL-20` | `DRIFT-IV-BY-FOOL-30` |
| BY | JAZZYPLING | `DRIFT-IV-BY-JAZZ-00` | `DRIFT-IV-BY-JAZZ-10` | `DRIFT-IV-BY-JAZZ-20` | `DRIFT-IV-BY-JAZZ-30` |
| BY | PLAY IT | `DRIFT-IV-BY-PLAY-00` | `DRIFT-IV-BY-PLAY-10` | `DRIFT-IV-BY-PLAY-20` | `DRIFT-IV-BY-PLAY-30` |
| BY | EUX GAINENT | `DRIFT-IV-BY-EUX-00` | `DRIFT-IV-BY-EUX-10` | `DRIFT-IV-BY-EUX-20` | `DRIFT-IV-BY-EUX-30` |
| OS | RISE | `DRIFT-IV-OS-RISE-00` | `DRIFT-IV-OS-RISE-10` | `DRIFT-IV-OS-RISE-20` | `DRIFT-IV-OS-RISE-30` |
| OS | BLOSSOMING | `DRIFT-IV-OS-BLOSS-00` | `DRIFT-IV-OS-BLOSS-10` | `DRIFT-IV-OS-BLOSS-20` | `DRIFT-IV-OS-BLOSS-30` |
| OS | ETHNIC STICK | `DRIFT-IV-OS-ETH-00` | `DRIFT-IV-OS-ETH-10` | `DRIFT-IV-OS-ETH-20` | `DRIFT-IV-OS-ETH-30` |
| OS | MINUIT MOINS CINQ | `DRIFT-IV-OS-MM5-00` | `DRIFT-IV-OS-MM5-10` | `DRIFT-IV-OS-MM5-20` | `DRIFT-IV-OS-MM5-30` |
| OS | PERDUE | `DRIFT-IV-OS-PERD-00` | `DRIFT-IV-OS-PERD-10` | `DRIFT-IV-OS-PERD-20` | `DRIFT-IV-OS-PERD-30` |
| VF | MORNE, ET ? | `DRIFT-IV-VF-MORNE-00` | `DRIFT-IV-VF-MORNE-10` | `DRIFT-IV-VF-MORNE-20` | `DRIFT-IV-VF-MORNE-30` |
| VF | DAYMASON | `DRIFT-IV-VF-DAY-00` | `DRIFT-IV-VF-DAY-10` | `DRIFT-IV-VF-DAY-20` | `DRIFT-IV-VF-DAY-30` |
| VF | CHAILK | `DRIFT-IV-VF-CHAILK-00` | `DRIFT-IV-VF-CHAILK-10` | `DRIFT-IV-VF-CHAILK-20` | `DRIFT-IV-VF-CHAILK-30` |
| VF | TIME | `DRIFT-IV-VF-TIME-00` | `DRIFT-IV-VF-TIME-10` | `DRIFT-IV-VF-TIME-20` | `DRIFT-IV-VF-TIME-30` |
| VF | TANTITOM | `DRIFT-IV-VF-TANTI-00` | `DRIFT-IV-VF-TANTI-10` | `DRIFT-IV-VF-TANTI-20` | `DRIFT-IV-VF-TANTI-30` |
| NS | NEEKTAREUM | `DRIFT-IV-NS-NEEK-00` | `DRIFT-IV-NS-NEEK-10` | `DRIFT-IV-NS-NEEK-20` | `DRIFT-IV-NS-NEEK-30` |
| NS | ASITIS | `DRIFT-IV-NS-ASI-00` | `DRIFT-IV-NS-ASI-10` | `DRIFT-IV-NS-ASI-20` | `DRIFT-IV-NS-ASI-30` |
| NS | RELATIVE | `DRIFT-IV-NS-REL-00` | `DRIFT-IV-NS-REL-10` | `DRIFT-IV-NS-REL-20` | `DRIFT-IV-NS-REL-30` |
| NS | OVERTHINK | `DRIFT-IV-NS-OVER-00` | `DRIFT-IV-NS-OVER-10` | `DRIFT-IV-NS-OVER-20` | `DRIFT-IV-NS-OVER-30` |
| NS | HOLD THE LIGHT | `DRIFT-IV-NS-HOLD-00` | `DRIFT-IV-NS-HOLD-10` | `DRIFT-IV-NS-HOLD-20` | `DRIFT-IV-NS-HOLD-30` |
| NS | MIDNIGHT WORK | `DRIFT-IV-NS-MWORK-00` | `DRIFT-IV-NS-MWORK-10` | `DRIFT-IV-NS-MWORK-20` | `DRIFT-IV-NS-MWORK-30` |
| NS | TELATELABA | `DRIFT-IV-NS-TELA-00` | `DRIFT-IV-NS-TELA-10` | `DRIFT-IV-NS-TELA-20` | `DRIFT-IV-NS-TELA-30` |
| NS | LE MONDE S'ENDORT | `DRIFT-IV-NS-SLEEP-00` | `DRIFT-IV-NS-SLEEP-10` | `DRIFT-IV-NS-SLEEP-20` | `DRIFT-IV-NS-SLEEP-30` |
| NS | RENEE | `DRIFT-IV-NS-RENEE-00` | `DRIFT-IV-NS-RENEE-10` | `DRIFT-IV-NS-RENEE-20` | `DRIFT-IV-NS-RENEE-30` |
| NS | PANTHERE | `DRIFT-IV-NS-PANTH-00` | `DRIFT-IV-NS-PANTH-10` | `DRIFT-IV-NS-PANTH-20` | `DRIFT-IV-NS-PANTH-30` |
| NS | ÉTÉÉAOOÉTÉ | `DRIFT-IV-NS-ETEE-00` | `DRIFT-IV-NS-ETEE-10` | `DRIFT-IV-NS-ETEE-20` | `DRIFT-IV-NS-ETEE-30` |

## 4.3 Ordre recommandé

### B1 — preuves

1. EUX GAINENT ;
2. MORNE, ET ? ;
3. ÉTÉÉAOOÉTÉ ;
4. industrialization gate.

### B2 — Birth Yard

A WALK IN ZEELAND → FOOLFOULE → JAZZYPLING → PLAY IT → harmonisation EUX.

### B3 — Older Shadows

RISE → MINUIT MOINS CINQ → ETHNIC STICK → BLOSSOMING → PERDUE.

### B4 — Vegetative Field

CHAILK → TANTITOM → TIME → DAYMASON → harmonisation MORNE.

### B5 — New Signal, reconstruction

NEEKTAREUM → ASITIS → OVERTHINK → HOLD THE LIGHT → MIDNIGHT WORK.

### B6 — New Signal, mémoire et sortie

RELATIVE → TELATELABA → LE MONDE S'ENDORT → RENEE → PANTHERE → harmonisation ÉTÉÉAOOÉTÉ.

---

# 5. Vague C — Continuité mondiale

| Lot | Titre | Acceptance |
|---|---|---|
| `DRIFT-IV-CONT-00` | Residue ledger | Implement bounded route-session narrative residues. |
| `DRIFT-IV-CONT-10` | Recurring archetype bible | Approve silhouettes, arcs, appearances and do-not-do. |
| `DRIFT-IV-CONT-20` | Recurring archetype runtime | Implement sparse, LOD-aware appearances. |
| `DRIFT-IV-CONT-30` | Object migration network | Move seven motifs across selected tracks. |
| `DRIFT-IV-CONT-40` | Bureaucracy progression | Implement era-specific administrative visual language. |
| `DRIFT-IV-CONT-50` | λ grammar | Implement only approved transition/choice manifestations. |
| `DRIFT-IV-CONT-60` | Background transit | Trains, cargo, traffic, lifts, birds, planes and weather continuity. |
| `DRIFT-IV-CONT-70` | Era transition directors | Deliver five continuous transitions. |
| `DRIFT-IV-CONT-80` | Final ocean restitution | Select residues, build λ, erase, leave route. |
| `DRIFT-IV-CONT-90` | Transformed return loop | Return toward Birth Yard with visible but restrained changes. |

---

# 6. Vague D — Harmonisation et release

| Lot | Titre | Acceptance |
|---|---|---|
| `DRIFT-IV-GLOB-00` | Autonomous life density pass | Ensure three temporal depths in every era. |
| `DRIFT-IV-GLOB-10` | Population and traffic balance | Avoid empty dioramas and crowd overload. |
| `DRIFT-IV-GLOB-20` | Color script finalization | Reconcile era arcs, accents, weather and contamination. |
| `DRIFT-IV-GLOB-30` | Diegetic typography audit | One message maximum, distance and mobile readability. |
| `DRIFT-IV-GLOB-40` | World ambience mix | Keep track primacy, opt-in ambience and cleanup. |
| `DRIFT-IV-GLOB-50` | Mobile world pass | Controls, visibility, density, thermal load and 30 fps. |
| `DRIFT-IV-GLOB-60` | Reduced-motion world pass | Meaningful state-based path for all tracks. |
| `DRIFT-IV-GLOB-70` | No-WebGL world pass | Catalogue, scene summaries and audio continuity. |
| `DRIFT-IV-GLOB-80` | Performance optimization | Worst-zone budgets, memory, shaders and callbacks. |
| `DRIFT-IV-GLOB-90` | Static export/basePath regression | All routes, assets, audio and fallbacks. |
| `DRIFT-IV-RC-00` | Full journey release candidate | Complete route-session journey and evidence package. |
| `DRIFT-IV-RC-10` | Owner world acceptance | Era-by-era and track-by-track signed decision. |
| `DRIFT-IV-RC-20` | Production release | Merge, deploy, smoke test, rollback and post-release review. |

---

# 7. Dépendances

```text
GOV / BASELINE
  ↓
CUES + EUX VS1
  ↓
MORNE VS2 + ETEE VS3
  ↓
INDUSTRIALIZATION GATE
  ↓
ERA / TRACK ROLLOUTS
  ↓
CROSS-WORLD CONTINUITY
  ↓
GLOBAL HARMONIZATION
  ↓
RELEASE CANDIDATE
```

Les contrats de continuité peuvent être préparés avant la fin des tracks ; le runtime partagé attend le gate.

---

# 8. Critères standard

## Identity

- singularité ;
- inspiration transmutée ;
- vie autonome ;
- continuité ;
- do-not-do ;
- fallbacks ;
- budgets.

## Cue

- source canonique ;
- audition honnête ;
- timestamps ;
- confiance ;
- seek/pause/loop ;
- owner approval.

## Build

- audio explicite ;
- scène locale ;
- orchestrateur borné ;
- reset ;
- performance ;
- fallback ;
- fichiers protégés ;
- aucun scope creep.

## Acceptance

- idle ;
- active ;
- pause ;
- resume ;
- seek ;
- loop ;
- sortie/retour ;
- autre track ;
- mobile ;
- reduced motion ;
- console ;
- performance ;
- owner decision.

---

# 9. Stop conditions programme

Arrêter une vague si :

- les tracks convergent vers un template ;
- les budgets ne passent plus ;
- le player régresse ;
- les fallbacks deviennent vides ;
- une mémoire ne peut pas être bornée ;
- les transitions exigent une refonte non approuvée ;
- la densité vient de l'accumulation plutôt que de la vie ;
- les owner reviews s'accumulent ;
- le backlog remplace le jugement artistique.

---

# 10. Métriques

- contrats / 27 ;
- cue maps / 26 ;
- builds / 27 ;
- acceptances / 27 ;
- transitions / 5 ;
- arcs de motifs / 7 ;
- archétypes actifs ;
- zones à trois profondeurs ;
- mobile/reduced/no-WebGL ;
- pire fps/draw calls/triangles ;
- régressions audio ;
- reworks ;
- dette artistique.

---

# 11. Premier lot

```text
DRIFT-IV-GOV-00 — Adopt Integral World program
```

Documentation seulement. Aucun runtime.
