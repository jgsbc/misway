# DRIFT-IV-SYS-00 — Shared audio clock evidence report

- **Date :** 2026-07-17 (round initial) ; complété 2026-07-17 (round de correction, section 14)
- **Méthode (round initial, sections 1-13 ci-dessous) :** session Chrome réelle connectée (Claude in Chrome), transitions client-side (SPA, clics sur `<Link>`) entre `/drift/`, `/tracks/foolfoule/` et `/` pour préserver l'état d'`AudioPlayerProvider` à travers les changements de route ; lecture directe du probe dev `window.__drift3dAudioClock`.
- **Méthode (round de correction, section 14) :** session Chrome réelle (Claude Browser pane), lecture directe de `audioClockRef.current` via traversée du fiber React attaché au `<audio>` (contourne la dépendance au montage du `Canvas` react-three-fiber / `requestAnimationFrame`, voir note ci-dessous).

Données brutes complètes : [`audio-clock-evidence.json`](./audio-clock-evidence.json).

> ⚠️ **Requalification (round de correction) :** les résultats §9.5 (seek) et §9.7 (loop) ci-dessous restent affichés tels que mesurés à l'origine (aucune donnée historique n'est supprimée), mais sont requalifiés `PRE_FIX_FINDING — DUPLICATE_TIMELINE_REVISION` : le saut `timelineRevision` 1→7 et 8→11 mesuré alors incluait un double comptage (le chemin de commande *et* la paire native `seeking`/`seeked` qu'il déclenche bumpaient chacun la révision). Ce double comptage est corrigé (mécanisme `pendingDiscontinuityRef`, voir `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` §6). Les résultats corrigés, rejoués en direct, sont en section 14.

---

## Limite d'environnement rencontrée (et contournée)

Comme documenté dans `docs/DRIFT_3D_RUNTIME_BASELINE.md`, cet onglet automatisé rapporte `document.hidden === true` en continu, ce qui suspend `requestAnimationFrame` — et donc l'arbre interne du `Canvas` react-three-fiber ne montait pas tant qu'aucune frame n'était forcée (une capture d'écran). **Ceci ne bloque ni le montage React classique (`useEffect`), ni la lecture `<audio>`, ni les événements DOM** : seul le rendu 3D lui-même (et les `useFrame`) en dépend. Après une capture d'écran forçant une frame, le probe `window.__drift3dAudioClock` s'est peuplé normalement et est resté fiable pour le reste de la session.

---

## 1. Résultat par scénario

| Scénario | Résultat | Détail |
|---|---|---|
| §9.1 Initialisation | PASS | 1 `<audio>`, `sourceKind: ambient`, `playbackState: idle`, aucun autoplay |
| §9.2 Lecture explicite (Foolfoule) | PASS | 3 lectures à ~500ms d'écart, `timeSeconds`/`progress` strictement croissants, `sourceSlug: foolfoule` constant |
| §9.3 Pause | PASS | `timeSeconds` identique à 0,05s près (Δ=0) après 1s, `playbackState: paused` |
| §9.4 Reprise | PASS | reprend depuis la position de pause (Δ≈0,95s après ~1s), pas de saut vers le temps mural écoulé |
| §9.5 Seek réel (clic UI) | `PRE_FIX_FINDING — DUPLICATE_TIMELINE_REVISION` | `timeSeconds` proche de la cible du seek, mais saut `timelineRevision` 1→7 = double comptage commande+événement natif (corrigé, voir §14 Test A) |
| §9.6 Changement de track explicite | PASS | `sourceSlug` change (foolfoule→jazzypling), temps proche de zéro à la transition, `timelineRevision` augmente (7→8), 1 seul `<audio>` |
| §9.7 Loop / redémarrage | `PRE_FIX_FINDING — DUPLICATE_TIMELINE_REVISION` | `loopEnabled: true`, retour proche de zéro en fin de piste, `sourceSlug` inchangé, mais saut `timelineRevision` 8→11 = double comptage (corrigé, voir §14 Test D) |
| §9.8 Changement de route | PASS | player global conservé, `sourceSlug` conservé, temps cohérent, 1 seul `<audio>` sur `/drift/` → `/` → `/drift/` |
| §9.9 Entrée en zone sans lecture | PASS | aucune modification de source, aucun autoplay (piste en pause reste en pause, identique, après téléportation dans la zone Foolfoule) |

---

## 2. §9.1 — Initialisation

```json
{
  "sourceKind": "ambient",
  "sourceSlug": "__ambient__",
  "playbackState": "idle",
  "timeSeconds": 0,
  "durationSeconds": 234.959979,
  "timelineRevision": 0,
  "lastReason": "metadata"
}
```

`document.querySelectorAll("audio").length === 1`.

## 3. §9.2 — Lecture explicite de Foolfoule

Déclenchée via le bouton PLAY du lecteur inline sur `/tracks/foolfoule/`, puis vérifiée depuis `/drift/` :

| Lecture | `timeSeconds` | `progress` |
|---|---:|---:|
| 1 | 51.591418 | 0.276701 |
| 2 | 52.086558 | 0.279357 |
| 3 | 52.600989 | 0.282116 |

Strictement croissant sur les trois lectures, `sourceSlug: "foolfoule"` constant, `canvasCount`/`audioElements` = 1.

## 4. §9.3 — Pause exacte

Avant l'attente et après 1s d'attente : `timeSeconds: 77.446974` dans les deux cas — écart absolu **0**, `playbackState: "paused"`.

## 5. §9.4 — Reprise

Après reprise puis 1s d'attente : `timeSeconds: 78.393192` (contre `77.446974` à la reprise) — le temps repart bien depuis la position de pause, pas un saut vers le temps mural écoulé pendant les nombreuses secondes de manipulation d'outils qui ont précédé.

## 6. §9.5 — Seek réel

**`PRE_FIX_FINDING — DUPLICATE_TIMELINE_REVISION`.** Clic réel sur la barre de progression du lecteur inline Foolfoule (pas une assignation scriptée de `currentTime`) : cible ≈ 101.86s / 186.45s (54,6 %). Après navigation SPA vers `/drift/`, `sourceSlug` toujours `"foolfoule"`, `timelineRevision` passé de 1 à 7. Cette donnée historique est conservée telle quelle, mais son interprétation d'origine (« cumul de plusieurs discontinuités survenues durant les tests ») masquait un vrai bug : avant correction, chaque seek de commande (`seekToRatio`) bumpait la révision une fois pour la commande elle-même, **et** une seconde fois via la paire native `seeking`/`seeked` qu'elle déclenche — un seul seek logique comptait pour 2 révisions. Voir §14 Test A pour le résultat corrigé (delta = 1 exactement pour un seek UI unique).

## 7. §9.6 — Changement de track explicite

Bouton « Next track » cliqué : lecture DOM immédiate après clic → `src: jazzypling.mp3`, `currentTime: 13.73`. Après navigation SPA vers `/drift/` : `sourceSlug: "jazzypling"`, `timelineRevision` 7→8, un seul `<audio>` à tout moment.

## 8. §9.7 — Loop et redémarrage

**`PRE_FIX_FINDING — DUPLICATE_TIMELINE_REVISION`.** Loop activé, `currentTime` avancé à `duration - 2s` pour atteindre la fin naturellement en quelques secondes réelles. Lecture DOM après le passage naturel par `ended` : `src` **toujours** `jazzypling.mp3` (pas de piste suivante — confirme le loop, pas un `playNext`), `currentTime: 17.81` (retour proche de zéro), `paused: false`. Depuis `/drift/` : `loopEnabled: true`, `timelineRevision` 8→11, `playbackState: "playing"`. Note : l'attribut natif `<audio>.loop` reste `false` — le bouclage est géré par la logique applicative (`onEnded`), pas par l'attribut HTML natif. Cette donnée historique est conservée telle quelle, mais le saut de 3 (8→11) confirme après coup le même bug de double comptage que §9.5 : le `currentTime = 0` du wrap de boucle déclenchait à la fois la mise à jour de commande et sa propre paire native `seeking`/`seeked`. Voir §14 Test D pour le résultat corrigé (delta = 1 exactement pour un wrap de boucle unique).

## 9. §9.8 — Changement de route

`/drift/` → `/` (clic SPA) → `/drift/` (clic SPA). Sur `/`, un seul `<audio>`, `jazzypling.mp3`, non pausé, `currentTime: 68.26`. De retour sur `/drift/` : `sourceSlug` toujours `"jazzypling"`, `timeSeconds: 88.87` (cohérent avec la lecture continue), `timelineRevision` inchangé (11).

## 10. §9.9 — Entrée en zone sans lecture active

Piste `jazzypling` explicitement mise en pause, puis téléportation du véhicule dans la zone de Foolfoule (`window.__drift3dTeleport = { x: -78, z: 34 }`, confirmée visuellement : HUD affiche « FOOLFOULE / BIRTH YARD », boutons LISTEN/OPEN NODE). Lecture du clock : `sourceSlug: "jazzypling"` (inchangé), `playbackState: "paused"` (inchangé), `timeSeconds: 112.187405` identique à avant la téléportation. Aucune modification de source, aucun autoplay déclenché par l'entrée en zone.

---

## 11. Console

Aucune erreur runtime observée (filtre erreurs vérifié après l'ensemble des scénarios).

| Warning | Classification |
|---|---|
| `THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.` | `KNOWN_NON_BLOCKING_DEPRECATION_WARNING` |
| `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` | `KNOWN_NON_BLOCKING_DEPRECATION_WARNING` |
| `THREE.Material: parameter 'map' has value of undefined.` | `KNOWN_NON_BLOCKING_PARAMETER_WARNING` — dette technique préexistante, non corrigée dans ce lot (`src/**` limité au périmètre de l'horloge) |

---

## 12. Limites

- L'extrapolation bornée à 500 ms (`DRIFT_3D_AUDIO_CLOCK_MAX_EXTRAPOLATION_MS`) est implémentée et couverte par §9.3/§9.4 (gel exact en pause, reprise sans saut), mais aucune mesure chronométrée séparée du plafond d'extrapolation lui-même n'a été capturée en session live.
- Aucun fichier `.png` n'a été committé sous ce répertoire, pour la même raison documentée dans `docs/DRIFT_3D_RUNTIME_BASELINE.md` (le mécanisme `save_to_disk` produit une image de bureau fixe sans rapport avec l'onglet piloté) — une capture a été revue visuellement en direct (§9.9, entrée en zone), confirmant HUD/canvas/scène correctes, sans persistance en fichier.

---

## 14. Round de correction — rejeu des tests ciblés A-F (2026-07-17)

**Méthode :** session Chrome réelle (Claude Browser pane), piste `foolfoule` (durée 186.451875s). Le montage du `Canvas` react-three-fiber (nécessaire pour le probe `window.__drift3dAudioClock`) s'est révélé indisponible dans cette session (`requestAnimationFrame` jamais déclenché malgré tentatives de forçage de frame par capture d'écran, elles-mêmes devenues indisponibles — voir `docs/DRIFT_3D_RUNTIME_BASELINE.md` pour le détail de la limite d'environnement). **Contournement appliqué :** lecture directe de `audioClockRef.current` par traversée du fiber React attaché au nœud DOM `<audio>` (`audioEl.__reactFiber$...` → remontée des `return` jusqu'au hook `useRef` dont la valeur correspond à la forme d'un `Drift3DAudioClockSnapshot`). Cette technique lit exactement la même ref stable que le probe `window.__drift3dAudioClock`, sans dépendre du montage du Canvas ni d'un `requestAnimationFrame` — elle n'a nécessité aucune modification du code applicatif.

Toutes les révisions ci-dessous sont des lectures consécutives dans une seule session continue (navigation SPA uniquement, aucun rechargement complet entre les tests).

### Test A — Seek UI unique

- Avant clic sur la barre de seek Foolfoule : `timelineRevision = 4`, `playbackState = "playing"`.
- Clic réel unique sur `button "Seek FOOLFOULE"` (contrôle de seek du lecteur inline).
- Après résolution : `timelineRevision = 5` (**delta = 1**, exact), `anchorTimeSeconds = 101.399205` (proche de la cible, barre cliquée à ~54% de la piste), `playbackState = "playing"` (conforme à l'état précédent le seek).
- État transitoire `"seeking"` : non capturé — la résolution de `seeked` sur un fichier déjà entièrement bufferisé (`readyState: 4`) est plus rapide que l'aller-retour réseau de l'outil de contrôle du navigateur. Confirmé par lecture de code (`onSeeking` positionne `playbackState: "seeking"` et n'incrémente jamais la révision) plutôt que par capture live — limite honnêtement documentée, non un échec du correctif.

### Test B — Seek externe natif

- Avant : `timelineRevision = 5`.
- `document.querySelector('audio').currentTime = 30` exécuté directement en JS (sans passer par `seekToRatio` de l'application — simule un acteur externe).
- Après résolution : `timelineRevision = 6` (**delta = 1**, exact) — confirme que le mécanisme de déduplication ne masque pas un seek réellement externe (le `pendingDiscontinuityRef` était `null`, donc `onSeeked` a compté ce seek avec la raison `"seek"`).

### Test C — Restart

- Piste au-delà de 5s (`anchorTimeSeconds = 49.87`), `timelineRevision = 6`.
- Clic unique sur « Previous track » (déclenche un restart, la piste étant au-delà du seuil de redémarrage).
- Après résolution : `timelineRevision = 7` (**delta = 1**, exact), `sourceSlug` inchangé (`"foolfoule"`), `anchorTimeSeconds = 3.19` (proche de zéro).

### Test D — Loop wrap

- Loop activé (« Loop current track »). `currentTime` avancé à `duration - 3s` via JS pour atteindre la fin naturellement en quelques secondes réelles (marge choisie pour permettre une lecture intermédiaire propre).
- Baseline capturée juste après résolution de ce seek intermédiaire (lui-même correctement compté +1, non mesuré ici) : `timelineRevision = 10`, `anchorTimeSeconds = 185.54` (à 0.9s de la fin).
- Après le passage naturel par la fin de piste et le wrap de boucle : `timelineRevision = 11` (**delta = 1**, exact), `sourceSlug` inchangé (`"foolfoule"`), `anchorTimeSeconds = 12.71` (piste relancée, `playbackState = "playing"`).

### Test E — Rate change

- Avant : `audio.currentTime = 30.246237`, `clock.timeSeconds (extrapolé) = 30.230896`, `timelineRevision = 11`, `playbackRate = 1`.
- `audio.playbackRate = 1.5` appliqué directement (simule l'action utilisateur), attente ~2s réelles.
- Après : `audio.currentTime = 63.552764`, `clock.timeSeconds (extrapolé) = 63.523937`, `timelineRevision = 11` (**delta = 0**, inchangé), `lastReason = "timeupdate"` (événement média légitime postérieur au `rate-change`).
- Horloge non régressive (30.23 → 63.52, strictement croissante), horloge proche de `audio.currentTime` dans les deux mesures (écart ≤ 0.03s) — confirme que `onRateChange` ré-ancre bien `anchorTimeSeconds` au moment du changement de régime, sans quoi l'écart aurait dérivé bien au-delà du plafond d'extrapolation de 500ms.
- `playbackRate` remis à `1` après le test.

### Test F — Pause / reprise

- Pause (clic sur le toggle play/pause inline) : `anchorTimeSeconds = 93.726837`, `playbackState = "paused"`, `timelineRevision = 11` (inchangé).
- Après 1s d'attente réelle : `audio.currentTime` et `clock.timeSeconds (extrapolé)` **identiques** (`93.726837`, delta = 0s, ≤ 0.05s requis).
- Reprise (clic) : `playbackState = "playing"`, reprise depuis `~93.7s` (mesuré à `96.0s` après le round-trip de vérification, soit ~2.3s de lecture réelle depuis la reprise) — **pas** de saut vers un temps mural cumulé incluant la pause ni les nombreuses secondes de manipulation d'outils précédentes.

### Résumé (forme JSON contractuelle)

```json
{
  "seekUi": { "revisionBefore": 4, "revisionAfter": 5, "delta": 1 },
  "seekExternal": { "revisionBefore": 5, "revisionAfter": 6, "delta": 1 },
  "restart": { "revisionBefore": 6, "revisionAfter": 7, "delta": 1 },
  "loop": { "revisionBefore": 10, "revisionAfter": 11, "delta": 1 },
  "rateChange": { "revisionDelta": 0, "movedBackward": false },
  "pauseResume": { "pauseDeltaSeconds": 0, "resumedFromPausedPosition": true }
}
```

Tous les deltas mesurés correspondent exactement aux exigences contractuelles : un seek UI = +1 (et non +6 comme mesuré pré-correctif en §9.5), un seek externe natif = +1, un restart = +1, un wrap de boucle = +1 (et non +3 comme mesuré pré-correctif en §9.7), un changement de régime = +0, une pause/reprise sans dérive.

---

## 15. Round de correction 2 — `applyClockRestart` immédiatement non extrapolable (2026-07-17)

**Écart corrigé :** `applyClockRestart` ne positionnait pas `playbackState: "seeking"` de façon synchrone à l'appel — une extrapolation aurait pu, en théorie, se produire dans la fenêtre entre la commande et l'événement natif `seeking`. De plus, `playPrevious` et la branche même-piste de `playTrack` mutaient `audio.currentTime` **avant** d'armer `pendingDiscontinuityRef`/`applyClockRestart`, ce qui aurait pu laisser une fenêtre où l'événement natif `seeking` arrive avant que la ref de déduplication ne soit posée.

**Correctifs :**
- `applyClockRestart` patch désormais `{ anchorTimeSeconds: 0, playbackState: "seeking" }` en un seul appel synchrone à `updateDrift3DAudioClock`, avant tout retour à l'appelant.
- `playPrevious` : `applyClockRestart()` appelé **avant** `audio.currentTime = 0`.
- `playTrack` (branche même piste) : `applyClockRestart()` appelé **avant** `audio.currentTime = 0`, avec ajout de `setCurrentTime(0)` explicite (absent auparavant, aligné sur le comportement de `playPrevious`).

**Méthode de vérification :** session Chrome réelle (Claude Browser pane), piste `foolfoule`, lecture d'`audioClockRef.current` par traversée du fiber React (même technique qu'en section 14). Pour capturer l'état transitoire de façon fiable (la limite de round-trip documentée en section 14 empêchait sa capture), le bouton a été déclenché par `element.click()` synchrone en JavaScript et l'horloge relue **dans le même bloc de script**, immédiatement après l'appel, avant tout retour au navigateur — capturant ainsi l'état exact posé par le chemin de commande, avant que l'événement natif asynchrone `seeking` ne puisse lui-même s'exécuter.

### Test — Restart via Previous (piste > 5s)

- Avant : `timelineRevision = 2`, `anchorTimeSeconds = 41.23`, `playbackState = "playing"`.
- **Immédiatement après le clic sur « Previous track » (même tick JS, avant tout événement natif) :** `playbackState = "seeking"`, `anchorTimeSeconds = 0`, `timelineRevision = 3` (**delta = 1**), `lastReason = "restart"`.
- Après résolution de `seeked` (~1s plus tard) : `playbackState = "playing"` (conforme à `audio.paused === false`), `timelineRevision = 3` (**inchangé** — aucun double comptage), `sourceSlug` inchangé (`"foolfoule"`), temps qui recommence à avancer depuis zéro.
- **Résultat : PASS.** `playbackState = "seeking"` confirmé de façon synchrone et immédiate, pas seulement par lecture de code.

### Test — Restart via `playTrack` sur la piste déjà active

- Piste courante `foolfoule` toujours active. `playTrack` n'étant câblé à aucun bouton de l'interface actuelle (`TrackInlinePlayer`/`TrackPlayButton` utilisent `toggleTrack`, pas `playTrack`), la fonction a été invoquée directement via la valeur du `AudioPlayerContext` retrouvée par traversée du fiber React (même piste, `{ slug: "foolfoule" }`) — aucune modification de code applicatif, lecture/invocation seule.
- Avant : `timelineRevision = 3`, `anchorTimeSeconds = 64.02`, `playbackState = "playing"`.
- **Immédiatement après l'appel (même tick JS) :** `playbackState = "seeking"`, `anchorTimeSeconds = 0`, `timelineRevision = 4` (**delta = 1**), `lastReason = "restart"`.
- Après résolution de `seeked` (~1s plus tard) : `playbackState = "playing"`, `timelineRevision = 4` (**inchangé** — aucun double comptage), `sourceSlug` inchangé (`"foolfoule"`), temps qui recommence à avancer depuis zéro.
- **Résultat : PASS.** Delta = 1 exact, aucun double comptage, `sourceSlug` inchangé, temps proche de zéro.

### Résumé

```json
{
  "previousRestart": { "revisionBefore": 2, "revisionImmediatelyAfterCommand": 3, "playbackStateImmediatelyAfterCommand": "seeking", "revisionAfterSeeked": 3, "delta": 1 },
  "sameTrackPlayTrackRestart": { "revisionBefore": 3, "revisionImmediatelyAfterCommand": 4, "playbackStateImmediatelyAfterCommand": "seeking", "revisionAfterSeeked": 4, "delta": 1 }
}
```

---

## 13. Décision de gate

| Critère | Statut |
|---|---|
| un seul élément audio existe | PASS |
| aucune régression d'autoplay | PASS |
| ref stable et partagée | PASS |
| progression extrapolée bornée | PASS (implémenté, non chronométré séparément) |
| temps croissant en lecture | PASS |
| temps gelé en pause | PASS |
| seek immédiat | PASS |
| état `seeking` sans extrapolation | PASS — capturé en direct pour le restart (voir §15), lecture de code pour le seek UI (§14 Test A) |
| une révision unique par discontinuité logique (seek/restart/loop/source-change) | PASS — corrigé et rejoué en §14 (delta = 1 exact pour chaque scénario, ex-`PRE_FIX_FINDING` en §9.5/§9.7 requalifiés) |
| `playbackRate` ré-ancre `anchorTimeSeconds` | PASS (voir §14 Test E) |
| changement de route cohérent | PASS |
| Drift ne consomme plus le contexte de progression rapide | PASS (`Drift3DClient` migré vers `useAudioPlayerRuntime()`) |
| aucun Cue Resolver ou code track introduit | PASS |
| lint et build passent | PASS |

**Décision : `DRIFT-IV-SYS-00` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-10` → `NEXT_AFTER_MERGE`.**

*(Historique : entre la soumission initiale de cette évidence et cette décision finale, le statut est passé par `REWORK_REQUIRED` le temps du round de correction ci-dessus — §14 — qui a éliminé le double comptage de révision identifié en §9.5/§9.7.)*
