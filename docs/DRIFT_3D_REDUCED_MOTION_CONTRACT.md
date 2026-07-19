# DRIFT 3D — Reduced-motion contract

- **Version :** 1.0
- **Date :** 2026-07-19
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-50`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-50` : deux modes canoniques de mouvement, immuables, préservant le sens, et un harness de développement read-only au niveau du shell pour les prouver. **`SYS-50` ne livre aucune scène track reduced-motion réelle, aucune Cue Map reduced-motion, aucun mapping phase → pose.** Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §11 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée, et `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md`/`docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md`/`docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md`/`docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md` pour les quatre autres services partagés (également non modifiés par ce lot).

---

## 1. Reduced motion = accessibilité, jamais quality

Reduced motion est un **contrat d'accessibilité**. Ce n'est **pas** un Quality Tier, **pas** le tier `LOW`, **pas** une politique de performance, **pas** une autre direction artistique, **pas** une version « pauvre » du monde. La préférence reduced-motion doit supprimer ou éviter : camera shake, travelling imposé, pulsation rapide, mouvement agressif. Le sens futur des scènes doit pouvoir survivre grâce à : poses, états, lumière, matériaux, avant/après, transitions lentes.

**`SYS-50` définit ces catégories génériques. `SYS-50` ne décide pas comment une track particulière les matérialise.**

## 2. Deux modes canoniques : `standard` / `reduced`

```ts
export type Drift3DReducedMotionMode = "standard" | "reduced";
```

Aucun troisième mode. Pas de `low-motion`, `minimal`, `accessible`, `disabled` ou `auto` comme modes supplémentaires.

## 3. Résolution depuis `prefersReducedMotion`

```ts
resolveDrift3DReducedMotionMode(false) → "standard"
resolveDrift3DReducedMotionMode(true)  → "reduced"
```

Fonction triviale et déterministe. Elle ne lit jamais `matchMedia` elle-même — `window.matchMedia("(prefers-reduced-motion: reduce)")` reste une responsabilité exclusive du shell `Drift3DClient.tsx`, avec son `mediaQuery.addEventListener("change", ...)` existant, inchangé par ce lot.

## 4. Capacités de mouvement

```ts
export type Drift3DReducedMotionCapabilities = Readonly<{
  allowCameraShake: boolean;
  allowForcedCameraTravel: boolean;
  allowRapidPulsation: boolean;
  allowAggressiveMotion: boolean;
  allowSlowTransitions: boolean;
}>;
```

Politique `standard` : les cinq `true`. Politique `reduced` : `allowCameraShake`/`allowForcedCameraTravel`/`allowRapidPulsation`/`allowAggressiveMotion` = `false`, `allowSlowTransitions` = `true` — shake, travelling imposé, pulsation rapide et mouvement agressif sont interdits en mode `reduced` ; les transitions lentes restent autorisées. Aucune durée minimale en ms, aucun multiplicateur de vitesse, aucune fréquence maximale, aucun seuil Hz, aucune amplitude maximale n'est inventé ici — ces valeurs numériques devront être prouvées par de futurs consommateurs si elles deviennent nécessaires.

## 5. Garanties de sens

```ts
export type Drift3DReducedMotionMeaningGuarantees = Readonly<{
  poses: true;
  states: true;
  lighting: true;
  materials: true;
  beforeAfter: true;
}>;
```

Littéralement typées `true`, jamais `boolean` : un profil canonique ne peut pas déclarer `poses: false` au niveau TypeScript.

- `poses` → une information narrative peut rester lisible par une pose stable.
- `states` → un changement d'état peut remplacer une animation continue.
- `lighting` → la lumière peut porter une évolution de sens.
- `materials` → les matériaux peuvent porter une évolution de sens.
- `beforeAfter` → le contraste entre deux états reste disponible.

**Important : `SYS-50` ne crée aucune pose, aucun état artistique, aucun éclairage de track, aucun matériau de track, aucun avant/après réel.**

## 6. Profils frozen

```ts
export type Drift3DReducedMotionPolicy = Readonly<{
  mode: Drift3DReducedMotionMode;
  motion: Drift3DReducedMotionCapabilities;
  meaning: Drift3DReducedMotionMeaningGuarantees;
}>;
```

Les deux politiques canoniques (`src/lib/drift3dReducedMotion.ts`) sont `Object.freeze`d en runtime — pas seulement `readonly` côté TypeScript — sur la politique elle-même, `motion` et `meaning`. Aucun `Map`/`Set` mutable module-scope : le seul état module-scope est un objet et un tableau frozen (`CANONICAL_REDUCED_MOTION_POLICIES`, `DRIFT_3D_REDUCED_MOTION_MODES`).

## 7. Validation

`getDrift3DReducedMotionPolicyIssues` détecte : mode invalide ; pour un mode valide, toute capacité de mouvement qui ne correspond pas au motif canonique de ce mode (`reduced` interdit shake/forced-travel/rapid-pulsation/aggressive-motion et exige `allowSlowTransitions`, `standard` exige les cinq) ; toute garantie de sens différente de `true`. `getDrift3DCanonicalReducedMotionIssues()` retourne `[]` sur les deux politiques réelles. Ces validateurs sont destinés à l'authoring, aux tests, au harness dev et à l'acceptance — le chemin chaud (`getDrift3DReducedMotionPolicy`) suppose des politiques canoniques déjà validées et ne les revalide pas.

## 8. `matchMedia` reste dans `Drift3DClient`

`src/lib/drift3dReducedMotion.ts` ne lit jamais `window`, `document`, `navigator` ou `matchMedia`. `Drift3DClient.tsx` conserve son listener `matchMedia` existant tel quel ; ce lot ajoute uniquement un appel à `resolveDrift3DReducedMotionMode(prefersReducedMotion)` pour formaliser la traduction booléen → mode, sans changer l'ordre général du gate (`checking` / `reduced-motion` / `no-webgl` / Canvas).

## 9. Shell actuel : reduced → fallback, Canvas absent (intentionnel)

Avant `SYS-50`, le runtime fait déjà ceci : `prefers-reduced-motion: reduce` → `Drift3DClient` ne monte pas le `Canvas` → `Drift3DFallback reason="reduced-motion"` → *"The 3D room stays closed today."* → accès au chemin 2D → player global intact. **Cette vérité runtime reste valide après `SYS-50`.** `SYS-50` ne rouvre pas soudainement le monde 3D pour les utilisateurs reduced-motion ; il formalise (1) la politique générique reduced-motion, (2) les invariants sémantiques que devront respecter les futurs Builds track-local, et (3) le lien explicite entre la préférence système et le fallback actuellement livré.

## 10. `SYS-50` ne livre pas de version 3D reduced-motion des tracks

**The current delivered reduced-motion route remains the non-Canvas fallback path. `SYS-50` formalizes the contract but does not claim that track-local reduced-motion 3D representations have been implemented. Future track Builds must preserve meaning without relying on aggressive motion.**

## 11. Responsabilité future des Builds track-local

Les futurs Builds track-local devront définir leur représentation reduced-motion locale lorsque la scène réelle existe. Ils pourront utiliser poses, états, lumière, matériaux, avant/après, transitions lentes. Ils devront éviter shake, travelling imposé, pulsation rapide, mouvement agressif. `SYS-50` ne crée aucune abstraction de dramaturgie track partagée — la représentation concrète reste locale jusqu'à preuve suffisante au gate d'industrialisation (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §12). Aucun `src/lib/reduced-motion/<track>.ts`, aucun registre de scènes reduced-motion partagé, aucun cue-to-pose mapper n'est créé par ce lot.

## 12. Player global inchangé, aucun autoplay

Le player audio global (`AudioPlayerProvider`) n'est pas modifié par ce lot. La préférence reduced-motion n'appelle ni pause ni stop sur l'audio — un `<audio>` unique reste la source de vérité, avec ou sans reduced motion actif, et aucun autoplay n'est introduit.

## 13. Reduced motion ≠ `LOW`

`HIGH` + reduced motion est conceptuellement valide. `LOW` + mouvement standard est conceptuellement valide. `SYS-50` ne sélectionne aucun Quality Tier — `src/lib/drift3dReducedMotion.ts` n'importe pas `drift3dQuality.ts` et n'appelle jamais `getDrift3DQualityProfile("low")` en réponse à un mode reduced. Dans le runtime actuel, le Canvas n'est pas monté en reduced-motion, donc aucun Quality Tier n'est effectivement appliqué dans ce chemin — cela ne signifie **pas** « reduced-motion = LOW », cela signifie simplement que le shell actuel utilise le fallback.

## 14. Reduced motion ≠ no-WebGL

Un utilisateur peut avoir WebGL disponible et `prefers-reduced-motion` actif, et recevoir le fallback reduced-motion. Un utilisateur peut ne pas avoir WebGL et `prefers-reduced-motion` inactif, et recevoir le fallback no-WebGL. `SYS-50` ne définit pas le contenu narratif no-WebGL — c'est `DRIFT-IV-SYS-60`.

## 15. Harness de développement — read-only, niveau shell

En développement seulement, `Drift3DClient.tsx` installe :

```text
window.__drift3dReducedMotion
```

Installé dans `Drift3DClient.tsx` et **non** dans `Drift3DCanvas.tsx` : le `Canvas` est volontairement absent quand reduced motion est actif, donc un probe qui y vivrait disparaîtrait précisément quand il est le plus utile à inspecter. API :

```ts
{
  modes,
  resolveMode(prefersReducedMotion),
  getPolicy(mode),
  validate(policy),
  validateCanonical(),
}
```

`Object.freeze`d, aucune méthode de mutation, aucun état courant, aucune commande `matchMedia`, aucune commande quality, aucune commande audio, aucune commande de lifecycle. Le probe permet de **CALCULER** un mode/une politique ; il ne permet jamais d'**APPLIQUER** un mode ni de contrôler la préférence système — pas de `setReducedMotion()`, `forceReduced()`, `disableMotion()`, `applyPolicy()`, `setTier()`.

## 16. Cleanup du probe

Même stratégie locale que les probes `SYS-20`/`SYS-30`/`SYS-40` : l'objet `probe` créé au montage est comparé par référence (`===`) à `window.__drift3dReducedMotion` avant suppression au démontage. Aucun registre partagé nouveau. Aucun `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` pour ce probe.

## 17. Limites de `DRIFT-IV-SYS-50`

- Aucune scène track reduced-motion réelle n'est livrée. Les fixtures de preuve (`docs/evidence/DRIFT-IV-SYS-50/reduced-motion-evidence.md`) sont entièrement génériques et n'ont aucune signification artistique.
- `SYS-50` ne modifie pas `Drift3DFallback.tsx` (copy inchangé), `Drift3DCanvas.tsx`, `Drift3DScene.tsx`, ni `drift3dQuality.ts`.
- Aucune ouverture du Canvas en mode `reduced`, aucun changement de caméra réel, aucun changement de shaders/matériaux réel, aucune nouvelle illustration, aucun changement de Quality Tier, aucun fallback no-WebGL nouveau, aucune logique device/performance, aucune nouvelle UI utilisateur, aucune préférence persistée, aucun bouton « reduce motion ».

## 18. Responsabilités de `DRIFT-IV-SYS-60`+

- **`SYS-60` (no-WebGL narrative path)** : non abordé par ce lot — reste propriétaire du contenu narratif no-WebGL.
- **Premier Build track consommant ce contrat** : décidera lui-même, localement, comment matérialiser poses/états/lumière/matériaux/avant-après/transitions lentes pour sa propre scène, en évitant shake/travelling imposé/pulsation rapide/mouvement agressif — sans que ce module n'ait besoin d'être modifié.
