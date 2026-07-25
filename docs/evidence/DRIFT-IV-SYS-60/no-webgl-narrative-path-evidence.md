# DRIFT-IV-SYS-60 — No-WebGL narrative path evidence

- **Lot :** `DRIFT-IV-SYS-60` — No-WebGL narrative path
- **Date :** 2026-07-19
- **Méthode :** session Chrome réelle (`preview_start` / MCP browser, serveur redémarré à neuf pour ce lot), en appelant exclusivement `window.__drift3dNoWebGL` pour les preuves de contrat pur, et le DOM/audio réel (`/`, `/drift/`, `/drift-lab/`, `/tracks/`) pour le comportement de shell réel.
- **Séparation explicite (§23) :**
  - `PURE CONTRACT EVIDENCE` — Tests A, B, C : uniquement `window.__drift3dNoWebGL`, sans navigation.
  - `REAL NO-WEBGL SHELL EVIDENCE` — Tests D, E, F, H, I, J, K, L : navigation SPA réelle, DOM réel.
  - `LISTENING PATH EVIDENCE` — Test G : lecture explicite réelle, continuité audio réelle.
  - `STRUCTURAL EVIDENCE` — Tests M, N, O : `git grep`/`git status`, `AUTOMATED_STRUCTURAL_EVIDENCE`.
- **Incident d'environnement :** aucun. Zéro erreur console sur l'ensemble de la session.
- **Note de méthode :** la navigation SPA a été déclenchée par des clics réels (coordonnées écran ou `element.click()` programmatique sur les éléments `<a>` du DOM lorsque plus fiable) — toujours un vrai clic DOM traité par le routeur Next.js. Le no-WebGL a été simulé en remplaçant `HTMLCanvasElement.prototype.getContext` pour renvoyer `null` sur `webgl2`/`webgl`/`experimental-webgl`, restauré explicitement à la fin de chaque scénario qui n'en avait plus besoin.

---

## 1. Résultat par scénario

| Scénario | Résultat |
|---|---|
| Test A — Contrat canonique | PASS — `validateCanonical() = []`, contrat exact attendu |
| Test B — Immutabilité | PASS — `Object.isFrozen` vrai sur le chemin, `destinations`, chaque destination, `guarantees` ; inchangé après tentative de mutation |
| Test C — Fixtures invalides | PASS — 18 fixtures détectées avec le type exact attendu, contrat canonique jamais muté |
| Test D — Runtime no-WebGL réel | PASS — `canvasCount=0`, `audioCount=1`, panneau statique visible, `Open 2D Lab`/`Tracks` présents, aucun autoplay |
| Test E — Carte 2D accessible | PASS — `/drift-lab` chargé via clic réel, zéro erreur console |
| Test F — Catalogue accessible | PASS — `/tracks` chargé, 26 tracks distincts observés |
| Test G — Listening path réel | PASS — lecture explicite, pause/reprise via le contrôle global existant sur `/tracks`, continuité audio réelle sur `/drift` no-WebGL |
| Test H — Entrée no-WebGL sans lecture | PASS — `audioCount=1`, `audio.paused=true`, aucun autoplay |
| Test I — Reduced-motion prioritaire | PASS — priorité reduced-motion intacte, panneau no-WebGL non rendu |
| Test J — Retour au WebGL | PASS — `Canvas` présent, panneau absent, continuité audio, nouvelle instance de probe (remount de route) |
| Test K — Cleanup/remount du probe | PASS — probe absent au démontage, nouvelle instance au remontage |
| Test L — Aucune fausse promesse d'interaction | PASS — tutoriel de conduite absent sur les deux fallbacks, présent en mode standard |
| Test M — BasePath/navigation | PASS — preuve structurelle, `next/link` partout, build statique PASS |
| Test N — Scope structurel | PASS — timers/imports/vocabulaire artistique : zéro occurrence ; vocabulaire Canvas/WebGL : 7 correspondances réelles, reclassées (sémantique `mounts3DCanvas` + 1 commentaire), zéro import/montage Canvas réel, zéro usage fonctionnel Three.js/WebGLRenderer/getContext |
| Test O — Aucun asset artistique | PASS — `public/**` inchangé |

---

## 2. Test A — Contrat canonique (`PURE CONTRACT EVIDENCE`)

```json
{
  "validateCanonical": [],
  "path": {
    "representation": "panel",
    "requiresWebGL": false,
    "mounts3DCanvas": false,
    "audioAuthority": "global-player",
    "autoplay": false,
    "promises3DInteraction": false,
    "destinations": [
      { "id": "map", "href": "/drift-lab", "role": "map" },
      { "id": "tracks", "href": "/tracks", "role": "listening" }
    ],
    "guarantees": {
      "usefulRoute": true,
      "catalogueAccessible": true,
      "mapAccessible": true,
      "globalAudioPreserved": true,
      "staticLightweightRepresentation": true,
      "honestInteractionBoundary": true
    }
  }
}
```

## 3. Test B — Immutabilité (`PURE CONTRACT EVIDENCE`)

Tentative de mutation contrôlée (`path.representation`, `path.destinations.push(...)`, `path.destinations[0].href`, `path.guarantees.usefulRoute`) :

```json
{
  "isFrozenPath": true,
  "isFrozenDestinations": true,
  "isFrozenDestination0": true,
  "isFrozenDestination1": true,
  "isFrozenGuarantees": true,
  "unchanged": true
}
```

## 4. Test C — Fixtures invalides (`PURE CONTRACT EVIDENCE`)

**18 fixtures synthétiques** dérivées du contrat canonique réel par copie superficielle (le contrat canonique lui-même n'est jamais modifié) : 6 au niveau du contrat, 6 au niveau des destinations, 6 au niveau des garanties (une fixture par garantie nommée, pour une couverture complète).

```json
{
  "representationNotPanel": [{ "type": "representation-not-panel" }],
  "requiresWebGLTrue": [{ "type": "requires-webgl-not-false" }],
  "mounts3DCanvasTrue": [{ "type": "mounts-3d-canvas-not-false" }],
  "audioAuthorityWrong": [{ "type": "audio-authority-not-global-player" }],
  "autoplayTrue": [{ "type": "autoplay-not-false" }],
  "promises3DInteractionTrue": [{ "type": "promises-3d-interaction-not-false" }],
  "mapDestinationMissing": [{ "type": "destination-missing", "id": "map" }],
  "tracksDestinationMissing": [{ "type": "destination-missing", "id": "tracks" }],
  "duplicateDestinationId": [
    { "type": "destination-duplicate-id", "id": "map" },
    { "type": "destination-missing", "id": "tracks" }
  ],
  "wrongMapHref": [{ "type": "destination-invalid-href", "id": "map" }],
  "wrongTracksHref": [{ "type": "destination-invalid-href", "id": "tracks" }],
  "wrongTracksRole": [{ "type": "destination-invalid-role", "id": "tracks" }],
  "guarantee_usefulRoute_false": [{ "type": "guarantee-not-true", "guarantee": "usefulRoute" }],
  "guarantee_catalogueAccessible_false": [{ "type": "guarantee-not-true", "guarantee": "catalogueAccessible" }],
  "guarantee_mapAccessible_false": [{ "type": "guarantee-not-true", "guarantee": "mapAccessible" }],
  "guarantee_globalAudioPreserved_false": [{ "type": "guarantee-not-true", "guarantee": "globalAudioPreserved" }],
  "guarantee_staticLightweightRepresentation_false": [{ "type": "guarantee-not-true", "guarantee": "staticLightweightRepresentation" }],
  "guarantee_honestInteractionBoundary_false": [{ "type": "guarantee-not-true", "guarantee": "honestInteractionBoundary" }]
}
```

Chaque défaut détecté avec le type exact attendu. Notez que la fixture `duplicateDestinationId` (construite en dupliquant la destination `map` et en perdant ainsi `tracks`) produit honnêtement **deux** issues distinctes (`destination-duplicate-id` et `destination-missing`) — comportement correct du validateur, documenté tel quel.

## 5. Test D — Runtime no-WebGL réel (`REAL NO-WEBGL SHELL EVIDENCE`)

Préférence standard (`matchMedia` non forcé), WebGL indisponible (`HTMLCanvasElement.prototype.getContext` renvoyant `null`), navigation SPA réelle vers `/drift/`, aucun audio lancé au préalable :

```json
{
  "canvasCount": 0,
  "audioCount": 1,
  "audioPaused": true,
  "hasNoWebGL": true,
  "hasReducedMotionProbe": true,
  "hasQualityProbe": false,
  "hasCueResolverProbe": false,
  "hasSignatureArbitrationProbe": false
}
```

Texte de page réel confirmé :

```text
NO WEBGL
This browser cannot open the 3D room.
The 2D lab remains the reference map. Nothing needs to play here.

ABOUT THE 3D ROOM
Fullscreen drivable 3D listening world: a safari 4x4 crosses four eras
and twenty-six track places over real terrain — mountains, canals,
storms and dawns. This page only describes it — driving and exploring
the 3D room are not available here.

OPEN 2D LAB
TRACKS
```

Les probes `Canvas` (quality, cue resolver, signature arbitration) sont absents parce que le `Canvas` n'est pas monté ; le probe no-WebGL et le probe reduced-motion, eux, restent présents (niveau shell). Aucun autoplay.

## 6. Test E — Carte 2D accessible sans WebGL (`REAL NO-WEBGL SHELL EVIDENCE`)

Clic réel sur « Open 2D Lab » depuis le panneau no-WebGL :

```json
{ "href": "http://localhost:3000/drift-lab/", "title": "Drift Lab — experimental MISWΛY map | MISWΛY (MISWAY)" }
```

Zéro erreur console. `/drift-lab` se charge sans dépendance au WebGL. Aucune affirmation au-delà de ce qui est observé : `/drift-lab` reste le prototype 2D expérimental déjà livré, non modifié par ce lot.

## 7. Test F — Catalogue accessible (`REAL NO-WEBGL SHELL EVIDENCE`)

Retour sur `/drift/` (no-WebGL toujours actif) puis clic réel sur « Tracks » :

```json
{ "href": "http://localhost:3000/tracks/", "title": "Tracks — music made over time | MISWΛY (MISWAY)" }
```

26 liens `/tracks/<slug>/` distincts observés sur la page (nombre observé, non codé en dur dans `SYS-60`). Zéro erreur console.

## 8. Test G — Listening path réel (`LISTENING PATH EVIDENCE`, `MEASURED`)

Sur `/tracks/`, lecture explicite lancée via le bouton Play réel d'une track catalogue (slug non codé en dur dans `SYS-60`, sans signification pour ce lot) :

```json
{ "audioCount": 1, "audioPaused": false, "audioSrc": "http://localhost:3000/audio/a-walk-in-zeeland.mp3" }
```

Pause puis reprise testées via le contrôle global déjà livré (`GlobalAudioPlayer`, bouton « Pause audio »/« Play audio », visible sur `/tracks`) :

```json
{ "afterPauseClick": { "audioPaused": true }, "afterResumeClick": { "audioPaused": false } }
```

Navigation SPA réelle vers `/drift/` (WebGL toujours indisponible) :

```json
{ "canvasCount": 0, "audioCount": 1, "audioPaused": false, "audioSrc": "http://localhost:3000/audio/a-walk-in-zeeland.mp3" }
```

**Constat honnête** : `GlobalAudioPlayer` se masque lui-même sur toute route `/drift*` (comportement préexistant, non modifié par `SYS-60` — voir `src/components/audio/GlobalAudioPlayer.tsx`), et le panneau no-WebGL ne rend aucun contrôle audio propre (règle absolue du lot, §14/§15 du lot canonique). Confirmé : `hasAnyPlaybackButton = false` sur `/drift/` en no-WebGL. `/tracks` reste donc le chemin réel où lancer et contrôler explicitement le player global ; la continuité de lecture sur `/drift` no-WebGL est réelle et mesurée, mais aucun contrôle visible n'existe sur cette route précise — ce n'est pas inventé ici.

## 9. Test H — Entrée no-WebGL sans lecture (`REAL NO-WEBGL SHELL EVIDENCE`)

Identique aux données du Test D (aucun audio lancé à ce stade de la session) : `audioCount=1`, `audio.paused=true`, aucun autoplay.

## 10. Test I — Reduced-motion prioritaire et distinct (`REAL NO-WEBGL SHELL EVIDENCE`)

`prefersReducedMotion=true` (faux `MediaQueryList`) **et** WebGL indisponible, navigation SPA réelle vers `/drift/` :

```text
REDUCED MOTION
The 3D room stays closed today.
Motion is reduced, so this route keeps the quieter path open.
OPEN 2D LAB
BACK TO DRIFT
```

Le panneau narratif no-WebGL n'est **pas** rendu — la priorité reduced-motion déjà existante (`DRIFT-IV-SYS-50`) reste intacte, inchangée par ce lot.

## 11. Test J — Retour au WebGL (`REAL NO-WEBGL SHELL EVIDENCE`)

`matchMedia` restauré à `matches: false`, WebGL restauré (`getContext` original), navigation SPA réelle `/ → /drift/` :

```json
{ "canvasCount": 1, "audioCount": 1, "audioPaused": false, "hasNoWebGL": true, "sameProbeInstance": false, "bodyIncludesNoWebGL": false }
```

`Canvas` présent, panneau no-WebGL absent, lecture toujours continue (piste déjà lancée au Test G), aucun autoplay nouveau. Le remount a nécessité une navigation de route complète (`Drift3DClient` démonté/remonté), d'où une nouvelle instance de probe — méthode documentée explicitement.

## 12. Test K — Cleanup/remount du probe (`REAL NO-WEBGL SHELL EVIDENCE`)

Sur `/drift/` (Canvas présent) : probe capturé comme `oldProbe`. Navigation SPA réelle `/drift/ → /` : `window.__drift3dNoWebGL` absent, `audioCount=1`. Retour `/ → /drift/` : probe présent, **nouvelle instance** (`sameInstance: false`), `audioCount=1`.

## 13. Test L — Aucune fausse promesse d'interaction (`REAL NO-WEBGL SHELL EVIDENCE`)

Tutoriel de conduite (« ZQSD / WASD / ARROWS / DRAG / WHEEL ») observé sur les trois états :

```json
{
  "standardRuntime_canvasPresent": { "tutorialVisible": true },
  "noWebGLFallback": { "tutorialVisible": false },
  "reducedMotionFallback": { "tutorialVisible": false }
}
```

Aucun CTA du panneau no-WebGL ne promet « Drive », « Explore in 3D » ou « Enter 3D » — les seuls libellés sont « Open 2D Lab » et « Tracks ». Le résumé du monde 3D reste une description, jamais une action proposée sur ce chemin.

## 14. Test M — BasePath/navigation (`STRUCTURAL EVIDENCE`)

```powershell
git grep -n "localhost\|window.location" -- src/lib/drift3dNoWebGL.ts src/components/drift-3d/Drift3DNoWebGLPath.tsx
```

Résultat : aucune occurrence. Les deux destinations sont rendues via `next/link`, comme partout ailleurs dans le projet. `npm run build` (export statique) → PASS, 38 routes.

## 15. Test N — Scope structurel (`STRUCTURAL EVIDENCE`, `AUTOMATED_STRUCTURAL_EVIDENCE`)

Commandes réelles (alternation POSIX basic regex correcte — `git grep` sans `-E` interprète `|` littéralement, l'alternation exige `\|`) :

```powershell
git grep -n "setInterval\|setTimeout\|requestAnimationFrame\|useFrame" -- src/lib/drift3dNoWebGL.ts src/components/drift-3d/Drift3DNoWebGLPath.tsx
git grep -n "THREE\|three\|Canvas\|WebGLRenderer\|getContext" -- src/lib/drift3dNoWebGL.ts src/components/drift-3d/Drift3DNoWebGLPath.tsx
git grep -n "drift3dQuality\|drift3dReducedMotion\|drift3dCueResolver\|drift3dSignatureArbitration\|@/lib/tracks" -- src/lib/drift3dNoWebGL.ts
git grep -in "eux-gainent\|eteeaooete\|foolfoule\|jazzypling\|cadence-lock\|wave-ritual\|deviation" -- src/lib/drift3dNoWebGL.ts src/components/drift-3d/Drift3DNoWebGLPath.tsx
```

**Résultat réel, commande par commande :**

- `setInterval|setTimeout|requestAnimationFrame|useFrame` → **0 occurrence**.
- `drift3dQuality|drift3dReducedMotion|drift3dCueResolver|drift3dSignatureArbitration|@/lib/tracks` → **0 occurrence**.
- `eux-gainent|eteeaooete|foolfoule|jazzypling|cadence-lock|wave-ritual|deviation` → **0 occurrence**.
- `THREE|three|Canvas|WebGLRenderer|getContext` → **7 occurrences réelles**, toutes non fonctionnelles au sens « import/montage/appel runtime » :

```text
src/components/drift-3d/Drift3DNoWebGLPath.tsx:21: * Static, lightweight no-WebGL narrative path (DRIFT-IV-SYS-60). No Canvas,
src/lib/drift3dNoWebGL.ts:49:  mounts3DCanvas: false;
src/lib/drift3dNoWebGL.ts:82:  mounts3DCanvas: boolean;
src/lib/drift3dNoWebGL.ts:144:  mounts3DCanvas: false,
src/lib/drift3dNoWebGL.ts:171: * mounts3DCanvas/audioAuthority/autoplay/promises3DInteraction not matching
src/lib/drift3dNoWebGL.ts:198:  if (path.mounts3DCanvas !== false) {
src/lib/drift3dNoWebGL.ts:201:      message: `mounts3DCanvas must be false (got ${path.mounts3DCanvas}).`,
```

**Classification honnête de ces 7 occurrences :**

- 1 occurrence (`Drift3DNoWebGLPath.tsx:21`, « No Canvas, ») : commentaire/docstring explicatif uniquement.
- 6 occurrences (`drift3dNoWebGL.ts:49,82,144,171,198,201`) : toutes le vocabulaire du contrat/validateur `mounts3DCanvas` — une définition de type, un champ candidat, une valeur canonique littérale `false`, un commentaire de docstring, une vérification fonctionnelle (`if (path.mounts3DCanvas !== false)`) et le message d'erreur associé. Ce sont des occurrences **fonctionnelles**, mais de la sémantique de contrat exigeant `mounts3DCanvas: false` — jamais un import, une instanciation ou un montage réel d'un composant `Canvas`.

**PASS — le vocabulaire « Canvas » existe comme sémantique de contrat/validation (`mounts3DCanvas: false`) et comme commentaire explicatif. Aucun composant Canvas n'est importé ou monté. Aucune dépendance fonctionnelle à Three.js. Aucun usage runtime fonctionnel de `WebGLRenderer`/`getContext`.** Il serait incorrect d'écrire « zero Three.js/Canvas/WebGL API references » — la recherche retourne 7 lignes réelles, correctement reclassées ci-dessus.

`git status --short` confirme que seuls `src/lib/drift3dNoWebGL.ts` (créé), `src/components/drift-3d/Drift3DNoWebGLPath.tsx` (créé), `src/components/drift-3d/Drift3DFallback.tsx` (modifié) et `src/components/drift-3d/Drift3DClient.tsx` (modifié) ont changé ; `src/components/audio/AudioPlayerProvider.tsx` inchangé.

### Note additionnelle — vocabulaire navigateur du docstring (`STRUCTURAL EVIDENCE`)

Le docstring d'en-tête de `src/lib/drift3dNoWebGL.ts` nomme volontairement `window`, `document`, `navigator` et WebGL pour affirmer que le module ne les lit jamais. Cette prose ne doit pas être présentée comme une absence littérale de ces mots dans le fichier. **Le module contient du vocabulaire navigateur explicatif/documentaire, mais n'effectue aucune lecture fonctionnelle ni aucun usage runtime de `window`/`document`/`navigator`, et n'utilise aucune API WebGL.** La formulation du contrat (§8 de `docs/DRIFT_3D_NO_WEBGL_NARRATIVE_PATH_CONTRACT.md`) — « `src/lib/drift3dNoWebGL.ts` ne lit jamais `window`, `document`, `navigator` » — reste exacte, car c'est une affirmation de comportement fonctionnel, pas une affirmation sur le texte littéral du fichier.

## 16. Test O — Aucun asset artistique inventé (`STRUCTURAL EVIDENCE`)

`git status --short -- public/` → vide. Aucune image, texture, illustration, SVG artistique, fichier audio ou police n'est ajouté. Le panneau est construit uniquement avec les classes visuelles `light-*` déjà existantes.

---

## 17. Console

Zéro erreur console sur l'ensemble de la session (vérifié avec filtre erreurs après chaque scénario). Aucun incident d'environnement — le serveur dev a été redémarré à neuf avant ce lot par précaution.

## 18. Limites

- La track utilisée pour le Test G est une track catalogue réelle lancée via l'UI existante ; son identité n'a aucune signification pour ce lot.
- Le remplacement de `HTMLCanvasElement.prototype.getContext` est un contrôle d'environnement nécessaire pour simuler l'absence de WebGL de façon reproductible dans une session automatisée — restauré explicitement entre les scénarios qui n'en avaient plus besoin.
- Aucun contrôle audio visible n'existe sur la route `/drift` en no-WebGL (héritage du comportement préexistant de `GlobalAudioPlayer`, non modifié par ce lot) — documenté honnêtement au Test G plutôt que masqué ou inventé.
- Aucun fichier `.png` committé sous ce répertoire — même limite d'environnement que les lots précédents.

---

## 19. Décision de gate

| Critère | Statut |
|---|---|
| no-WebGL contract valide | PASS |
| contrat frozen | PASS |
| Canvas absent en no-WebGL | PASS |
| panneau statique réellement visible | PASS |
| résumé produit honnête | PASS |
| aucune nouvelle invention artistique | PASS |
| `/drift-lab` accessible | PASS |
| `/tracks` accessible | PASS |
| listening path réel démontré | PASS |
| player global unique | PASS (`audioCount=1` partout) |
| aucun autoplay | PASS |
| aucun second player | PASS |
| reduced-motion reste distinct | PASS |
| reduced-motion conserve sa priorité existante | PASS |
| no-WebGL != LOW | PASS (aucun import Quality Tier) |
| aucune promesse d'interaction 3D disponible | PASS |
| tutoriel de conduite non visible en fallback | PASS |
| basePath/navigation préservés | PASS |
| aucun asset public ajouté | PASS |
| aucune track-specific fallback abstraction | PASS |
| lint passe | PASS |
| build passe | PASS |

**Décision : `DRIFT-IV-SYS-60` → `DONE — PENDING MERGE`. `DRIFT-IV-SYS-70` → `NEXT_AFTER_MERGE`.**
