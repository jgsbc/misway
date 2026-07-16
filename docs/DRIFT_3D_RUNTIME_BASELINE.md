# DRIFT 3D — Runtime baseline (DRIFT-IV-BASE-00)

- **Version :** 1.1
- **Date :** 2026-07-16
- **Statut :** `ACTIVE — PARTIAL RUNTIME BASELINE` / `PERFORMANCE AND FALLBACK EVIDENCE PENDING`
- **Lot :** `DRIFT-IV-BASE-00 — Capture runtime baseline`

Ce document capture ce qui a été **réellement observé** du runtime `/drift` sur `main` au moment du merge de `DRIFT-IV-GOV-30`, et ce qui ne l'a **pas** été. Il ne constitue **pas** un budget mesuré au sens plein : la performance réelle (fps, draw calls, triangles, mémoire) et le déclenchement forcé des fallbacks no-WebGL/reduced-motion restent non obtenus (§6, §7). Il ne remplace ni le code (`RUNTIME TRUTH`), ni `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` (`TARGET_ARCHITECTURE — NOT RUNTIME TRUTH`).

```text
Measured baseline:
- architecture inventory;
- build and lint result;
- route and module loading;
- WebGL canvas presence;
- ambiance disabled by default;
- mobile tutorial visibility rule.

Not measured:
- fps;
- draw calls;
- triangles;
- GPU or JS memory;
- visual scene conformity;
- forced no-WebGL fallback;
- forced reduced-motion fallback.
```

Tant que la colonne « Not measured » n'est pas vidée par une preuve réelle (§8), `DRIFT-IV-BASE-00` reste `REWORK_REQUIRED` et `DRIFT-IV-SYS-00` reste `BLOCKED_BY_DEPENDENCY` — voir `docs/ACTIVE_LOT.md` et `docs/DRIFT_3D_INTEGRAL_BACKLOG.md` §7.

---

## 1. Portée du lot

`DRIFT-IV-BASE-00` mesure : le runtime réel, l'architecture livrée, l'état visuel, mobile, les chemins de fallback et la performance observable. Il ne construit aucun service partagé (ceux-ci relèvent de `DRIFT-IV-SYS-00` à `DRIFT-IV-SYS-70`) et ne porte aucun code depuis la branche historique. Documentation et mesure uniquement — aucun changement `src/**` ou `public/**`. Le lot n'est complet que lorsque la performance et les fallbacks forcés ont une preuve réelle (§8).

---

## 2. Méthode

L'audit s'inspire de la méthode documentée dans `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md` §2.6 (balayage par téléportation des nœuds, vérification `<audio>` unique, capture draw-calls/fps par zone, vérification viewport mobile, vérification 200 par route) — cette méthode historique n'est **pas** elle-même adoptée comme preuve (elle documente un état de branche daté du 2026-07-09, jamais mergé), seule sa méthodologie sert de référence.

Outils utilisés dans ce lot : `npm run build` / `npm run lint`, inspection du code source, et une session de navigateur automatisé (serveur `next dev` local, route `/drift`).

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

Le nombre de lignes d'un fichier est une mesure d'inventaire, pas une preuve de parité fonctionnelle ou visuelle avec quoi que ce soit — voir §6.

### 4.3 Écart avec l'architecture cible (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`)

Aucun des services partagés visés en §5 (`AudioClockRef`, Cue Resolver, Scene Lifecycle formel, Signature Arbitration, Quality Tier formel, Evidence Harness formalisé) n'existe comme module dédié sur `main`. Ce qui en tient lieu aujourd'hui :

- horloge/lecture audio : `AudioPlayerProvider` global du site (hors périmètre `drift-3d/`), pas un `AudioClockRef` track-agnostique dédié ;
- sondes de performance dev-only : `window.__drift3dRender` et `window.__drift3dDebug` (câblées dans `Drift3DScene.tsx`, actives hors production) — préfigurent l'Evidence Harness §5.6 sans le formaliser ;
- pas de resolver de cues, pas de lifecycle `UNMOUNTED/IDLE/ACTIVE/PAUSED/RESETTING` formel, pas de quality tier piloté par capacités.

C'est attendu : ces services sont le périmètre de `DRIFT-IV-SYS-00` à `DRIFT-IV-SYS-70`, pas de `BASE-00`.

---

## 5. Vérification en direct (session navigateur, `next dev`, route `/drift/`) — mesuré, partiellement

Constats positifs réellement observés :

- zéro erreur console au chargement (uniquement logs HMR/dev habituels) ;
- tous les chunks JS et modules Three.js/R3F/Reflector se chargent en `200 OK` ;
- un unique élément `<canvas>` présent, contexte WebGL obtenu avec succès (`hasWebGL: true`) ;
- `prefersReducedMotion: false` dans cet environnement → chemin Canvas réel choisi (pas le fallback), cohérent avec `Drift3DClient.tsx` ;
- HUD proximité et bouton « Activer l'ambiance sonore » rendus, ambiance bien **désactivée par défaut** (`AMBIANCE OFF`) — conforme au non-négociable « aucun autoplay » ;
- à un viewport mobile (375×812), le bloc tutoriel permanent (`WASD/ARROWS/DRAG/WHEEL`) est bien masqué (`display: none` vérifié par style calculé), conforme au commentaire `DRIFT-3D-20B` du code ;
- une requête `audio/entry-ambient.mp3` en `206 Partial Content` est observée puis abandonnée (`net::ERR_ABORTED`) — cohérent avec un préchargement de métadonnées d'un élément `<audio>` non activé, pas une lecture ; aucune preuve d'autoplay.

Ce qui n'a **pas** été obtenu dans cette même session, faute de rendu de frame stable (§6) : aucune capture d'écran, aucune conformité visuelle de scène, aucune mesure de fps/draw-calls/triangles/mémoire.

---

## 6. Limite d'environnement rencontrée — bloque la clôture de `BASE-00`

Cette session de navigateur automatisé rapporte `document.visibilityState === "hidden"` (et `document.hidden === true`) pour l'onglet piloté, y compris après mise au premier plan (`tabs_select`) et après un geste utilisateur réel (clic). Cet état de visibilité, indépendant du focus, entraîne la suspension du `requestAnimationFrame` sur lequel reposent :

- la boucle de rendu Three.js/R3F (`useFrame`) — donc les sondes dev `window.__drift3dRender` / `window.__drift3dDebug` ne se sont jamais peuplées durant cette session ;
- la capture d'écran de l'outil de prévisualisation, qui a systématiquement expiré (`timeout`) en attendant une frame stable.

Ce comportement correspond à une limite déjà documentée de cet environnement d'automatisation (voir `docs/DECISIONS_LOG.md`, entrées `DRIFT-3D-27/28/30` et `DRIFT-3D-20`, sur le throttling d'onglet en arrière-plan et les blocages GPU de prévisualisation), non à une régression du produit livré.

**Conséquence explicite et assumée : aucune mesure fps/draw-calls/triangles/mémoire en conditions réelles n'a pu être capturée dans cette session, et aucune capture visuelle desktop/mobile n'a pu être obtenue.** Ce n'est pas un détail secondaire : c'est la raison pour laquelle `DRIFT-IV-BASE-00` reste `REWORK_REQUIRED` (§8) plutôt que `DONE`.

### 6.1 Fallback no-WebGL et reduced-motion — non déclenchés en direct

Vérifiés par lecture de code (`Drift3DClient.tsx`) uniquement, pas par déclenchement forcé en direct — cet outil de prévisualisation ne permet pas de désactiver WebGL ni d'émuler `prefers-reduced-motion` sans navigation persistante :

- détection WebGL : `canUseWebGL()` teste `webgl2`/`webgl`/`experimental-webgl`, capturé dans un `useEffect` + `queueMicrotask`, aucune dépendance à une boucle `requestAnimationFrame` ;
- détection reduced motion : `window.matchMedia("(prefers-reduced-motion: reduce)")`, avec écouteur de changement — également indépendante de `requestAnimationFrame` ;
- les deux pilotent `Drift3DFallback` (`reason: "checking" | "reduced-motion" | "no-webgl"`), affiché avant tout montage du Canvas.

La lecture de code établit que le mécanisme existe et semble correctement câblé ; elle ne constitue **pas** une preuve que les trois états de `Drift3DFallback` se rendent correctement à l'écran. Seul un déclenchement réel, avec capture visuelle, ferme ce point (§8).

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
| `Drift3DScatterField.tsx` (patch de vent GPU, `d77edcf`) | `CANDIDATE_FOR_FUTURE_ENHANCEMENT` — non porté ce lot | Seul élément sans divergence architecturale confirmée : patch shader additif à coût nul (`onBeforeCompile`), rapporté sans coût perf sur la branche historique. Compatibilité avec le matériau/instancing actuel de `main` **non vérifiée**. |

Précisions valables pour l'ensemble du tableau :

- l'ancienne architecture (World Edges/Rivers) ne doit pas être portée telle quelle ;
- le système actuel de `main` (`drift3dTerrain.ts`, `drift3dScatter.ts`, `drift3dLandmarks.ts`) reste l'unique architecture runtime en vigueur ;
- les intentions de lisière, profondeur, rivière ou continuité ne sont **pas** réputées satisfaites par ce seul constat d'incompatibilité — elles devront être évaluées avec preuve visuelle dans les lots canoniques d'ère, de continuité (`CONT-*`) ou d'harmonisation (`GLOB-*`) pertinents, le cas échéant ;
- le patch de vent (`Drift3DScatterField.tsx`) reste un candidat dont l'évaluation, si elle a lieu, revient à la phase d'harmonisation (`GLOB-*` — densité et polish visuel, cf. `DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md` Phase 8), et non à un nouveau lot ;
- **aucun nouvel identifiant de lot n'est créé** par cette table.

Ces six lignes de `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md` (`§3.4`, `§4`) reflètent ces mêmes décisions requalifiées.

---

## 8. Preuves manuelles attendues pour clôture de `BASE-00`

Matrice vide, à remplir uniquement par une session de navigateur au premier plan (pas cet environnement automatisé — voir §6). Aucune ligne `pending` ne peut devenir `PASS` sans preuve réelle jointe (capture d'écran, valeurs lues).

| Scenario | Viewport | FPS | Draw calls | Triangles | Screenshot | Result |
|---|---:|---:|---:|---:|---|---|
| Zeeland | desktop | pending | pending | pending | pending | pending |
| Foolfoule | desktop | pending | pending | pending | pending | pending |
| Hold The Light ou ÉTÉÉAOOÉTÉ | desktop | pending | pending | pending | pending | pending |
| Golden path | mobile | pending | pending | pending | pending | pending |
| Reduced motion | mobile/desktop | n/a | n/a | n/a | pending | pending |
| No WebGL | desktop | n/a | n/a | n/a | pending | pending |

---

## 9. Performance acceptance targets — not current runtime measurements

Ces valeurs, déjà posées par `docs/DRIFT_3D_INTEGRAL_WORLD_PROGRAM.md` §9, sont des **cibles d'acceptation issues du Programme**, pas une mesure de la baseline observée dans ce lot :

```text
mobile      ≥30 fps
desktop     ≥50 fps sur scènes de référence
plafond     ≤300 draw calls et ≤1,5 M triangles
```

Tout lot Build doit capturer sa propre mesure réelle (fps, draw calls, triangles, mémoire) contre ces cibles, dans une session de navigateur au premier plan. `BASE-00` ne fournit à ce stade aucune mesure fps/draw-calls en conditions réelles (§6) et ne doit pas être cité comme preuve de performance tant que §8 reste `pending`.

---

## 10. Conclusion

- Architecture réellement livrée inventoriée (§4, mesuré) ; écart avec la cible documenté, non comblé (attendu, relève de `SYS-*`).
- Golden path `/drift` partiellement vérifié : console propre, chargement réseau, ambiance opt-in, règle mobile confirmée (§5, mesuré) — mais aucune capture visuelle ni conformité de scène.
- Fallbacks no-WebGL/reduced-motion vérifiés par code seulement, jamais déclenchés en direct (§6.1) — `pending`.
- Aucune mesure fps/draw-calls/triangles/mémoire en conditions réelles obtenue (§6) — `pending`.
- Six éléments runtime historiques requalifiés sans portage (§7) — aucun nouvel identifiant créé.
- Aucun changement `src/**` ou `public/**` dans ce lot.
- **`DRIFT-IV-BASE-00` reste `REWORK_REQUIRED` tant que la matrice §8 n'est pas remplie par une preuve réelle. `DRIFT-IV-SYS-00` reste `BLOCKED_BY_DEPENDENCY`.**
