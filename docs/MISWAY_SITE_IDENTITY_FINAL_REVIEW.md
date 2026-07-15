# MISWAY — Revue finale de l’identité du site

**Lot :** `SITE-IDENTITY-08`  
**Branche :** `site-identity-08-final-review`  
**Date :** 2026-07-16  
**Statut :** `DONE_WITH_MANUAL_QA_REQUIRED`

---

## 1. Objet

Cette revue clôt le programme `SITE-IDENTITY-00` à `SITE-IDENTITY-08`.

Elle vérifie que le site public présente désormais MISWAY comme un espace personnel de création, de mémoire et de partage, sans posture de catalogue professionnel, de service, de licensing ou de synchronisation commerciale.

Elle distingue volontairement :

- les contrôles établis dans le code et l’historique Git ;
- les corrections minimales du dernier lot ;
- les validations qui nécessitent encore un checkout local et un navigateur.

Aucun résultat manuel ou automatisé n’est déclaré réussi sans preuve disponible.

---

## 2. Résultat synthétique

| Domaine | Statut | Conclusion |
|---|---|---|
| Positionnement éditorial | `PASS` | espace personnel, sensible, ouvert et non commercial |
| Accueil | `PASS_CODE` | entrée vers Tracks, About et Drift, sans CTA commercial |
| About | `PASS_WITH_FIXES` | parcours, pratique amateure, lambda, vision du monde, contact et SoundCloud réunis |
| Tracks | `PASS_CODE` | parcours chronologique sans classement ou logique de lancement |
| Fiches morceaux | `PASS_WITH_FIXES` | textes contextualisés et marqueurs internes retirés |
| Vérité des textes | `PASS` | incertitudes assumées et audit dédié conservé |
| Navigation | `PASS_CODE` | Home / Tracks / Drift / About |
| Lecteurs | `PASS_CODE` | logique existante conservée |
| SEO et données structurées | `PASS_CODE` | `Person`, `CollectionPage`, `ItemList`, `MusicRecording` |
| Sitemap | `PASS_CODE` | 4 routes principales et 26 morceaux, sans `/artist/` |
| Route `/artist/` | `PASS_CODE` | page de continuité, canonical About, `noindex, follow` |
| Ancienne page Artist | `REMOVED` | `src/app/artist/page-old.tsx` supprimé du code applicatif |
| Export statique | `PASS_CONFIG` | `output: "export"`, `trailingSlash`, `basePath` |
| Non-régression Drift | `PASS_HISTORY` | aucun fichier Drift modifié par le programme d’identité |
| Lint et build finaux | `MANUAL_REQUIRED` | aucun CI disponible dans l’environnement de revue |
| QA visuelle, audio et formulaire | `MANUAL_REQUIRED` | contrôle navigateur obligatoire avant fusion |

---

## 3. Corrections du lot final

### 3.1 About — retrait du cadre commercial résiduel

Les formulations suivantes ont été retirées :

- `without asking them to become customers` ;
- `not a professional selection`.

Elles sont remplacées par des formulations positives : les morceaux peuvent rencontrer des personnes, entrer dans leur journée et servir de portes d’entrée dans le parcours.

### 3.2 About — ajout du lambda et de la vision du monde

Une section `THE LAMBDA` est ajoutée après `A NAME FOR THE DETOURS`.

Elle présente le lambda comme un signe volontairement ouvert :

- chemin qui se divise ;
- montagne ;
- porte ;
- vague ;
- corps cherchant à rester debout ;
- variable représentant quelque chose de présent mais encore inconnu.

Le texte exprime une vision du monde non linéaire : dense, contradictoire, parfois violent, souvent absurde et parfois beau pour des raisons difficiles à expliquer.

Le symbole ne prétend pas indiquer la bonne route. Il marque le moment où une autre route devient possible et rappelle la possibilité de rester en mouvement malgré l’incertitude.

La section utilise un grand `Λ` typographique et les styles existants de la page About. Aucun nouvel asset, composant ou effet n’est introduit.

### 3.3 PERDUE — retrait de marqueurs internes

La fiche exposait encore :

- `to-confirm` ;
- `archival node`.

Ils sont remplacés par :

- `transition`, `fading`, `relationship` ;
- `A shared world slowly leaving the frame.`

Le titre, l’ID, le slug, SoundCloud, l’embed, l’année, l’ère, la durée, l’image et l’audio restent inchangés.

### 3.4 Ancienne page Artist — suppression

`src/app/artist/page-old.tsx` conservait l’ancienne posture commerciale :

- sync et licensing ;
- collaborations film, télévision et publicité ;
- offres commerciales ;
- conditions de licence ;
- faux positionnement de groupe ou d’artiste disponible pour des projets.

Ce fichier n’était plus la route active, mais il restait sous `src/app` et polluait les recherches de conformité. Il est supprimé.

La route active `src/app/artist/page.tsx` reste en place pour assurer la continuité des anciens liens vers `/about/`.

---

## 4. Contrôle éditorial

### Accueil

L’accueil conserve :

- une entrée courte et personnelle ;
- `ENTER` vers Tracks ;
- `ABOUT` vers About ;
- `DRIFT` vers Drift.

Aucune offre, licence, prestation ou promesse de carrière n’y apparaît.

### About

La page réunit désormais :

- piano, guitare, saxophone, groupes, Reason et Ableton ;
- les périodes de silence et de retour ;
- la pratique amateure au sens littéral ;
- trip-hop, acid jazz, ambient, électronique et mélodies de chanson française ;
- MISWAY comme nom des détours ;
- le lambda comme signe ouvert ;
- une vision du monde personnelle, contradictoire et non linéaire ;
- quelques portes d’entrée musicales ;
- SoundCloud et le formulaire de contact.

Le contact reste ouvert aux émotions, souvenirs, références, associations étranges, idées et problèmes techniques.

### Tracks et fiches

La page Tracks :

- conserve l’ordre des 26 morceaux ;
- suit le chemin plutôt qu’une stratégie de sortie ;
- ne classe pas les morceaux ;
- conserve cartes, images, tags, lecteurs et liens.

Les fiches :

- conservent le lecteur local et SoundCloud lorsqu’il existe ;
- ne contiennent aucun bloc Collaboration & Sync ;
- proposent simplement de poursuivre l’écoute ;
- présentent texte long, résumé, note d’image et période.

`MISWAY_TRACK_COPY_TRUTH_AUDIT.md` reste la référence pour les niveaux de confiance et les questions encore ouvertes.

---

## 5. Recherche des anciennes promesses commerciales

La recherche finale doit viser notamment :

- `licens` ;
- `commercial partnership` ;
- `serious offer` ;
- `premium content` ;
- `film and TV` ;
- `ad campaign` ;
- `press inquiry` ;
- `artist inquiry` ;
- `professional artist` ;
- `to-confirm` ;
- `archival node` ;
- `customers`.

Commande :

```bash
git grep -n -Ei "licens|commercial partnership|serious offer|premium content|film and TV|ad campaign|press inquiry|artist inquiry|professional artist|to-confirm|archival node|customers" -- src
```

Résultat attendu après suppression de `page-old.tsx` : **aucune occurrence**.

Le mot `sync` doit être interprété :

- `syncSource` dans le lecteur audio est technique et invisible ;
- les fonctions de synchronisation de préférences de mouvement dans Drift sont techniques ;
- aucune occurrence commerciale ne doit rester dans les contenus publics ou les sources obsolètes sous `src`.

---

## 6. Navigation, routes et SEO

Le dock utilise :

- Home ;
- Tracks ;
- Drift ;
- About.

Il reste absent de l’accueil et des routes Drift.

`/artist/` reste une page de continuité :

- canonical `/about/` ;
- `robots.index = false` ;
- `robots.follow = true` ;
- liens vers About et Tracks ;
- absence du sitemap.

Le graphe global contient `WebSite` et `Person`. Tracks utilise `CollectionPage` et `ItemList`. Chaque fiche utilise `MusicRecording` et référence la même personne.

Le sitemap attendu contient :

- `/` ;
- `/about/` ;
- `/tracks/` ;
- `/drift/` ;
- 26 routes de morceaux.

Total attendu : **30 URLs**.

---

## 7. Lecteurs, médias et formulaire

Le fournisseur audio conserve :

- l’ambiance d’entrée ;
- les sources locales avec `basePath` ;
- lecture, pause, suivant, précédent, boucle et seek ;
- l’ordre de `tracks` ;
- la protection des routes Drift ;
- l’état persistant hors Drift.

Les deux fichiers audio à nom dérogatoire restent :

- `panthere.mp3` ;
- `eux-gainent.mp3`.

Les autres suivent `/audio/<slug>.mp3`.

Le formulaire About conserve :

- Formspree `https://formspree.io/f/xqeywvda` ;
- méthode `POST` ;
- `name` ;
- `email` requis ;
- `subject` ;
- `message` requis ;
- `_gotcha`.

L’écoute réelle, les erreurs 404, l’autoplay, les liens externes et l’envoi Formspree restent à vérifier dans un navigateur.

---

## 8. Non-régression Drift

La comparaison entre la baseline `5aaabcd5739bc02fc8f67d5b50e8a223ef8b4321` et `main` après le lot 07 ne contient aucun fichier Drift, shader, matériau, contrôle, ambiance ou changement de topologie.

Le lot final modifie seulement :

- `src/app/about/page.tsx` ;
- `src/lib/tracks.ts` ;
- `src/app/artist/page-old.tsx` en suppression ;
- le présent rapport.

Cette preuve historique garantit l’absence de modification directe de Drift. Elle ne remplace pas une inspection visuelle et audio du build final.

---

## 9. Validation manuelle obligatoire avant fusion

Depuis `site-identity-08-final-review` :

```bash
npm run lint
npm run build
```

Contrôler ensuite :

### Export

- `out/index.html` ;
- `out/about/index.html` ;
- `out/artist/index.html` ;
- `out/tracks/index.html` ;
- les 26 dossiers de morceaux ;
- `out/drift/index.html` ;
- `out/sitemap.xml` avec 30 URLs.

### About

- ordre des sections ;
- lisibilité du grand lambda sur desktop et mobile ;
- absence de débordement horizontal ;
- contraste et rythme des six paragraphes ;
- portrait, SoundCloud, morceaux proposés et formulaire.

### Audio

- ambiance d’entrée ;
- lecture depuis Tracks et une fiche ;
- pause, seek, précédent, suivant et boucle ;
- persistance entre pages ;
- `panthere.mp3` ;
- `eux-gainent.mp3` ;
- une piste standard ;
- coexistence avec Drift.

### Routes et liens

- `/artist/` et son lien vers About ;
- liens SoundCloud ;
- navigation desktop et mobile ;
- soumission Formspree réelle.

### Drift

- chargement ;
- déplacement et contrôles ;
- carte ;
- sons ;
- absence du dock et du lecteur global ;
- absence de régression visuelle.

---

## 10. Critère de clôture

Le programme peut être déclaré `DONE` lorsque :

1. lint réussit ;
2. build statique réussit ;
3. la recherche des anciennes promesses commerciales est vide dans `src` ;
4. les 30 URLs attendues existent ;
5. About et la section Lambda sont validées sur desktop et mobile ;
6. les lecteurs et trois sources audio représentatives fonctionnent ;
7. Formspree reçoit un message de test ;
8. Drift est validé visuellement et fonctionnellement.
