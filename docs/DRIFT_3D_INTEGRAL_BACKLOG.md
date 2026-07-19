# DRIFT 3D — Backlog directeur intégral (finalisé)

- **Version :** 3.0
- **Date :** 2026-07-16
- **Status :** `ACTIVE` — `FINALIZED BY DRIFT-IV-GOV-30`
- **Coverage :**
  - 27 segments
  - 26 tracks
  - 147 canonical executable lots
  - 5 retired aliases

Ce document est la **seule séquence directrice active** de la production Drift. Il remplace intégralement la version 2.0 et absorbe les décisions de `DRIFT-IV-GOV-30`.

---

# 1. Principes

- un lot = un objectif ;
- aucun code track sans Identity Contract accepté ;
- aucune cue runtime sans Cue Map approuvée (ou, pour Entry, sans temporal map acceptée) ;
- aucun `PASS` sans owner review ;
- aucune abstraction partagée avant le gate de trois vertical slices (rôle de preuve, jamais un lot) ;
- tous les lots définissent scope, fichiers, budgets, fallbacks, tests et stop conditions ;
- l'exhaustivité désigne la couverture du monde, pas l'obligation de produire chaque idée au coût maximal ;
- un seul identifiant canonique de ce backlog peut devenir `ACTIVE_LOT` à la fois ;
- ce lot ne réécrit aucune vision artistique : il transforme la gouvernance existante en plan d'exécution non ambigu.

---

# 2. Autorité

Hiérarchie inchangée depuis `AGENTS.md` :

```text
RUNTIME CODE
MISWAY SITE IDENTITY DOCTRINE / FINAL REVIEW
DRIFT 3D REALISM BIBLE
DRIFT 3D PRODUCT SPEC
DRIFT 3D LIVING WORLD BIBLE
DRIFT 3D LIVING TRACK MATRIX
APPROVED TRACK IDENTITY CONTRACTS
DRIFT 3D INTEGRAL WORLD PROGRAM
DRIFT 3D INTEGRAL SYSTEMS ARCHITECTURE
ERA / TRANSITION CONTRACTS
APPROVED CUE MAPS
DRIFT 3D INTEGRAL BACKLOG (ce document)
ACTIVE LOT
```

Ce backlog organise la livraison. Il ne réinterprète jamais un contrat artistique déjà accepté (Living World Bible, Living Track Matrix, Identity Contracts, Cue Maps, Era Contracts). Le code reste l'autorité de l'état réellement livré.

`docs/DRIFT_BACKLOG.md` reste `RETIRED_AS_ACTIVE_AUTHORITY` — il n'est pas ressuscité par ce lot.

`docs/DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md` est un rapport de réconciliation de gouvernance (`GOVERNANCE RECONCILIATION RECORD — NOT AN EXECUTION SEQUENCE`), pas un second backlog.

---

# 3. Vocabulaire de statuts

```text
DONE
DONE_PENDING_MERGE
SATISFIED_BY_EXISTING_AUTHORITY
READY
PLANNED
BLOCKED_BY_DEPENDENCY
PENDING_OWNER_REVIEW
REWORK_REQUIRED
SKIPPED_BY_GATE
RETIRED_ALIAS
```

Interdiction absolue : aucun `PASS` ou `DONE` pour une track sans décision propriétaire explicite.

---

# 4. Calcul des 147 lots canoniques

```text
Governance:            4   (GOV-00, GOV-10, GOV-20, GOV-30)
Baseline:               1   (BASE-00)
Thin pre-gate systems:  8   (SYS-00 à SYS-70)
Segment cycle:        108   (27 segments × 4 lots)
Industrialization:      3   (IND-00 à IND-20)
World continuity:      10   (CONT-00 à CONT-90)
Global harmonization:  10   (GLOB-00 à GLOB-90)
Release:                3   (RC-00 à RC-20)

TOTAL: 4 + 1 + 8 + 108 + 3 + 10 + 10 + 3 = 147
```

Le passage de 152 à 147 identifiants **n'est pas une réduction du programme artistique**. Il retire uniquement cinq identifiants (`DRIFT-IV-VS1-00`, `DRIFT-IV-VS2-00`, `DRIFT-IV-VS2-10`, `DRIFT-IV-VS3-00`, `DRIFT-IV-VS3-10`) qui dupliquaient déjà des lots existants du cycle standard à quatre lots par segment (§6). Aucun livrable artistique n'est retiré : chaque intention portée par un ancien alias est déjà couverte par un lot canonique.

---

# 5. Mapping des cinq aliases retirés

Les expressions **vertical slice 1**, **vertical slice 2** et **vertical slice 3** restent autorisées comme **rôles de preuve** (voir §9). Les cinq identifiants suivants deviennent des alias historiques non exécutables :

| Ancien alias | Statut canonique | Intention historique | Lots canoniques |
|---|---|---|---|
| `DRIFT-IV-VS1-00` | `RETIRED_ALIAS — DO NOT EXECUTE` | EUX GAINENT vertical slice complet | `DRIFT-IV-BY-EUX-20` + `DRIFT-IV-BY-EUX-30` |
| `DRIFT-IV-VS2-00` | `RETIRED_ALIAS — DO NOT EXECUTE` | MORNE identité et cues | `DRIFT-IV-VF-MORNE-00` + `DRIFT-IV-VF-MORNE-10` |
| `DRIFT-IV-VS2-10` | `RETIRED_ALIAS — DO NOT EXECUTE` | MORNE build et acceptation | `DRIFT-IV-VF-MORNE-20` + `DRIFT-IV-VF-MORNE-30` |
| `DRIFT-IV-VS3-00` | `RETIRED_ALIAS — DO NOT EXECUTE` | ÉTÉÉAOOÉTÉ identité et cues | `DRIFT-IV-NS-ETEE-00` + `DRIFT-IV-NS-ETEE-10` |
| `DRIFT-IV-VS3-10` | `RETIRED_ALIAS — DO NOT EXECUTE` | ÉTÉÉAOOÉTÉ build et acceptation | `DRIFT-IV-NS-ETEE-20` + `DRIFT-IV-NS-ETEE-30` |

Interdictions absolues :

- ne créer aucune branche utilisant un ancien identifiant `VS*` ;
- ne créer aucune nouvelle PR utilisant un ancien identifiant ;
- ne compter aucun alias comme lot exécutable ;
- ne supprimer aucune trace historique de ces identifiants (Decisions Log, résolution d'adoption) ;
- ne réécrire aucune ancienne entrée du Decisions Log.

---

# 6. Cycle standard (segment)

| Suffixe | Lot | Livrable |
|---|---|---|
| `-00` | Identity Contract | North Star, monde, vie, anomalie, signature, continuité, fallbacks, budgets |
| `-10` | Cue Map (ou, pour Entry, temporal map) | Structure audio, timestamps, pause/seek/loop, owner approval |
| `-20` | Build | Runtime, assets, tests, documentation, fallbacks |
| `-30` | Acceptance | QA propriétaire, performance, mobile, accessibilité, décision |

## 6.1 Cas particulier Entry

`ENTRY AMBIENT` n'est pas une track catalogue. Son cycle reste composé de quatre lots :

| Lot | Livrable |
|---|---|
| `DRIFT-IV-ENTRY-ENTRY-00` | Identity Contract |
| `DRIFT-IV-ENTRY-ENTRY-10` | **Ambient and transition temporal map** (jamais une Cue Map de track) |
| `DRIFT-IV-ENTRY-ENTRY-20` | Build |
| `DRIFT-IV-ENTRY-ENTRY-30` | Acceptance |

`DRIFT-IV-ENTRY-ENTRY-10` gouverne notamment :

- temporalité de l'ambiance ;
- activation explicite ;
- absence d'autoplay ;
- scan et verdict ;
- transition vers Birth Yard ;
- pause/reset/revisite ;
- comportement sans musique ;
- fallbacks.

## 6.2 Métriques distinguées

```text
27 Identity Contracts
26 track Cue Maps
1  Entry ambient/transition temporal map
27 Builds
27 Acceptances
```

---

# 7. Effective state upon merge of DRIFT-IV-SYS-30

| Lot | Statut |
|---|---|
| `DRIFT-IV-GOV-00` | `DONE` |
| `DRIFT-IV-GOV-10` | `DONE` |
| `DRIFT-IV-GOV-20` | `DONE` |
| `DRIFT-IV-GOV-30` | `DONE` |
| `DRIFT-IV-BY-EUX-00` | `SATISFIED_BY_EXISTING_AUTHORITY` |
| `DRIFT-IV-BY-EUX-10` | `SATISFIED_BY_EXISTING_AUTHORITY` |
| `DRIFT-IV-BASE-00` | `DONE` |
| `DRIFT-IV-SYS-00` | `DONE` |
| `DRIFT-IV-SYS-10` | `DONE` |
| `DRIFT-IV-SYS-20` | `DONE` |
| `DRIFT-IV-SYS-30` | `DONE` |
| `DRIFT-IV-SYS-40` | `READY` |
| Tous les autres lots canoniques | `PLANNED` ou `BLOCKED_BY_DEPENDENCY` selon §8–§16 |
| `DRIFT-IV-VS1-00`, `DRIFT-IV-VS2-00`, `DRIFT-IV-VS2-10`, `DRIFT-IV-VS3-00`, `DRIFT-IV-VS3-10` | `RETIRED_ALIAS` |

`DRIFT-IV-BASE-00` est passé à `DONE` sous le protocole de preuve révisé (`REPRESENTATIVE REAL FPS SAMPLE + CROSS-ZONE RENDER-COST ENVELOPE + AUTOMATED VISUAL, MOBILE AND FALLBACK EVIDENCE`) : un échantillon fps réel au premier plan, une enveloppe de coût de rendu inter-zones réelle, une vérification structurelle mobile automatisée et le déclenchement réel des deux fallbacks ont tous été obtenus — voir `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` pour le rapport complet et la décision de gate.

`DRIFT-IV-SYS-00` livre l'horloge audio partagée (`src/lib/drift3dAudioClock.ts`, intégrée dans `AudioPlayerProvider.tsx`, propagée jusqu'à `Drift3DScene.tsx`) — comportement vérifié en session de navigateur réelle au premier plan sur les neuf scénarios requis (init, lecture, pause, reprise, seek, changement de track, loop, changement de route, entrée en zone sans lecture), tous `PASS` — voir `docs/evidence/DRIFT-IV-SYS-00/audio-clock-evidence.md`. Aucun cue resolver, scene lifecycle formel, signature arbitration ou quality tier n'est livré par ce lot.

`DRIFT-IV-SYS-10` livre le lifecycle de scène partagé (`src/lib/drift3dSceneLifecycle.ts` : cinq états, matrice de transitions, `mountRevision`/`lifecycleRevision`/`resetRevision`), intégré dans `Drift3DCanvas.tsx` (visibilité document pilotant `ACTIVE`/`PAUSED`, `frameloop` synchronisé, démontage de route ordonné) et complété par les cleanups de `Drift3DScene.tsx` (texture terrain disposée, clavier vidé, probes dev supprimés avec garde de propriété par instance) — comportement vérifié en session de navigateur réelle : montage initial, pause/reprise de visibilité (via un override de visibilité distinctement étiqueté `FORCED_VISIBILITY_PATH`, le document automatisé restant `hidden` en continu), démontage de route (player global et audio inchangés, `resetRevision` +1 exact, cinq globals dev supprimés), retour sur Drift, trois cycles SPA sans accumulation, disposal terrain (preuve structurelle), et les deux fallbacks — voir `docs/evidence/DRIFT-IV-SYS-10/scene-lifecycle-evidence.md`. Aucun Cue Resolver, lifecycle track-local, signature arbitration ou quality tier n'est livré par ce lot.

`DRIFT-IV-SYS-20` livre le resolver de cues générique (`src/lib/drift3dCueResolver.ts` : timeline minimale, validation, sémantique exacte des frontières, gaps, progressions normalisées, reconstruction directe depuis le temps absolu, intégration `AudioClock`), exposé en développement via `window.__drift3dCueResolver` (harness read-only installé depuis `Drift3DCanvas.tsx`, indépendant du montage react-three-fiber) — comportement vérifié sur une timeline entièrement synthétique (`probe-a`/`probe-b`/`probe-c`, sans signification artistique) : validation déterministe, frontières exactes, intégration `AudioClock` réelle, reconstruction directe après seek avant/arrière, pause/reprise, restart, changement de source, cleanup/remount du probe, et les deux fallbacks — voir `docs/evidence/DRIFT-IV-SYS-20/cue-resolver-evidence.md`. Aucune Cue Map de track réelle, aucune phase artistique, aucune signature arbitration ou quality tier n'est livrée par ce lot.

`DRIFT-IV-SYS-30` livre l'arbitrage de signature majeure générique (`src/lib/drift3dSignatureArbitration.ts` : candidat générique, `ownerKind`, priorité absolue `active-track` > `world`, priorité numérique intra-`ownerKind`, tie-break lexical déterministe, service stateless), exposé en développement via `window.__drift3dSignatureArbitration` (harness read-only installé depuis `Drift3DCanvas.tsx`, indépendant du montage react-three-fiber) — comportement vérifié sur des candidats entièrement synthétiques (`probe-*`, sans signification artistique) : validation déterministe, priorité absolue `active-track` > `world` même à l'extrême, priorité numérique intra-`ownerKind`, tie-break lexical indépendant de l'ordre d'entrée, éligibilité/absence de gagnant, garantie single-winner, séparation architecturale des boucles de vie, cleanup logique par liste vide/inéligibilité, cleanup/remount du probe, et les deux fallbacks — voir `docs/evidence/DRIFT-IV-SYS-30/signature-arbitration-evidence.md`. Aucune signature artistique réelle, aucune Cue Map, aucun mapping phase → signature, aucun quality tier n'est livré par ce lot. `DRIFT-IV-SYS-40` est désormais `READY`.

## 7.1 Détail EUX GAINENT

```text
DRIFT-IV-BY-EUX-00
  satisfait par le contrat d'identité approuvé et adopté dans GOV-10
  (docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md — APPROVED LOCAL ARTISTIC AUTHORITY).

DRIFT-IV-BY-EUX-10
  satisfait par la Cue Map approuvée comme baseline temporelle initiale
  et adoptée dans GOV-10
  (docs/DRIFT_3D_EUX_GAINENT_CUE_MAP.md — OWNER-APPROVED INITIAL TEMPORAL BASELINE).
  L'écoute humaine et les ajustements bornés restent une exigence
  de l'acceptation DRIFT-IV-BY-EUX-30.
```

Aucun runtime EUX n'est déclaré livré. `DRIFT-IV-BY-EUX-20` et `DRIFT-IV-BY-EUX-30` restent `PLANNED`/`BLOCKED_BY_DEPENDENCY` jusqu'à leur exécution effective.

---

# 8. Systèmes pré-gate (minces)

Ordre directeur :

```text
DRIFT-IV-BASE-00
→ DRIFT-IV-SYS-00
→ DRIFT-IV-SYS-10
→ DRIFT-IV-SYS-20
→ DRIFT-IV-SYS-30
→ DRIFT-IV-SYS-40
→ DRIFT-IV-SYS-50
→ DRIFT-IV-SYS-60
→ DRIFT-IV-SYS-70
```

| Lot | Gate produit |
|---|---|
| `BASE-00` | mesure du runtime réel, architecture, visuel, mobile, fallback, performance — `DONE`, voir `docs/DRIFT_3D_RUNTIME_BASELINE.md` et `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` |
| `SYS-00` | horloge audio unique et stable — `DONE`, voir `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` |
| `SYS-10` | lifecycle et nettoyage — `DONE`, voir `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` |
| `SYS-20` | harness de resolver de cues — `DONE`, voir `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md` |
| `SYS-30` | arbitrage d'une seule signature majeure — `DONE`, voir `docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md` |
| `SYS-40` | quality tiers préservant l'identité |
| `SYS-50` | reduced-motion contract |
| `SYS-60` | no-WebGL narrative path |
| `SYS-70` | evidence/performance harness |

## 8.1 Règle canonique de l'exception pré-gate

Les huit services d'infrastructure minces explicitement définis par `DRIFT-IV-SYS-00` à `DRIFT-IV-SYS-70` sont autorisés avant le gate d'industrialisation.

Ils peuvent fournir l'horloge audio, le lifecycle générique, les outils de résolution et de preuve, l'arbitrage, les quality tiers et les chemins d'accessibilité.

Avant le gate d'industrialisation restent interdites :

- toute abstraction de dramaturgie track ;
- toute abstraction extraite d'une scène locale non prouvée ;
- toute population partagée ;
- tout registre partagé de résidus ;
- tout moteur de transition d'ères ;
- toute continuité mondiale partagée ;
- toute extraction seulement motivée par une architecture cible.

---

# 9. Séquence canonique des trois preuves (vertical slices — rôle de preuve, pas des lots)

**Vertical slice est un rôle de preuve, jamais un espace de nommage de lot séparé. L'exécution canonique utilise toujours les quatre identifiants standard de segment.**

Après `SYS-70`, exécuter exactement :

```text
PROOF SLICE 1 — EUX GAINENT
DRIFT-IV-BY-EUX-20   (BY-EUX-00 et BY-EUX-10 déjà SATISFIED_BY_EXISTING_AUTHORITY)
DRIFT-IV-BY-EUX-30
```

```text
PROOF SLICE 2 — MORNE, ET ?
DRIFT-IV-VF-MORNE-00
DRIFT-IV-VF-MORNE-10
DRIFT-IV-VF-MORNE-20
DRIFT-IV-VF-MORNE-30
```

```text
PROOF SLICE 3 — ÉTÉÉAOOÉTÉ
DRIFT-IV-NS-ETEE-00
DRIFT-IV-NS-ETEE-10
DRIFT-IV-NS-ETEE-20
DRIFT-IV-NS-ETEE-30
```

Chaque preuve doit avoir une Acceptance propriétaire avant le gate suivant.

---

# 10. Gate d'industrialisation

Ordre :

```text
DRIFT-IV-IND-00   Three-slice industrialization audit
DRIFT-IV-IND-10   Approve thin shared substrate
DRIFT-IV-IND-20   Refactor only proven common code
```

Dépendances :

```text
IND-00 depends on: BY-EUX-30, VF-MORNE-30, NS-ETEE-30
IND-10 depends on: IND-00, owner decision
IND-20 depends on: IND-10 approving an explicit extraction
```

Si `IND-10` conclut qu'aucune extraction n'est justifiée : `IND-20 = SKIPPED_BY_GATE`. Cela ne bloque pas le programme. Aucune abstraction ne doit être créée uniquement pour éviter que `IND-20` soit marqué `SKIPPED_BY_GATE`.

---

# 11. Catalogue complet (27 segments)

## 11.1 Entry

| Ère | Segment | Identity | Temporal map | Build | Acceptance |
|---|---|---|---|---|---|
| ENTRY | ENTRY AMBIENT | `DRIFT-IV-ENTRY-ENTRY-00` | `DRIFT-IV-ENTRY-ENTRY-10` | `DRIFT-IV-ENTRY-ENTRY-20` | `DRIFT-IV-ENTRY-ENTRY-30` |

## 11.2 Birth Yard (proof slice : EUX GAINENT)

| Segment | Identity | Cue Map | Build | Acceptance |
|---|---|---|---|---|
| A WALK IN ZEELAND | `DRIFT-IV-BY-AWZ-00` | `DRIFT-IV-BY-AWZ-10` | `DRIFT-IV-BY-AWZ-20` | `DRIFT-IV-BY-AWZ-30` |
| FOOLFOULE | `DRIFT-IV-BY-FOOL-00` | `DRIFT-IV-BY-FOOL-10` | `DRIFT-IV-BY-FOOL-20` | `DRIFT-IV-BY-FOOL-30` |
| JAZZYPLING | `DRIFT-IV-BY-JAZZ-00` | `DRIFT-IV-BY-JAZZ-10` | `DRIFT-IV-BY-JAZZ-20` | `DRIFT-IV-BY-JAZZ-30` |
| PLAY IT | `DRIFT-IV-BY-PLAY-00` | `DRIFT-IV-BY-PLAY-10` | `DRIFT-IV-BY-PLAY-20` | `DRIFT-IV-BY-PLAY-30` |
| EUX GAINENT | `DRIFT-IV-BY-EUX-00` (`SATISFIED_BY_EXISTING_AUTHORITY`) | `DRIFT-IV-BY-EUX-10` (`SATISFIED_BY_EXISTING_AUTHORITY`) | `DRIFT-IV-BY-EUX-20` (proof-slice build, next after systems) | `DRIFT-IV-BY-EUX-30` (proof-slice owner acceptance) |

## 11.3 Older Shadows

| Segment | Identity | Cue Map | Build | Acceptance |
|---|---|---|---|---|
| RISE | `DRIFT-IV-OS-RISE-00` | `DRIFT-IV-OS-RISE-10` | `DRIFT-IV-OS-RISE-20` | `DRIFT-IV-OS-RISE-30` |
| BLOSSOMING | `DRIFT-IV-OS-BLOSS-00` | `DRIFT-IV-OS-BLOSS-10` | `DRIFT-IV-OS-BLOSS-20` | `DRIFT-IV-OS-BLOSS-30` |
| ETHNIC STICK | `DRIFT-IV-OS-ETH-00` | `DRIFT-IV-OS-ETH-10` | `DRIFT-IV-OS-ETH-20` | `DRIFT-IV-OS-ETH-30` |
| MINUIT MOINS CINQ | `DRIFT-IV-OS-MM5-00` | `DRIFT-IV-OS-MM5-10` | `DRIFT-IV-OS-MM5-20` | `DRIFT-IV-OS-MM5-30` |
| PERDUE | `DRIFT-IV-OS-PERD-00` | `DRIFT-IV-OS-PERD-10` | `DRIFT-IV-OS-PERD-20` | `DRIFT-IV-OS-PERD-30` |

## 11.4 Vegetative Field (proof slice : MORNE, ET ?)

| Segment | Identity | Cue Map | Build | Acceptance |
|---|---|---|---|---|
| MORNE, ET ? | `DRIFT-IV-VF-MORNE-00` (proof slice 2) | `DRIFT-IV-VF-MORNE-10` (proof slice 2) | `DRIFT-IV-VF-MORNE-20` (proof slice 2) | `DRIFT-IV-VF-MORNE-30` (proof slice 2) |
| DAYMASON | `DRIFT-IV-VF-DAY-00` | `DRIFT-IV-VF-DAY-10` | `DRIFT-IV-VF-DAY-20` | `DRIFT-IV-VF-DAY-30` |
| CHAILK | `DRIFT-IV-VF-CHAILK-00` | `DRIFT-IV-VF-CHAILK-10` | `DRIFT-IV-VF-CHAILK-20` | `DRIFT-IV-VF-CHAILK-30` |
| TIME | `DRIFT-IV-VF-TIME-00` | `DRIFT-IV-VF-TIME-10` | `DRIFT-IV-VF-TIME-20` | `DRIFT-IV-VF-TIME-30` |
| TANTITOM | `DRIFT-IV-VF-TANTI-00` | `DRIFT-IV-VF-TANTI-10` | `DRIFT-IV-VF-TANTI-20` | `DRIFT-IV-VF-TANTI-30` |

Les quatre lots canoniques de MORNE, ET ? constituent intégralement la proof slice 2. Aucun lot supplémentaire n'est créé pour cette preuve.

## 11.5 New Signal (proof slice : ÉTÉÉAOOÉTÉ)

| Segment | Identity | Cue Map | Build | Acceptance |
|---|---|---|---|---|
| NEEKTAREUM | `DRIFT-IV-NS-NEEK-00` | `DRIFT-IV-NS-NEEK-10` | `DRIFT-IV-NS-NEEK-20` | `DRIFT-IV-NS-NEEK-30` |
| ASITIS | `DRIFT-IV-NS-ASI-00` | `DRIFT-IV-NS-ASI-10` | `DRIFT-IV-NS-ASI-20` | `DRIFT-IV-NS-ASI-30` |
| RELATIVE | `DRIFT-IV-NS-REL-00` | `DRIFT-IV-NS-REL-10` | `DRIFT-IV-NS-REL-20` | `DRIFT-IV-NS-REL-30` |
| OVERTHINK | `DRIFT-IV-NS-OVER-00` | `DRIFT-IV-NS-OVER-10` | `DRIFT-IV-NS-OVER-20` | `DRIFT-IV-NS-OVER-30` |
| HOLD THE LIGHT | `DRIFT-IV-NS-HOLD-00` | `DRIFT-IV-NS-HOLD-10` | `DRIFT-IV-NS-HOLD-20` | `DRIFT-IV-NS-HOLD-30` |
| MIDNIGHT WORK | `DRIFT-IV-NS-MWORK-00` | `DRIFT-IV-NS-MWORK-10` | `DRIFT-IV-NS-MWORK-20` | `DRIFT-IV-NS-MWORK-30` |
| TELATELABA | `DRIFT-IV-NS-TELA-00` | `DRIFT-IV-NS-TELA-10` | `DRIFT-IV-NS-TELA-20` | `DRIFT-IV-NS-TELA-30` |
| LE MONDE S'ENDORT | `DRIFT-IV-NS-SLEEP-00` | `DRIFT-IV-NS-SLEEP-10` | `DRIFT-IV-NS-SLEEP-20` | `DRIFT-IV-NS-SLEEP-30` |
| RENEE | `DRIFT-IV-NS-RENEE-00` | `DRIFT-IV-NS-RENEE-10` | `DRIFT-IV-NS-RENEE-20` | `DRIFT-IV-NS-RENEE-30` |
| PANTHERE | `DRIFT-IV-NS-PANTH-00` | `DRIFT-IV-NS-PANTH-10` | `DRIFT-IV-NS-PANTH-20` | `DRIFT-IV-NS-PANTH-30` |
| ÉTÉÉAOOÉTÉ | `DRIFT-IV-NS-ETEE-00` (proof slice 3) | `DRIFT-IV-NS-ETEE-10` (proof slice 3) | `DRIFT-IV-NS-ETEE-20` (proof slice 3) | `DRIFT-IV-NS-ETEE-30` (proof slice 3) |

Les quatre lots canoniques d'ÉTÉÉAOOÉTÉ constituent intégralement la proof slice 3. ÉTÉÉAOOÉTÉ est la troisième proof slice technique ; elle est produite en amont de son emplacement narratif final dans le rollout intégral, sans modifier sa position de conclusion dans New Signal (§13).

---

# 12. Ordre post-industrialisation (post-gate)

Après `IND-10` et, lorsqu'il est requis, `IND-20`, exécuter les tracks restantes dans leur ordre narratif d'ère. Chaque track réalise son cycle complet (`-00 → -10 → -20 → -30`) avant la suivante.

## Birth Yard

EUX GAINENT est déjà la proof slice acceptée. Ordre restant :

```text
A WALK IN ZEELAND
FOOLFOULE
JAZZYPLING
PLAY IT
```

## Older Shadows

```text
RISE
BLOSSOMING
ETHNIC STICK
MINUIT MOINS CINQ
PERDUE
```

## Vegetative Field

MORNE, ET ? est déjà la proof slice acceptée. Ordre restant :

```text
DAYMASON
CHAILK
TIME
TANTITOM
```

## New Signal

ÉTÉÉAOOÉTÉ est déjà la proof slice technique acceptée, mais reste la conclusion narrative du parcours. Ordre restant :

```text
NEEKTAREUM
ASITIS
RELATIVE
OVERTHINK
HOLD THE LIGHT
MIDNIGHT WORK
TELATELABA
LE MONDE S'ENDORT
RENEE
PANTHERE
```

Important :

- l'ordre d'exécution d'ÉTÉÉAOOÉTÉ comme proof slice ne change pas sa position narrative finale ;
- elle doit être revalidée dans les lots globaux et release après livraison des autres tracks ;
- aucun Identity Contract accepté n'est réouvert sans contradiction démontrée ;
- aucun nouveau lot « harmonisation EUX/MORNE/ETEE » non identifié n'est ajouté — les vérifications d'intégration des proof slices sont absorbées par les lots `GLOB-*`, `RC-*` et les QA d'ère.

---

# 13. Gates dérivés (sans nouveaux lots)

Ces gates ne créent aucun identifiant de lot supplémentaire.

## `PROOF_SLICES_ACCEPTED`

Requiert : `BY-EUX-30`, `VF-MORNE-30`, `NS-ETEE-30`.

## `INDUSTRIALIZATION_DECIDED`

Requiert : `IND-00`, `IND-10`, `IND-20` `DONE` ou `SKIPPED_BY_GATE`.

## `ERA_TRACKS_ACCEPTED` (par ère)

- tous les segments de l'ère possèdent un `-30` accepté ;
- les proof tracks sont incluses ;
- aucune track n'est `PENDING_OWNER_REVIEW` ;
- le contrat d'ère n'est pas contredit.

## `ALL_SEGMENTS_ACCEPTED`

Requiert 27 lots Acceptance acceptés (Entry Ambient inclus).

## `WORLD_CONTINUITY_READY`

Requiert :

- `INDUSTRIALIZATION_DECIDED` ;
- producteurs et consommateurs nécessaires acceptés ;
- résidus bornés ;
- aucune mémoire non gouvernée.

## `RELEASE_CANDIDATE_READY`

Requiert :

- 27 Acceptances ;
- continuité pertinente ;
- harmonisation globale ;
- aucun owner review critique en attente ;
- aucun fallback manquant ;
- aucun échec mobile/performance/export/audio.

---

# 14. Dépendances de continuité (10 lots)

| Lot | Prérequis minimal |
|---|---|
| `CONT-00` Residue ledger | `INDUSTRIALIZATION_DECIDED` + au moins deux producteurs/consommateurs acceptés |
| `CONT-10` Recurring archetype bible | cinq contrats d'ères approuvés ; docs seulement |
| `CONT-20` Recurring archetype runtime | `CONT-10` + `INDUSTRIALIZATION_DECIDED` + tracks sources acceptées |
| `CONT-30` Object migration network | cycle des sept motifs approuvé + producteurs/consommateurs acceptés |
| `CONT-40` Bureaucracy progression | tracks porteuses acceptées dans les cinq ères |
| `CONT-50` λ grammar | manifestations λ localement approuvées |
| `CONT-60` Background transit | architecture et quality tiers prouvés |
| `CONT-70` Era transition directors | segments adjacents acceptés + contrats source/destination |
| `CONT-80` Final ocean restitution | `CONT-00`, `CONT-30`, `CONT-50`, `CONT-70`, New Signal accepté |
| `CONT-90` Transformed return | `CONT-80` + Birth Yard/monde initial acceptés |

Les contrats documentaires peuvent être préparés avant la fin de tous les builds. Aucun runtime de continuité ne peut précéder le gate d'industrialisation.

---

# 15. Harmonisation et release (13 lots)

Lots conservés : `GLOB-00` à `GLOB-90` (10), `RC-00` à `RC-20` (3).

Dépendances générales :

```text
GLOB-* after: ALL_SEGMENTS_ACCEPTED and relevant CONT lots
RC-00 after: GLOB-00 à GLOB-90, CONT-80, CONT-90
RC-10 after: RC-00, owner full-world review
RC-20 after: RC-10 accepted
```

Aucun déploiement avant `RC-20`.

---

# 16. Stop conditions

Arrêter une vague si :

- les tracks convergent vers un template ;
- les budgets ne passent plus ;
- le player régresse ;
- les fallbacks deviennent vides ;
- une mémoire ne peut pas être bornée ;
- les transitions exigent une refonte non approuvée ;
- la densité vient de l'accumulation plutôt que de la vie ;
- les owner reviews s'accumulent ;
- le backlog remplace le jugement artistique ;
- un ancien identifiant `VS*` est utilisé comme s'il s'agissait d'un lot exécutable ;
- une seconde séquence directrice concurrente apparaît.

---

# 17. Métriques

- contrats / 27 ;
- cue maps / 26 + 1 temporal map Entry ;
- builds / 27 ;
- acceptances / 27 ;
- transitions / 5 (4 inter-ères + océan/retour) ;
- arcs de motifs / 7 ;
- archétypes actifs ;
- zones à trois profondeurs ;
- mobile/reduced/no-WebGL ;
- pire fps/draw calls/triangles ;
- régressions audio ;
- reworks ;
- dette artistique ;
- lots canoniques exécutés / 147 ;
- aliases retirés référencés par erreur / 0 attendu.

---

# 18. Dépendances standard (segment et build)

Pour tout segment :

```text
-10 depends on -00
-20 depends on -00 and -10
-30 depends on -20
```

Pour tout Build :

- Identity Contract accepté ;
- Cue Map approuvée ou temporal map Entry acceptée ;
- contrat d'ère lu ;
- systèmes pré-gate requis livrés ;
- budget issu de `BASE-00` ;
- fallbacks définis ;
- aucun autoplay ;
- player global unique.

Pour toute Acceptance :

- build terminé ;
- evidence package ;
- desktop ;
- mobile ;
- reduced motion ;
- no-WebGL ;
- pause ;
- resume ;
- seek ;
- loop ;
- sortie ;
- retour ;
- autre track ;
- reset ;
- console ;
- performance ;
- décision propriétaire.

---

# 19. Absence de backlog concurrent

```text
docs/DRIFT_3D_INTEGRAL_BACKLOG.md  = seule séquence directrice active
docs/DRIFT_BACKLOG.md              = RETIRED_AS_ACTIVE_AUTHORITY
docs/DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md
                                    = GOVERNANCE RECONCILIATION RECORD
                                      NOT AN EXECUTION SEQUENCE
docs/ACTIVE_LOT.md                 = un seul lot actif
```

Aucun autre document actif ne déclare une autre « première séquence » comme prescriptive.

---

# 20. Prochain lot unique

```text
DRIFT-IV-BASE-00 — Capture runtime baseline
```

Documentation seulement pour ce lot `GOV-30`. Aucun runtime n'est modifié.
