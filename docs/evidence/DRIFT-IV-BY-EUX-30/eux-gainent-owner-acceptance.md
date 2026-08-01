# DRIFT-IV-BY-EUX-30 — EUX GAINENT owner acceptance — Evidence package

- **Lot :** `DRIFT-IV-BY-EUX-30`
- **Baseline :** `main@d2a1c15f0d22205f3cc117cdeaed35fa61ab680d` (contient `DRIFT-IV-BY-EUX-20`, PR #31, mergé)
- **Owner review date :** 2026-07-27
- **Méthode :** le propriétaire a ouvert `/drift` dans son propre navigateur réel local, lancé explicitement la track EUX GAINENT depuis le player, observé un passage complet sans ouvrir les probes dev, puis donné sa lecture spontanée en ses propres mots.

## 1. First-pass spontaneous reading (owner review #1)

Citation exacte du propriétaire, non reformulée, non interprétée :

> **Première impression :**
> « ce n'est pas assez actif, ca ne bouge pas assez, c'est mou. hormis les textes sur l'écran qui sont une bonne idée mais pas assez travaillée. j'ai l'impression qu'on est loin de la loufoquerie et du réalisme graphique et design souhaité. »
>
> **Ce qui paraît vraiment MISWAY :**
> « l'intention mais on est loin de l'attendu »

Aucun autre champ du protocole de première passe (moment le plus fort/le plus faible, ce qui n'est pas compris, ce qui paraît trop explicite/trop discret) n'a été rempli par le propriétaire à ce stade — non inventé ici.

## 2. Observations enregistrées (dérivées directement de la citation, non des scores 0-4 inventés)

| Axe observé | Constat propriétaire |
|---|---|
| Activity/motion | Insufficient — « ça ne bouge pas assez, c'est mou » |
| Graphic realism | Insufficient — « on est loin du réalisme graphique... souhaité » |
| Design finish | Insufficient — « design souhaité » non atteint |
| Loufoquerie | Insufficient — « on est loin de la loufoquerie... souhaitée » |
| Text/display concept (glass vocabulary) | Promising but under-designed — « une bonne idée mais pas assez travaillée » |
| MISWAY identity | Intention perceived, execution insufficient — « l'intention mais on est loin de l'attendu » |

Aucun score artistique 0–4 (Lisibilité/Singularité/Intelligence/Vie/Retenue/Émotion/Continuité/Loufoquerie) n'a été demandé ni donné à ce stade — la première passe s'est arrêtée avant la grille de notation formelle, le niveau visuel/moteur ayant été jugé insuffisant pour poursuivre le protocole standard. Le North Star test, l'écoute cue-by-cue, la QA mobile/reduced-motion/no-WebGL/performance n'ont pas encore eu lieu — ils suivent la Realism Pass, per §26 du lot.

## 3. Owner decision

```
Track: EUX GAINENT
Lot: DRIFT-IV-BY-EUX-30

Technical foundation: ACCEPTED
Artistic: REWORK_REQUIRED
```

Le mécanisme dramaturgique livré par `DRIFT-IV-BY-EUX-20` (services partagés, résolution de phase/cue, arbitrage de signature, pause/seek/loop déterministes) reste une base technique valide et n'est pas remis en cause. Le rejet porte exclusivement sur le niveau actuel de motion, réalisme visuel, design graphique, densité et loufoquerie.

`DRIFT-IV-BY-EUX-30 = REWORK_REQUIRED`.
`EUX GAINENT = NOT ACCEPTED`.
`PROOF SLICE 1 = NOT YET ACCEPTED`.

## 4. Required follow-up

Rework demandé dans le même lot (`DRIFT-IV-BY-EUX-30`), sans ouvrir de nouvelle track ni commencer l'industrialisation :

- Realism pass (athlètes, machines, matériaux, vitrine).
- Rework du langage graphique de la vitre (vocabulaire conservé, matérialisation reconçue).
- Motion pass (vie idle, trois couches de vie, physicalité de CADENCE/ÉCART/CORRECTION).
- Amplification perceptive de la signature et du déplacement de référence intérieure.
- Aftermath/résidu plus vivants.
- Aucun timestamp de cue modifié à ce stade.

Voir le journal de décisions (`docs/DECISIONS_LOG.md`) pour l'entrée append-only correspondante et `docs/ACTIVE_LOT.md` pour le détail complet du rework demandé.

## 5. Known limitations (owner review #1)

Cette première passe n'a couvert que la lecture spontanée. Les items suivants du protocole d'acceptation (scores artistiques, North Star test, écoute cue-by-cue, QA fonctionnelle/mobile/reduced-motion/no-WebGL/performance) restent `NOT YET PERFORMED` et seront repris seulement après une candidate V2 jugée positivement par le propriétaire sur les questions du §26.

## 6. Rework candidate V2 — implémentation

Rework exécuté dans le même lot (`DRIFT-IV-BY-EUX-30`), même branche, aucun nouveau commit distinct (amend prévu), aucun cue/timestamp modifié.

### 6.1 Fichiers modifiés/créés

- `src/components/drift-3d/EuxGainentLivingScene.tsx` (modifié) — orchestration : refs de joints/pièces mobiles, vie secondaire (ventilateurs/convoyeur/compteur), overlay de salissure de vitre, texture d'affichage reconçue, amplitude de déplacement intérieur augmentée, intensités de la strip/marqueur de correction renforcées.
- `src/components/drift-3d/EuxGainentAthlete.tsx` (nouveau) — silhouette humaine authored (bassin/torse/tête/2 bras/2 jambes), pose de repos par archétype (`treadmill`/`bike`/`rower`), articulations exposées via callbacks de ref (jamais de mutation d'une prop partagée — conforme à la règle d'immutabilité du compilateur React).
- `src/components/drift-3d/EuxGainentStation.tsx` (nouveau) — trois archétypes de machine reconnaissables (tapis de course, vélo/elliptique, rameur) avec socle, mât, console et une pièce mobile par archétype, palette commune (métal brossé, plastique noir, sol caoutchouc).
- `src/lib/drift3dEuxGainentMaterials.ts` (nouveau) — usine de textures procédurales strictement locale à cette track (sol caoutchouc, métal brossé, plastique noir, salissure de vitre, affichage « commercial » à tracking/glow/bezel, mini-écran console) — aucun fichier binaire, aucune dépendance réseau, donc aucune question de provenance/licence.
- `src/lib/drift3dEuxGainent.ts` — **non modifié** (aucune ligne changée) : toute la richesse visuelle est dérivée dans la couche de rendu à partir des sorties pures déjà existantes (`cycleValue`/`amplitude`/`frozen`/`absoluteTimeSeconds`), jamais d'un second moteur de dramaturgie.

### 6.2 Realism pass

- **Athlètes** : remplacement du cylindre+sphère par une silhouette humaine à bas nombre de polygones (bassin/torse/tête/bras/jambes), posée pour l'un des trois archétypes de machine. A/B/C restent identifiables uniquement par posture/timing (aucun label, aucune couleur distinctive, aucun visage) — conforme à l'Identity Contract §10.
- **Machines** : trois archétypes distincts et reconnaissables (tapis de course, vélo/elliptique, rameur) partageant une palette commune (métal brossé, plastique noir) pour garder la comparaison A/B/C lisible, chacun avec un socle, un mât de console et une pièce mobile.
- **Matériaux** : remplacement des couleurs unies par des textures procédurales (sol caoutchouc grainé, métal brossé directionnel, plastique noir légèrement bruité) sur toutes les pièces dynamiques ; la coque statique (façade/strip/sol) utilisait déjà des matériaux texturés du système partagé (`windowsDay`/`concrete`) et reste inchangée.
- **Vitrine** : overlay de salissure/micro-rayures ajouté devant la façade existante (jamais remplacée), en plus du texte dominant.

### 6.3 Rework du langage graphique de la vitre

Vocabulaire conservé exactement (`CADENCE`/`ÉCART`/`CONFORMITÉ`/`RENDEMENT`/`OBJECTIF DÉPLACÉ`). Remplacement du monospace blanc simple par un panneau d'affichage sombre avec bezel, fond en trame de points bas-contraste, lettres tracées avec halo de glow puis passe nette — plus proche d'un afficheur commercial intégré que d'un texte de debug. Chaque station reçoit en complément un petit écran console (métré/distance/allure ordinaires, dérivés déterministement de `absoluteTimeSeconds`) illustrant le principe « données sportives normales » du §10, distinct et plus petit que le mot dominant de la vitrine (règle « un message dominant maximum » respectée).

### 6.4 Motion pass

- Bras/jambes/torse animés à partir de `cycleValue × amplitude` déjà exposés par le modèle pur (aucune nouvelle horloge) — geste de course/pédalage/rame nettement plus riche qu'un simple tangage vertical.
- Les machines (pièce mobile par station) tournent/oscillent en continu, modulées par `amplitude` (jamais totalement arrêtées), ce qui rend visible et physique l'arrêt-recentrage-reprise de B pendant `CUE_EUX_04_CORRECTION` sans dupliquer sa logique de fenêtre — la même valeur d'amplitude déjà calculée par le modèle pur pilote directement la vitesse de la machine.
- **Trois couches de vie** : (1) athlètes+machines+consoles+strip ; (2) deux ventilateurs (l'un se synchronise progressivement avec la cadence de `cadence-lock` à `reference-inversion`, puis dérive légèrement pendant `aftermath-return`/`residue`), un petit convoyeur de serviettes (translation continue, jamais un gag), un compteur/distributeur qui continue de compter une valeur dont le sens reste flou et se fige exactement pendant `aftermath-return`/`residue` (l'élément « en retard » demandé) ; (3) intégration d'environnement limitée à l'existant (voir §6.6, limitation assumée).

### 6.5 Signature et déplacement de référence intérieure

- Amplitude du déplacement de référence intérieure augmentée (`INTERIOR_SHIFT_MAX_POSITION` 0.055→0.22, `INTERIOR_SHIFT_MAX_ROTATION` 0.012→0.045) — la coque du bâtiment (`staticGymLandmark`), le collider, le node et l'empreinte au sol restent strictement immobiles (aucun changement de leur rendu ni de la topologie).
- Intensité émissive de la strip de recalibration renforcée au pic de signature (0.85→1.05) pour un contraste plus fort.
- Pendant la signature, les athlètes gèlent (logique pure inchangée) tandis que les machines, ventilateurs, convoyeur et compteur continuent visiblement — contraste humains-figés/machines-vivantes conforme à l'Identity Contract.

### 6.6 Limitations assumées dans cette passe

- **Intégration d'environnement** : aucun nouvel élément de ville/circulation ajouté autour du gymnase — cela nécessiterait de toucher `drift3dLandmarks.ts`/`drift3dTopology.ts`, explicitement interdits dans ce lot. L'intégration s'appuie sur le tissu urbain Birth Yard déjà existant autour du node, inchangé.
- **Rotation des pièces mécaniques** : utilise l'accumulation par `delta` (comme le fondu d'occlusion déjà présent dans `Drift3DLandmark.tsx`) plutôt qu'une fonction pure du temps absolu — un choix assumé pour un détail mécanique secondaire/décoratif ; toute la dramaturgie (phase, texte dominant, signature, gel) reste strictement `f(absoluteTimeSeconds)`, inchangée.

### 6.7 Validation technique

`npx tsc --noEmit`, `npm run lint`, `npm run build` (38/38 pages statiques) tous `PASS` après chaque étape du rework, y compris après la correction d'une erreur de compilateur React (mutation d'une prop de ref partagée refusée — corrigée en passant des callbacks de ref possédés par le parent plutôt que l'objet-bucket lui-même).

### 6.8 Performance (`MEASURED` partiel + `KNOWN_ENVIRONMENT_LIMITATION` pour la re-mesure post-simplification)

Mesure réelle obtenue en session Chrome locale, à la position de zone EUX (`x:-62, z:42`), **avant** la dernière simplification des ventilateurs (hub+3 pales → un seul disque par ventilateur, -6 draw calls) :

```json
{ "canvasPresent": true, "drawCalls": 292, "triangles": 202210, "viewport": { "width": 1278, "height": 854, "dpr": 1 }, "visibility": "hidden" }
```

`292 draw calls` respecte le budget Realism Bible (`≤ 300`) avec une marge réelle mais étroite (8 draw calls) ; `202 210 triangles` est très en dessous du budget (`≤ 1 500 000`). Après la simplification des ventilateurs (2 ventilateurs × (4→1) mesh = -6 draw calls), le total **calculé** (non re-mesuré en direct) est d'environ **286 draw calls** — présenté explicitement comme une estimation calculée à partir d'une mesure réelle et d'un delta de code vérifiable, jamais comme une nouvelle mesure `MEASURED`.

Une nouvelle mesure live après cette simplification n'a pas pu être obtenue : la fenêtre Chrome réelle (`claude-in-chrome`) est restée bloquée en `document.visibilityState: "hidden"` (parfois `"visible"` après override manuel de test, sans que cela ne débloque la vraie boucle de rendu R3F sous-jacente, confirmée par un canvas mounted mais `cumulativeFrameCount` et `drawCalls` restant à `0`, et une capture d'écran montrant un canvas noir) malgré de très nombreuses tentatives d'interaction réelle réparties sur plusieurs minutes (clics, touches, glisser-déposer, nouvel onglet). `KNOWN_ENVIRONMENT_LIMITATION`, cohérente avec la limitation déjà documentée dans `SYS-70`/`BY-EUX-20` — pas un défaut du rework. Un échantillon FPS réel pendant `reference-inversion` n'a donc pas non plus pu être obtenu cette session.

### 6.9 Ce qui reste `NOT YET PERFORMED`

Conformément au §26 du lot, cette passe s'arrête à la vérification technique et à la préparation de la candidate V2. Les scores artistiques, le North Star test, l'écoute cue-by-cue, la QA mobile/reduced-motion et un échantillon FPS frais restent `NOT YET PERFORMED` — ils ne reprennent qu'après un retour positif du propriétaire sur les cinq questions du §26.

## 7. Owner review #2 — candidate V2

Citation exacte du propriétaire, non reformulée :

> « C'est encore un peu mou. on distingue un peu mieux la salle de sport mais ce n'est pas encore assez vivant. la loufoquerie est quasi invisible. il manque du fond (texte profond à l'écran pour que cela ressemble à MISWAY) »

### 7.1 Interprétation factuelle (autorisée, aucun score inventé)

| Axe observé | Constat propriétaire |
|---|---|
| Motion | Still insufficient — « encore un peu mou » |
| Gym readability | Improved but insufficient — « on distingue un peu mieux la salle de sport » |
| Living density | Insufficient — « pas encore assez vivant » |
| Loufoquerie | Almost absent — « quasi invisible » |
| Screen concept | Still promising — implicite (le propriétaire ne rejette pas l'idée, il demande plus de fond) |
| Screen semantic depth | Insufficient — « il manque du fond (texte profond...) » |
| MISWAY personality | Insufficient — « pour que cela ressemble à MISWAY » (sous-entend que ce n'est pas encore le cas) |

### 7.2 V2 strengths (identifiées séparément des échecs, pour ne pas perdre ce qui a fonctionné)

- La salle de sport est un peu mieux reconnaissable qu'en V1 (le passage cylindre+sphère → silhouette humaine + machines archétypées a eu un effet positif partiel, même s'il reste insuffisant).
- Le concept d'écran (mot dominant sur la vitre) reste jugé prometteur — ce n'est pas rejeté, seulement jugé insuffisamment approfondi.

### 7.3 V2 failures

- Motion toujours trop faible — le geste corporel et l'activité mécanique restent trop discrets pour lire l'effort physique depuis la route.
- Densité de vie insuffisante — les éléments de vie secondaire (ventilateurs, convoyeur, compteur) existent dans le code mais ne sont pas assez perceptibles.
- Loufoquerie quasi invisible — aucun signal suffisamment deadpan/étrange n'a été remarqué.
- Profondeur sémantique de l'écran insuffisante — un seul mot dominant ne suffit pas ; il manque une couche secondaire de données qui dérive progressivement du sport vers autre chose.

### 7.4 Statut (inchangé)

```
Technical foundation: ACCEPTED
Artistic: REWORK_REQUIRED

EUX GAINENT = NOT ACCEPTED
PROOF SLICE 1 = NOT YET ACCEPTED
```

Rework V3 engagé dans le même lot, même branche — voir §8 pour l'implémentation.

## 8. Rework candidate V3 — implémentation

Objectif explicite (formulé par le propriétaire) : passer de « trois personnes font du sport dans une installation conceptuelle » à « une vraie salle de sport tourne à plein régime, puis son système de mesure commence discrètement à avoir des choses beaucoup plus étranges à dire sur les gens. » Le monde physique doit devenir vivant avant que le texte devienne intéressant.

### 8.1 Fichiers modifiés

- `src/lib/drift3dEuxGainent.ts` — **un seul ajout pur** : `resolveEuxGainentScreenState(absoluteTimeSeconds, phaseId)`, fonction pure retournant `{headline, secondaryLines}`, cohabitant avec `resolveEuxGainentDominantText` existante (jamais dupliquée), sans toucher `EUX_GAINENT_PHASES`/`EUX_GAINENT_CUES`. Aucun timestamp modifié.
- `src/components/drift-3d/EuxGainentAthlete.tsx` — ajout de `EUX_GAINENT_ARCHETYPE_MOTION`, table exportée de plages de mouvement par archétype (bras/jambes/torse/glissement de selle/levée de genou/rebond vertical), nettement plus amples et distinctes qu'en V2.
- `src/components/drift-3d/EuxGainentLivingScene.tsx` — orchestration V3 complète : mouvement par archétype amplifié, convergence explicite (`convergenceBlend`) pilotant ventilateurs/convoyeur/consoles, nouvelle grammaire d'écran (texture combinée mot dominant + fragments secondaires + salissure, une seule texture par état), consoles convergentes (`TEMPS`/`DIST`/`CAD`/`NIV`), correction de B renforcée, props de « fond » (mur, silhouette de rack, banc).
- `src/lib/drift3dEuxGainentMaterials.ts` — `getEuxGainentDisplayTexture` remplacé par `getEuxGainentScreenTexture(headline, secondaryLines)` (grille, marques d'alignement, artefacts de rafraîchissement, salissure désormais intégrée — plus de mesh séparé) ; `getEuxGainentConsoleReadoutTexture` étendu à un nombre variable de lignes (jusqu'à 4).
- `src/components/drift-3d/EuxGainentFallbackScene.tsx` — affiche désormais statiquement le mot dominant **et** les fragments secondaires (`resolveEuxGainentScreenState`), sans aucun mouvement continu ajouté — conforme à la règle « poses fixes, changements d'état discrets » du fallback reduced-motion.

### 8.2 Motion — trois exercices physiquement différents

Chaque archétype utilise désormais sa propre plage de mouvement (`EUX_GAINENT_ARCHETYPE_MOTION`), dérivée du même `cycleValue × amplitude` déjà exposé par le modèle pur (aucune nouvelle horloge) :

- **Treadmill (A)** : grande amplitude bras/jambes en alternance controlatérale, torsion épaules/bassin, rebond vertical franc.
- **Bike (B)** : amplitude de jambes la plus grande (pédalage), bras presque immobiles (poignées tenues), légère levée de genou verticale simulant la trajectoire circulaire de la pédale.
- **Rower (C)** : glissement avant-arrière du buste entier sur la « selle » (translation Z du groupe racine), grande amplitude de lean du torse, traction des bras, jambes en extension/repli.

Comme les trois archétypes partagent le même `cycleValue` sous-jacent (même fréquence, mêmes cibles de convergence pendant `cadence-lock`), leurs gestes très différents tombent déjà exactement sur le même battement dès que la cadence est verrouillée — exactement l'effet de loufoquerie « trois sports différents, un seul rythme » demandé, sans ajouter de second moteur.

### 8.3 Vie secondaire rendue perceptible

- **Ventilateurs** : agrandis et repositionnés ; vitesses différentes avant CADENCE, convergence explicite (`convergenceBlend`) pendant `cadence-lock`, synchronisés pendant toute la fenêtre de signature, léger désaccord recréé en aftermath/residue.
- **Convoyeur de serviettes** : piste et serviettes agrandies, vitesse elle aussi pilotée par `convergenceBlend` (plus lente/irrégulière avant cadence, régulière ensuite) — continue pendant la signature.
- **Compteur/distributeur** : agrandi, repositionné pour rester visible depuis la route ; se fige exactement au début de `aftermath-return` pendant `aftermath-return`/`residue`, pendant que ventilateurs et convoyeur continuent. **Bug trouvé et corrigé pendant l'écriture de ce lot, avant tout test navigateur** : la première version référençait `EUX_GAINENT_PHASES[5]` (index numérique brut), qui pointe en réalité vers `reference-inversion` (138.800s) et non `aftermath-return` (152.730s) — le distributeur se serait figé dès le début de la signature au lieu de son aftermath. Corrigé par une recherche par `id` (`EUX_GAINENT_PHASES.find(p => p.id === "aftermath-return")`) plutôt qu'un index numérique fragile ; `tsc`/`lint` rejoués et toujours `PASS` après correction.

### 8.4 Consoles machines convergentes

Chaque station affiche désormais `TEMPS`/`DIST`/`CAD`/`NIV`. Avant convergence (`convergenceBlend < 0.98`), chaque archétype a sa propre base (`CONSOLE_BASE_RATE`/`CONSOLE_BASE_LEVEL`, ex. tapis 74, vélo 86, rameur 23) et son propre décalage temporel. Une fois `convergenceBlend ≥ 0.98` (mesure/déviation/correction/signature), les trois consoles basculent sur `CONSOLE_SHARED_RATE`/`CONSOLE_SHARED_LEVEL` **et** le même `TEMPS`/`DIST` — trois exercices différents produisant soudainement la même sortie, sans jamais nommer B individuellement.

### 8.5 Grammaire d'écran à deux niveaux

`resolveEuxGainentScreenState` traduit chaque phase en `{headline, secondaryLines}` suivant exactement la progression demandée : données sportives crédibles et réellement variables avant `CADENCE` (`TEMPS`/`DIST.`/`CAD.`/`SÉRIE`/`GAIN`, actualisées ~1×/s) → fragments bureaucratiques presque plausibles pendant `CADENCE`/`MEASUREMENT` (`SÉRIE`, `TOLÉRANCE`, `RESTE`) → première anomalie sémantique explicite (`RESTE`, jamais expliqué) → `PERTE --`/`DESTINATION --` pendant `RENDEMENT`/le pic de signature, où les lignes secondaires s'effacent brièvement (fenêtre de ±0.6s autour du pic analytique) pour ne laisser que « OBJECTIF DÉPLACÉ » seule → retour hypocritement normal en aftermath avec une micro-anomalie résiduelle (`RESTE 01`) → `SÉRIE TERMINÉE` / `RESTE 01` en résidu. Le mot dominant reste inchangé et unique (règle « un message dominant maximum » toujours respectée) ; les fragments secondaires ne forment jamais une deuxième phrase-signature. Une seule texture combinée (mot dominant + grille + fragments + salissure + marques d'alignement + artefacts de rafraîchissement) par état distinct, construite une fois et mise en cache — jamais par ligne de texte, jamais par frame (règle de performance §23 du lot respectée).

### 8.6 Correction de B et contraste de signature

- Intensité du marqueur de correction désormais montante pendant `deviation` (0.35→0.9) puis redescendante pendant `correction-revelation` (1→0.15), rendant l'arc complet « la machine remarque, corrige, puis relâche » plus lisible qu'un simple seuil binaire en V2.
- Les amplitudes de mouvement bien plus grandes en V3 font que les poses gelées de signature (déjà pilotées par les valeurs de gel existantes du modèle pur, `FREEZE_CYCLE_VALUE`, inchangées) se traduisent désormais en postures d'effort nettement plus reconnaissables (ex. C à 0.42 se traduit maintenant par une flexion de rameur bien plus marquée qu'en V2), sans qu'aucune valeur du modèle pur n'ait changé.
- Les machines (partie mobile), ventilateurs, convoyeur et consoles continuent tous de façon bien visible pendant que les corps sont figés — le contraste humains-figés/machines-vivantes repose désormais sur des amplitudes bien plus grandes de part et d'autre.

### 8.7 « Fond » — profondeur visuelle

Trois éléments de grande masse ajoutés derrière/autour des machines (mur arrière, silhouette de rack de rangement, banc) plutôt qu'une accumulation de petits props, conformément à l'instruction de prioriser les silhouettes. Aucun ajout de géométrie de ville/circulation (nécessiterait de toucher `drift3dLandmarks.ts`/`drift3dTopology.ts`, interdits).

### 8.8 Validation technique

`npx tsc --noEmit`, `npm run lint`, `npm run build` (38/38 pages statiques) tous `PASS` après l'intégralité du rework V3.

### 8.9 QA navigateur réelle et performance — `KNOWN_ENVIRONMENT_LIMITATION`

Plusieurs tentatives réelles, réparties sur deux onglets distincts et plusieurs minutes cumulées d'interaction réelle (clics, double-clics, touches WASD répétées, attentes de 8 à 10 secondes à chaque étape) n'ont permis d'obtenir **aucune** mesure ou capture visuelle live cette session : `window.__drift3dEvidence.snapshot()` est resté à `canvasPresent: false` / `cumulativeFrameCount: 0`, `document.visibilityState` est resté bloqué à `"hidden"` malgré `document.hasFocus() === true`. Un test direct et définitif a été effectué pour distinguer un défaut du code d'un blocage d'environnement :

```js
let count = 0;
function tick() { count++; if (count < 5) requestAnimationFrame(tick); }
requestAnimationFrame(tick);
await new Promise(r => setTimeout(r, 2000));
// résultat réel : { rafCount: 0, visibility: "hidden" }
```

Zéro déclenchement de `requestAnimationFrame` en 2 secondes réelles — ceci confirme un blocage du compositeur du navigateur au niveau de la fenêtre réelle (perte de focus au premier plan du système d'exploitation), non spécifique à React Three Fiber ni à ce lot. Le serveur de développement lui-même a été vérifié sain (`curl` → `200` sur `/drift/`). Aucune capture d'écran, aucune mesure `drawCalls`/`triangles` fraîche, aucun échantillon FPS idle/signature n'a donc pu être obtenu pour la candidate V3 — `KNOWN_ENVIRONMENT_LIMITATION`, cohérente avec la même limitation déjà rencontrée et documentée lors de la candidate V2 (§6.8) et dans `SYS-70`/`BY-EUX-20`. Aucune mesure non obtenue n'est déclarée ici comme obtenue.

**Ce qui EST vérifié pour V3** : correction technique complète (`tsc`/`lint`/`build`), relecture manuelle de la logique (formules de convergence, bornes de fenêtre du pic de signature, gel du distributeur au bon index de phase), absence d'erreur console observée sur les deux onglets testés, présence confirmée de l'élément `<canvas>` dans le DOM (pas de crash de montage).

**Ce qui reste NON vérifié visuellement pour V3** : rendu réel des nouvelles amplitudes de mouvement, lisibilité réelle de la grammaire d'écran, mesure réelle des draw calls/triangles post-V3 (les props de fond ajoutent un delta calculable mais non re-mesuré — voir `docs/ACTIVE_LOT.md` pour l'estimation), échantillon FPS idle/signature.

### 8.10 Statut

```
Technical foundation: ACCEPTED
Artistic: REWORK_REQUIRED (en attente de la review #3)

EUX GAINENT = NOT ACCEPTED
PROOF SLICE 1 = NOT YET ACCEPTED
```
