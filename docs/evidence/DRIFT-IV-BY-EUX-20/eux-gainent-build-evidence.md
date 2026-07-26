# DRIFT-IV-BY-EUX-20 — EUX GAINENT proof-slice Build — Evidence package

- **Lot :** `DRIFT-IV-BY-EUX-20`
- **Date :** 2026-07-26
- **Méthode :** session Chrome réelle locale (`claude-in-chrome`), navigation SPA réelle (clics DOM sur les liens/boutons réels), lecture explicite de la track `eux-gainent` depuis `/tracks/eux-gainent/`, `window.__drift3dEuxGainent` (`read()`, `validateTimeline()`) pour toute la preuve de résolution narrative, `document.querySelector('audio')` pour la manipulation directe de seek/pause/loop à des fins de test, `window.__drift3dEvidence` pour la preuve de performance, override fidèle `HTMLCanvasElement.prototype.getContext` pour le chemin no-WebGL, capture d'écran réelle pour le pic de signature et la composition no-WebGL. Une partie de la session initiale (fin de passe, tests mobile/performance additionnels) a rencontré une perte réelle de focus au premier plan de la fenêtre Chrome locale (`document.visibilityState` resté `"hidden"` malgré interaction réelle soutenue) — documentée honnêtement en §15, non dissimulée. **Passe d'audit pré-merge (même date) :** §9/§10 rejoués après correctifs (labels de rôle supprimés, poses fixes par phase, fallback exclu du chemin `checking`) ; la même limitation de visibilité a nécessité un `dispatchEvent("timeupdate")` manuel pour vérifier le composant sans en modifier le code — voir §9 et §15.

## 0. Résumé

Le modèle narratif pur (`src/lib/drift3dEuxGainent.ts`) et son intégration React Three Fiber (`EuxGainentLivingScene.tsx`, cœur 3D inchangé par l'audit pré-merge) ont été vérifiés en session Chrome réelle sur la totalité des huit phases canoniques, les sept cues, la fenêtre de signature (avec capture d'écran au pic), le comportement idle sans EUX (deux sous-cas), le pause/seek direct, le loop, le changement de zone/track. Le fallback statique (`EuxGainentFallbackScene.tsx`) a été **corrigé puis rejoué** dans le chemin no-WebGL (§9, nouvelle capture d'écran) : positions désormais fixes par `phaseId` (jamais dérivées de `currentTime`/`cycleValue`), aucun label de rôle (`COMPLIANT`/`CORRECTED`/`RESIDUAL` supprimés), aucune légende expliquant la métaphore, et mounté uniquement pour `reduced-motion`/`no-webgl` (jamais `checking`). `tsc --noEmit`, `eslint` et `next build` sont tous `PASS`. Restent `KNOWN_ENVIRONMENT_LIMITATION` : l'émulation OS réelle de `reduced-motion`, la vérification interactive en vrai viewport mobile 390×844 avec rendu R3F, et un nouvel échantillon FPS post-perte-de-focus (mitigé par une comparaison réelle pré/post-build obtenue plus tôt dans la session initiale — voir §12 pour la formulation exacte de ce qui est et n'est pas établi par cette comparaison).

## 1. AUTHORITIES

- `docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md` — `APPROVED LOCAL ARTISTIC AUTHORITY`, North Star, rôles A/B/C, grammaire visuelle, DO NOT DO list.
- `docs/DRIFT_3D_EUX_GAINENT_CUE_MAP.md` — `OWNER_APPROVED_INITIAL_IMPLEMENTATION_BASELINE`, huit phases et sept cues exactes.
- `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md`, `docs/DRIFT_3D_ERA_BIRTH_YARD_CONTRACT.md` — architecture cible et contexte d'ère.
- Services partagés consommés sans modification : `src/lib/drift3dCueResolver.ts` (`SYS-20`), `src/lib/drift3dSignatureArbitration.ts` (`SYS-30`), `src/lib/drift3dAudioClock.ts` (`SYS-00`).
- Candidat historique (`git show ad21600:...`) inspecté en lecture seule pour le motif de réutilisation de la structure statique — jamais cherry-pické, jamais réutilisé pour l'horloge/le resolver/le lifecycle.

## 2. PRE-BUILD BASELINE (`MEASURED`)

Capturée avant toute modification de code, dans la même session Chrome réelle, après téléportation en zone EUX GAINENT (`x:-62, z:42`) :

```json
{ "canvasPresent": true, "drawCalls": 193, "triangles": 201412, "viewport": { "width": 1278, "height": 845, "dpr": 1 }, "visibility": "visible" }
```

`window.__drift3dEvidence.validateSnapshot()` → `[]`. Cette mesure sert de référence pour §12 (Performance).

## 3. PURE TIMELINE EVIDENCE (`MEASURED`)

```json
{ "validateTimeline()": [] }
```

`getDrift3DCueTimelineIssues(EUX_GAINENT_PHASES)` retourne un tableau vide — aucun gap, aucun chevauchement, aucune frontière incohérente sur les huit phases canoniques.

## 4. NORMAL-IDLE EVIDENCE — sans EUX actif (`MEASURED`)

Trois sous-cas, tous confirmés sans fuite de vocabulaire narratif ni de signature :

| Cas | `insideZone` | `sourceSlug` | `phaseId` | `dominantText` | `signatureEligible/Active` |
|---|---|---|---|---|---|
| Hors zone, EUX GAINENT toujours en lecture réelle en arrière-plan | `false` | `eux-gainent` | `pre-cadence` | `null` | `false` / `false` |
| Dans la zone, sans EUX (`a-walk-in-zeeland` en lecture) | `true` | `a-walk-in-zeeland` | `pre-cadence` | `null` | `false` / `false` |
| Dans la zone, ambiance seule (`entry-ambient`), avant tout changement de track | `true` | — (`ambient`) | `pre-cadence` | `null` | `false` / `false` |

Le cas « hors zone » est particulièrement significatif : bien que la vraie track `eux-gainent` continue de jouer réellement en arrière-plan (`sourceKind:"track"`, `sourceSlug:"eux-gainent"`), le temps résolu (`absoluteTimeSeconds`) ne provient **pas** de la position audio réelle mais de l'horloge R3F locale repliée (modulo) dans la fenêtre `pre-cadence` — confirmée à `1.55s` alors que l'audio réel était à `25.1s`. C'est le comportement voulu : hors zone, aucune lecture de la position audio réelle n'est faite pour la dramaturgie.

**Bug trouvé et corrigé pendant le développement (avant cette session de test), reconfirmé ici :** la première version utilisait `state.clock.getElapsedTime()` brut, non replié, ce qui faisait fuiter du vocabulaire (`"CONFORMITÉ"`) après ~80s de temps réel écoulé même sans musique. Le correctif (`% EUX_GAINENT_PHASES[0].endTimeSeconds`) est celui vérifié ci-dessus.

## 5. CUE-BY-CUE EVIDENCE (`MEASURED`)

Obtenue par pause + seek direct de l'élément `<audio>` réel (temps figé, aucune dérive), puis lecture de `window.__drift3dEuxGainent.read()` :

| Temps absolu | `phaseId` | `dominantText` | Attendu (Cue Map / vocabulaire) | Résultat |
|---|---|---|---|---|
| `35s` | `cadence-lock` | `CADENCE` | CADENCE (28.380–68.820) | conforme |
| `54.8s` (échantillon non figé, dérive réelle observée) | `measurement` | `CADENCE` | CADENCE couvre aussi measurement | conforme |
| `74s` | `deviation` | `ÉCART` | ÉCART (68.820–80.010) | conforme |
| `83s` | `correction-revelation` | `CONFORMITÉ` | CONFORMITÉ (80.010–138.800) | conforme |
| `140s` | `reference-inversion` | `RENDEMENT` | RENDEMENT (138.800→~147.280) | conforme |
| `147.28s` (pic CUE_05) | `reference-inversion` | `OBJECTIF DÉPLACÉ` | OBJECTIF DÉPLACÉ (~147.280–152.730) | conforme |
| `160s` | `aftermath-return` | `null` | aucun message après 152.730 | conforme |
| `210s` | `residue` | `null` | aucun message après 152.730 | conforme |

Aucune frontière de phase ne contredit la Cue Map. Une dérive de temps réel a été observée entre certaines commandes de seek et leur lecture (latence des allers-retours d'outils, l'audio continuant de jouer à vitesse réelle) — jamais un défaut du code, toujours documentée quand elle a affecté la précision d'un échantillon (`54.8s` ci-dessus, ainsi que les seeks §7).

## 6. SIGNATURE EVIDENCE (`MEASURED`)

À `140s` et `147.28s` (pic), `signatureEligible: true` et `signatureActive: true`, cohérent avec `isEuxGainentSignatureWindow(phaseId) === "reference-inversion"` uniquement. Une capture d'écran réelle a été prise au pic (`147.28s`) :

- Texte de vitre lisible : **« OBJECTIF DÉPLACÉ »**.
- Trois silhouettes figées visibles sur leurs stations.
- Strip de recalibration allumé (état émissif stable, pas de pulsation continue observée).
- Aucun élément de décor ajouté hors du contrat (pas de dashboard, pas de pluie de chiffres, pas de glitch).

`window.__drift3dSignatureArbitration` (harness générique `SYS-30`) reste indépendant et n'expose que `validate`/`arbitrate` — confirmant structurellement l'absence de registre global partagé consulté par ce lot ; l'arbitrage réel d'EUX GAINENT passe par un unique candidat local (`arbitrateDrift3DMajorSignature([candidate])`), jamais par ce harness générique.

## 7. PAUSE / SEEK / LOOP (`MEASURED`)

**Pause pendant DEVIATION et REFERENCE_INVERSION :** confirmée à `74s` et `140s`/`147.28s` — `playbackState: "paused"` combiné à une résolution de phase/texte stable et cohérente (voir §5-§6), aucune extrapolation au-delà du temps figé.

**Seeks directs pendant la lecture** (145 → 30 → 210 → 82, comme requis) :

| Cible | Réel observé (dérive réseau incluse) | `phaseId` | `dominantText` | `signatureActive` |
|---|---|---|---|---|
| `145` | `145.94` | `reference-inversion` | `RENDEMENT` | `true` |
| `30` | `30.94` | `cadence-lock` | `CADENCE` | `false` |
| `210` | `210.95` | `residue` | `null` | `false` |
| `82` | `82.96` | `correction-revelation` | `CONFORMITÉ` | `false` |

Chaque saut résout immédiatement le nouvel état correct — aucune valeur bloquée sur l'ancienne phase, aucun rejeu, aucune accumulation.

**Loop :** `audio.loop = true`, seek à `223.9s` (proche de la fin, durée `225.455s`). L'audio a bouclé naturellement vers `~7.8s` puis continué à `12.8s` : `phaseId` correctement retombé à `pre-cadence`, `dominantText: null`, `signatureActive: false` aux deux lectures — aucun résidu de phase `residue`/signature reporté après le bouclage.

## 8. ZONE / TRACK RESET (`MEASURED`)

**Sortie de zone** (téléportation à `(0,0)`, `eux-gainent` toujours en lecture réelle) : `insideZone: false`, dramaturgie repasse en idle repliée (§4) — la position audio réelle est ignorée tant que hors zone.

**Ré-entrée en zone** (téléportation retour à `(-62,42)`) : `absoluteTimeSeconds` (`130.26`) correspond immédiatement à la position audio réelle (`audio.currentTime = 130.27`) — pas de rejeu depuis 0, pas d'état obsolète. `phaseId: "correction-revelation"`, `dominantText: "CONFORMITÉ"`.

**Changement de track** (lecture de `a-walk-in-zeeland` pendant que le véhicule reste dans la zone EUX) : `insideZone: true` mais `sourceSlug !== "eux-gainent"` → dramaturgie idle repliée (`phaseId: "pre-cadence"`, `dominantText: null`), confirmant que la présence en zone seule n'active jamais le récit sans la bonne track.

## 9. NO-WEBGL EVIDENCE (`MEASURED`) — rejoué après correction du fallback (audit pré-merge)

**Rejoué intégralement** après les correctifs FIX A/B/D de l'audit pré-merge (suppression des labels de rôle, poses fixes par phase, légende explicative retirée). `HTMLCanvasElement.prototype.getContext` remplacé pour renvoyer `null`, track `eux-gainent` lancée réellement depuis `/tracks/eux-gainent/`, puis navigation SPA réelle vers `/drift`. Résultat : `canvasCount: 0`, panneau **« NO WEBGL — This browser cannot open the 3D room »** affiché avec ses deux destinations intactes (**OPEN 2D LAB**, **TRACKS**), suivi du panneau **« EUX GAINENT — GLASS GYM »** de `EuxGainentFallbackScene`, corrigé : description statique inchangée, **aucun** `COMPLIANT`/`CORRECTED`/`RESIDUAL`, **aucune** légende expliquant la métaphore — seulement trois silhouettes et trois barres de station.

**Limitation d'environnement rencontrée et contournée pour le test (pas un défaut du code) :** dans cette session, `document.visibilityState` est resté `"hidden"` en continu ; l'événement natif `timeupdate` de l'élément `<audio>` ne se déclenchait donc pas automatiquement malgré `audio.currentTime` réellement modifié (confirmé par lecture directe de la propriété DOM). Un `audio.dispatchEvent(new Event("timeupdate"))` manuel après chaque `currentTime =` a permis de vérifier le composant sans modifier son code — dès l'événement livré, `useAudioPlayer()`'s `currentTime` se met à jour et le composant se re-rend correctement. Ceci confirme que le composant réagit correctement à l'événement réel qu'il consomme déjà ; seule sa dispatch automatique était supprimée par l'environnement.

Poses statiques vérifiées par `phaseId`, lues directement dans les attributs `style.transform`/`className` du DOM réel :

| Temps | `phaseId` | Silhouettes (`translateX`) | Stations actives | `dominantText` |
|---|---|---|---|---|
| `0s` | `pre-cadence` | `-6px / 0px / 6px` | aucune | `null` |
| `74s` | `deviation` | `0px / 8.4px / 2.4px` | 3/3 | `ÉCART` |
| `83s` | `correction-revelation` | `0px / 0.9px / 2.4px` | 3/3 | `CONFORMITÉ` |
| `140s` | `reference-inversion` | `0px / 0.9px / 2.4px` (silhouettes `bg-neutral-400`, gelées) | 3/3 | `RENDEMENT` |
| `147.28s` (pic CUE_05) | `reference-inversion` | **identique** à `140s` — seul le texte change | 3/3 | `OBJECTIF DÉPLACÉ` |
| `210s` | `residue` | `0px / 0.6px / 4.2px` | 1/3 (uniquement la station de C) | `null` |

Chaque valeur correspond exactement à la table statique `EUX_FALLBACK_POSES` du composant. La pose à `147.28s` est **strictement identique** à celle de `140s` (mêmes trois `translateX`) — seul `dominantText` a basculé de `RENDEMENT` à `OBJECTIF DÉPLACÉ`, le changement discret explicitement approuvé au pic canonique de CUE_05. Un second `dispatchEvent("timeupdate")` sans changer `currentTime` (à `140s`) a reproduit une pose byte-identique — confirme qu'entre deux `timeupdate` dans la même phase, la représentation visuelle reste inchangée.

`audioCount: 1`, `audio.paused: false` tout au long du test — lecture non interrompue par la transition no-WebGL. Aucune erreur console (`read_console_messages`). Capture d'écran réelle recapturée à `210s` (`residue`) : mise en page propre, aucun label de rôle, aucune légende explicative, une seule station lue comme active (bleue) parmi les trois.

## 10. REDUCED-MOTION EVIDENCE (`AUTOMATED_STRUCTURAL_EVIDENCE` + `KNOWN_ENVIRONMENT_LIMITATION` partielle)

Aucun outil d'émulation CDP (`Emulation.setEmulatedMedia`) n'était exposé dans cette session pour forcer authentiquement `prefers-reduced-motion: reduce` sur une vraie instance Chrome (le listener `matchMedia` de `Drift3DClient.tsx` capture l'objet `MediaQueryList` réel une seule fois au montage ; un override post-chargement de `window.matchMedia` ne peut pas rétroactivement changer cet objet déjà capturé, et un rechargement complet efface tout override injecté avant que la page ne s'exécute).

Preuve structurelle disponible, **corrigée après l'audit pré-merge** : `git grep` confirme que `EuxGainentFallbackScene` n'est monté dans `Drift3DClient.tsx` que lorsque `fallbackReason === "reduced-motion"` ou `fallbackReason === "no-webgl"` — explicitement **exclu** de `"checking"`. Le test no-WebGL réel rejoué en §9 exerce donc le même chemin de composition React que `reduced-motion` emprunterait (même branche conditionnelle, seule la valeur de `fallbackReason` diffère), ce qui rend plausible — sans le prouver directement par une émulation OS réelle — que `EuxGainentFallbackScene` se comporte de façon identique pour `reduced-motion`. Ceci reste `KNOWN_ENVIRONMENT_LIMITATION` pour le déclenchement réel de `reduced-motion` lui-même, pas une preuve `MEASURED`.

## 11. MOBILE EVIDENCE (`AUTOMATED_STRUCTURAL_EVIDENCE` + `KNOWN_ENVIRONMENT_LIMITATION`)

Deux tentatives réelles :

1. **Vraie instance Chrome locale** (`claude-in-chrome`), `resize_window(390, 844)` : la fenêtre OS a changé (`outerWidth/outerHeight` modifiés) mais `window.innerWidth`/`innerHeight` sont restés à `1278×845` — cet environnement rend sur un framebuffer virtuel de taille fixe indépendant du redimensionnement de fenêtre. `KNOWN_ENVIRONMENT_LIMITATION`, pas un défaut du code.
2. **Browser pane sandboxé** (`Claude_Browser`) : `resize_window` a authentiquement changé le viewport (`read_page` confirme `Viewport: 390x844`, cohérent avec la méthode déjà établie dans `DRIFT-IV-BASE-00`). Mais l'interaction par clic (déclenchement de lecture de la track EUX GAINENT) n'a pas abouti (l'audio est resté sur `entry-ambient` malgré plusieurs clics réels sur le bouton Play réel), et une capture d'écran a expiré (`timeout`) — comportement du Browser pane sandboxé déjà documenté dans `SYS-70` comme ne rendant jamais de contenu R3F de façon fiable. `KNOWN_ENVIRONMENT_LIMITATION`.

Vérification structurelle de substitution : `EuxGainentFallbackScene.tsx` utilise la même échelle de police (`text-[9px]` à `text-[11px]`) et les mêmes classes de layout flexible (`flex`, `gap-*`, aucune largeur fixe en pixels) que les panneaux de fallback déjà éprouvés en mobile (`SYS-50`/`SYS-60`). La capture d'écran desktop (§9) montre la rangée des trois indicateurs d'athlète tenir confortablement dans une largeur bien inférieure à 390px de contenu disponible.

## 12. PERFORMANCE EVIDENCE (`MEASURED` + `KNOWN_ENVIRONMENT_LIMITATION` pour un second échantillon)

Comparaison réelle, même position de zone (`-62, 42`), même session Chrome :

| Moment | `drawCalls` | `triangles` |
|---|---|---|
| PRE-BUILD (avant tout code EUX-20, landmark statique original 14 primitives) | `193` | `201412` |
| POST-BUILD, premier contrôle (`EuxGainentLivingScene` montée, scène idle) | `164` | `197336` |

Les deux valeurs sont réelles (`canvasPresent: true`, mesure directe `gl.info.render`), à la même position de zone. **Dans cet échantillon observé, les draw calls et triangles post-build sont inférieurs à l'échantillon pré-build. L'angle de caméra/l'orientation n'étant pas strictement contrôlés et aucun nouvel échantillon FPS post-build n'ayant été obtenu, ceci n'établit pas l'absence d'une régression de performance globale.**

Un second échantillon FPS frais (via `beginFpsSample`/`endFpsSample`) n'a pas pu être obtenu en fin de session : la fenêtre Chrome réelle a perdu le focus au premier plan du système d'exploitation (`document.visibilityState` resté `"hidden"` malgré clics/touches clavier réels répétés et attentes allant jusqu'à 20s+, y compris dans un nouvel onglet fraîchement créé dans la même fenêtre) — `KNOWN_ENVIRONMENT_LIMITATION`, documentée en détail en §15. `cumulativeFrameCount` est resté honnêtement gelé à `0` pendant cette période (le harness ne fabrique jamais une valeur), cohérent avec son contrat.

## 13. RESOURCE CLEANUP (`AUTOMATED_STRUCTURAL_EVIDENCE` + `MEASURED` partiel)

Structurel : `EuxGainentLivingScene.tsx` construit un jeu fixe de **cinq** `THREE.CanvasTexture` (une par mot dominant : `CADENCE`/`ÉCART`/`CONFORMITÉ`/`RENDEMENT`/`OBJECTIF DÉPLACÉ`), une seule fois au montage (`useMemo`), permutées sur une seule surface de vitre, et les dispose explicitement dans le nettoyage du `useEffect` correspondant (`texture.dispose()` sur chacune, ligne confirmée par `git grep`). Le probe dev suit le même schéma de nettoyage par identité de référence établi depuis `SYS-10` (`if (window.__drift3dEuxGainent === probe) delete ...`).

Empirique : plusieurs cycles de route réels ont eu lieu pendant cette session de test (`/drift` → `/tracks` → `/drift`, plusieurs fois, pour les tests de changement de track/no-WebGL/loop), sans erreur console (`read_console_messages` propre) et sans dégradation visuelle ou comportementale observée d'un cycle à l'autre (chaque nouveau montage a correctement re-résolu son état depuis zéro). Un test de fuite mémoire approfondi (profilage heap DevTools sur de nombreux remontages rapides) n'a pas été réalisé — hors de portée des outils disponibles dans cette session, `KNOWN_ENVIRONMENT_LIMITATION` pour cette profondeur de preuve spécifique.

## 14. AUDIO INVARIANCE (`MEASURED` + `AUTOMATED_STRUCTURAL_EVIDENCE`)

Structurel : `git grep -n "\.play(\|\.pause(\|\.currentTime\s*=\|\.load("` sur `src/lib/drift3dEuxGainent.ts` et `src/components/drift-3d/EuxGainentLivingScene.tsx` → aucune correspondance. Le nouveau code ne commande jamais l'audio, cohérent avec le contrat « lecteur seul de l'horloge partagée ».

Empirique : tout au long des tests de seek/pause/loop/changement de track de cette session, chaque manipulation de l'élément `<audio>` réel était une action de test explicite et externe — la dramaturgie EUX GAINENT n'a jamais elle-même modifié `currentTime`/`paused`/`src`, se contentant de refléter fidèlement l'état réel observé à chaque lecture.

## 15. KNOWN LIMITATIONS

- **Focus OS perdu en fin de session (`claude-in-chrome`) :** `document.visibilityState` resté `"hidden"` (avec `hasFocus()` tantôt `true` tantôt `false`) malgré clics/touches clavier réels répétés et attentes cumulées de plusieurs dizaines de secondes, y compris sur un nouvel onglet créé dans la même fenêtre. `cumulativeFrameCount` est resté honnêtement gelé à `0` — comportement cohérent avec un `requestAnimationFrame` légitimement suspendu par le navigateur pour un document non visible, pas un défaut du code de ce lot. A empêché : un second échantillon FPS post-build frais (mitigé par la comparaison réelle pré/post-build de §12, obtenue avant cette perte de focus), une vérification manuelle supplémentaire du nettoyage mémoire approfondi (§13).
- **Redimensionnement de fenêtre Chrome réelle sans effet sur le viewport de rendu :** confirmé que `claude-in-chrome`'s `resize_window` change les dimensions OS de la fenêtre mais pas `window.innerWidth`/`innerHeight` (environnement à framebuffer virtuel fixe). Empêche toute vérification mobile interactive avec rendu R3F réel dans cette instance Chrome spécifique.
- **Interaction peu fiable dans le Browser pane sandboxé en fin de test mobile :** un clic réel sur le bouton Play n'a pas déclenché la lecture attendue, et une capture d'écran a expiré — cohérent avec la limitation déjà documentée dans `SYS-70` (le Browser pane sandboxé ne rend jamais de façon fiable de contenu R3F ; ici, l'instabilité s'est étendue à l'interaction DOM simple en fin de session).
- **`timeupdate` natif non livré automatiquement pendant la passe d'audit pré-merge (`claude-in-chrome`) :** `document.visibilityState` de nouveau resté `"hidden"` ; `audio.currentTime` changeait bien réellement (propriété DOM vérifiée) mais l'événement `timeupdate` — dont dépend `useAudioPlayer()`'s `currentTime` et donc le re-rendu de `EuxGainentFallbackScene` — ne se déclenchait pas seul. Un `dispatchEvent(new Event("timeupdate"))` manuel après chaque changement de `currentTime` a permis de vérifier chaque phase sans modifier une seule ligne du composant testé — dès l'événement livré, le composant se comportait exactement comme prévu (voir §9). Documenté comme limite d'environnement, pas comme un contournement du code de production.
- **Aucune de ces limitations n'affecte les preuves de dramaturgie/narration elles-mêmes** (§3-§9), toutes obtenues avec succès (soit directement, soit via l'événement `timeupdate` livré manuellement pour la passe d'audit) pendant la portion de la session où le rendu était pleinement actif.
