# DRIFT-IV-SYS-20 — Cue resolver evidence report

- **Date :** 2026-07-19
- **Méthode :** session Chrome réelle (Claude Browser pane), navigation SPA (clics sur les `<Link>` réels du site), serveur `next dev` local. Timeline entièrement synthétique (`probe-a`/`probe-b`/`probe-c`) — **aucune signification artistique**, jamais présentée comme une Cue Map MISWAY réelle.

Données brutes complètes : [`cue-resolver-evidence.json`](./cue-resolver-evidence.json).

---

## Note méthodologique : le harness ne dépend pas du montage react-three-fiber

Contrairement à `window.__drift3dAudioClock` et `window.__drift3dLifecycle` (installés depuis `Drift3DScene.tsx`, enfant du `Canvas` react-three-fiber, et donc suspendus tant qu'aucune frame n'est produite — voir `docs/evidence/DRIFT-IV-SYS-00/` et `docs/evidence/DRIFT-IV-SYS-10/`), `window.__drift3dCueResolver` est installé depuis `Drift3DCanvas.tsx`, un composant React ordinaire **hors** de l'arbre react-three-fiber. Il a été directement lisible (`typeof window.__drift3dCueResolver === "object"`) dès le premier chargement de `/drift/`, sans traversée de fiber ni forçage de frame — confirmé dès le premier test ci-dessous.

## Incident d'environnement rencontré et résolu (sans rapport avec le code livré)

En cours de session, le serveur `next dev` (processus hérité d'une session précédente, actif sans interruption depuis plusieurs heures) est devenu non réactif (`curl` avec délai de 5s sans réponse, `HTTP 000`). Diagnostiqué comme une surcharge du processus long-vécu, pas comme un défaut du code de ce lot. Résolu en arrêtant ce processus et en démarrant un serveur `next dev` frais. Quatre erreurs console (« Failed to fetch RSC payload… Falling back to browser navigation ») correspondent aux tentatives de navigation faites pendant cet épisode, avant le redémarrage — **aucune erreur console n'a été observée pendant le reste de la session**, y compris tous les tests A à I ci-dessous, obtenus après redémarrage propre du serveur.

---

## 1. Résultat par scénario

| Scénario | Résultat |
|---|---|
| Test A — Validation de timeline | PASS — timeline valide (avec gap) → 0 issue ; chaque fixture invalide détectée avec le type exact attendu |
| Test B — Frontières déterministes | PASS — toutes les valeurs numériques exactement conformes à la spec |
| Test C — Intégration AudioClock | PASS — `sourceSlug` réel, `durationSeconds` réel, résolution cohérente |
| Test D — Reconstruction directe (seek avant/arrière) | PASS — `timelineRevision` +1 exact à chaque seek, `resolveAt` identique à `resolveCurrent`, aucun rejeu des phases intermédiaires |
| Test E — Pause/reprise | PASS — gel exact (Δ=0 après 2s), reprise sans rattrapage wall-clock |
| Test F — Restart | PASS — `timelineRevision` +1, `absoluteTimeSeconds` = 0 exact, `phaseId = probe-a` |
| Test G — Source change | PASS — `sourceSlug` change, `timelineRevision` +1, retour près de 0, `phaseId = probe-a` |
| Test H — Cleanup/remount | PASS — probe absent après démontage, nouvelle instance après remontage, player global jamais interrompu |
| Test I — Fallbacks | PASS — `canvasCount = 0`, probe absent, `audioCount = 1` dans les deux cas |

---

## 2. Test A — Validation de timeline

Timeline synthétique valide (avec gap 10→12) :

```json
[
  { "id": "probe-a", "startTimeSeconds": 0, "endTimeSeconds": 5 },
  { "id": "probe-b", "startTimeSeconds": 5, "endTimeSeconds": 10 },
  { "id": "probe-c", "startTimeSeconds": 12, "endTimeSeconds": 20 }
]
```

`window.__drift3dCueResolver.validate(phases)` → `[]` (aucune issue — le gap n'est **pas** signalé comme une erreur).

Fixtures invalides, chacune détectée avec le type exact attendu :

| Fixture | Issue détectée |
|---|---|
| id dupliqué | `duplicate-id` |
| chevauchement | `overlap` |
| `end <= start` | `end-not-after-start` |
| `start` négatif | `negative-start` |
| borne non finie (`Infinity`) | `non-finite-boundary` |
| timeline non triée | `unsorted` |
| id vide | `empty-id` |

## 3. Test B — Frontières déterministes

`resolveAt(phases, t, 20)` pour chaque `t` :

| `t` | `phaseId` | `phaseIndex` | `phaseProgress` | `timelineProgress` | notes |
|---:|---|---:|---:|---:|---|
| 0 | `probe-a` | 0 | 0 | 0 | |
| 2.5 | `probe-a` | 0 | 0.5 | 0.125 | |
| 4.999 | `probe-a` | 0 | 0.99980 | 0.24995 | juste avant la frontière |
| 5 | `probe-b` | 1 | 0 | 0.25 | frontière `[start, end)` |
| 10 | `null` | -1 | 0 | 0.5 | gap — `timelineProgress` reste valide |
| 12 | `probe-c` | 2 | 0 | 0.6 | |
| 20 | `probe-c` | 2 | **1** | 1 | fin exacte de la dernière phase — intervalle fermé |
| 25 | `null` | -1 | 0 | 1 (clampé) | `isAfterLastPhase: true` |

Toutes les valeurs exactement conformes à la spec — aucun `NaN`/`Infinity`/`-Infinity` observé.

## 4. Test C — Intégration AudioClock

Baseline (`/drift/`, avant toute lecture explicite) :

```json
{ "sourceKind": "ambient", "sourceSlug": "__ambient__", "playbackState": "idle", "timelineRevision": 0, "durationSeconds": 234.959979 }
```

Après déclenchement explicite de FOOLFOULE via l'UI existante (`/tracks/foolfoule/`, clic réel) puis navigation SPA vers `/drift/`, `resolveCurrent(phases)` :

```json
{
  "phaseId": "probe-c", "phaseIndex": 2,
  "absoluteTimeSeconds": 15.028508, "durationSeconds": 186.451875,
  "phaseProgress": 0.378564, "timelineProgress": 0.080603,
  "sourceKind": "track", "sourceSlug": "foolfoule",
  "playbackState": "playing", "timelineRevision": 1
}
```

`sourceSlug: "foolfoule"` — la track réellement jouée, **aucune référence à ce slug n'existe dans `src/lib/drift3dCueResolver.ts`** (vérifié structurellement, §7). `durationSeconds` reflète la durée réelle de la piste (186.45s, valeur déjà connue des lots précédents). `audioCount === 1`, aucun autoplay (l'ambiance de fond ne s'est jamais déclenchée automatiquement — la lecture est venue d'un geste utilisateur explicite sur `/tracks/foolfoule/`).

## 5. Test D — Reconstruction directe après seek

**Seek avant.** Un seek réel sur l'unique `<audio>` (`audio.currentTime = 6.5`, attente du véritable événement natif `seeked`) :

```json
{
  "before": { "timelineRevision": 3 },
  "afterSeek": {
    "phaseId": "probe-b", "phaseIndex": 1,
    "absoluteTimeSeconds": 6.5,
    "phaseProgress": 0.3, "timelineProgress": 0.034862,
    "timelineRevision": 4
  },
  "direct_resolveAt_sameValues": {
    "phaseId": "probe-b", "phaseIndex": 1,
    "phaseProgress": 0.3, "timelineProgress": 0.034862
  }
}
```

`timelineRevision` : `3 → 4`, soit **+1 exactement**. `resolveAt(phases, afterSeek.absoluteTimeSeconds, afterSeek.durationSeconds, afterSeek.timelineRevision)` produit une valeur **identique** à `resolveCurrent` sur `phaseId`/`phaseIndex`/`phaseProgress`/`timelineProgress` — confirmant que la résolution ne dépend que du temps absolu, pas du chemin emprunté pour l'atteindre.

**Seek arrière**, immédiatement après (`audio.currentTime = 2.5`) :

```json
{ "phaseId": "probe-a", "phaseIndex": 0, "absoluteTimeSeconds": 2.5001, "phaseProgress": 0.50002, "timelineRevision": 5 }
```

`timelineRevision` : `4 → 5`, soit à nouveau **+1 exactement**. Aucune phase intermédiaire (`probe-b`, le gap, `probe-c`) n'a été « rejouée » — la résolution est directe, exactement comme l'exige le contrat.

## 6. Test E — Pause / reprise

Pause réelle (attente du véritable événement natif `pause`) :

```json
{ "phaseId": "probe-c", "phaseIndex": 2, "absoluteTimeSeconds": 15.772865, "phaseProgress": 0.471608, "playbackState": "paused", "timelineRevision": 5 }
```

Deuxième lecture, 2 secondes réelles plus tard : **valeurs strictement identiques** (`absoluteTimeSeconds: 15.772865`, `phaseProgress: 0.471608`) — gel exact, Δ = 0.

Reprise réelle (attente du véritable événement natif `play`) :

```json
{ "absoluteTimeSeconds": 15.776377, "playbackState": "playing", "timelineRevision": 5 }
```

La reprise repart de `15.776` (delta ≈ 0.0035s, le temps du round-trip lui-même) — **pas** un saut vers un temps mural qui aurait inclus les ~2s d'attente. `timelineRevision` inchangé (5) — pause/reprise ne sont jamais des discontinuités.

## 7. Test F — Restart

Piste au-delà de 5 secondes (`audioTimeBefore: 67.28s`), restart déclenché via le comportement réel de « Previous track » (invoqué directement sur la valeur du contexte runtime du player, retrouvée par traversée de fiber React depuis `Drift3DCanvas` — même technique de lecture déjà validée dans `DRIFT-IV-SYS-00`/`DRIFT-IV-SYS-10` ; aucune modification de code applicatif). Lecture **immédiatement** après l'appel, dans le même script :

```json
{
  "before": { "timelineRevision": 6 },
  "afterImmediate": {
    "phaseId": "probe-a", "phaseIndex": 0,
    "absoluteTimeSeconds": 0,
    "phaseProgress": 0,
    "sourceSlug": "foolfoule",
    "playbackState": "seeking",
    "timelineRevision": 7
  }
}
```

`timelineRevision` : `6 → 7`, **+1 exactement**. `absoluteTimeSeconds = 0` exact. `sourceSlug` inchangé (`foolfoule`) — confirme un restart, pas un changement de track. Le resolver n'a exécuté aucun reset impératif de son côté : il a simplement constaté le nouveau temps absolu fourni par l'horloge audio.

## 8. Test G — Source change

Track suivante déclenchée explicitement (`playNext`, même technique d'invocation directe). Lecture immédiate :

```json
{
  "before": { "sourceSlug": "foolfoule", "timelineRevision": 7 },
  "afterImmediate": {
    "phaseId": "probe-a", "phaseIndex": 0,
    "absoluteTimeSeconds": 0, "durationSeconds": 20,
    "sourceSlug": "jazzypling",
    "playbackState": "idle",
    "timelineRevision": 8
  }
}
```

`sourceSlug` : `foolfoule → jazzypling`. `timelineRevision` : `7 → 8`, **+1 exactement**. `absoluteTimeSeconds` revient à `0`, `phaseId = probe-a`. `durationSeconds: 20` : la durée réelle de `jazzypling` n'était pas encore chargée à cet instant précis (métadonnées natives pas encore résolues) — le repli documenté (fin de la dernière phase, `20`) s'est appliqué correctement, exactement comme prévu par le contrat (§6 de `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md`). `playbackState: "idle"` — transitoire, confirmé passé à `"playing"` juste après (vérifié séparément, `currentTime` de `jazzypling` avançant normalement).

**La timeline synthétique reste volontairement source-agnostique** : aucune logique de ce lot ne sait qu'une track a changé — le futur resolver track-local possédera sa propre politique d'activation et de correspondance de source.

## 9. Test H — Cleanup et remount

`jazzypling` en cours de lecture réelle (`currentTime` avançant). Référence conservée : `const oldProbe = window.__drift3dCueResolver`.

Navigation SPA réelle hors de `/drift/` :

```json
{ "url": "/", "canvasCount": 0, "audioCount": 1, "hasProbe": false, "audioState": { "src": "jazzypling.mp3", "paused": false, "currentTime": 27.27 } }
```

`window.__drift3dCueResolver` absent, lecture globale ininterrompue.

Retour SPA réel sur `/drift/` :

```json
{ "url": "/drift/", "canvasCount": 1, "audioCount": 1, "hasProbe": "object", "isNewObject": true, "audioState": { "src": "jazzypling.mp3", "paused": false, "currentTime": 45.17 } }
```

`window.__drift3dCueResolver !== oldProbe` confirmé — nouvelle instance de probe. `audioCount` toujours `1`. Aucun autoplay déclenché par Drift lui-même (la lecture qui continue est celle déjà en cours avant l'entrée dans `/drift/`).

## 10. Test I — Fallbacks

**Reduced motion** (`window.matchMedia` substitué, remontage SPA) :

```json
{ "canvasCount": 0, "audioCount": 1, "hasProbe": false }
```

Texte rendu confirmé : « REDUCED MOTION — The 3D room stays closed today. »

**No WebGL** (`HTMLCanvasElement.prototype.getContext` substitué, remontage SPA) :

```json
{ "canvasCount": 0, "audioCount": 1, "hasProbe": false }
```

Texte rendu confirmé : « NO WEBGL — This browser cannot open the 3D room. »

**Aucun Cue Resolver track-local n'existe encore** — ces fallbacks ne prouvent que l'absence de résidu du harness générique, pas le fonctionnement d'un futur resolver track-local (qui n'est pas livré par ce lot).

---

## 11. Preuve structurelle

`AUTOMATED_STRUCTURAL_EVIDENCE` — confirmé par lecture de code, pas par une mesure runtime :

```powershell
git grep -n "setInterval|setTimeout|requestAnimationFrame|useFrame" -- src/lib/drift3dCueResolver.ts
# aucune occurrence

git grep -in "eux-gainent|cadence-lock|wave-ritual|deviation" -- src/lib/drift3dCueResolver.ts src/components/drift-3d/Drift3DCanvas.tsx
# aucune occurrence
```

`src/lib/drift3dCueResolver.ts` n'importe ni React ni aucune API DOM (uniquement `Drift3DAudioClockSnapshot`/`Drift3DAudioPlaybackState`/`readDrift3DAudioClockTime` depuis `drift3dAudioClock.ts`). Le seul `useEffect` ajouté à `Drift3DCanvas.tsx` pour ce lot n'installe qu'un objet figé (`Object.freeze`) et ne crée ni `useFrame`, ni timer, ni état React de progression rapide.

---

## 12. Console

Voir « Incident d'environnement » en tête de document : 4 erreurs `Failed to fetch RSC payload` liées au redémarrage du serveur de développement, sans rapport avec le code livré. **Zéro erreur** observée pendant les tests A à I eux-mêmes (post-redémarrage).

---

## 13. Limites

- Aucune Cue Map de track réelle n'est testée ni livrée — la timeline `probe-a`/`probe-b`/`probe-c` est entièrement synthétique et n'a aucune signification artistique.
- Le Test C dépend du chargement réel des métadonnées audio (`durationSeconds`) — observé correct pour FOOLFOULE (186.45s) ; pour `jazzypling` juste après un `source-change`, la durée n'était pas encore résolue et le repli documenté (fin de la dernière phase) s'est appliqué, comme prévu.
- Un incident d'environnement (serveur de développement devenu non réactif après plusieurs heures d'activité continue) a nécessité un redémarrage en cours de session — voir note en tête de document. N'affecte aucune conclusion ci-dessus, toutes obtenues après ce redémarrage.
- Aucun fichier `.png` committé sous ce répertoire — même limite d'environnement que les lots précédents.

---

## 14. Décision de gate

| Critère | Statut |
|---|---|
| timeline validation déterministe | PASS |
| frontières temporelles exactes | PASS |
| gaps supportés | PASS |
| progressions toujours bornées 0..1 | PASS |
| résolution fondée uniquement sur le temps absolu | PASS |
| même temps absolu = même résolution | PASS (`resolveAt` ≡ `resolveCurrent`) |
| seek avant/arrière reconstruit directement | PASS |
| pause gèle exactement la résolution | PASS |
| restart revient directement au début | PASS |
| `timelineRevision` exposée sans machine à états interne | PASS |
| source change observable sans logique track-specific | PASS |
| aucun Cue Map réel introduit | PASS |
| aucune phase artistique introduite | PASS |
| aucun `useFrame`/timer/state rapide ajouté | PASS (preuve structurelle) |
| probe dev supprimé au démontage | PASS |
| fallbacks sans probe résiduel | PASS |
| player global toujours unique | PASS |
| lint et build passent | PASS |

**Décision : `DRIFT-IV-SYS-20` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-30` → `NEXT_AFTER_MERGE`.**
