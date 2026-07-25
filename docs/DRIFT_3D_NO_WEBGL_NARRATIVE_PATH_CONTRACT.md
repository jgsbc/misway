# DRIFT 3D — No-WebGL narrative path contract

- **Version :** 1.0
- **Date :** 2026-07-19
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-60`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-60` : un contrat d'accès partagé no-WebGL, immuable, honnête, et un panneau statique léger qui le matérialise. **`SYS-60` ne livre aucun fallback statique spécifique à une track.** Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §11 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée, et `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md`/`docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md`/`docs/DRIFT_3D_REDUCED_MOTION_CONTRACT.md` pour les trois autres services partagés (également non modifiés par ce lot).

---

## 1. No-WebGL = access path, jamais Quality Tier

Le chemin no-WebGL est un **chemin d'accès produit partagé** — ce n'est **pas** un Quality Tier, **pas** le tier `LOW`, **pas** une politique de performance, **pas** une nouvelle direction artistique. Il ne doit jamais devenir un renderer alternatif, une deuxième map 3D, un moteur Canvas 2D complexe, une duplication de la track list ou du player. Il offre uniquement : une représentation statique honnête de Drift, un accès clair à la carte 2D existante, un accès clair au catalogue Tracks, la continuité du player global, aucun autoplay, aucune promesse de conduite ou d'interaction 3D disponible.

## 2. No-WebGL ≠ reduced-motion

Ce sont deux contrats distincts. Cas `prefersReducedMotion = true` et `hasWebGL = false` : le fallback affiché reste `reduced-motion` (priorité déjà existante dans `Drift3DClient.tsx`, inchangée par ce lot). Le panneau narratif no-WebGL n'est rendu que pour `fallbackReason === "no-webgl"`.

## 3. Détection WebGL reste dans `Drift3DClient`

`canUseWebGL()` n'est pas modifiée par ce lot. Le gate existant reste : `checking` → `reduced-motion` si préférence reduced → `no-webgl` si WebGL indisponible → `Canvas` sinon.

## 4. Canvas absent

Comme avant ce lot, `Drift3DCanvas` n'est jamais monté sur le chemin no-WebGL — `SYS-60` ne change rien à cette absence, il l'habille d'un contenu utile.

## 5. Panneau statique choisi pour ce lot

L'architecture cible autorise « carte/listening path, illustration ou panneau, résumé court, contrôle audio complet ». Pour `SYS-60`, le choix retenu est le **panneau** (`Drift3DNoWebGLPath.tsx`) — pas une nouvelle illustration, faute d'autorité artistique approuvée pour un nouvel asset dans ce lot.

## 6. Aucun nouvel asset artistique

Aucune image, texture, illustration, SVG artistique, fichier audio ou police n'est ajoutée par ce lot (`public/**` inchangé). Le panneau est construit uniquement avec le système visuel déjà existant (mêmes classes `light-*` que le template générique de `Drift3DFallback.tsx`).

## 7. Texte existant réutilisé

Le label (« No WebGL »), le titre (« This browser cannot open the 3D room. ») et le corps (« The 2D lab remains the reference map. Nothing needs to play here. ») sont la copie déjà livrée, désormais portée par `Drift3DNoWebGLPath.tsx` plutôt que par le template générique de `Drift3DFallback.tsx`. La phrase descriptive du monde 3D (« Fullscreen drivable 3D listening world: a safari 4x4 crosses four eras and twenty-six track places over real terrain — mountains, canals, storms and dawns. ») est extraite en constante partagée `DRIFT_3D_WORLD_SUMMARY`, exportée par `Drift3DNoWebGLPath.tsx` et réutilisée telle quelle par la description `sr-only` de `Drift3DClient.tsx` — aucune réécriture artistique. La partie de cette phrase décrivant les contrôles de conduite (« Keyboard, mouse drag or touch drag to drive... ») n'est **jamais** reprise sur le chemin no-WebGL, précisément parce que ce chemin ne doit jamais promettre une interaction indisponible.

## 8. `/drift-lab` = map path

La destination canonique `map` pointe vers `/drift-lab`, la carte 2D historique déjà livrée (`DriftMapClient`/`driftMap.ts`). `SYS-60` ne réimplémente pas cette carte, ne copie pas sa topologie et ne crée aucune nouvelle carte fallback.

## 9. `/tracks` = listening/catalogue path

La destination canonique `tracks` pointe vers `/tracks`, le catalogue déjà livré (`TrackPlayButton` sur chaque fiche). C'est le chemin d'écoute explicite qui permet de lancer et contrôler le player global.

## 10. Global player = autorité audio

`audioAuthority: "global-player"` — `SYS-60` ne crée aucun `<audio>`, aucun `AudioContext` musical, aucun player local. `src/components/audio/AudioPlayerProvider.tsx` n'est pas modifié.

## 11. Aucun autoplay

`autoplay: false` dans le contrat canonique. Aucune action de ce lot ne déclenche de lecture automatique.

## 12. Aucun second player

Le panneau ne rend aucun contrôle audio propre — il s'appuie exclusivement sur l'autorité globale déjà livrée. Un second player constituerait une stop condition.

## 13. Aucune promesse de conduite

`promises3DInteraction: false`. Le panneau ne doit jamais afficher « Drive », « Use WASD », « Drag to drive » ou « Explore in 3D » comme action disponible. Le résumé du monde peut décrire honnêtement sa nature drivable/3D, mais uniquement comme description, jamais comme action proposée sur ce chemin. Le tutoriel de conduite desktop (« ZQSD / WASD / ARROWS / DRAG / WHEEL ») est désormais masqué dans `Drift3DClient.tsx` dès qu'un `fallbackReason` est actif (checking, reduced-motion ou no-webgl) — correction autorisée car elle supprime une fausse promesse d'interaction, sans modifier les contrôles 3D eux-mêmes.

## 14. Aucune scène track fallback spécifique

Ce lot ne construit aucune représentation statique propre à une track. Aucun Contrat d'Identité ni Cue Map n'a été lu ou câblé.

## 15. Aucune Cue Map

`src/lib/drift3dNoWebGL.ts` n'importe ni `drift3dCueResolver.ts`, ni `drift3dSignatureArbitration.ts`, ni `tracks.ts` — il ne connaît aucune track, aucune phase, aucun slug.

## 16. Aucune nouvelle carte

`/drift-lab` existe déjà et n'est pas dupliqué, réimplémenté, ni porté dans un nouveau composant.

## 17. `basePath` via Next `Link`

Les deux destinations sont rendues via `next/link`, comme partout ailleurs dans le projet — aucune URL absolue localhost, aucun `window.location` codé en dur, aucune gestion manuelle de `basePath` dans le code de production.

## 18. Contrat canonique

```ts
export type Drift3DNoWebGLNarrativePath = Readonly<{
  representation: "panel";
  requiresWebGL: false;
  mounts3DCanvas: false;
  audioAuthority: "global-player";
  autoplay: false;
  promises3DInteraction: false;
  destinations: readonly Drift3DNoWebGLDestination[];
  guarantees: Drift3DNoWebGLGuarantees;
}>;

export type Drift3DNoWebGLDestination = Readonly<{
  id: "map" | "tracks";
  href: "/drift-lab" | "/tracks";
  role: "map" | "listening";
}>;
```

Le contrat entier — le chemin, `destinations`, chaque destination, et `guarantees` — est `Object.freeze`d en runtime. Aucun `Map`/`Set` mutable module-scope.

## 19. Garanties

```ts
export type Drift3DNoWebGLGuarantees = Readonly<{
  usefulRoute: true;
  catalogueAccessible: true;
  mapAccessible: true;
  globalAudioPreserved: true;
  staticLightweightRepresentation: true;
  honestInteractionBoundary: true;
}>;
```

Littéralement typées `true`, jamais `boolean`. Ces garanties ne créent pas elles-mêmes une carte, un catalogue ou un player — elles garantissent que le chemin no-WebGL s'appuie sur `/drift-lab`, `/tracks` et `AudioPlayerProvider` déjà livrés.

## 20. Validation

`getDrift3DNoWebGLPathIssues`/`getDrift3DCanonicalNoWebGLIssues` détectent : `representation`/`requiresWebGL`/`mounts3DCanvas`/`audioAuthority`/`autoplay`/`promises3DInteraction` non conformes ; destination `map` ou `tracks` manquante ; id de destination dupliqué ; `href`/`role` incorrect pour une destination connue ; toute garantie différente de `true`. Destinés à l'authoring/tests/dev/acceptance — le chemin chaud (`getDrift3DNoWebGLNarrativePath`) suppose un contrat déjà validé.

## 21. Harness read-only

En développement seulement, `Drift3DClient.tsx` installe `window.__drift3dNoWebGL` (`Object.freeze`d : `getPath()`, `validate(path)`, `validateCanonical()`) — au niveau du shell, pas dans `Drift3DCanvas.tsx`, pour la même raison que le probe reduced-motion : le `Canvas` est absent quand ce fallback est actif. Aucun `forceNoWebGL`/`disableWebGL`/`setFallback`/`setMode`/`navigate`/`play`/`pause`. Cleanup par comparaison d'identité de référence, comme les probes `SYS` précédents. Aucun `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame`.

## 22. Limites de `DRIFT-IV-SYS-60`

- Aucun fallback statique spécifique à une track n'est livré.
- Aucune modification de `Drift3DCanvas.tsx`, `Drift3DScene.tsx`, `Drift3DScatterField.tsx`, `Drift3DEffects.tsx`, `Drift3DLandmark.tsx`, `drift3dQuality.ts`, `drift3dReducedMotion.ts`.
- `canUseWebGL()` inchangée.
- Aucun nouvel asset public.
- Aucune nouvelle dépendance.

## 23. Responsabilités de `DRIFT-IV-SYS-70`+

- **`SYS-70` (evidence/performance harness)** : non abordé par ce lot.
- **Futurs Builds track-local** : pourront ajouter une représentation fallback locale uniquement lorsque leurs contrats artistiques approuvés l'autorisent — sans que ce module n'ait besoin d'être modifié.
