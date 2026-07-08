# DRIFT 3D — Bible de réalisme (source de vérité artistique)

Adoptée le 2026-07-07 sur directive du propriétaire du projet.

## Règle de priorité

- Ce document est la **source de vérité artistique** de la map 3D.
- La documentation existante du repo reste valable pour l'architecture technique
  (stack, topologie, corridors, systèmes audio/HUD/physique), mais partout où elle
  pousse vers l'abstrait — formes géométriques nues, grilles, néons décoratifs,
  particules flottantes, low-poly « flat design » — elle est **caduque**.
- Docs remplacés pour la direction visuelle :
  `DRIFT_3D_ART_DIRECTION.md`, `DRIFT_3D_SET_DESIGN_BLUEPRINT.md`,
  `DRIFT_3D_TRACK_SCENE_MATRIX.md` (leurs règles de gameplay — corridors,
  protection des nœuds, audio explicite, quatrième mur caméra — restent valides).

## Interdits absolus au rendu final

- Cubes/sphères placeholder visibles.
- Wireframe décoratif.
- Esthétique Tron/synthwave.
- Dégradés arbitraires.
- Couleurs émissives sans source diégétique (une lumière vient toujours de
  quelque chose : lampadaire, fenêtre, feu, lune).

## Test permanent

Un inconnu qui voit un screenshot doit pouvoir dire ce que c'est en une phrase
(« une ruelle de jazz la nuit », « un col de montagne au crépuscule »).
Sinon, la scène n'est pas terminée.

## Principes de réalisme (non négociables)

1. **Lumière physiquement plausible.** Une seule source solaire/lunaire cohérente
   par segment + sources locales justifiées. Tonemapping ACES, exposition réglée
   par zone, ombres cohérentes avec l'heure scriptée.
2. **Matériaux PBR photo-sourcés** (Poly Haven ou équivalent) : albedo +
   roughness + normal, decals de salissure, flaques, usure, rouille.
   Jamais de couleur unie sans texture.
3. **Atmosphère.** Fog exponentiel teinté par zone, haze de distance,
   god rays uniquement justifiés (grotte, tempête, sous-bois).
4. **Échelle humaine.** Portes ~2,1 m, étages ~3 m, lampadaires ~4 m,
   voies ~3,5 m — proportionnés au véhicule et à la caméra.
5. **Color script.** Cycle jour/nuit scénarisé track par track
   (voir `DRIFT_3D_COLOR_SCRIPT.md`). La lumière et la couleur portent
   l'émotion avant le nombre d'assets.
6. **Post-processing sobre.** Bloom léger seuil haut, SSAO, vignette douce,
   grain fin, DOF contemplatif, une LUT par zone.
7. **Silhouette d'abord.** Chaque point d'intérêt identifiable à 200 m
   par sa seule silhouette.

## Motif récurrent : λ

λ = la porte, et « lambda » = le quelconque. Toujours **sculpté dans le décor**,
jamais flottant ni lumineux pour lui-même : bouche de la grotte d'entrée,
bifurcations en Y inversé (minuit moins cinq, neektareum), charpentes,
fissures, ombres portées.

## Les cinq mondes

### 0. Entrée — la grotte (entry-ambient)

Grotte quasi noire (90 % de l'image sous ~0,05 de luminance), roche basaltique
humide, gouttes, poussière visible seulement dans le rayon de lumière.
La sortie en **λ** est le seul élément lumineux : contre-jour froid d'aube,
god rays volumétriques. Au franchissement : eye adaptation 2–3 s qui « brûle »
l'image puis révèle Birth Yard. C'est la naissance.

### Zone 1 — BIRTH YARD (la ville : fourmillement, violence, saleté)

Naître dans le chaos urbain. Références : port nord-européen (Rotterdam, Anvers)
+ quartiers béton années 70. Palette : gris béton, brique brune, rouille,
sodium la nuit, ciel laiteux voilé le jour. Foule instanciée, trafic, vapeur,
linge aux fenêtres. Son : rumeur urbaine, klaxons, métro sous la route.

- **a walk in zeeland** — canaux hollandais au coucher du soleil (~5° au-dessus
  de l'horizon), maisons de brique, ponts levants, quais pavés, vélos ;
  solitude ; reflets planaires ; méandres vers des vitrines louches.
- **foolfoule** — 8 h 30, canyon de gratte-ciels verre/granit, soleil bas dur,
  foule compacte au pas mécanique, visages neutres : des robots.
- **jazzypling** — nuit, ruelles pavées mouillées, tungstène chaud des caves de
  jazz, silhouettes dans l'ombre, néon qui grésille, jazz filtré derrière les portes.
- **play-it** — petit matin bleu-gris, flux de costumes identiques, horloges,
  passages piétons : la ville devient grille et cadence.

Transition 1→2 : la route s'élève, béton → roche, fog gris sale → bleu limpide.

### Zone 2 — OLDER SHADOWS (le fun : voyage, Afrique, sports extrêmes, montagne)

Liberté, adrénaline, sens. Références : Alpes/Dolomites ; hauts plateaux et
sahel (Éthiopie, Mali). Palette : bleu glacier, blanc neige, granit, puis ocres,
terre battue, or de fin d'après-midi. Soleil franc, ombres nettes, heat haze
et poussière dorée côté Afrique.

- **rise** — lacets taillés dans la roche, refuge, cairns ; sommet-plateforme,
  chaînes en couches estompées par le haze ; lumière rasante triomphale.
- **blossoming** — versant d'adrénaline : wingsuits, kayak, via ferrata,
  pont de singe ; vitesse accrue, FOV élargi, équipements vifs sur roche neutre.
- **ethnic stick** — plateau ocre : village de terre et bois, tissus colorés,
  marché, baobabs, feu central, percussions ; la seule foule chaleureuse.
- **minuit moins cinq** — col au crépuscule : bifurcation en **λ** sous une
  horloge figée à 23 h 55 ; à gauche la plaine éclairée (confort), à droite
  la crête au vent (risque). La route descend vers la plaine — le choix pèse.

### Zone 3 — VEGETATIVE FIELD (le ronron : travail, quotidien, morne mais beau)

Confort anesthésiant : beau, propre, plat. Références : Beauce/Midwest,
lotissements identiques, zone commerciale. Palette : verts-jaunes désaturés,
beige, blanc cassé. **Clé de zone : ciel uniformément couvert, lumière plate
sans direction, aucune ombre marquée.** Blé qui ondule, pylônes à perte de vue,
arroseurs-métronomes, panneaux souriants.

- **perdue** — ferme aux volets qui se ferment, panneau « à vendre », banc vide,
  boîte aux lettres qui déborde ; désaturation locale progressive.
- **morne, et ?** — lotissement parfait : pelouses identiques, gonflables,
  écrans souriants, parkings à moitié vides ; jingle lointain, tondeuses.
- **daymason** — bâtisse de pierre sans fenêtres, brume basse permanente,
  symboles gravés à demi effacés, ombre légèrement décalée ; regards peints
  orientés vers la route. Anomalie sourde, pas de fantastique.
- **chailk** — carrière de craie, paysage blanc quasi vide, traits de craie au
  sol, brouillard blanc dense (~80 m), silence. Tout à recommencer de zéro.

### Zone 4 — NEW SIGNAL (la couleur : monde intérieur, ombre/lumière, or/argent)

Reconstruction intime. Alternance stricte de segments **« argent »** (froids,
nocturnes, lunaires) et **« or »** (chauds, retrouvés) jusqu'à l'aube finale.
Le ciel devient acteur : étoiles, lune, orage, aube. Nature + traces humaines
intimes. Et pourtant tout reste simple, quelconque — lambda.

- **time** — chaussée fissurée, pans qui basculent très lentement, horloges
  arrêtées plantées ; **vitesse ×0,4**, sons étouffés.
- **tantitom** — la couleur revient par touches : coquelicots rouges dans un
  champ gris, saturation qui remonte le long du spline (LUT animée),
  lanternes d'un village en fête au loin.
- **neektareum** — bifurcation en **λ** : panneau accusateur vs « avancer » ;
  la route s'enfonce dans une forêt sombre, troncs argentés, lune filtrée.
- **asitis** — gorge gelée : glace bleue-argent, stalactites, vent sifflant,
  craquements, lumière lunaire dure, buée. Acceptation.
- **relative** — le puits : dépression circulaire humide, source claire au fond,
  remontée en spirale, trouées de lumière croissantes ; « coup de pied » scripté.
- **overthink** — échangeurs inachevés empilés, panneaux contradictoires, grues
  figées ; la chaussée devient **impraticable** : détour par un chemin de terre.
- **hold the light** — lande sous tempête : pluie forte, rafales, éclairs ;
  au centre **une silhouette debout tenant une lanterne** ; son halo troue la
  pluie — seul moment chaud du segment.
- **midnight work** — colline calme après la tempête : maison isolée,
  **une seule fenêtre éclairée**, ciel étoilé dense, voie lactée, lucioles,
  chouette. Nuit noire réelle : la fenêtre porte à 300 m.
- **telatelaba** — labyrinthe de haies et de miroirs sur pied, reflet de la
  caméra, chemins qui se ressemblent, brume au sol ; vitesse ralentie.
- **le monde s'endort** — belvédère sur Birth Yard : fenêtres et enseignes
  s'éteignent par vagues, trafic qui se raréfie, rumeur qui descend au silence.
- **renee sens** — descente finale vers une plage à l'aube d'été : sable pâle,
  galets, bois flotté, ressac, brume marine ; **une pierre brute dont une seule
  face polie accroche le premier rayon d'or** ; caméra basse, vitesse ×0,6.
  La seule scène « parfaite » : simple, chaude, apaisée.

## Caméra & véhicule : l'émotion par le mouvement

Table de réglages par track : `{ vitesse, FOV, hauteur caméra, shake, DOF }`.

| Track | Vitesse | FOV | Notes |
|---|---|---|---|
| foolfoule | ×1,0 | serré | shake léger, caméra basse dans la foule |
| rise | ×0,8 | normal | grue lente + pause au sommet |
| blossoming | ×1,3 | large | énergie, virages appuyés |
| time | ×0,4 | normal | ralenti assumé, sons étouffés |
| telatelaba | ×0,7 | serré | flottement léger |
| renee sens | ×0,6 | large | caméra basse, DOF doux |

## Audio

Un emitter spatial par track, crossfade 8–12 s le long du spline, une couche
d'ambiance diégétique par zone (rumeur urbaine, vent, tondeuses, pluie, ressac).
Le mix diégétique baisse quand la musique du track monte.

## Technique & performance

- Stack conservée (Three.js / R3F) ; seule la direction visuelle change.
- Budgets : ≤ 300 draw calls visibles/zone (instancing + atlas), ≤ 1,5 M tris,
  textures 1K props / 2K héros, KTX2, LOD 3 niveaux, streaming aux transitions.
- Lumière : 1 directionnelle par segment + AO baked/light probes ;
  point lights limités et diégétiques.
- Cibles : 60 fps desktop milieu de gamme, 30 fps mobile, fallback qualité
  (désactivation volumétriques et pluie dense).
- Assets : bibliothèques photo-réalistes libres (Poly Haven matériaux/HDRI,
  modèles CC retravaillés) plutôt que modélisation abstraite.

## Méthode de travail imposée

1. **Color script d'abord** : une frame de référence par track (24), palette +
   heure + météo + un mot d'émotion, validées avant modélisation.
2. **Greybox à l'échelle** avec spline complet et timings par track.
3. **Pass lumière/atmosphère zone par zone** — c'est elle qui crée le réalisme.
4. **Pass assets & matériaux**, puis FX (pluie, poussière, foule, glace),
   puis audio, puis optimisation.
5. **Definition of done par track** : screenshot nommable en une phrase
   par un inconnu.

## Checklist finale anti-abstrait

- [ ] Aucun mesh sans matériau texturé PBR.
- [ ] Aucune lumière émissive sans source diégétique.
- [ ] Chaque POI identifiable par sa silhouette à 200 m.
- [ ] Fog, ciel et ombres cohérents avec l'heure scriptée du segment.
- [ ] Le λ n'apparaît que sculpté dans le décor, jamais flottant ni lumineux
      pour lui-même.
- [ ] Les 4 zones différenciables les yeux mi-clos, uniquement par leur
      lumière et leur palette.
