# MISWAY — Audit de vérité des textes de morceaux

**Lot :** `SITE-IDENTITY-05`  
**Statut :** `AUDITED_FOR_PUBLIC_COPY`  
**Périmètre :** `shortText` et `longText` de `src/lib/tracks.ts`  
**Date :** 2026-07-16

---

## 1. Objet

Cet audit distingue les souvenirs confirmés, les lectures actuelles et les informations qui restent à préciser. Son objectif n’est pas de figer une légende définitive, mais d’empêcher le site de présenter une supposition comme un fait historique.

Le texte public suit désormais trois règles :

1. un souvenir confirmé peut être raconté directement ;
2. une interprétation actuelle doit être explicitement formulée comme telle ;
3. une origine inconnue ne doit jamais être reconstruite à partir du titre, de la date ou d’un ancien snippet.

Les identifiants, slugs, titres, périodes, médias, liens, durées, tags, visuels, ordre et statuts `featured` ne font pas partie de cet audit et doivent rester inchangés.

---

## 2. Niveaux de confiance

- **`CONFIRMED`** — origine, image ou intention explicitement confirmée par le créateur.
- **`CURRENT_READING`** — lecture actuelle sincère, présentée comme telle, sans prétendre restituer l’impulsion d’origine.
- **`PARTIAL_MEMORY`** — lien historique confirmé, mais détails ou genèse encore incomplets.
- **`UNKNOWN`** — aucune base suffisante pour publier une origine ou une intention.
- **`NEEDS_OWNER_INPUT`** — question documentaire utile pour une future version, sans bloquer le texte public actuel.

---

## 3. Résultat global

| Niveau | Nombre | Traitement public |
|---|---:|---|
| `CONFIRMED` | 17 | récit direct, court et factuel |
| `CURRENT_READING` | 7 | formulation explicite au présent : « Today I hear… » |
| `PARTIAL_MEMORY` | 2 | lien connu conservé, détails non inventés |
| `UNKNOWN` | 0 | aucune origine inconnue n’est présentée comme un fait |
| `NEEDS_OWNER_INPUT` | 11 questions | documentées ci-dessous, non bloquantes |

---

## 4. Classification par morceau

| ID | Morceau | Niveau | Base retenue |
|---|---|---|---|
| B02 | A WALK IN ZEELAND | `CONFIRMED` | marche solitaire en Zélande, canaux, coucher de soleil, égarement et méandres |
| B03 | FOOLFOULE | `CONFIRMED` | foule urbaine aux heures de pointe, tours et mouvements robotisés |
| B04 | JAZZYPLING | `CONFIRMED` | ruelles nocturnes, jazz en sous-sol et coins douteux |
| B05 | PLAY IT | `CONFIRMED` | travail, règles, costume et boucle métro-boulot-dodo |
| 01 | RISE | `CONFIRMED` | réussite figurée par l’ascension et la vue depuis le sommet |
| 02 | BLOSSOMING | `CONFIRMED` | confiance maximale, sports extrêmes et adrénaline |
| 03 | ETHNIC STICK | `CONFIRMED` | appel de l’Afrique, racines, valeurs, sens de la vie et proximité ethnic/ethical |
| 04 | MINUIT MOINS CINQ | `CONFIRMED` | choix entre routine familière et prise de risque |
| 05 | PERDUE | `CONFIRMED` | relation, monde commun et personne qui commencent à s’effacer |
| 06 | MORNE, ET ? | `CONFIRMED` | retour du nihilisme sous une apparence de bonheur confortable |
| 07 | DAYMASON | `CONFIRMED` | non-dit et distance entre perception privée et compréhension commune |
| 08 | CHAILK | `CONFIRMED` | reprise à zéro, vide, plat et possibilité de reconstruire |
| 09 | TIME | `CONFIRMED` | monde qui s’effondre, manque de temps et nécessité d’en prendre |
| 10 | TANTITOM | `CONFIRMED` | retour de la couleur, de l’émotion et de la légèreté |
| 11 | NEEKTAREUM | `CONFIRMED` | responsabilité et capacité de mouvement depuis une position blessée |
| 12 | ASITIS | `CURRENT_READING` | lecture actuelle autour de l’acceptation, sans genèse définitive affirmée |
| 13 | RELATIVE | `CURRENT_READING` | lecture actuelle autour du changement de perspective et du rebond |
| 14 | OVERTHINK | `CURRENT_READING` | lecture actuelle de l’accumulation mentale et de la surcharge |
| 15 | HOLD THE LIGHT | `CURRENT_READING` | lecture actuelle d’une lumière fragile maintenue dans l’obscurité |
| 16 | MIDNIGHT WORK | `CURRENT_READING` | lecture actuelle du travail nocturne comme concentration, pression et vision |
| 17 | TELATELABA | `CURRENT_READING` | lecture actuelle de l’entre-deux et du passage entre ici et là-bas |
| 18 | LE MONDE S’ENDORT | `CURRENT_READING` | lecture actuelle d’un monde extérieur qui s’éteint tandis que l’intérieur reste éveillé |
| 19 | RENEE | `PARTIAL_MEMORY` | reprise de PERDUE confirmée ; origine exacte du nom et détail de la transformation à préciser |
| 20 | PANTHERE | `PARTIAL_MEMORY` | reprise de A WALK IN ZEELAND confirmée ; intensification, polissage et regard vers l’avenir confirmés |
| 21 | ÉTÉÉAOOÉTÉ | `CONFIRMED` | rituel du lambda à l’aube sur une plage océanique, matériaux naturels et vagues immenses |
| 22 | EUX GAINENT | `CONFIRMED` | sportifs derrière les vitres d’une salle, répétition robotique, lumière froide et aliénation urbaine |

---

## 5. Suppositions supprimées

Les formulations suivantes ont été retirées des textes publics lorsqu’elles tentaient de déduire une histoire non confirmée :

- `likely` ;
- `probably` ;
- `feels like` utilisé comme pseudo-preuve historique ;
- `looks like` ;
- références à des « indexed snippets » ;
- affirmations fondées uniquement sur une date d’upload ;
- importance supposée d’un morceau à partir de sa visibilité ou de sa popularité ;
- vocabulaire de « node », « catalogue wave » ou « public snapshot » utilisé à la place d’un contenu réel.

Une sensation d’écoute reste autorisée lorsqu’elle est clairement présentée comme une lecture actuelle et non comme l’intention originelle.

---

## 6. Questions `NEEDS_OWNER_INPUT`

Ces questions permettront d’enrichir une future version, mais ne bloquent ni le lot ni la publication actuelle :

1. Les `yearLabel` correspondent-ils systématiquement à l’année de composition, à l’année de publication ou à un mélange des deux ?
2. Pourquoi PERDUE utilise-t-il encore le slug SoundCloud `misway-2021-moins-cinq` ?
3. Quelle situation ou phrase a précisément donné naissance à ASITIS ?
4. Quel événement ou changement de regard se trouve à l’origine de RELATIVE ?
5. Quel était le déclencheur concret de OVERTHINK ?
6. Que représente exactement la lumière de HOLD THE LIGHT : une personne, une idée, une part de soi ou autre chose ?
7. Dans quel contexte MIDNIGHT WORK a-t-il été composé, et que signifie ici « work » ?
8. Quelle est l’origine exacte du nom TELATELABA ?
9. Quelle expérience personnelle se trouve derrière LE MONDE S’ENDORT ?
10. Pourquoi le nom RENEE, et quelles transformations précises relient ce morceau à PERDUE ?
11. Quelles étapes musicales et émotionnelles relient exactement A WALK IN ZEELAND à PANTHERE ?

---

## 7. Critères de clôture du lot

- les 26 morceaux disposent d’un `shortText` et d’un `longText` publiables ;
- aucune origine incertaine n’est formulée comme un fait ;
- les lectures actuelles sont signalées explicitement ;
- aucun identifiant, média, lien, ordre, période ou statut `featured` n’est modifié ;
- aucun fichier Drift n’est modifié ;
- les questions restantes sont conservées ici plutôt que maquillées dans les pages publiques.
