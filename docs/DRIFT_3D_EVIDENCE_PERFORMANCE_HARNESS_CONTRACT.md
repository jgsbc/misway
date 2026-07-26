# DRIFT 3D — Evidence/performance harness contract

- **Version :** 1.0
- **Date :** 2026-07-25
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-70`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-70` : un module pur de mesure/preuve de performance (`src/lib/drift3dEvidence.ts`), un probe R3F dev-only qui l'alimente (`src/components/drift-3d/Drift3DEvidenceProbe.tsx`), et un harness de développement read-only au niveau du shell (`window.__drift3dEvidence`). **`SYS-70` ne livre aucun seuil de performance canonique, aucune sélection automatique de Quality Tier, aucune télémétrie, aucune persistance.** Voir `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md`, `docs/DRIFT_3D_REDUCED_MOTION_CONTRACT.md`, `docs/DRIFT_3D_NO_WEBGL_NARRATIVE_PATH_CONTRACT.md`, `docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md`, `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md`, `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` pour les six autres services partagés (non modifiés par ce lot), et `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.6 pour la cible d'architecture long terme (dont ce lot ne livre que la tranche mesure/performance).

---

## 1. Séparation mesure / interprétation

Principe directeur de ce lot : une **mesure brute** (`frameCount=532, elapsedMs=10532, fps=50.51...`) est un fait runtime ; une **interprétation** (« la performance est bonne », « la cible mobile est atteinte ») n'appartient jamais à ce harness. `src/lib/drift3dEvidence.ts` ne décide jamais quoi changer : il ne sélectionne aucun Quality Tier, ne dégrade jamais automatiquement la scène, ne modifie ni population/scatter/réflexions, ne pilote ni reduced-motion ni no-WebGL, ne déclenche aucune track, ne téléporte jamais le joueur, ne touche jamais à l'audio, n'impose aucun seuil FPS, ne déclare jamais un verdict artistique PASS/FAIL, n'envoie aucune télémétrie, ne persiste aucune donnée utilisateur, n'effectue aucun appel réseau.

## 2. Quatre classifications canoniques, aucune cinquième

```ts
export type Drift3DEvidenceClassification =
  | "MEASURED"
  | "INFERRED_FROM_REPRESENTATIVE_SAMPLE"
  | "AUTOMATED_STRUCTURAL_EVIDENCE"
  | "KNOWN_ENVIRONMENT_LIMITATION";
```

`DRIFT_3D_EVIDENCE_CLASSIFICATIONS` est un tuple `Object.freeze`d de ces quatre valeurs exactes. `isDrift3DEvidenceClassification(value)` accepte uniquement l'une de ces quatre chaînes — jamais `ESTIMATED`, `ASSUMED`, `PROBABLY`, `EXPECTED`, `APPROXIMATE` ou `BENCHMARK_PASS`.

## 3. Modèle de snapshot de performance

```ts
export type Drift3DRenderMetrics = Readonly<{ drawCalls: number; triangles: number }>;
export type Drift3DViewportMetrics = Readonly<{ width: number; height: number; dpr: number }>;
export type Drift3DPerformanceSnapshot = Readonly<{
  canvasPresent: boolean;
  cumulativeFrameCount: number;
  render: Drift3DRenderMetrics | null;
  viewport: Drift3DViewportMetrics | null;
  visibility: "visible" | "hidden";
}>;
```

Règle stricte : `canvasPresent === false` implique toujours `render === null` et `viewport === null`. **Un `0 drawCalls` réel n'est jamais confondu avec « aucune mesure »** — `0` est une valeur mesurée légitime (par exemple juste après le montage du Canvas, avant tout dessin), `null` signifie exclusivement « pas de Canvas ». `createDrift3DPerformanceSnapshot(runtimeRef, visibility)` construit ce snapshot à partir du contenu courant de `runtimeRef` et retourne un objet `Object.freeze`d (`render`/`viewport` également frozen individuellement).

## 4. Modèle d'échantillon FPS et formule

```ts
export type Drift3DFpsSampleToken = Readonly<{ startedAtMs: number; startedFrameCount: number }>;
export type Drift3DFpsSample = Readonly<{ frameCount: number; elapsedMs: number; fps: number }>;
```

Formule : `fps = frameCount / (elapsedMs / 1000)`, sans arrondi dans la donnée source. `computeDrift3DFps(frameCount, elapsedMs)` refuse (retourne `null`) : `elapsedMs <= 0`, `NaN`/`Infinity` sur l'une ou l'autre entrée, `frameCount` négatif ou non-entier. Elle ne retourne jamais `Infinity` et n'effectue aucune coercition silencieuse.

## 5. Échantillonnage sans minuteur interne

`beginDrift3DFpsSample(runtimeRef, nowMs)` lit le `cumulativeFrameCount` courant et l'horodatage fourni, et retourne un token frozen — **il ne démarre rien** : aucun `setTimeout`/`setInterval`, aucune boucle `requestAnimationFrame` autonome. `endDrift3DFpsSample(runtimeRef, token, nowMs)` relit le `cumulativeFrameCount` courant, calcule le delta, et retourne un échantillon frozen (ou `null` si le résultat serait invalide, par exemple `nowMs <= token.startedAtMs`). Les frames ne progressent que parce que le probe R3F (§7) est déjà en train de rendre — ce module n'anime jamais rien lui-même.

## 6. Référence runtime stable, sans historique

```ts
export type Drift3DEvidenceRuntimeRef = {
  current: {
    canvasPresent: boolean;
    cumulativeFrameCount: number;
    drawCalls: number | null;
    triangles: number | null;
    width: number | null;
    height: number | null;
    dpr: number | null;
  };
};
```

`createDrift3DEvidenceRuntimeRef()` retourne cette structure mutable — volontairement **non** frozen (elle est réécrite à chaque frame), mais tout ce que ce module en **extrait** (snapshot, token, sample) est frozen. Aucun tableau de frames, aucun ring buffer, aucun historique non borné : sept champs scalaires, rien de plus.

## 7. Frame probe R3F — zéro allocation

`src/components/drift-3d/Drift3DEvidenceProbe.tsx` observe le renderer existant via `useThree`/`useFrame` uniquement. À chaque frame, il **mute en place** les sept champs du `runtimeRef` reçu en prop : `cumulativeFrameCount += 1`, `drawCalls`/`triangles` depuis `gl.info.render`, `width`/`height` depuis le viewport R3F, `dpr` depuis `gl.getPixelRatio()`. Aucune allocation d'objet/tableau, aucun `console.*`, aucun `setState` React, aucun réseau, aucune persistance dans ce chemin chaud.

Au montage (effet séparé, mount/unmount uniquement) : `canvasPresent = true`, une lecture initiale réelle (pas de valeurs fabriquées), et **`cumulativeFrameCount` est explicitement remis à `0`** — choix délibéré et documenté : chaque montage réel de Canvas repart d'un compteur à zéro plutôt que de conserver un total across d'anciens montages. Au démontage : `canvasPresent = false`, `drawCalls`/`triangles`/`width`/`height`/`dpr` remis à `null` (jamais à `0` — `0` resterait une mesure, `null` signifie absence de Canvas).

## 8. Intégration — propriétaire au niveau du shell

Le `Drift3DEvidenceRuntimeRef` est créé et possédé par `Drift3DClient.tsx` (via l'initialiseur paresseux de `useState`, pas `useRef().current` — lire directement `.current` d'une ref pendant le rendu est refusé par la règle `react-hooks/refs`), puis transmis en prop à `Drift3DCanvas.tsx`, qui monte `<Drift3DEvidenceProbe>` en dev uniquement, comme sibling de `Drift3DScene`, sans aucun changement artistique. Posséder la ref au niveau du shell garantit que le harness (§9) reste disponible même quand le Canvas est absent (reduced-motion, no-WebGL, encore en vérification) — il rapporte alors honnêtement `canvasPresent: false, render: null, viewport: null` plutôt que de disparaître.

## 9. Harness de développement — `window.__drift3dEvidence`

En développement seulement, `Drift3DClient.tsx` installe :

```ts
{
  classifications,
  snapshot(),
  beginFpsSample(),
  endFpsSample(token),
  computeFps(frameCount, elapsedMs),
  validateSnapshot(snapshot),
  validateFpsSample(sample),
  validateClassification(value),
}
```

`Object.freeze`d. Jamais exposé : `setTier`/`applyTier`/`forceLow`/`forceReduced`/`forceNoWebGL`/`teleport`/`play`/`pause`/`seek`/`setTrack`/`resetScene`/`setQuality`/`setPerformanceTarget`/`autoOptimize`. Le probe permet de **MESURER et LIRE** — jamais de commander quoi que ce soit.

## 10. Immutabilité des sorties

Tout objet retourné par ce module vers l'extérieur est `Object.freeze`d : le tuple de classifications, un snapshot (et ses sous-objets `render`/`viewport`), un token, un échantillon FPS. Une tentative de mutation sur l'un de ces objets n'affecte jamais le `runtimeRef` interne ni les snapshots futurs (vérifié en §Test E de l'evidence package).

## 11. Validation — structurelle, jamais un seuil de performance

`getDrift3DPerformanceSnapshotIssues(candidate)` détecte au minimum : `canvasPresent` non-booléen ; `cumulativeFrameCount` négatif/non-entier/`NaN`/`Infinity` ; Canvas présent avec `render`/`viewport` `null` ; Canvas absent avec `render`/`viewport` non-`null` ; `drawCalls`/`triangles` négatif/non-entier/non-fini ; `width`/`height` ≤ 0 ou non-fini ; `dpr` ≤ 0 ou non-fini ; `visibility` invalide. `getDrift3DFpsSampleIssues(candidate)` détecte : `frameCount` négatif/non-entier/`NaN`/`Infinity` ; `elapsedMs` ≤ 0/`NaN`/`Infinity` ; `fps` négatif/`NaN`/`Infinity` ; `fps` numériquement incohérent avec `frameCount`/`elapsedMs` (tolérance numérique fine). **Ni l'un ni l'autre ne valide jamais `fps >= 60` ou `fps >= 30`** — la validité structurelle n'est jamais confondue avec un jugement de qualité de performance.

## 12. Visibilité — normalisation explicite, jamais un défaut « visible »

`resolveDrift3DEvidenceVisibility(rawVisibilityState)` traduit toute valeur autre que la chaîne littérale `"visible"` en `"hidden"` — une valeur inattendue de `document.visibilityState` ne devient jamais silencieusement `"visible"`. Seul le shell lit `document.visibilityState` ; ce module ne le lit jamais lui-même. Un échantillon FPS de premier plan réel suppose `visibility: "visible"`.

## 13. Aucun fingerprinting matériel

Ce module ne lit jamais `navigator.userAgent`, `navigator.deviceMemory`, `navigator.hardwareConcurrency`, ni aucune empreinte GPU. Aucune classification automatique mobile/desktop/faible/haut de gamme. `width`/`height`/`dpr` sont une mesure de contexte (viewport courant), jamais un fingerprint matériel.

## 14. Relation avec le Quality Tier — aucun import, aucune sélection

`src/lib/drift3dEvidence.ts` n'importe pas `drift3dQuality.ts` et ne sélectionne jamais `LOW`/`MEDIUM`/`HIGH`. Le harness mesure ; il ne consomme ni ne pilote jamais le Quality Tier.

## 15. Relation avec les anciens probes — autonome, aucune dépendance croisée

`window.__drift3dRender` (existant, dans `Drift3DScene.tsx`, à l'intérieur du Canvas) écrit déjà un nouvel objet `{ calls, triangles }` à chaque frame depuis `gl.info.render` — **ce lot ne le supprime pas, ne change pas son API, et ne le lit jamais**. `Drift3DEvidenceProbe.tsx` lit le même renderer Three.js de façon totalement indépendante, via son propre `useFrame`. Il en va de même pour `__drift3dDebug`/`__drift3dTeleport`/`__drift3dAudioClock`/`__drift3dLifecycle` : tous possédés par le registre de probes interne à `Drift3DScene.tsx` (`devProbeOwnerRef`/`claimDrift3DDevProbe`, livré par `SYS-10`) — ce registre n'est ni touché ni réutilisé par `SYS-70`. `window.__drift3dEvidence` reste entièrement autonome : aucune dépendance vers un autre global `__drift3d*`.

## 16. Aucun enregistrement automatique

Aucune écriture de fichier automatique, aucun téléchargement JSON automatique, aucun `localStorage`/`sessionStorage`/`indexedDB`, aucun `fetch`/`sendBeacon`. La persistance d'une preuve reste une opération manuelle du développeur : copier un résultat mesuré vers `docs/evidence/**`.

## 17. Cleanup du probe

Même stratégie locale que les probes `SYS-20`/`SYS-30`/`SYS-40`/`SYS-50`/`SYS-60` : l'objet `probe` créé au montage de `Drift3DClient` est comparé par référence (`===`) à `window.__drift3dEvidence` avant suppression au démontage. Aucun registre partagé nouveau.

## 18. Workflow futur pour les Builds

```ts
const before = window.__drift3dEvidence.snapshot();
const token = window.__drift3dEvidence.beginFpsSample();
// ... attendre une fenêtre réelle (plusieurs secondes) ...
const sample = window.__drift3dEvidence.endFpsSample(token);
const after = window.__drift3dEvidence.snapshot();
```

Une future preuve de performance de Build devra enregistrer séparément : le **contexte** (route, zone si pertinent — jamais dans le runtime, uniquement dans le document de preuve), l'**échantillon brut**, la **classification**, l'**interprétation**, et les **limitations**. Un échantillon représentatif unique ne doit jamais devenir « tous les appareils sont performants » — voir `INFERRED_FROM_REPRESENTATIVE_SAMPLE` en §2, réservé précisément à ce cas avec sa limite explicite.

## 19. Limites de `DRIFT-IV-SYS-70`

- Aucun seuil de performance canonique n'est introduit par ce lot (pas de « FPS minimum », pas de « draw calls maximum » dans le runtime).
- Ce lot ne modifie ni `Drift3DScene.tsx`, ni `Drift3DFallback.tsx`, ni `Drift3DNoWebGLPath.tsx`, ni aucun fichier de piste/cue/quality/reduced-motion/no-WebGL existant.
- La session de preuve navigateur initiale qui a accompagné ce lot (`docs/evidence/DRIFT-IV-SYS-70/`, 2026-07-25) a rencontré une limitation d'environnement significative : dans l'onglet automatisé utilisé à ce moment-là, `requestAnimationFrame` ne s'était jamais déclenché (vérifié indépendamment dans deux outils de navigateur distincts), ce qui avait empêché tout le sous-arbre React du Canvas R3F — y compris les probes préexistants qui y vivent et le nouveau `Drift3DEvidenceProbe` — de jamais monter réellement dans cette session. Ceci n'était pas un défaut du code livré et ne constituait pas une régression introduite par `SYS-70`. Une session de correction (2026-07-26), menée sur une vraie instance Chrome locale avec une navigation réelle plus soutenue et un délai réel suffisant, a ensuite obtenu des mesures Canvas live réelles (snapshot actif, échantillon FPS, enveloppe cross-zone, cycle de remontage, probes historiques, invariance audio avec lecture réelle) — voir l'evidence package §2-§4 et §6 pour le détail complet des deux sessions, la première restant documentée comme historique honnête, non supprimée.
- `SYS-70` ne livre aucune interprétation « ce device est performant » pour un track ou une zone réelle — seule l'infrastructure de mesure est livrée.

## 20. Responsabilités futures

Un futur Build consommant ce harness reste responsable de choisir sa propre fenêtre d'échantillonnage, sa propre classification honnête, et sa propre documentation de contexte/limitation — sans que `drift3dEvidence.ts` n'ait besoin d'être modifié.
