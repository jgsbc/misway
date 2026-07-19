# DRIFT 3D — Cue resolver contract

- **Version :** 1.0
- **Date :** 2026-07-19
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-20`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-20` : un resolver de cues générique et pur, une timeline de phases minimale, et un harness de développement read-only permettant de le prouver. **`SYS-20` ne livre aucune Cue Map de track réelle et aucun runtime de track.** Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.2 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée, `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` pour le service audio consommé (inchangé par ce lot) et `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` pour le lifecycle de scène (inchangé par ce lot).

---

## 1. Resolver pur

`src/lib/drift3dCueResolver.ts` ne dépend ni de React, ni du DOM, ni d'une track, ni d'un slug, ni d'une cue réelle. Aucun timer (`setInterval`/`setTimeout`/`requestAnimationFrame`), aucun `useFrame`. Toute résolution est une fonction du temps absolu et de la timeline fournie — jamais de l'état précédent :

```text
f(timeline, absoluteTime)   — jamais f(previousState, deltaTime)
```

Le module n'importe que l'API publique nécessaire depuis `src/lib/drift3dAudioClock.ts` (`Drift3DAudioClockSnapshot`, `Drift3DAudioPlaybackState`, `readDrift3DAudioClockTime`) — il ne modifie pas ce fichier.

## 2. Timeline générique

```ts
type Drift3DCuePhase<TPhaseId extends string = string> = Readonly<{
  id: TPhaseId;
  startTimeSeconds: number;
  endTimeSeconds: number;
}>;
```

Une timeline est un tableau ordonné de `Drift3DCuePhase`. Le module ne connaît aucun identifiant de phase réel — `TPhaseId` reste générique, spécialisé uniquement par un futur fichier track-local.

## 3. Validation (`getDrift3DCueTimelineIssues`)

Détecte, par phase et par comparaison avec la phase précédente :

- `empty-id` — identifiant vide ou uniquement des espaces ;
- `duplicate-id` — identifiant déjà vu ;
- `non-finite-boundary` — `startTimeSeconds`/`endTimeSeconds` non fini (`NaN`/`Infinity`) ;
- `negative-start` — `startTimeSeconds < 0` ;
- `end-not-after-start` — `endTimeSeconds <= startTimeSeconds` ;
- `unsorted` — la phase commence avant la précédente ;
- `overlap` — la phase commence avant la fin de la précédente.

**Les gaps (trous) entre deux phases sont autorisés et ne sont jamais signalés comme une erreur.** Cette validation est destinée à la définition d'une Cue Map, aux tests, au développement et à l'acceptation — le resolver chaud (`resolveDrift3DCueAtTime`, `resolveDrift3DCueFromAudioClock`) ne revalide jamais la timeline à chaque appel ; il suppose une timeline déjà validée.

## 4. Sémantique exacte des frontières

Phases intermédiaires : intervalle semi-ouvert `[start, end)`.

```text
A = 0 → 5   B = 5 → 10
t = 4.999   → A
t = 5.000   → B
```

**La dernière phase seule** accepte aussi son `endTimeSeconds` exact — intervalle fermé `[start, end]` pour elle uniquement — afin que `phaseProgress` atteigne exactement `1` à la fin précise d'une track, sans produire artificiellement `phaseId: null` pendant cet instant final. Au-delà de cette borne, `phaseId: null` et `isAfterLastPhase: true`.

## 5. Gaps

Dans un gap entre deux phases (ou avant la première/après la dernière) :

```text
phaseId = null
phaseIndex = -1
phaseProgress = 0
phaseStartTimeSeconds = null
phaseEndTimeSeconds = null
```

`absoluteTimeSeconds` et `timelineProgress`, en revanche, restent valides et continuent d'avancer normalement — un gap n'interrompt jamais la progression globale.

## 6. Progression de phase et progression globale

```text
0 <= phaseProgress <= 1
0 <= timelineProgress <= 1
```

- `phaseProgress = (time - phase.start) / (phase.end - phase.start)`, clampé ;
- `timelineProgress = absoluteTime / durationSeconds` (durée effective, voir ci-dessous), clampé.

Si aucune durée positive n'est fournie (`durationSeconds <= 0` ou non finie), la fin de la dernière phase sert de repli pour la durée, si elle existe ; sinon la durée effective est `0` et `timelineProgress` vaut `0`. Le resolver ne produit jamais `NaN`, `Infinity` ou `-Infinity` — toute division dégénérée retombe sur `0` via un clamp défensif.

## 7. Reconstruction directe depuis le temps absolu

Le resolver ne conserve **aucune** phase précédente, **aucune** progression accumulée, **aucun** curseur narratif mutable, **aucun** historique. Résoudre `t = 17.4` produit exactement le même résultat qu'on y soit arrivé par lecture continue, par seek avant, par seek arrière, après une pause, après un restart suivi d'un seek, ou après une navigation puis une reprise du player global. C'est la garantie fondamentale de ce lot — vérifiée en evidence (`docs/evidence/DRIFT-IV-SYS-20/cue-resolver-evidence.md`, tests D/E/F/G).

## 8. Intégration AudioClock (`resolveDrift3DCueFromAudioClock`)

1. lit le temps absolu via `readDrift3DAudioClockTime(snapshot, nowMs)` ;
2. résout la phase à partir de ce temps absolu et de `snapshot.durationSeconds` ;
3. expose en plus, tels quels, `sourceKind`, `sourceSlug`, `playbackState`, `timelineRevision` — copiés depuis le snapshot, jamais réinterprétés.

## 9. Rôle de `timelineRevision`

**`timelineRevision` n'est jamais consulté pour décider *comment* résoudre** — le resolver reconstruit toujours directement depuis le temps absolu, qu'une discontinuité ait eu lieu ou non. Il est exposé pour qu'un futur consommateur sache qu'une discontinuité logique (seek/restart/loop/source-change) a eu lieu et puisse invalider un éventuel cache local — sans jamais transformer ce resolver en machine à états.

## 10. Pause, seek, restart, loop, source-change

- **Pause** : `readDrift3DAudioClockTime` gèle `absoluteTimeSeconds` (comportement hérité de l'horloge audio, inchangé) — la résolution de phase reste donc elle aussi gelée à l'identique tant qu'aucun nouvel événement ne survient.
- **Seek** (avant ou arrière) : le nouveau temps absolu est résolu directement, sans dépendre du temps précédent ni rejouer les phases intermédiaires.
- **Restart** : équivalent à un seek vers `~0` — le resolver ne « sait » pas qu'un restart a eu lieu, il constate simplement le nouveau temps absolu.
- **Loop** : idem — un wrap de boucle est un nouveau temps absolu comme un autre.
- **Source-change** : la timeline fournie change de propriétaire logique (une future track différente), mais ce module reste agnostique — il résout la timeline qu'on lui donne, quelle qu'elle soit.

## 11. Absence totale de dramaturgie partagée

Aucune logique conditionnelle sur un slug ou une track (`if (slug === "eux-gainent")` ou équivalent) n'existe dans ce module — vérifié structurellement (`docs/evidence/DRIFT-IV-SYS-20/cue-resolver-evidence.md` §structural evidence). Le resolver résout la timeline qu'on lui fournit ; il ne décide **pas** :

- si la track correspond à la zone active ;
- si une scène locale doit s'activer ;
- si une signature doit apparaître ;
- si une autre track doit être ignorée ;
- si une Cue Map est artistiquement correcte.

Ces responsabilités restent track-local, dans les futurs lots Build.

## 12. Séparation resolver générique / fichiers track-local

`SYS-20` ne crée **aucun** fichier `src/lib/cues/<track>.ts`, aucune Cue Map réelle (EUX GAINENT ou autre), aucune phase artistique nommée. La convention future (documentée, non implémentée ici) :

```ts
// Illustration conceptuelle uniquement — aucun fichier réel créé par SYS-20.
const phases = [
  /* phases spécifiques à une track, définies au moment du Build concerné */
] as const;

export function resolveTrackCue(audioClockSnapshot, nowMs) {
  return resolveDrift3DCueFromAudioClock(phases, audioClockSnapshot, nowMs);
}
```

Chaque track possédera son propre fichier de définition/résolution au moment de son premier Build réellement prouvé — aucune registry partagée de toutes les cues n'est créée prématurément par ce lot.

## 13. Harness de développement — read-only

En développement seulement, `Drift3DCanvas.tsx` installe :

```text
window.__drift3dCueResolver
```

Disponible dès le montage de `Drift3DCanvas` — **sans dépendre** du montage interne react-three-fiber ni d'un `requestAnimationFrame` (contrairement aux probes installés depuis `Drift3DScene.tsx`). API :

```ts
{
  validate(phases),
  resolveAt(phases, timeSeconds, durationSeconds, timelineRevision?),
  resolveCurrent(phases),
}
```

`resolveCurrent(phases)` lit `audioClockRef.current` et `performance.now()` puis appelle le resolver pur — il ne lit rien d'autre et n'écrit jamais. Le probe est `Object.freeze`d, n'expose aucun setter et ne permet **jamais** : `play()`, `pause()`, `seek()`, `restart()`, un changement de source, ou une mutation de `sceneLifecycleRef`. Aucun harness de commande n'est livré — seule la lecture/résolution est exposée (le harness de commande formel reste le périmètre de `DRIFT-IV-SYS-70`).

## 14. Cleanup du probe

Pas de second registre générique de probes (le registre par jeton de `Drift3DScene.tsx`, livré par `DRIFT-IV-SYS-10` pour ses cinq probes, reste inchangé et n'est pas réutilisé ici). `Drift3DCanvas.tsx` utilise une protection d'identité locale simple : l'objet `probe` créé à ce montage est comparé par référence (`===`) à `window.__drift3dCueResolver` avant suppression au démontage.

```ts
const probe = Object.freeze(/* ... */);
Object.defineProperty(window, "__drift3dCueResolver", { configurable: true, value: probe });

return () => {
  if (window.__drift3dCueResolver === probe) {
    delete window.__drift3dCueResolver;
  }
};
```

Conséquences : un replay React 18 Strict Mode (`setup → cleanup → setup` sur la même instance) reste sûr — le second `setup` installe un nouveau `probe`, et si le cleanup du premier `setup` s'exécutait après coup, la comparaison par référence échouerait et ne supprimerait rien. Un cleanup tardif d'une instance déjà remplacée ne peut donc jamais supprimer le probe d'une instance plus récente. Aucun `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` n'est utilisé pour ce probe.

## 15. Limites de `DRIFT-IV-SYS-20`

- **Aucune Cue Map de track réelle n'est livrée.** La timeline utilisée pour la preuve (`docs/evidence/DRIFT-IV-SYS-20/cue-resolver-evidence.md`) est entièrement synthétique (`probe-a`/`probe-b`/`probe-c`) et n'a aucune signification artistique.
- Aucune phase artistique, aucun nom de cue réel, aucune activation de scène track n'est introduite.
- Aucun harness de commande (le probe est strictement read-only) — reste le périmètre de `DRIFT-IV-SYS-70`.
- Aucune signature arbitration, aucun quality tier, aucune mémoire/résidu, aucune transition d'ère, aucune FFT/beat-detection/analyse spectrale.
- Ce resolver ne décide d'aucune politique d'activation (`activateWhen`/`resetPolicy` du contrat conceptuel de scène locale, `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §4) — cela reste track-local, dans les futurs lots Build.

## 16. Responsabilités de `DRIFT-IV-SYS-30`+

- **`SYS-30` (arbitrage de signature)** : décidera quelle situation signature majeure est active à un instant donné, en s'appuyant potentiellement sur `phaseId`/`timelineRevision` exposés ici — non abordé par ce lot.
- **`SYS-40`** : quality tiers préservant l'identité, non abordé ici.
- **Premier Build track** (au moment de son exécution, hors périmètre `SYS-*`) : créera sa première définition/résolution track-local à l'emplacement retenu lors de ce Build, à partir de la preuve locale et des conventions alors confirmées, consommant `resolveDrift3DCueFromAudioClock` avec sa propre timeline validée et ses propres phases artistiques nommées.

`SYS-20` ne prescrit pas le chemin de fichier futur des Cue Maps ou resolvers track-local. Cette décision reste différée jusqu'au premier Build concerné.
