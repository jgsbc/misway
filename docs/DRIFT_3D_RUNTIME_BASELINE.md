# DRIFT 3D — Runtime baseline (DRIFT-IV-BASE-00)

- **Version :** 2.0
- **Date :** 2026-07-17
- **Statut :** `ACTIVE — RUNTIME BASELINE COMPLETE UNDER REVISED PROTOCOL` / `WITH DOCUMENTED ENVIRONMENT LIMITATIONS`
- **Lot :** `DRIFT-IV-BASE-00 — Capture runtime baseline`

Ce document capture ce qui a été **réellement observé** du runtime `/drift` sur `main`, sous un protocole de preuve révisé (`REPRESENTATIVE REAL FPS SAMPLE + CROSS-ZONE RENDER-COST ENVELOPE + AUTOMATED VISUAL, MOBILE AND FALLBACK EVIDENCE` — voir `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` pour le rapport complet et `runtime-evidence.json` pour les données). Il ne remplace ni le code (`RUNTIME TRUTH`), ni `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` (`TARGET_ARCHITECTURE — NOT RUNTIME TRUTH`).

```text
Measured baseline:
- architecture inventory;
- build and lint result;
- route and module loading;
- WebGL canvas presence;
- ambiance disabled by default;
- mobile tutorial visibility rule;
- one real foreground mobile FPS sample (Foolfoule, 50.5 fps at DPR 3);
- cross-zone render-cost envelope (draw calls 139-175, triangles 178644-198124,
  across Entry Node, A Walk In Zeeland, Foolfoule, ÉTÉÉAOOÉTÉ);
- mobile structural verification (viewport, no horizontal overflow, canvas count,
  HUD/ambiance visible, desktop tutorial hidden);
- reduced-motion fallback genuinely triggered in a real browser session;
- no-WebGL fallback genuinely triggered in a real browser session.

Inferred from representative sample (not separately measured):
- desktop FPS per zone — see §9.

Known environment limitations (never presented as measured facts):
- no committed screenshot binaries — the available save-to-disk mechanism
  produced an unrelated, fixed desktop image in every test, not the driven
  tab's content (verified: identical byte size across unrelated sessions);
- no independently measured desktop FPS — automated tabs remain
  `document.visibilityState === "hidden"` regardless of focus/gesture/JS
  overrides, which suspends `requestAnimationFrame`;
- mobile structural check performed at DPR 2, not the requested DPR 3 — no
  CDP-level tool was available to force devicePixelRatio;
- no touch emulation — no CDP-level tool was available for
  Emulation.setTouchEmulationEnabled;
- fallbacks (reduced-motion, no-WebGL) forced through API overrides
  (MediaQueryList/getContext monkey-patches) and a same-document SPA
  remount, not through native OS/browser settings or CDP emulation.
```

Détail complet, méthode et classification de chaque preuve : `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md`.

---

## 1. Portée du lot

`DRIFT-IV-BASE-00` mesure : le runtime réel, l'architecture livrée, l'état visuel, mobile, les chemins de fallback et la performance observable. Il ne construit aucun service partagé (ceux-ci relèvent de `DRIFT-IV-SYS-00` à `DRIFT-IV-SYS-70`) et ne porte aucun code depuis la branche historique. Documentation et mesure uniquement — aucun changement `src/**` ou `public/**`.

---

## 2. Méthode

L'audit s'inspire de la méthode documentée dans `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md` §2.6 (balayage par téléportation des nœuds, vérification `<audio>` unique, capture draw-calls/fps par zone, vérification viewport mobile, vérification 200 par route) — cette méthode historique n'est **pas** elle-même adoptée comme preuve (elle documente un état de branche daté du 2026-07-09, jamais mergé), seule sa méthodologie sert de référence.

Outils utilisés : `npm run build` / `npm run lint`, inspection du code source, une session de navigateur automatisé (serveur `next dev` local, route `/drift`), et une session de navigateur réel connecté (Claude in Chrome) pour la mesure fps représentative et le déclenchement réel des fallbacks.

---

## 3. Build et sortie statique — mesuré

- `npm run lint` — PASS, zéro avertissement.
- `npm run build` — PASS, 38 routes statiques générées (`○` statique, `●` SSG pour `/tracks/[slug]` × 26), zéro erreur TypeScript.
- Export statique et `basePath` non modifiés par ce lot.

---

## 4. Inventaire d'architecture réellement livrée — mesuré

### 4.1 `src/components/drift-3d/`

| Fichier | Lignes | Rôle observé |
|---|---:|---|
| `Drift3DScene.tsx` | 824 | Orchestration de scène : lumière/atmosphère, physique véhicule, HUD proximité, sondes dev |
| `Drift3DCanvas.tsx` | 604 | Montage du Canvas R3F, intégrations player/site |
| `Drift3DVehicle.tsx` | 390 | Modèle procédural Defender, roues, phares |
| `Drift3DZone.tsx` | 336 | Détection de zone/proximité par nœud |
| `Drift3DEffects.tsx` | 333 | FX diégétiques (pluie, foule, poussière, lucioles) |
| `Drift3DScatterField.tsx` | 316 | Dispersion instanciée (10 archétypes) |
| `Drift3DLandmark.tsx` | 273 | Rendu des landmarks figuratifs, fade d'occlusion |
| `Drift3DHud.tsx` | 246 | HUD proximité/lecture |
| `drift3dTextureFactory.ts` | 256 | Textures procédurales canvas mises en cache |
| `Drift3DProp.tsx` | 179 | Props diégétiques secondaires |
| `Drift3DClient.tsx` | 152 | Détection WebGL/reduced-motion, montage fallback vs Canvas |
| `Drift3DFallback.tsx` | 64 | UI de repli (checking/reduced-motion/no-webgl) |
| `Drift3DLabRedirect.tsx` | 28 | Redirection `/drift-3d-lab` → `/drift` |

### 4.2 `src/lib/drift3d*`

| Fichier | Lignes | Rôle observé |
|---|---:|---|
| `drift3dLandmarks.ts` | 1993 | Données de scènes figuratives par nœud (matériaux, géométrie, props) |
| `drift3dTopology.ts` | 610 | Graphe des nœuds/ères, positions |
| `drift3d.ts` | 401 | Constantes caméra/monde, config partagée |
| `drift3dAtmosphere.ts` | 449 | Color script runtime, mélange régional lumière/brouillard |
| `drift3dVehiclePhysics.ts` | 338 | Physique arcade (accélération, dérive, saut, assiette) |
| `drift3dScatter.ts` | 333 | Génération déterministe des ~2400 candidats de dispersion (10 archétypes) |
| `drift3dTerrain.ts` | 314 | Heightfield analytique (relief, rampes, cratères) |
| `drift3dAmbience.ts` | 233 | Moteur d'ambiance diégétique WebAudio, opt-in |
| `driftControls.ts` / `driftMap.ts` | 282 / 282 | Contrôles clavier/tactile, carte 2D historique (`/drift-lab`) |
| `drift3dCinematography.ts` | 47 | Table vitesse/zoom caméra par track |

Le nombre de lignes d'un fichier est une mesure d'inventaire, pas une preuve de parité fonctionnelle ou visuelle avec quoi que ce soit — voir §8.

### 4.3 Écart avec l'architecture cible (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`)

Aucun des services partagés visés en §5 (`AudioClockRef`, Cue Resolver, Scene Lifecycle formel, Signature Arbitration, Quality Tier formel, Evidence Harness formalisé) n'existe comme module dédié sur `main`. Ce qui en tient lieu aujourd'hui :

- horloge/lecture audio : `AudioPlayerProvider` global du site (hors périmètre `drift-3d/`), pas un `AudioClockRef` track-agnostique dédié ;
- sondes de performance dev-only : `window.__drift3dRender` et `window.__drift3dDebug` (câblées dans `Drift3DScene.tsx`, actives hors production) — préfigurent l'Evidence Harness §5.6 sans le formaliser ;
- pas de resolver de cues, pas de lifecycle `UNMOUNTED/IDLE/ACTIVE/PAUSED/RESETTING` formel, pas de quality tier piloté par capacités.

C'est attendu : ces services sont le périmètre de `DRIFT-IV-SYS-00` à `DRIFT-IV-SYS-70`, pas de `BASE-00`.

**Mise à jour post-`BASE-00` (`DRIFT-IV-SYS-00`, 2026-07-17)** : un `AudioClockRef` dédié existe désormais (`src/lib/drift3dAudioClock.ts`, intégré dans `AudioPlayerProvider.tsx`, exposé en développement via `window.__drift3dAudioClock`) — voir `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` et `docs/evidence/DRIFT-IV-SYS-00/audio-clock-evidence.md`. Cette mise à jour ne prétend pas que le Cue Resolver, le Scene Lifecycle formel, la Signature Arbitration, le Quality Tier ou l'Evidence Harness formalisé sont livrés — ils restent le périmètre de `DRIFT-IV-SYS-10` à `DRIFT-IV-SYS-70`.

**Mise à jour post-`SYS-00` (`DRIFT-IV-SYS-10`, 2026-07-18)** : un Scene Lifecycle formel existe désormais (`src/lib/drift3dSceneLifecycle.ts`, intégré dans `Drift3DCanvas.tsx`/`Drift3DScene.tsx`, exposé en développement via `window.__drift3dLifecycle`) — voir `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` et `docs/evidence/DRIFT-IV-SYS-10/scene-lifecycle-evidence.md`. Cette mise à jour ne prétend pas que le Cue Resolver, la Signature Arbitration, le Quality Tier ou l'Evidence Harness formalisé sont livrés — ils restent le périmètre de `DRIFT-IV-SYS-20` à `DRIFT-IV-SYS-70`. Elle ne modifie ni ne re-mesure aucune donnée de performance de ce document.

**Mise à jour post-`SYS-10` (`DRIFT-IV-SYS-20`, 2026-07-19)** : un resolver de cues générique existe désormais (`src/lib/drift3dCueResolver.ts`, exposé en développement via `window.__drift3dCueResolver`, installé depuis `Drift3DCanvas.tsx`) — voir `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md` et `docs/evidence/DRIFT-IV-SYS-20/cue-resolver-evidence.md`. Cette mise à jour ne prétend pas qu'une Cue Map de track réelle, une Signature Arbitration, un Quality Tier ou un Evidence Harness formalisé sont livrés — ils restent le périmètre de `DRIFT-IV-SYS-30` à `DRIFT-IV-SYS-70` et des futurs lots Build. Elle ne modifie ni ne re-mesure aucune donnée de performance de ce document.

**Mise à jour post-`SYS-20` (`DRIFT-IV-SYS-30`, 2026-07-19)** : un arbitrage de signature majeure générique existe désormais (`src/lib/drift3dSignatureArbitration.ts`, exposé en développement via `window.__drift3dSignatureArbitration`, installé depuis `Drift3DCanvas.tsx`) — voir `docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md` et `docs/evidence/DRIFT-IV-SYS-30/signature-arbitration-evidence.md`. Cette mise à jour ne prétend pas qu'une signature artistique réelle, un Quality Tier ou un Evidence Harness formalisé sont livrés — ils restent le périmètre de `DRIFT-IV-SYS-40` à `DRIFT-IV-SYS-70` et des futurs lots Build. Elle ne modifie ni ne re-mesure aucune donnée de performance de ce document.

**Mise à jour post-`SYS-30` (`DRIFT-IV-SYS-40`, 2026-07-19)** : un contrat de quality tiers préservant l'identité existe désormais (`src/lib/drift3dQuality.ts`, exposé en développement via `window.__drift3dQuality`, installé depuis `Drift3DCanvas.tsx`) — voir `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md` et `docs/evidence/DRIFT-IV-SYS-40/quality-tier-evidence.md`. Aucun tier n'est encore appliqué au rendu de production : aucune donnée fps/draw-call/triangles n'est re-mesurée par ce lot, et le rendu actuel reste donc la baseline full-capability existante décrite plus haut dans ce document — l'absence d'application visuelle est intentionnelle. Cette mise à jour ne prétend pas qu'un Evidence Harness formalisé, un reduced-motion contract ou un no-WebGL narrative path sont livrés — ils restent le périmètre de `DRIFT-IV-SYS-50` à `DRIFT-IV-SYS-70`. Elle ne modifie ni ne re-mesure aucune donnée de performance historique de ce document.

**Mise à jour post-`SYS-40` (`DRIFT-IV-SYS-50`, 2026-07-19)** : le contrat reduced-motion est désormais formalisé (`src/lib/drift3dReducedMotion.ts`, module générique livré, intégration minimale du resolver dans `Drift3DClient.tsx`, exposé en développement via `window.__drift3dReducedMotion`). Le comportement visuel actuel reste inchangé : reduced-motion continue à utiliser le fallback sans `Canvas` exactement comme avant ce lot — voir `docs/DRIFT_3D_REDUCED_MOTION_CONTRACT.md` et `docs/evidence/DRIFT-IV-SYS-50/reduced-motion-evidence.md`. Aucun track-local reduced-motion 3D n'est livré. Aucune donnée performance n'est re-mesurée par ce lot. Le no-WebGL narrative path reste le périmètre de `DRIFT-IV-SYS-60`. Elle ne modifie ni ne re-mesure aucune donnée de performance historique de ce document.

---

## 5. Golden path et fallbacks — mesuré en session réelle

Constats positifs réellement observés, session `next dev` sur `/drift/` :

- zéro erreur console (vérifié avec filtre erreurs sur toute la session) ;
- tous les chunks JS et modules Three.js/R3F/Reflector se chargent en `200 OK` ;
- un unique élément `<canvas>` présent, contexte WebGL obtenu avec succès ;
- HUD proximité et bouton « Activer l'ambiance sonore » rendus, ambiance bien **désactivée par défaut** (`AMBIANCE OFF`) — conforme au non-négociable « aucun autoplay » ;
- tutoriel permanent (`WASD/ARROWS/DRAG/WHEEL`) confirmé masqué (`display: none`) à un viewport mobile réel (390×844) ;
- fallback reduced-motion réellement déclenché : « The 3D room stays closed today. », canvas absent — voir `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` §6 ;
- fallback no-WebGL réellement déclenché : « This browser cannot open the 3D room. », canvas absent — voir `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` §7 ;
- quatre scènes (Entry Node, A Walk In Zeeland, Foolfoule, ÉTÉÉAOOÉTÉ) visuellement revues en direct dans une session Chrome réelle connectée, chacune confirmée : scène rendue, HUD présent, canvas présent, aucune frame vide, aucun artefact visuel évident — détail par scène dans le rapport de preuve §5.

Détail complet des méthodes de déclenchement et limite de persistance des captures d'écran : `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` §5–§7.

---

## 6. Performance — échantillon représentatif réel + enveloppe inter-zones

### 6.1 Échantillon FPS réel — `MEASURED — REAL FOREGROUND MOBILE SAMPLE`

Un échantillon fps continu réel a été obtenu dans une session de navigateur réel au premier plan (Claude in Chrome, `visibilityState: "visible"`), sur Foolfoule, viewport mobile 390×844 @ DPR 3 :

```text
frames: 532, durationMs: 10532, fps: 50.5
render: 173 draw calls, 197076 triangles
canvasCount: 1
```

| Cible | Résultat |
|---|---|
| mobile ≥30 fps | PASS (50.5) |
| draw calls ≤300 | PASS (173) |
| triangles ≤1,5M | PASS (197076) |

### 6.2 Enveloppe de coût de rendu inter-zones — `MEASURED CROSS-ZONE ENVELOPE`

Lectures réelles de `window.__drift3dRender` (`gl.info`), session Chrome réelle, quatre zones :

```text
Entry Node:         139–140 draw calls, 197146–197158 triangles
A Walk In Zeeland:   160–161 draw calls, 198008–198020 triangles
Foolfoule:           173–175 draw calls, 197076–198124 triangles
ÉTÉÉAOOÉTÉ:          157 draw calls, 178644 triangles

Envelope: draw calls = 139–175, triangles = 178644–198124
```

| Critère | Résultat |
|---|---|
| max draw calls 175 ≤ 300 | PASS |
| max triangles 198124 ≤ 1,5 M | PASS |

### 6.3 Interprétation — `INFERRED_FROM_REPRESENTATIVE_SAMPLE`

Aucune mesure fps desktop distincte par zone n'a été obtenue : le throttling d'onglet en arrière-plan invalide l'échantillonnage `requestAnimationFrame` dans tout environnement de navigateur automatisé disponible (`document.visibilityState` reste `"hidden"` en continu, indépendamment du focus, d'un geste utilisateur ou d'un forçage JS — vérifié empiriquement avec un compteur `requestAnimationFrame` instrumenté : 1 frame en 33+ secondes). L'échantillon mobile réel au premier plan atteint 50,5 fps à DPR 3, et toutes les scènes desktop mesurées restent dans la même enveloppe de coût de rendu bornée. Il est permis d'en conclure que le runtime actuel dispose d'une marge importante sur ses plafonds géométriques dans les quatre zones mesurées. **Il n'est pas affirmé que le fps desktop a été mesuré, que toutes les scènes tournent à 50 fps, ou que ≥50 fps desktop est prouvé.**

### 6.4 Vérification structurelle mobile — `AUTOMATED_STRUCTURAL_EVIDENCE`

Aucun outil CDP (`Emulation.setDeviceMetricsOverride`) n'était disponible dans cette session ; la vérification a utilisé l'outil de redimensionnement du navigateur de prévisualisation du projet (confirmé changer réellement `window.innerWidth`/`innerHeight` et déclencher les media queries CSS réelles) :

```text
viewport observé : 390×844, devicePixelRatio 2.0 (cible 3, non forçable — aucun outil disponible)
horizontalOverflow : false
canvasCount : 1
HUD visible : oui
contrôle ambiance visible : oui (AMBIANCE OFF)
tutoriel desktop masqué : oui (display: none)
```

Toutes les cibles structurelles passent. Le déclenchement du fallback tactile (`Emulation.setTouchEmulationEnabled`) n'a pas pu être testé, faute d'outil.

### 6.5 Limite de persistance des captures d'écran — `KNOWN_ENVIRONMENT_LIMITATION`

Chaque scène et chaque fallback a été visuellement confirmé en direct dans la session (identité de scène correcte, HUD présent, canvas présent/absent selon le cas, aucune frame vide). Aucun fichier `.png` n'a cependant pu être committé sous `docs/evidence/DRIFT-IV-BASE-00/` : le mécanisme de sauvegarde disponible (`save_to_disk`) a produit, de façon vérifiée et reproductible, une image fixe sans rapport avec l'onglet piloté (4800×2160, taille en octets strictement identique à travers plusieurs sessions historiques indépendantes sur cette machine) plutôt que le contenu réel de la scène. Committer ce fichier sous un nom de scène spécifique l'aurait présenté à tort comme une preuve. Détail complet dans `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` §5.

---

## 7. Décisions de réconciliation d'architecture (fichiers historiques différés à `BASE-00`)

`docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md` différait six éléments à `DRIFT-IV-BASE-00` depuis la branche historique `drift-lw-cues-00-eux-gainent`. Décision de ce lot — **aucun de ces éléments n'est porté**, et aucune parité fonctionnelle ou visuelle avec l'intention historique n'est réputée démontrée :

| Élément historique | Décision | Raison |
|---|---|---|
| `Drift3DWorldEdges.tsx` (`92f4bfd`, reworked `740e437`) | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` | `main` a construit indépendamment son propre heightfield analytique (`src/lib/drift3dTerrain.ts`, 314 lignes, ~2026-07-08) qui vise le même problème (océan/falaises/collines/plaines). Le porter créerait un système concurrent et incompatible. Cela ne signifie pas que l'intention de lisière/profondeur du monde est satisfaite par `drift3dTerrain.ts` — aucune preuve visuelle de parité n'a été produite. |
| `src/lib/drift3dRivers.ts` (`740e437`) | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` | Dépend architecturalement de `Drift3DWorldEdges.tsx` ci-dessus. L'intention de continuité fluviale n'est pas réputée satisfaite ailleurs ; elle reste ouverte. |
| `drift3dScatter.ts` (hunk d'exclusion de couloir de rivière, `740e437`) | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` | Dépend de `drift3dRivers.ts`, non adopté. Le système de dispersion actuel de `main` (10 archétypes, 333 lignes) n'a pas cette notion de couloir ; ce n'est pas prouvé équivalent. |
| `Drift3DScene.tsx` (hunk de montage World Edges) | `ARCHITECTURAL_PORT_REJECTED` — `DO NOT BLIND PORT` | N'a de sens que si `Drift3DWorldEdges.tsx` est adopté ; rejeté pour la même raison. |
| `drift3dLandmarks.ts` (props de détail par track, `6c2998b`) | `DO NOT CHERRY-PICK` — `REASSESS LOCALLY IN RELEVANT TRACK BUILDS` | Le fichier `main` a 1993 lignes de scènes figuratives photo-PBR, incluant déjà EUX GAINENT et ÉTÉÉAOOÉTÉ — mais ce volume de lignes n'est **pas** une preuve de parité fonctionnelle avec les petits props diégétiques historiques (bateau amarré, bacs, cairn, jarres, etc.). Un cherry-pick à l'aveugle risquerait des entrées dupliquées ou conflictuelles. |
| `Drift3DScatterField.tsx` (patch de vent GPU, `d77edcf`) | `CANDIDATE_FOR_FUTURE_ENHANCEMENT` — non porté ce lot | Seul élément sans divergence architecturale confirmée : patch shader additif à coût nul (`onBeforeCompile`), rapporté sans coût perf sur la branche historique. Compatibilité avec le matériau/instancing actuel de `main` **non vérifiée**. Destination si retenu : un futur lot `GLOB-*` d'harmonisation, aucun nouvel identifiant. |

Précisions valables pour l'ensemble du tableau :

- l'ancienne architecture (World Edges/Rivers) ne doit pas être portée telle quelle ;
- le système actuel de `main` (`drift3dTerrain.ts`, `drift3dScatter.ts`, `drift3dLandmarks.ts`) reste l'unique architecture runtime en vigueur ;
- les intentions de lisière, profondeur, rivière ou continuité ne sont **pas** réputées satisfaites par ce seul constat d'incompatibilité — elles devront être évaluées avec preuve visuelle dans les lots canoniques d'ère, de continuité (`CONT-*`) ou d'harmonisation (`GLOB-*`) pertinents, le cas échéant ;
- **aucun nouvel identifiant de lot n'est créé** par cette table.

Ces six lignes de `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md` (`§3.4`, `§4`) reflètent ces mêmes décisions.

---

## 8. Console

Aucune erreur runtime observée (vérifié avec filtre erreurs sur toute la session).

Avertissement connu, non corrigé dans ce lot (`src/**` non modifié) :

```text
THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.
```

Classification : `KNOWN_NON_BLOCKING_DEPRECATION_WARNING`. Avertissements additionnels observés et catalogués (également non corrigés) : dépréciation `THREE.Clock`, avertissements `THREE.Material: parameter 'map' has value of undefined` (construction initiale de scène), et un log `THREE.WebGLRenderer: Context Lost` causé par la procédure de test no-WebGL de ce lot elle-même (pas spontané). Détail complet : `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` §8.

---

## 9. Performance acceptance targets — not current runtime measurements

Ces valeurs, déjà posées par `docs/DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md` §9, restent des **cibles d'acceptation issues du Programme** :

```text
mobile      ≥30 fps
desktop     ≥50 fps sur scènes de référence
plafond     ≤300 draw calls et ≤1,5 M triangles
```

L'échantillon mobile réel (§6.1, 50,5 fps) et l'enveloppe de coût inter-zones (§6.2) montrent une marge confortable sur les plafonds géométriques. Aucune mesure fps desktop distincte par zone n'existe (§6.3) — tout lot Build souhaitant une telle mesure doit la capturer lui-même, dans une session de navigateur au premier plan.

---

## 10. Conclusion

- Architecture réellement livrée inventoriée (§4, mesuré) ; écart avec la cible documenté, non comblé (attendu, relève de `SYS-*`).
- Golden path `/drift` vérifié : console propre, chargement réseau, ambiance opt-in, règle mobile confirmée à un viewport réel, quatre scènes visuellement revues en direct (§5).
- Fallbacks no-WebGL et reduced-motion réellement déclenchés et confirmés en session réelle (§5, §6.5).
- Un échantillon fps réel au premier plan (mobile, 50,5 fps) et une enveloppe de coût de rendu inter-zones réelle (139–175 draw calls, 178644–198124 triangles) obtenus (§6) — largement sous les plafonds.
- Aucune mesure fps desktop distincte par zone — explicitement étiquetée `INFERRED_FROM_REPRESENTATIVE_SAMPLE`, jamais présentée comme mesurée (§6.3).
- Aucun fichier `.png` committé — limite d'environnement vérifiée et documentée, jamais contournée par une preuve fabriquée (§6.5).
- Six éléments runtime historiques requalifiés sans portage (§7) — aucun nouvel identifiant créé.
- Aucun changement `src/**` ou `public/**` dans ce lot.
- **Décision de gate : `DRIFT-IV-BASE-00` → `DONE`. `DRIFT-IV-SYS-00` → `READY`.** Voir `docs/evidence/DRIFT-IV-BASE-00/runtime-evidence.md` §9 pour le détail du gate.
