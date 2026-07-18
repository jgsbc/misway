# DRIFT-IV-SYS-10 — Scene lifecycle evidence report

- **Date :** 2026-07-18
- **Méthode :** session Chrome réelle (Claude Browser pane), navigation SPA exclusivement (clics sur les `<Link>` réels du site), serveur `next dev` local.

Données brutes complètes : [`scene-lifecycle-evidence.json`](./scene-lifecycle-evidence.json).

---

## Limite d'environnement rencontrée (et contournée deux fois)

Comme documenté dans `docs/DRIFT_3D_RUNTIME_BASELINE.md` et `docs/evidence/DRIFT-IV-SYS-00/audio-clock-evidence.md`, cet onglet automatisé rapporte `document.hidden === true` / `visibilityState: "hidden"` en continu, indépendamment du focus. Deux conséquences distinctes, deux contournements distincts et honnêtement étiquetés :

1. **`window.__drift3dLifecycle` (et `window.__drift3dAudioClock`) restent `undefined`** pendant toute la session : ces probes sont installés par un `useEffect` à l'intérieur de `Drift3DScene`, elle-même enfant du `Canvas` react-three-fiber — ce montage interne reste suspendu tant qu'aucune frame n'est produite (`requestAnimationFrame` jamais déclenché). **Contournement :** lecture directe de la ref `sceneLifecycleRef` (qui vit dans `Drift3DCanvas`, un composant React ordinaire, **hors** de l'arbre react-three-fiber) par traversée du fiber React depuis un nœud DOM stable (`[aria-label="Drift listening world"]`, rendu par `Drift3DCanvas` lui-même, jamais par le contenu interne du Canvas) — technique identique à celle validée pour l'horloge audio dans `DRIFT-IV-SYS-00`. Ceci ne nécessite et ne modifie aucun code applicatif.
2. **`document.visibilityState` ne peut pas passer naturellement à `"visible"`** dans cette session pour exercer réellement `IDLE → ACTIVE` / `PAUSED ↔ ACTIVE`. **Contournement, distinctement étiqueté `FORCED_VISIBILITY_PATH`** dans les sections ci-dessous : `Object.defineProperty(document, "hidden"/"visibilityState", { get: () => ... })` suivi d'un `document.dispatchEvent(new Event("visibilitychange"))` réel — ceci déclenche le **vrai** listener `visibilitychange` installé par `Drift3DCanvas` (le même code que celui qui s'exécuterait sur un vrai changement de visibilité de système), sans modifier ni contourner la logique applicative elle-même. Cette technique est de la même famille que les overrides `MediaQueryList`/`getContext` déjà documentés et acceptés dans `docs/DRIFT_3D_RUNTIME_BASELINE.md` §6.4/§6.5 pour les fallbacks.

Le montage initial lui-même (`UNMOUNTED → IDLE`), la navigation SPA, le démontage de route et le nettoyage des probes sont en revanche des résultats **réels, non forcés** : ils ne dépendent ni du rendu d'une frame ni de la visibilité du document.

---

> ⚠️ **Requalification (round de correction) :** les valeurs `mountRevision: 2`, `resetRevision: 1` et `lastResetReason: "route-unmount"` mesurées ci-dessous en §2 (dès le tout premier montage, avant toute navigation réelle) et propagées dans les lectures dépendantes de §4/§5 restent affichées telles que mesurées à l'origine (aucune donnée historique n'est supprimée), mais sont requalifiées `PRE_FIX_FINDING — STRICT_MODE_PHANTOM_ROUTE_UNMOUNT` : ce qui était présenté comme une preuve positive d'idempotence sous React 18 Strict Mode était en réalité un **faux `route-unmount` logique**, produit par le cleanup simulé du cycle dev `setup → cleanup → setup` sur la même instance. Le cleanup simulé appliquait synchronement `reset(reason: "route-unmount")` alors qu'aucun démontage réel n'avait eu lieu. Corrigé (mécanisme `lifecycleEffectGenerationRef` + décision différée en microtask, voir `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md`). Les résultats corrigés, rejoués en direct, sont en section 12.

---

## 1. Résultat par scénario

| Scénario | Résultat |
|---|---|
| §10.1 Montage initial (réel, onglet réellement `hidden`) | `state: IDLE` (pas `ACTIVE`, honnêtement non fabriqué), 1 `<canvas>`, 1 `<audio>` — **mais** `mountRevision`/`resetRevision`/`lastResetReason` initiaux requalifiés `PRE_FIX_FINDING — STRICT_MODE_PHANTOM_ROUTE_UNMOUNT` (§12 Test A pour le résultat corrigé) |
| §10.2 Pause/reprise de visibilité (`FORCED_VISIBILITY_PATH`) | PASS — `ACTIVE → PAUSED → ACTIVE`, `resetRevision` inchangé, `audioCount` toujours 1, lecture globale inchangée |
| §10.3 Démontage de route | PASS — `state: UNMOUNTED`, `lastResetReason: "route-unmount"`, `resetRevision` +1, `canvasCount: 0`, `audioCount: 1`, player global et ambiance de piste inchangés, 5 globals dev absents |
| §10.4 Retour sur Drift | PASS — nouvelle instance, `canvasCount: 1`, `audioCount: 1`, aucun probe dupliqué, aucun autoplay |
| §10.5 Cycles répétés (3×) | PASS — `canvasCount` correct à chaque étape, `audioCount` toujours 1, aucune erreur console, aucune accumulation |
| §10.6 Disposal terrain | `AUTOMATED_STRUCTURAL_EVIDENCE` — confirmé par lecture de code, non chronométré en direct |
| §10.7 Fallbacks | PASS — reduced-motion et no-WebGL déclenchés réellement, `canvasCount: 0`, aucun global résiduel dans les deux cas |

---

## 2. §10.1 — Montage initial (réel)

Sur `/drift/`, onglet réellement `document.hidden === true` :

```json
{
  "hidden": true,
  "visibilityState": "hidden",
  "canvasCount": 1,
  "audioCount": 1
}
```

Lecture de `sceneLifecycleRef` par traversée de fiber (voir méthode ci-dessus) :

```json
{
  "state": "IDLE",
  "previousState": "UNMOUNTED",
  "lifecycleRevision": 5,
  "mountRevision": 2,
  "resetRevision": 1,
  "lastEvent": "mount",
  "lastResetReason": "route-unmount",
  "changedAtMs": 1021
}
```

`state: "IDLE"` (pas `"ACTIVE"`) est le résultat honnête attendu : le document est réellement invisible, donc l'effet de montage n'émet pas `activate`. Cette donnée historique est conservée telle quelle, mais son interprétation d'origine était erronée.

**`PRE_FIX_FINDING — STRICT_MODE_PHANTOM_ROUTE_UNMOUNT`.** `mountRevision: 2` et `resetRevision: 1` (au lieu de `1` et `0`) provenaient du double-montage de développement de React 18 Strict Mode (`mount → cleanup → mount`, sur la même instance) : un premier montage réel (`mountRevision` 0→1), immédiatement suivi du cleanup strict-mode qui appliquait alors **synchronement** la séquence complète de démontage de route (`reset` avec `resetReason: "route-unmount"`, `resetRevision` 0→1, puis `reset-complete`, puis `unmount`) **avant même qu'un second montage réel n'ait lieu**, puis un second montage réel (`mountRevision` 1→2) repartant de cet état `UNMOUNTED` fictif. Ce qui était présenté comme « confirmant en conditions réelles l'idempotence décrite en §12 du contrat » était en réalité la preuve du bug inverse : le cleanup simulé de Strict Mode n'aurait jamais dû produire un `route-unmount` logique puisqu'aucun démontage réel n'avait eu lieu. Corrigé via `lifecycleEffectGenerationRef` (la décision de transition `route-unmount` est désormais différée en microtask et annulée si un nouveau `setup` de la même instance s'est déjà déclaré entre-temps). Voir §12 Test A pour le résultat corrigé : `mountRevision = 1`, `resetRevision = 0`, `lastResetReason = null` après stabilisation du montage, avant toute navigation réelle.

`FORCED_VISIBILITY_PATH` — pour vérifier que le chemin `IDLE → ACTIVE` fonctionne réellement (pas seulement par lecture de code), un override de visibilité contrôlé a été appliqué et un vrai événement `visibilitychange` déclenché :

```json
{
  "state": "ACTIVE",
  "previousState": "IDLE",
  "lifecycleRevision": 6,
  "mountRevision": 2,
  "resetRevision": 1,
  "lastEvent": "activate",
  "lastResetReason": "route-unmount",
  "changedAtMs": 33088.7
}
```

`IDLE → ACTIVE` confirmé, `lifecycleRevision` +1, `mountRevision`/`resetRevision` inchangés (comme attendu — `activate` n'est ni un mount ni un reset).

## 3. §10.2 — Pause et reprise de visibilité (`FORCED_VISIBILITY_PATH`)

Depuis l'état `ACTIVE` ci-dessus, override vers `hidden` + `visibilitychange` réel :

```json
{ "state": "PAUSED", "previousState": "ACTIVE", "lifecycleRevision": 7, "resetRevision": 1, "lastEvent": "pause" }
```

`canvasCount`/`audioCount` toujours `1`/`1` immédiatement après.

Puis override vers `visible` + `visibilitychange` réel :

```json
{ "state": "ACTIVE", "previousState": "PAUSED", "lifecycleRevision": 8, "resetRevision": 1, "lastEvent": "resume" }
```

`resetRevision` reste `1` sur tout le cycle visible→hidden→visible (pause/reprise ne sont jamais des resets). La lecture globale (source et état de l'unique `<audio>`) n'a jamais été affectée par ce cycle — le player global n'est référencé nulle part dans l'effet de lifecycle de `Drift3DCanvas` (vérifié par lecture de code, §12 du contrat).

## 4. §10.3 — Démontage de route

**Note de requalification :** les chiffres `resetRevision`/`mountRevision`/`lastResetReason` de cette section partent d'une baseline (`resetRevision: 1`) déjà entachée par le `PRE_FIX_FINDING` de §2 — la mesure du delta (`1 → 2`, soit +1) reste arithmétiquement correcte et démontrait déjà qu'un seul démontage réel ne comptait qu'une seule fois, mais la baseline elle-même ne représentait pas un état propre. Voir §12 Test C pour le rejeu sur une baseline propre (`resetRevision: 0 → 1`).

Précondition : ambiance diégétique activée par un geste utilisateur réel (clic sur « Activer l'ambiance sonore », label confirmé passé à « Couper l'ambiance sonore » — un vrai `AudioContext` a été créé). Référence à la ref de lifecycle capturée avant navigation (équivalent de `const heldLifecycleProbe = window.__drift3dLifecycle`, adapté à la ref sous-jacente puisque le probe `window.__drift3dLifecycle` lui-même n'était pas atteignable dans cette session — voir limite ci-dessus) :

```json
{ "state": "ACTIVE", "previousState": "PAUSED", "lifecycleRevision": 8, "resetRevision": 1, "lastEvent": "resume" }
```

État de l'`<audio>` global avant navigation : `src: entry-ambient.mp3`, `paused: true`, `currentTime: 0` (idle, aucune piste explicitement lancée — conforme à « aucun autoplay »).

Navigation SPA réelle (clic sur le lien `<Link href="/">`) vers `/`. Résultat, lu sur la ref conservée :

```json
{
  "state": "UNMOUNTED",
  "previousState": "IDLE",
  "lifecycleRevision": 11,
  "mountRevision": 2,
  "resetRevision": 2,
  "lastEvent": "unmount",
  "lastResetReason": "route-unmount",
  "changedAtMs": 110029.3
}
```

- `state: "UNMOUNTED"` ✅
- `lastResetReason: "route-unmount"` ✅
- `resetRevision` : `1 → 2`, soit **+1 exactement** ✅
- `canvasCount: 0`, `audioCount: 1` ✅
- État de l'`<audio>` global **strictement inchangé** : `src: entry-ambient.mp3`, `paused: true`, `currentTime: 0` — le player global n'a pas été touché par le démontage de `/drift/` ✅
- Les cinq globals de développement sont tous absents (`in window` → `false` pour chacun) :

```json
{
  "__drift3dLifecycle": false,
  "__drift3dAudioClock": false,
  "__drift3dRender": false,
  "__drift3dDebug": false,
  "__drift3dTeleport": false
}
```

L'arrêt effectif de l'`AudioContext` de l'ambiance diégétique (`Drift3DAmbienceEngine.stop()` → `context.close()`) n'est pas observable depuis l'extérieur du composant démonté (aucune API n'énumère les `AudioContext` actifs d'une page) — confirmé par lecture de code (le cleanup de `Drift3DCanvas` appelle inconditionnellement `ambienceEngineRef.current?.stop()` avant la transition `reset-complete`), classé `AUTOMATED_STRUCTURAL_EVIDENCE` pour cette sous-partie précise. La disparition de l'intégralité du sous-arbre (bouton d'ambiance y compris, `canvasCount: 0`) confirme que le composant propriétaire de l'`AudioContext` a bien été démonté dans son ensemble.

## 5. §10.4 — Retour sur Drift

**Note de requalification :** `mountRevision: 2`/`resetRevision: 1` ci-dessous héritent de la même baseline entachée que §4. Voir §12 Test D pour la preuve, sur une instance fraîche non affectée, que `mountRevision`/`resetRevision` repartent bien à `1`/`0` et que `lastResetReason` repart à `null` — la nouvelle instance n'hérite d'aucun faux reset de l'instance précédente.

Navigation SPA vers `/drift/` :

```json
{ "url": "/drift/", "canvasCount": 1, "audioCount": 1 }
```

Nouvelle instance de lifecycle (nouvelle ref, nouveau jeton propriétaire de probe) :

```json
{
  "state": "ACTIVE",
  "previousState": "IDLE",
  "lifecycleRevision": 7,
  "mountRevision": 2,
  "resetRevision": 1,
  "lastEvent": "activate",
  "lastResetReason": "route-unmount",
  "changedAtMs": 134580.9
}
```

Note méthodologique honnête : cette nouvelle instance passe directement à `ACTIVE` (et non `IDLE`, contrairement au tout premier montage de §10.1) parce que l'override `document.hidden → false` posé pour le `FORCED_VISIBILITY_PATH` (§2) reste actif pour le reste de la session — `document` n'est jamais rechargé par une navigation SPA. Ce n'est donc pas un montage naturellement visible, mais la conséquence attendue et transparente de la technique de contournement déjà déclarée. Le calcul `lifecycleRevision: 7`/`mountRevision: 2`/`resetRevision: 1` se vérifie exactement par la même séquence de double-montage Strict Mode qu'en §10.1, à ceci près que chacune des deux invocations de l'effet voit désormais `document.visibilityState === "visible"` et ajoute donc son propre `activate` (5 transitions réelles au lieu de 4, d'où `lifecycleRevision: 7` et non `6`).

Ni globals dupliqués, ni ambiance déjà active (`aria-label` revenu à « Activer l'ambiance sonore », une piste fraîche), ni entrée clavier/pointeur bloquée (aucune interaction clavier/tactile n'a été laissée en vol dans ce test). Aucun autoplay : `<audio>` toujours `paused: true`, `currentTime: 0`.

## 6. §10.5 — Cycles répétés

Trois cycles complets `/drift/ → / → /drift/` effectués après le test de démontage de route ci-dessus (quatre transitions de démontage/remontage au total en comptant celui de §10.3-§10.4) :

| Cycle | Sur `/` | Sur `/drift/` |
|---|---|---|
| 1 | `canvasCount: 0`, `audioCount: 1`, 5 globals absents | `canvasCount: 1`, `audioCount: 1` |
| 2 | `canvasCount: 0`, `audioCount: 1` | `canvasCount: 1`, `audioCount: 1` |
| 3 | `canvasCount: 0`, `audioCount: 1`, 5 globals absents | `canvasCount: 1`, `audioCount: 1` |

`audioCount` reste strictement `1` sur toute la séquence (jamais 0, jamais 2) ; `<audio>` reste `paused: true`/`currentTime: 0` à chaque relecture (pas d'ambiance ni de lecture résiduelle empilée). Aucune erreur console observée sur l'ensemble de la session (`read_console_messages` filtré erreurs, vérifié à plusieurs reprises, y compris après les trois cycles).

## 7. §10.6 — Disposal terrain

`AUTOMATED_STRUCTURAL_EVIDENCE` — non chronométré en session live (aucune API n'expose les appels `.dispose()` internes de Three.js sans instrumenter le code applicatif lui-même, ce que ce lot évite délibérément). Confirmé par lecture directe du code livré :

```ts
// src/components/drift-3d/Drift3DScene.tsx — useDriftTerrainTexture()
useEffect(() => {
  return () => {
    texture?.dispose();
  };
}, [texture]);
```

```ts
// src/components/drift-3d/Drift3DScene.tsx — DriftTerrainMesh()
useEffect(() => {
  return () => {
    geometry.dispose();
  };
}, [geometry]);
```

Les deux ressources (`THREE.CanvasTexture`, `THREE.PlaneGeometry`) sont produites une seule fois par instance (`useMemo`, dépendances `[]`), donc chaque `useEffect` de disposal s'exécute exactement une fois par démontage — ni recréation, ni double-dispose sur un changement de lifecycle ou de visibilité (aucune de ces dépendances ne varie avec `sceneLifecycleRef`/`sceneRuntimeActive`).

## 8. §10.7 — Fallbacks

**Reduced motion** — `window.matchMedia` substitué pour forcer `matches: true` sur `(prefers-reduced-motion: reduce)`, puis remontage via navigation SPA (`/` → `/drift/`) :

```json
{ "canvasCount": 0, "audioCount": 1, "__drift3dLifecycle": false, "__drift3dAudioClock": false }
```

Texte rendu confirmé : « The 3D room stays closed today. »

**No WebGL** — `HTMLCanvasElement.prototype.getContext` substitué pour retourner `null` sur toute demande de contexte `webgl*`, override reduced-motion retiré, puis remontage via navigation SPA :

```json
{ "canvasCount": 0, "audioCount": 1, "__drift3dLifecycle": false, "__drift3dAudioClock": false }
```

Texte rendu confirmé : « NO WEBGL — This browser cannot open the 3D room. »

Dans les deux cas : aucun `<canvas>`, aucun lifecycle de scène monté (les deux probes dev restent absents), `audioCount` toujours `1` (le player global reste disponible même quand le monde 3D est indisponible).

---

## 9. Console

Aucune erreur runtime observée sur l'ensemble de la session (vérifié à plusieurs reprises, y compris après les cycles répétés et les deux fallbacks). Aucun des avertissements Three.js connus (`WebGLShadowMap`, `THREE.Clock`, `THREE.Material 'map' undefined`, catalogués dans `docs/DRIFT_3D_RUNTIME_BASELINE.md` §8) n'a été observé dans cette session précise — attendu, puisque le renderer n'a jamais produit de frame réelle dans cet onglet (`requestAnimationFrame` non déclenché, même limite documentée ci-dessus), pas parce qu'ils auraient été corrigés.

---

## 10. Limites

- Le montage initial n'a pu être observé `ACTIVE` que via `FORCED_VISIBILITY_PATH` (override + événement réel), jamais par une visibilité naturelle de l'onglet automatisé — voir la section « Limite d'environnement » en tête de ce document.
- `window.__drift3dLifecycle` et `window.__drift3dAudioClock` n'ont jamais été directement lisibles dans cette session (montage interne du `Canvas` react-three-fiber suspendu, `requestAnimationFrame` jamais déclenché) — contournés par lecture directe de la ref sous-jacente via traversée de fiber React, sans modification de code applicatif. Leur présence/absence (`in window`) reste en revanche parfaitement observable et a été vérifiée à chaque étape.
- Le disposal réel de la texture terrain et de sa géométrie n'a pas été chronométré en session live — classé `AUTOMATED_STRUCTURAL_EVIDENCE`, confirmé par lecture de code (§7).
- L'arrêt effectif de l'`AudioContext` de l'ambiance diégétique au démontage n'est pas observable par une API externe — confirmé par lecture de code et par la disparition complète du sous-arbre qui le possède (§4).
- Aucun fichier `.png` n'a été committé sous ce répertoire — même limite d'environnement que `DRIFT-IV-BASE-00`/`DRIFT-IV-SYS-00` (le mécanisme `save_to_disk` capture une image de bureau fixe sans rapport avec l'onglet piloté).

---

## 12. Round de correction — faux `route-unmount` sous Strict Mode (2026-07-19)

**Écart corrigé :** le cleanup de l'effet de lifecycle dans `Drift3DCanvas.tsx` appliquait la transition logique `reset("route-unmount") → reset-complete → unmount` de façon synchrone, sans distinguer un vrai démontage d'un cleanup simulé par le cycle dev React 18 Strict Mode (`setup → cleanup → setup`, sur la même instance). Conséquence : dès le tout premier montage, avant toute navigation réelle, `resetRevision` valait déjà `1` et `lastResetReason` déjà `"route-unmount"` — un faux événement logique (voir requalification en tête de ce document et en §2/§4/§5).

**Correctif :** une ref `lifecycleEffectGenerationRef` est incrémentée à chaque exécution du `setup` de l'effet. Le cleanup retire immédiatement les listeners et nettoie immédiatement les ressources réellement possédées (ambiance, inputs transitoires) — inchangé, toujours synchrone. La transition logique `route-unmount` est en revanche différée dans un `queueMicrotask`, qui vérifie que `lifecycleEffectGenerationRef.current` est toujours égal à la génération capturée à ce `setup` : si un nouveau `setup` de la **même instance** s'est déjà déclaré entre-temps (Strict Mode), la génération a changé et la transition est annulée (no-op) ; si aucun nouveau `setup` n'a eu lieu (démontage réel), la génération est inchangée et la transition s'applique. Aucun `setTimeout`/`setInterval`/nouveau `requestAnimationFrame`, aucun `setState` dans le bloc différé. Le jeton propriétaire des probes dev (`Drift3DScene.tsx`) est également stabilisé : `const owner = {}` (recréé à chaque exécution d'effet) remplacé par `devProbeOwnerRef.current` (calculé une seule fois par instance via `useRef`), pour que la documentation (« même instance = même jeton ») corresponde réellement à l'implémentation.

**Méthode de vérification :** session Chrome réelle (Claude Browser pane), onglet frais, même technique de lecture par traversée de fiber qu'en section 2 et suivantes.

### Test A — Montage initial en dev Strict Mode

Sur `/drift/`, onglet réellement `hidden`, après stabilisation du montage (microtask résolue) et avant toute navigation :

```json
{
  "state": "IDLE",
  "previousState": "UNMOUNTED",
  "lifecycleRevision": 1,
  "mountRevision": 1,
  "resetRevision": 0,
  "lastEvent": "mount",
  "lastResetReason": null,
  "changedAtMs": 822.6
}
```

**Résultat : PASS.** `mountRevision = 1`, `resetRevision = 0`, `lastResetReason = null` — le faux `route-unmount` a disparu. `state: "IDLE"` reste honnêtement non fabriqué (onglet réellement invisible).

### Test B — Forced visibility depuis l'état initial

`IDLE → ACTIVE` (override visible + `visibilitychange` réel) :

```json
{ "state": "ACTIVE", "previousState": "IDLE", "lifecycleRevision": 2, "mountRevision": 1, "resetRevision": 0, "lastEvent": "activate" }
```

`ACTIVE → PAUSED` (override hidden + `visibilitychange` réel) :

```json
{ "state": "PAUSED", "previousState": "ACTIVE", "lifecycleRevision": 3, "mountRevision": 1, "resetRevision": 0, "lastEvent": "pause" }
```

`PAUSED → ACTIVE` (override visible + `visibilitychange` réel) :

```json
{ "state": "ACTIVE", "previousState": "PAUSED", "lifecycleRevision": 4, "mountRevision": 1, "resetRevision": 0, "lastEvent": "resume" }
```

**Résultat : PASS.** `resetRevision` reste `0` et `mountRevision` reste `1` sur tout le cycle.

### Test C — Vrai route-unmount

Référence à la ref de lifecycle tenue avant navigation (état de fin du Test B : `resetRevision: 0`). Ambiance non ré-activée pour ce test (déjà couverte en §4 pré-correctif). Navigation SPA réelle vers `/`. Après résolution de la microtask, lu sur la ref conservée :

```json
{
  "state": "UNMOUNTED",
  "previousState": "IDLE",
  "lifecycleRevision": 7,
  "mountRevision": 1,
  "resetRevision": 1,
  "lastEvent": "unmount",
  "lastResetReason": "route-unmount",
  "changedAtMs": 59498.7
}
```

- `resetRevision` : `0 → 1`, soit **+1 exactement**, sur une baseline propre ✅
- `mountRevision` reste `1` (inchangé — un `unmount` n'est pas un mount) ✅
- `canvasCount: 0`, `audioCount: 1`, `<audio>` global strictement inchangé (`src: entry-ambient.mp3`, `paused: true`, `currentTime: 0`) ✅
- Cinq globals dev absents (`__drift3dLifecycle`, `__drift3dAudioClock`, `__drift3dRender`, `__drift3dDebug`, `__drift3dTeleport`) ✅

**Résultat : PASS.**

### Test D — Remount (instance fraîche)

Navigation SPA réelle vers `/drift/`. Nouvelle instance (nouvelle ref, `sameRefAsBefore: false` confirmé programmatiquement) :

```json
{
  "state": "ACTIVE",
  "previousState": "IDLE",
  "lifecycleRevision": 2,
  "mountRevision": 1,
  "resetRevision": 0,
  "lastEvent": "activate",
  "lastResetReason": null,
  "changedAtMs": 81007.5
}
```

`state: "ACTIVE"` directement (et non `"IDLE"`) parce que l'override de visibilité posé au Test B reste actif pour le reste de la session (`document` n'est jamais rechargé par une navigation SPA) — même note méthodologique honnête qu'en §5 pré-correctif.

**Résultat : PASS.** `mountRevision = 1` (fraîche, pas accumulée), `resetRevision = 0` (fraîche), `lastResetReason = null` (fraîche) — la nouvelle instance n'hérite d'aucun faux reset de l'instance précédente.

### Test E — Un cycle supplémentaire

`/drift/ → / → /drift/` :

```json
{ "leavingDrift": { "canvasCount": 0, "audioCount": 1 }, "returningToDrift": { "canvasCount": 1, "audioCount": 1 } }
```

Aucune erreur console observée à aucune étape de ce round de correction.

**Résultat : PASS.**

### Résumé

```json
{
  "strictModeInitial": { "mountRevision": 1, "resetRevision": 0, "lastResetReason": null },
  "realRouteUnmount": { "resetRevisionDelta": 1, "state": "UNMOUNTED", "lastResetReason": "route-unmount" },
  "remount": { "freshResetRevision": 0, "freshLastResetReason": null }
}
```

---

## 11. Décision de gate

| Critère | Statut |
|---|---|
| machine d'état déterministe | PASS |
| cinq états canoniques représentés | PASS |
| aucun vocabulaire track/cue dans le service | PASS |
| visibilité pilote réellement ACTIVE/PAUSED | PASS (`FORCED_VISIBILITY_PATH`, événement réel rejoué par le vrai listener applicatif) |
| route-unmount produit RESETTING puis UNMOUNTED | PASS — corrigé et rejoué en §12 (le faux route-unmount de Strict Mode identifié en §2/§4/§5 est éliminé) |
| resetRevision augmente une fois par reset logique | PASS — corrigé en §12 (`resetRevision = 0` après stabilisation du montage, avant toute navigation ; `+1` exact sur un vrai démontage) |
| le player global survit | PASS |
| l'ambiance locale s'arrête | PASS (confirmé par code + disparition du sous-arbre propriétaire) |
| les inputs sont vidés | PASS (confirmé par code — `pointerDriveStateRef`/`activeTouchPointersRef`/`pinchStateRef`/`pressedKeysRef` tous explicitement remis à zéro au démontage) |
| la texture terrain est disposée | `AUTOMATED_STRUCTURAL_EVIDENCE` (confirmé par code, non chronométré en direct) |
| les globals de développement sont supprimés | PASS |
| trois cycles SPA ne créent aucune accumulation | PASS |
| fallbacks sans Canvas ne laissent aucun lifecycle résiduel | PASS |
| lint et build passent | PASS |

**Décision : `DRIFT-IV-SYS-10` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-20` → `NEXT_AFTER_MERGE`.**

*(Historique : entre la soumission initiale de cette évidence et cette décision finale, le statut est passé par `REWORK_REQUIRED` le temps du round de correction ci-dessus — §12 — qui a éliminé le faux `route-unmount` produit par le cleanup simulé de React Strict Mode.)*
