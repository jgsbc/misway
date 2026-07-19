# DRIFT-IV-SYS-50 — Reduced-motion evidence

- **Lot :** `DRIFT-IV-SYS-50` — Reduced-motion contract
- **Date :** 2026-07-19
- **Méthode :** session Chrome réelle (`preview_start` / MCP browser), en appelant exclusivement `window.__drift3dReducedMotion` pour les preuves de contrat pur, et le DOM réel (`/`, `/drift/`, `/tracks/`) pour le comportement de shell réel. Toutes les fixtures invalides sont synthétiques — aucune signification artistique, jamais présentées comme une scène track reduced-motion réelle.
- **Séparation explicite :**
  - `PURE CONTRACT EVIDENCE` — Tests A, B, C, D, E : uniquement `window.__drift3dReducedMotion`, sans navigation ni DOM.
  - `REAL SHELL BEHAVIOR` — Tests F, G, H, I, K, L : navigation SPA réelle, DOM réel, audio réel.
  - `STRUCTURAL EVIDENCE` — Tests J, M, N, et la note additionnelle `window`/`document`/`navigator`/`matchMedia` avant Test J : `git grep`/`git status`, `AUTOMATED_STRUCTURAL_EVIDENCE`.
- **Incident d'environnement :** aucun. Zéro erreur console sur l'ensemble de la session.
- **Note de méthode :** la navigation SPA a été déclenchée par des clics programmatiques réels sur les éléments `<a>` du DOM (`element.click()`) plutôt que par coordonnées écran, après qu'un clic par coordonnées s'est révélé ponctuellement peu fiable dans cet environnement automatisé — cela reste un vrai clic DOM traité par le routeur Next.js, pas une simulation d'état React.

---

## 1. Résultat par scénario

| Scénario | Résultat |
|---|---|
| Test A — Résolution déterministe du mode | PASS — `resolveMode(false) = "standard"`, `resolveMode(true) = "reduced"`, exactement deux modes |
| Test B — Politiques canoniques valides + immutabilité | PASS — `validateCanonical() = []`, `Object.isFrozen` vrai sur les deux politiques, inchangées après tentative de mutation |
| Test C — Invariants `reduced` | PASS — shake/forced-travel/rapid-pulsation/aggressive-motion `false`, slow-transitions `true`, cinq garanties de sens `true` |
| Test D — Invariants `standard` | PASS — les cinq capacités de mouvement `true`, cinq garanties de sens `true` |
| Test E — Validation de fixtures invalides | PASS — les 12 fixtures détectées avec le type exact attendu, profils canoniques jamais mutés |
| Test F — Runtime standard réel inchangé | PASS — `canvasCount=1`, `audioCount=1`, les quatre probes présents, aucun autoplay |
| Test G — Runtime reduced-motion réel | PASS — `canvasCount=0`, `audioCount=1`, probe reduced-motion seul présent, fallback correct, aucun autoplay |
| Test H — Changement live de préférence | PASS — `Canvas` démonté/remonté proprement dans les deux sens, probe shell stable (même instance), `audioCount=1` |
| Test I — Audio global non contrôlé par reduced motion | PASS — lecture explicite non interrompue par le fallback reduced-motion |
| Note additionnelle — `window`/`document`/`navigator`/`matchMedia` | PASS — 2 correspondances réelles, toutes deux dans le commentaire d'en-tête ; zéro lecture/branche/import/dépendance/usage runtime fonctionnel |
| Test J — Séparation Quality Tier | PASS — preuve structurelle, zéro occurrence fonctionnelle |
| Test K — Séparation no-WebGL | PASS — fallback `no-webgl` distinct, probe reduced-motion toujours présent |
| Test L — Cleanup/remount du probe shell | PASS — probe absent au démontage, nouvelle instance au remontage |
| Test M — Absence d'invention artistique | PASS — preuve structurelle, zéro occurrence |
| Test N — Scope runtime | PASS — preuve structurelle, fichiers protégés inchangés |

---

## 2. Test A — Résolution déterministe du mode (`PURE CONTRACT EVIDENCE`)

```json
{
  "modes": ["standard", "reduced"],
  "resolveFalse": "standard",
  "resolveTrue": "reduced"
}
```

Exactement deux résultats canoniques, aucun fallback silencieux, aucun troisième mode.

## 3. Test B — Politiques canoniques valides + immutabilité runtime (`PURE CONTRACT EVIDENCE`)

```json
{
  "validateCanonical": [],
  "validateStandard": [],
  "validateReduced": [],
  "frozen": {
    "standard": { "isFrozenPolicy": true, "isFrozenMotion": true, "isFrozenMeaning": true, "unchanged": true },
    "reduced":  { "isFrozenPolicy": true, "isFrozenMotion": true, "isFrozenMeaning": true, "unchanged": true }
  }
}
```

Tentative de mutation contrôlée (`policy.motion.allowCameraShake`, `policy.mode`, `policy.meaning.poses`) sur les deux politiques : `Object.isFrozen` vrai sur les trois axes, politique canonique inchangée (`unchanged: true`) dans les deux cas.

## 4. Test C — Invariants `reduced` (`PURE CONTRACT EVIDENCE`)

```json
{
  "mode": "reduced",
  "motion": {
    "allowCameraShake": false,
    "allowForcedCameraTravel": false,
    "allowRapidPulsation": false,
    "allowAggressiveMotion": false,
    "allowSlowTransitions": true
  },
  "meaning": { "poses": true, "states": true, "lighting": true, "materials": true, "beforeAfter": true }
}
```

## 5. Test D — Invariants `standard` (`PURE CONTRACT EVIDENCE`)

```json
{
  "mode": "standard",
  "motion": {
    "allowCameraShake": true,
    "allowForcedCameraTravel": true,
    "allowRapidPulsation": true,
    "allowAggressiveMotion": true,
    "allowSlowTransitions": true
  },
  "meaning": { "poses": true, "states": true, "lighting": true, "materials": true, "beforeAfter": true }
}
```

## 6. Test E — Validation de fixtures invalides (`PURE CONTRACT EVIDENCE`)

Douze fixtures synthétiques (1 mode invalide, 5 non-conformités de mouvement en `reduced`, 1 non-conformité de mouvement en `standard`, 5 garanties de sens à `false`), dérivées des politiques canoniques réelles par copie superficielle (les politiques canoniques elles-mêmes ne sont jamais modifiées) :

```json
{
  "invalidMode": [{ "type": "invalid-mode", "mode": "ultra" }],
  "reducedShakeTrue": [{ "type": "motion-capability-mismatch", "mode": "reduced", "capability": "allowCameraShake" }],
  "reducedForcedTravelTrue": [{ "type": "motion-capability-mismatch", "mode": "reduced", "capability": "allowForcedCameraTravel" }],
  "reducedRapidPulsationTrue": [{ "type": "motion-capability-mismatch", "mode": "reduced", "capability": "allowRapidPulsation" }],
  "reducedAggressiveMotionTrue": [{ "type": "motion-capability-mismatch", "mode": "reduced", "capability": "allowAggressiveMotion" }],
  "reducedSlowTransitionsFalse": [{ "type": "motion-capability-mismatch", "mode": "reduced", "capability": "allowSlowTransitions" }],
  "standardWrongCapability": [{ "type": "motion-capability-mismatch", "mode": "standard", "capability": "allowCameraShake" }],
  "posesFalse": [{ "type": "meaning-guarantee-not-true", "mode": "reduced", "guarantee": "poses" }],
  "statesFalse": [{ "type": "meaning-guarantee-not-true", "mode": "reduced", "guarantee": "states" }],
  "lightingFalse": [{ "type": "meaning-guarantee-not-true", "mode": "reduced", "guarantee": "lighting" }],
  "materialsFalse": [{ "type": "meaning-guarantee-not-true", "mode": "reduced", "guarantee": "materials" }],
  "beforeAfterFalse": [{ "type": "meaning-guarantee-not-true", "mode": "reduced", "guarantee": "beforeAfter" }]
}
```

Chaque défaut détecté avec le type exact attendu.

## 7. Test F — Runtime standard réel inchangé (`REAL SHELL BEHAVIOR`)

Sur `/drift/`, préférence standard, WebGL disponible :

```json
{
  "canvasCount": 1,
  "audioCount": 1,
  "audioPaused": true,
  "hasRM": true,
  "hasQuality": true,
  "hasCue": true,
  "hasSig": true,
  "resolveModeFalse": "standard"
}
```

Les quatre probes dev (`__drift3dReducedMotion`, `__drift3dQuality`, `__drift3dCueResolver`, `__drift3dSignatureArbitration`) sont présents simultanément. Aucun autoplay.

## 8. Test G — Runtime reduced-motion réel (`REAL SHELL BEHAVIOR`)

Préférence forcée via un `MediaQueryList` factice (`matches: true`) installé avant une navigation SPA réelle (clic DOM réel sur `<a href="/drift/">`) vers `/drift/` :

```json
{
  "canvasCount": 0,
  "audioCount": 1,
  "audioPaused": true,
  "hasRM": true,
  "hasQuality": false,
  "hasCue": false,
  "hasSig": false
}
```

Fallback visible confirmé (texte de page réel) :

```text
REDUCED MOTION
The 3D room stays closed today.
Motion is reduced, so this route keeps the quieter path open.
OPEN 2D LAB
BACK TO DRIFT
```

Les probes `Canvas` (`quality`, `cueResolver`, `signatureArbitration`) sont absents parce que le `Canvas` n'est pas monté — **cela ne signifie pas `reduced-motion = LOW`**. Le probe reduced-motion, lui, reste présent (il appartient au shell `Drift3DClient`).

## 9. Test H — Changement live de préférence (`REAL SHELL BEHAVIOR`)

Faux `MediaQueryList` contrôlable (`matches`, `addEventListener("change", ...)`, `removeEventListener("change", ...)`) installé une seule fois, piloté dans les deux sens :

- Départ (`reduced`, suite du Test G) : `canvasCount=0`, probe reduced-motion présent, capturé comme `oldProbe`.
- `change → matches=false` : `canvasCount=1`, `audioCount=1`, `hasQuality=true` (probes `Canvas` réapparus), `window.__drift3dReducedMotion` **même instance** (`sameRMInstance: true`), fallback disparu.
- `change → matches=true` : `canvasCount=0`, `audioCount=1`, fallback reduced-motion réaffiché (texte de page confirmé), `window.__drift3dReducedMotion` toujours **même instance** (`sameRMInstance: true`).

Le probe shell-level reste la même instance pendant tout le cycle, car son effet (`useEffect(..., [])` dans `Drift3DClient.tsx`) ne se réexécute pas lors d'un changement de préférence — seul le rendu conditionnel du `Canvas` change. Aucun timer utilisé pour piloter ce test : le changement est déclenché en appelant directement les callbacks `change` enregistrés par le composant.

## 10. Test I — Audio global non contrôlé par reduced motion (`REAL SHELL BEHAVIOR`, `MEASURED`)

**Cas 1 — aucun audio lancé**, entrée sur `/drift/` en reduced-motion : `audioCount=1`, `audio.paused=true`, aucun autoplay (voir Test G).

**Cas 2 — audio explicitement lancé auparavant** : track lancée explicitement depuis `/tracks/` via son bouton « Play » réel (slug non codé en dur dans `SYS-50` — la track utilisée pour cette preuve n'a aucune signification pour ce lot). Puis navigation SPA réelle vers `/drift/` avec la préférence reduced-motion déjà active :

```json
{
  "canvasCount": 0,
  "audioCount": 1,
  "audioPaused": false,
  "matches": true
}
```

La lecture a continué réellement pendant l'affichage du fallback reduced-motion — mesure réelle, pas une inférence. `src/lib/drift3dReducedMotion.ts` ne contient aucune commande audio (voir preuve structurelle, §12) : la continuité observée est cohérente avec cette absence de commande, pas seulement une coïncidence d'environnement.

### Note additionnelle — `window`/`document`/`navigator`/`matchMedia` (`STRUCTURAL EVIDENCE`)

```powershell
git grep -n "window\|document\|navigator\|matchMedia\|devicePixelRatio\|deviceMemory\|hardwareConcurrency" -- src/lib/drift3dReducedMotion.ts
```

Résultat réel (2 lignes, toutes deux dans le commentaire d'en-tête du module) :

```text
src/lib/drift3dReducedMotion.ts:13: * This module never reads `matchMedia`, `navigator`, `window` or `document`
src/lib/drift3dReducedMotion.ts:157: * `matchMedia` — the caller (`Drift3DClient`) is responsible for reading
```

Ces deux occurrences appartiennent au docstring explicatif du module, qui énumère précisément les API navigateur que le module s'interdit de lire — elles ne sont ni une propriété, ni une branche, ni une affectation runtime, ni un import, ni une dépendance. **Le grep retourne des correspondances uniquement dans un commentaire/docstring pour `window`/`document`/`navigator`/`matchMedia` ; il n'existe aucune lecture fonctionnelle, aucune branche, aucune affectation, aucun import, aucune dépendance ni aucun usage runtime de ces API navigateur dans `drift3dReducedMotion.ts`.** Il serait incorrect d'affirmer que ce grep retourne zéro occurrence ou zéro référence littérale — il en retourne deux, toutes deux non fonctionnelles. Le contrat §8 (« `src/lib/drift3dReducedMotion.ts` ne lit jamais `window`, `document`, `navigator` ou `matchMedia` ») reste exact : c'est une affirmation de comportement fonctionnel, pas une affirmation d'absence littérale du texte.

## 11. Test J — Séparation Quality Tier (`STRUCTURAL EVIDENCE`)

```powershell
git grep -n "drift3dQuality\|getDrift3DQualityProfile\|setTier\|qualityTier" -- src/lib/drift3dReducedMotion.ts
```

Résultat : aucune occurrence. Dans le runtime reduced actuel, la sonde quality est absente uniquement parce que le `Canvas` est absent — jamais présenté dans cette preuve comme « reduced motion selects LOW ».

## 12. Test K — Séparation no-WebGL (`REAL SHELL BEHAVIOR`)

Préférence reduced-motion désactivée (`matches: false`), WebGL indisponible (`HTMLCanvasElement.prototype.getContext` renvoyant `null` pour `webgl2`/`webgl`/`experimental-webgl`), navigation SPA réelle vers `/drift/` :

```json
{
  "canvasCount": 0,
  "audioCount": 1,
  "hasRM": true,
  "resolveModeFalse": "standard"
}
```

Fallback visible confirmé :

```text
NO WEBGL
This browser cannot open the 3D room.
The 2D lab remains the reference map. Nothing needs to play here.
```

Le probe reduced-motion reste présent car il appartient au shell `Drift3DClient`, pas au `Canvas`. Aucune modification du contenu narratif no-WebGL.

## 13. Test L — Cleanup/remount du probe shell (`REAL SHELL BEHAVIOR`)

Chemin standard (WebGL restauré, `matches: false`) :

- Sur `/drift/` : probe capturé comme `oldProbe`.
- Navigation SPA réelle `/drift/ → /` : `window.__drift3dReducedMotion` absent, `audioCount=1`.
- Navigation SPA réelle `/ → /drift/` : probe présent, **nouvelle instance** (`sameInstance: false`), `canvasCount=1`, `audioCount=1`.

## 14. Test M — Absence d'invention artistique (`STRUCTURAL EVIDENCE`)

```powershell
git grep -in "eux-gainent\|eteeaooete\|foolfoule\|jazzypling\|cadence-lock\|wave-ritual\|deviation" -- src/lib/drift3dReducedMotion.ts
```

Résultat : aucune occurrence. Le module ne connaît aucune track, aucune phase, aucun slug, aucune Cue Map.

## 15. Test N — Scope runtime (`STRUCTURAL EVIDENCE`, `AUTOMATED_STRUCTURAL_EVIDENCE`)

`git status --short` confirme qu'aucun des fichiers suivants n'a changé : `Drift3DFallback.tsx`, `Drift3DCanvas.tsx`, `Drift3DScene.tsx`, `drift3dQuality.ts`. `git diff --stat src/components/drift-3d/Drift3DClient.tsx` confirme une addition nette (listener `matchMedia` existant conservé tel quel, résolveur pur ajouté, harness dev shell-level ajouté, aucun nouveau timer, aucune commande audio, aucune commande quality).

---

## 16. Console

Zéro erreur console sur l'ensemble de la session (vérifié avec filtre erreurs). Aucun incident d'environnement.

## 17. Limites

- La track utilisée pour le Test I (Cas 2) est une track catalogue réelle lancée via l'UI existante ; son identité n'a aucune signification pour ce lot et n'est mentionnée que pour rendre la preuve vérifiable.
- Le faux `MediaQueryList` (Tests G, H, K) est un contrôle d'environnement nécessaire — `window.matchMedia` n'est pas autrement pilotable dans une session Chrome automatisée standard sans changer les réglages système. Ceci reste un remplacement fidèle de l'API réelle (mêmes méthodes, même contrat), pas une simulation du composant.
- Aucun fichier `.png` committé sous ce répertoire — même limite d'environnement que les lots précédents.

---

## 18. Décision de gate

| Critère | Statut |
|---|---|
| deux modes canoniques exacts | PASS |
| résolution true/false déterministe | PASS |
| politiques frozen | PASS |
| reduced supprime shake/forced-travel/rapid-pulsation/aggressive-motion | PASS |
| reduced conserve slow transitions | PASS |
| cinq garanties de sens `true` (les deux modes) | PASS |
| standard conserve ses capacités | PASS |
| reduced motion n'importe pas Quality Tier | PASS |
| reduced motion ne sélectionne pas LOW | PASS |
| reduced motion distinct de no-WebGL | PASS |
| comportement shell actuel reduced → fallback inchangé | PASS |
| aucun Canvas monté dans le chemin reduced actuel | PASS |
| player global unique | PASS (`audioCount=1` partout) |
| aucun autoplay | PASS |
| changement live de préférence propre | PASS |
| probe shell-level présent même en fallback | PASS |
| cleanup/remount propre | PASS |
| aucune logique track-specific | PASS |
| aucune Cue Map | PASS |
| aucune abstraction dramaturgique partagée | PASS |
| aucun changement `Drift3DFallback` | PASS |
| aucun changement artistique réel | PASS |
| lint et build passent | PASS |

**Décision : `DRIFT-IV-SYS-50` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-60` → `NEXT_AFTER_MERGE`.**
