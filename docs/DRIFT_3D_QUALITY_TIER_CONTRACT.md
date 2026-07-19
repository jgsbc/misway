# DRIFT 3D — Quality tier contract

- **Version :** 1.0
- **Date :** 2026-07-19
- **Statut :** `ACTIVE — RUNTIME CONTRACT` / `DELIVERED BY DRIFT-IV-SYS-40`

Ce document décrit le contrat runtime livré par `DRIFT-IV-SYS-40` : trois profils de capacités canoniques, immuables, préservant l'identité, et un harness de développement read-only pour les prouver. **`SYS-40` ne livre aucune application visuelle réelle, aucune auto-sélection de tier, aucune détection d'appareil.** Voir `docs/DRIFT_3D_INTEGRAL_SYSTEMS_ARCHITECTURE.md` §5.5 pour la cible d'architecture dont ce contrat constitue la première pierre réellement livrée, et `docs/DRIFT_3D_AUDIO_CLOCK_CONTRACT.md`/`docs/DRIFT_3D_SCENE_LIFECYCLE_CONTRACT.md`/`docs/DRIFT_3D_CUE_RESOLVER_CONTRACT.md`/`docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md` pour les quatre autres services partagés (également non modifiés par ce lot).

---

## 1. Quality = capacités, jamais style

Un quality tier pilote des **CAPACITÉS** (combien d'instances, quelle résolution, combien d'activité secondaire) — jamais des **STYLES** (palette, color script, brouillard artistique, lumière narrative, une signature remplacée par une autre, une Cue Map, le rythme dramaturgique). Un tier peut dire « moins d'instances », « résolution plus basse », « budget de reflet réduit ». Il ne peut jamais dire « changer la palette », « changer le color script », « retirer un objet signature », « retirer une cue principale », « changer l'identité d'une track ».

**Quality tiers are degradation budgets, not alternate art directions. A lower tier may reduce quantity, resolution or secondary activity. It must not redefine track identity. `SYS-40` does not decide which concrete scene elements are expendable. That decision remains local until proven by vertical slices.**

## 2. Les trois tiers canoniques

```ts
export type Drift3DQualityTier = "low" | "medium" | "high";
```

Ces noms décrivent uniquement une capacité de rendu. Ils ne signifient jamais `low = mauvais/mobile/accessible`, `medium = normal`, `high = identité complète` — **l'identité est complète dans les trois tiers** (§6). `high` représente le budget de capacité maximal ; `medium` et `low` réduisent uniquement les capacités secondaires.

## 3. Valeurs canoniques

| Capacité | LOW | MEDIUM | HIGH |
|---|---|---|---|
| `populationScale` | 0.40 | 0.70 | 1.00 |
| `scatterScale` | 0.50 | 0.75 | 1.00 |
| `dynamicTextureResolutionScale` | 0.50 | 0.75 | 1.00 |
| `renderProbeScale` | 0.50 | 0.75 | 1.00 |
| `reflectionResolutionScale` | 0.50 | 0.75 | 1.00 |
| `backgroundDetailScale` | 0.50 | 0.75 | 1.00 |
| `secondaryLoopScale` | 0.35 | 0.65 | 1.00 |

Ces chiffres sont un contrat initial de budgets relatifs, pas une politique artistique et pas une mesure de performance. **Ces ratios n'affirment pas qu'un runtime futur gagnera exactement 40 %, 50 % ou 75 % de performance. Ils décrivent uniquement le budget de capacité demandé au consommateur.**

## 4. Monotonicité

Pour chacune des sept capacités : `LOW <= MEDIUM <= HIGH`, et `HIGH = 1`. `getDrift3DQualityProfileSetIssues`/`getDrift3DCanonicalQualityIssues` détectent toute violation — un futur changement de profil ne peut donc pas produire `LOW` plus coûteux que `MEDIUM`, `MEDIUM` plus coûteux que `HIGH`, `HIGH` supérieur à `1`, ou `LOW` égal à `0`.

## 5. Profils immuables

Les trois profils canoniques (`src/lib/drift3dQuality.ts`) sont `Object.freeze`d en runtime — pas seulement `readonly` côté TypeScript — sur le profil lui-même, `profile.capabilities` et `profile.identity`. Aucun `Map`/`Set` mutable module-scope : le seul état module-scope est un objet et un tableau frozen (`CANONICAL_QUALITY_PROFILES`, `DRIFT_3D_QUALITY_TIERS`).

## 6. Garanties d'identité

```ts
export type Drift3DQualityIdentityGuarantees = Readonly<{
  worldTopology: true;
  coreNavigation: true;
  signatureObjects: true;
  primaryCue: true;
}>;
```

Les quatre propriétés sont littéralement typées `true`, jamais `boolean` : au niveau du contrat TypeScript, un profil canonique ne peut pas déclarer `signatureObjects: false` ni `primaryCue: false`.

- `worldTopology` → le monde et sa géographie fondamentale restent reconnaissables.
- `coreNavigation` → la capacité d'explorer le monde reste présente.
- `signatureObjects` → les objets/signatures artistiques essentiels ne sont pas supprimés par le Quality Tier générique.
- `primaryCue` → les événements/cues principaux ne sont pas supprimés par le Quality Tier générique.

**Important : `SYS-40` ne sait pas QUEL objet est une signature. `SYS-40` ne sait pas QUELLE cue est primaire. Il garantit seulement que ces catégories sont hors du budget de dégradation du Quality Tier.**

## 7. `populationScale`

Ratio de réduction pour une population secondaire déjà classée comme réductible (ex. figurants ambiants). `> 0`, `<= 1`. Jamais appliqué à un objet identitaire.

## 8. `scatterScale`

Ratio de réduction pour la densité d'un champ de dispersion déjà classé comme réductible. `> 0`, `<= 1`.

## 9. `dynamicTextureResolutionScale`

Ratio de réduction pour la résolution d'une texture dynamique (ex. canvas généré à la volée). `> 0`, `<= 1`.

## 10. `renderProbeScale`

Ratio de réduction pour la résolution ou la fréquence d'une sonde de rendu. `> 0`, `<= 1`.

## 11. `reflectionResolutionScale`

Ratio de réduction pour la résolution d'un render target de reflet. `> 0`, `<= 1`.

## 12. `backgroundDetailScale`

Ratio de réduction pour le détail d'arrière-plan (ex. éléments de transit lointain). `> 0`, `<= 1`.

## 13. `secondaryLoopScale`

Ratio de réduction pour l'activité de boucles secondaires (comportements ambiants non identitaires). `> 0`, `<= 1`.

Aucun de ces sept ratios canoniques n'est jamais `0` : `LOW` dégrade, mais n'annule pas structurellement une catégorie entière — le futur consommateur local décidera si un élément concret est réellement secondaire ou indispensable ; `SYS-40` ne prend pas cette décision à sa place.

## 14. Helpers count/dimension

```ts
scaleDrift3DQualityCount(baseCount, scale, minimumCount?): number
scaleDrift3DQualityDimension(baseDimension, scale, minimumDimension?): number
```

Fonctions pures, `Math.floor`, jamais `NaN`/`Infinity`, ne mutent rien : `baseCount`/`baseDimension` non fini ou `<= 0` → `0` ; `scale` non fini → `0` (comportement défensif documenté) ; résultat toujours dans `[minimum, base]`. Exemple : `130 * 0.40` avec minimum `1` → `52`. Exemple : `512 @ LOW reflectionResolutionScale 0.50` → `256`, `512 @ MEDIUM 0.75` → `384`, `512 @ HIGH 1` → `512`. Destinés uniquement à des collections/dimensions déjà classées comme réductibles — jamais à `signatureObjects`, `primaryCue`, `worldTopology`, `coreNavigation`. Le Reflector, les textures dynamiques et les sondes de rendu réels ne sont pas modifiés par ce lot ; ces helpers ne valident qu'un calcul de budget futur.

## 15. Absence d'auto-sélection

Aucune fonction `detectQualityFromDevice()`, `detectQualityFromFPS()`, `autoDowngrade()`, `autoUpgrade()`. Le service répond uniquement à « caller chooses tier → service returns capability profile ». La politique de sélection future devra être prouvée séparément.

## 16. Absence de détection device

`src/lib/drift3dQuality.ts` ne lit aucun `navigator.userAgent`, `navigator.deviceMemory`, `navigator.hardwareConcurrency`, `devicePixelRatio`, `matchMedia`, FPS runtime, ou chaîne de renderer WebGL — vérifié structurellement (`docs/evidence/DRIFT-IV-SYS-40/quality-tier-evidence.md`).

## 17. Mobile ≠ LOW, reduced motion ≠ LOW, no-WebGL ≠ LOW

Un appareil mobile n'est jamais automatiquement assimilé au tier `LOW`. Reduced motion n'est jamais assimilé au tier `LOW`. No-WebGL n'est jamais assimilé au tier `LOW`. `SYS-50` reste propriétaire du reduced-motion contract ; `SYS-60` reste propriétaire du no-WebGL narrative path. **Reduced motion and no-WebGL are separate fallback contracts. They are not quality tiers.**

## 18. Aucune application visuelle réelle dans `SYS-40`

Aucune scène (`Drift3DScene`, `Drift3DScatterField`, `Drift3DEffects`, `Drift3DLandmark`, `Drift3DZone`, `Drift3DProp`, `Drift3DVehicle`) ni `drift3dTextureFactory.ts` n'est modifiée par ce lot. Aucune prop `qualityTier`/`qualityProfile`/`populationScale`/`scatterScale` n'est encore propagée dans le monde réel. La baseline visuelle actuelle reste strictement inchangée.

## 19. Responsabilité future des vertical slices

Le choix de ce qui est réellement secondaire ou identitaire dans une scène concrète reste local aux futurs Builds/vertical slices jusqu'à preuve — `SYS-40` prouve le service générique maintenant, sans décider à la place d'un futur consommateur local quel élément concret de sa propre scène est expendable.

## 20. Harness de développement — read-only

En développement seulement, `Drift3DCanvas.tsx` installe :

```text
window.__drift3dQuality
```

Disponible dès le montage de `Drift3DCanvas` — comme les probes Cue Resolver (`SYS-20`) et Signature Arbitration (`SYS-30`), il vit hors de l'arbre react-three-fiber. API :

```ts
{
  tiers,
  getProfile(tier),
  validate(profile),
  validateCanonical(),
  validateSet(profiles),
  scaleCount(baseCount, tier, capability, minimumCount?),
  scaleDimension(baseDimension, tier, capability, minimumDimension?),
}
```

`validateSet(profiles)` exposes the same underlying pure set-validator as `validateCanonical()`, but accepts any caller-supplied profile array — this is how a synthetic, deliberately non-monotone fixture can be checked without ever touching the real canonical profiles (see evidence Test G).

`Object.freeze`d, aucune méthode de mutation, aucun état courant, aucun changement de tier runtime, aucune commande de scène, aucune commande audio, aucune commande de lifecycle. Le probe permet de **CALCULER** un profil ; il ne permet jamais d'**APPLIQUER** un tier au monde — pas de `setTier()`, `applyTier()`, `forceLow()`, `forceHigh()`.

## 21. Cleanup du probe

Aucun registre partagé nouveau. `Drift3DCanvas.tsx` utilise la même protection d'identité locale déjà retenue pour les probes `SYS-20`/`SYS-30` : l'objet `probe` créé à ce montage est comparé par référence (`===`) à `window.__drift3dQuality` avant suppression au démontage. Aucun `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` pour ce probe.

## 22. Limites de `DRIFT-IV-SYS-40`

- Aucune auto-détection GPU, aucun benchmark automatique, aucun downgrade FPS automatique, aucun algorithme adaptatif, aucune hystérésis, aucun changement de tier pendant une session.
- Aucune préférence utilisateur, aucun nouveau menu.
- Aucune modification visuelle du monde actuel, aucune modification de `ScatterField`, des foules/pluie/particules actuelles, du `Reflector` actuel, du `TextureFactory`, ou d'une scène artistique.
- Aucune reduced-motion policy, aucune no-WebGL policy (`SYS-50`/`SYS-60`).
- Les candidats de preuve (`docs/evidence/DRIFT-IV-SYS-40/quality-tier-evidence.md`) sont entièrement synthétiques (`probe-*`, bases numériques génériques) et n'ont aucune signification artistique.

## 23. Responsabilités de `DRIFT-IV-SYS-50`+

- **`SYS-50` (reduced-motion contract)** : non abordé par ce lot — reste propriétaire du contrat reduced-motion.
- **`SYS-60` (no-WebGL narrative path)** : non abordé par ce lot.
- **Premier Build track consommant un Quality Tier** : décidera lui-même, localement, quels éléments concrets de sa propre scène sont réductibles (via `scaleDrift3DQualityCount`/`scaleDrift3DQualityDimension`) et lesquels restent hors budget — sans que ce module n'ait besoin d'être modifié.
