# DRIFT_DOCUMENTATION_MAP.md

This map exists to prevent contradictory authority. Status categories used below:

- `ACTIVE AUTHORITY` — governs current decisions now.
- `TARGET` — describes a future/conceptual state, not runtime truth.
- `PRELIMINARY CONTRACT` — must be specialized by an accepted Identity Contract before code.
- `HISTORICAL` — kept for record, does not govern active work.
- `RUNTIME TRUTH` — the actual delivered state; wins over any document on conflict.
- `NOT ON MAIN` — exists elsewhere in Git (branch/tag) but is absent from `main`; cannot be treated as active until reconciled.

| Document | Rôle | Statut | Autorité | Quand le lire | Ce qu'il ne prouve pas |
|---|---|---|---|---|---|
| `docs/MISWAY_SITE_IDENTITY_DOCTRINE.md` | Positionnement public du site MISWAY | `ACTIVE AUTHORITY` | Doctrine d'identité publique | Avant toute décision de copie, ton ou posture commerciale | Ne décrit pas le monde Drift ni son runtime |
| `docs/MISWAY_SITE_IDENTITY_FINAL_REVIEW.md` | Revue finale de clôture du programme SITE-IDENTITY | `HISTORICAL` (clôture actée) | Constat de clôture | Pour comprendre pourquoi SITE-IDENTITY est clos et ce qui a été validé | Ne gouverne plus les lots actifs — sert de référence |
| `docs/DRIFT_3D_REALISM_BIBLE.md` | Doctrine artistique visuelle actuelle (pivot réalisme figuratif, 2026-07-07) | `ACTIVE AUTHORITY` | Autorité visuelle en vigueur sur `main` | Pour toute décision de rendu, matière, lumière ou géométrie | Ne couvre pas la structure de production par lots |
| `docs/DRIFT_3D_ART_DIRECTION.md`, `docs/DRIFT_3D_SET_DESIGN_BLUEPRINT.md`, `docs/DRIFT_3D_TRACK_SCENE_MATRIX.md` | Anciennes doctrines visuelles abstraites | `HISTORICAL` (bannière de caducité visuelle ; règles gameplay encore valides) | Règles gameplay uniquement | Pour retrouver une règle de gameplay antérieure au pivot réalisme | Ne prouve rien sur l'apparence actuelle du monde |
| `docs/DRIFT_3D_PRODUCT_SPEC.md` | Contrat produit Drift 3D | `NOT ON MAIN` (présent sur `drift-lw-cues-00-eux-gainent@ad21600`) | Sera contrat produit après réconciliation | Après `DRIFT-IV-GOV-10` | N'est pas encore une autorité active sur `main` |
| `docs/DRIFT_3D_LIVING_WORLD_BIBLE.md` | Doctrine artistique du monde vivant | `NOT ON MAIN` (présent sur `drift-lw-cues-00-eux-gainent@ad21600`) | Sera doctrine artistique après réconciliation | Après `DRIFT-IV-GOV-10` | N'est pas encore une autorité active sur `main` |
| `docs/DRIFT_3D_LIVING_TRACK_MATRIX.md` | Vision track par track du monde vivant | `NOT ON MAIN` (présent sur `drift-lw-cues-00-eux-gainent@ad21600`) | Sera vision track par track après réconciliation | Après `DRIFT-IV-GOV-10` | N'est pas encore une autorité active sur `main` |
| Approved Track Identity Contracts (ex. `DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md`) | Autorité artistique locale par track | `NOT ON MAIN` pour EUX GAINENT (présent sur `drift-lw-cues-00-eux-gainent@5eed84a`) ; `PRELIMINARY CONTRACT` pour toute autre track tant qu'aucun contrat n'est accepté | Autorité artistique locale, dominante sur toute invention runtime | Avant tout Build (`-20`) d'une track | Ne remplace pas une Cue Map approuvée |
| `docs/DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md` | Programme directeur de production du monde intégral | `ACTIVE` | Programme directeur | Avant toute planification de vague ou de phase | Ne réinterprète pas un contrat artistique déjà accepté |
| `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` | Architecture cible des systèmes partagés | `TARGET_ARCHITECTURE — NOT RUNTIME TRUTH` | Cible d'architecture, jamais vérité runtime automatique | Pour évaluer si une abstraction partagée est justifiée | Ne prouve pas qu'un composant partagé existe réellement |
| `docs/DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md` | Matrice préliminaire des 27 segments et 26 tracks | `ACTIVE_PRELIMINARY_CONTRACT_MATRIX` | Traduction préliminaire ; n'autorise aucun code directement | Pour cadrer un futur Identity Contract | Ne prouve pas qu'un segment a un contrat accepté |
| `docs/DRIFT_3D_INTEGRAL_BACKLOG.md` | Backlog directeur intégral (152 lots) | `ACTIVE` | Séquence directrice unique | Avant de choisir le prochain lot | Ne prouve pas l'état runtime réel — voir le code |
| `docs/DRIFT_3D_QA_ACCEPTANCE_PLAYBOOK.md` | Méthode d'acceptation technique et artistique | `ACTIVE` | Référence QA obligatoire | Avant tout lot Build/Acceptance | Ne remplace pas une preuve réellement exécutée |
| `docs/DRIFT_3D_INTEGRAL_PACKAGE_ADOPTION.md` | Résolution d'adoption du package intégral | `ADOPTED` | Acte de décision propriétaire du 2026-07-16 | Pour retracer les dix décisions fondatrices | Ne détaille pas les contrats d'ères eux-mêmes |
| Era/Transition Contracts (Entry, Birth Yard, Older Shadows, Vegetative Field, New Signal) | Contrats d'ères et de transitions | à créer dans `DRIFT-IV-GOV-20` | Future autorité artistique d'ère | Une fois créés, avant tout lot de la matrice pour cette ère | N'existent pas encore — ne pas les présumer accepter |
| Approved Cue Maps (ex. `DRIFT_3D_EUX_GAINENT_CUE_MAP.md`) | Autorité temporelle et musicale par track | `NOT ON MAIN` pour EUX GAINENT (présent sur `drift-lw-cues-00-eux-gainent@46930a1`) ; sinon inexistantes | Autorité temporelle/musicale, dominante sur tout runtime audio-réactif | Avant tout Build utilisant des cues | Ne prouve pas qu'une track est jouable en production |
| `docs/ACTIVE_LOT.md` | Périmètre exécutable immédiat | `ACTIVE AUTHORITY` | Unique lot actif autorisé | En début de toute session de travail | Ne décrit pas l'historique complet — voir Decisions Log |
| `docs/DECISIONS_LOG.md` | Journal des décisions datées | `HISTORICAL` (append-only) | Trace de decision, pas une autorité prescriptive | Pour comprendre pourquoi un choix a été fait | Ne prescrit pas l'action future — voir Active Lot / Backlog |
| Runtime code (`src/**`, `public/**`) | État réellement livré | `RUNTIME TRUTH` | Autorité finale sur ce qui est en production | Pour vérifier tout ce que les documents affirment | Ne documente pas l'intention — voir les contrats et la bible |

---

## Règle de résolution de conflit

Le code est l'autorité factuelle sur l'état actuellement livré.

Les documents et contrats approuvés gouvernent les modifications futures,
mais ne constituent jamais une preuve que leur contenu est déjà implémenté.

En cas de contradiction sur l'intention future, appliquer l'autorité
documentaire la plus spécifique et la plus récemment approuvée.
