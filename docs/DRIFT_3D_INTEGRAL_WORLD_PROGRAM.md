# DRIFT 3D — Programme intégral du monde vivant

- **Projet :** MISWAY / Drift
- **Version :** 2.0
- **Date :** 2026-07-15
- **Statut :** `ACTIVE`
- **Adopted :** 2026-07-16
- **Nature :** document directeur de production.

---

## 0. Objet

Ce document transforme la vision globale de Drift en programme de production gouverné.

Il ne remplace pas :

1. `DRIFT_3D_PRODUCT_SPEC.md` pour la vérité du produit livré ;
2. `DRIFT_3D_LIVING_WORLD_BIBLE.md` pour la doctrine artistique ;
3. `DRIFT_3D_LIVING_TRACK_MATRIX.md` pour les contrats track par track ;
4. les contrats d'identité spécifiques approuvés ;
5. le code pour l'état réellement livré.

Il ajoute :

- une cible mondiale cohérente ;
- une architecture de mise en œuvre par preuves successives ;
- des systèmes transversaux bornés ;
- une méthode d'industrialisation qui protège l'identité ;
- une définition de l'exhaustivité ;
- un ordre de livraison complet.

---

# 1. North Star du programme

> **MISWAY Drift est un road movie musical à travers un monde mental qui s'est organisé pour continuer à fonctionner après une rupture — mais dont chaque système révèle peu à peu ce qu'il a dû sacrifier pour tenir debout.**

La trajectoire globale est :

```text
ÊTRE DÉCLARÉ ANORMAL
→ APPRENDRE À FONCTIONNER
→ APPRENDRE À SE SENTIR VIVANT
→ FONCTIONNER JUSQU'À NE PLUS SENTIR
→ NE PLUS POUVOIR CONTINUER COMME AVANT
→ RECONSTRUIRE SANS EFFACER LES TRACES
```

Le monde final ne doit pas déclarer que tout est réparé. Il devient habitable parce qu'il accepte ses fissures.

---

# 2. Définition de « mise en œuvre intégrale »

La vision est intégralement mise en œuvre lorsque :

- l'entrée et les quatre ères ont une identité spatiale, sociale et temporelle distincte ;
- les 26 tracks ont chacune un contrat d'identité, une cue map validée, une scène livrée et une acceptation propriétaire ;
- le monde contient une vie autonome hors interaction ;
- les arrière-plans et transitions annoncent d'autres zones ;
- une population récurrente traverse les ères ;
- les objets et motifs migrent entre les tracks ;
- les actions du joueur laissent des résidus bornés ;
- l'océan final restitue des fragments du parcours ;
- le retour vers le monde initial montre une transformation sans boucle narrative fermée ;
- la musique reste la source de sens ;
- mobile, reduced motion, no-WebGL, export statique et `basePath` restent des chemins produit de première classe ;
- les budgets de performance tiennent dans les zones les plus denses ;
- aucune track n'est réduite à un template.

---

# 3. Doctrine d'implémentation

## 3.1 Socle mince, scènes singulières

La cible est :

```text
PROTECTED PRODUCT SHELL
  + THIN PROVEN SHARED SERVICES
  + TRACK-LOCAL LIVING SCENES
  + GOVERNED CROSS-WORLD CONTINUITY
```

Une abstraction ne devient partagée qu'après preuve sur au moins deux scènes et validation au `INDUSTRIALIZATION_GATE`. Cette règle de preuve concerne les abstractions issues des scènes, les systèmes de continuité post-gate et les comportements narratifs partagés. Elle ne bloque pas les services minces déjà autorisés en §5.1 (services partagés autorisables avant le gate).

## 3.2 Le monde ne doit pas attendre le joueur

Chaque zone possède au minimum :

- trois boucles de vie autonomes ;
- un mouvement d'arrière-plan ;
- une micro-situation humaine ou matérielle ;
- un élément qui continue hors champ ;
- un état sans musique ;
- un état avec musique ;
- un résidu après événement.

## 3.3 La densité est temporelle

1. **Vie immédiate** — lisible en 2 à 5 secondes.
2. **Vie secondaire** — comprise après observation.
3. **Vie profonde** — découverte au retour ou par continuité inter-track.

La densité ne doit pas être obtenue par une multiplication incontrôlée des meshes.

## 3.4 Le graphisme naît de la matière

Le graphisme doit provenir de vitres, eau, ombres, panneaux, sols, tissus, poussière, pluie, neige, écume, reflets, écrans diégétiques et erreurs d'impression.

## 3.5 Un impossible principal par track

Chaque track possède une anomalie centrale. Les autres étrangetés servent cette anomalie ou restent au niveau de la vie autonome.

## 3.6 La mémoire est bornée

Les mémoires autorisées sont locales à la route ou à la session, limitées en nombre, abstraites, réinitialisables et sans donnée personnelle.

## 3.7 Vertical slice = rôle de preuve, jamais un espace de lots

Vertical slice 1, 2 et 3 désignent des rôles de preuve (respectivement EUX GAINENT, MORNE ET ?, ÉTÉÉAOOÉTÉ), jamais un espace de lots distinct. L'exécution canonique utilise toujours les quatre identifiants standard de segment (`-00` Identity Contract, `-10` Cue Map ou carte temporelle pour Entry, `-20` Build, `-30` Acceptance). Les identifiants `DRIFT-IV-VS1-00`, `DRIFT-IV-VS2-00`, `DRIFT-IV-VS2-10`, `DRIFT-IV-VS3-00` et `DRIFT-IV-VS3-10` sont des alias retirés — voir `DRIFT_3D_INTEGRAL_BACKLOG.md` et `DRIFT_3D_DIRECTOR_BACKLOG_FINALIZATION.md`.

---

# 4. Architecture d'expérience globale

## 4.1 Régimes des ères

| Segment | Régime | Densité | Contamination | Fonction |
|---|---|---:|---:|---|
| Entry | contrôle de normalité | faible | fissure | autoriser l'anomalie |
| Birth Yard | fabrication des rôles | très forte | sociale et médiatique | apprendre à fonctionner |
| Older Shadows | intensité et choix | ouverte | cinétique et matérielle | se sentir vivant |
| Vegetative Field | maintenance du confort | moyenne, répétitive | bureaucratique | s'endormir en fonctionnant |
| New Signal | recomposition intérieure | variable | spatiale et mémorielle | reconstruire autrement |

## 4.2 Motifs transversaux

Sept motifs structurent le monde :

1. vélo vide ;
2. panneau administratif ;
3. fenêtre allumée ;
4. pierre ;
5. trace ;
6. ombre ;
7. lumière portative.

Chaque motif doit avoir une première apparition, deux transformations, une manifestation finale, un fallback et un budget.

## 4.3 Population récurrente

Créer une population réduite d'archétypes silencieux :

- employé en retard ;
- personne qui attend ;
- enfant suivant l'invisible ;
- costume aux chaussures boueuses ;
- cycliste absent ;
- gardien administratif ;
- silhouette nocturne ;
- voyageur chargé d'un objet inutile ;
- sportif corrigé ;
- personne qui reste éveillée ;
- présence associée aux matières et renaissances ;
- ombre féline.

Ils n'ont ni dialogue ni biographie explicative. Leur continuité passe par silhouette, geste, accessoire et déplacement.

## 4.4 Bureaucratie invisible

Sa progression :

```text
ENTRY : elle autorise
BIRTH YARD : elle organise
OLDER SHADOWS : elle balise
VEGETATIVE FIELD : elle anesthésie
NEW SIGNAL : elle accuse puis perd le contrôle
OCÉAN : ses fragments deviennent illisibles
```

---

# 5. Systèmes de production requis

## 5.1 Services partagés autorisables avant le gate

- horloge audio stable ;
- resolver de cues pur ;
- lifecycle `mount / active / pause / reset / unmount` ;
- arbitration d'un seul événement signature majeur ;
- qualité graphique et densité adaptatives ;
- contrats reduced motion/no-WebGL ;
- mesure performance ;
- harness de tests temporels ;
- format de preuves visuelles.

## 5.2 Services après trois vertical slices

- mémoire de session commune ;
- registre des résidus ;
- population récurrente ;
- migrations d'objets ;
- transitions d'ères ;
- kit de bureaucratie ;
- kit de surfaces graphiques ;
- logique de motifs λ ;
- restitution finale de l'océan ;
- retour transformé vers Birth Yard.

## 5.3 Ce qui reste track-local

- dramaturgie ;
- cue map ;
- acteurs ;
- texte dominant ;
- anomalie ;
- objets signature ;
- après-coup ;
- hidden interaction ;
- mise en scène ;
- rythme visuel.

---

# 6. Pipeline standard d'une track

## T0 — Identity Contract

Produit : inspiration transmutée, North Star, lieu, vie autonome, anomalie, signature, objets, population, continuité, résidu, do-not-do, fallbacks et budgets.

## T1 — Cue Map

Produit : source canonique, structure, cues, start/peak/end, confiance, pause/seek/loop et validation propriétaire.

## T2 — Build

Produit : scène locale, données, assets, réactions, fallbacks, tests et documentation.

## T3 — Acceptance

Produit : QA propriétaire, preuves desktop/mobile/reduced motion/audio/performance/reset et décision finale.

Aucune track ne passe directement de l'idée au code.

---

# 7. Phases du programme

## Phase 0 — Adoption et réconciliation

- adopter ce programme ;
- réconcilier les branches Living World ;
- figer l'état réel d'EUX GAINENT ;
- mettre à jour la carte documentaire ;
- remplacer le backlog directeur ;
- créer les contrats d'ères.

## Phase 1 — Fondations prouvées

- achever les contrats, cue maps et la proof slice 1 EUX GAINENT (`DRIFT-IV-BY-EUX-00` à `DRIFT-IV-BY-EUX-30`) ;
- produire la proof slice 2 MORNE ET ? (`DRIFT-IV-VF-MORNE-00` à `DRIFT-IV-VF-MORNE-30`) ;
- produire la proof slice 3 ÉTÉÉAOOÉTÉ (`DRIFT-IV-NS-ETEE-00` à `DRIFT-IV-NS-ETEE-30`) ;
- mesurer les trois architectures ;
- décider ce qui peut être partagé.

## Phase 2 — Industrialisation bornée

Extraire uniquement les comportements communs réellement prouvés.

## Phase 3 — Birth Yard

Prouver densité urbaine, flux, médias, vie sociale et satire des systèmes.

## Phase 4 — Older Shadows

Prouver vent, trajectoires, altitude, matière culturelle, choix et disparition.

## Phase 5 — Vegetative Field

Prouver humour deadpan, réactions en chaîne, traces, temporalité et retour du désir.

## Phase 6 — New Signal

Prouver changement de référentiel, mémoire, dépouillement, climat, travail nocturne, ombre et reconstruction.

## Phase 7 — Continuité mondiale

Population, objets migrants, bureaucratie, motifs, résidus, transitions, océan final et boucle de retour.

## Phase 8 — Harmonisation

Color script, son diégétique, densité, textes, transitions, performance, mobile, reduced motion et no-WebGL.

## Phase 9 — Release

Parcours complet, tests de session, régression audio, export, accessibilité et acceptation propriétaire finale.

---

# 8. Gates

1. **Artistic Contract** — aucun code avant North Star et anomalie validées.
2. **Technical Contract** — scope, budgets, reset et fallbacks.
3. **Implementation** — patch minimal, aucune invention artistique.
4. **Automated Validation** — tests, lint, build, diff, fichiers protégés.
5. **Runtime Evidence** — desktop, mobile, reduced motion, audio, console, performance.
6. **Owner Acceptance** — aucun lot track `PASS` sans décision explicite.

---

# 9. Budgets directeurs

- mobile ≥30 fps ;
- desktop ≥50 fps sur scènes de référence ;
- plafond directeur ≤300 draw calls et ≤1,5 M triangles ;
- aucune allocation évitable dans `useFrame` ;
- aucun `setState` React par frame ;
- un orchestrateur principal par scène ;
- une situation signature majeure simultanée ;
- deux boucles secondaires fortes maximum ;
- un message dominant maximum ;
- mémoire bornée et réinitialisable.

## Tiers

| Tier | Population | FX | Reflets | Mémoire |
|---|---:|---:|---:|---:|
| High | complète | complets | sélectifs | complète |
| Medium | réduite | simplifiés | limités | complète |
| Low | archétypes clés | essentiels | statiques | essentielle |
| Reduced motion | poses | transitions lentes | statiques | lisible |
| No WebGL | récit DOM | aucun temps réel | illustration | résumé |

---

# 10. Definition of Done mondiale

Le programme est terminé lorsque :

1. les 27 segments ont un contrat ;
2. les 26 tracks sont livrées et acceptées ;
3. les cinq transitions sont livrées ;
4. sept motifs ont un arc complet ;
5. les archétypes traversent au moins trois ères ;
6. chaque ère a trois profondeurs de vie ;
7. le monde conserve puis restitue des résidus ;
8. l'océan compose puis efface une mémoire ;
9. le retour montre un monde transformé ;
10. les fallbacks conservent le sens ;
11. le player global n'a pas régressé ;
12. le parcours complet passe budgets et acceptation.

---

# 11. Documents complémentaires

- `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`
- `DRIFT_3D_ERA_TRACK_IMPLEMENTATION_MATRIX_V2.md`
- `DRIFT_3D_INTEGRAL_BACKLOG.md`
- `DRIFT_3D_QA_ACCEPTANCE_PLAYBOOK.md`
- `DRIFT_3D_INTEGRAL_PACKAGE_ADOPTION.md`
