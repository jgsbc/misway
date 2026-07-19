/**
 * Generic identity-preserving quality tiers (DRIFT-IV-SYS-40).
 *
 * Framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic,
 * cue-agnostic and scene-agnostic: it only knows three canonical capacity
 * budgets and a set of pure helpers to read and apply them. A quality tier
 * pilots CAPACITIES (how much of something renders), never STYLES (palette,
 * color script, fog, narrative light, a signature's identity, a Cue Map, or
 * dramaturgical pacing) — those never appear here, functionally or as a
 * dependency. `low`/`medium`/`high` name a rendering capacity budget only;
 * they never mean "bad/mobile/accessible" vs. "normal" vs. "full identity".
 * Identity is complete in all three tiers — see `identity` on each profile.
 *
 * This module never selects a tier on its own: no device/browser sniffing,
 * no FPS measurement, no auto-downgrade. Callers choose a tier; this module
 * only answers with the matching capability profile.
 */

export type Drift3DQualityTier = "low" | "medium" | "high";

export type Drift3DQualityCapabilities = Readonly<{
  populationScale: number;
  scatterScale: number;
  dynamicTextureResolutionScale: number;
  renderProbeScale: number;
  reflectionResolutionScale: number;
  backgroundDetailScale: number;
  secondaryLoopScale: number;
}>;

/**
 * Every property is the literal type `true`, never `boolean`: a canonical
 * profile cannot declare `signatureObjects: false` or `primaryCue: false` at
 * the TypeScript level. This module does not know which concrete object is
 * a signature or which cue is primary — it only guarantees these categories
 * stay outside its own degradation budget. That is a narrower and different
 * claim than "no visual difference exists between tiers".
 */
export type Drift3DQualityIdentityGuarantees = Readonly<{
  worldTopology: true;
  coreNavigation: true;
  signatureObjects: true;
  primaryCue: true;
}>;

export type Drift3DQualityProfile = Readonly<{
  tier: Drift3DQualityTier;
  capabilities: Drift3DQualityCapabilities;
  identity: Drift3DQualityIdentityGuarantees;
}>;

/**
 * Widened candidate shapes accepted by the validators below, so that a
 * deliberately broken fixture (used only to prove detection) can be
 * constructed and passed without lying about what a canonical profile is
 * allowed to be. A canonical `Drift3DQualityProfile` is always structurally
 * assignable to these candidate types.
 */
export type Drift3DQualityCapabilitiesCandidate = Readonly<
  Record<keyof Drift3DQualityCapabilities, number>
>;

export type Drift3DQualityIdentityGuaranteesCandidate = Readonly<{
  worldTopology: boolean;
  coreNavigation: boolean;
  signatureObjects: boolean;
  primaryCue: boolean;
}>;

export type Drift3DQualityProfileCandidate = Readonly<{
  tier: string;
  capabilities: Drift3DQualityCapabilitiesCandidate;
  identity: Drift3DQualityIdentityGuaranteesCandidate;
}>;

export type Drift3DQualityProfileIssueType =
  | "invalid-tier"
  | "non-finite-capability"
  | "capability-not-positive"
  | "capability-above-one"
  | "identity-world-topology-not-true"
  | "identity-core-navigation-not-true"
  | "identity-signature-objects-not-true"
  | "identity-primary-cue-not-true";

export type Drift3DQualityProfileIssue = Readonly<{
  type: Drift3DQualityProfileIssueType;
  tier: string;
  capability?: keyof Drift3DQualityCapabilities;
  message: string;
}>;

export type Drift3DQualityCanonicalIssueType =
  | Drift3DQualityProfileIssueType
  | "missing-tier"
  | "duplicate-tier"
  | "monotonicity-violation"
  | "high-capability-not-one";

export type Drift3DQualityCanonicalIssue = Readonly<{
  type: Drift3DQualityCanonicalIssueType;
  tier?: string;
  capability?: keyof Drift3DQualityCapabilities;
  message: string;
}>;

const QUALITY_CAPABILITY_KEYS: readonly (keyof Drift3DQualityCapabilities)[] =
  Object.freeze([
    "populationScale",
    "scatterScale",
    "dynamicTextureResolutionScale",
    "renderProbeScale",
    "reflectionResolutionScale",
    "backgroundDetailScale",
    "secondaryLoopScale",
  ]);

export const DRIFT_3D_QUALITY_TIERS: readonly Drift3DQualityTier[] =
  Object.freeze(["low", "medium", "high"]);

function freezeDrift3DQualityProfile(
  tier: Drift3DQualityTier,
  capabilities: Drift3DQualityCapabilities
): Drift3DQualityProfile {
  return Object.freeze({
    tier,
    capabilities: Object.freeze({ ...capabilities }),
    identity: Object.freeze({
      worldTopology: true,
      coreNavigation: true,
      signatureObjects: true,
      primaryCue: true,
    }),
  });
}

/**
 * Canonical budgets. These ratios are an initial relative-capacity contract,
 * not an artistic policy and not a performance measurement: they do not
 * assert that a future runtime will gain exactly 40%, 50% or 75% of
 * performance. They only describe the capacity budget requested of a future
 * consumer.
 */
const LOW_QUALITY_PROFILE = freezeDrift3DQualityProfile("low", {
  populationScale: 0.4,
  scatterScale: 0.5,
  dynamicTextureResolutionScale: 0.5,
  renderProbeScale: 0.5,
  reflectionResolutionScale: 0.5,
  backgroundDetailScale: 0.5,
  secondaryLoopScale: 0.35,
});

const MEDIUM_QUALITY_PROFILE = freezeDrift3DQualityProfile("medium", {
  populationScale: 0.7,
  scatterScale: 0.75,
  dynamicTextureResolutionScale: 0.75,
  renderProbeScale: 0.75,
  reflectionResolutionScale: 0.75,
  backgroundDetailScale: 0.75,
  secondaryLoopScale: 0.65,
});

const HIGH_QUALITY_PROFILE = freezeDrift3DQualityProfile("high", {
  populationScale: 1,
  scatterScale: 1,
  dynamicTextureResolutionScale: 1,
  renderProbeScale: 1,
  reflectionResolutionScale: 1,
  backgroundDetailScale: 1,
  secondaryLoopScale: 1,
});

const CANONICAL_QUALITY_PROFILES: Readonly<
  Record<Drift3DQualityTier, Drift3DQualityProfile>
> = Object.freeze({
  low: LOW_QUALITY_PROFILE,
  medium: MEDIUM_QUALITY_PROFILE,
  high: HIGH_QUALITY_PROFILE,
});

export function isDrift3DQualityTier(
  value: unknown
): value is Drift3DQualityTier {
  return value === "low" || value === "medium" || value === "high";
}

/**
 * Same tier always returns the same frozen singleton profile — no
 * allocation per call. Takes a typed `Drift3DQualityTier` by design: pair it
 * with `isDrift3DQualityTier` at the boundary (e.g. the dev probe) instead
 * of accepting an arbitrary string here, so an unknown tier never falls
 * through silently.
 */
export function getDrift3DQualityProfile(
  tier: Drift3DQualityTier
): Drift3DQualityProfile {
  return CANONICAL_QUALITY_PROFILES[tier];
}

/**
 * Validates a single profile candidate: invalid tier, non-finite capability,
 * capability <= 0, capability > 1, and each identity guarantee not being
 * exactly `true`. Intended for authoring, tests, development and
 * acceptance — the hot path (`getDrift3DQualityProfile`,
 * `scaleDrift3DQualityCount`, `scaleDrift3DQualityDimension`) assumes
 * already-validated canonical profiles and does not re-validate them.
 */
export function getDrift3DQualityProfileIssues(
  profile: Drift3DQualityProfileCandidate
): readonly Drift3DQualityProfileIssue[] {
  const issues: Drift3DQualityProfileIssue[] = [];
  const tierLabel = profile.tier;

  if (!isDrift3DQualityTier(profile.tier)) {
    issues.push({
      type: "invalid-tier",
      tier: tierLabel,
      message: `Profile has an invalid tier "${tierLabel}".`,
    });
  }

  for (const capability of QUALITY_CAPABILITY_KEYS) {
    const value = profile.capabilities[capability];

    if (!Number.isFinite(value)) {
      issues.push({
        type: "non-finite-capability",
        tier: tierLabel,
        capability,
        message: `Capability "${capability}" on tier "${tierLabel}" is not finite.`,
      });
      continue;
    }

    if (value <= 0) {
      issues.push({
        type: "capability-not-positive",
        tier: tierLabel,
        capability,
        message: `Capability "${capability}" on tier "${tierLabel}" must be > 0 (got ${value}).`,
      });
    }

    if (value > 1) {
      issues.push({
        type: "capability-above-one",
        tier: tierLabel,
        capability,
        message: `Capability "${capability}" on tier "${tierLabel}" must be <= 1 (got ${value}).`,
      });
    }
  }

  if (profile.identity.worldTopology !== true) {
    issues.push({
      type: "identity-world-topology-not-true",
      tier: tierLabel,
      message: `Identity guarantee "worldTopology" on tier "${tierLabel}" is not true.`,
    });
  }

  if (profile.identity.coreNavigation !== true) {
    issues.push({
      type: "identity-core-navigation-not-true",
      tier: tierLabel,
      message: `Identity guarantee "coreNavigation" on tier "${tierLabel}" is not true.`,
    });
  }

  if (profile.identity.signatureObjects !== true) {
    issues.push({
      type: "identity-signature-objects-not-true",
      tier: tierLabel,
      message: `Identity guarantee "signatureObjects" on tier "${tierLabel}" is not true.`,
    });
  }

  if (profile.identity.primaryCue !== true) {
    issues.push({
      type: "identity-primary-cue-not-true",
      tier: tierLabel,
      message: `Identity guarantee "primaryCue" on tier "${tierLabel}" is not true.`,
    });
  }

  return issues;
}

/**
 * Validates a set of profile candidates together: every individual issue
 * from `getDrift3DQualityProfileIssues`, plus a missing or duplicated tier,
 * plus (only when exactly one `low`/`medium`/`high` profile is present)
 * monotonicity `low <= medium <= high` and `high === 1`, for each of the
 * seven capabilities. Accepts an arbitrary candidate array so a synthetic,
 * deliberately non-monotone fixture can be checked without ever touching the
 * real canonical profiles.
 */
export function getDrift3DQualityProfileSetIssues(
  profiles: readonly Drift3DQualityProfileCandidate[]
): readonly Drift3DQualityCanonicalIssue[] {
  const issues: Drift3DQualityCanonicalIssue[] = [];

  for (const profile of profiles) {
    issues.push(...getDrift3DQualityProfileIssues(profile));
  }

  for (const tier of DRIFT_3D_QUALITY_TIERS) {
    const matches = profiles.filter((profile) => profile.tier === tier);

    if (matches.length === 0) {
      issues.push({
        type: "missing-tier",
        tier,
        message: `No profile found for tier "${tier}".`,
      });
    } else if (matches.length > 1) {
      issues.push({
        type: "duplicate-tier",
        tier,
        message: `${matches.length} profiles found for tier "${tier}", expected exactly one.`,
      });
    }
  }

  const low = profiles.find((profile) => profile.tier === "low");
  const medium = profiles.find((profile) => profile.tier === "medium");
  const high = profiles.find((profile) => profile.tier === "high");

  if (low && medium && high) {
    for (const capability of QUALITY_CAPABILITY_KEYS) {
      const lowValue = low.capabilities[capability];
      const mediumValue = medium.capabilities[capability];
      const highValue = high.capabilities[capability];
      const allFinite =
        Number.isFinite(lowValue) &&
        Number.isFinite(mediumValue) &&
        Number.isFinite(highValue);

      if (allFinite && !(lowValue <= mediumValue && mediumValue <= highValue)) {
        issues.push({
          type: "monotonicity-violation",
          capability,
          message: `Capability "${capability}" violates low <= medium <= high (low=${lowValue}, medium=${mediumValue}, high=${highValue}).`,
        });
      }

      if (Number.isFinite(highValue) && highValue !== 1) {
        issues.push({
          type: "high-capability-not-one",
          capability,
          message: `Capability "${capability}" on tier "high" must equal 1 (got ${highValue}).`,
        });
      }
    }
  }

  return issues;
}

/** Validates the three real canonical profiles together (see above). */
export function getDrift3DCanonicalQualityIssues(): readonly Drift3DQualityCanonicalIssue[] {
  return getDrift3DQualityProfileSetIssues([
    CANONICAL_QUALITY_PROFILES.low,
    CANONICAL_QUALITY_PROFILES.medium,
    CANONICAL_QUALITY_PROFILES.high,
  ]);
}

/**
 * Pure integer reduction for a collection already classified as reducible
 * (e.g. a background population, a scatter candidate list) — never intended
 * for `signatureObjects`, `primaryCue`, `worldTopology` or `coreNavigation`,
 * which this module's identity guarantees keep outside any degradation
 * budget in the first place.
 *
 * `baseCount` non-finite or `<= 0` → `0`. `scale` non-finite → `0` (a
 * non-finite budget cannot be trusted to produce a meaningful reduced
 * count). Otherwise: `Math.floor(baseCount * scale)`, clamped to
 * `[minimumCount, baseCount]` — never negative, never exceeding the base,
 * never `NaN`/`Infinity`. Mutates nothing.
 */
export function scaleDrift3DQualityCount(
  baseCount: number,
  scale: number,
  minimumCount = 0
): number {
  if (!Number.isFinite(baseCount) || baseCount <= 0) {
    return 0;
  }

  if (!Number.isFinite(scale)) {
    return 0;
  }

  const flooredBase = Math.floor(baseCount);
  const minimum = Number.isFinite(minimumCount)
    ? Math.max(0, Math.floor(minimumCount))
    : 0;
  const scaled = Math.floor(baseCount * scale);

  return Math.min(Math.max(scaled, minimum), flooredBase);
}

/**
 * Pure integer reduction for a render dimension (a reflection render target
 * side, a dynamic canvas texture side, a render probe resolution). Same
 * defensive rules as `scaleDrift3DQualityCount`, clamped to
 * `[minimumDimension, baseDimension]`. This lot does not wire this helper to
 * any real `Reflector`, canvas texture or render probe — it only proves the
 * calculation.
 */
export function scaleDrift3DQualityDimension(
  baseDimension: number,
  scale: number,
  minimumDimension = 1
): number {
  if (!Number.isFinite(baseDimension) || baseDimension <= 0) {
    return 0;
  }

  if (!Number.isFinite(scale)) {
    return 0;
  }

  const flooredBase = Math.floor(baseDimension);
  const minimum = Number.isFinite(minimumDimension)
    ? Math.max(0, Math.floor(minimumDimension))
    : 0;
  const scaled = Math.floor(baseDimension * scale);

  return Math.min(Math.max(scaled, minimum), flooredBase);
}
