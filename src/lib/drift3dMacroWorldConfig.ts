/**
 * DRIFT-IV-PRE-40 — canonical macro-world configuration.
 *
 * Pure, framework-agnostic data + validators for the five-macro-world
 * greybox. No Three.js import, no DOM access. Local origins deliberately
 * reuse the exact coordinates the existing production heightfield
 * (`drift3dTerrain.ts`) and color script (`drift3dAtmosphere.ts`) already
 * carry for each era — `drift3dEras[].center` (`drift3dTopology.ts`) for the
 * four post-Entry worlds, `drift3dThresholdNode.position` for Entry — rather
 * than inventing a second, disconnected coordinate space. This gives real
 * scale/composition/elevation/light for free from already-authored, already
 * proven systems (see `docs/evidence/DRIFT-IV-PRE-40/` for the full
 * rationale) and keeps "local macro-world origin, configuration-driven
 * placement" honest: every raw coordinate in this file is declared exactly
 * once, here — no greybox component hardcodes a raw world coordinate of its
 * own.
 *
 * Density targets, transition content and guardrails below are transcribed
 * from the canonical documents (Era Contracts, Masterframe Briefs,
 * `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §4/§12) — nothing here is invented.
 */

export type Drift3DMacroWorldId =
  | "entry"
  | "birth-yard"
  | "older-shadows"
  | "vegetative-field"
  | "new-signal";

export const DRIFT_3D_MACRO_WORLD_IDS: readonly Drift3DMacroWorldId[] =
  Object.freeze([
    "entry",
    "birth-yard",
    "older-shadows",
    "vegetative-field",
    "new-signal",
  ]);

export function isDrift3DMacroWorldId(
  value: unknown
): value is Drift3DMacroWorldId {
  return (
    typeof value === "string" &&
    (DRIFT_3D_MACRO_WORLD_IDS as readonly string[]).includes(value)
  );
}

export type Drift3DDensityLevel =
  | "SPARSE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VERY_HIGH"
  | "VARIABLE";

/** `DRIFT_3D_GLOBAL_ART_DIRECTION.md` §4's own four density axes, verbatim per era. */
export type Drift3DDensityTargets = Readonly<{
  foreground: Drift3DDensityLevel;
  background: Drift3DDensityLevel;
  human: Drift3DDensityLevel;
  behavioralLoops: Drift3DDensityLevel;
}>;

export type Drift3DLocalOrigin = Readonly<{ x: number; z: number }>;

export type Drift3DMacroWorldConfig = Readonly<{
  id: Drift3DMacroWorldId;
  order: number;
  label: string;
  /** Reused from drift3dTopology.ts — see module header. */
  localOrigin: Drift3DLocalOrigin;
  /** Approximate radius of this macro-world's own greybox dressing, meters. */
  dressingRadius: number;
  densityTargets: Drift3DDensityTargets;
  /** Verbatim topology/spatial hints from the canonical documents. */
  spatialHints: readonly string[];
  /** QA/reset spawn point for this macro-world, local to its own origin. */
  spawnOffset: Readonly<{ x: number; z: number }>;
  realismRatio: string;
  /**
   * Only `true` for `new-signal` — the Era Contract's own binding guardrail
   * ("One real geography must dominate every New Signal frame") represented
   * as a checkable configuration fact, not just descriptive prose in
   * `spatialHints`.
   */
  dominantGeographyGuardrail: boolean;
}>;

const DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL: Record<
  Drift3DMacroWorldId,
  Drift3DMacroWorldConfig
> = {
  entry: Object.freeze({
    id: "entry",
    order: 1,
    label: "Entry",
    // drift3dThresholdNode.position (drift3dTopology.ts)
    localOrigin: Object.freeze({ x: -88, z: 12 }),
    dressingRadius: 14,
    densityTargets: Object.freeze({
      foreground: "SPARSE",
      background: "SPARSE",
      human: "SPARSE",
      behavioralLoops: "SPARSE",
    }),
    spatialHints: Object.freeze([
      "single unbranching mineral corridor",
      "no side passages, no ambiguity about which way is forward",
      "near-total darkness, only the far λ-shaped exit is lit",
    ]),
    spawnOffset: Object.freeze({ x: -8.1, z: -5.8 }),
    realismRatio: "90% reality / 10% impossible (Global Art Direction §2)",
    dominantGeographyGuardrail: false,
  }),
  "birth-yard": Object.freeze({
    id: "birth-yard",
    order: 2,
    label: "Birth Yard",
    // drift3dEras[0].center (drift3dTopology.ts)
    localOrigin: Object.freeze({ x: -74, z: 22 }),
    dressingRadius: 36,
    densityTargets: Object.freeze({
      foreground: "HIGH",
      background: "VERY_HIGH",
      human: "VERY_HIGH",
      behavioralLoops: "MEDIUM",
    }),
    spatialHints: Object.freeze([
      "dense urban compression",
      "canal at water level, polder-flat, port city rising on one side",
      "dense vertical commercial towers receding into blue dusk haze",
      "a lifting bridge open mid-cycle holding a small visible queue",
    ]),
    spawnOffset: Object.freeze({ x: 0, z: 0 }),
    realismRatio: "70% reality / 20% distortion / 10% impossible (reference ratio)",
    dominantGeographyGuardrail: false,
  }),
  "older-shadows": Object.freeze({
    id: "older-shadows",
    order: 3,
    label: "Older Shadows",
    // drift3dEras[1].center (drift3dTopology.ts)
    localOrigin: Object.freeze({ x: -32, z: -52 }),
    dressingRadius: 40,
    densityTargets: Object.freeze({
      foreground: "MEDIUM",
      background: "HIGH",
      human: "LOW",
      behavioralLoops: "LOW",
    }),
    spatialHints: Object.freeze([
      "open travel ridge, altitude and risk",
      "open plateau traverse between forest line and exposed ridge",
      "one distant small refuge structure — the mountain itself is the architecture",
      "scenic gaps with room to breathe",
    ]),
    spawnOffset: Object.freeze({ x: 0, z: 0 }),
    realismRatio: "75% reality / 15% distortion / 10% impossible",
    dominantGeographyGuardrail: false,
  }),
  "vegetative-field": Object.freeze({
    id: "vegetative-field",
    order: 4,
    label: "Vegetative Field",
    // drift3dEras[2].center (drift3dTopology.ts)
    localOrigin: Object.freeze({ x: 0, z: 8 }),
    dressingRadius: 42,
    densityTargets: Object.freeze({
      foreground: "MEDIUM",
      background: "MEDIUM",
      human: "LOW",
      behavioralLoops: "HIGH",
    }),
    spatialHints: Object.freeze([
      "flat horizontal spread, low repeated modules",
      "repetitive suburban housing grid, identical-lotissement logic",
      "long calm distances",
      "flat, slightly overcast midday light — deliberately unremarkable",
    ]),
    spawnOffset: Object.freeze({ x: 0, z: 0 }),
    realismRatio: "85% baseline reality (up to 55% after contamination, not modeled in this greybox)",
    dominantGeographyGuardrail: false,
  }),
  "new-signal": Object.freeze({
    id: "new-signal",
    order: 5,
    label: "New Signal",
    // drift3dEras[3].center (drift3dTopology.ts)
    localOrigin: Object.freeze({ x: 66, z: -12 }),
    dressingRadius: 56,
    densityTargets: Object.freeze({
      foreground: "VARIABLE",
      background: "VARIABLE",
      human: "SPARSE",
      behavioralLoops: "LOW",
    }),
    spatialHints: Object.freeze([
      "archipelago spacing, night contrast and voids",
      "ONE DOMINANT REAL GEOGRAPHY — coastal overlook, road curving along a headland",
      "other worlds appear only as reflection/light/signal/silhouette/weather/trace/memory",
      "the final beach (Étééaooété's own) is visible far below and ahead, small, not yet reached",
    ]),
    spawnOffset: Object.freeze({ x: 10, z: -6 }),
    realismRatio: "45-65% reality / 25-40% distortion / 10-20% impossible (varies by sub-arc)",
    dominantGeographyGuardrail: true,
  }),
};

export const DRIFT_3D_MACRO_WORLDS: readonly Drift3DMacroWorldConfig[] =
  Object.freeze(
    DRIFT_3D_MACRO_WORLD_IDS.map((id) => DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL[id])
  );

export function getDrift3DMacroWorldConfig(
  id: Drift3DMacroWorldId
): Drift3DMacroWorldConfig {
  return DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL[id];
}

/** Canonical route order — the required normal traversal, once. */
export const DRIFT_3D_MACRO_WORLD_ROUTE_ORDER: readonly Drift3DMacroWorldId[] =
  DRIFT_3D_MACRO_WORLD_IDS;

// ---------------------------------------------------------------------------
// Transitions — exactly four, each a real spatial passage, never a menu cut.
// Content transcribed from each outgoing era's own Era Contract §13.
// ---------------------------------------------------------------------------

export type Drift3DMacroWorldTransitionId =
  | "entry-to-birth-yard"
  | "birth-yard-to-older-shadows"
  | "older-shadows-to-vegetative-field"
  | "vegetative-field-to-new-signal";

export type Drift3DMacroWorldTransition = Readonly<{
  id: Drift3DMacroWorldTransitionId;
  fromWorld: Drift3DMacroWorldId;
  toWorld: Drift3DMacroWorldId;
  approxTravelLengthMeters: number;
  densityChange: string;
  atmosphereProgression: string;
  materialProgression: string;
  visibilityStrategy: string;
  loadingStrategy: string;
  fallbackBehavior: string;
  knownLimitations: string;
}>;

function distanceBetween(a: Drift3DLocalOrigin, b: Drift3DLocalOrigin) {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

const ENTRY_ORIGIN = DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL.entry.localOrigin;
const BIRTH_YARD_ORIGIN =
  DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL["birth-yard"].localOrigin;
const OLDER_SHADOWS_ORIGIN =
  DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL["older-shadows"].localOrigin;
const VEGETATIVE_FIELD_ORIGIN =
  DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL["vegetative-field"].localOrigin;
const NEW_SIGNAL_ORIGIN =
  DRIFT_3D_MACRO_WORLDS_BY_ID_INTERNAL["new-signal"].localOrigin;

export const DRIFT_3D_MACRO_WORLD_TRANSITIONS: readonly Drift3DMacroWorldTransition[] =
  Object.freeze([
    Object.freeze({
      id: "entry-to-birth-yard",
      fromWorld: "entry",
      toWorld: "birth-yard",
      approxTravelLengthMeters: distanceBetween(ENTRY_ORIGIN, BIRTH_YARD_ORIGIN),
      densityChange:
        "SPARSE -> VERY_HIGH, growing continuously along the exit corridor — no hard cut (Era Contract Entry §13).",
      atmosphereProgression:
        "the only transition using the explicit 2-3s eye-adaptation 'burn' — near-black cave to milky urban daylight (Realism Bible; Global Art Direction §12 principle 1).",
      materialProgression: "wet basaltic rock -> concrete/brick urban infrastructure.",
      visibilityStrategy:
        "single unbranching corridor keeps the exit always in view once past the spawn point; no occlusion puzzle.",
      loadingStrategy:
        "both worlds' greybox dressing mounted simultaneously (one continuous scene, per this lot's own brief) — no streaming/pop-in to hide.",
      fallbackBehavior:
        "reduced motion: no forced camera travel through the corridor, the eye-adaptation exposure ramp is skipped in favor of a direct cut between the two atmosphere states.",
      knownLimitations:
        "the real bureaucracy-register handoff ('it authorizes' -> 'it organizes') is a track-dramaturgy concern, deliberately not implemented here.",
    }),
    Object.freeze({
      id: "birth-yard-to-older-shadows",
      fromWorld: "birth-yard",
      toWorld: "older-shadows",
      approxTravelLengthMeters: distanceBetween(
        BIRTH_YARD_ORIGIN,
        OLDER_SHADOWS_ORIGIN
      ),
      densityChange:
        "VERY_HIGH -> MEDIUM open (Era Contract Birth Yard §13); towers become cliffs, canals become rivers/valley lines.",
      atmosphereProgression:
        "gradual register change, not a light-level jump (Global Art Direction §12 principle 1) — milky urban dusk fades into clear high-altitude light via the existing continuous atmosphere blend.",
      materialProgression: "concrete/brick -> granite, glacier blue, snow white.",
      visibilityStrategy:
        "long real-terrain travel (~85m) already carries the production heightfield's own ridge/peak massing — the mountain silhouette is visible well before arrival.",
      loadingStrategy: "one continuous scene, no streaming boundary.",
      fallbackBehavior:
        "reduced motion: no camera-shake on the terrain grade change; background traffic/crowd (Birth Yard side) freeze before the transition band.",
      knownLimitations:
        "bureaucracy register handoff ('it organizes' -> 'it marks/flags') deliberately not implemented — track dramaturgy.",
    }),
    Object.freeze({
      id: "older-shadows-to-vegetative-field",
      fromWorld: "older-shadows",
      toWorld: "vegetative-field",
      approxTravelLengthMeters: distanceBetween(
        OLDER_SHADOWS_ORIGIN,
        VEGETATIVE_FIELD_ORIGIN
      ),
      densityChange:
        "MEDIUM open -> MEDIUM repetitive/ordered (Era Contract Older Shadows §13); station becomes residence, refuge becomes lotissement.",
      atmosphereProgression:
        "clear contrasty altitude light gives way to flat, overcast, shadow-less midday light — a genuine register change per the existing atmosphere blend.",
      materialProgression: "granite/ochre -> desaturated green-yellow, beige, off-white.",
      visibilityStrategy:
        "descending terrain grade opens the flat suburban grid gradually into view.",
      loadingStrategy: "one continuous scene, no streaming boundary.",
      fallbackBehavior:
        "reduced motion: no forced descent camera movement; repeated-house instancing is unaffected (already static geometry).",
      knownLimitations:
        "Global Art Direction §12 itself flags this transition's specific content as the least-specified of the four beyond each era's own mood description — this greybox implements the Era Contract's own §13 content (station->residence) and goes no further; bureaucracy register handoff ('it marks/flags' -> 'it anesthetizes') deliberately not implemented.",
    }),
    Object.freeze({
      id: "vegetative-field-to-new-signal",
      fromWorld: "vegetative-field",
      toWorld: "new-signal",
      approxTravelLengthMeters: distanceBetween(
        VEGETATIVE_FIELD_ORIGIN,
        NEW_SIGNAL_ORIGIN
      ),
      densityChange:
        "MEDIUM repetitive -> VARIABLE, with a sharp, perceptible break rather than a fade (Era Contract Vegetative Field §13: 'une rupture nette mais brève') — the one transition explicitly NOT a slow fade.",
      atmosphereProgression:
        "flat overcast daylight gives way to New Signal's silver night state (existing drift3dAtmosphere.ts newSignalState) — lawns become clearing then forest edge, the official road gives way to a less certain path.",
      materialProgression: "desaturated suburban palette -> cold silver/moonlit tones.",
      visibilityStrategy:
        "the sharp density break is expressed as a real geometric threshold (forest-edge greybox dressing) rather than a lighting trick alone.",
      loadingStrategy: "one continuous scene, no streaming boundary.",
      fallbackBehavior:
        "reduced motion: the density-break moment does not use any camera shake or forced travel; New Signal's water/weather motion (if visible from this transition) is frozen per the Water/Weather/Light pilot's own reduced-motion behavior.",
      knownLimitations:
        "this is the one transition Vegetative Field's own Era Contract §13 marks as a 'genuinely open' content gap beyond mood description — this greybox implements only the documented mood/density/atmosphere progression, not a novel dramaturgical break mechanic.",
    }),
  ]);

export function getDrift3DMacroWorldTransition(
  id: Drift3DMacroWorldTransitionId
): Drift3DMacroWorldTransition {
  const transition = DRIFT_3D_MACRO_WORLD_TRANSITIONS.find(
    (candidate) => candidate.id === id
  );

  if (!transition) {
    throw new Error(`Unknown macro-world transition id "${id}".`);
  }

  return transition;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type Drift3DMacroWorldConfigCandidate = Readonly<{
  id: string;
  order: number;
  localOrigin: Readonly<{ x: number; z: number }>;
  dominantGeographyGuardrail: boolean;
}>;

export type Drift3DMacroWorldConfigIssueType =
  | "invalid-id"
  | "duplicate-id"
  | "duplicate-order"
  | "order-not-sequential"
  | "duplicate-origin"
  | "world-missing"
  | "dominant-geography-guardrail-misplaced";

export type Drift3DMacroWorldConfigIssue = Readonly<{
  type: Drift3DMacroWorldConfigIssueType;
  id: string;
  message: string;
}>;

/**
 * Validates a set of macro-world config candidates: invalid/unknown id,
 * duplicate id, duplicate or non-sequential order (must be exactly 1..5,
 * once each, matching DRIFT_3D_MACRO_WORLD_ROUTE_ORDER), two worlds sharing
 * the same local origin (would collapse two "distinct" macro-worlds into
 * one physical location), any of the five canonical ids missing, and the
 * "one dominant real geography" guardrail set on any world other than
 * `new-signal` (or missing from `new-signal` itself).
 */
export function getDrift3DMacroWorldConfigIssues(
  worlds: readonly Drift3DMacroWorldConfigCandidate[]
): readonly Drift3DMacroWorldConfigIssue[] {
  const issues: Drift3DMacroWorldConfigIssue[] = [];
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();
  const seenOrigins = new Set<string>();

  for (const world of worlds) {
    if (!isDrift3DMacroWorldId(world.id)) {
      issues.push({
        type: "invalid-id",
        id: world.id,
        message: `Macro-world id "${world.id}" is not one of the five canonical ids.`,
      });
    } else if (seenIds.has(world.id)) {
      issues.push({
        type: "duplicate-id",
        id: world.id,
        message: `Macro-world id "${world.id}" is duplicated.`,
      });
    } else {
      seenIds.add(world.id);
    }

    if (seenOrders.has(world.order)) {
      issues.push({
        type: "duplicate-order",
        id: world.id,
        message: `Macro-world order ${world.order} is duplicated.`,
      });
    } else {
      seenOrders.add(world.order);
    }

    const originKey = `${world.localOrigin.x},${world.localOrigin.z}`;

    if (seenOrigins.has(originKey)) {
      issues.push({
        type: "duplicate-origin",
        id: world.id,
        message: `Macro-world "${world.id}" shares its local origin (${originKey}) with another world.`,
      });
    } else {
      seenOrigins.add(originKey);
    }
  }

  const sortedOrders = worlds.map((world) => world.order).sort((a, b) => a - b);

  for (let index = 0; index < sortedOrders.length; index += 1) {
    if (sortedOrders[index] !== index + 1) {
      issues.push({
        type: "order-not-sequential",
        id: "route-order",
        message: `Macro-world orders must be exactly 1..${worlds.length} — got [${sortedOrders.join(", ")}].`,
      });
      break;
    }
  }

  for (const id of DRIFT_3D_MACRO_WORLD_IDS) {
    if (!seenIds.has(id)) {
      issues.push({
        type: "world-missing",
        id,
        message: `Required macro-world "${id}" is missing.`,
      });
    }
  }

  for (const world of worlds) {
    const shouldHaveGuardrail = world.id === "new-signal";

    if (world.dominantGeographyGuardrail !== shouldHaveGuardrail) {
      issues.push({
        type: "dominant-geography-guardrail-misplaced",
        id: world.id,
        message: `dominantGeographyGuardrail for "${world.id}" must be ${shouldHaveGuardrail} (got ${world.dominantGeographyGuardrail}).`,
      });
    }
  }

  return issues;
}

export function getDrift3DCanonicalMacroWorldConfigIssues(): readonly Drift3DMacroWorldConfigIssue[] {
  return getDrift3DMacroWorldConfigIssues(DRIFT_3D_MACRO_WORLDS);
}

export type Drift3DMacroWorldTransitionIssueType =
  | "invalid-from-world"
  | "invalid-to-world"
  | "from-equals-to"
  | "not-adjacent-in-route-order"
  | "duplicate-transition"
  | "transition-missing"
  | "disconnected-graph"
  | "wrong-transition-count";

export type Drift3DMacroWorldTransitionIssue = Readonly<{
  type: Drift3DMacroWorldTransitionIssueType;
  id: string;
  message: string;
}>;

/**
 * Validates the transition set: exactly four transitions; each fromWorld/
 * toWorld must be a valid, distinct macro-world id; each transition must
 * connect two macro-worlds that are adjacent in the canonical route order
 * (never a skip, never backwards); no duplicate from/to pair; every
 * consecutive pair in the route order must have exactly one transition
 * (the full graph is connected end-to-end, matching "one continuous
 * driveable route").
 */
export function getDrift3DMacroWorldTransitionIssues(
  transitions: readonly {
    id: string;
    fromWorld: string;
    toWorld: string;
  }[]
): readonly Drift3DMacroWorldTransitionIssue[] {
  const issues: Drift3DMacroWorldTransitionIssue[] = [];

  if (transitions.length !== 4) {
    issues.push({
      type: "wrong-transition-count",
      id: "all",
      message: `Expected exactly 4 transitions, got ${transitions.length}.`,
    });
  }

  const seenPairs = new Set<string>();
  const orderIndex = new Map<string, number>(
    DRIFT_3D_MACRO_WORLD_ROUTE_ORDER.map((id, index) => [id, index])
  );

  for (const transition of transitions) {
    const fromValid = isDrift3DMacroWorldId(transition.fromWorld);
    const toValid = isDrift3DMacroWorldId(transition.toWorld);

    if (!fromValid) {
      issues.push({
        type: "invalid-from-world",
        id: transition.id,
        message: `Transition "${transition.id}" has an invalid fromWorld "${transition.fromWorld}".`,
      });
    }

    if (!toValid) {
      issues.push({
        type: "invalid-to-world",
        id: transition.id,
        message: `Transition "${transition.id}" has an invalid toWorld "${transition.toWorld}".`,
      });
    }

    if (fromValid && toValid) {
      if (transition.fromWorld === transition.toWorld) {
        issues.push({
          type: "from-equals-to",
          id: transition.id,
          message: `Transition "${transition.id}" has identical fromWorld/toWorld.`,
        });
      } else {
        const fromIndex = orderIndex.get(transition.fromWorld) ?? -1;
        const toIndex = orderIndex.get(transition.toWorld) ?? -1;

        if (toIndex !== fromIndex + 1) {
          issues.push({
            type: "not-adjacent-in-route-order",
            id: transition.id,
            message: `Transition "${transition.id}" (${transition.fromWorld} -> ${transition.toWorld}) is not a forward step of exactly one position in the canonical route order.`,
          });
        }
      }

      const pairKey = `${transition.fromWorld}->${transition.toWorld}`;

      if (seenPairs.has(pairKey)) {
        issues.push({
          type: "duplicate-transition",
          id: transition.id,
          message: `Transition pair "${pairKey}" is duplicated.`,
        });
      } else {
        seenPairs.add(pairKey);
      }
    }
  }

  for (let index = 0; index < DRIFT_3D_MACRO_WORLD_ROUTE_ORDER.length - 1; index += 1) {
    const from = DRIFT_3D_MACRO_WORLD_ROUTE_ORDER[index];
    const to = DRIFT_3D_MACRO_WORLD_ROUTE_ORDER[index + 1];
    const pairKey = `${from}->${to}`;

    if (!seenPairs.has(pairKey)) {
      issues.push({
        type: "transition-missing",
        id: pairKey,
        message: `Required transition "${pairKey}" (consecutive in route order) is missing — the route graph is disconnected.`,
      });
    }
  }

  return issues;
}

export function getDrift3DCanonicalMacroWorldTransitionIssues(): readonly Drift3DMacroWorldTransitionIssue[] {
  return getDrift3DMacroWorldTransitionIssues(DRIFT_3D_MACRO_WORLD_TRANSITIONS);
}

// ---------------------------------------------------------------------------
// No-WebGL fallback metadata — one truthful card per macro-world, no promise
// of driving (see DriftMacroWorldGreybox.tsx's own no-WebGL branch).
// ---------------------------------------------------------------------------

export type Drift3DMacroWorldFallbackCard = Readonly<{
  worldId: Drift3DMacroWorldId;
  title: string;
  whatItProves: string;
}>;

const DRIFT_3D_MACRO_WORLD_FALLBACK_CARDS: readonly Drift3DMacroWorldFallbackCard[] =
  Object.freeze([
    Object.freeze({
      worldId: "entry",
      title: "Entry",
      whatItProves:
        "A single unbranching mineral corridor, near-total darkness, one λ-shaped exit glow.",
    }),
    Object.freeze({
      worldId: "birth-yard",
      title: "Birth Yard",
      whatItProves:
        "Dense canal-side port city — towers, a lifting bridge, distant crowd and traffic.",
    }),
    Object.freeze({
      worldId: "older-shadows",
      title: "Older Shadows",
      whatItProves:
        "An open mountain traverse with a mixed-generation cairn trail and cold-altitude material.",
    }),
    Object.freeze({
      worldId: "vegetative-field",
      title: "Vegetative Field",
      whatItProves:
        "A repetitive suburban housing grid with one resident's almost-exact daily routine.",
    }),
    Object.freeze({
      worldId: "new-signal",
      title: "New Signal",
      whatItProves:
        "One dominant coastal overlook geography, with the final beach visible far below, not yet reached.",
    }),
  ]);

export function getDrift3DMacroWorldFallbackCards(): readonly Drift3DMacroWorldFallbackCard[] {
  return DRIFT_3D_MACRO_WORLD_FALLBACK_CARDS;
}

export type Drift3DMacroWorldFallbackCardCandidate = Readonly<{
  worldId: string;
  title: string;
  whatItProves: string;
}>;

export type Drift3DMacroWorldFallbackIssueType =
  | "invalid-world-id"
  | "duplicate-world-id"
  | "card-missing"
  | "empty-title"
  | "empty-what-it-proves";

export type Drift3DMacroWorldFallbackIssue = Readonly<{
  type: Drift3DMacroWorldFallbackIssueType;
  worldId: string;
  message: string;
}>;

export function getDrift3DMacroWorldFallbackIssues(
  cards: readonly Drift3DMacroWorldFallbackCardCandidate[]
): readonly Drift3DMacroWorldFallbackIssue[] {
  const issues: Drift3DMacroWorldFallbackIssue[] = [];
  const seenIds = new Set<string>();

  for (const card of cards) {
    if (!isDrift3DMacroWorldId(card.worldId)) {
      issues.push({
        type: "invalid-world-id",
        worldId: card.worldId,
        message: `Fallback card world id "${card.worldId}" is not a canonical macro-world id.`,
      });
    } else if (seenIds.has(card.worldId)) {
      issues.push({
        type: "duplicate-world-id",
        worldId: card.worldId,
        message: `Fallback card world id "${card.worldId}" is duplicated.`,
      });
    } else {
      seenIds.add(card.worldId);
    }

    if (!card.title.trim()) {
      issues.push({
        type: "empty-title",
        worldId: card.worldId,
        message: `Fallback card "${card.worldId}" has an empty title.`,
      });
    }

    if (!card.whatItProves.trim()) {
      issues.push({
        type: "empty-what-it-proves",
        worldId: card.worldId,
        message: `Fallback card "${card.worldId}" has an empty whatItProves.`,
      });
    }
  }

  for (const id of DRIFT_3D_MACRO_WORLD_IDS) {
    if (!seenIds.has(id)) {
      issues.push({
        type: "card-missing",
        worldId: id,
        message: `No fallback card found for macro-world "${id}".`,
      });
    }
  }

  return issues;
}

export function getDrift3DCanonicalMacroWorldFallbackIssues(): readonly Drift3DMacroWorldFallbackIssue[] {
  return getDrift3DMacroWorldFallbackIssues(DRIFT_3D_MACRO_WORLD_FALLBACK_CARDS);
}
