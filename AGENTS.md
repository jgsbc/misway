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

APPROVED TRACK IDENTITY CONTRACTS
  autorité artistique locale
  EUX GAINENT contract: APPROVED LOCAL ARTISTIC AUTHORITY — runtime still deferred to VS1-00

DRIFT 3D INTEGRAL WORLD PROGRAM
  programme directeur de production

DRIFT 3D INTEGRAL SYSTEMS ARCHITECTURE
  architecture cible, jamais vérité runtime automatique

ERA / TRANSITION CONTRACTS
  active era-level authorities created in GOV-20

APPROVED CUE MAPS
  autorité temporelle et musicale
  EUX GAINENT cue map: OWNER-APPROVED INITIAL TEMPORAL BASELINE, human listening follow-up required — runtime still deferred to VS1-00

DRIFT 3D INTEGRAL BACKLOG
  séquence directrice

ACTIVE LOT
  unique périmètre exécutable immédiat
```

Le programme organise la livraison. Il ne réinterprète jamais un contrat artistique déjà accepté.
Le code reste l'autorité de l'état réellement livré.
Une autorité artistique ou temporelle approuvée (Living World Bible, Living Track Matrix, Identity Contract, Cue Map) ne prouve jamais que son runtime est livré sur `main` — voir `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md`.

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
- les documents d'acceptation pertinents.

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

---

## Non-négociables produit

- `/drift` reste la route 3D de production.
- Un seul player global.
- Aucun autoplay lors de l'entrée dans une zone.
- Le monde diégétique reste distinct de la track.
- Mobile, reduced motion, no-WebGL, export statique et `basePath` sont des chemins produit de première classe, jamais secondaires.
- Aucune invention artistique runtime sans contrat accepté.
- Aucune abstraction partagée avant preuve sur plusieurs vertical slices.
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
