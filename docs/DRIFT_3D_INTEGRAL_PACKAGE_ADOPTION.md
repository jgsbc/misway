# DRIFT 3D — Adoption du package « monde intégral »

- **Date :** 2026-07-15
- **Statut :** `ADOPTED`

---

# 1. Fichiers à intégrer

```text
docs/DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md
docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md
docs/DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md
docs/DRIFT_3D_INTEGRAL_BACKLOG.md
docs/DRIFT_3D_QA_ACCEPTANCE_PLAYBOOK.md
```

---

# 2. Hiérarchie

```text
PRODUCT SPEC
  ↓
LIVING WORLD BIBLE
  ↓
LIVING TRACK MATRIX
  ↓
TRACK IDENTITY CONTRACTS
  ↓
INTEGRAL WORLD PROGRAM
  ↓
ERA / TRANSITION CONTRACTS
  ↓
CUE MAPS
  ↓
INTEGRAL BACKLOG / ACTIVE LOT
  ↓
RUNTIME
```

Le programme organise la livraison. Il ne réinterprète pas un contrat accepté.

---

# 3. Documents existants à mettre à jour

## Documentation Map

Ajouter les cinq documents avec statuts : programme `ACTIVE` après validation, architecture `TARGET`, matrice V2 `DRAFT` puis `ACTIVE`, backlog `ACTIVE`, QA playbook `ACTIVE`.

## Backlog

Recommandation : remplacer le contenu actif, conserver l'historique dans Git.

## Active Lot

Ouvrir :

```text
DRIFT-IV-GOV-00 — Adopt Integral World program
```

## Decisions Log

Consigner :

- vision validée ;
- couverture intégrale ;
- 27 segments ;
- quatre lots par segment ;
- industrialisation après trois slices ;
- continuité post-gate ;
- aucun runtime dans l'adoption.

## AGENTS

Ajouter les cinq documents au read pack Drift.

---

# 4. Lot d'adoption

## Scope in

- cinq nouveaux documents ;
- documentation map ;
- backlog ;
- active lot ;
- decision log ;
- AGENTS read pack.

## Scope out

- `src/**` ;
- `public/**` ;
- packages/config ;
- assets ;
- cue maps ;
- runtime ;
- branches CUES/VS1.

## Validation

- documentation-only diff ;
- aucune autorité contradictoire ;
- 27 segments ;
- 26 tracks ;
- lots complets ;
- aucun backlog actif contradictoire ;
- lint/build seulement comme non-régression.

---

# 5. Décisions propriétaire avant adoption

1. North Star ;
2. quatre régimes d'ères ;
3. sept motifs ;
4. population récurrente silencieuse ;
5. bureaucratie invisible ;
6. océan synthèse/effacement ;
7. retour transformé ;
8. cycle quatre lots ;
9. gate après trois vertical slices ;
10. contrats d'ères en cinq fichiers ou document unique.

---

# 6. Première séquence

```text
DRIFT-IV-GOV-00
DRIFT-IV-GOV-10
DRIFT-IV-GOV-20
DRIFT-IV-GOV-30
DRIFT-IV-BASE-00
DRIFT-IV-SYS-00
DRIFT-IV-VS1-00
DRIFT-IV-VS2-00
DRIFT-IV-VS2-10
DRIFT-IV-VS3-00
DRIFT-IV-VS3-10
DRIFT-IV-IND-00
```

Ne pas lancer les 26 tracks en parallèle.

---

# Adoption resolution — 2026-07-16

Le programme intégral du monde vivant Drift est officiellement adopté comme gouvernance de production, en cohérence avec le positionnement personnel et non commercial de MISWAY (programme SITE-IDENTITY clos, baseline `main@2513998`).

Les dix décisions propriétaire ci-dessous sont consignées comme approuvées et font désormais autorité :

1. **North Star** — MISWAY Drift est un road movie musical à travers un monde mental qui s'est organisé pour continuer à fonctionner après une rupture, révélant peu à peu ce qu'il a dû sacrifier pour tenir debout. Approuvée sans réserve.
2. **Entry et les quatre régimes d'ères** — Entry (contrôle de normalité), Birth Yard (fabrication des rôles), Older Shadows (intensité et choix), Vegetative Field (maintenance du confort), New Signal (recomposition intérieure). Approuvés comme structure d'expérience globale.
3. **Sept motifs transversaux** — vélo vide, panneau administratif, fenêtre allumée, pierre, trace, ombre, lumière portative. Approuvés comme grammaire visuelle du monde.
4. **Population récurrente d'archétypes silencieux** — les douze archétypes documentés (employé en retard, personne qui attend, enfant suivant l'invisible, etc.) sont approuvés comme population traversant les ères, sans dialogue ni biographie explicative.
5. **Progression de la bureaucratie invisible** — de l'autorisation (Entry) à la perte de contrôle (New Signal) puis à l'illisibilité (océan). Approuvée comme fil directeur systémique.
6. **Océan comme synthèse imparfaite puis effacement** — la restitution finale de 3 à 7 fragments maximum, composition λ puis vague d'effacement, sans jamais afficher une checklist du parcours. Approuvée.
7. **Retour transformé vers le monde initial** — boucle de retour visible mais non narrativement fermée. Approuvée.
8. **Cycle standard par morceau** — quatre lots (Identity Contract, Cue Map, Build, Acceptance) par segment, sans passage direct de l'idée au code. Approuvé comme méthode de production obligatoire.
9. **Gate d'industrialisation après trois vertical slices** — EUX GAINENT, MORNE ET ?, ÉTÉÉAOOÉTÉ. Aucune abstraction partagée n'est extraite avant preuve sur au moins deux scènes et validation à ce gate. Approuvé.
10. **Contrats d'ères en cinq fichiers distincts** — tranché en faveur de cinq fichiers séparés (Entry, Birth Yard, Older Shadows, Vegetative Field, New Signal) plutôt qu'un document unique, à produire dans `DRIFT-IV-GOV-20`. Approuvé.

Cette résolution ferme la proposition `PROPOSED` du 2026-07-15 et fait passer le statut de ce document et des cinq documents du package à `ACTIVE` / `ADOPTED` selon leur nature respective. Aucun runtime n'est modifié par cette adoption.
