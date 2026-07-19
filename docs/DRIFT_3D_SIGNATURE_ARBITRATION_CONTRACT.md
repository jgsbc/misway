# DRIFT 3D — Signature arbitration contract

- **Version :** 1.0
- **Date :** 2026-07-19
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-30`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-30` : un arbitre pur et déterministe garantissant qu'au plus une situation signature majeure gagne à un instant donné, et un harness de développement read-only pour le prouver. **`SYS-30` ne livre aucune signature artistique réelle, aucune Cue Map, aucun mapping phase → signature.** Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.4 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée, `docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md` pour le resolver de cues livré par `DRIFT-IV-SYS-20` (distinct, non modifié par ce lot), et `docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md`/`docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md` pour les deux autres services partagés (également non modifiés).

---

## 1. Définition d'une signature majeure

Une **signature majeure** est une situation ponctuelle et exceptionnelle qu'une scène peut vouloir mettre en avant — au plus une à la fois, dans tout le monde Drift. Ce contrat ne définit **aucune** signature réelle ; il définit seulement la règle qui décide, parmi des candidats fournis par l'appelant, lequel (s'il y en a un) l'emporte.

## 2. Distinction signature majeure / boucle de vie

Les **boucles de vie** (passants, machines, trafic, robots, animaux, micro-événements, activité ambiante) ne sont **jamais** représentées comme candidats de ce service — elles restent sous la responsabilité exclusive des scènes locales, en dehors du canal d'arbitrage. « Une seule signature majeure à la fois » **ne signifie pas** « un seul comportement vivant à la fois ». L'élection d'une signature majeure ne désactive, ne suspend, ne nettoie et ne mute jamais les boucles de vie — le service n'a d'ailleurs aucune API pour le faire (pas de `suppressLifeLoops()` ni équivalent).

## 3. Candidat générique

```ts
type Drift3DSignatureCandidate<TSignatureId extends string = string> = Readonly<{
  id: TSignatureId;
  ownerKind: "active-track" | "world";
  eligible: boolean;
  priority: number;
}>;
```

- `id` — identifiant opaque pour l'arbitre, sans signification artistique connue de ce module.
- `eligible` — le candidat est actuellement autorisé à concourir ; un candidat inéligible est ignoré, quelle que soit sa priorité.
- `priority` — comparée **uniquement** entre candidats du même `ownerKind` ; une valeur négative est autorisée (la priorité est purement relative).

## 4. `ownerKind`

- `"active-track"` — l'**appelant affirme** que ce candidat appartient à la track actuellement active. L'arbitre ne vérifie rien : il ne connaît ni player, ni slug, ni zone. C'est au futur consommateur track-local de ne déclarer `"active-track"` que lorsque son propre contrat d'activation est satisfait.
- `"world"` — candidat majeur provenant du monde, hors signature de track active.

## 5. Priorité absolue `active-track` > `world`

Un candidat `"active-track"` éligible bat **toujours** un candidat `"world"` éligible, quelles que soient leurs priorités numériques respectives. `priority` ne permet jamais à un candidat `"world"` de dépasser un candidat `"active-track"` — vérifié même à l'extrême (`active-track priority = -1 000 000`, `world priority = 1 000 000` → `active-track` gagne).

## 6. Priorité numérique intra-`ownerKind`

À `ownerKind` égal, le candidat éligible de plus haute `priority` gagne.

## 7. Tie-break lexical déterministe

À `ownerKind` et `priority` strictement identiques, l'`id` lexicalement le plus petit gagne — comparé par ordre de code units UTF-16 (`a.id < b.id`), **jamais** `localeCompare`, pour que le résultat ne dépende jamais de la locale système.

À `ownerKind` et `priority` identiques, l'identité du gagnant, son `ownerKind`, sa `priority` et la décision d'arbitrage (`decision`) sont indépendants de l'ordre d'entrée du tableau.

`activeCandidateIndex`, lui, reflète volontairement la position du gagnant dans le tableau fourni par l'appelant et peut donc changer lorsque ce tableau est permuté — ce n'est pas une non-conformité du tie-break, c'est la définition même de ce champ (position dans *ce* tableau, pas identité globale).

## 8. Une seule signature gagnante

```ts
type Drift3DSignatureArbitrationResult<TSignatureId extends string = string> = Readonly<{
  activeSignatureId: TSignatureId | null;
  activeCandidateIndex: number;
  activeOwnerKind: "active-track" | "world" | null;
  activePriority: number | null;
  candidateCount: number;
  eligibleCandidateCount: number;
  decision: "none" | "active-track" | "world";
}>;
```

`activeSignatureId` est **exactement un** id, ou `null` — jamais une collection de gagnants. Le service ne retourne jamais plusieurs signatures actives simultanément.

## 9. Résultat `null` si aucun candidat éligible

Si la liste est vide, ou si tous les candidats ont `eligible: false`, le résultat est déterministe : `activeSignatureId: null`, `activeCandidateIndex: -1`, `activeOwnerKind: null`, `activePriority: null`, `decision: "none"`.

## 10. Service stateless

`src/lib/drift3dSignatureArbitration.ts` ne conserve **aucun** état module-scope mutable : pas de gagnant précédent, pas d'historique d'activation, pas d'ensemble de signatures déjà vues, pas de progression de transition, pas de résidu. Chaque appel à `arbitrateDrift3DMajorSignature(candidates)` est une fonction pure de son seul argument — résoudre la même liste produit toujours le même résultat. Sélection en un seul passage `O(n)`, sans trier ni muter le tableau fourni.

## 11. Cleanup par retrait des candidats

Le module étant entièrement stateless, il n'existe aucun gagnant persistant à nettoyer dans le service lui-même. Le cleanup canonique s'obtient simplement en rappelant `arbitrateDrift3DMajorSignature([])`, ou avec tous les candidats `eligible: false` : le résultat redevient immédiatement `activeSignatureId: null` / `decision: "none"`. Ainsi, après une sortie de zone, un reset de scène, un changement de track ou un démontage de route, un futur consommateur peut vider ses candidats locaux et obtenir instantanément une arbitration vide — sans reset impératif nécessaire dans le service.

## 12. Aucune persistance

Confirmé par construction (§10) : aucune variable module-scope, aucune `Map`/registry globale, aucun `useRef`/état React dans ce module (il n'importe même pas React).

## 13. Absence de slug / track / Cue Map

`src/lib/drift3dSignatureArbitration.ts` n'importe ni `drift3dAudioClock.ts`, ni `drift3dCueResolver.ts`, ni `drift3dSceneLifecycle.ts`, ni `tracks.ts` — vérifié structurellement (`docs/evidence/DRIFT-IV-SYS-30/signature-arbitration-evidence.md`). Il ne lit aucun slug et n'interprète aucune Cue Map. `SYS-30` ne connecte pas non plus lui-même le service à `sceneLifecycleRef`, `timelineRevision`, `sourceSlug` ou la proximité de zone — cette intégration reste la responsabilité des futurs consommateurs locaux.

## 14. Absence de mapping phase → signature

Ce lot ne définit aucune correspondance entre une phase de cue (`phaseId` du resolver `SYS-20`) et une signature. Un futur Build track pourra construire un tel mapping de son côté, en amont de l'appel à `arbitrateDrift3DMajorSignature`, mais ce module n'en a et n'en aura aucune connaissance directe.

## 15. Responsabilité future des scènes track-local

Ce service :

- ne décide **pas** quelle track est active ;
- ne décide **pas** si un candidat signature est artistiquement éligible ;
- n'instancie et ne rend **aucune** signature ;
- ne supprime **aucune** boucle de vie ordinaire.

Ces responsabilités — déterminer l'activation, l'éligibilité artistique, l'instanciation visuelle — restent track-local dans les futurs lots Build, **y compris dans les vertical slices qui servent précisément à les prouver**. Le gate « au moins deux vertical slices » (`DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §12) conditionne l'extraction ou l'industrialisation d'une abstraction partagée à partir de ces responsabilités — pas le droit de les implémenter localement dans une proof slice. Sans preuve suffisante (moins de deux vertical slices), ce code reste local et n'est pas remonté dans un service partagé.

## 16. Harness de développement — read-only

En développement seulement, `Drift3DCanvas.tsx` installe :

```text
window.__drift3dSignatureArbitration
```

Disponible dès le montage de `Drift3DCanvas` — comme le probe du Cue Resolver (`SYS-20`), il vit hors de l'arbre react-three-fiber, sans dépendre du montage interne du `Canvas` ni d'un `requestAnimationFrame`. API :

```ts
{
  validate(candidates),
  arbitrate(candidates),
}
```

`Object.freeze`d, aucune méthode de mutation, aucun état persistant, aucune commande audio, aucune commande de lifecycle, aucune commande de scène. Le probe n'appelle que les fonctions pures du module.

## 17. Cleanup du probe

Aucun registre partagé nouveau, et le registre par jeton de `Drift3DScene.tsx` (livré par `SYS-10` pour ses cinq probes) n'est ni modifié ni réutilisé ici. `Drift3DCanvas.tsx` utilise la même protection d'identité locale déjà retenue pour le probe `SYS-20` : l'objet `probe` créé à ce montage est comparé par référence (`===`) à `window.__drift3dSignatureArbitration` avant suppression au démontage — un cleanup tardif d'une instance déjà remplacée ne peut donc jamais supprimer le probe d'une instance plus récente. Aucun `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` pour ce probe.

## 18. Non-intégration au runtime artistique

Dans ce lot, aucune scène actuelle (`Drift3DScene`, `Drift3DZone`, `Drift3DLandmark`, `Drift3DProp`) ne reçoit `signatureArbitrationRef`, `activeSignatureId` ou une notion de phase de signature — aucune scène ne change visuellement. `SYS-30` livre uniquement le service générique, le harness et le contrat ; le premier usage artistique réel arrivera dans un futur Build track prouvé.

## 19. Limites de `DRIFT-IV-SYS-30`

- **Aucune signature artistique réelle n'est livrée.** Les candidats de preuve (`docs/evidence/DRIFT-IV-SYS-30/signature-arbitration-evidence.md`) sont entièrement synthétiques (`probe-world`, `probe-track`, etc.) et n'ont aucune signification artistique.
- `SYS-30` ne décide pas quelle track est active.
- `SYS-30` ne décide pas si un candidat signature est artistiquement éligible.
- `SYS-30` n'instancie ni ne rend aucune signature.
- `SYS-30` ne supprime aucune boucle de vie ordinaire.
- Aucun quality tier, aucune mémoire/résidu, aucun moteur de transition d'ère, aucune population partagée, aucune animation nouvelle ne sont livrés par ce lot.

## 20. Responsabilités de `DRIFT-IV-SYS-40`+

- **`SYS-40` (quality tiers préservant l'identité)** : non abordé par ce lot.
- **Premier Build track consommant l'arbitrage** : construira ses propres candidats (`ownerKind`, `eligible`, `priority`) à partir de son contrat d'activation local et de son Identity Contract approuvé, et appellera `arbitrateDrift3DMajorSignature` avec sa propre timeline de décision — sans que ce module n'ait besoin d'être modifié.
