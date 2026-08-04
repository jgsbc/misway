# Immersion Core — socle de présence

Extrait du spike Fable (Entry → Birth Yard). Ce dossier contient les
**systèmes qui transmettent la présence**, indépendants de l'identité
artistique d'un macro-monde. Birth Yard fournit ses couleurs, ses gabarits,
ses accessoires ; le core fournit la sensation.

## Modules

| Module | Système | Ce qu'il garantit |
| --- | --- | --- |
| `immersionMix.ts` | Transitions entre macro-mondes | Tout état continu (brouillard, exposition, sons, densité) dérive de scalaires 0..1 calculés sur la route — jamais de bascule brutale. |
| `immersionExposure.ts` | Adaptation lumineuse | L'œil se traîne derrière la scène : s'habituer au noir est lent, revenir au jour éblouit. L'éblouissement est une sortie, pas un effet plaqué. |
| `immersionCamera.ts` | Caméra & sensation de conduite | Poursuite basse et inertielle, épaule discrète, FOV qui respire avec la vitesse, roulis de virage. Les contraintes spatiales (parois, gabarits) restent au monde. |
| `immersionGrounding.ts` | Ancrage du véhicule | Assiette depuis le champ de hauteur, ombre de contact qui respire avec la garde au sol, micro-tassement de caisse. |
| `immersionSecondary.ts` | Animation secondaire désynchronisée | Fréquence + phase dérivées d'une graine : deux éléments ne battent jamais à l'unisson, sauf événement artistique (`eventPulse`). |
| `immersionLayers.ts` | Couches de profondeur | Générateur d'anneau de fond ; convention premier plan tactile / plan moyen habité / fond atmosphérique. |
| `immersionAudio.ts` | Spatialisation sonore | Bus de bruit filtrés avec panoramique, événements ponctuels (`playFilteredBurst`, `playGroan`). Procédural, opt-in, jamais de musique. |
| `immersionInput.ts` | Interaction | « Le monde t'emporte, ta main dirige » : avance gouvernée par la scène, un seul axe analogique, frein contextuel. Le périphérique choisit sa lecture primaire — souris, tactile, manette — sans jamais afficher de pad ni de catalogue de schémas. Le clavier reste une alternative d'accessibilité non annoncée. |

## Ce qui reste au monde

Palette, gabarits d'architecture, accessoires, écriture des enseignes,
anomalie, chorégraphie des foules, matériaux — tout ce qui fait qu'un
macro-monde est *celui-là*. Le core ne doit jamais imposer un « look Birth
Yard » à Older Shadows ou New Signal ; il impose que l'air ait une épaisseur,
que la lumière ait une mémoire, que le sol porte, et que rien de vivant ne
soit synchrone.

## Règles de densité (convention, non codée)

- Premier plan (< 15 m) : détail tactile au sol (débris, taches, herbes,
  plaques), jamais de surface nue plein cadre.
- Plan moyen (15–60 m) : vie et machines lisibles en silhouette, sources de
  lumière pratiques (lampes, fenêtres, enseignes).
- Fond (> 60 m) : masses seulement, mangées par l'atmosphère ; une seule
  forme inexpliquée maximum.
