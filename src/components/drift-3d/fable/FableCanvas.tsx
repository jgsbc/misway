"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DVehicle, {
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import type { ImmersionInput } from "@/components/drift-3d/fable/core/immersionInput";
import FableSky, { createFableSkyMaterial } from "@/components/drift-3d/fable/FableSky";
import ImmersionEnvironment from "@/components/drift-3d/fable/core/ImmersionEnvironment";
import FableTunnel from "@/components/drift-3d/fable/FableTunnel";
import FableCity from "@/components/drift-3d/fable/FableCity";
import FableCanal from "@/components/drift-3d/fable/FableCanal";
import FableFarEras from "@/components/drift-3d/fable/FableFarEras";
import { FABLE_ERAS } from "@/components/drift-3d/fable/fableTopology";
import FableLife from "@/components/drift-3d/fable/FableLife";
import FableDirector from "@/components/drift-3d/fable/FableDirector";
import FablePost, { type FablePostUniforms } from "@/components/drift-3d/fable/FablePost";
import type { FableAmbience } from "@/components/drift-3d/fable/fableAudio";
import {
  FABLE_SPAWN,
  buildFableWorldLayout,
  fableGroundY,
  fablePathX,
} from "@/components/drift-3d/fable/fableWorld";

/**
 * FABLE SPIKE — montage de la scène complète : gorge, ville, vie, véhicule
 * canonique, metteur en scène, voile. Une seule expérience continue.
 */

/**
 * Dev-only : sonde de vérification visuelle. Permet d'avancer la simulation
 * image par image et de capturer le canvas même quand l'onglet est gelé
 * (rAF suspendu). Jamais montée en production.
 */
function FableDebugProbe({
  vehicleStateRef,
  lots,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  lots: Array<{ x: number; z: number; width: number; depth: number; height: number }>;
}) {
  const get = useThree((state) => state.get);

  useEffect(() => {
    let last = performance.now();
    const probe = {
      lots: (z0: number, z1: number) =>
        lots
          .filter((lot) => lot.z >= z0 && lot.z <= z1)
          .map((lot) => ({
            x: Math.round(lot.x * 10) / 10,
            z: Math.round(lot.z * 10) / 10,
            w: Math.round(lot.width * 10) / 10,
            h: Math.round(lot.height * 10) / 10,
          })),
      step(frames = 1) {
        const state = get();

        for (let i = 0; i < frames; i += 1) {
          last += 1000 / 60;
          state.advance(last, true);
        }

        return frames;
      },
      state() {
        const s = vehicleStateRef.current;

        return { x: s.position.x, z: s.position.z, speed: s.speed, heading: s.heading };
      },
      teleport(x: number, z: number, heading = 0) {
        const s = vehicleStateRef.current;
        s.position.x = x;
        s.position.z = z;
        s.position.y = fableGroundY(x, z) + 0.05;
        s.heading = heading;
        s.velocityX = 0;
        s.velocityY = 0;
        s.velocityZ = 0;
        s.speed = 0;
        s.airborne = false;

        return true;
      },
      drive(speed: number) {
        const s = vehicleStateRef.current;
        s.speed = speed;

        return true;
      },
      snapshot(width = 512, quality = 0.5) {
        const source = get().gl.domElement;
        const scale = width / source.width;
        const target = document.createElement("canvas");
        target.width = width;
        target.height = Math.round(source.height * scale);
        const ctx = target.getContext("2d")!;
        probe.step(1);
        ctx.drawImage(source, 0, 0, target.width, target.height);
        const url = target.toDataURL("image/jpeg", quality);
        (window as unknown as Record<string, unknown>).__fableSnap = url;

        return url.length;
      },
      memory() {
        const { gl } = get();

        return {
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
        };
      },
      /** Inventaire d'une zone du monde — sert au contrôle de rendu. */
      inspect(minX: number, maxX: number, minZ: number, maxZ: number) {
        const out: Array<Record<string, unknown>> = [];
        const p = new THREE.Vector3();
        get().scene.traverse((o) => {
          const mesh = o as THREE.Mesh & { isPoints?: boolean; count?: number };

          if (!mesh.isMesh && !mesh.isPoints) return;

          o.getWorldPosition(p);

          if (p.x < minX || p.x > maxX || p.z < minZ || p.z > maxZ) return;

          out.push({
            type: o.type,
            count: mesh.count ?? null,
            x: +p.x.toFixed(1),
            y: +p.y.toFixed(1),
            z: +p.z.toFixed(1),
            visible: o.visible,
            geo: mesh.geometry?.type ?? null,
            mat: Array.isArray(mesh.material)
              ? "array"
              : (mesh.material as THREE.Material)?.type,
          });
        });

        return out;
      },
      read(offset: number, length: number) {
        const url = (window as unknown as Record<string, string>).__fableSnap ?? "";

        return url.slice(offset, offset + length);
      },
    };
    (window as unknown as Record<string, unknown>).__fableProbe = probe;
    (window as unknown as Record<string, unknown>).__fablePathX = fablePathX;

    return () => {
      delete (window as unknown as Record<string, unknown>).__fableProbe;
    };
  }, [get, vehicleStateRef, lots]);

  return null;
}

export type FableCanvasProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  inputRef: MutableRefObject<ImmersionInput | null>;
  ambienceRef: MutableRefObject<FableAmbience | null>;
  onFirstMove: () => void;
  reducedMotion: boolean;
};

export default function FableCanvas({
  vehicleStateRef,
  inputRef,
  ambienceRef,
  onFirstMove,
  reducedMotion,
}: FableCanvasProps) {
  const vehicleRef = useRef<Drift3DVehicleHandle | null>(null);
  const postUniformsRef = useRef<FablePostUniforms | null>(null);
  const layout = useMemo(() => buildFableWorldLayout(), []);
  const vehicleZRef = useRef(FABLE_SPAWN.z);

  const spawnY = fableGroundY(FABLE_SPAWN.x, FABLE_SPAWN.z) + 0.02;

  return (
    <Canvas
      className="absolute inset-0"
      camera={{
        position: [FABLE_SPAWN.x, spawnY + 1.3, FABLE_SPAWN.z - 3.6],
        fov: 60,
        near: 0.1,
        far: 1600,
      }}
      dpr={[1, 1.75]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <fogExp2 attach="fog" args={["#05060a", 0.05]} />
      <color attach="background" args={["#05060a"]} />

      <FableSky vehicleZRef={vehicleZRef} />
      <ImmersionEnvironment createSkyMaterial={createFableSkyMaterial} intensity={0.55} />
      <FableTunnel reducedMotion={reducedMotion} />
      <FableCity lots={layout.lots} reducedMotion={reducedMotion} />
      <FableCanal reducedMotion={reducedMotion} />
      <FableFarEras
        vehicleZRef={vehicleZRef}
        sunDir={FABLE_ERAS[4].sunDir}
        sunColor={FABLE_ERAS[4].sunColor}
      />
      <FableLife reducedMotion={reducedMotion} />

      <Drift3DVehicle
        ref={vehicleRef}
        initialPosition={[FABLE_SPAWN.x, spawnY, FABLE_SPAWN.z]}
      />

      <FableDirector
        vehicleRef={vehicleRef}
        vehicleStateRef={vehicleStateRef}
        inputRef={inputRef}
        vehicleZRef={vehicleZRef}
        colliders={layout.colliders}
        postUniformsRef={postUniformsRef}
        ambienceRef={ambienceRef}
        onFirstMove={onFirstMove}
        reducedMotion={reducedMotion}
      />

      <FablePost uniformsRef={postUniformsRef} />

      {process.env.NODE_ENV !== "production" ? (
        <FableDebugProbe vehicleStateRef={vehicleStateRef} lots={layout.lots} />
      ) : null}
    </Canvas>
  );
}
