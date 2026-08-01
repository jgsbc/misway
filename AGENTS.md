# AGENTS.md

## Mission

MISWAY is a personal space for creation, memory, and sharing.

- MISWAY est un espace personnel de création, de mémoire et de partage.
- Drift est son monde musical navigable — un road movie à travers un monde mental qui continue de fonctionner après une rupture.
- Le rôle des agents est de protéger la vérité personnelle, le produit fonctionnel et la singularité artistique.
- Aucune posture commerciale artificielle : MISWAY n'est ni une vitrine de licensing, ni un produit à convertir, ni un service à vendre.

---

## Autorités

La hiérarchie documentaire suivante fait foi, de la plus factuelle à la plus directrice :

```text
RUNTIME CODE
  vérité factuelle de ce qui est livré

MISWAY SITE IDENTITY DOCTRINE / FINAL REVIEW
  positionnement public du site

DRIFT 3D REALISM BIBLE
  active visual authority on main

DRIFT 3D PRODUCT SPEC
  contrat produit — active, reconciled on main 2026-07-16

DRIFT 3D LIVING WORLD BIBLE
  doctrine artistique — active, reconciled on main 2026-07-16

DRIFT 3D LIVING TRACK MATRIX
  vision track par track — active, reconciled on main 2026-07-16

DRIFT 3D GLOBAL ART DIRECTION
  doctrine transversale (ratio réalisme/contamination/impossible, densité, λ, anti-patterns) — active, reconciled in GOV-40 ; index/synthèse, ne contredit jamais la Realism Bible ou la Living World Bible

DRIFT 3D ERA TRACK ATLAS
  atlas complet des 27 segments (15 champs) — active preliminary matrix, GOV-40 ; à lire avant DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md pour tout futur Identity Contract

APPROVED TRACK IDENTITY CONTRACTS
  autorité artistique locale
  EUX GAINENT contract: APPROVED LOCAL ARTISTIC AUTHORITY — runtime build: DRIFT-IV-BY-EUX-20 (DONE, merged PR #31) ; owner acceptance: DRIFT-IV-BY-EUX-30 (DONE, merged PR #32 at b069d09)

DRIFT 3D INTEGRAL WORLD PROGRAM
  programme directeur de production

DRIFT 3D INTEGRAL SYSTEMS ARCHITECTURE
  architecture cible (couche comportementale/temporelle), jamais vérité runtime automatique

DRIFT 3D SHARED KIT ARCHITECTURE
  architecture cible (couche actifs/contenu : 15 kits), jamais vérité runtime automatique — GOV-40, complémentaire de l'Integral Systems Architecture

ERA / TRANSITION CONTRACTS
  active era-level authorities created in GOV-20

APPROVED CUE MAPS
  autorité temporelle et musicale
  EUX GAINENT cue map: OWNER-APPROVED INITIAL TEMPORAL BASELINE, human listening follow-up closed out under BY-EUX-30's acceptance — runtime build: DRIFT-IV-BY-EUX-20 (DONE, merged PR #31) ; owner acceptance: DRIFT-IV-BY-EUX-30 (DONE, merged PR #32 at b069d09)

DRIFT 3D INTEGRAL BACKLOG
  FINALIZED ACTIVE DIRECTOR BACKLOG, resequenced by GOV-40 — 153 canonical executable lots (147 + GOV-40 + 5 new PRE-* reuse-first gates), 5 retired VS aliases

ACTIVE LOT
  unique périmètre exécutable immédiat
```

Le programme organise la livraison. Il ne réinterprète jamais un contrat artistique déjà accepté.
Le code reste l'autorité de l'état réellement livré.
Une autorité artistique ou temporelle approuvée (Living World Bible, Living Track Matrix, Identity Contract, Cue Map) ne prouve jamais que son runtime est livré sur `main` — voir `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md`.
Depuis `DRIFT-IV-GOV-40` : un ensemble de kits d'actifs/contenu partagés (`docs/DRIFT_3D_SHARED_KIT_ARCHITECTURE.md`) est désormais défini et priorisé **avant** la reprise du travail track par track, via le groupe de gates `DRIFT-IV-PRE-00` à `PRE-40` — voir `docs/DRIFT_3D_INTEGRAL_BACKLOG.md` §8.2 et `docs/DRIFT_3D_GOV40_RECONCILIATION.md` §1.1. Aucune décision artistique déjà approuvée n'est réouverte par ce changement de séquencement.

Voir `docs/DRIFT_DOCUMENTATION_MAP.md` pour le rôle, le statut et l'autorité de chaque document.

---

## Read packs

Pour toute tâche Drift, lire dans l'ordre le read pack obligatoire immédiat — uniquement des documents présents et actifs sur `main` :

```text
AGENTS.md
docs/ACTIVE_LOT.md
docs/DRIFT_DOCUMENTATION_MAP.md
docs/DRIFT_3D_REALISM_BIBLE.md
docs/DRIFT_3D_PRODUCT_SPEC.md
docs/DRIFT_3D_LIVING_WORLD_BIBLE.md
docs/DRIFT_3D_LIVING_TRACK_MATRIX.md
docs/DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md
docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md
docs/DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md
docs/DRIFT_3D_INTEGRAL_BACKLOG.md
docs/DRIFT_3D_QA_ACCEPTANCE_PLAYBOOK.md
```

Puis, selon le lot, ajouter :

- le contrat d'ère concerné ;
- le contrat d'identité de la track concernée (ex. `docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md` pour un lot EUX GAINENT) ;
- la cue map approuvée de la track concernée (ex. `docs/DRIFT_3D_EUX_GAINENT_CUE_MAP.md` pour un lot EUX GAINENT) ;
- les documents d'acceptation pertinents ;
- `docs/DRIFT_3D_RUNTIME_BASELINE.md` pour tout lot `SYS-*` ou Build citant un budget de performance ;
- `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` pour tout lot `SYS-10`/`SYS-20` ou tout code consommant `audioClockRef` ;
- `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` pour tout lot `SYS-20`+ ou tout code consommant `sceneLifecycleRef` ;
- `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md` pour tout lot `SYS-30`+ ou tout Build track consommant un Cue Resolver ;
- `docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md` pour tout lot `SYS-40`+ ou tout futur Build consommant l'arbitrage de signature.
- `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md` pour tout lot `SYS-50`+ ou tout futur Build consommant un Quality Tier.
- `docs/DRIFT_3D_REDUCED_MOTION_CONTRACT.md` pour tout lot `SYS-60`+ ou tout futur Build implémentant un chemin reduced-motion.
- `docs/DRIFT_3D_NO_WEBGL_NARRATIVE_PATH_CONTRACT.md` pour tout lot `SYS-70`+ ou tout futur Build implémentant un fallback no-WebGL local.
- `docs/DRIFT_3D_EVIDENCE_PERFORMANCE_HARNESS_CONTRACT.md` pour tout futur Build promettant une preuve de performance/render-cost/FPS/avant-après-optimisation.

Le contrat d'identité et la cue map d'une track restent des lectures conditionnelles au lot concerné ; ils n'entrent jamais dans le read pack obligatoire immédiat ci-dessus.

### Mapping conditionnel des contrats d'ères

```text
ENTRY
→ docs/DRIFT_3D_ERA_ENTRY_CONTRACT.md
BIRTH YARD
→ docs/DRIFT_3D_ERA_BIRTH_YARD_CONTRACT.md
OLDER SHADOWS
→ docs/DRIFT_3D_ERA_OLDER_SHADOWS_CONTRACT.md
VEGETATIVE FIELD
→ docs/DRIFT_3D_ERA_VEGETATIVE_FIELD_CONTRACT.md
NEW SIGNAL
→ docs/DRIFT_3D_ERA_NEW_SIGNAL_CONTRACT.md
```

Règles de lecture :

- un lot track lit le contrat de son ère ;
- un lot de transition lit le contrat source et le contrat destination ;
- `GOV-30`, `BASE-00` et les audits globaux lisent les cinq ;
- les cinq contrats ne doivent pas tous être chargés automatiquement pour une modification locale sans rapport.

### Règles du backlog directeur finalisé

- Un seul identifiant canonique de `docs/DRIFT_3D_INTEGRAL_BACKLOG.md` peut devenir `ACTIVE_LOT` à la fois.
- `VS1` / `VS2` / `VS3` (« vertical slice ») désignent des rôles de preuve, jamais des lots exécutables.
- Les anciens identifiants `DRIFT-IV-VS1-00`, `DRIFT-IV-VS2-00`, `DRIFT-IV-VS2-10`, `DRIFT-IV-VS3-00`, `DRIFT-IV-VS3-10` sont `RETIRED_ALIAS — DO NOT EXECUTE` : ils ne peuvent plus nommer une branche, une PR ni un commit.
- `DRIFT-IV-BASE-00`, `DRIFT-IV-SYS-00`, `DRIFT-IV-SYS-10`, `DRIFT-IV-SYS-20`, `DRIFT-IV-SYS-30`, `DRIFT-IV-SYS-40`, `DRIFT-IV-SYS-50`, `DRIFT-IV-SYS-60`, `DRIFT-IV-SYS-70`, `DRIFT-IV-BY-EUX-20` **et `DRIFT-IV-BY-EUX-30`** sont `DONE` (`BY-EUX-30` mergé PR #32 à `b069d09`, owner-accepted) — **SHARED PRE-GATE FOUNDATION COMPLETE.** `DRIFT-IV-GOV-40` est `DONE_PENDING_MERGE` (rebase resolution) ; **une fois `GOV-40` mergé, le lot suivant devient `DRIFT-IV-PRE-00`** (`BLOCKED_BY_DEPENDENCY` jusque-là, pas commencé), pas directement une nouvelle track (`DRIFT_3D_INTEGRAL_BACKLOG.md` §8.2/§20).
- Pour comprendre l'origine et le mapping des aliases retirés, lire conditionnellement `docs/DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md` (rapport de réconciliation de gouvernance, pas un backlog).
- `docs/DRIFT_3D_RUNTIME_BASELINE.md` fait autorité comme baseline runtime jusqu'à révision par la preuve propre d'un lot Build ; il distingue explicitement ce qui est `MEASURED` de ce qui est `INFERRED_FROM_REPRESENTATIVE_SAMPLE` — voir `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` pour le détail.
- **Aucun lot d'implémentation de track ne peut commencer avant l'acceptation propriétaire de `docs/DRIFT_3D_ERA_TRACK_ATLAS.md` et `docs/DRIFT_3D_MASTERFRAME_BRIEFS.md`** (`DRIFT-IV-PRE-00`) — règle explicite de `DRIFT-IV-GOV-40`.

---

## Non-négociables produit

- `/drift` reste la route 3D de production.
- Un seul player global.
- Aucun autoplay lors de l'entrée dans une zone.
- Le monde diégétique reste distinct de la track.
- Mobile, reduced motion, no-WebGL, export statique et `basePath` sont des chemins produit de première classe, jamais secondaires.
- Aucune invention artistique runtime sans contrat accepté.
- Aucune abstraction de scène ou de continuité mondiale n'est partagée avant le gate d'industrialisation. Seuls les huit services d'infrastructure minces explicitement autorisés par `DRIFT-IV-SYS-00` à `DRIFT-IV-SYS-70` peuvent être réalisés avant les proof slices.
- Aucun lot track `PASS` sans décision propriétaire explicite.
- Aucune QA déclarée sans preuve.
- Aucune modification hors lot.

---

## Modèle d'exécution

Un seul lot actif à la fois. Pour chaque lot :

1. préflight ;
2. scope strict ;
3. patch borné ;
4. validations ;
5. evidence package ;
6. mise à jour du Decision Log et de l'Active Lot ;
7. arrêt sur contradiction ou régression.

---

## Stop conditions

Arrêter et rapporter clairement si l'une de ces conditions survient :

- travail hors branche ;
- working tree non propre ;
- autorité documentaire contradictoire ;
- modification d'un fichier protégé ;
- build ou lint en échec ;
- second player ou autoplay ;
- perte de fallback ;
- abstraction prématurée ;
- invention artistique ;
- impossible de produire les preuves annoncées.

Ne pas poursuivre aveuglément après un échec.

---

## Rule of restraint

Quand un doute existe, choisir :

- clarté plutôt que quantité,
- précision plutôt que verbosité,
- cohérence plutôt que nouveauté,
- utilité réelle plutôt que décoration.

MISWAY doit devenir plus juste, pas plus bruyant.
