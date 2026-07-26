# DRIFT-IV-SYS-70 — Evidence/performance harness — Evidence package

- **Lot :** `DRIFT-IV-SYS-70`
- **Date :** 2026-07-25 (session initiale) — 2026-07-26 (session de correction)
- **Méthode :** deux sessions. **Session initiale** : Browser pane sandboxé (MCP `Claude_Browser`) et une première passe rapide sur une vraie instance Chrome via `claude-in-chrome` — voir §6.1, aucune mesure Canvas live obtenue. **Session de correction** : une vraie instance Chrome locale via `claude-in-chrome`, avec navigation réelle (clics DOM), lecture explicite d'une track, et attente réelle suffisante pour laisser le compositeur du navigateur démarrer le rendu — voir §6.2, mesures Canvas live obtenues avec succès. `window.__drift3dEvidence` (et les autres globals `__drift3d*` existants) pour toute la preuve de contrat pur ; overrides d'environnement fidèles (`matchMedia`, `HTMLCanvasElement.prototype.getContext`) pour les chemins fallback.

## 0. Résumé

Toute la logique **pure** de `drift3dEvidence.ts` (classifications, calcul FPS, validateurs de snapshot/d'échantillon, immutabilité — y compris un échantillon FPS non-null réel) est `MEASURED`. Après la session de correction, la mesure **live** d'un Canvas R3F réellement en train de rendre (Tests F, G, H, I, L, R, N) est également `MEASURED` — obtenue pour de vrai dans une session Chrome locale réelle. La session initiale (Browser pane sandboxé + un premier essai Chrome sans attente suffisante) n'avait pas pu l'obtenir ; ce résultat reste documenté en §6.1 comme limitation d'environnement réellement rencontrée, non supprimé, et la session de correction en §6.2 vient en complément pour expliquer pourquoi elle a fini par réussir.

## 1. PURE CONTRACT EVIDENCE

### Test A — Classifications (`MEASURED`)

```json
{
  "classifications": ["MEASURED", "INFERRED_FROM_REPRESENTATIVE_SAMPLE", "AUTOMATED_STRUCTURAL_EVIDENCE", "KNOWN_ENVIRONMENT_LIMITATION"],
  "classificationsFrozen": true,
  "validForAllFour": [true, true, true, true],
  "invalidRandomString": false,
  "invalidEmptyString": false
}
```

Exactement quatre valeurs, tuple `Object.freeze`d, `validateClassification` retourne `true` pour les quatre valeurs canoniques et `false` pour une chaîne aléatoire (`"MEASURED_APPROX"`) et pour une chaîne vide.

### Test B — Calcul FPS pur (`MEASURED`)

```json
{
  "computeFps(120, 2000)": 60,
  "computeFps(300, 5000)": 60,
  "computeFps(532, 10532)": 50.512723129510064,
  "elapsedMs=0": null,
  "elapsedMs=-50": null,
  "elapsedMs=NaN": null,
  "elapsedMs=Infinity": null,
  "frameCount=-5": null,
  "frameCount=5.5": null,
  "frameCount=NaN": null,
  "frameCount=0, elapsedMs=1000": 0
}
```

Le triplet `(532, 10532)` reprend le nombre historique de BASE-00 **uniquement comme entrée de régression mathématique** (`532/10.532 = 50.5127...`), jamais comme une nouvelle mesure. Toutes les entrées invalides (élapsé ≤ 0, `NaN`, `Infinity`, frameCount négatif ou fractionnaire) sont rejetées (`null`), jamais silencieusement coercées, jamais `Infinity`. `frameCount=0` sur un élapsé valide retourne bien `0` — une mesure légitime de « zéro frame », pas un rejet.

### Test C — Fixtures de snapshot (`MEASURED`) — **compte corrigé**

**Nombre réel exact de fixtures construites : 15 total : 1 valide + 14 invalides, couvrant les 12 valeurs de `Drift3DPerformanceSnapshotIssueType`.** `cumulative-frame-count-invalid` est exercé avec trois fixtures distinctes (`-1`, `1.5`, `NaN`), ce qui porte le nombre total de fixtures invalides à 14 pour 12 types d'issue distincts couverts. (Correction : une version précédente de ce document annonçait à tort « 13 fixtures : 1 valide + 12 invalides » — décompte refait et vérifié ci-dessous.)

| Fixture | Issue attendue | Résultat réel |
|---|---|---|
| Snapshot valide | `[]` | `[]` — PASS |
| `canvasPresent: "true"` | `canvas-present-not-boolean` | conforme |
| `cumulativeFrameCount: -1` | `cumulative-frame-count-invalid` | conforme |
| `cumulativeFrameCount: 1.5` | `cumulative-frame-count-invalid` | conforme |
| `cumulativeFrameCount: NaN` | `cumulative-frame-count-invalid` | conforme |
| `canvasPresent: true, render: null` | `render-null-while-canvas-present` | conforme |
| `canvasPresent: true, viewport: null` | `viewport-null-while-canvas-present` | conforme |
| `canvasPresent: false, render: {...}` | `render-not-null-while-canvas-absent` | conforme |
| `canvasPresent: false, viewport: {...}` | `viewport-not-null-while-canvas-absent` | conforme |
| `render.drawCalls: -1` | `draw-calls-invalid` | conforme |
| `render.triangles: 1.5` | `triangles-invalid` | conforme |
| `viewport.width: 0` | `width-invalid` | conforme |
| `viewport.height: -600` | `height-invalid` | conforme |
| `viewport.dpr: NaN` | `dpr-invalid` | conforme |
| `visibility: "foreground"` | `visibility-invalid` | conforme |

15 lignes ci-dessus (1 valide + 14 invalides), `distinctIssueTypesCount` vérifié = 12 (rejoué avec `Set` sur les types d'issue retournés). Chaque fixture invalide retourne exactement un tableau à un élément portant le `type` attendu — aucun faux positif, aucun faux négatif observé.

### Test D — Fixtures d'échantillon FPS (`MEASURED`)

**Nombre réel exact de fixtures construites : 12** (1 échantillon valide + 11 invalides : 3 sur `frameCount`, 4 sur `elapsedMs`, 3 sur `fps`, 1 sur l'incohérence croisée). Résultat :

| Fixture | Issue attendue | Résultat réel |
|---|---|---|
| Échantillon valide (`300, 5000, 60`) | `[]` | `[]` — PASS |
| `frameCount: -1` | `frame-count-invalid` | conforme |
| `frameCount: 1.5` | `frame-count-invalid` | conforme |
| `frameCount: NaN` | `frame-count-invalid` | conforme |
| `elapsedMs: 0` | `elapsed-ms-invalid` | conforme |
| `elapsedMs: -100` | `elapsed-ms-invalid` | conforme |
| `elapsedMs: NaN` | `elapsed-ms-invalid` | conforme |
| `elapsedMs: Infinity` | `elapsed-ms-invalid` | conforme |
| `fps: -1` | `fps-invalid` | conforme |
| `fps: NaN` | `fps-invalid` | conforme |
| `fps: Infinity` | `fps-invalid` | conforme |
| `frameCount: 300, elapsedMs: 5000, fps: 30` | `fps-inconsistent` | conforme (message : `expected 60`) |

### Test E — Immutabilité (`MEASURED`) — **enrichi d'un sample non-null**

```json
{
  "snapshotFrozen": true,
  "tokenFrozen": true,
  "immediateBeginEndReturnsNull": true,
  "mutationAttemptOnSnapshotIgnored": true,
  "mutationAttemptOnTokenIgnored": true,
  "classificationsPushAttemptIgnored": true
}
```

Une tentative de mutation (`snapshot.canvasPresent = true`, `token.startedAtMs = 0`, `classifications.push('X')`) n'affecte ni l'objet lui-même (relu identique juste après) ni les snapshots futurs.

Cas limite déjà connu : `beginFpsSample()` suivi immédiatement de `endFpsSample(token)` (même tick, `elapsedMs` ≈ 0) retourne **`null`**, pas un échantillon fabriqué — preuve que le rejet `elapsedMs <= 0` s'applique aussi au chemin réel `begin`/`end`. Ce cas reste distinct et conservé séparément du test suivant.

**Nouveau — immutabilité d'un sample non-null réel** : `beginFpsSample()` puis attente réelle de 1500 ms (`setTimeout` côté test/opérateur, aucun timer ajouté au runtime), puis `endFpsSample(token)` :

```json
{ "sample": { "frameCount": 0, "elapsedMs": 1515.0999999996275, "fps": 0 }, "nonNullSampleIsFrozen": true, "nonNullSampleMutationIgnored": true }
```

`sample !== null` et `Object.isFrozen(sample) === true` confirmés sur un objet réellement retourné (pas l'edge case de rejet) ; une tentative `sample.fps = 999` est ignorée (`sample.fps` reste `0`). `frameCount === 0` ici reflète simplement qu'aucune frame R3F n'avait encore été rendue à ce moment précis de la session (cette limitation ponctuelle est distincte de l'immutabilité elle-même, qui est ce que ce test prouve) — voir §2 pour un échantillon FPS avec `frameCount > 0` obtenu plus tard dans la session de correction.

## 2. REAL ACTIVE-CANVAS MEASUREMENT — `MEASURED` (obtenu en session de correction)

### Test F — Snapshot Canvas actif réel (`MEASURED`)

Sur `/drift/`, après que le Canvas R3F a réellement commencé à rendre (voir §6.2) :

```json
{
  "snapshot": { "canvasPresent": true, "cumulativeFrameCount": 3190, "render": { "drawCalls": 139, "triangles": 197146 }, "viewport": { "width": 1278, "height": 854, "dpr": 1 }, "visibility": "visible" },
  "validateSnapshotResult": [],
  "isFrozen": true
}
```

`canvasPresent: true`, `cumulativeFrameCount` observé strictement croissant entre deux appels successifs (1748 → 3190 → 5276 → ... au fil de la session), `drawCalls`/`triangles` finis ≥ 0, `width`/`height` > 0, `dpr` > 0, `visibility: "visible"`. `validateSnapshot()` retourne `[]`. Valeurs réelles enregistrées, aucune attente codée en dur dans le harness.

### Test G — Échantillon FPS de premier plan réel (`MEASURED`)

```json
{
  "token": { "startedAtMs": 82002.09999999963, "startedFrameCount": 3733 },
  "sample": { "frameCount": 1543, "elapsedMs": 21989, "fps": 70.17144936104415 },
  "frozen": true,
  "visibility": "visible"
}
```

Fenêtre réelle d'environ 22 secondes (attente explicite de 10 s côté opérateur + aller-retours d'exécution, honnêtement comptés dans `elapsedMs`), `document.visibilityState === "visible"` pendant toute la fenêtre. `fps ≈ 70.17` est une mesure brute — **aucun seuil n'est appliqué, ce résultat n'est jamais converti en `PASS >= 30` ou `PASS >= 60`.** Classification : `MEASURED`.

## 3. CROSS-ZONE RENDER-COST SAMPLE — `MEASURED` (obtenu en session de correction)

### Test H — Quatre zones (`MEASURED`)

Téléportage réel via `window.__drift3dTeleport = { x, z }` (canal dev-only consommé par `Drift3DScene.tsx`, préexistant, non modifié par ce lot), coordonnées lues dans `src/lib/drift3dTopology.ts` (`drift3dTrackNodes`) et dans l'evidence `DRIFT-IV-BASE-00` (Foolfoule) :

| Zone | Coordonnées utilisées | `drawCalls` | `triangles` | `viewport` | `dpr` | `visibility` |
|---|---|---|---|---|---|---|
| Entry Node | spawn par défaut, aucun téléportage (`x≈-85.85, z≈12.82`) | 139 | 197146 | 1278×854 | 1 | visible |
| A Walk In Zeeland | `{ x: -88, z: 20 }` | 160 | 198008 | 1278×854 | 1 | visible |
| Foolfoule | `{ x: -78, z: 34 }` | 175 | 198124 | 1278×854 | 1 | visible |
| ÉTÉÉAOOÉTÉ | `{ x: 56, z: -66 }` | 157 | 178644 | 1278×854 | 1 | visible |

Classification : `MEASURED`. Les noms de zone n'apparaissent que dans ce document et dans l'evidence BASE-00 déjà existante — jamais dans le code runtime de ce lot (voir Test Q).

### Test I — Comparabilité avec BASE-00 (`MEASURED` pour les dimensions comparables)

| Zone | Draw calls historique BASE-00 | Draw calls session SYS-70 | Triangles historique BASE-00 | Triangles session SYS-70 |
|---|---|---|---|---|
| Entry Node | 139, 140 | **139** | 197146, 197158 | **197146** |
| A Walk In Zeeland | 160, 161 | **160** | 198008, 198020 | **198008** |
| Foolfoule | 173, 175 | **175** | 197076, 198124 | **198124** |
| ÉTÉÉAOOÉTÉ | 157 | **157** | 178644 | **178644** |

Chacune des quatre valeurs de cette session correspond exactement à l'une des valeurs historiques déjà observées pour la même zone (aucune n'est en dehors de l'enveloppe). **Limite de comparabilité honnête :** malgré un contexte de viewport différent (BASE-00 : 390×844 mobile ; cette session : 1278×854 desktop), chaque mesure SYS-70 de draw calls/triangles correspond exactement à une valeur déjà observée pour la même zone dans BASE-00. Cela établit la comparabilité empirique de ces échantillons mesurés, sans prétendre que ces métriques sont intrinsèquement indépendantes du viewport dans toutes les conditions de rendu. Le FPS n'est **pas** comparé terme à terme : la mesure historique BASE-00 (50.5 fps) provient d'un contexte mobile foreground spécifique, tandis que le Test G de cette session (≈70.17 fps) provient d'un contexte desktop différent — comparer les deux directement produirait une fausse impression de gain/régression sans base suffisante. **Aucune conclusion de régression ni de gain n'est faite** au-delà de la constatation honnête que les comptes de géométrie par zone sont cohérents avec l'historique.

## 4. FALLBACK/LIFECYCLE EVIDENCE — `MEASURED`

### Test J — Fallback reduced-motion (`MEASURED`)

`MediaQueryList` factice (`matches: true`, mêmes méthodes que l'API réelle) installé sur `/`, puis navigation SPA réelle (clic DOM) vers `/drift/` :

```json
{ "canvasCount": 0, "bodyShowsReducedMotionPanel": true, "snapshot": { "canvasPresent": false, "cumulativeFrameCount": 0, "render": null, "viewport": null, "visibility": "visible" } }
```

Panel "REDUCED MOTION" / "The 3D room stays closed today." confirmé dans le texte de page réel. Aucun Canvas, `snapshot()` honnête (`render`/`viewport` `null`), comme attendu par contrat.

### Test K — Fallback no-WebGL (`MEASURED`)

`HTMLCanvasElement.prototype.getContext` overridé pour retourner `null` sur `webgl2`/`webgl`/`experimental-webgl`, installé sur `/`, puis navigation SPA réelle vers `/drift/` :

```json
{ "canvasCount": 0, "bodyShowsNoWebGLPanel": true, "snapshot": { "canvasPresent": false, "cumulativeFrameCount": 0, "render": null, "viewport": null, "visibility": "hidden" }, "noWebGLPathIntact": true }
```

Panel "NO WEBGL" / "This browser cannot open the 3D room." confirmé, `window.__drift3dNoWebGL.getPath()` retourne le contrat canonique inchangé (SYS-60 intact).

### Test L — Remount Canvas réel, cycle complet standard → reduced-motion → standard (`MEASURED`)

Session de correction, Canvas réellement actif et en train de rendre. Un faux `MediaQueryList` contrôlable a été installé **avant le montage** de `/drift/` (sur `/`, puis clic SPA réel vers `/drift/`), afin que la fermeture React de `Drift3DClient` capture directement l'objet factice.

**État initial (standard, Canvas actif)** :
```json
{ "canvasPresent": true, "cumulativeFrameCount": 443, "render": { "drawCalls": 139, "triangles": 197146 }, "viewport": { "width": 1278, "height": 854, "dpr": 1 }, "visibility": "visible" }
```

**→ reduced-motion** (`fakeMql.matches = true` + `dispatch()` d'un événement `change` réel) :
```json
{ "canvasCount": 0, "bodyShowsReducedMotionPanel": true, "evidenceRefSame": true, "snapshot": { "canvasPresent": false, "cumulativeFrameCount": 443, "render": null, "viewport": null, "visibility": "visible" } }
```

**→ standard à nouveau** (`fakeMql.matches = false` + `dispatch()`) :
```json
{ "canvasCountImmediate": 1, "snapshotImmediate": { "canvasPresent": false, "cumulativeFrameCount": 443, "render": null, "viewport": null } }
```
puis, après que le Canvas a réellement recommencé à rendre :
```json
{ "snapshotAfterRealRemount": { "canvasPresent": true, "cumulativeFrameCount": 0, "render": { "drawCalls": 139, "triangles": 197146 }, "viewport": { "width": 1278, "height": 854, "dpr": 1 }, "visibility": "visible" } }
```
puis, quelques secondes plus tard :
```json
{ "snapshot": { "canvasPresent": true, "cumulativeFrameCount": 99, "render": { "drawCalls": 139, "triangles": 197146 }, "viewport": { "width": 1278, "height": 854, "dpr": 1 }, "visibility": "visible" }, "evidenceRefSame": true }
```

**Confirmé pour de vrai** : `window.__drift3dEvidence` garde exactement la même identité d'objet (`evidenceRefSame: true`) sur l'ensemble du cycle (Drift3DClient lui-même n'a jamais démonté — seul le Canvas interne bascule) ; `canvasPresent` bascule `true` → `false` → `true` ; `render`/`viewport` deviennent `null` en reduced-motion puis reviennent non-`null` ; **`cumulativeFrameCount` est remis à `0` au remontage réel du Canvas puis augmente à nouveau (443 → 0 → 99)**, conformément au choix documenté au contrat §7. Ce test n'est plus `KNOWN_ENVIRONMENT_LIMITATION`.

### Test M — Cleanup route (`MEASURED`)

Navigation SPA réelle `/drift/` → `/` (clic sur le logo) puis `/` → `/drift/` (clic sur le lien Drift) :

```json
{ "afterNavigatingAway": { "evidenceGlobalGone": true }, "afterNavigatingBack": { "evidenceGlobalPresent": true, "sameReferenceAsBefore": false } }
```

`window.__drift3dEvidence` disparaît entièrement en quittant `/drift`, puis un objet **différent** (nouvelle installation, pas de résidu) apparaît en y revenant.

### Test N — Invariance audio (`MEASURED`) — **enrichi d'une lecture réelle en cours**

**Scénario de base (silence, `paused: true`)** :
```json
{ "audioCount": 1, "beforeCalls": { "paused": true, "currentTime": 0, "src": "http://localhost:3000/audio/entry-ambient.mp3" }, "afterFiveRoundsOfSnapshotAndFpsSample": { "paused": true, "currentTime": 0, "src": "http://localhost:3000/audio/entry-ambient.mp3" } }
```

**Nouveau — scénario avec lecture réelle en cours** : track « A WALK IN ZEELAND » lancée via un clic réel sur son bouton Play sur `/tracks` :
```json
{ "audioCount": 1, "onTracks": { "paused": false, "currentTime": 6.413452, "src": ".../a-walk-in-zeeland.mp3" } }
```
Navigation SPA réelle (clic DOM sur le lien « Drift ») vers `/drift/` :
```json
{ "onDriftAfterSpaNav": { "paused": false, "currentTime": 21.483348, "src": ".../a-walk-in-zeeland.mp3" } }
```
Cinq appels `snapshot()`/`beginFpsSample()`/`endFpsSample()` :
```json
{ "afterHarnessCalls": { "paused": false, "currentTime": 29.543697, "src": ".../a-walk-in-zeeland.mp3" } }
```
Et, après avoir traversé l'intégralité du cycle de remontage Canvas du Test L (démontage/remontage complet du Canvas) :
```json
{ "afterFullCanvasRemountCycle": { "paused": false, "currentTime": 31.219415, "src": ".../a-walk-in-zeeland.mp3" } }
```

`audioCount` reste `1` du début à la fin ; `paused` reste `false` ; `src` ne change jamais ; `currentTime` progresse naturellement (temps réel écoulé), sans saut ni retour à `0` — aucun seek/reset causé par le harness, y compris à travers un cycle complet de montage/démontage du Canvas.

## 5. STRUCTURAL EVIDENCE

### Test O — Politique zéro-automatisation (`AUTOMATED_STRUCTURAL_EVIDENCE`)

```
git grep -n "setTimeout\|setInterval\|sendBeacon\|localStorage\|sessionStorage\|indexedDB" -- src/lib/drift3dEvidence.ts src/components/drift-3d/Drift3DEvidenceProbe.tsx
→ 0 correspondance

git grep -n "deviceMemory\|hardwareConcurrency\|userAgent" -- src/lib/drift3dEvidence.ts src/components/drift-3d/Drift3DEvidenceProbe.tsx src/components/drift-3d/Drift3DClient.tsx
→ 0 correspondance

git grep -n "setTier\|forceLow\|autoOptimize\|applyTier" -- src/lib/drift3dEvidence.ts src/components/drift-3d/Drift3DEvidenceProbe.tsx src/components/drift-3d/Drift3DClient.tsx
→ 2 correspondances réelles, toutes deux dans Drift3DClient.tsx (lignes 217-218), à l'intérieur d'un commentaire qui énumère précisément ce qui n'est PAS exposé par le harness ("no setTier/forceLow/.../autoOptimize is exposed here"). Aucune propriété, aucune branche, aucune affectation runtime portant ces noms n'existe dans le probe réel installé (confirmé par lecture directe de l'objet probe : classifications, snapshot, beginFpsSample, endFpsSample, computeFps, validateSnapshot, validateFpsSample, validateClassification — rien d'autre).

git grep -in "eux-gainent\|eteeaooete\|foolfoule\|jazzypling\|cadence-lock\|wave-ritual\|deviation" -- src/lib/drift3dEvidence.ts src/components/drift-3d/Drift3DEvidenceProbe.tsx
→ 0 correspondance

git grep -n "window\.\|document\.\|navigator\.\|performance\.\|requestAnimationFrame" -- src/lib/drift3dEvidence.ts
→ 0 correspondance

git grep -n "from \"react\"\|from \"@react-three\|from \"three\"" -- src/lib/drift3dEvidence.ts
→ 0 correspondance
```

Il serait incorrect d'affirmer que le troisième grep retourne zéro occurrence — il en retourne deux, toutes deux non fonctionnelles (documentaires). Les cinq autres retournent réellement zéro.

### Test P — Revue d'allocation du hot path (`AUTOMATED_STRUCTURAL_EVIDENCE`)

Lecture directe du callback `useFrame` dans `Drift3DEvidenceProbe.tsx` (§7 du contrat) : sept affectations scalaires en place sur `runtimeState`, aucune allocation d'objet (`{}`), aucun tableau (`[]`), aucun `Object.freeze`, aucun `JSON.stringify`, aucun `Array.from`/`map`/`filter`/`reduce`, aucun `console.*`, aucun `setState`. Les seules allocations observées dans la trajectoire (`gl.info.render`, l'objet `state` de R3F) sont internes à Three.js/R3F, pas introduites par ce lot. Confirmé compatible avec un `cumulativeFrameCount` ayant réellement atteint plusieurs milliers d'incréments en session de correction sans dégradation observée.

### Test Q — Absence de connaissance artistique (`AUTOMATED_STRUCTURAL_EVIDENCE`)

`drift3dEvidence.ts` et `Drift3DEvidenceProbe.tsx` ne référencent aucun nom de track, slug, ère, Cue Map, phase ou landmark (confirmé par le dernier grep du Test O). Les quatre noms de zone BASE-00 cités en §3/§4 n'apparaissent que dans ce document de preuve et dans `docs/evidence/DRIFT-IV-BASE-00/`, jamais dans le code runtime. Les coordonnées `x`/`z` utilisées pour le Test H sont lues depuis `src/lib/drift3dTopology.ts` (fichier préexistant, non modifié) et depuis l'evidence BASE-00 déjà publiée — jamais codées en dur dans `drift3dEvidence.ts` ou `Drift3DEvidenceProbe.tsx`.

### Test R — Probes préexistants préservés (`MEASURED`)

Session de correction, Canvas actif :

```json
{
  "audioClock": "object",
  "lifecycle": "object",
  "render": "object",
  "debug": "object",
  "teleportChannelWritable": true,
  "cueResolver": "object",
  "signatureArbitration": "object",
  "quality": "object",
  "reducedMotion": "object",
  "noWebGL": "object",
  "evidence": "object"
}
```

Les onze globals dev sont confirmés présents et fonctionnels simultanément sur `/drift/` avec un Canvas réellement actif : `__drift3dAudioClock` (objet réel), `__drift3dLifecycle` (`.read()` retourne un état réel `{state:"ACTIVE", ...}`), `__drift3dRender` (calls/triangles réels), `__drift3dDebug` (position réelle du véhicule), `__drift3dTeleport` (canal d'écriture confirmé fonctionnel — consommé puis remis à `null` par `Drift3DScene.tsx`, comportement par conception, pas un probe à lecture directe), `__drift3dCueResolver`, `__drift3dSignatureArbitration`, `__drift3dQuality`, `__drift3dReducedMotion`, `__drift3dNoWebGL`, `__drift3dEvidence`. Ce test n'est plus `KNOWN_ENVIRONMENT_LIMITATION`.

### Test S — Lint / build (`AUTOMATED_STRUCTURAL_EVIDENCE`)

```
npm run lint  → PASS (0 erreur, 0 avertissement)
npm run build → PASS (Next.js 16.1.7, TypeScript OK, 38 pages générées)
```

Aucune configuration modifiée pour forcer le passage. Rejoué après la correction (compte Test C, ajout du sample FPS non-null) — toujours `PASS`, aucun changement de code runtime.

## 6. Limitations d'environnement rencontrées — historique complet, non supprimé

### 6.1 Session initiale (2026-07-25) — `KNOWN_ENVIRONMENT_LIMITATION` observée

Dans la session initiale, ni le Browser pane sandboxé (`Claude_Browser`) ni un premier essai rapide sur une vraie instance Chrome connectée via `claude-in-chrome` n'avaient permis au sous-arbre React du `<Canvas>` R3F de monter/rendre réellement dans la fenêtre d'observation utilisée à ce moment-là. Diagnostic alors reproduit dans les deux outils :

- `document.visibilityState` restait en permanence `"hidden"` (`document.hidden === true`).
- Un `requestAnimationFrame` planifié manuellement enregistrait **0 rappel après 1000 ms d'attente**, dans les deux outils.
- Le `<canvas>` DOM existait mais ne portait jamais l'attribut `data-engine` de Three.js, et restait bloqué à la taille HTML par défaut (`300×150`).
- Une capture d'écran du Browser pane sandboxé se bloquait systématiquement (timeout 30s).

Ce résultat a été honnêtement classé `KNOWN_ENVIRONMENT_LIMITATION` à ce moment-là et n'est pas supprimé de cet historique — il reflétait un état réellement observé, pas une fabrication.

### 6.2 Session de correction (2026-07-26) — diagnostic affiné et mesure réussie

En reprenant une vraie instance Chrome locale via `claude-in-chrome` (pas le Browser pane sandboxé), avec une navigation réelle plus soutenue (clic sur un bouton Play réel, clic SPA vers `/drift/`, puis plusieurs secondes d'attente réelle et d'interactions supplémentaires — clic, scroll), le rendu R3F a fini par démarrer réellement : `data-engine` s'est mis à retourner `"three.js r185"`, les dimensions du canvas sont devenues réelles (`1278×854`, plus `300×150`), et `cumulativeFrameCount` a commencé à augmenter en continu.

Diagnostic technique affiné, obtenu pendant cette même session :
- La fenêtre Chrome pilotée par `claude-in-chrome` est positionnée hors de l'écran visible (`window.screenX === -1927` alors que `window.screen.width === 1920`) — un test ciblé a confirmé que `setInterval` continue de s'exécuter normalement (8 rappels en ~800 ms) alors que `requestAnimationFrame` restait à `0`, ce qui isole précisément le phénomène au rendu/compositing, pas à un gel général du JavaScript de la page.
- Après un ou plusieurs clics réels (`document.hasFocus()` devenant `true`) et un délai réel suffisant (de l'ordre de plusieurs dizaines de secondes cumulées sur cette session, pas instantané), le compositeur de Chrome a fini par considérer l'onglet comme rendable et a commencé à planifier des frames — confirmé à deux reprises dans cette même session (montage initial, puis remontage après le cycle reduced-motion du Test L, qui a chacun nécessité une nouvelle période d'attente/interaction avant que le rendu ne démarre réellement).
- **Conclusion révisée** : contrairement à la conclusion de la session initiale, ce n'est pas un blocage permanent de la vraie instance Chrome locale — c'est un délai d'activation du rendu, probablement lié au positionnement hors écran de la fenêtre combiné à l'absence d'interaction soutenue. Le Browser pane sandboxé, lui, n'a jamais montré de signe de rendu réel dans aucune tentative (aucun `data-engine`, capture d'écran systématiquement bloquée) — une limitation distincte et plus dure, qui reste d'actualité pour cet outil spécifique.

Aucun incident de crash serveur dev n'a été rencontré dans l'une ou l'autre session. Aucune erreur console n'a été observée.

## 7. Statut de sortie

`npm run lint` PASS, `npm run build` PASS. `git status --short` confirme le périmètre attendu (`Drift3DCanvas.tsx`, `Drift3DClient.tsx` modifiés ; `drift3dEvidence.ts`, `Drift3DEvidenceProbe.tsx` nouveaux, plus la documentation/gouvernance). Aucun fichier interdit touché, aucun changement de code runtime au-delà du périmètre initialement autorisé. Tous les tests A–S sont désormais `MEASURED`/`AUTOMATED_STRUCTURAL_EVIDENCE` ; aucun ne reste `KNOWN_ENVIRONMENT_LIMITATION` pour cette livraison (la limitation de la session initiale reste documentée en §6.1 comme historique, sans impact sur le statut final).
