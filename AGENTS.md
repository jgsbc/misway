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

DRIFT 3D SPATIAL BIBLE / SPATIAL ATLAS
  autorité active et bornée pour chemins, placement, statut spatial et catalogue courant
  distingue topologyPosition / effectiveProductionPosition / owner acceptance
  n'autorise jamais à réinterpréter une identité artistique ou une cue map

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
  atlas artistique détaillé du corpus juillet 2026 ; reste une source par-track pour les entrées qu'il décrit
  ses anciens comptes/membres 26 tracks ne gouvernent plus le catalogue spatial courant

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
  active era-level artistic authorities created in GOV-20
  leurs inventaires de tracks datés ne remplacent pas le catalogue runtime/spatial courant

APPROVED CUE MAPS
  autorité temporelle et musicale
  EUX GAINENT cue map: OWNER-APPROVED INITIAL TEMPORAL BASELINE, human listening follow-up closed out under BY-EUX-30's acceptance — runtime build: DRIFT-IV-BY-EUX-20 (DONE, merged PR #31) ; owner acceptance: DRIFT-IV-BY-EUX-30 (DONE, merged PR #32 at b069d09)

DRIFT 3D INTEGRAL BACKLOG
  directeur historique/fondation ; ne peut pas écraser un lot plus récent explicitement autorisé par le propriétaire

ACTIVE LOT / EXPLICIT CURRENT OWNER TASK
  unique périmètre exécutable immédiat
```

Le programme organise la livraison. Il ne réinterprète jamais un contrat artistique déjà accepté.
Le code reste l'autorité de l'état réellement livré.
Une autorité artistique ou temporelle approuvée (Living World Bible, Living Track Matrix, Identity Contract, Cue Map) ne prouve jamais que son runtime est livré sur `main` — voir `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md`.

Pour toute question de catalogue courant, chemin, placement ou statut spatial, lire `docs/DRIFT_3D_SPATIAL_BIBLE.md` et `docs/DRIFT_3D_SPATIAL_ATLAS.json` avant d'interpréter les anciens comptes de tracks. Le catalogue courant est 32 tracks : Birth Yard 7, Older Shadows 5, Vegetative Field 6, New Signal 14 ; EUX GAINENT appartient à New Signal ; `eteeaooete` est retiré.

Voir `docs/DRIFT_DOCUMENTATION_MAP.md` pour le rôle historique et général des autres documents.

---

## Read packs

### Fast path obligatoire — tâches spatiales

Pour toute tâche dont l'objectif principal est **chemin, route, placement, reachability, topologie de circulation, voisinage de tracks ou continuité spatiale**, **ne pas charger automatiquement le gros read pack générique ci-dessous**. Lire uniquement :

```text
1. AGENTS.md
2. docs/DRIFT_3D_SPATIAL_BIBLE.md
3. docs/DRIFT_3D_SPATIAL_ATLAS.json
4. contrat de l'ère concernée uniquement
5. entrée Track Atlas / Identity Contract de la track concernée uniquement
6. src/lib/tracks.ts
7. src/lib/drift3dTopology.ts
8. src/lib/drift3dTerrain.ts
9. implémentation spatiale production/lab directement concernée
```

Ajouter la Realism Bible, Living World Bible, Cue Map, architecture système ou autres documents uniquement si le patch touche réellement leur domaine.

Règles du fast path spatial :

- une coordonnée runtime est un `RUNTIME_FACT`, pas une acceptation artistique finale ;
- `topologyPosition` peut différer de `effectiveProductionPosition` ; ne pas les confondre ;
- `OPEN`, `PROPOSAL` et `DERIVED` ne deviennent jamais une décision propriétaire parce qu'un agent les code ;
- exploration spatiale dans `/drift-evolution` par défaut ; promotion `/drift` dans un lot/PR séparé après acceptation propriétaire ;
- vérifier route + terrain + eau + colliders + braquage/freinage + caméra + reveal/exit avant de déclarer un placement valide ;
- ne jamais ressusciter le catalogue 26 tracks pour corriger le runtime courant.

### Read pack générique

Pour une tâche Drift globale/non spatiale qui nécessite réellement le corpus complet, lire dans l'ordre :

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
- `docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md` pour tout lot `SYS-40`+ ou tout futur Build consommant l'arbitrage de signature ;
- `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md` pour tout lot `SYS-50`+ ou tout futur Build consommant un Quality Tier ;
- `docs/DRIFT_3D_REDUCED_MOTION_CONTRACT.md` pour tout lot `SYS-60`+ ou tout futur Build implémentant un chemin reduced-motion ;
- `docs/DRIFT_3D_NO_WEBGL_NARRATIVE_PATH_CONTRACT.md` pour tout lot `SYS-70`+ ou tout futur Build implémentant un fallback no-WebGL local ;
- `docs/DRIFT_3D_EVIDENCE_PERFORMANCE_HARNESS_CONTRACT.md` pour tout futur Build promettant une preuve de performance/render-cost/FPS/avant-après-optimisation.

Le contrat d'identité et la cue map d'une track restent des lectures conditionnelles au lot concerné.

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
- les cinq contrats ne doivent pas tous être chargés automatiquement pour une modification locale sans rapport ;
- pour l'appartenance actuelle d'une track à une ère, le runtime + Spatial Atlas prévalent sur les inventaires datés des contrats d'ère.

### Backlog historique et lot courant

Les lots `DRIFT-IV-*` et leur historique restent utiles pour comprendre les preuves et autorités déjà acquises. Cependant, le repository a continué d'évoluer après les statuts PRE enregistrés dans `ACTIVE_LOT.md` et le backlog. Un lot plus récent explicitement autorisé par JG, tel que `DRIFT-SPATIAL-GOV-00`, peut donc devenir le périmètre courant sans qu'un ancien champ `Current lot` soit traité comme une interdiction absolue.

Ne jamais réinterpréter cette règle comme une autorisation de travailler hors périmètre : **un seul lot/tâche propriétaire explicite à la fois**.

---

## Non-négociables produit

- `/drift` reste la route 3D de production.
- `/drift-evolution` est la zone d'exploration/pilotage avant promotion lorsqu'un lot le prévoit.
- Un seul player global.
- Aucun autoplay lors de l'entrée dans une zone.
- Le monde diégétique reste distinct de la track.
- Mobile, reduced motion, no-WebGL, export statique et `basePath` sont des chemins produit de première classe, jamais secondaires.
- Aucune invention artistique runtime sans contrat accepté ou décision propriétaire explicite.
- Aucun lot track `PASS` sans décision propriétaire explicite.
- Aucune QA déclarée sans preuve.
- Aucune modification hors lot.
- Un lot spatial ne mélange pas textures/détails, audio, caméra, véhicule ou dramaturgie sauf nécessité démontrée et explicitement incluse au scope.
- Un lot spatial ne promeut pas automatiquement sa propre exploration vers `/drift`.

---

## Modèle d'exécution

Un seul lot actif à la fois. Pour chaque lot :

1. préflight ;
2. scope strict ;
3. patch borné ;
4. validations proportionnées au risque ;
5. evidence/constat compact ;
6. décision propriétaire quand le résultat est artistique ou spatial ;
7. arrêt sur contradiction ou régression.

Éviter les suites de tests complètes répétées sans raison. Pour un lot documentaire/spatial sans runtime modifié, préférer les validations ciblées, puis laisser la CI du PR fournir la couverture standard.

---

## Stop conditions

Arrêter et rapporter clairement si l'une de ces conditions survient :

- travail hors branche/périmètre ;
- autorité documentaire réellement contradictoire et non réconciliée ;
- modification d'un fichier protégé hors scope ;
- build/lint/test ciblé en échec après le patch concerné ;
- second player ou autoplay ;
- perte de fallback ;
- abstraction prématurée ;
- invention artistique silencieuse ;
- `OPEN` transformé en canon sans décision ;
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
