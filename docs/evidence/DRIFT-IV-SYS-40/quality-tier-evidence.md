# DRIFT-IV-SYS-40 — Quality tier evidence

- **Lot :** `DRIFT-IV-SYS-40` — Quality tiers preserving identity
- **Date :** 2026-07-19
- **Méthode :** session Chrome réelle (`preview_start` / MCP browser), navigateur au premier plan, sur `/drift/`, en appelant exclusivement `window.__drift3dQuality`. Toutes les valeurs de base (`130`, `2400`, `512`) et tous les tiers/candidats de profil invalides sont synthétiques/génériques — aucune signification artistique, jamais appliqués à `FoolfouleCrowd`, au `ScatterField` ou au `Reflector` réels.
- **Note de méthode :** le harness vit dans `Drift3DCanvas.tsx`, hors de l'arbre react-three-fiber — disponible dès le montage du composant, sans dépendre du montage interne du `Canvas` ni d'un `requestAnimationFrame`.
- **Incident d'environnement :** aucun. Zéro erreur console sur l'ensemble de la session (vérifié avec filtre erreurs).

---

## 1. Résultat par scénario

| Scénario | Résultat |
|---|---|
| Test A — Profils canoniques valides | PASS — `tiers = ["low","medium","high"]`, `validateCanonical() = []`, chaque `validate(getProfile(tier)) = []` |
| Test B — Immutabilité runtime | PASS — `Object.isFrozen` vrai sur le profil, ses capacités et son identité pour les trois tiers ; tentative de mutation sans effet observable |
| Test C — Monotonicité | PASS sur les sept capacités : `low <= medium <= high`, `high === 1` |
| Test D — Identité préservée | PASS — égalité sérialisée stricte des quatre garanties sur les trois tiers |
| Test E — Réduction déterministe de quantité | PASS — population `52/91/130`, scatter `1200/1800/2400` |
| Test F — Réduction déterministe de résolution | PASS — `256/384/512` pour reflection et dynamic texture |
| Test G — Validation des profils invalides | PASS — les neuf fixtures détectées avec le type exact attendu, y compris la monotonicité synthétique |
| Test H — Absence de politique device | PASS — preuve structurelle, zéro occurrence fonctionnelle |
| Test I — Absence de style | PASS — 2 correspondances réelles, toutes deux dans le commentaire d'en-tête explicatif ; zéro propriété/logique de style fonctionnelle |
| Test J — Runtime actuel inchangé | PASS — `canvasCount=1`, `audioCount=1`, probe présent, API limitée au calcul |
| Test K — Cleanup/remount | PASS — probe absent au démontage, nouvelle instance au remontage, aucun autoplay |
| Test L — Fallbacks | PASS — `canvasCount=0`, probe absent, `audioCount=1` dans les deux cas |

---

## 2. Test A — Profils canoniques valides

```json
{
  "tiers": ["low", "medium", "high"],
  "validateCanonical": [],
  "validateLow": [],
  "validateMedium": [],
  "validateHigh": []
}
```

Les trois profils canoniques ne produisent aucune issue, individuellement ou collectivement.

## 3. Test B — Immutabilité runtime

Pour chacun des trois tiers, tentative de mutation contrôlée (`profile.capabilities.populationScale = 999`, `profile.tier = "mutated"`, `profile.identity.signatureObjects = false`) depuis le contexte d'évaluation du navigateur (mode non strict) :

```json
{
  "low":    { "isFrozenProfile": true, "isFrozenCapabilities": true, "isFrozenIdentity": true, "unchanged": true },
  "medium": { "isFrozenProfile": true, "isFrozenCapabilities": true, "isFrozenIdentity": true, "unchanged": true },
  "high":   { "isFrozenProfile": true, "isFrozenCapabilities": true, "isFrozenIdentity": true, "unchanged": true }
}
```

`Object.isFrozen` est vrai sur le profil, `capabilities` et `identity` pour les trois tiers. Les trois tentatives de mutation n'ont levé aucune exception observable dans ce contexte d'évaluation (assignation silencieusement ignorée, comportement standard d'un objet gelé en mode non strict) — comportement réel documenté sans le masquer. Le point important, conforme à l'instruction : le profil canonique reste inchangé (`unchanged: true`) dans les trois cas.

## 4. Test C — Monotonicité

```json
{
  "populationScale":               { "low": 0.40, "medium": 0.70, "high": 1, "monotone": true, "highIsOne": true },
  "scatterScale":                  { "low": 0.50, "medium": 0.75, "high": 1, "monotone": true, "highIsOne": true },
  "dynamicTextureResolutionScale": { "low": 0.50, "medium": 0.75, "high": 1, "monotone": true, "highIsOne": true },
  "renderProbeScale":              { "low": 0.50, "medium": 0.75, "high": 1, "monotone": true, "highIsOne": true },
  "reflectionResolutionScale":     { "low": 0.50, "medium": 0.75, "high": 1, "monotone": true, "highIsOne": true },
  "backgroundDetailScale":         { "low": 0.50, "medium": 0.75, "high": 1, "monotone": true, "highIsOne": true },
  "secondaryLoopScale":            { "low": 0.35, "medium": 0.65, "high": 1, "monotone": true, "highIsOne": true }
}
```

PASS sur les sept capacités.

## 5. Test D — Identité préservée

```json
{
  "low":    { "worldTopology": true, "coreNavigation": true, "signatureObjects": true, "primaryCue": true },
  "medium": { "worldTopology": true, "coreNavigation": true, "signatureObjects": true, "primaryCue": true },
  "high":   { "worldTopology": true, "coreNavigation": true, "signatureObjects": true, "primaryCue": true },
  "allEqual": true
}
```

Égalité sérialisée stricte confirmée (`allEqual: true`). Cette preuve ne prétend PAS qu'une signature artistique réelle a été rendue en `LOW` — elle prouve uniquement le contrat générique.

## 6. Test E — Réduction déterministe de quantité

Base population = `130`, base scatter = `2400`, minimum = `1` :

```json
{
  "population": { "low": 52, "medium": 91, "high": 130 },
  "scatter":    { "low": 1200, "medium": 1800, "high": 2400 }
}
```

Ces nombres sont des calculs du harness. Ils ne sont PAS appliqués à `FoolfouleCrowd` ou au `ScatterField` réel dans ce lot.

## 7. Test F — Réduction déterministe de résolution

Base = `512` :

```json
{
  "reflection":      { "low": 256, "medium": 384, "high": 512 },
  "dynamicTexture":  { "low": 256, "medium": 384, "high": 512 }
}
```

Le `Reflector` actuel est effectivement configuré à `512` (voir inventaire §37 du lot canonique), mais `SYS-40` ne modifie pas ce `Reflector`. La preuve valide uniquement le calcul de budget futur.

## 8. Test G — Validation des profils invalides

Fixtures synthétiques, dérivées du profil `low` réel par copie superficielle (le profil canonique lui-même n'est jamais modifié) :

```json
{
  "capabilityZero":       [{ "type": "capability-not-positive",  "capability": "populationScale" }],
  "capabilityNegative":   [{ "type": "capability-not-positive",  "capability": "populationScale" }],
  "capabilityAboveOne":   [{ "type": "capability-above-one",     "capability": "populationScale" }],
  "capabilityInfinity":   [{ "type": "non-finite-capability",    "capability": "populationScale" }],
  "capabilityNaN":        [{ "type": "non-finite-capability",    "capability": "populationScale" }],
  "identitySignatureObjectsFalse": [{ "type": "identity-signature-objects-not-true" }],
  "identityPrimaryCueFalse":       [{ "type": "identity-primary-cue-not-true" }],
  "invalidTier":          [{ "type": "invalid-tier", "tier": "ultra" }],
  "nonMonotoneSet": [{
    "type": "monotonicity-violation",
    "capability": "scatterScale",
    "message": "Capability \"scatterScale\" violates low <= medium <= high (low=0.9, medium=0.75, high=1)."
  }]
}
```

Chaque défaut est détecté avec le type exact attendu. La fixture `nonMonotoneSet` (`low.scatterScale = 0.9 > medium.scatterScale = 0.75`) a été construite en copiant les valeurs des profils canoniques réels dans de nouveaux objets — **aucun profil canonique n'a été modifié pour réaliser ce test**, conformément à l'instruction.

## 9. Test H — Absence de politique device (preuve structurelle)

```powershell
git grep -n "deviceMemory|hardwareConcurrency|userAgent|devicePixelRatio|matchMedia|navigator" -- src/lib/drift3dQuality.ts
```

Résultat : aucune occurrence. Le Quality Tier ne choisit pas son propre tier.

## 10. Test I — Absence de style (preuve structurelle)

```powershell
git grep -in "color|palette|hue|saturation|fog|toneMapping|exposure|trackSlug|sourceSlug|phaseId" -- src/lib/drift3dQuality.ts
```

Résultat réel (2 lignes, toutes deux dans le commentaire d'en-tête du fichier) :

```text
src/lib/drift3dQuality.ts:7: * pilots CAPACITIES (how much of something renders), never STYLES (palette,
src/lib/drift3dQuality.ts:8: * color script, fog, narrative light, a signature's identity, a Cue Map, or
```

Ces deux occurrences appartiennent à la phrase explicative du docstring de tête du module (« A quality tier pilots CAPACITIES … never STYLES (palette, color script, fog, narrative light, a signature's identity, a Cue Map, or dramaturgical pacing) — those never appear here, functionally or as a dependency. ») — elles énumèrent précisément les concepts que le module s'interdit, à des fins de documentation de frontière de contrat. Vérification ligne par ligne : aucune des deux occurrences n'est une propriété (`interface`/`type` field), une branche (`if`/ternaire), une affectation runtime, un import, ou une configuration de style — les deux sont strictement à l'intérieur du bloc `/** … */` situé avant tout code exécutable du fichier (lignes 1–17).

**Résultat : PASS — correspondances uniquement dans un commentaire explicatif ; aucune propriété de style fonctionnelle ; aucune branche liée au style ; aucun import ou comportement runtime lié au style.** Il serait incorrect d'affirmer que ce grep retourne zéro occurrence — il en retourne deux, toutes deux non fonctionnelles.

## 11. Test J — Runtime actuel inchangé

```json
{
  "canvasCount": 1,
  "audioCount": 1,
  "audioPaused": true,
  "probeKeys": ["tiers", "getProfile", "validate", "validateCanonical", "validateSet", "scaleCount", "scaleDimension"],
  "hasApply": "undefined",
  "hasSetTier": "undefined",
  "hasForce": "undefined"
}
```

Aucun autoplay, aucune nouvelle UI, aucun changement de route, aucune prop quality propagée à `Drift3DScene` (vérifié structurellement, §12). Le probe permet `getProfile`/`validate`/`scale*`, jamais `apply`/`setTier`/`force`.

## 12. Test K — Cleanup/remount

- Sur `/drift/` : probe présent, capturé dans `window.__oldQualityProbe`.
- Navigation SPA `/drift/ → /` (clic réel sur `<Link>`) : `window.__drift3dQuality` absent, `canvasCount = 0`, `audioCount = 1`.
- Navigation SPA `/ → /drift/` (clic réel sur `<Link>`) : probe présent, `probe !== oldProbe` (`sameInstanceAsBefore: false`), `canvasCount = 1`, `audioCount = 1`, `audioPaused: true` (aucun autoplay).

## 13. Test L — Fallbacks

**Reduced motion** (override `window.matchMedia("(prefers-reduced-motion: reduce)")` → `matches: true`, appliqué avant une navigation SPA réelle vers `/drift/`) :

```json
{ "canvasCount": 0, "audioCount": 1, "hasProbe": false }
```

**No-WebGL** (override `HTMLCanvasElement.prototype.getContext` renvoyant `null` pour `webgl2`/`webgl`/`experimental-webgl`, `matchMedia` restauré à `matches: false`, appliqué avant une navigation SPA réelle vers `/drift/`) :

```json
{ "canvasCount": 0, "audioCount": 1, "hasProbe": false }
```

**Reduced motion and no-WebGL are separate fallback contracts. They are not quality tiers.** Aucun des deux tests ne prétend qu'un tier `LOW` a été appliqué — les deux fallbacks restent, comme avant ce lot, le périmètre de `SYS-50`/`SYS-60`.

---

## 14. Preuve structurelle du scope (§37 du lot canonique)

```powershell
git grep -n "setInterval|setTimeout|requestAnimationFrame|useFrame" -- src/lib/drift3dQuality.ts
git grep -n "deviceMemory|hardwareConcurrency|userAgent|devicePixelRatio|matchMedia|navigator" -- src/lib/drift3dQuality.ts
git grep -in "eux-gainent|eteeaooete|foolfoule|jazzypling|cadence-lock|wave-ritual|deviation" -- src/lib/drift3dQuality.ts
git grep -n "drift3dAudioClock|drift3dCueResolver|drift3dSceneLifecycle|drift3dSignatureArbitration|@/lib/tracks" -- src/lib/drift3dQuality.ts
```

Toutes ces recherches retournent zéro occurrence fonctionnelle. `git diff --stat` confirme que `Drift3DCanvas.tsx` a reçu une addition pure (import + un nouveau `useEffect`) : aucun nouvel état React pour une qualité active, aucun `setTier`, aucune prop quality vers `Drift3DScene`. `Drift3DScene.tsx`, `Drift3DScatterField.tsx`, `Drift3DEffects.tsx`, `Drift3DLandmark.tsx` et `drift3dTextureFactory.ts` n'ont reçu aucune modification (`git status --short` vide sur ces cinq fichiers).

Classification : `AUTOMATED_STRUCTURAL_EVIDENCE`.

## 15. Console

Zéro erreur console sur l'ensemble de la session (vérifié avec filtre erreurs après chaque scénario). Aucun incident d'environnement rencontré dans ce lot.

## 16. Limites

- Les fixtures des Tests E/F (`130`, `2400`, `512`) sont des bases numériques génériques de harness, sans rapport mesuré avec une population, un scatter ou une résolution réellement configurés dans une scène de production — elles ne sont pas présentées comme telles.
- Le Test B observe l'absence d'exception en mode non strict ; ce comportement (assignation silencieusement ignorée) est documenté tel quel plutôt que masqué.
- Aucun fichier `.png` committé sous ce répertoire — même limite d'environnement que les lots précédents.

---

## 17. Décision de gate

| Critère | Statut |
|---|---|
| exactement trois tiers canoniques | PASS |
| profils déterministes | PASS |
| profils runtime immuables | PASS |
| toutes les capacités dans `]0,1]` | PASS |
| `HIGH = 1` pour toutes les capacités | PASS |
| `LOW <= MEDIUM <= HIGH` partout | PASS |
| garanties d'identité identiques et toutes `true` | PASS |
| aucun style fonctionnel dans le contrat | PASS (2 correspondances de grep, toutes deux commentaire d'en-tête explicatif — voir Test I) |
| aucune sélection automatique | PASS (preuve structurelle) |
| aucun device sniffing | PASS (preuve structurelle) |
| mobile ≠ LOW | PASS (aucune logique mobile dans le module) |
| reduced motion ≠ LOW | PASS (Test L) |
| no-WebGL ≠ LOW | PASS (Test L) |
| helpers quantité/résolution déterministes | PASS (Tests E/F) |
| aucun NaN/Infinity | PASS |
| aucun tier réellement appliqué au monde | PASS (Test J, §14) |
| aucun fichier artistique modifié | PASS (§14) |
| probe dev read-only | PASS |
| probe supprimé au démontage | PASS (Test K) |
| fallbacks sans probe résiduel | PASS (Test L) |
| player global toujours unique | PASS (`audioCount = 1` partout) |
| lint et build passent | PASS |

**Décision : `DRIFT-IV-SYS-40` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-50` → `NEXT_AFTER_MERGE`.**
