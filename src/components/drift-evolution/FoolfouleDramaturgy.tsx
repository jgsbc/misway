"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Drift3DAudioClockRef } from "@/lib/drift3dAudioClock";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { DRIFT_EVOLUTION_FOOLFOULE_CENTER } from "@/lib/driftEvolutionFoolfoule";
import {
  DRIFT_EVOLUTION_FOOLFOULE_PANELS,
  getDriftEvolutionFoolfoulePanelYaw,
  isDriftEvolutionFoolfouleAudioSource,
  resolveDriftEvolutionFoolfouleDramaturgy,
  type DriftEvolutionFoolfouleCrowdSignal,
} from "@/lib/driftEvolutionFoolfouleDramaturgy";

type FoolfouleDramaturgyProps = {
  audioClockRef: Drift3DAudioClockRef;
  isInsideZone: boolean;
  crowdSignalRef: MutableRefObject<DriftEvolutionFoolfouleCrowdSignal>;
};

type CounterDisplay = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
};

function paintCounter(display: CounterDisplay, value: number) {
  const { canvas, context, texture } = display;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#101216";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#b5a17a";
  context.fillRect(0, 0, canvas.width, 12);
  context.fillStyle = "#e9e3d7";
  context.font = "700 92px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    String(Math.min(999, Math.max(0, value))).padStart(3, "0"),
    160,
    86
  );
  texture.needsUpdate = true;
}

function isResetDiscontinuity(reason: string) {
  return reason === "source-change" || reason === "restart" || reason === "loop";
}

/**
 * FOOLFOULE's first canonical contamination layer.
 *
 * The screens are exact dynamic copies of the ordinary landmark panels. They
 * stay absent until the Foolfoule track owns the audio clock. As pedestrians
 * complete passages, the screens progressively pivot toward the live crowd
 * centroid; sustained flow then reveals one diegetic counter. No arbitrary
 * musical timestamps, no UI overlay and no generalized event framework.
 */
export default function FoolfouleDramaturgy({
  audioClockRef,
  isInsideZone,
  crowdSignalRef,
}: FoolfouleDramaturgyProps) {
  const groupRefs = useRef<Array<THREE.Group | null>>(
    new Array(DRIFT_EVOLUTION_FOOLFOULE_PANELS.length).fill(null)
  );
  const materialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>(
    new Array(DRIFT_EVOLUTION_FOOLFOULE_PANELS.length).fill(null)
  );
  const counterMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const counterDisplayRef = useRef<CounterDisplay | null>(null);
  const visualTrackingRef = useRef(0);
  const visualCounterRef = useRef(0);
  const sessionActiveRef = useRef(false);
  const lastObservedCrossingsRef = useRef(0);
  const narrativeCrossingsRef = useRef(0);
  const lastTimelineRevisionRef = useRef<number | null>(null);
  const lastCounterValueRef = useRef(-1);
  const trackedFocusRef = useRef({
    x: DRIFT_EVOLUTION_FOOLFOULE_CENTER.x,
    z: DRIFT_EVOLUTION_FOOLFOULE_CENTER.z,
  });

  const panelTransforms = useMemo(
    () =>
      DRIFT_EVOLUTION_FOOLFOULE_PANELS.map((panel) => {
        const worldX = DRIFT_EVOLUTION_FOOLFOULE_CENTER.x + panel.x;
        const worldZ = DRIFT_EVOLUTION_FOOLFOULE_CENTER.z + panel.z;
        const streetOffsetZ = panel.z > 0 ? -0.075 : 0.075;
        return {
          ...panel,
          worldX,
          worldZ,
          position: [
            worldX,
            getDrift3DGroundY(worldX, worldZ) + panel.y + panel.height / 2,
            worldZ + streetOffsetZ,
          ] as [number, number, number],
          counterFaceZ: panel.z > 0 ? -0.061 : 0.061,
        };
      }),
    []
  );

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 160;
    const context = canvas.getContext("2d");
    if (!context) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const display = { canvas, context, texture };
    counterDisplayRef.current = display;
    paintCounter(display, 0);

    const material = counterMaterialRef.current;
    if (material) {
      material.map = texture;
      material.needsUpdate = true;
    }

    return () => {
      texture.dispose();
      counterDisplayRef.current = null;
    };
  }, []);

  useFrame((_, delta) => {
    const snapshot = audioClockRef.current;
    const crowd = crowdSignalRef.current;
    const revisionChanged =
      lastTimelineRevisionRef.current !== null &&
      snapshot.timelineRevision !== lastTimelineRevisionRef.current;
    const shouldResetForTimeline =
      revisionChanged && isResetDiscontinuity(snapshot.lastReason);
    lastTimelineRevisionRef.current = snapshot.timelineRevision;

    const sourceOwned = isDriftEvolutionFoolfouleAudioSource(snapshot);
    const sessionVisible =
      isInsideZone &&
      sourceOwned &&
      snapshot.playbackState !== "idle" &&
      snapshot.playbackState !== "ended";

    if (!sessionVisible || shouldResetForTimeline) {
      sessionActiveRef.current = false;
      narrativeCrossingsRef.current = 0;
      lastObservedCrossingsRef.current = crowd.totalCrossings;
      trackedFocusRef.current.x = crowd.centroidX;
      trackedFocusRef.current.z = crowd.centroidZ;
    }

    if (sessionVisible && !sessionActiveRef.current) {
      sessionActiveRef.current = true;
      lastObservedCrossingsRef.current = crowd.totalCrossings;
      narrativeCrossingsRef.current = 0;
      if (crowd.sampleCount > 0) {
        trackedFocusRef.current.x = crowd.centroidX;
        trackedFocusRef.current.z = crowd.centroidZ;
      }
    }

    if (sessionVisible) {
      const newCrossings = Math.max(
        0,
        crowd.totalCrossings - lastObservedCrossingsRef.current
      );
      lastObservedCrossingsRef.current = crowd.totalCrossings;

      if (snapshot.playbackState === "playing" && crowd.sampleCount > 0) {
        narrativeCrossingsRef.current += newCrossings;
        trackedFocusRef.current.x = crowd.centroidX;
        trackedFocusRef.current.z = crowd.centroidZ;
      }
    }

    if (
      !sessionVisible &&
      !shouldResetForTimeline &&
      visualTrackingRef.current < 0.001 &&
      visualCounterRef.current < 0.001
    ) {
      // Once the overlays have completed their short fade-out, the scene is
      // observably idle. Keep the reset bookkeeping above, then sleep until
      // zone/audio ownership changes instead of damping hidden panels forever.
      for (const group of groupRefs.current) {
        if (group) group.visible = false;
      }
      if (counterMaterialRef.current) counterMaterialRef.current.opacity = 0;
      return;
    }

    const state = resolveDriftEvolutionFoolfouleDramaturgy(
      snapshot,
      isInsideZone,
      narrativeCrossingsRef.current
    );
    visualTrackingRef.current = THREE.MathUtils.damp(
      visualTrackingRef.current,
      state.trackingBlend,
      4.6,
      delta
    );
    visualCounterRef.current = THREE.MathUtils.damp(
      visualCounterRef.current,
      state.counterBlend,
      3.8,
      delta
    );

    const tracking = visualTrackingRef.current;
    const counting = visualCounterRef.current;
    const focus = trackedFocusRef.current;
    const overlaysVisible = tracking > 0.008 || counting > 0.008;

    panelTransforms.forEach((panel, index) => {
      const group = groupRefs.current[index];
      const material = materialRefs.current[index];
      if (!group || !material) return;

      group.visible = overlaysVisible;
      const targetYaw =
        getDriftEvolutionFoolfoulePanelYaw(
          panel.worldX,
          panel.worldZ,
          focus.x,
          focus.z
        ) * tracking;
      group.rotation.y = THREE.MathUtils.damp(
        group.rotation.y,
        targetYaw,
        5.2,
        delta
      );
      material.emissiveIntensity = 0.16 + tracking * 0.38 + counting * 0.14;
    });

    if (counterMaterialRef.current) {
      counterMaterialRef.current.opacity = counting;
    }

    const counterDisplay = counterDisplayRef.current;
    if (
      counterDisplay &&
      state.counterValue !== lastCounterValueRef.current
    ) {
      lastCounterValueRef.current = state.counterValue;
      paintCounter(counterDisplay, state.counterValue);
    }
  });

  return (
    <group aria-hidden="true">
      {panelTransforms.map((panel, index) => (
        <group
          key={panel.id}
          ref={(group) => {
            groupRefs.current[index] = group;
          }}
          position={panel.position}
          visible={false}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[panel.width * 1.015, panel.height * 1.015, 0.1]} />
            <meshStandardMaterial
              ref={(material) => {
                materialRefs.current[index] = material;
              }}
              color={panel.color}
              emissive={panel.color}
              emissiveIntensity={0.16}
              roughness={0.36}
            />
          </mesh>
          {panel.heroCounter ? (
            <mesh position={[0, 0, panel.counterFaceZ]}>
              <planeGeometry args={[panel.width * 0.9, panel.height * 0.78]} />
              <meshBasicMaterial
                ref={counterMaterialRef}
                transparent
                opacity={0}
                side={THREE.DoubleSide}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}
