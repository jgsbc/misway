# DRIFT 3D — Scene lifecycle contract

- **Version :** 1.1
- **Date :** 2026-07-19
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-10`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-10` : un lifecycle de scène générique et déterministe, une politique de reset générique, un démontage propre du runtime Drift, et la suppression des ressources et états transitoires réellement possédés par la scène. Il ne livre ni Cue Resolver, ni phase musicale, ni activation spécifique à une track, ni signature arbitration, ni quality tier, ni reduced-motion contract, ni no-WebGL narrative path, ni mémoire/résidus, ni runtime EUX GAINENT. Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.3 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée, et `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` pour le service livré par `DRIFT-IV-SYS-00`, distinct et non modifié par ce lot.

---

## 1. Module framework-agnostic

`src/lib/drift3dSceneLifecycle.ts` ne dépend ni de React, ni du DOM, ni d'une track particulière, ni d'une cue. Il expose :

- les types `Drift3DSceneLifecycleState`, `Drift3DSceneLifecycleEvent`, `Drift3DSceneResetReason`, `Drift3DSceneLifecycleSnapshot`, `Drift3DSceneLifecycleRef` ;
- `createDrift3DSceneLifecycleSnapshot(nowMs)` — snapshot initial, `state: "UNMOUNTED"`, toutes les révisions à `0`, `lastEvent: "init"` ;
- `transitionDrift3DSceneLifecycle(previous, event, nowMs, resetReason?)` — fonction pure, retourne un nouveau snapshot sans muter `previous` ; c'est à l'appelant d'assigner le résultat sur sa ref stable.

Aucun timer, aucun `setInterval`/`setTimeout`/`requestAnimationFrame` dans ce module — chaque transition est strictement déterministe à partir de l'état précédent, d'un événement et d'un timestamp fourni par l'appelant (`performance.now()`, jamais appelé pendant un render React).

## 2. Les cinq états canoniques

```text
UNMOUNTED
IDLE
ACTIVE
PAUSED
RESETTING
```

Ces cinq états reproduisent exactement `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.3. Le lifecycle partagé ne connaît aucune phase narrative locale (pas de `cadence-lock`, `wave-ritual`, `deviation` ou équivalent) — ces phases restent track-local et relèvent d'un futur Cue Resolver (`DRIFT-IV-SYS-20`), jamais de ce service.

## 3. Matrice de transitions

```text
UNMOUNTED + mount             -> IDLE
IDLE + activate                -> ACTIVE
PAUSED + resume                 -> ACTIVE
ACTIVE + pause                  -> PAUSED
IDLE / ACTIVE / PAUSED + reset  -> RESETTING
RESETTING + reset-complete      -> IDLE
tout état monté + unmount       -> UNMOUNTED
```

Toute paire (état, événement) absente de cette matrice — y compris un `reset` reçu pendant `RESETTING`, ou un événement reçu depuis `UNMOUNTED` autre que `mount` — est un **no-op déterministe** : `transitionDrift3DSceneLifecycle` retourne alors `previous` inchangé, sans exception, sans état partiel. Un événement répété dans le même état (par exemple `activate` reçu alors que l'état est déjà `ACTIVE`) est également un no-op.

## 4. `mountRevision`, `lifecycleRevision`, `resetRevision`

- **`lifecycleRevision`** augmente à chaque transition réelle (tout changement d'état effectivement appliqué), jamais sur un no-op.
- **`mountRevision`** augmente uniquement lors d'un véritable passage `UNMOUNTED → IDLE` (l'événement `mount`, jamais un `mount` reçu hors `UNMOUNTED`).
- **`resetRevision`** augmente une seule fois par reset logique — exactement à l'entrée dans `RESETTING`, jamais à la sortie (`reset-complete`) ni en cas de `reset` reçu alors que l'état est déjà `RESETTING`.

Ces trois compteurs permettent à un futur consommateur (Cue Resolver, harness de preuve) de détecter qu'il doit reconstruire son état plutôt que d'interpoler depuis son état précédent, sur le même principe que `timelineRevision` de l'horloge audio.

## 5. Raisons de reset génériques

```text
route-unmount
fallback
manual
zone-exit
source-change
track-restart
loop
```

Ce lot ne déclenche que `"route-unmount"` (voir §7). Les six autres raisons sont réservées à de futurs lots (`fallback` pour `SYS-60`, `zone-exit`/`source-change`/`track-restart`/`loop` pour un futur lifecycle track-local sous `SYS-20`+, `manual` pour un futur harness de commande sous `SYS-70`) — leur présence dans le type ne constitue pas une livraison de la logique qui les déclencherait.

**Aucun reset automatique fondé sur un slug ou une cue n'est câblé par ce lot.**

## 6. `PAUSED` (lifecycle) ≠ pause du player audio

`PAUSED` décrit exclusivement la scène 3D (le `Canvas` react-three-fiber cesse de rendre des frames) lorsque le document devient invisible (`document.hidden`). Cet état **ne pause jamais** `AudioPlayerProvider` ni la lecture de la track globale : `Drift3DCanvas.tsx` ne référence, n'importe et n'appelle aucune fonction du player audio (`togglePlayback`, `audio.pause()`, etc.) dans son effet de lifecycle. Voir §9 pour la preuve.

## 7. Intégration actuelle : visibilité du document

`Drift3DCanvas.tsx` porte l'unique ref stable `sceneLifecycleRef` (initialisée par `createDrift3DSceneLifecycleSnapshot(0)`, `changedAtMs: 0` déterministe au même titre que l'horloge audio — aucun `performance.now()` pendant le render). Un seul `useEffect` (dépendances `[]`, monté/démonté une fois par instance) gouverne tout le cycle :

- **montage** : `mount` (`UNMOUNTED → IDLE`), puis `activate` (`IDLE → ACTIVE`) si `document.visibilityState === "visible"` — sinon la scène reste `IDLE` jusqu'au premier événement de visibilité ;
- **`visibilitychange`** : `document.hidden` devient vrai et l'état est `ACTIVE` → `pause` (`ACTIVE → PAUSED`) ; `document.hidden` devient faux et l'état est `PAUSED` → `resume` (`PAUSED → ACTIVE`) ; `document.hidden` devient faux et l'état est `IDLE` → `activate` (`IDLE → ACTIVE`) ;
- **démontage (route-unmount)** : voir §8.

Le changement de visibilité est l'événement grossier React autorisé par ce lot pour piloter `ACTIVE`/`PAUSED` — aucun autre déclencheur (scroll, focus fenêtre, etc.) n'est câblé.

Un état React grossier (`sceneRuntimeActive`, mis à jour uniquement dans ces mêmes points de contrôle, jamais par frame) synchronise le renderer :

```tsx
frameloop={sceneRuntimeActive ? "always" : "never"}
```

`sceneRuntimeActive` est mis à `true` lors d'une transition vers `ACTIVE` et à `false` lors d'une transition vers `PAUSED` — jamais lu ni écrit à chaque frame.

## 8. Politique de démontage (route-unmount)

Au cleanup de `Drift3DCanvas`, deux phases distinctes :

**Immédiat, synchrone, inconditionnel :**

1. retrait du listener `visibilitychange` du lifecycle ;
2. arrêt et détachement des ressources possédées par `Drift3DCanvas` : `Drift3DAmbienceEngine.stop()` (ferme l'`AudioContext` diégétique) puis `ambienceEngineRef.current = null` ;
3. remise à zéro des états d'entrée transitoires : `pointerDriveStateRef`, `activeTouchPointersRef` (vidé), `pinchStateRef`.

**Différé, dans un `queueMicrotask`, conditionnel :** la transition *logique* `reset("route-unmount")` → `reset-complete` → `unmount` (`lifecycleRevision`+3, `resetRevision`+1, état final `UNMOUNTED`) n'est appliquée que si aucun nouveau `setup` de ce même effet, sur la **même instance**, ne s'est déjà déclaré entre le cleanup et l'exécution de la microtask (voir §12 pour la raison — un React 18 Strict Mode dev replay ne doit jamais produire cette transition). Aucun `setState` React n'est appelé dans ce bloc différé ni avant, quelle que soit l'issue — le composant peut déjà être réellement en cours de démontage.

`Drift3DScene.tsx` complète ce démontage avec ses propres cleanups indépendants (§10) — le lifecycle de `Drift3DCanvas` ne les orchestre pas directement ; chaque ressource reste possédée et libérée par le composant React qui l'a créée (aucun registre générique de cleanup, aucun event bus).

## 9. Le player global survit au démontage — invariant vérifié

`AudioPlayerProvider` est monté au niveau racine du site (hors de `/drift`), et son unique `<audio>` n'est jamais démonté par une navigation hors de `/drift/`. Quitter `/drift/` ne coupe ni ne réinitialise jamais la track en cours de lecture globalement — vérifié en evidence package (§10.3 de `docs/evidence/DRIFT-IV-SYS-10/scene-lifecycle-evidence.md`) : `audioCount === 1` avant et après le démontage de route, source et lecture globales inchangées.

L'ambiance diégétique locale (`Drift3DAmbienceEngine`), elle, est explicitement arrêtée au démontage (§8, étape 2) — elle n'est pas le player global et sa portée est strictement `/drift/`.

## 10. Cleanups de `Drift3DScene`

- **Texture terrain** (`useDriftTerrainTexture`) : le `THREE.CanvasTexture` généré une fois par instance (`useMemo`, dépendances `[]`) est explicitement disposé (`texture.dispose()`) dans un `useEffect` dédié au démontage — jamais recréée sur un changement de lifecycle ou de visibilité (dépendances inchangées).
- **Géométrie terrain** (`DriftTerrainMesh`) : disposal déjà correct avant ce lot, conservé tel quel — exécuté une seule fois par instance, indépendant des changements de visibilité.
- **Clavier** (`KeyboardVehicleMotion`) : au cleanup, en plus du retrait des listeners `keydown`/`keyup`/`blur`/`visibilitychange` déjà existant, `pressedKeysRef` est explicitement vidé — aucune touche ne reste « active » après un retour sur `/drift/` (une instance qui remonte reçoit de toute façon un `Set` neuf, ce vidage est une garantie explicite et défensive, pas une correction d'un bug observé).
- **Probes de développement** : voir §11.

Composants enfants audités (`Drift3DEffects.tsx`, `Drift3DScatterField.tsx`, `Drift3DLandmark.tsx`, `Drift3DZone.tsx`, `Drift3DProp.tsx`, `Drift3DVehicle.tsx`) — deux disposent déjà correctement une ressource externe qu'ils créent (`Drift3DScatterField.tsx` : géométrie et matériau d'instance ; `Drift3DLandmark.tsx` : géométrie et render target du plan d'eau réfléchissant) et n'ont pas été modifiés ; les quatre autres ne créent aucune ressource externe (texture, géométrie manuelle, timer, listener global, `AudioContext`, object URL, observer) et n'ont pas été modifiés non plus. Aucun refactor artistique ou structurel n'a été fait sur ces fichiers.

## 11. Probes de développement — ownership par instance

En développement seulement, `Drift3DScene` installe :

```text
window.__drift3dAudioClock   (DRIFT-IV-SYS-00, inchangé)
window.__drift3dLifecycle    (nouveau, ce lot)
```

et revendique les droits de nettoyage sur deux probes déjà écrits ailleurs dans l'arbre (`window.__drift3dRender` par `AtmosphereRig`, `window.__drift3dDebug` par `KeyboardVehicleMotion`) ainsi que sur un canal externe (`window.__drift3dTeleport`, écrit par un script de test/dev, jamais par la scène elle-même).

Chaque instance montée porte un jeton propriétaire privé (`devProbeOwnerRef`, un `useRef<object>({})` calculé une seule fois par instance — jamais recréé à chaque exécution de l'effet, jamais exposé) et l'enregistre pour chacune de ces cinq clés dans un petit registre interne au module (`Map<string, object>`, non exposé sur `window`, non générique — il ne sert qu'à arbitrer le droit de suppression de ces cinq clés, ce n'est ni un event bus ni un orchestrateur de cleanup de ressources). Au démontage, chaque clé n'est supprimée (`delete window[key]`) que si le jeton enregistré correspond toujours à celui de cette instance — **un cleanup tardif d'une instance déjà remplacée ne peut donc jamais supprimer le probe d'une instance plus récente**. Parce que le jeton vit dans un `useRef` et non dans une variable locale à l'effet, une même instance React (un même fiber) conserve rigoureusement le même jeton à travers tout re-déclenchement de cet effet, y compris un replay React 18 Strict Mode — seule une instance genuinement nouvelle (après un vrai démontage puis un vrai remontage) reçoit un jeton différent.

`window.__drift3dLifecycle` est strictement read-only :

```ts
const probe = Object.freeze({
  read: () => ({
    state,
    previousState,
    lifecycleRevision,
    mountRevision,
    resetRevision,
    lastEvent,
    lastResetReason,
    changedAtMs,
  }),
});
```

Installé via `Object.defineProperty(window, "__drift3dLifecycle", { configurable: true, value: probe })` — aucune méthode de mutation exposée, `read()` recalcule à chaque appel depuis `sceneLifecycleRef.current`, jamais en cache. Aucun harness de commande n'est ajouté (`window.__drift3dLifecycle` ne permet pas de déclencher une transition depuis l'extérieur) — cela reste le périmètre de `DRIFT-IV-SYS-70`.

## 12. Idempotence et React Strict Mode

Toute transition sur un événement déjà appliqué ou invalide pour l'état courant est un no-op pur (§3) — rejouer un événement ne produit jamais d'effet de bord supplémentaire. Ceci couvre `mount`/`activate` rejoués par un second `setup` sur la même instance (§7) : si l'état courant les a déjà appliqués, ils sont des no-ops.

**React Strict Mode peut rejouer `setup`/`cleanup` de l'effet en développement (`setup → cleanup → setup`, sur la même instance), mais ce replay N'EST PAS un démontage logique de la scène et NE DOIT JAMAIS émettre `route-unmount` ni incrémenter `resetRevision`.** Un premier essai d'implémentation appliquait la transition `route-unmount` de façon synchrone dans le cleanup — ce qui, sous Strict Mode, produisait un faux reset dès le tout premier montage, avant toute navigation réelle (`resetRevision` déjà à `1`, `lastResetReason` déjà `"route-unmount"`). Voir `docs/evidence/DRIFT-IV-SYS-10/scene-lifecycle-evidence.md`, requalification en tête de document et §12, pour le détail de cet écart corrigé.

Le mécanisme correctif (§8) distingue les deux cas via `lifecycleEffectGenerationRef`, une ref bumpée à chaque `setup` réel de l'effet :

- **replay Strict Mode** (même instance) : le `cleanup` diffère la décision `route-unmount` dans une microtask ; avant qu'elle ne s'exécute, le `setup` suivant (le second appel synchrone du cycle Strict Mode) a déjà bumpé la génération ; la microtask constate que la génération a changé et **n'applique rien** — `mount`/`activate` du second `setup` sont eux-mêmes des no-ops si l'état courant les a déjà atteints (voir ci-dessus) ;
- **vrai démontage** (aucun `setup` ultérieur) : la microtask s'exécute avec la génération inchangée et applique la transition `route-unmount` réelle.

Résultat observable, vérifié en session réelle : après stabilisation du montage sous Strict Mode et avant toute navigation, `mountRevision = 1`, `resetRevision = 0`, `lastResetReason = null` — jamais de reset fictif. Un vrai démontage de route porte ensuite `resetRevision` à `1` exactement.

Le jeton propriétaire des probes (§11) suit la même logique de stabilité par instance (`useRef`), indépendamment de ce mécanisme de génération.

## 13. Absence de vocabulaire de cue ou de track

Aucun des types, raisons ou événements de ce module ne nomme une track, un slug, une cue ou une phase narrative. `Drift3DSceneResetReason` reste générique (§5) précisément pour rester consommable par un futur lifecycle track-local sans que ce service partagé n'ait besoin de connaître la track qui l'invoque.

## 14. Responsabilités futures de `DRIFT-IV-SYS-20`+

- **`SYS-20` (harness de resolver de cues)** : consommera `lifecycleRevision`/`resetRevision` de la même façon que `timelineRevision` de l'horloge audio pour détecter une reconstruction nécessaire ; câblera les raisons de reset encore inutilisées (`zone-exit`, `source-change`, `track-restart`, `loop`) au niveau track-local.
- **`SYS-30`/`SYS-40`** : arbitrage de signature et quality tiers, non abordés ici.
- **`SYS-60`** : chemin narratif no-WebGL, qui utilisera potentiellement la raison `"fallback"`.
- **`SYS-70`** : harness de commande/preuve formalisé — ce lot expose un probe lecture seule, pas un harness de commande.

## 15. Limites

- Aucun lifecycle local de track n'est encore livré : `activateWhen`/`resetPolicy` du contrat conceptuel de scène locale (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §4) restent non implémentés — ce lot ne fournit que le lifecycle générique de la scène tout entière, pas d'une track individuelle.
- Aucun quality tier, aucune signature arbitration, aucun reduced-motion contract ni no-WebGL narrative path formel ne sont livrés par `DRIFT-IV-SYS-10` — les fallbacks existants (`Drift3DFallback.tsx`, `Drift3DClient.tsx`) restent inchangés ; ce lot vérifie seulement qu'ils ne laissent aucun lifecycle ou probe résiduel (voir evidence §10.7).
- Limite d'environnement documentée en evidence : voir `docs/evidence/DRIFT-IV-SYS-10/scene-lifecycle-evidence.md` pour le détail des sessions de navigateur automatisé et leurs contraintes de visibilité.
