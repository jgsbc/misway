# DRIFT 3D — Architecture cible du monde intégral

- **Version :** 2.0
- **Date :** 2026-07-15
- **Statut :** `TARGET_ARCHITECTURE — NOT RUNTIME TRUTH`
- **Adopted by program :** 2026-07-16 — `DRIFT-IV-GOV-00` (adoption du programme directeur ; ce document reste une cible, non une vérité runtime).
- **Règle :** aucun composant partagé décrit ici ne doit être extrait avant preuve et acceptation au gate d'industrialisation.

---

# 1. Contraintes produit protégées

- `/drift` reste la route 3D de production.
- Le player global reste l'unique autorité de lecture.
- L'entrée dans une zone ne déclenche jamais automatiquement la musique.
- Le monde diégétique reste distinct de la track.
- mobile, reduced motion, no-WebGL, export statique et `basePath` restent des gates.
- les contrats artistiques approuvés dominent toute invention runtime.
- le code reste l'autorité de l'état livré.

---

# 2. Architecture en couches

```text
ROOT PRODUCT SHELL
  AudioPlayerProvider
  Route /drift
  WebGL / reduced-motion gate
  Static export / basePath

DRIFT WORLD SHELL
  Canvas
  Terrain / topology / physics
  Vehicle / camera / proximity
  Atmosphere / scatter / ambience
  HUD

PROVEN SHARED LIVING SERVICES
  AudioClockRef
  Cue resolvers
  Scene lifecycle/reset
  Signature arbitration
  Quality tier
  Evidence/performance probes

TRACK-LOCAL LIVING SCENES
  Identity contract
  Cue map
  Actors
  Signature objects
  Scene-local orchestration
  Residue adapter
  Fallback contract

POST-GATE WORLD CONTINUITY
  Session residue ledger
  Recurring archetypes
  Object migrations
  Era transition directors
  Bureaucracy progression
  Motif λ grammar
  Final ocean restitution
```

---

# 3. Frontières d'état

## 3.1 React state

Réservé aux événements grossiers :

- track courante ;
- play/pause ;
- boucle ;
- zone active ;
- quality tier ;
- accès fallback ;
- événements HUD ;
- décisions de session peu fréquentes.

## 3.2 Mutable refs / runtime Three

Réservé aux données haute fréquence :

- position ;
- vélocité ;
- phase d'animation ;
- transforms ;
- matériaux ;
- intensités ;
- progression cue ;
- interpolation ;
- compteurs visuels ;
- états temporaires.

## 3.3 Mémoire de session

Après gate uniquement :

- faits narratifs bornés ;
- traces créées ;
- motifs rencontrés ;
- signatures vues ;
- fragments éligibles à l'océan ;
- états nécessaires au retour transformé.

Interdits : données personnelles, historique illimité, compte utilisateur, analytics individuels, synchronisation.

---

# 4. Contrat conceptuel d'une scène locale

```ts
type TrackLivingSceneContract = {
  trackSlug: string;
  nodeId: string;
  identityContractId: string;
  cueMapId: string;

  lifeLoops: readonly LifeLoopContract[];
  signatureObjects: readonly SignatureObjectContract[];
  recurringArchetypes?: readonly ArchetypeAppearance[];

  activateWhen: {
    insideZone: boolean;
    currentTrack: boolean;
    explicitPlayback: boolean;
  };

  resetPolicy: {
    onZoneExit: boolean;
    onTrackChange: boolean;
    onTrackRestart: boolean;
    onUnmount: boolean;
  };

  residue?: {
    key: string;
    scope: "route-session";
    maxEntries: number;
    oceanEligible: boolean;
  };

  fallback: {
    lowQuality: string;
    reducedMotion: string;
    noWebGL: string;
  };

  budgets: {
    drawCalls: number;
    triangles: number;
    lights: number;
    frameCallbacks: number;
  };
};
```

Ce contrat ne doit pas être imposé aux 26 scènes tant que les vertical slices n'en prouvent pas les champs.

---

# 5. Services partagés

## 5.1 Audio Clock

- snapshot stable ;
- extrapolation bornée ;
- pause, seek, loop et track change ;
- aucune prop temporelle rapide vers le Canvas ;
- aucune seconde source audio.

## 5.2 Cue Resolver

- fonctions pures ;
- temps absolu ;
- phases déterministes ;
- progression normalisée ;
- reconstruction directe après seek ;
- fichier spécifique à chaque track.

## 5.3 Scene Lifecycle

```text
UNMOUNTED
IDLE
ACTIVE
PAUSED
RESETTING
```

Les phases narratives restent track-local. Le lifecycle partagé ne connaît pas `cadence-lock`, `wave-ritual` ou `deviation`.

## 5.4 Signature Arbitration

- une situation signature majeure à la fois ;
- priorité à la track active ;
- boucles de vie conservées ;
- cleanup sur sortie/reset ;
- aucune architecture complexe avant preuve.

## 5.5 Quality Tier

Pilote des capacités, pas des styles :

- population ;
- scatter ;
- textures dynamiques ;
- probes ;
- reflets ;
- arrière-plans ;
- boucles secondaires.

L'identité doit survivre à tous les tiers.

## 5.6 Evidence Harness

En développement uniquement :

- phase ;
- timestamp ;
- playback ;
- zone ;
- signature ;
- compteurs performance ;
- mémoire locale ;
- raison du reset.

---

# 6. Systèmes post-industrialisation

## 6.1 Residue Ledger

```ts
type WorldResidue = {
  id: string;
  sourceTrack: string;
  motif: "bike" | "sign" | "window" | "stone" | "trace" | "shadow" | "light";
  variant: string;
  oceanEligible: boolean;
};
```

Contraintes : taille maximale, déduplication, reset, payload fermé, pas de stockage durable initial.

## 6.2 Recurring Archetypes

- apparitions rares ;
- silhouettes LOD ;
- accessoires ;
- gestes ;
- migration planifiée ;
- changement de sens selon l'ère.

Chaque archétype possède un arc documentaire avant code.

## 6.3 World Transit

Arrière-plan continu : trains, télécabines, cargos, trafic, oiseaux, avions, météo et lumières. Trajectoires longues, faible coût, culling et quality tiers.

## 6.4 Bureaucracy Kit

Bibliothèque gouvernée :

- panneaux ;
- tampons ;
- rubans ;
- tickets ;
- compteurs ;
- vocabulaire par ère ;
- matériaux ;
- états de dégradation.

Jamais un générateur automatique de blagues.

## 6.5 Contaminated Material Kit

- verre de conformité ;
- affiche lacérée ;
- trame d'encre ;
- reflet édité ;
- ombre autonome ;
- erreur CMJN ;
- trace ;
- craie ;
- écume mémorielle ;
- lumière imprimée.

Les matériaux ne sont partagés que si leur fonction narrative reste compatible.

## 6.6 Era Transition Directors

1. roche → infrastructure → ville ;
2. ville → friche → montagne ;
3. montagne → station → lotissement ;
4. lotissement → panne → forêt ;
5. océan → route côtière → monde transformé.

## 6.7 Final Ocean Restitution

Entrées : résidus, traces, motifs et signatures vues.

Sorties :

- 3 à 7 fragments maximum ;
- matérialisation imparfaite ;
- composition λ ;
- vague d'effacement ;
- route finale.

La mer ne doit jamais afficher une checklist du parcours.

---

# 7. Organisation des fichiers cible

Arborescence indicative après gate :

```text
src/components/drift-3d/
  living/
    shared/
    tracks/
      birth-yard/
      older-shadows/
      vegetative-field/
      new-signal/
    transitions/
    population/
    continuity/

src/lib/
  drift3dAudioClock.ts
  drift3dQuality.ts
  drift3dResidues.ts
  drift3dRecurringArchetypes.ts
  drift3dEraTransitions.ts
  cues/
```

Ne pas migrer des dossiers uniquement pour correspondre à ce dessin.

---

# 8. Stratégie d'assets

## 8.1 Tiers

- `FOUNDATION` — réutilisable physiquement ;
- `ERA` — spécifique à une ère ;
- `TRACK` — signature non copiable ;
- `TRANSIENT` — effet musical ;
- `RESIDUE` — variante migrante ou mémorielle ;
- `FALLBACK` — low/reduced/no-WebGL.

## 8.2 Règles

- aucun asset signature sans contrat ;
- aucune texture dynamique haute résolution par défaut ;
- pas de dépendance externe pour un seul effet sans gate ;
- préférer instances, atlases, decals et géométries simples ;
- conserver silhouette et fonction sur mobile ;
- documenter licence et provenance.

---

# 9. Audio et monde diégétique

- la track globale garde la priorité ;
- l'ambiance reste opt-in ;
- les scènes modulent une ambiance, elles ne créent pas une seconde musique ;
- aucun stem n'est supposé disponible ;
- FFT éventuelle seulement secondaire ;
- événements principaux par cues validées ;
- ne pas sur-jouer chaque kick.

---

# 10. Performance

## Instrumentation

- renderer info ;
- fps/frame time ;
- draw calls ;
- triangles ;
- textures ;
- programmes ;
- callbacks frame ;
- population active ;
- signature active ;
- quality tier.

## Anti-patterns

- un `useFrame` par petit objet ;
- `setState` par frame ;
- allocations récurrentes ;
- timers concurrents ;
- matériaux clonés en boucle ;
- nombreuses lumières dynamiques ;
- reflets multipliés ;
- foule en composants React individuels ;
- mémoire illimitée.

---

# 11. Fallbacks

## Reduced motion

Poses, états, lumière, matériaux, avant/après et transitions lentes.

## Low quality

Réduire acteurs, trajectoires secondaires, particules, reflets et résolutions. Conserver anomalie, objet signature, cue principale et résidu.

## No WebGL

Carte/listening path, illustration ou panneau, résumé poétique court et contrôle audio complet.

---

# 12. Gate d'industrialisation

| Question | Preuve |
|---|---|
| commune à combien de slices ? | au moins deux |
| identité préservée ? | captures et owner review |
| gain réel ? | coût/code mesuré |
| risque runtime ? | tests et performance |
| fallback commun ? | preuves |
| rollback possible ? | patch borné |
| migration nécessaire ? | justification |

Sans preuve, garder le code local.
