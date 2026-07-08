# DRIFT 3D — Color script

Étape 1 de la méthode imposée par [DRIFT_3D_REALISM_BIBLE.md](./DRIFT_3D_REALISM_BIBLE.md).
Une ligne par track : palette dominante, heure scriptée, météo, un mot d'émotion,
et la phrase-test qu'un inconnu doit pouvoir prononcer devant un screenshot.

Statut : v1 textuelle — à valider avant toute modélisation. Les frames de
référence image par image restent à produire (une par track).

## Entrée

| segment | heure | météo | palette | émotion | phrase-test |
|---|---|---|---|---|---|
| entry-ambient | aube, avant le lever | air saturé d'humidité | noir basalte, bleu d'aube froid dans la découpe λ | naissance | « une grotte noire avec une sortie lumineuse en forme de lambda » |

## Zone 1 — Birth Yard (ciel laiteux voilé, sodium la nuit)

| track | heure | météo | palette | émotion | phrase-test |
|---|---|---|---|---|---|
| a walk in zeeland | coucher de soleil (~5° d'élévation) | ciel dégagé, voile doré | or/rose sur l'eau, brique brune, gris quai | solitude | « des canaux hollandais au coucher du soleil » |
| foolfoule | 8 h 30 | soleil bas et dur | verre/granit, reflets aveuglants, gris béton | oppression | « une foule à l'heure de pointe dans un canyon de gratte-ciels » |
| jazzypling | 1 h du matin | pavés mouillés après pluie | tungstène chaud, ombres profondes, néon fatigué | interdit | « une ruelle de jazz la nuit » |
| play-it | 7 h, petit matin | bleu-gris froid, propre | gris acier, blanc bureau, marquages au sol | cadence | « des costumes identiques qui vont au bureau au petit matin » |

## Zone 2 — Older Shadows (soleil franc, ombres nettes)

| track | heure | météo | palette | émotion | phrase-test |
|---|---|---|---|---|---|
| rise | fin d'après-midi | air limpide d'altitude | bleu glacier, granit, neige, or rasant | triomphe | « un col de montagne au soleil rasant » |
| blossoming | midi plein | grand beau temps | roche neutre, équipements rouge/jaune vifs | adrénaline | « un versant de sports extrêmes dans les Alpes » |
| ethnic stick | fin d'après-midi | heat haze, poussière dorée | ocres, terre battue, tissus colorés | chaleur humaine | « un village de terre en Afrique au soleil doré » |
| minuit moins cinq | crépuscule | vent de crête | bleu nuit naissant, dernière bande orange | choix | « une bifurcation de montagne au crépuscule sous une vieille horloge » |

## Zone 3 — Vegetative Field (ciel couvert uniforme, lumière plate)

| track | heure | météo | palette | émotion | phrase-test |
|---|---|---|---|---|---|
| perdue | après-midi indéfini | couvert | verts fanés, bois gris, désaturation locale | abandon | « une ferme qui ferme ses volets au bord d'un champ » |
| morne, et ? | après-midi indéfini | couvert | vert pelouse, beige crépi, blanc PVC | anesthésie | « un lotissement parfait où il n'y a personne » |
| daymason | après-midi indéfini | brume basse permanente | pierre grise, brume, gravures effacées | non-dit | « une bâtisse sans fenêtres que tout le monde évite » |
| chailk | heure blanche | brouillard dense (~80 m) | blanc craie, traits gris | zéro | « une carrière de craie vide dans le brouillard » |

## Zone 4 — New Signal (alternance argent / or jusqu'à l'aube)

| track | segment | heure | météo | palette | émotion | phrase-test |
|---|---|---|---|---|---|---|
| time | argent | nuit arrêtée | air figé | gris lunaire, fissures sombres | suspension | « une route fissurée pleine d'horloges arrêtées » |
| tantitom | or | nuit qui s'ouvre | claircie | gris + rouge coquelicot, lanternes chaudes | retour | « un champ gris où seuls les coquelicots sont rouges » |
| neektareum | argent | nuit | lune filtrée | troncs argentés, sous-bois froid | descente | « une route qui s'enfonce dans une forêt sombre » |
| asitis | argent | nuit glaciale | buée, cristaux | glace bleu-argent, stalactites | acceptation | « une gorge gelée sous la lune » |
| relative | or | nuit → trouées | humide | pierre sombre, source claire, puits de lumière | rebond | « une remontée en spirale hors d'un puits » |
| overthink | argent | nuit | sec, poussière de chantier | béton inachevé, signalétique contradictoire | saturation | « des échangeurs inachevés empilés n'importe comment » |
| hold the light | argent | tempête | pluie forte, rafales, éclairs | lande noire, halo chaud unique | devoir | « quelqu'un debout sous l'orage qui tient une lanterne » |
| midnight work | or | minuit passé | ciel lavé après tempête | nuit noire, une fenêtre chaude, voie lactée | murmure | « une maison isolée avec une seule fenêtre éclairée sous les étoiles » |
| telatelaba | argent | nuit | brume au sol | haies sombres, miroirs froids | dédoublement | « un labyrinthe de haies et de miroirs dans la brume » |
| le monde s'endort | argent | fin de nuit | air calme | ville lointaine qui s'éteint par vagues | apaisement | « une ville vue d'un belvédère dont les lumières s'éteignent » |
| renee sens | or | aube d'été | brume marine légère | sable pâle, galets, premier rayon d'or | paix | « une plage déserte au premier rayon du matin » |

## Règles transverses

- L'éclairage runtime interpole entre ces états le long du déplacement ;
  jamais de coupure sèche hors transitions scriptées.
- L'exposition s'adapte en 2–3 s aux changements majeurs (sortie de grotte).
- Les segments « argent » de New Signal n'ont aucune source chaude hors
  diégèse ; les segments « or » concentrent leur chaleur sur UNE source
  (lanterne, fenêtre, rayon d'aube).
