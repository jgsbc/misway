# MISWAY — Revue finale de l’identité du site

**Lot :** `SITE-IDENTITY-08`  
**Branche :** `site-identity-08-final-review`  
**Date :** 2026-07-16  
**Statut :** `DONE_WITH_MANUAL_QA_REQUIRED`

---

## 1. Objet

Cette revue clôt le programme `SITE-IDENTITY-00` à `SITE-IDENTITY-08`.

Elle vérifie que le site public présente désormais MISWAY comme un espace personnel de création et de partage, sans posture de catalogue professionnel, de service, de licensing ou de synchronisation commerciale, tout en préservant les morceaux, leurs lecteurs et le monde Drift.

La revue distingue volontairement :

- les contrôles établis directement dans le code et l’historique Git ;
- les corrections minimales appliquées dans ce dernier lot ;
- les contrôles qui nécessitent encore un navigateur et un checkout local complet.

Aucun résultat manuel ou automatisé n’est déclaré réussi sans preuve disponible.

---

## 2. Résultat synthétique

| Domaine | Statut | Conclusion |
|---|---|---|
| Positionnement éditorial | `PASS` | MISWAY est présenté comme une pratique personnelle, sensible et non commerciale |
| Accueil | `PASS_CODE` | entrée simple vers Tracks, About et Drift ; aucun CTA commercial |
| About et contact | `PASS_WITH_FIXES` | deux formulations défensives retirées ; portrait, SoundCloud et Formspree conservés |
| Tracks | `PASS_CODE` | parcours chronologique sans classement, score ou logique de lancement |
| Fiches morceaux | `PASS_WITH_FIXES` | textes contextualisés ; aucun bloc sync/licensing ; marqueurs internes de PERDUE retirés |
| Vérité des textes | `PASS` | incertitudes assumées ; audit dédié conservé |
| Navigation | `PASS_CODE` | Home / Tracks / Drift / About ; logique active et masquage Drift préservés |
| Lecteurs | `PASS_CODE` | lecteur global et lecteur de fiche inchangés fonctionnellement pendant le programme d’identité |
| SEO et données structurées | `PASS_CODE` | `Person`, `CollectionPage`, `ItemList` et `MusicRecording` cohérents |
| Sitemap | `PASS_CODE` | 4 routes principales et 26 pages de morceaux ; `/artist/` exclu |
| Route `/artist/` | `PASS_CODE` | page de continuité, canonical `/about/`, `noindex, follow` |
| Export statique | `PASS_CONFIG` | `output: "export"`, `trailingSlash`, `basePath` et images non optimisées configurés |
| Non-régression Drift | `PASS_HISTORY` | aucun fichier Drift modifié depuis la baseline du programme |
| Lint et build du lot final | `MANUAL_REQUIRED` | aucun CI disponible et clone réseau impossible dans l’environnement de revue |
| QA visuelle, audio et formulaire | `MANUAL_REQUIRED` | doit être exécutée dans le navigateur avant fusion finale |

---

## 3. Corrections appliquées dans le lot final

### 3.1 About — retrait du cadre commercial résiduel

Deux formulations visibles entretenaient encore inutilement un contraste avec un site professionnel :

- `without asking them to become customers` ;
- `not a professional selection`.

Elles sont remplacées par des formulations positives et autonomes :

- les morceaux peuvent rencontrer des personnes et entrer dans leur journée ;
- la sélection est décrite simplement comme quelques portes d’entrée, sans comparaison professionnelle.

Aucun changement n’est apporté au portrait, aux liens, aux morceaux proposés, au formulaire ou à sa destination Formspree.

### 3.2 PERDUE — retrait de marqueurs internes

La fiche publique exposait encore :

- le tag `to-confirm` ;
- la note d’image `archival node`.

Ces marqueurs de travail internes sont remplacés par :

- `transition`, `fading`, `relationship` ;
- `A shared world slowly leaving the frame.`

Le titre, l’ID, le slug, l’URL SoundCloud, l’embed, l’année, l’ère, la durée, l’image et l’audio restent inchangés.

---

## 4. Contrôle éditorial

### 4.1 Accueil

L’accueil contient désormais :

- une phrase courte sur la musique, les images et les choses faites en chemin ;
- une reconnaissance des périodes anciennes, nouvelles et encore indécises ;
- `ENTER` vers `/tracks` ;
- `ABOUT` vers `/about` ;
- `DRIFT` vers `/drift`.

Aucune offre, disponibilité, prestation, licence, argument de vente ou promesse de carrière n’y apparaît.

### 4.2 About

La page présente :

- piano, guitare, saxophone, groupes, Reason et Ableton ;
- les interruptions et retours ;
- une pratique amateure au sens littéral, sans dévalorisation de la musique ;
- trip-hop, acid jazz, ambient, électronique et mélodies issues de la chanson française ;
- MISWAY comme nom compatible avec les détours, sans invention d’une origine exacte ;
- le partage et la conservation d’une trace comme raisons principales du site.

Le contact reste ouvert aux émotions, souvenirs, références, idées, associations étranges et problèmes techniques.

### 4.3 Tracks et fiches

La page Tracks :

- conserve l’ordre des 26 morceaux ;
- explique que l’ordre suit le chemin plutôt qu’une stratégie de sortie ;
- ne classe pas les morceaux ;
- conserve les cartes, images, tags, lecteurs et liens.

Les fiches :

- conservent le lecteur local et les liens SoundCloud ;
- ne contiennent plus de bloc `Collaboration & Sync` ;
- proposent simplement de poursuivre l’écoute ;
- affichent un texte long, un résumé, une note d’image et les informations de période.

L’audit `MISWAY_TRACK_COPY_TRUTH_AUDIT.md` reste la référence pour les niveaux `CONFIRMED`, `CURRENT_READING`, `PARTIAL_MEMORY` et les questions nécessitant encore la mémoire du créateur.

---

## 5. Recherche des anciennes promesses commerciales

La revue vise les familles de termes suivantes dans les contenus publics :

- sync au sens commercial ;
- licensing ;
- commercial partnership ;
- serious offer ;
- premium content ;
- film and TV ;
- ad campaign ;
- press inquiry ;
- artist inquiry ;
- professional artist ;
- customer comme destination du visiteur ;
- marqueurs internes tels que `to-confirm`.

### Résultat

Aucune promesse commerciale active n’a été identifiée dans les pages publiques inspectées.

Le terme technique `syncSource` demeure dans `AudioPlayerProvider.tsx`. Il désigne uniquement la synchronisation de la source du lecteur HTML Audio et n’est ni visible par le visiteur ni lié à la synchronisation musicale commerciale.

Les documents historiques de doctrine et de backlog peuvent naturellement contenir les mots interdits puisqu’ils décrivent précisément ce qui devait être retiré. Ils ne constituent pas du contenu public du site.

---

## 6. Navigation et routes

### Navigation visible

Le dock utilise :

- Home ;
- Tracks ;
- Drift ;
- About.

L’état actif couvre les sous-routes `/tracks/*`. Le dock reste absent de la page d’accueil et des routes Drift.

### Route Artist

`/artist/` reste une page de continuité compatible avec l’export statique :

- canonical vers `/about/` ;
- `robots.index = false` ;
- `robots.follow = true` ;
- liens vers About et Tracks ;
- aucune entrée dans le sitemap.

Aucun lien principal du site ne renvoie encore vers `/artist/` dans les fichiers de navigation et de pages inspectés.

---

## 7. SEO et données structurées

Le graphe global contient :

- `WebSite` ;
- `Person` pour la personne derrière MISWAY ;
- la relation `creator` ;
- le portrait ;
- SoundCloud ;
- les instruments et champs musicaux réellement décrits.

La page Tracks est une `CollectionPage` dont l’entité principale est un `ItemList` de 26 `MusicRecording`.

Chaque fiche de morceau :

- possède un canonical propre ;
- conserve son image et son audio ;
- conserve son lien SoundCloud lorsqu’il existe ;
- référence la même personne via `#person` ;
- appartient sémantiquement à la collection Tracks, et non à un album fictif.

Le sitemap est produit statiquement et contient :

- `/` ;
- `/about/` ;
- `/tracks/` ;
- `/drift/` ;
- les 26 routes `/tracks/<slug>/`.

Total attendu : **30 URLs**.

---

## 8. Lecteurs et médias

### Contrôles établis dans le code

Le fournisseur audio :

- conserve une ambiance d’entrée ;
- construit les sources locales avec le `basePath` ;
- gère lecture, pause, piste suivante, piste précédente, boucle et seek ;
- utilise l’ordre de `tracks` ;
- arrête la reprise automatique de l’ambiance sur les routes Drift ;
- conserve l’état du lecteur au niveau du layout pendant la navigation hors Drift.

Les 26 morceaux restent construits à partir du même tableau. Les deux noms de fichiers explicitement dérogatoires restent :

- `panthere.mp3` ;
- `eux-gainent.mp3`.

Les autres sources suivent `/audio/<slug>.mp3`.

### Limite

Le contrôle du code ne remplace pas :

- l’écoute de chaque fichier ;
- le contrôle des erreurs 404 audio ;
- le comportement réel d’autoplay selon le navigateur ;
- la coexistence sonore avec Drift ;
- le contrôle des liens SoundCloud dans un navigateur.

---

## 9. Formulaire

Le formulaire About conserve :

- l’action Formspree `https://formspree.io/f/xqeywvda` ;
- la méthode `POST` ;
- `name` ;
- `email` requis ;
- `subject` ;
- `message` requis ;
- le honeypot `_gotcha`.

Aucune promesse de réponse commerciale ou catégorie de demande professionnelle n’est affichée.

Un envoi réel doit encore être testé manuellement afin de confirmer la réception, le comportement Formspree et l’expérience après soumission.

---

## 10. Non-régression Drift

La comparaison entre la baseline `5aaabcd5739bc02fc8f67d5b50e8a223ef8b4321` et `main` après fusion du lot 07 ne contient aucun fichier :

- `src/app/drift/**` ;
- composant de monde Drift ;
- matériau ;
- shader ;
- contrôle ;
- ambiance propre à Drift ;
- topologie de carte.

Les seuls fichiers modifiés par le programme d’identité avant ce lot sont les pages éditoriales, les métadonnées, le sitemap, les textes de morceaux, la navigation générale et les lecteurs généraux.

Le lot final ne modifie lui-même que :

- `src/app/about/page.tsx` ;
- `src/lib/tracks.ts` ;
- le présent rapport.

Cette preuve historique garantit l’absence de modification directe de Drift. Elle ne remplace pas une inspection visuelle et audio de `/drift/` dans le build final.

---

## 11. Validation manuelle obligatoire avant fusion

Exécuter depuis la branche `site-identity-08-final-review` :

```bash
npm run lint
npm run build
```

Puis contrôler :

### Export

- présence de `out/index.html` ;
- présence de `out/about/index.html` ;
- présence de `out/artist/index.html` ;
- présence de `out/tracks/index.html` ;
- présence des 26 dossiers de morceaux ;
- présence de `out/drift/index.html` ;
- présence et contenu de `out/sitemap.xml`.

### Pages

- accueil desktop et mobile ;
- About desktop et mobile ;
- Tracks desktop et mobile ;
- au moins une fiche Birth era ;
- au moins une fiche Older era ;
- au moins une fiche Vegetative era ;
- au moins trois fiches New era, dont une locale et une SoundCloud ;
- `/artist/` et son lien vers About.

### Audio

- ambiance d’entrée ;
- lecture depuis une carte Tracks ;
- lecture depuis une fiche ;
- pause ;
- seek ;
- précédent / suivant ;
- boucle ;
- persistance pendant la navigation ;
- `panthere.mp3` ;
- `eux-gainent.mp3` ;
- une piste standard `/audio/<slug>.mp3` ;
- absence de lecteur global visible dans Drift.

### Drift

- chargement du monde ;
- déplacement ;
- contrôles ;
- carte et nœuds ;
- ambiances ;
- entrée et sortie ;
- absence de chevauchement du dock général ;
- absence de régression visuelle évidente.

### Contact et liens

- soumission Formspree réelle ;
- lien SoundCloud général ;
- au moins trois liens SoundCloud de morceaux ;
- liens Home / Tracks / Drift / About ;
- liens de retour et CTA internes.

---

## 12. Critères de clôture

Le programme pourra être déclaré `DONE` lorsque :

1. `npm run lint` passe ;
2. `npm run build` passe ;
3. les routes statiques attendues sont présentes ;
4. le sitemap contient les 30 URLs attendues et pas `/artist/` ;
5. les lecteurs local et persistant fonctionnent ;
6. le formulaire est testé ;
7. la navigation mobile et desktop est lisible ;
8. Drift est inspecté sans régression ;
9. aucun autre changement n’est introduit dans la PR finale.

Avant ces contrôles, le statut honnête reste :

`DONE_WITH_MANUAL_QA_REQUIRED`
