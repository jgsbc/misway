/**
 * Generic no-WebGL narrative path contract (DRIFT-IV-SYS-60).
 *
 * Framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic,
 * cue-agnostic, scene-agnostic, reduced-motion-agnostic and
 * quality-tier-agnostic: it only knows one canonical access-path contract
 * and a set of pure helpers to read and validate it. The no-WebGL path is a
 * shared PRODUCT access path — never a Quality Tier, never `LOW`, never the
 * reduced-motion contract, never an alternate 3D renderer, never a second
 * map, never a second player. It never mounts a 3D canvas and never
 * promises 3D interaction; it only points to the two access paths that
 * already exist (`/drift-lab`, the 2D map; `/tracks`, the catalogue and
 * explicit listening path) and preserves the single global audio
 * authority.
 *
 * This module never reads `window`, `document`, `navigator`, any WebGL API,
 * or a timer. It keeps no module-scope mutable state, no history: reading
 * the canonical path always returns the same frozen object, and validating
 * the same candidate always yields the same issues.
 */

export type Drift3DNoWebGLDestinationId = "map" | "tracks";

export type Drift3DNoWebGLDestination = Readonly<{
  id: Drift3DNoWebGLDestinationId;
  href: "/drift-lab" | "/tracks";
  role: "map" | "listening";
}>;

/**
 * Every property is the literal type `true`, never `boolean`: the canonical
 * path cannot declare `mapAccessible: false` at the TypeScript level. These
 * guarantees do not themselves create a map, a catalogue or a player — they
 * only guarantee the no-WebGL path relies on the already-delivered
 * `/drift-lab`, `/tracks` and global `AudioPlayerProvider`.
 */
export type Drift3DNoWebGLGuarantees = Readonly<{
  usefulRoute: true;
  catalogueAccessible: true;
  mapAccessible: true;
  globalAudioPreserved: true;
  staticLightweightRepresentation: true;
  honestInteractionBoundary: true;
}>;

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

/**
 * Widened candidate shapes accepted by the validators below, so a
 * deliberately broken fixture (used only to prove detection) can be
 * constructed without lying about what the canonical path is allowed to
 * be. The canonical `Drift3DNoWebGLNarrativePath` is always structurally
 * assignable to these candidate types.
 */
export type Drift3DNoWebGLDestinationCandidate = Readonly<{
  id: string;
  href: string;
  role: string;
}>;

export type Drift3DNoWebGLGuaranteesCandidate = Readonly<{
  usefulRoute: boolean;
  catalogueAccessible: boolean;
  mapAccessible: boolean;
  globalAudioPreserved: boolean;
  staticLightweightRepresentation: boolean;
  honestInteractionBoundary: boolean;
}>;

export type Drift3DNoWebGLNarrativePathCandidate = Readonly<{
  representation: string;
  requiresWebGL: boolean;
  mounts3DCanvas: boolean;
  audioAuthority: string;
  autoplay: boolean;
  promises3DInteraction: boolean;
  destinations: readonly Drift3DNoWebGLDestinationCandidate[];
  guarantees: Drift3DNoWebGLGuaranteesCandidate;
}>;

export type Drift3DNoWebGLPathIssueType =
  | "representation-not-panel"
  | "requires-webgl-not-false"
  | "mounts-3d-canvas-not-false"
  | "audio-authority-not-global-player"
  | "autoplay-not-false"
  | "promises-3d-interaction-not-false"
  | "destination-missing"
  | "destination-duplicate-id"
  | "destination-invalid-href"
  | "destination-invalid-role"
  | "guarantee-not-true";

export type Drift3DNoWebGLPathIssue = Readonly<{
  type: Drift3DNoWebGLPathIssueType;
  id?: string;
  guarantee?: keyof Drift3DNoWebGLGuarantees;
  message: string;
}>;

const MAP_DESTINATION: Drift3DNoWebGLDestination = Object.freeze({
  id: "map",
  href: "/drift-lab",
  role: "map",
});

const TRACKS_DESTINATION: Drift3DNoWebGLDestination = Object.freeze({
  id: "tracks",
  href: "/tracks",
  role: "listening",
});

const CANONICAL_DESTINATIONS: readonly Drift3DNoWebGLDestination[] =
  Object.freeze([MAP_DESTINATION, TRACKS_DESTINATION]);

const EXPECTED_DESTINATION_BY_ID: Readonly<
  Record<Drift3DNoWebGLDestinationId, Drift3DNoWebGLDestination>
> = Object.freeze({
  map: MAP_DESTINATION,
  tracks: TRACKS_DESTINATION,
});

const CANONICAL_GUARANTEES: Drift3DNoWebGLGuarantees = Object.freeze({
  usefulRoute: true,
  catalogueAccessible: true,
  mapAccessible: true,
  globalAudioPreserved: true,
  staticLightweightRepresentation: true,
  honestInteractionBoundary: true,
});

const CANONICAL_NO_WEBGL_PATH: Drift3DNoWebGLNarrativePath = Object.freeze({
  representation: "panel",
  requiresWebGL: false,
  mounts3DCanvas: false,
  audioAuthority: "global-player",
  autoplay: false,
  promises3DInteraction: false,
  destinations: CANONICAL_DESTINATIONS,
  guarantees: CANONICAL_GUARANTEES,
});

const GUARANTEE_KEYS: readonly (keyof Drift3DNoWebGLGuarantees)[] =
  Object.freeze([
    "usefulRoute",
    "catalogueAccessible",
    "mapAccessible",
    "globalAudioPreserved",
    "staticLightweightRepresentation",
    "honestInteractionBoundary",
  ]);

/**
 * Same singleton every call — no allocation, no module-scope mutation.
 */
export function getDrift3DNoWebGLNarrativePath(): Drift3DNoWebGLNarrativePath {
  return CANONICAL_NO_WEBGL_PATH;
}

/**
 * Validates a single path candidate: representation/requiresWebGL/
 * mounts3DCanvas/audioAuthority/autoplay/promises3DInteraction not matching
 * the canonical contract; a missing `map` or `tracks` destination;
 * duplicate destination ids; a destination's `href`/`role` not matching the
 * canonical value for its id; any guarantee not being exactly `true`.
 * Intended for authoring, tests, development and acceptance — the hot path
 * (`getDrift3DNoWebGLNarrativePath`) assumes an already-validated canonical
 * path and does not re-validate it.
 */
export function getDrift3DNoWebGLPathIssues(
  path: Drift3DNoWebGLNarrativePathCandidate
): readonly Drift3DNoWebGLPathIssue[] {
  const issues: Drift3DNoWebGLPathIssue[] = [];

  if (path.representation !== "panel") {
    issues.push({
      type: "representation-not-panel",
      message: `representation must be "panel" (got "${path.representation}").`,
    });
  }

  if (path.requiresWebGL !== false) {
    issues.push({
      type: "requires-webgl-not-false",
      message: `requiresWebGL must be false (got ${path.requiresWebGL}).`,
    });
  }

  if (path.mounts3DCanvas !== false) {
    issues.push({
      type: "mounts-3d-canvas-not-false",
      message: `mounts3DCanvas must be false (got ${path.mounts3DCanvas}).`,
    });
  }

  if (path.audioAuthority !== "global-player") {
    issues.push({
      type: "audio-authority-not-global-player",
      message: `audioAuthority must be "global-player" (got "${path.audioAuthority}").`,
    });
  }

  if (path.autoplay !== false) {
    issues.push({
      type: "autoplay-not-false",
      message: `autoplay must be false (got ${path.autoplay}).`,
    });
  }

  if (path.promises3DInteraction !== false) {
    issues.push({
      type: "promises-3d-interaction-not-false",
      message: `promises3DInteraction must be false (got ${path.promises3DInteraction}).`,
    });
  }

  const seenIds = new Set<string>();

  for (const destination of path.destinations) {
    if (seenIds.has(destination.id)) {
      issues.push({
        type: "destination-duplicate-id",
        id: destination.id,
        message: `Destination id "${destination.id}" is duplicated.`,
      });
    } else {
      seenIds.add(destination.id);
    }

    if (destination.id === "map" || destination.id === "tracks") {
      const expected = EXPECTED_DESTINATION_BY_ID[destination.id];

      if (destination.href !== expected.href) {
        issues.push({
          type: "destination-invalid-href",
          id: destination.id,
          message: `Destination "${destination.id}" must have href "${expected.href}" (got "${destination.href}").`,
        });
      }

      if (destination.role !== expected.role) {
        issues.push({
          type: "destination-invalid-role",
          id: destination.id,
          message: `Destination "${destination.id}" must have role "${expected.role}" (got "${destination.role}").`,
        });
      }
    }
  }

  if (!seenIds.has("map")) {
    issues.push({
      type: "destination-missing",
      id: "map",
      message: `Required destination "map" is missing.`,
    });
  }

  if (!seenIds.has("tracks")) {
    issues.push({
      type: "destination-missing",
      id: "tracks",
      message: `Required destination "tracks" is missing.`,
    });
  }

  for (const guarantee of GUARANTEE_KEYS) {
    if (path.guarantees[guarantee] !== true) {
      issues.push({
        type: "guarantee-not-true",
        guarantee,
        message: `Guarantee "${guarantee}" is not true.`,
      });
    }
  }

  return issues;
}

/** Validates the real canonical path (see above). */
export function getDrift3DCanonicalNoWebGLIssues(): readonly Drift3DNoWebGLPathIssue[] {
  return getDrift3DNoWebGLPathIssues(CANONICAL_NO_WEBGL_PATH);
}
