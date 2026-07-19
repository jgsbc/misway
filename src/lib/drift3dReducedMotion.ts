/**
 * Generic reduced-motion accessibility contract (DRIFT-IV-SYS-50).
 *
 * Framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic,
 * cue-agnostic, scene-agnostic and quality-tier-agnostic: it only knows two
 * canonical motion policies and a set of pure helpers to resolve and read
 * them. Reduced motion is an ACCESSIBILITY contract, not a Quality Tier, not
 * the LOW tier, not a performance policy, not an alternate art direction,
 * and not a "poorer" version of the world — see
 * `docs/DRIFT_3D_QUALITY_TIER_CONTRACT.md` for the separate capacity-budget
 * contract this module never imports or references.
 *
 * This module never reads `matchMedia`, `navigator`, `window` or `document`
 * — resolving a system preference into a mode stays the responsibility of
 * the caller (the `Drift3DClient` shell). It never selects a mode on its
 * own and keeps no module-scope mutable state, no history, no previous
 * resolution memory: resolving the same preference always yields the same
 * mode, and reading the same mode always yields the same frozen policy.
 */

export type Drift3DReducedMotionMode = "standard" | "reduced";

export type Drift3DReducedMotionCapabilities = Readonly<{
  allowCameraShake: boolean;
  allowForcedCameraTravel: boolean;
  allowRapidPulsation: boolean;
  allowAggressiveMotion: boolean;
  allowSlowTransitions: boolean;
}>;

/**
 * Every property is the literal type `true`, never `boolean`: a canonical
 * policy cannot declare `poses: false` at the TypeScript level. This module
 * does not create any pose, artistic state, track lighting, track material
 * or real before/after — it only guarantees these categories remain
 * available as meaning-carrying tools for a future track-local
 * materialization instead of relying on rapid or forced motion.
 */
export type Drift3DReducedMotionMeaningGuarantees = Readonly<{
  poses: true;
  states: true;
  lighting: true;
  materials: true;
  beforeAfter: true;
}>;

export type Drift3DReducedMotionPolicy = Readonly<{
  mode: Drift3DReducedMotionMode;
  motion: Drift3DReducedMotionCapabilities;
  meaning: Drift3DReducedMotionMeaningGuarantees;
}>;

/**
 * Widened candidate shape accepted by the validators below, so a
 * deliberately broken fixture (used only to prove detection) can be
 * constructed without lying about what a canonical policy is allowed to
 * be. A canonical `Drift3DReducedMotionPolicy` is always structurally
 * assignable to this candidate type.
 */
export type Drift3DReducedMotionMeaningGuaranteesCandidate = Readonly<{
  poses: boolean;
  states: boolean;
  lighting: boolean;
  materials: boolean;
  beforeAfter: boolean;
}>;

export type Drift3DReducedMotionPolicyCandidate = Readonly<{
  mode: string;
  motion: Drift3DReducedMotionCapabilities;
  meaning: Drift3DReducedMotionMeaningGuaranteesCandidate;
}>;

export type Drift3DReducedMotionPolicyIssueType =
  | "invalid-mode"
  | "motion-capability-mismatch"
  | "meaning-guarantee-not-true";

export type Drift3DReducedMotionPolicyIssue = Readonly<{
  type: Drift3DReducedMotionPolicyIssueType;
  mode: string;
  capability?: keyof Drift3DReducedMotionCapabilities;
  guarantee?: keyof Drift3DReducedMotionMeaningGuarantees;
  message: string;
}>;

const MOTION_CAPABILITY_KEYS: readonly (keyof Drift3DReducedMotionCapabilities)[] =
  Object.freeze([
    "allowCameraShake",
    "allowForcedCameraTravel",
    "allowRapidPulsation",
    "allowAggressiveMotion",
    "allowSlowTransitions",
  ]);

const MEANING_GUARANTEE_KEYS: readonly (keyof Drift3DReducedMotionMeaningGuarantees)[] =
  Object.freeze(["poses", "states", "lighting", "materials", "beforeAfter"]);

export const DRIFT_3D_REDUCED_MOTION_MODES: readonly Drift3DReducedMotionMode[] =
  Object.freeze(["standard", "reduced"]);

function freezeDrift3DReducedMotionPolicy(
  mode: Drift3DReducedMotionMode,
  motion: Drift3DReducedMotionCapabilities
): Drift3DReducedMotionPolicy {
  return Object.freeze({
    mode,
    motion: Object.freeze({ ...motion }),
    meaning: Object.freeze({
      poses: true,
      states: true,
      lighting: true,
      materials: true,
      beforeAfter: true,
    }),
  });
}

/**
 * Canonical policies. No numeric millisecond duration, speed multiplier,
 * frequency threshold or amplitude is invented here — those remain the
 * responsibility of a future consumer that actually needs them, proven on
 * its own.
 */
const STANDARD_POLICY = freezeDrift3DReducedMotionPolicy("standard", {
  allowCameraShake: true,
  allowForcedCameraTravel: true,
  allowRapidPulsation: true,
  allowAggressiveMotion: true,
  allowSlowTransitions: true,
});

const REDUCED_POLICY = freezeDrift3DReducedMotionPolicy("reduced", {
  allowCameraShake: false,
  allowForcedCameraTravel: false,
  allowRapidPulsation: false,
  allowAggressiveMotion: false,
  allowSlowTransitions: true,
});

const CANONICAL_REDUCED_MOTION_POLICIES: Readonly<
  Record<Drift3DReducedMotionMode, Drift3DReducedMotionPolicy>
> = Object.freeze({
  standard: STANDARD_POLICY,
  reduced: REDUCED_POLICY,
});

export function isDrift3DReducedMotionMode(
  value: unknown
): value is Drift3DReducedMotionMode {
  return value === "standard" || value === "reduced";
}

/**
 * Trivial and deterministic: `true` always resolves to `"reduced"`, `false`
 * always resolves to `"standard"`. No third mode. Does not read
 * `matchMedia` — the caller (`Drift3DClient`) is responsible for reading
 * the system preference and passing its boolean result here.
 */
export function resolveDrift3DReducedMotionMode(
  prefersReducedMotion: boolean
): Drift3DReducedMotionMode {
  return prefersReducedMotion ? "reduced" : "standard";
}

/**
 * Same mode always returns the same frozen singleton policy — no
 * allocation per call. Takes a typed `Drift3DReducedMotionMode` by design:
 * pair it with `isDrift3DReducedMotionMode` at the boundary (e.g. the dev
 * probe) instead of accepting an arbitrary string here, so an unknown mode
 * never falls through silently.
 */
export function getDrift3DReducedMotionPolicy(
  mode: Drift3DReducedMotionMode
): Drift3DReducedMotionPolicy {
  return CANONICAL_REDUCED_MOTION_POLICIES[mode];
}

/**
 * Validates a single policy candidate: invalid mode; for a valid mode, any
 * motion capability that does not match that mode's canonical pattern
 * (`reduced` forbids shake/forced travel/rapid pulsation/aggressive motion
 * and requires slow transitions to stay allowed; `standard` requires all
 * five to stay allowed); and any meaning guarantee not being exactly
 * `true`. Intended for authoring, tests, development and acceptance — the
 * hot path (`getDrift3DReducedMotionPolicy`) assumes already-validated
 * canonical policies and does not re-validate them.
 */
export function getDrift3DReducedMotionPolicyIssues(
  policy: Drift3DReducedMotionPolicyCandidate
): readonly Drift3DReducedMotionPolicyIssue[] {
  const issues: Drift3DReducedMotionPolicyIssue[] = [];
  const modeLabel = policy.mode;

  if (!isDrift3DReducedMotionMode(policy.mode)) {
    issues.push({
      type: "invalid-mode",
      mode: modeLabel,
      message: `Policy has an invalid mode "${modeLabel}".`,
    });
  } else {
    const expectedMotion = CANONICAL_REDUCED_MOTION_POLICIES[policy.mode].motion;

    for (const capability of MOTION_CAPABILITY_KEYS) {
      if (policy.motion[capability] !== expectedMotion[capability]) {
        issues.push({
          type: "motion-capability-mismatch",
          mode: modeLabel,
          capability,
          message: `Capability "${capability}" on mode "${modeLabel}" must be ${expectedMotion[capability]} (got ${policy.motion[capability]}).`,
        });
      }
    }
  }

  for (const guarantee of MEANING_GUARANTEE_KEYS) {
    if (policy.meaning[guarantee] !== true) {
      issues.push({
        type: "meaning-guarantee-not-true",
        mode: modeLabel,
        guarantee,
        message: `Meaning guarantee "${guarantee}" on mode "${modeLabel}" is not true.`,
      });
    }
  }

  return issues;
}

/** Validates the two real canonical policies together (see above). */
export function getDrift3DCanonicalReducedMotionIssues(): readonly Drift3DReducedMotionPolicyIssue[] {
  return [
    ...getDrift3DReducedMotionPolicyIssues(CANONICAL_REDUCED_MOTION_POLICIES.standard),
    ...getDrift3DReducedMotionPolicyIssues(CANONICAL_REDUCED_MOTION_POLICIES.reduced),
  ];
}
