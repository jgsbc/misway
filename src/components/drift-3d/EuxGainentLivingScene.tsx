"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DLandmark from "@/components/drift-3d/Drift3DLandmark";
import {
  drift3dLandmarks,
  type Drift3DLandmark as Drift3DLandmarkData,
} from "@/lib/drift3dLandmarks";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DAudioClockRef } from "@/lib/drift3dAudioClock";
import {
  getDrift3DCueTimelineIssues,
  resolveDrift3DCueFromAudioClock,
} from "@/lib/drift3dCueResolver";
import { arbitrateDrift3DMajorSignature } from "@/lib/drift3dSignatureArbitration";
import {
  EUX_GAINENT_ATHLETE_IDS,
  EUX_GAINENT_LANDMARK_ID,
  EUX_GAINENT_PHASES,
  buildEuxGainentSignatureCandidate,
  resolveEuxGainentNarrativeActive,
  resolveEuxGainentScreenState,
  resolveEuxGainentVisualState,
  type EuxGainentAthleteId,
  type EuxGainentPhaseId,
  type EuxGainentVisualState,
} from "@/lib/drift3dEuxGainent";
import EuxGainentAthlete, {
  createEuxGainentAthleteJointRefs,
  EUX_GAINENT_ARCHETYPE_MOTION,
  EUX_GAINENT_ARCHETYPE_POSE,
  type EuxGainentAthleteArchetype,
  type EuxGainentAthleteJointRefs,
} from "@/components/drift-3d/EuxGainentAthlete";
import EuxGainentStation, {
  createEuxGainentStationRefs,
  type EuxGainentStationRefs,
} from "@/components/drift-3d/EuxGainentStation";
import {
  getEuxGainentBlackPlasticTexture,
  getEuxGainentBrushedMetalTexture,
  getEuxGainentConsoleReadoutTexture,
  getEuxGainentRubberFloorTexture,
  getEuxGainentScreenTexture,
  disposeEuxGainentConsoleReadoutTextures,
  disposeEuxGainentScreenTextures,
} from "@/lib/drift3dEuxGainentMaterials";

export type EuxGainentLivingSceneProps = {
  audioClockRef: Drift3DAudioClockRef;
  isInsideZone: boolean;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
};

/**
 * Dev-only, read-only snapshot backing `window.__drift3dEuxGainent`,
 * installed by this component itself (it is the only place the narrative is
 * actually resolved each frame) — mirrors the SYS-10 pattern of owning a dev
 * probe from inside the component that computes its data, never the shared
 * SYS-10 probe registry itself, which stays internal to `Drift3DScene.tsx`.
 */
export type EuxGainentDevSnapshot = {
  insideZone: boolean;
  sourceKind: "ambient" | "track" | null;
  sourceSlug: string | null;
  playbackState: string | null;
  absoluteTimeSeconds: number | null;
  phaseId: EuxGainentVisualState["phaseId"] | null;
  phaseProgress: number | null;
  dominantText: string | null;
  signatureEligible: boolean;
  signatureActive: boolean;
  screenHeadline: string | null;
  /** The exact cache key `getEuxGainentScreenTexture` itself keys on —
   * lets a live check confirm the texture actually swapped, not just that
   * the pure resolver returned new content. */
  screenTextureKey: string | null;
  /** `true` once `material.map` is a real (non-null) texture. */
  screenMaterialMapPresent: boolean;
  screenMaterialOpacity: number | null;
  /** World-space unit normal, `[x, y, z]`. */
  screenWorldNormal: readonly [number, number, number] | null;
  screenWorldPosition: readonly [number, number, number] | null;
  /** `true` iff the world normal points toward the live camera position
   * (dot product of normal and the mesh-to-camera vector is positive) —
   * computed from the actual runtime camera, never a hard-coded world axis. */
  screenFacingCamera: boolean | null;
  /** `(backWallWorldPosition - screenWorldPosition) · screenWorldNormal`.
   * Must read negative: the back wall must sit on the opposite side of the
   * screen from the camera (screen normal points at the camera, so "behind
   * the screen" is the negative side of that normal). A positive value
   * means the wall is a foreground occluder between the camera and the
   * screen (DRIFT-IV-BY-EUX-30 §P0D — the exact defect this field exists to
   * catch; an unsigned distance alone cannot distinguish the two cases). */
  backWallSignedDistanceAlongScreenNormal: number | null;
};

function createEuxGainentDevSnapshot(): EuxGainentDevSnapshot {
  return {
    insideZone: false,
    sourceKind: null,
    sourceSlug: null,
    playbackState: null,
    absoluteTimeSeconds: null,
    phaseId: null,
    phaseProgress: null,
    dominantText: null,
    signatureEligible: false,
    signatureActive: false,
    screenHeadline: null,
    screenTextureKey: null,
    screenMaterialMapPresent: false,
    screenMaterialOpacity: null,
    screenWorldNormal: null,
    screenWorldPosition: null,
    screenFacingCamera: null,
    backWallSignedDistanceAlongScreenNormal: null,
  };
}

/**
 * Durable, semantic identifier for this owner-review candidate — never the
 * live git SHA (changes on every amend, so a probe claiming to mirror it
 * would go stale the moment this same fix is amended in).
 */
const EUX_GAINENT_CANDIDATE_REVISION = "BY-EUX-30-V3-SCREEN-VALIDATED";

const sourceLandmark = drift3dLandmarks.find(
  (landmark) => landmark.id === EUX_GAINENT_LANDMARK_ID
);

if (!sourceLandmark) {
  throw new Error(`Missing Drift landmark: ${EUX_GAINENT_LANDMARK_ID}`);
}

// The facade, recalibration strip and floor (indices 0-2) stay exactly the
// static primitives already authored in `drift3dLandmarks.ts` (unmodified),
// rendered through the same generic `Drift3DLandmark` component every other
// landmark uses. Indices 3-13 (station bases, the three silhouettes and the
// two mechanical bars) are excluded here and rebuilt below as animated,
// authored meshes — never duplicated in the generic per-landmark loop in
// `Drift3DScene.tsx`.
const staticGymLandmark: Drift3DLandmarkData = {
  ...sourceLandmark,
  id: `${EUX_GAINENT_LANDMARK_ID}-structure`,
  primitives: sourceLandmark.primitives.slice(0, 3),
};

const gymOrigin = sourceLandmark.origin;
const facadePrimitive = sourceLandmark.primitives[0];
const stripPrimitive = sourceLandmark.primitives[1];
// Same terrain-following compensation `Drift3DLandmark.tsx` applies per
// primitive — computed once for the whole (small) gym footprint rather than
// per element, since the local slope across ~6 units is negligible.
const gymGroundY = getDrift3DGroundY(gymOrigin.x, gymOrigin.z);

type AthleteGeometry = Readonly<{
  x: number;
  z: number;
  totalHeight: number;
  color: string;
}>;

function athleteGeometryFrom(
  bodyIndex: number,
  headIndex: number
): AthleteGeometry {
  const body = sourceLandmark!.primitives[bodyIndex];
  const head = sourceLandmark!.primitives[headIndex];

  return {
    x: body.offset[0],
    z: body.offset[2],
    // Same total standing height the original cylinder+sphere pair used
    // (body height + head diameter) — read from the source primitives so
    // this never silently drifts from `drift3dLandmarks.ts`.
    totalHeight: body.args[2] + head.args[0] * 2,
    color: body.color,
  };
}

const ATHLETE_GEOMETRY: Readonly<Record<EuxGainentAthleteId, AthleteGeometry>> =
  {
    A: athleteGeometryFrom(6, 7),
    B: athleteGeometryFrom(8, 9),
    C: athleteGeometryFrom(10, 11),
  };

/**
 * Archetype assignment — three ordinary, recognizable cardio machines
 * sharing one family palette so the A/B/C comparison stays legible, per
 * Identity Contract §9/§10. The mapping is a rendering choice only; it does
 * not change which athlete is compliant, corrected or residual.
 */
const ATHLETE_ARCHETYPE: Readonly<Record<EuxGainentAthleteId, EuxGainentAthleteArchetype>> =
  {
    A: "treadmill",
    B: "bike",
    C: "rower",
  };

type StationGeometry = Readonly<{
  x: number;
  z: number;
  args: readonly [number, number, number];
  color: string;
}>;

function stationGeometryFrom(index: number): StationGeometry {
  const primitive = sourceLandmark!.primitives[index];

  return {
    x: primitive.offset[0],
    z: primitive.offset[2],
    args: [primitive.args[0], primitive.args[1], primitive.args[2]],
    color: primitive.color,
  };
}

const STATION_GEOMETRY: Readonly<Record<EuxGainentAthleteId, StationGeometry>> =
  {
    A: stationGeometryFrom(3),
    B: stationGeometryFrom(4),
    C: stationGeometryFrom(5),
  };

const barPrimitives = [sourceLandmark.primitives[12], sourceLandmark.primitives[13]];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/**
 * Normalized 0→1 "how locked into the shared system cadence" read, driving
 * fans/conveyor/consoles toward convergence (rework V3 §5/§25 — three
 * physically different exercises audibly/visibly falling into one beat).
 * Purely presentational (rendering-layer only); the pure phase/vocabulary
 * timeline in `drift3dEuxGainent.ts` is untouched.
 */
function convergenceBlend(phaseId: EuxGainentPhaseId, phaseProgress: number): number {
  switch (phaseId) {
    case "pre-cadence":
      return 0;
    case "cadence-lock":
      return phaseProgress;
    case "aftermath-return":
      return lerp(1, 0.5, phaseProgress);
    case "residue":
      return 0.5;
    default:
      return 1;
  }
}

// Amplified from the BY-EUX-20 build per owner review #1 ("almost
// imperceptible") — still an interior-contents-only illusion; the building
// shell/collider/node/footprint (owned entirely by `staticGymLandmark` and
// the untouched topology) never move.
const INTERIOR_SHIFT_MAX_POSITION = 0.22;
const INTERIOR_SHIFT_MAX_ROTATION = 0.045;

// Looked up by id rather than a numeric array index — a raw index here
// previously pointed at the wrong phase (`reference-inversion`'s own start,
// not `aftermath-return`'s), freezing the dispenser far too early.
const AFTERMATH_RETURN_START_SECONDS = EUX_GAINENT_PHASES.find(
  (phase) => phase.id === "aftermath-return"
)!.startTimeSeconds;

// Station moving-part speeds — amplified from V2 for stronger idle
// perceptibility (owner review #2: "encore un peu mou").
const STATION_ANGULAR_SPEED: Readonly<Record<EuxGainentAthleteArchetype, number>> = {
  treadmill: 9.5,
  bike: 8.5,
  rower: 0,
};
const ROWER_SEAT_TRAVEL = 0.13;
const ROWER_SEAT_FREQUENCY = 2.1;

// Secondary life layer (Identity Contract's own "banal function" register —
// ordinary at first glance, precise/deadpan once noticed, never a gag).
// Enlarged and repositioned from V2 (owner review #2: "pas encore assez
// vivant") to be genuinely readable from the road, not merely present.
const FAN_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [gymOrigin.x - 2.0, gymGroundY + 2.55, gymOrigin.z - 3.8],
  [gymOrigin.x + 0.7, gymGroundY + 2.55, gymOrigin.z - 3.8],
];
const FAN_BASE_SPEEDS: readonly [number, number] = [5.5, 3.0];
const CONVEYOR_TOWEL_COUNT = 4;
const CONVEYOR_TRACK_LENGTH = 0.9;
const CONVEYOR_SPEED = 0.14;
const CONVEYOR_POSITION: readonly [number, number, number] = [
  gymOrigin.x + 2.55,
  gymGroundY + 0.16,
  gymOrigin.z - 3.0,
];
const DISPENSER_POSITION: readonly [number, number, number] = [
  gymOrigin.x + 2.7,
  gymGroundY + 0.62,
  gymOrigin.z - 3.55,
];

// Console convergence — three different exercises, progressively
// identical output (rework V3 §24). Labels stay in French, matching the
// glass grammar; archetype base values are deliberately distinct at rest,
// converging to one shared reading once the room locks into cadence.
const CONSOLE_BASE_RATE: Readonly<Record<EuxGainentAthleteArchetype, number>> = {
  treadmill: 74,
  bike: 86,
  rower: 23,
};
const CONSOLE_BASE_LEVEL: Readonly<Record<EuxGainentAthleteArchetype, string>> = {
  treadmill: "05",
  bike: "07",
  rower: "03",
};
const CONSOLE_SHARED_RATE = 91;
const CONSOLE_SHARED_LEVEL = "06";
const CONSOLE_ATHLETE_OFFSET_SECONDS: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 7,
  C: 13,
};

// "Fond" / depth props (rework V3 §31) — large masses/silhouettes only,
// never an accumulation of small props, to protect the draw-call budget.
//
// DRIFT-IV-BY-EUX-30 P0D fix — the P0C revision of this constant added the
// margin to the facade's *inner* face (`+ args[2]/2 + margin`), which moves
// toward larger z, i.e. toward the camera/stations side, not away from it.
// The live probe's own signed geometry (`cameraWorldPosition.z ≈ 55.4` >
// `screenWorldPosition.z ≈ 37.99`, `screenWorldNormal ≈ [0,0,1]`) proves the
// camera sits on the screen's `+z` side, so anything meant to sit "behind"
// the screen from the camera must have a *smaller* z than the screen, not
// larger. The P0C value (`facade.z + args[2]/2 + 0.35` ≈ facade-relative
// -3.68) was actually *closer* to the camera than the screen
// (-4.01) — i.e. a foreground wall sitting between the camera and the
// screen, the exact opposite of its intent. Fixed by subtracting the margin
// from the facade's *outer* face instead, guaranteeing
// `backWallZ < screenZ` (verified by the new `backWallSignedDistanceAlong-
// ScreenNormal` probe field, which must read negative — see below).
const BACK_WALL_MARGIN_FROM_FACADE = 0.35;
const BACK_WALL_OFFSET: readonly [number, number, number] = [
  gymOrigin.x + facadePrimitive.offset[0],
  gymGroundY,
  gymOrigin.z +
    facadePrimitive.offset[2] -
    facadePrimitive.args[2] / 2 -
    BACK_WALL_MARGIN_FROM_FACADE,
];
const RACK_POSITION: readonly [number, number, number] = [
  gymOrigin.x - 2.55,
  gymGroundY,
  gymOrigin.z - 3.55,
];
const BENCH_POSITION: readonly [number, number, number] = [
  gymOrigin.x + 1.75,
  gymGroundY,
  gymOrigin.z - 2.75,
];
// Keep the accepted idle life readable on approach, then stop every dynamic
// calculation once the storefront is well outside gameplay view. Re-entry
// resolves directly from the current audio/R3F clock, so no cue is replayed.
const EUX_GAINENT_RUNTIME_RADIUS_SQ = 60 * 60;

export default function EuxGainentLivingScene({
  audioClockRef,
  isInsideZone,
  vehicleStateRef,
}: EuxGainentLivingSceneProps) {
  const athleteJointRefs = useRef<Record<EuxGainentAthleteId, EuxGainentAthleteJointRefs>>({
    A: createEuxGainentAthleteJointRefs(),
    B: createEuxGainentAthleteJointRefs(),
    C: createEuxGainentAthleteJointRefs(),
  });
  const stationMechRefs = useRef<Record<EuxGainentAthleteId, EuxGainentStationRefs>>({
    A: createEuxGainentStationRefs(),
    B: createEuxGainentStationRefs(),
    C: createEuxGainentStationRefs(),
  });
  const stationGroupRefs = useRef<Record<EuxGainentAthleteId, THREE.Group | null>>(
    { A: null, B: null, C: null }
  );
  const interiorReferenceRef = useRef<THREE.Group | null>(null);
  const stripOverlayMaterialRef = useRef<THREE.MeshStandardMaterial | null>(
    null
  );
  const correctionMarkerMaterialRef =
    useRef<THREE.MeshStandardMaterial | null>(null);
  const textMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const backWallMeshRef = useRef<THREE.Mesh | null>(null);
  // Reused every frame for the probe's world-position/normal/facing
  // computation — never allocated inside `useFrame` itself.
  const screenWorldPositionScratch = useRef(new THREE.Vector3());
  const screenWorldNormalScratch = useRef(new THREE.Vector3());
  const screenToCameraScratch = useRef(new THREE.Vector3());
  const backWallWorldPositionScratch = useRef(new THREE.Vector3());
  const lastScreenStateKeyRef = useRef<string | null>(null);
  const devSnapshotRef = useRef<EuxGainentDevSnapshot>(
    createEuxGainentDevSnapshot()
  );
  const fan1Ref = useRef<THREE.Group | null>(null);
  const fan2Ref = useRef<THREE.Group | null>(null);
  const conveyorTowelRefs = useRef<Array<THREE.Group | null>>(
    new Array(CONVEYOR_TOWEL_COUNT).fill(null)
  );
  const lastConsoleSecondRef = useRef<Record<EuxGainentAthleteId, number | null>>({
    A: null,
    B: null,
    C: null,
  });
  const lastDispenserCountRef = useRef<number | null>(null);
  const dispenserMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Dev-only, read-only probe. Never exposes seek/play/pause/forcePhase/
  // forceSignature/setCue/setTrack/teleport/setQuality/setReducedMotion —
  // `read()` only reports what this frame already resolved; `validateTimeline()`
  // proves the owner-approved phase boundaries against the shared, generic
  // `getDrift3DCueTimelineIssues` — it never re-derives or overrides them.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const probe = Object.freeze({
      read: () => ({ ...devSnapshotRef.current }),
      validateTimeline: () => getDrift3DCueTimelineIssues(EUX_GAINENT_PHASES),
      candidateRevision: EUX_GAINENT_CANDIDATE_REVISION,
    });

    Object.defineProperty(window, "__drift3dEuxGainent", {
      configurable: true,
      value: probe,
    });

    return () => {
      if (
        (window as unknown as Record<string, unknown>)
          .__drift3dEuxGainent === probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dEuxGainent;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      disposeEuxGainentScreenTextures();
      disposeEuxGainentConsoleReadoutTextures();
    };
  }, []);

  const metalMap = getEuxGainentBrushedMetalTexture(2, 1);
  const plasticMap = getEuxGainentBlackPlasticTexture(1, 1);
  const rubberMap = getEuxGainentRubberFloorTexture(2, 1);
  // `getEuxGainentScreenTexture` (unlike the three texture-factory calls
  // above) has no internal SSR guard, since every other call site is
  // safely deferred into `useFrame` (client-only). Guarded here because
  // this is the first call at component-render scope, which — for a
  // "use client" component reached via SSR — still executes server-side
  // too. `null` during SSR is a valid, meaningful "no texture yet" value
  // for `meshBasicMaterial.map`; the real texture resolves on the client,
  // and `useFrame`'s own state-key check replaces it with the actual
  // semantic state within at most ~1s regardless.
  const initialScreenTexture =
    typeof document !== "undefined" ? getEuxGainentScreenTexture(null, []) : null;

  useFrame((state, delta) => {
    const audioClock = audioClockRef.current;
    const vehicle = vehicleStateRef.current.position;
    const offsetX = vehicle.x - gymOrigin.x;
    const offsetZ = vehicle.z - gymOrigin.z;
    const runtimeActive =
      isInsideZone ||
      offsetX * offsetX + offsetZ * offsetZ <= EUX_GAINENT_RUNTIME_RADIUS_SQ;

    if (!runtimeActive) {
      if (process.env.NODE_ENV !== "production") {
        const devSnapshot = devSnapshotRef.current;
        devSnapshot.insideZone = false;
        devSnapshot.sourceKind = audioClock.source.kind;
        devSnapshot.sourceSlug = audioClock.source.slug;
        devSnapshot.playbackState = audioClock.playbackState;
        devSnapshot.absoluteTimeSeconds = null;
        devSnapshot.phaseId = null;
        devSnapshot.phaseProgress = null;
        devSnapshot.dominantText = null;
        devSnapshot.signatureEligible = false;
        devSnapshot.signatureActive = false;
        devSnapshot.screenHeadline = null;
        devSnapshot.screenTextureKey = null;
      }
      return;
    }

    const narrativeActive = resolveEuxGainentNarrativeActive(
      isInsideZone,
      audioClock.source.kind,
      audioClock.source.slug
    );

    let visualState: EuxGainentVisualState;

    if (narrativeActive) {
      const resolution = resolveDrift3DCueFromAudioClock(
        EUX_GAINENT_PHASES,
        audioClock,
        performance.now()
      );

      visualState = resolveEuxGainentVisualState(
        resolution.absoluteTimeSeconds,
        resolution.phaseId ?? "pre-cadence",
        resolution.phaseProgress
      );
    } else {
      // No EUX playback: the room stays alive on its own free-running idle
      // clock (R3F's own animation clock — never a new timer, never a
      // second audio source), wrapped inside the pre-cadence window itself
      // so the synthetic time can never cross into a cue boundary — if it
      // were left to grow unbounded, `resolveEuxGainentDominantText` would
      // eventually (wrongly) read vocabulary text from a raw elapsed-time
      // value that has nothing to do with the track. Never advances past
      // `pre-cadence`; no cadence/measurement/deviation/correction/
      // signature vocabulary can ever appear without music.
      const preCadenceEndSeconds = EUX_GAINENT_PHASES[0].endTimeSeconds;
      const idleTimeSeconds =
        state.clock.getElapsedTime() % preCadenceEndSeconds;

      visualState = resolveEuxGainentVisualState(
        idleTimeSeconds,
        "pre-cadence",
        0
      );
    }

    const signatureCandidate = buildEuxGainentSignatureCandidate(
      narrativeActive && visualState.signatureEligible
    );
    const arbitration = arbitrateDrift3DMajorSignature([signatureCandidate]);
    const signatureActive =
      arbitration.activeSignatureId === signatureCandidate.id;

    const screenState = resolveEuxGainentScreenState(
      visualState.absoluteTimeSeconds,
      visualState.phaseId
    );
    if (process.env.NODE_ENV !== "production") {
      const devSnapshot = devSnapshotRef.current;
      devSnapshot.insideZone = isInsideZone;
      devSnapshot.sourceKind = audioClock.source.kind;
      devSnapshot.sourceSlug = audioClock.source.slug;
      devSnapshot.playbackState = audioClock.playbackState;
      devSnapshot.absoluteTimeSeconds = visualState.absoluteTimeSeconds;
      devSnapshot.phaseId = visualState.phaseId;
      devSnapshot.phaseProgress = visualState.phaseProgress;
      devSnapshot.dominantText = visualState.dominantText;
      devSnapshot.signatureEligible = narrativeActive && visualState.signatureEligible;
      devSnapshot.signatureActive = signatureActive;
      devSnapshot.screenHeadline = screenState.headline;
      devSnapshot.screenTextureKey = `${screenState.headline ?? "∅"}|${screenState.secondaryLines.join("")}`;

      // Screen mesh/material/back-wall truth probe — deliberately excluded
      // from production's hot path. It reads actual Object3D/material/camera
      // state so owner QA can distinguish resolver truth from rendered truth.
      const screenMesh = screenMeshRef.current;
      const screenMaterial = textMaterialRef.current;
      const backWallMesh = backWallMeshRef.current;

      devSnapshot.screenMaterialMapPresent = !!screenMaterial?.map;
      devSnapshot.screenMaterialOpacity = screenMaterial?.opacity ?? null;

      if (screenMesh) {
        const worldPosition = screenMesh.getWorldPosition(
          screenWorldPositionScratch.current
        );
        const worldNormal = screenWorldNormalScratch.current
          .set(0, 0, 1)
          .transformDirection(screenMesh.matrixWorld)
          .normalize();
        const rawToCamera = screenToCameraScratch.current
          .copy(state.camera.position)
          .sub(worldPosition);
        devSnapshot.screenWorldPosition = [
          worldPosition.x,
          worldPosition.y,
          worldPosition.z,
        ];
        devSnapshot.screenWorldNormal = [
          worldNormal.x,
          worldNormal.y,
          worldNormal.z,
        ];
        devSnapshot.screenFacingCamera = worldNormal.dot(rawToCamera) > 0;

        if (backWallMesh) {
          const backWallWorldPosition = backWallMesh.getWorldPosition(
            backWallWorldPositionScratch.current
          );
          devSnapshot.backWallSignedDistanceAlongScreenNormal =
            (backWallWorldPosition.x - worldPosition.x) * worldNormal.x +
            (backWallWorldPosition.y - worldPosition.y) * worldNormal.y +
            (backWallWorldPosition.z - worldPosition.z) * worldNormal.z;
        } else {
          devSnapshot.backWallSignedDistanceAlongScreenNormal = null;
        }
      } else {
        devSnapshot.screenWorldPosition = null;
        devSnapshot.screenWorldNormal = null;
        devSnapshot.screenFacingCamera = null;
        devSnapshot.backWallSignedDistanceAlongScreenNormal = null;
      }
    }

    const convergence = convergenceBlend(visualState.phaseId, visualState.phaseProgress);
    const converged = convergence >= 0.98;

    // --- Athletes: distinct, large-amplitude, archetype-specific motion. ---
    for (const athleteId of EUX_GAINENT_ATHLETE_IDS) {
      const athleteState = visualState.athletes[athleteId];
      const refs = athleteJointRefs.current[athleteId];
      const archetype = ATHLETE_ARCHETYPE[athleteId];
      const pose = EUX_GAINENT_ARCHETYPE_POSE[archetype];
      const motion = EUX_GAINENT_ARCHETYPE_MOTION[archetype];
      const swing = athleteState.cycleValue * athleteState.amplitude;
      const kneeLift = Math.max(0, athleteState.cycleValue) * athleteState.amplitude;

      if (refs.root) {
        refs.root.position.y = Math.abs(swing) * motion.verticalBobRange;
        refs.root.position.z = swing * motion.seatSlideRange;
      }

      if (refs.torso) {
        refs.torso.rotation.x = pose.torsoLean + swing * motion.torsoLeanRange;
        refs.torso.rotation.y = swing * motion.torsoTwistRange;
      }

      if (refs.leftArm) {
        refs.leftArm.rotation.x = pose.armRest + swing * motion.armRange;
      }

      if (refs.rightArm) {
        refs.rightArm.rotation.x = pose.armRest - swing * motion.armRange;
      }

      if (refs.leftLeg) {
        refs.leftLeg.rotation.x = pose.legRest - swing * motion.legRange;
        refs.leftLeg.position.y = kneeLift * motion.kneeLiftRange;
      }

      if (refs.rightLeg) {
        refs.rightLeg.rotation.x = pose.legRest + swing * motion.legRange;
        refs.rightLeg.position.y =
          Math.max(0, -swing) * athleteState.amplitude * motion.kneeLiftRange;
      }

      // --- Station moving part: the machine's own tempo, never frozen. ---
      const stationState = visualState.stations[athleteId];
      const stMech = stationMechRefs.current[athleteId];
      const stGroup = stationGroupRefs.current[athleteId];

      if (stGroup) {
        stGroup.position.z =
          STATION_GEOMETRY[athleteId].z + stationState.cycleValue * 0.02;
      }

      if (stMech.movingPart) {
        // Speed responds to the athlete's own amplitude (never fully
        // stopping) — this is what makes B's mechanical stop/recenter/
        // resume during correction physically visible on the machine
        // itself, reusing the existing pure-model amplitude dip rather
        // than deriving a second correction timeline here.
        const speedScale = 0.35 + 0.65 * clamp01(athleteState.amplitude);

        if (archetype === "rower") {
          stMech.movingPart.position.z =
            Math.sin(visualState.absoluteTimeSeconds * ROWER_SEAT_FREQUENCY) *
            ROWER_SEAT_TRAVEL *
            speedScale;
        } else {
          const axis = archetype === "bike" ? "z" : "x";
          stMech.movingPart.rotation[axis] +=
            STATION_ANGULAR_SPEED[archetype] * speedScale * delta;
        }
      }

      // --- Per-station console: TIME/DIST/CAD/NIV, three different
      // exercises converging toward near-identical readings once the room
      // locks into cadence (rework V3 §24). ---
      if (stMech.consoleMaterial) {
        const offsetSeconds = CONSOLE_ATHLETE_OFFSET_SECONDS[athleteId];
        const effectiveSeconds = converged
          ? visualState.absoluteTimeSeconds
          : visualState.absoluteTimeSeconds + offsetSeconds;
        const displaySeconds = Math.floor(effectiveSeconds);
        const cacheGateValue = displaySeconds * 10 + (converged ? 1 : 0);

        if (lastConsoleSecondRef.current[athleteId] !== cacheGateValue) {
          lastConsoleSecondRef.current[athleteId] = cacheGateValue;
          const minutes = Math.floor(displaySeconds / 60) % 100;
          const seconds = displaySeconds % 60;
          const distanceKm = (displaySeconds * 0.0032).toFixed(2);
          const rate = converged
            ? CONSOLE_SHARED_RATE
            : Math.round(CONSOLE_BASE_RATE[archetype] + Math.sin(displaySeconds * 0.3) * 3);
          const level = converged ? CONSOLE_SHARED_LEVEL : CONSOLE_BASE_LEVEL[archetype];
          stMech.consoleMaterial.map = getEuxGainentConsoleReadoutTexture(
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
            `${distanceKm} KM`,
            `CAD ${rate}`,
            `NIV ${level}`
          );
          stMech.consoleMaterial.needsUpdate = true;
        }
      }
    }

    const interior = interiorReferenceRef.current;

    if (interior) {
      const shift = signatureActive ? visualState.interiorShift : 0;
      interior.position.x = gymOrigin.x + shift * INTERIOR_SHIFT_MAX_POSITION;
      interior.rotation.y = shift * INTERIOR_SHIFT_MAX_ROTATION;
    }

    // Recalibration strip overlay — emissive states only, no new dynamic
    // light, no continuous pulse during the signature (a fixed, steady
    // control-axis read instead).
    const stripMaterial = stripOverlayMaterialRef.current;

    if (stripMaterial) {
      let intensity = 0;

      switch (visualState.phaseId) {
        case "pre-cadence":
          intensity = 0;
          break;
        case "cadence-lock":
          intensity =
            0.12 + Math.abs(Math.sin(visualState.absoluteTimeSeconds * 0.5)) * 0.1;
          break;
        case "measurement":
          intensity = 0.5;
          break;
        case "deviation":
          intensity = 0.2;
          break;
        case "correction-revelation":
          intensity = 0.6;
          break;
        case "reference-inversion":
          intensity = 1.05;
          break;
        case "aftermath-return":
          intensity = lerp(1.05, 0.32, visualState.phaseProgress);
          break;
        case "residue":
          intensity = 0.22;
          break;
      }

      stripMaterial.emissiveIntensity = intensity;
    }

    // Narrow local sweep isolating/correcting B — the first genuinely
    // spectacular (never VFX-loud) moment of the scene: everything else
    // keeps running while exactly one body diverges (rework V3 §26).
    const correctionMarker = correctionMarkerMaterialRef.current;

    if (correctionMarker) {
      let markerIntensity = 0;

      if (visualState.phaseId === "deviation") {
        markerIntensity = lerp(0.35, 0.9, visualState.phaseProgress);
      } else if (visualState.phaseId === "correction-revelation") {
        markerIntensity = lerp(1, 0.15, clamp01(visualState.phaseProgress * 4));
      }

      correctionMarker.emissiveIntensity = markerIntensity;
    }

    // Glass surface — one dominant word plus a small secondary grammar of
    // operational fragments (rework V3 §9-20). One combined texture per
    // distinct screen state, swapped only when that state actually changes.
    const textMaterial = textMaterialRef.current;

    if (textMaterial) {
      const stateKey =
        visualState.phaseId === "pre-cadence" || visualState.phaseId === "aftermath-return"
          ? `${screenState.headline ?? "∅"}|${Math.floor(visualState.absoluteTimeSeconds)}`
          : `${screenState.headline ?? "∅"}|${screenState.secondaryLines.join("")}`;

      if (lastScreenStateKeyRef.current !== stateKey) {
        lastScreenStateKeyRef.current = stateKey;
        textMaterial.map = getEuxGainentScreenTexture(
          screenState.headline,
          screenState.secondaryLines
        );
        textMaterial.opacity =
          screenState.headline || screenState.secondaryLines.length > 0 ? 0.97 : 0;
        textMaterial.needsUpdate = true;
      }
    }

    // --- Secondary life layer — made genuinely perceptible (owner review
    // #2: "pas encore assez vivant"). Continues through the signature;
    // the counter freezes in aftermath/residue while fans/conveyor keep
    // moving. ---
    if (fan1Ref.current) {
      fan1Ref.current.rotation.y += FAN_BASE_SPEEDS[0] * delta;
    }

    if (fan2Ref.current) {
      const fan2Speed = lerp(FAN_BASE_SPEEDS[1], FAN_BASE_SPEEDS[0], convergence);
      fan2Ref.current.rotation.y += fan2Speed * delta;
    }

    const conveyorSpacing = CONVEYOR_TRACK_LENGTH / CONVEYOR_TOWEL_COUNT;
    const conveyorSpeed = lerp(CONVEYOR_SPEED * 0.5, CONVEYOR_SPEED, convergence);

    for (let index = 0; index < CONVEYOR_TOWEL_COUNT; index += 1) {
      const towel = conveyorTowelRefs.current[index];

      if (towel) {
        const raw =
          (visualState.absoluteTimeSeconds * conveyorSpeed + index * conveyorSpacing) %
          CONVEYOR_TRACK_LENGTH;
        towel.position.x = raw - CONVEYOR_TRACK_LENGTH / 2;
      }
    }

    const dispenserTimeSeconds =
      visualState.phaseId === "aftermath-return" || visualState.phaseId === "residue"
        ? AFTERMATH_RETURN_START_SECONDS
        : visualState.absoluteTimeSeconds;
    const dispenserCount = Math.floor(dispenserTimeSeconds * 1.7) % 10000;

    if (lastDispenserCountRef.current !== dispenserCount) {
      lastDispenserCountRef.current = dispenserCount;

      const material = dispenserMaterialRef.current;

      if (material) {
        material.map = getEuxGainentConsoleReadoutTexture(
          String(dispenserCount).padStart(4, "0")
        );
        material.needsUpdate = true;
      }
    }
  });

  return (
    <group aria-hidden="true">
      <Drift3DLandmark
        landmark={staticGymLandmark}
        vehicleStateRef={vehicleStateRef}
      />

      {/* Glass surface — combined headline + secondary-grammar + grime
          texture, one mesh, mounted on the facade's `+z` face (the real
          camera side — confirmed via a live probe read, `screenWorldNormal
          ≈ [0,0,1]` paired with `screenFacingCamera: true` and
          `cameraWorldPosition.z` on the same side; do not "correct" this to
          `-z` from footprint geometry alone, that reasoning was tried and
          disproved during DRIFT-IV-BY-EUX-30's P0 debugging arc). The
          facade primitive has no `opacity`, so `Drift3DLandmark.tsx`
          renders it fully opaque with `depthWrite: true` (a wall, not
          literal see-through glass) — this mesh's own epsilon keeps it
          just outside that opaque volume. `side` is `FrontSide`: this
          material is meant to be read from one direction only. `fog`
          is `false` — the scene's own `fogExp2` (`Drift3DScene.tsx`) would
          otherwise blend this material toward black at ordinary viewing
          distance; `NightSky`'s star material in the same file sets
          `fog={false}` for the identical reason ("so the stars read as
          sky, not as fogged geometry") — this screen needs to read as an
          unlit, self-illuminated display for the same reason. */}
      <mesh
        ref={screenMeshRef}
        position={[
          gymOrigin.x + facadePrimitive.offset[0],
          gymGroundY + facadePrimitive.offset[1] + facadePrimitive.args[1] / 2,
          gymOrigin.z + facadePrimitive.offset[2] + facadePrimitive.args[2] / 2 + 0.02,
        ]}
      >
        <planeGeometry args={[facadePrimitive.args[0] * 0.86, facadePrimitive.args[1] * 0.62]} />
        <meshBasicMaterial
          ref={textMaterialRef}
          map={initialScreenTexture}
          transparent
          opacity={0}
          depthTest
          depthWrite={false}
          toneMapped={false}
          fog={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Recalibration strip overlay — reuses the strip's own position; the
          base strip primitive stays part of the static shell above. */}
      <mesh
        position={[
          gymOrigin.x + stripPrimitive.offset[0],
          gymGroundY + stripPrimitive.offset[1],
          gymOrigin.z + stripPrimitive.offset[2] + stripPrimitive.args[2] / 2 + 0.005,
        ]}
      >
        <boxGeometry
          args={[stripPrimitive.args[0], stripPrimitive.args[1], 0.02]}
        />
        <meshStandardMaterial
          ref={stripOverlayMaterialRef}
          color="#eef6ff"
          emissive="#bfe0ff"
          emissiveIntensity={0}
          roughness={0.4}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* "Fond" — large-mass depth props (rework V3 §31): a back wall, a
          storage-rack silhouette and a bench, so the machines no longer
          read as floating in an empty box. Large masses only, not an
          accumulation of small props, to protect the draw-call budget. */}
      <mesh
        ref={backWallMeshRef}
        position={[BACK_WALL_OFFSET[0], BACK_WALL_OFFSET[1] + 1.15, BACK_WALL_OFFSET[2]]}
        receiveShadow
      >
        <boxGeometry args={[facadePrimitive.args[0] * 1.02, 2.3, 0.1]} />
        <meshStandardMaterial map={plasticMap ?? undefined} color="#2a2d31" roughness={0.75} />
      </mesh>
      <mesh position={[RACK_POSITION[0], RACK_POSITION[1] + 0.75, RACK_POSITION[2]]} castShadow>
        <boxGeometry args={[0.42, 1.5, 0.28]} />
        <meshStandardMaterial map={metalMap ?? undefined} color="#7d848b" roughness={0.45} />
      </mesh>
      <mesh position={[BENCH_POSITION[0], BENCH_POSITION[1] + 0.22, BENCH_POSITION[2]]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.28]} />
        <meshStandardMaterial map={rubberMap ?? undefined} color="#3a3d41" roughness={0.7} />
      </mesh>

      <group
        ref={interiorReferenceRef}
        position={[gymOrigin.x, gymGroundY, gymOrigin.z]}
      >
        {/* Narrow local correction/deviation marker over B's station only. */}
        <mesh
          position={[
            STATION_GEOMETRY.B.x,
            stripPrimitive.offset[1] - 0.15,
            STATION_GEOMETRY.B.z + 0.02,
          ]}
        >
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial
            ref={correctionMarkerMaterialRef}
            color="#eef6ff"
            emissive="#ffd7a8"
            emissiveIntensity={0}
            roughness={0.5}
          />
        </mesh>

        {barPrimitives.map((primitive, index) => (
          <mesh
            key={`eux-bar-${index}`}
            position={primitive.offset}
            rotation={primitive.rotation ?? [0, 0, 0]}
          >
            <cylinderGeometry
              args={[primitive.args[0], primitive.args[1], primitive.args[2], 14]}
            />
            <meshStandardMaterial
              map={metalMap ?? undefined}
              color={primitive.color}
              roughness={0.5}
            />
          </mesh>
        ))}

        {EUX_GAINENT_ATHLETE_IDS.map((athleteId) => {
          const station = STATION_GEOMETRY[athleteId];

          return (
            <group
              key={`eux-station-${athleteId}`}
              ref={(group) => {
                stationGroupRefs.current[athleteId] = group;
              }}
              position={[station.x, 0, station.z]}
            >
              <EuxGainentStation
                archetype={ATHLETE_ARCHETYPE[athleteId]}
                footprint={station.args}
                color={station.color}
                onMovingPartRef={(node) => {
                  stationMechRefs.current[athleteId].movingPart = node;
                }}
                onConsoleMaterialRef={(node) => {
                  stationMechRefs.current[athleteId].consoleMaterial = node;
                }}
              />
            </group>
          );
        })}

        {EUX_GAINENT_ATHLETE_IDS.map((athleteId) => {
          const geometry = ATHLETE_GEOMETRY[athleteId];

          return (
            <group
              key={`eux-athlete-${athleteId}`}
              position={[geometry.x, 0, geometry.z]}
            >
              <EuxGainentAthlete
                archetype={ATHLETE_ARCHETYPE[athleteId]}
                totalHeight={geometry.totalHeight}
                color={geometry.color}
                onJointRef={(key, node) => {
                  athleteJointRefs.current[athleteId][key] = node;
                }}
              />
            </group>
          );
        })}

        {/* Layer 2 — secondary life: two ceiling fans, desynced before
            music, that converge with the machine cadence and keep turning
            through the signature. */}
        {FAN_POSITIONS.map((position, index) => (
          <group
            key={`eux-fan-${index}`}
            ref={index === 0 ? fan1Ref : fan2Ref}
            position={[
              position[0] - gymOrigin.x,
              position[1] - gymGroundY,
              position[2] - gymOrigin.z,
            ]}
          >
            {/* A single flat disc (one draw call) — at operating speed a
                real ceiling fan reads as a blurred silhouette rather than
                distinct blades. */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.19, 0.19, 0.014, 16]} />
              <meshStandardMaterial map={metalMap ?? undefined} color="#9aa1a8" roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Layer 2 — a towel conveyor that genuinely, visibly transports
            towels: normal gym convenience at rest, suspiciously regular
            once locked into cadence, continuing through the signature
            precisely because nobody needs it at that moment. */}
        <group
          position={[
            CONVEYOR_POSITION[0] - gymOrigin.x,
            CONVEYOR_POSITION[1] - gymGroundY,
            CONVEYOR_POSITION[2] - gymOrigin.z,
          ]}
        >
          <mesh receiveShadow>
            <boxGeometry args={[CONVEYOR_TRACK_LENGTH + 0.08, 0.025, 0.14]} />
            <meshStandardMaterial map={metalMap ?? undefined} color="#8d9399" roughness={0.5} />
          </mesh>
          {Array.from({ length: CONVEYOR_TOWEL_COUNT }, (_, index) => (
            <mesh
              key={`towel-${index}`}
              ref={(group) => {
                // Reuse a mesh ref through the group array (position is the
                // only animated field) — safe cast since both are Object3D.
                conveyorTowelRefs.current[index] = group as unknown as THREE.Group | null;
              }}
              position={[0, 0.045, 0]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.025, 0.11]} />
              <meshStandardMaterial color="#eef2f6" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Layer 2 — a counter/dispenser, readable from the road, that
            keeps tallying something whose meaning is no longer clear;
            freezes in aftermath/residue while the fans and conveyor keep
            moving. */}
        <group
          position={[
            DISPENSER_POSITION[0] - gymOrigin.x,
            DISPENSER_POSITION[1] - gymGroundY,
            DISPENSER_POSITION[2] - gymOrigin.z,
          ]}
        >
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.14, 0.1]} />
            <meshStandardMaterial map={plasticMap ?? undefined} color="#1c1e21" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[0.15, 0.07]} />
            <meshBasicMaterial ref={dispenserMaterialRef} color="#0c1013" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
