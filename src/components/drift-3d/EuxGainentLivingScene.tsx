"use client";

import { useEffect, useMemo, useRef } from "react";
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
  EUX_GAINENT_CUES,
  EUX_GAINENT_LANDMARK_ID,
  EUX_GAINENT_PHASES,
  buildEuxGainentSignatureCandidate,
  resolveEuxGainentNarrativeActive,
  resolveEuxGainentVisualState,
  type EuxGainentAthleteId,
  type EuxGainentVisualState,
} from "@/lib/drift3dEuxGainent";

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
  };
}

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
// ref-driven meshes — never duplicated in the generic per-landmark loop in
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
  bodyArgs: readonly [number, number, number];
  headRadius: number;
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
    bodyArgs: [body.args[0], body.args[1], body.args[2]],
    headRadius: head.args[0],
    color: body.color,
  };
}

const ATHLETE_GEOMETRY: Readonly<Record<EuxGainentAthleteId, AthleteGeometry>> =
  {
    A: athleteGeometryFrom(6, 7),
    B: athleteGeometryFrom(8, 9),
    C: athleteGeometryFrom(10, 11),
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

const TEXT_WORDS = [
  "CADENCE",
  "ÉCART",
  "CONFORMITÉ",
  "RENDEMENT",
  "OBJECTIF DÉPLACÉ",
] as const;

function createEuxGainentTextTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "700 58px monospace";
    context.fillStyle = "#eef5ff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 24);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

const INTERIOR_SHIFT_MAX_POSITION = 0.055;
const INTERIOR_SHIFT_MAX_ROTATION = 0.012;

export default function EuxGainentLivingScene({
  audioClockRef,
  isInsideZone,
  vehicleStateRef,
}: EuxGainentLivingSceneProps) {
  const athleteBodyRefs = useRef<Record<EuxGainentAthleteId, THREE.Group | null>>(
    { A: null, B: null, C: null }
  );
  const stationRefs = useRef<Record<EuxGainentAthleteId, THREE.Group | null>>(
    { A: null, B: null, C: null }
  );
  const interiorReferenceRef = useRef<THREE.Group | null>(null);
  const stripOverlayMaterialRef = useRef<THREE.MeshStandardMaterial | null>(
    null
  );
  const correctionMarkerMaterialRef =
    useRef<THREE.MeshStandardMaterial | null>(null);
  const textMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const lastDominantTextRef = useRef<string | null>(null);
  const devSnapshotRef = useRef<EuxGainentDevSnapshot>(
    createEuxGainentDevSnapshot()
  );

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

  const textTextures = useMemo(() => {
    const textures = new Map<string, THREE.CanvasTexture>();

    for (const word of TEXT_WORDS) {
      textures.set(word, createEuxGainentTextTexture(word));
    }

    return textures;
  }, []);

  useEffect(() => {
    return () => {
      textTextures.forEach((texture) => texture.dispose());
    };
  }, [textTextures]);

  useFrame((state) => {
    const audioClock = audioClockRef.current;
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

    for (const athleteId of EUX_GAINENT_ATHLETE_IDS) {
      const athleteState = visualState.athletes[athleteId];
      const group = athleteBodyRefs.current[athleteId];

      if (group) {
        const restY = ATHLETE_GEOMETRY[athleteId].bodyArgs[2] / 2;
        const bob = Math.abs(athleteState.cycleValue) * 0.03 * athleteState.amplitude;
        group.position.y = restY + bob;
        group.rotation.x = athleteState.cycleValue * 0.08 * athleteState.amplitude;
      }

      const station = stationRefs.current[athleteId];
      const stationState = visualState.stations[athleteId];

      if (station) {
        station.position.z =
          STATION_GEOMETRY[athleteId].z +
          stationState.cycleValue * 0.03;
        station.scale.z = 1 + stationState.cycleValue * 0.02;
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
          intensity = 0.45;
          break;
        case "deviation":
          intensity = 0.18;
          break;
        case "correction-revelation":
          intensity = 0.55;
          break;
        case "reference-inversion":
          intensity = 0.85;
          break;
        case "aftermath-return":
          intensity = lerp(0.85, 0.32, visualState.phaseProgress);
          break;
        case "residue":
          intensity = 0.22;
          break;
      }

      stripMaterial.emissiveIntensity = intensity;
    }

    // Narrow local sweep isolating/correcting B — brief, never a flashing
    // alarm state.
    const correctionMarker = correctionMarkerMaterialRef.current;

    if (correctionMarker) {
      let markerIntensity = 0;
      const correctionCue = EUX_GAINENT_CUES[3];

      if (visualState.phaseId === "deviation") {
        markerIntensity = 0.5;
      } else if (
        visualState.phaseId === "correction-revelation" &&
        visualState.absoluteTimeSeconds < correctionCue.endSeconds
      ) {
        markerIntensity = 0.9;
      }

      correctionMarker.emissiveIntensity = markerIntensity;
    }

    // Glass surface text — swap the pre-built texture reference only when
    // the word actually changes; never regenerate a texture per frame.
    const textMaterial = textMaterialRef.current;

    if (textMaterial && lastDominantTextRef.current !== visualState.dominantText) {
      lastDominantTextRef.current = visualState.dominantText;
      textMaterial.map = visualState.dominantText
        ? textTextures.get(visualState.dominantText) ?? null
        : null;
      textMaterial.opacity = visualState.dominantText ? 0.94 : 0;
      textMaterial.needsUpdate = true;
    }
  });

  return (
    <group aria-hidden="true">
      <Drift3DLandmark
        landmark={staticGymLandmark}
        vehicleStateRef={vehicleStateRef}
      />

      {/* Glass surface text — one dominant term at a time, perspective-bound
          in front of the existing facade. */}
      <mesh
        position={[
          gymOrigin.x + facadePrimitive.offset[0],
          gymGroundY + facadePrimitive.offset[1] + facadePrimitive.args[1] / 2,
          gymOrigin.z + facadePrimitive.offset[2] + facadePrimitive.args[2] / 2 + 0.01,
        ]}
      >
        <planeGeometry args={[facadePrimitive.args[0] * 0.82, facadePrimitive.args[1] * 0.5]} />
        <meshBasicMaterial
          ref={textMaterialRef}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
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
            <meshStandardMaterial color={primitive.color} roughness={0.62} />
          </mesh>
        ))}

        {EUX_GAINENT_ATHLETE_IDS.map((athleteId) => {
          const station = STATION_GEOMETRY[athleteId];

          return (
            <group
              key={`eux-station-${athleteId}`}
              ref={(group) => {
                stationRefs.current[athleteId] = group;
              }}
              position={[station.x, station.args[1] / 2, station.z]}
            >
              <mesh castShadow receiveShadow>
                <boxGeometry args={[station.args[0], station.args[1], station.args[2]]} />
                <meshStandardMaterial color={station.color} roughness={0.72} />
              </mesh>
            </group>
          );
        })}

        {EUX_GAINENT_ATHLETE_IDS.map((athleteId) => {
          const geometry = ATHLETE_GEOMETRY[athleteId];
          const bodyHeight = geometry.bodyArgs[2];

          return (
            <group
              key={`eux-athlete-${athleteId}`}
              ref={(group) => {
                athleteBodyRefs.current[athleteId] = group;
              }}
              position={[geometry.x, bodyHeight / 2, geometry.z]}
            >
              <mesh castShadow>
                <cylinderGeometry
                  args={[geometry.bodyArgs[0], geometry.bodyArgs[1], bodyHeight, 14]}
                />
                <meshStandardMaterial color={geometry.color} roughness={0.9} />
              </mesh>
              <mesh position={[0, bodyHeight / 2 + geometry.headRadius, 0]} castShadow>
                <sphereGeometry args={[geometry.headRadius, 14, 12]} />
                <meshStandardMaterial color={geometry.color} roughness={0.9} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
