# DRIFT-IV-SYS-30 — Signature arbitration evidence report

- **Date :** 2026-07-19
- **Méthode :** session Chrome réelle (Claude Browser pane), navigation SPA (clics sur les `<Link>` réels du site), serveur `next dev` local. Candidats entièrement synthétiques (`probe-*`) — **aucune signification artistique**, jamais présentés comme une signature MISWAY réelle.

Données brutes complètes : [`signature-arbitration-evidence.json`](./signature-arbitration-evidence.json).

---

## Note méthodologique : le harness ne dépend pas du montage react-three-fiber

Comme le probe du Cue Resolver (`DRIFT-IV-SYS-20`), `window.__drift3dSignatureArbitration` est installé depuis `Drift3DCanvas.tsx`, hors de l'arbre react-three-fiber. Il a été directement lisible dès le premier chargement de `/drift/`, sans traversée de fiber ni forçage de frame.

## Incident d'environnement rencontré et résolu (sans rapport avec le code livré)

En cours de test du fallback reduced-motion, le serveur `next dev` (processus long-vécu de cette session) s'est arrêté de répondre puis a cessé d'écouter sur le port 3000 (`curl` : connexion refusée). Diagnostiqué comme une surcharge/instabilité de processus long-vécu, comme lors de `DRIFT-IV-SYS-20` — sans rapport avec le code de ce lot. Résolu par redémarrage du serveur ; les deux tests de fallback ont ensuite été rejoués intégralement sur le serveur frais, avec succès. Deux erreurs console (« Failed to fetch RSC payload… Falling back to browser navigation ») correspondent à cet épisode — **aucune erreur console** observée après le redémarrage, pour l'ensemble des scénarios A à J rejoués.

---

## 1. Résultat par scénario

| Scénario | Résultat |
|---|---|
| Test A — Validation des candidats | PASS — candidats valides → 0 issue ; id vide/dupliqué/priorité non finie chacun détecté ; priorité négative jamais signalée |
| Test B — Priorité absolue active-track | PASS — `active-track` gagne malgré une priorité numérique extrêmement défavorable, indépendamment de l'ordre d'entrée |
| Test C — Priorité numérique intra-ownerKind | PASS — le candidat de plus haute priorité gagne, côté `active-track` comme côté `world` |
| Test D — Tie-break déterministe | PASS — `probe-alpha` gagne dans les deux ordres d'entrée |
| Test E — Éligibilité et absence de gagnant | PASS — candidat éligible inférieur gagne contre un candidat inéligible supérieur ; aucun éligible → `null`/`none` ; liste vide → identique |
| Test F — Une seule signature majeure | PASS — exactement un `activeSignatureId` avec 5 candidats éligibles |
| Test G — Boucles de vie non affectées | PASS — fixture jamais transmise, référence et valeur sérialisée identiques après un appel d'arbitrage ; API du probe limitée à `validate`/`arbitrate` |
| Test H — Cleanup logique | PASS — un gagnant réel, puis liste vide, puis tout inéligible → `null`/`none` immédiat dans les deux cas |
| Test I — Cleanup/remount du probe | PASS — probe absent au démontage, nouvelle instance distincte au remontage, aucun autoplay |
| Test J — Fallbacks | PASS — `canvasCount = 0`, probe absent, `audioCount = 1` dans les deux cas |

---

## 2. Test A — Validation des candidats

```json
[
  { "id": "probe-world", "ownerKind": "world", "eligible": true, "priority": 100 },
  { "id": "probe-track", "ownerKind": "active-track", "eligible": true, "priority": -10 }
]
```

`window.__drift3dSignatureArbitration.validate(candidates)` → `[]`.

| Fixture | Issue détectée |
|---|---|
| id vide | `empty-id` |
| id dupliqué | `duplicate-id` |
| priorité non finie (`Infinity`) | `non-finite-priority` |
| priorité négative (`-50`) | **aucune** — explicitement autorisée |

## 3. Test B — Priorité absolue active-track

```json
{
  "orderA": { "candidates": ["world priority=1000000", "active-track priority=-1000000"], "winner": "probe-track", "index": 1 },
  "orderB": { "candidates": ["active-track priority=-1000000", "world priority=1000000"], "winner": "probe-track", "index": 0 }
}
```

Dans les deux ordres, `probe-track` (`active-track`, priorité `-1 000 000`) gagne contre `probe-world` (`world`, priorité `1 000 000`) — la précédence de `ownerKind` domine absolument la priorité numérique.

## 4. Test C — Priorité numérique intra-ownerKind

Trois candidats `active-track` (priorités 1, 10, 5) → gagnant `probe-b` (priorité 10). Même résultat avec trois candidats `world` (priorités 1, 10, 5) → gagnant `probe-b` (priorité 10, `ownerKind: world`).

## 5. Test D — Tie-break déterministe

```json
{
  "orderA": { "candidates": ["probe-beta priority=5", "probe-alpha priority=5"], "winner": "probe-alpha", "index": 1 },
  "orderB": { "candidates": ["probe-alpha priority=5", "probe-beta priority=5"], "winner": "probe-alpha", "index": 0 }
}
```

`probe-alpha` gagne dans les deux ordres (`"alpha" < "beta"` par code unit), sans `localeCompare` : le gagnant (`winner`), son `ownerKind`, sa `priority` et la décision d'arbitrage sont indépendants de l'ordre d'entrée. `index` (`activeCandidateIndex`), lui, suit intentionnellement la position du gagnant dans le tableau fourni — `1` en `orderA`, `0` en `orderB` — et change donc avec la permutation ; ce n'est pas une preuve d'ordre-dépendance du tie-break, seulement le reflet attendu de la position dans le tableau appelant.

## 6. Test E — Éligibilité et absence de gagnant

- **Cas 1** : candidat priorité `999` `eligible: false` + candidat priorité `1` `eligible: true` → le candidat éligible (`probe-low-eligible`) gagne.
- **Cas 2** : tous les candidats `eligible: false` → `activeSignatureId: null`, `decision: "none"`.
- **Cas 3** : liste vide `[]` → résultat identique au cas 2.

## 7. Test F — Une seule signature majeure

5 candidats (3 `world` éligibles, priorités 5/8/3 ; 2 `active-track` éligibles, priorités -100/-50) → résultat :

```json
{ "activeSignatureId": "probe-track-2", "activeOwnerKind": "active-track", "activePriority": -50, "candidateCount": 5, "eligibleCandidateCount": 5, "decision": "active-track" }
```

**Exactement un** `activeSignatureId` (chaîne unique, jamais une collection) — `probe-track-2` gagne car `active-track` domine tous les candidats `world`, y compris ceux de priorité numérique bien supérieure.

## 8. Test G — Boucles de vie non affectées

```ts
const lifeLoops = [{ id: "probe-loop-a" }, { id: "probe-loop-b" }];
// jamais transmis à arbitrate(...)
```

Après un appel d'arbitrage sans rapport : `lifeLoops === beforeRef` → `true` ; `JSON.stringify(lifeLoops) === beforeSerialized` → `true`. Surface d'API du probe : `Object.keys(window.__drift3dSignatureArbitration)` → `["arbitrate", "validate"]` uniquement — aucune méthode `suppressLifeLoops` ou équivalente. **Preuve architecturale et comportementale** : l'API n'accepte que des `Drift3DSignatureCandidate[]` et ne peut structurellement pas affecter une liste qui ne lui est jamais transmise. Aucune boucle de vie artistique réelle n'a été testée — cette fixture est entièrement synthétique.

## 9. Test H — Cleanup logique

```json
{
  "withWinner": { "activeSignatureId": "probe-track", "decision": "active-track" },
  "afterEmpty": { "activeSignatureId": null, "decision": "none" },
  "afterAllIneligible": { "activeSignatureId": null, "decision": "none" }
}
```

Aucun gagnant persistant : après un appel avec un vrai gagnant, un appel avec une liste vide (ou tous les candidats rendus inéligibles) efface immédiatement le résultat — sans reset impératif nécessaire dans le service.

## 10. Test I — Cleanup/remount du probe

Référence conservée : `const oldProbe = window.__drift3dSignatureArbitration`. Navigation SPA hors de `/drift/` :

```json
{ "url": "/", "canvasCount": 0, "audioCount": 1, "hasProbe": false, "audioState": { "paused": true, "currentTime": 0 } }
```

Retour SPA sur `/drift/` :

```json
{ "url": "/drift/", "canvasCount": 1, "audioCount": 1, "hasProbe": "object", "isNewObject": true, "audioState": { "paused": true, "currentTime": 0 } }
```

`window.__drift3dSignatureArbitration !== oldProbe` confirmé — nouvelle instance de probe. Aucun autoplay (état audio inchangé, idle).

## 11. Test J — Fallbacks

**Reduced motion** (`window.matchMedia` substitué, remontage SPA) :

```json
{ "canvasCount": 0, "audioCount": 1, "hasProbe": false }
```

Texte rendu : « REDUCED MOTION — The 3D room stays closed today. »

**No WebGL** (`HTMLCanvasElement.prototype.getContext` substitué, remontage SPA) :

```json
{ "canvasCount": 0, "audioCount": 1, "hasProbe": false }
```

Texte rendu : « NO WEBGL — This browser cannot open the 3D room. »

**Aucune signature artistique réelle n'existe encore** — ces fallbacks ne prouvent que l'absence de résidu du harness générique, pas le fonctionnement d'une future signature artistique sous fallback.

---

## 12. Preuve structurelle

`AUTOMATED_STRUCTURAL_EVIDENCE` — confirmé par lecture de code, pas par une mesure runtime :

```powershell
git grep -n "setInterval|setTimeout|requestAnimationFrame|useFrame" -- src/lib/drift3dSignatureArbitration.ts
# aucune occurrence

git grep -in "eux-gainent|eteeaooete|foolfoule|jazzypling|cadence-lock|wave-ritual|deviation" -- src/lib/drift3dSignatureArbitration.ts
# aucune occurrence

git grep -n "drift3dAudioClock|drift3dCueResolver|drift3dSceneLifecycle|@/lib/tracks" -- src/lib/drift3dSignatureArbitration.ts
# aucune occurrence
```

`src/lib/drift3dSignatureArbitration.ts` n'importe ni React, ni DOM, ni aucun autre module `drift3d*`/`tracks.ts`. Le diff de `Drift3DCanvas.tsx` pour ce lot est une addition pure (41 lignes ajoutées, 0 supprimée) ; une recherche du diff pour `useState`/`useFrame`/`activeSignature`/`signaturePhase` ne retourne aucune occurrence — aucun état React ajouté pour une signature active, aucun `useFrame` ajouté, aucun changement visuel dans aucune scène.

---

## 13. Console

Voir « Incident d'environnement » en tête de document : 2 erreurs `Failed to fetch RSC payload` liées au redémarrage du serveur de développement, sans rapport avec le code livré. **Zéro erreur** observée pendant les dix scénarios de preuve eux-mêmes (post-redémarrage).

---

## 14. Limites

- Aucune signature artistique réelle n'est testée ni livrée — tous les candidats (`probe-world`, `probe-track`, `probe-a/b/c`, `probe-alpha/beta`, `probe-loop-a/b`, etc.) sont entièrement synthétiques.
- Un incident d'environnement (serveur de développement devenu non réactif puis arrêté après plusieurs heures d'activité continue, deuxième occurrence après celle de `DRIFT-IV-SYS-20`) a nécessité un redémarrage en cours de session — voir note en tête de document. N'affecte aucune conclusion ci-dessus, toutes obtenues après ce redémarrage.
- Aucun fichier `.png` committé sous ce répertoire — même limite d'environnement que les lots précédents.

---

## 15. Décision de gate

| Critère | Statut |
|---|---|
| au maximum une signature majeure gagne | PASS |
| `active-track` domine `world` sans exception | PASS |
| priorité numérique fonctionne à `ownerKind` égal | PASS |
| tie-break déterministe indépendant de l'ordre d'entrée | PASS |
| candidats inéligibles ignorés | PASS |
| aucun éligible = aucun gagnant | PASS |
| aucune persistance du winner | PASS |
| liste vide nettoie immédiatement l'arbitrage | PASS |
| boucles de vie hors du canal d'arbitrage | PASS (preuve architecturale + comportementale) |
| aucune logique track-specific | PASS |
| aucun slug | PASS |
| aucune Cue Map | PASS |
| aucune phase artistique | PASS |
| aucun mapping cue → signature | PASS |
| aucun `useFrame`/timer/state rapide | PASS (preuve structurelle) |
| probe supprimé au démontage | PASS |
| fallbacks sans probe résiduel | PASS |
| player global toujours unique | PASS |
| lint et build passent | PASS |

**Décision : `DRIFT-IV-SYS-30` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-40` → `NEXT_AFTER_MERGE`.**
