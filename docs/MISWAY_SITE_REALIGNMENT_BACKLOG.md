# MISWAY — Backlog de réalignement du site hors Drift

**Statut :** `READY_FOR_EXECUTION`  
**Programme :** `SITE-IDENTITY`  
**Doctrine de référence :** `docs/MISWAY_SITE_IDENTITY_DOCTRINE.md`  
**Date :** 2026-07-15

---

## 1. Objectif du programme

Réaligner l’ensemble du site MISWAY hors Drift avec la réalité du projet et de la personne qui le porte : une pratique musicale amateure, ancienne, sincère, libre et exigeante, partagée sans objectif commercial.

Le programme doit :

- retirer la posture professionnelle et commerciale artificielle ;
- fusionner les pages Artist et About ;
- simplifier l’accueil ;
- humaniser les pages Tracks et les fiches des morceaux ;
- corriger les métadonnées, données structurées et routes ;
- préserver intégralement Drift, le lecteur audio, les fichiers audio et les visuels.

---

## 2. Règles d’exécution

### 2.1 Un seul lot actif

Un seul lot d’implémentation peut être `ACTIVE` à la fois.

Le lot suivant ne commence qu’après :

- validations techniques réussies ;
- diff relu ;
- absence de modification Drift ;
- commit propre ;
- décision explicite de poursuite.

### 2.2 Patch minimal

Chaque lot doit modifier uniquement les fichiers nécessaires à son objectif.

Interdits :

- refonte opportuniste ;
- nettoyage général non demandé ;
- renommage massif ;
- nouvelle dépendance ;
- changement d’architecture non requis ;
- modification de composants Drift ;
- modification des données audio ou des images.

### 2.3 Source de vérité

Ordre de priorité :

1. `MISWAY_SITE_IDENTITY_DOCTRINE.md` ;
2. données et souvenirs explicitement confirmés par le créateur ;
3. contenu actuel techniquement nécessaire ;
4. suppositions historiques existantes.

Les suppositions non confirmées doivent être supprimées ou reformulées comme incertaines.

### 2.4 Validation obligatoire de périmètre

À la fin de chaque lot :

```bash
git diff --name-only <base>...HEAD
```

Le résultat ne doit contenir aucun fichier Drift hors exception explicitement documentée.

Recherches de garde-fou recommandées :

```bash
git diff --name-only <base>...HEAD | grep -Ei 'drift|landmark|topology|three|shader'
```

Sous PowerShell :

```powershell
git diff --name-only <base>...HEAD | Select-String -Pattern 'drift|landmark|topology|three|shader'
```

Tout résultat doit être expliqué. Par défaut, il bloque le lot.

---

## 3. Vue d’ensemble

| Ordre | Lot | Objet | Dépendance | Statut |
|---:|---|---|---|---|
| 0 | `SITE-IDENTITY-00` | Doctrine et backlog | aucune | `DONE` |
| 1 | `SITE-IDENTITY-01` | Accueil : simplification et nouvelle posture | 00 | `NEXT` |
| 2 | `SITE-IDENTITY-02` | Fusion Artist/About et contact humain | 01 | `PLANNED` |
| 3 | `SITE-IDENTITY-03` | Décommercialisation des fiches morceaux | 02 | `PLANNED` |
| 4 | `SITE-IDENTITY-04` | Réécriture de la page Tracks | 03 | `PLANNED` |
| 5 | `SITE-IDENTITY-05` | Audit de vérité des contenus de morceaux | 04 | `PLANNED` |
| 6 | `SITE-IDENTITY-06` | SEO, schémas, sitemap et route Artist | 05 | `PLANNED` |
| 7 | `SITE-IDENTITY-07` | Harmonisation navigation et microcopies | 06 | `PLANNED` |
| 8 | `SITE-IDENTITY-08` | Revue finale, QA et non-régression Drift | 07 | `PLANNED` |

---

# LOT 0 — Doctrine et backlog

## `SITE-IDENTITY-00 — Adopt site identity doctrine and bounded backlog`

### Statut

`DONE`

### Objectif

Créer les documents de référence avant toute modification de production.

### Livrables

- `docs/MISWAY_SITE_IDENTITY_DOCTRINE.md`
- `docs/MISWAY_SITE_REALIGNMENT_BACKLOG.md`

### Critères d’acceptation

- doctrine explicite ;
- périmètre hors Drift explicite ;
- backlog séquencé ;
- interdits définis ;
- premier lot désigné `NEXT` ;
- aucun fichier de production modifié.

---

# LOT 1 — Accueil

## `SITE-IDENTITY-01 — Simplify home entry and remove promotional posture`

### Statut

`NEXT`

### Branche recommandée

`site-identity-01-home`

### Objectif précis

Simplifier la page d’accueil et remplacer sa définition générique de projet musical par une entrée plus humaine, sans toucher à son identité visuelle ni au bouton Drift.

### Fichier principal attendu

- `src/app/page.tsx`

### Fichiers additionnels autorisés

Aucun par défaut.

Un fichier de test ou de snapshot peut être modifié uniquement s’il existe déjà et si la modification est strictement nécessaire.

### Travaux

1. Supprimer le bouton `LISTEN`.
2. Conserver un seul accès principal vers `/tracks`.
3. Remplacer le bouton `ARTIST` par un libellé humain pointant vers `/about`.
4. Conserver le bouton `DRIFT` sans changer :
   - son lien ;
   - sa palette ;
   - ses effets ;
   - sa hiérarchie visuelle.
5. Réécrire les deux lignes de présentation sous le titre pour :
   - retirer `electronic music project` comme définition institutionnelle ;
   - exprimer une pratique personnelle faite au fil du temps ;
   - rester courte ;
   - éviter toute mention de profession, catalogue, licence ou collaboration.
6. Réévaluer les microcopies de pied `ENTRY NODE / V1` et `ARCHIVE SIGNAL` :
   - les conserver si elles servent l’univers ;
   - les simplifier si elles renforcent excessivement le jargon conceptuel ;
   - ne pas ajouter de nouveau bloc.

### Proposition d’intention de copie

Le texte exact peut être affiné, mais doit suivre cette direction :

- ligne principale : musique, images et choses fabriquées au fil du temps ;
- ligne secondaire : un espace personnel, sans promesse de carrière ni explication excessive.

Exemples de travail non contractuels :

- `Music, images and things made along the way.`
- `Some old, some new, some still slightly lost.`

### Interdits

- modification de `/drift` ;
- modification du composant de navigation globale ;
- ajout de CTA SoundCloud ;
- ajout de réseau social ;
- ajout d’animation ;
- changement du hero visuel ;
- changement de typographie ;
- nouvelle dépendance ;
- changement du lecteur audio global.

### Validations

```bash
npm run lint
npm run build
```

Contrôle manuel :

- mobile ;
- desktop ;
- trois boutons maximum sur l’accueil ;
- bouton Drift strictement inchangé ;
- aucun lien vers `/artist` ;
- aucun débordement de texte.

### Sortie attendue

- résumé compact ;
- fichiers modifiés ;
- validations ;
- résultat de la recherche Drift dans le diff ;
- commit SHA ;
- aucun travail du lot 2 anticipé.

---

# LOT 2 — Fusion About / Artist

## `SITE-IDENTITY-02 — Merge Artist into one human About page`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-02-about-merge`

### Objectif précis

Créer une seule page personnelle fidèle, supprimer le doublon commercial Artist et humaniser le contact.

### Fichiers principaux attendus

- `src/app/about/page.tsx`
- `src/app/artist/page.tsx`

### Fichiers additionnels autorisés

- composants exclusivement créés pour About, seulement si la page devient réellement illisible sans extraction ;
- aucun composant générique ne doit être refondu dans ce lot.

### Travaux sur About

1. Remplacer la biographie promotionnelle par une présentation personnelle.
2. Structurer la page autour de cinq mouvements :
   - derrière MISWAY ;
   - pourquoi MISWAY ;
   - ce que l’on trouve ici ;
   - intention de partage ;
   - contact.
3. Conserver le portrait existant.
4. Conserver SoundCloud comme lien d’écoute externe simple.
5. Supprimer :
   - `AVAILABLE FOR` ;
   - `COMMERCIAL PROFILE` ;
   - sync ;
   - licensing ;
   - press ;
   - serious offers ;
   - prestations ;
   - renvoi vers Artist.
6. Conserver les morceaux d’entrée si cela reste utile, sans les présenter comme démonstration professionnelle.
7. Réécrire la section contact pour accueillir :
   - retour sur un morceau ;
   - émotion ;
   - référence ;
   - idée ;
   - problème technique ;
   - proposition humaine libre.
8. Conserver l’action Formspree et les noms de champs nécessaires.

### Travaux sur Artist

Le traitement final de route est reporté au lot SEO 06.

Dans ce lot :

- supprimer tout contenu commercial ;
- rendre la page minimale ;
- pointer clairement vers `/about` ;
- ne pas tenter une stratégie complexe de redirection avant validation de compatibilité avec l’export statique.

### Contenu à confirmer avant rédaction définitive

Le texte peut s’appuyer sur les faits déjà établis :

- pratique musicale depuis les années 2000 ;
- piano, guitare, saxophone, groupes et MAO ;
- Reason puis Ableton ;
- périodes d’arrêt et de reprise ;
- influences électro, trip-hop, acid jazz et chanson française ;
- absence d’objectif professionnel ;
- volonté de partager et de conserver une trace.

Aucune biographie personnelle sensible non nécessaire ne doit être publiée.

### Interdits

- transformer About en autobiographie longue ;
- détailler le burn-out, la santé ou la vie familiale sans demande explicite ;
- prétendre connaître la signification définitive de MISWAY si elle n’est pas confirmée ;
- supprimer le formulaire ;
- changer Formspree ;
- modifier les visuels ;
- modifier Drift.

### Validations

- `npm run lint`
- `npm run build`
- test de soumission visuelle du formulaire sans envoi réel obligatoire ;
- liens `/about`, `/tracks`, SoundCloud ;
- absence de doublon éditorial ;
- recherche globale des termes commerciaux.

### Recherche obligatoire

```bash
git grep -n -Ei "sync|licens|commercial partnership|serious offer|premium content|film|TV|press inquiry|artist inquiry" -- src/app/about src/app/artist
```

Le résultat doit être vide ou justifié par un commentaire historique non rendu.

---

# LOT 3 — Fiches de morceaux

## `SITE-IDENTITY-03 — Remove commercial CTAs from track detail pages`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-03-track-details`

### Objectif précis

Retirer la couche commerciale et les phrases génériques répétées des fiches de morceaux sans modifier les données musicales ni le lecteur.

### Fichier principal attendu

- `src/app/tracks/[slug]/page.tsx`

### Travaux

1. Supprimer le bloc `COLLABORATION & SYNC`.
2. Supprimer le CTA `START A CONVERSATION` lié à une utilisation commerciale.
3. Conserver éventuellement un lien discret vers About ou Contact uniquement s’il s’intègre naturellement dans la fin de page et ne ressemble pas à une conversion.
4. Réécrire ou supprimer la phrase générique :
   - `is part of the MISWΛY catalogue...`
5. Renommer les libellés trop techniques ou institutionnels si nécessaire :
   - `TRACK NODE` ;
   - `TRACK SUMMARY` ;
   - `OFFICIAL` ;
   - `LISTEN EXTERNALLY` ;
   - `LOCAL ARCHIVE NOTE`.
6. Conserver :
   - lecteur inline ;
   - visuel ;
   - durée ;
   - période ;
   - tags ;
   - SoundCloud ;
   - morceaux associés.
7. Ne pas introduire les blocs `ORIGIN / NOW / SIDE NOTE` avant que les données réelles soient disponibles dans le modèle.

### Interdits

- modification de `src/lib/tracks.ts` ;
- modification du composant audio ;
- modification des URLs SoundCloud ;
- modification des images ;
- modification de la logique de recommandation ;
- modification Drift.

### Validations

- build statique de toutes les routes de morceaux ;
- lecture d’au moins un morceau local ;
- contrôle d’un morceau avec SoundCloud ;
- contrôle d’un morceau sans SoundCloud ;
- contrôle mobile et desktop ;
- aucune route cassée.

---

# LOT 4 — Page Tracks

## `SITE-IDENTITY-04 — Turn catalogue page into a human creative timeline`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-04-tracks-timeline`

### Objectif précis

Faire de la page Tracks un parcours humain dans le temps plutôt qu’une présentation de catalogue.

### Fichier principal attendu

- `src/app/tracks/page.tsx`

### Travaux

1. Réécrire l’introduction.
2. Remplacer ou supprimer :
   - `FULL TIMELINE` ;
   - `CATALOGUE SIZE` ;
   - `Local tracks currently available` ;
   - `current releases` ;
   - toute notion de performance de catalogue.
3. Conserver les compteurs uniquement s’ils racontent les périodes avec simplicité.
4. Évaluer la pertinence de trois blocs de statistiques :
   - conserver si narratifs ;
   - réduire à deux ou supprimer si artificiels.
5. Conserver la liste, les visuels, le lecteur et les liens.
6. Remplacer `OPEN` par une microcopie plus naturelle si nécessaire.
7. Ne pas modifier l’ordre des morceaux dans ce lot.
8. Ne pas modifier le système d’ères dans ce lot.

### Interdits

- refonte de carte ;
- nouvelle pagination ;
- filtres ;
- moteur de recherche ;
- tri interactif ;
- changement du modèle de données ;
- modification Drift.

### Validations

- liste complète présente ;
- chaque lien fonctionne ;
- chaque bouton de lecture reste accessible ;
- mobile sans chevauchement ;
- aucune régression du lecteur global.

---

# LOT 5 — Vérité des contenus de morceaux

## `SITE-IDENTITY-05 — Audit track copy for truth, uncertainty and personal voice`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-05-track-copy-truth`

### Objectif précis

Nettoyer les descriptions qui spéculent, généralisent ou utilisent une voix extérieure impersonnelle.

### Fichier principal attendu

- `src/lib/tracks.ts`

### Principe de traitement

Ce lot est éditorialement sensible. Il ne doit pas inventer les histoires manquantes.

Chaque morceau doit être classé :

- `CONFIRMED` — histoire ou intention connue ;
- `CURRENT_READING` — ressenti actuel du créateur ;
- `PARTIAL_MEMORY` — souvenir incomplet assumé ;
- `UNKNOWN` — texte minimal sans fiction ;
- `NEEDS_OWNER_INPUT` — question à arbitrer ultérieurement.

### Travaux

1. Auditer tous les `shortText`.
2. Auditer tous les `longText`.
3. Supprimer les formulations telles que :
   - `likely tied to` ;
   - `probably` ;
   - `looks like` ;
   - `feels like` lorsqu’elles simulent un savoir ;
   - `uploaded the same day` si cela n’apporte rien ;
   - `public snapshot` ;
   - `visible node`.
4. Corriger les incohérences factuelles évidentes.
5. Conserver les titres, slugs, IDs, chemins audio, URLs, images, durées et ordres.
6. Ne pas modifier les affectations Drift ou les ères sans lot dédié distinct.
7. Produire à la fin une liste des morceaux nécessitant encore une parole personnelle du créateur.

### Interdits

- inventer une origine ;
- modifier un slug ;
- déplacer un morceau d’ère ;
- renommer un fichier ;
- remplacer une image ;
- changer `featured` ;
- modifier audio ;
- modifier Drift.

### Validation éditoriale

Pour chaque texte :

- vrai ;
- clair ;
- non générique ;
- non commercial ;
- non surinterprété.

### Validation technique

- `npm run lint`
- `npm run build`
- vérification de toutes les routes statiques ;
- diff limité au contenu textuel attendu.

---

# LOT 6 — SEO, schémas, sitemap et route Artist

## `SITE-IDENTITY-06 — Align metadata and static routes with the real project`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-06-seo-routes`

### Objectif précis

Mettre le référencement et les données structurées en conformité avec la nouvelle identité, sans perdre l’indexabilité des morceaux.

### Fichiers attendus

- `src/app/layout.tsx`
- `src/app/about/page.tsx`
- `src/app/artist/page.tsx`
- `src/app/tracks/page.tsx`
- `src/app/tracks/[slug]/page.tsx`
- `src/app/sitemap.ts`

### Travaux

1. Réécrire le `siteDescription` global.
2. Retirer :
   - `professional` ;
   - `available for` ;
   - sync ;
   - licensing ;
   - commercial collaboration ;
   - mots-clés industriels.
3. Évaluer le schéma global :
   - `Person` pour la personne ;
   - identité MISWAY associée ;
   - conserver `MusicRecording` par piste.
4. Mettre à jour les métadonnées About.
5. Retirer Artist comme canonical autonome.
6. Choisir une stratégie compatible export statique pour `/artist` :
   - redirection statique testée ; ou
   - page de continuité minimaliste avec canonical `/about/` et `noindex` si nécessaire.
7. Retirer `/artist/` du sitemap comme page de contenu.
8. Mettre à jour `lastModified` avec une date cohérente.
9. Vérifier le `lang` HTML contre la langue dominante réelle.
10. Conserver les métadonnées de chaque piste et leurs images.

### Interdits

- suppression des pages de piste du sitemap ;
- changement de domaine ;
- changement de stratégie de déploiement ;
- dépendance SEO ;
- modification Drift.

### Validations

- `npm run lint`
- `npm run build`
- inspection du dossier exporté ;
- présence de `/about/index.html` ;
- comportement de `/artist/` vérifié dans l’export ;
- sitemap inspecté ;
- absence de canonical concurrent ;
- JSON-LD valide syntaxiquement ;
- aucune promesse commerciale restante.

---

# LOT 7 — Navigation et microcopies transverses

## `SITE-IDENTITY-07 — Harmonize navigation and site-wide microcopy`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-07-navigation-copy`

### Objectif précis

Finaliser la cohérence des libellés visibles hors Drift après les refontes de contenu.

### Fichiers possibles

- `src/components/ui/Navigation.tsx`
- composants de lecteur contenant une microcopie réellement concernée ;
- pages hors Drift uniquement.

### Travaux

1. Remplacer `Info` par `About` si validé visuellement.
2. Rechercher tous les liens `/artist` restants.
3. Rechercher les libellés commerciaux restants.
4. Harmoniser :
   - Home ;
   - Tracks ;
   - About ;
   - Drift ;
   - Back ;
   - Open ;
   - Listen.
5. Préserver la concision de la navigation mobile.
6. Ne pas modifier le comportement de masquage de navigation sur Drift.

### Interdits

- nouvelle navigation ;
- changement d’icônes sans nécessité ;
- refonte du dock ;
- changement d’animation ;
- modification de la détection de route Drift ;
- modification Drift.

### Validations

- navigation mobile ;
- navigation desktop ;
- état actif ;
- sous-routes Tracks ;
- About ;
- Home ;
- absence de navigation sur Drift inchangée.

---

# LOT 8 — Revue finale

## `SITE-IDENTITY-08 — Final truth, UX and Drift non-regression review`

### Statut

`PLANNED`

### Branche recommandée

`site-identity-08-final-review`

### Objectif précis

Contrôler le programme complet sans introduire de nouvelle orientation.

### Nature du lot

Audit et corrections minimales uniquement.

### Contrôles éditoriaux

1. Rechercher globalement :

```bash
git grep -n -Ei "sync|licens|commercial partnership|serious offer|premium content|film and TV|ad campaign|press inquiry|artist inquiry|professional artist"
```

2. Relire :
   - accueil ;
   - About ;
   - Tracks ;
   - au moins six fiches couvrant toutes les périodes.
3. Vérifier que :
   - la posture n’est pas commerciale ;
   - la posture n’est pas auto-dévalorisante ;
   - la voix reste humaine ;
   - le jargon abstrait n’a pas simplement remplacé le marketing ;
   - les textes incertains l’assument.

### Contrôles fonctionnels

- build statique ;
- navigation ;
- lecteur global ;
- lecteur inline ;
- morceaux locaux ;
- liens SoundCloud ;
- formulaire ;
- images ;
- sitemap ;
- métadonnées ;
- responsive mobile et desktop.

### Contrôle Drift obligatoire

Comparer le programme avec sa base initiale :

```bash
git diff --stat <programme-base>...HEAD -- src/app/drift src/components src/lib
```

Puis vérifier qu’aucun fichier Drift n’a été modifié par les lots.

Effectuer une QA de fumée de `/drift` :

- chargement ;
- rendu ;
- contrôles ;
- audio ;
- navigation masquée comme avant.

Aucune correction artistique Drift n’est admise dans ce lot. Une régression Drift doit être réparée uniquement si elle est causée par le programme.

### Critères de sortie

- lint réussi ;
- build réussi ;
- routes exportées ;
- zéro lien interne cassé ;
- zéro contenu commercial résiduel non justifié ;
- zéro modification Drift non autorisée ;
- diff final documenté ;
- programme prêt à merger.

---

## 4. Hors backlog

Les sujets suivants sont explicitement exclus et devront faire l’objet de décisions séparées :

- refonte graphique complète du site ;
- nouvelle identité visuelle ;
- traduction intégrale français/anglais ;
- ajout d’un CMS ;
- blog ou journal ;
- espace commentaires ;
- newsletter ;
- stratégie réseaux sociaux ;
- monétisation ;
- distribution musicale ;
- analytics avancées ;
- modification des ères ;
- réorganisation dramaturgique du catalogue ;
- nouvelles pochettes ;
- remastering audio ;
- tout développement ou ajustement de Drift.

---

## 5. Definition of Done du programme

Le programme `SITE-IDENTITY` est terminé lorsque :

1. l’accueil ne comporte plus `LISTEN` ;
2. Artist et About ne sont plus deux pages concurrentes ;
3. About présente une personne et une démarche, pas une offre ;
4. le formulaire est humain et non commercial ;
5. les fiches de morceaux ne sollicitent plus sync/licensing ;
6. la page Tracks raconte un chemin plutôt qu’un inventaire marketing ;
7. les descriptions spéculatives sont retirées ou assumées ;
8. les métadonnées reflètent le projet réel ;
9. `/artist` n’est plus une page canonique indépendante ;
10. aucun fichier Drift, audio ou image n’a été modifié ;
11. lint et build passent ;
12. le site donne l’impression juste : profond, tendre, loufoque, drôle, mystérieux et libre, sans posture fabriquée.

---

## 6. Prochain lot autorisé

`SITE-IDENTITY-01 — Simplify home entry and remove promotional posture`

Aucun autre lot ne doit être lancé avant validation et merge du lot documentaire ou adoption explicite de ces documents comme base de travail.
