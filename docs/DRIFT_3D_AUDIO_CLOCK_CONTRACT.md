# DRIFT 3D — Shared audio clock contract

- **Version :** 1.1
- **Date :** 2026-07-17
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-00`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-00` : une horloge audio partagée, stable et lisible depuis le monde Drift, sans introduire de cue resolver, de scene lifecycle, de signature arbitration, de quality tiers, d'animation spécifique à une track, de runtime EUX GAINENT, de FFT, de seconde source audio ou de second player. Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.1 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée.

---

## 1. Source unique

`AudioPlayerProvider` (`src/components/audio/AudioPlayerProvider.tsx`) reste l'unique autorité de lecture et le seul propriétaire de l'unique `<audio>` du site. `DRIFT-IV-SYS-00` n'ajoute ni `AudioContext` musical, ni second `HTMLAudioElement`, ni provider parallèle, ni source clonée. Le moteur d'ambiance diégétique (`drift3dAmbience.ts`, WebAudio synthétique, opt-in) reste hors de cette horloge — il ne module qu'un mix indépendant, jamais la lecture de track.

## 2. Module framework-agnostic

`src/lib/drift3dAudioClock.ts` ne dépend ni de React, ni du DOM, ni d'une track particulière. Il expose :

- les types `Drift3DAudioPlaybackState`, `Drift3DAudioClockSource`, `Drift3DAudioClockUpdateReason`, `Drift3DAudioClockSnapshot`, `Drift3DAudioClockRef` ;
- `createDrift3DAudioClockSnapshot(source, nowMs)` — snapshot initial, `playbackState: "idle"`, `timelineRevision: 0`, `lastReason: "init"` ;
- `updateDrift3DAudioClock(previous, patch, reason, nowMs)` — fonction pure, retourne un nouveau snapshot sans muter `previous` ; c'est à l'appelant d'assigner le résultat sur sa ref stable ;
- `readDrift3DAudioClockTime(snapshot, nowMs)` — retourne un nombre, aucune allocation ;
- `readDrift3DAudioClockProgress(snapshot, nowMs)` — idem, dérivé du précédent.

## 3. Snapshot événementiel stable

Le snapshot n'est mis à jour que sur des événements discrets, jamais par une boucle interne au module (aucun `setInterval`, `setTimeout` ou `requestAnimationFrame` dans `drift3dAudioClock.ts`). `AudioPlayerProvider` synchronise la ref depuis l'unique `<audio>` sur : `source change`, `loadedmetadata`, `durationchange`, `timeupdate`, `play`, `pause`, `ratechange`, `seeking`, `seeked`, `ended`.

Deux catégories de mise à jour, pas une seule affirmation générale d'immédiateté :

- **la cible d'une discontinuité (`source-change`, `seek`, `restart`, `loop`) est reflétée immédiatement par le chemin de commande** (`playTrack`, `toggleTrack`, `playNext`, `playPrevious`, `seekToRatio`, la branche loop de `onEnded`) — sans dépendre du prochain `timeupdate` ni de l'événement natif correspondant ;
- **le démarrage effectif de la lecture et la pause effective sont confirmés par les événements natifs autoritatifs** `play`/`pause` (voir §8bis) — aucune commande n'affirme elle-même que l'audio joue ou est en pause avant que le navigateur ne le confirme.

## 4. Extrapolation bornée à 500 ms

`readDrift3DAudioClockTime` n'extrapole que lorsque `playbackState === "playing"`, à partir d'un temps monotone (`performance.now()`) fourni par l'appelant. L'écart entre l'instant de lecture et `capturedAtMs` est plafonné à `DRIFT_3D_AUDIO_CLOCK_MAX_EXTRAPOLATION_MS` (500 ms), multiplié par `playbackRate`, puis clampé entre `0` et `durationSeconds` lorsque la durée est connue. Aucune extrapolation en `paused`, `seeking`, `idle` ou `ended`.

## 5. Pause exacte

En pause, `readDrift3DAudioClockTime` retourne directement `anchorTimeSeconds` (le `currentTime` capturé à l'événement `pause`), sans extrapolation — le temps reste gelé tant qu'aucun nouvel événement ne survient.

## 6. Seek immédiat, état `seeking`, et déduplication de `timelineRevision`

`seekToRatio` (ainsi qu'un redémarrage même-piste et un rebouclage en fin de piste) met à jour `audioClockRef.current` de façon synchrone au moment de l'appel — `anchorTimeSeconds` reflète immédiatement la cible, `playbackState` passe à `"seeking"`, et `timelineRevision` augmente une fois (raison `"seek"`/`"restart"`/`"loop"` selon le cas) — **sans attendre** l'événement `seeked` du navigateur.

Tant que `playbackState === "seeking"`, `readDrift3DAudioClockTime` ne extrapole jamais (il n'extrapole que si `playbackState === "playing"`) : il retourne directement `anchorTimeSeconds`.

Les événements natifs `seeking`/`seeked` restent câblés pour toute origine de seek externe au provider (par exemple un test ou un outil externe modifiant directement `currentTime` sur l'unique `<audio>`), et pour confirmer l'état final `playing`/`paused` une fois le seek du navigateur effectivement résolu. Une ref interne bornée (`pendingDiscontinuityRef`, valeurs `"seek" | "restart" | "loop" | null`) est marquée **avant** la mutation de `audio.currentTime` par le chemin impératif ; le `seeked` natif qui suit la consulte :

- si elle est non nulle, ce `seeked` **confirme** une discontinuité déjà comptée au point d'appel — il réaligne `playbackState` sur `audio.paused ? "paused" : "playing"` avec la raison non discontinue `"seeking"`, sans réincrémenter `timelineRevision` ;
- si elle est nulle, ce `seeked` provient d'une origine externe et est compté lui-même, une fois, avec la raison `"seek"`.

`onSeeking` (l'événement natif, distinct de la raison `"seek"`) utilise systématiquement la raison non discontinue `"seeking"` — il ne bump jamais `timelineRevision`, qu'une discontinuité soit en attente ou non. Aucune temporisation, aucun compteur global : la sémantique observable garantie est **une révision par discontinuité logique**, jamais plus, jamais moins, y compris pour un seek externe.

## 7. `timelineRevision` sur discontinuités

`timelineRevision` n'augmente que sur les raisons représentant une discontinuité temporelle réelle : `source-change`, `seek`, `restart`, `loop`. Il n'augmente jamais sur `timeupdate`, `play`, `pause`, `metadata`, `rate-change`, `seeking` ou `ended`. Ce compteur permet à un futur Cue Resolver de détecter qu'il doit reconstruire son état plutôt que d'interpoler depuis son état précédent.

Le simple basculement du drapeau `isLooping` (bouton loop) ne bump pas `timelineRevision` — seul le redémarrage effectif en fin de piste (`onEnded`, raison `"loop"`) est une discontinuité.

## 8. Loop et changement de track

- **Changement de track** (`playTrack`, `toggleTrack`, `playNext`, `playPrevious`, `onEnded` sans loop) : raison `"source-change"` ou `"restart"` selon le cas, `anchorTimeSeconds` réinitialisé à `0`, `durationSeconds` réinitialisé à `0` en attendant le prochain `loadedmetadata`.
- **Redémarrage en boucle** (`onEnded` avec `isLooping === true`) : raison `"loop"`, `anchorTimeSeconds` remis à `0`, `sourceSlug` inchangé.

## 8bis. Play/pause : confirmation par événement natif, pas par la commande

Les commandes impératives (`playTrack`, `toggleTrack`, `togglePlayback`, la reprise après `syncSource`) **n'affirment jamais elles-mêmes** que la lecture a démarré. `playbackState` ne passe à `"playing"` que dans le handler de l'événement natif `play`, que le navigateur ne déclenche que lorsque `audio.play()` a effectivement réussi. Un `audio.play()` rejeté (branche `catch` de `playCurrent`, typiquement une politique d'autoplay qui bloque la tentative) laisse `isPlaying` à `false` et **ne modifie jamais** `audioClockRef` vers `"playing"` — l'horloge reste dans son état antérieur (`"idle"` ou `"paused"`), jamais faussement `"playing"`.

De même, `onSeeked` restaure `playbackState` à partir de `audio.paused` (propriété native, autoritative), jamais d'une supposition optimiste.

## 8ter. `rate-change` et ré-ancrage

`onRateChange` met à jour `anchorTimeSeconds: audio.currentTime` **et** `playbackRate: audio.playbackRate` dans le même patch, avant que `capturedAtMs` ne soit remplacé par `updateDrift3DAudioClock`. Règle générale appliquée à tout handler qui peut survenir en cours de lecture (`metadata` inclus, via `loadedmetadata`/`durationchange`) : toute mise à jour qui réinitialise `capturedAtMs` pendant `playbackState === "playing"` doit ancrer `anchorTimeSeconds` sur `audio.currentTime` au même instant, sous peine de faire extrapoler depuis une ancre obsolète avec un nouveau débit ou un nouvel instant de référence. `rate-change` ne bump jamais `timelineRevision` (un changement de débit n'est pas une discontinuité temporelle).

## 9. Contexte runtime sans progression React rapide

`AudioPlayerRuntimeContext` / `useAudioPlayerRuntime()` (même fichier `AudioPlayerProvider.tsx`) expose `current`, `isPlaying`, `isLooping`, `playTrack`, `toggleTrack`, `togglePlayback`, `toggleLoop`, `playNext`, `playPrevious`, `seekToRatio`, `isCurrentTrack`, `audioClockRef` — jamais `currentTime`, `duration` ou `progress`. Son `useMemo` ne dépend d'aucune donnée de progression rapide, donc un `timeupdate` ne provoque plus le rerender des consommateurs de ce contexte. `useAudioPlayer()` et `AudioPlayerContextValue` restent strictement inchangés (aucun breaking change) pour les interfaces existantes (`GlobalAudioPlayer`, `TrackInlinePlayer`, `TrackPlayButton`, `DriftMapClient`).

`Drift3DClient.tsx` consomme désormais `useAudioPlayerRuntime()` au lieu de `useAudioPlayer()`.

## 10. Propagation de la ref stable

`audioClockRef` transite `Drift3DClient → Drift3DCanvas → Drift3DScene` comme dépendance stable (jamais réassignée, jamais une prop temporelle) — aucune valeur comme `currentTime`, `progress` ou `cuePhase` ne transite par frame. Dans `Drift3DScene`, un `useEffect` (sans nouveau `useFrame`, sans timer) installe en développement seulement un getter read-only :

```ts
window.__drift3dAudioClock
```

via `Object.defineProperty(window, "__drift3dAudioClock", { configurable: true, get: ... })`. Le getter calcule `timeSeconds`/`progress` au moment de sa lecture (`readDrift3DAudioClockTime`/`readDrift3DAudioClockProgress`), jamais en cache. Il est retiré (`delete`) au démontage. Aucun setter n'est exposé — le probe ne permet ni d'écrire dans la ref, ni de commander le player.

## 11. API de lecture pour les futurs Cue Resolvers

`readDrift3DAudioClockTime`, `readDrift3DAudioClockProgress` et le champ `timelineRevision` constituent l'API stable que `DRIFT-IV-SYS-20` (harness de resolver de cues) pourra consommer sans réimplémenter de logique temporelle : lire le snapshot, extrapoler si nécessaire, détecter une discontinuité via `timelineRevision`.

## 12. Aucune cue track dans SYS-00

Ce lot ne lit, n'interprète et ne câble aucune Cue Map. `Drift3DAudioClockSource.slug` identifie la source (piste ou ambiance) mais aucune structure de cues n'est associée. Aucun contrat d'identité ou Cue Map de track n'a été lu pour ce lot (hors périmètre, cf. `AGENTS.md`).

## 13. Aucune seconde source audio

Vérifié en evidence package (§9.1 de `docs/evidence/DRIFT-IV-SYS-00/audio-clock-evidence.md`) : `document.querySelectorAll("audio").length === 1` à tout moment du parcours testé (init, lecture, pause, reprise, seek, changement de track, loop, changement de route).

## 14. Limites et responsabilités de SYS-10 / SYS-20

- **SYS-10 (lifecycle et nettoyage)** : ce lot ne formalise pas de lifecycle `UNMOUNTED/IDLE/ACTIVE/PAUSED/RESETTING` au sens de `DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.3 — l'horloge est un service pur, sans notion de montage/démontage de scène.
- **SYS-20 (harness de resolver de cues)** : aucun resolver de cues n'est livré ici ; `readDrift3DAudioClockTime`/`readDrift3DAudioClockProgress`/`timelineRevision` sont l'API que ce futur lot consommera.
- Aucun quality tier, aucune signature arbitration, aucune animation spécifique à une track, aucun runtime EUX GAINENT, aucune FFT ne sont livrés par `DRIFT-IV-SYS-00`.
