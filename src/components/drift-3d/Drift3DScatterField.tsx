"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import {
  getDrift3DScatterInstances,
  type Drift3DScatterInstance,
  type Drift3DScatterKind,
} from "@/lib/drift3dScatter";
import { getDriftMaterialTexture } from "@/components/drift-3d/drift3dTextureFactory";

/**
 * Rendu de la dispersion : chaque archétype est un empilement de parties
 * (tronc, feuillage, tête…) rendues en InstancedMesh — des milliers d'objets
 * pour une douzaine de draw calls. Les matrices sont posées une fois.
 */

type ScatterPartSpec = {
  geometry: () => THREE.BufferGeometry;
  color: string;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  texture?: Parameters<typeof getDriftMaterialTexture>[0];
  textureRepeat?: [number, number];
};

const partSpecsByKind: Record<Drift3DScatterKind, ScatterPartSpec[]> = {
  conifer: [
    {
      geometry: () => {
        const trunk = new THREE.CylinderGeometry(0.06, 0.09, 0.5, 6);
        trunk.translate(0, 0.25, 0);

        return trunk;
      },
      color: "#5a4632",
      roughness: 0.95,
    },
    {
      geometry: () => {
        const foliage = new THREE.ConeGeometry(0.52, 1.5, 8);
        foliage.translate(0, 1.2, 0);

        return foliage;
      },
      color: "#2f4a33",
      roughness: 0.95,
    },
  ],
  broadleaf: [
    {
      geometry: () => {
        const trunk = new THREE.CylinderGeometry(0.06, 0.09, 0.62, 6);
        trunk.translate(0, 0.31, 0);

        return trunk;
      },
      color: "#6b5138",
      roughness: 0.95,
    },
    {
      geometry: () => {
        const canopy = new THREE.SphereGeometry(0.56, 8, 6);
        canopy.scale(1, 0.85, 1);
        canopy.translate(0, 1.05, 0);

        return canopy;
      },
      color: "#4a6b3a",
      roughness: 0.95,
    },
  ],
  bush: [
    {
      geometry: () => {
        const blob = new THREE.SphereGeometry(0.36, 7, 5);
        blob.scale(1, 0.7, 1);
        blob.translate(0, 0.26, 0);

        return blob;
      },
      color: "#55703f",
      roughness: 0.96,
    },
  ],
  rock: [
    {
      geometry: () => {
        const boulder = new THREE.SphereGeometry(0.4, 6, 5);
        boulder.scale(1, 0.68, 1.12);
        boulder.translate(0, 0.22, 0);

        return boulder;
      },
      color: "#77736b",
      roughness: 0.97,
    },
  ],
  grass: [
    {
      geometry: () => {
        const tuft = new THREE.ConeGeometry(0.1, 0.45, 5);
        tuft.translate(0, 0.22, 0);

        return tuft;
      },
      color: "#8a9a55",
      roughness: 0.97,
    },
  ],
  deadTree: [
    {
      geometry: () => {
        const trunk = new THREE.CylinderGeometry(0.045, 0.08, 1.9, 6);
        trunk.translate(0, 0.95, 0);

        return trunk;
      },
      color: "#8a93a3",
      roughness: 0.9,
    },
    {
      geometry: () => {
        const branch = new THREE.CylinderGeometry(0.03, 0.045, 0.7, 5);
        branch.translate(0, 0.35, 0);
        branch.rotateZ(0.8);
        branch.translate(0.12, 1.15, 0);

        return branch;
      },
      color: "#7e8798",
      roughness: 0.9,
    },
  ],
  lamppost: [
    {
      geometry: () => {
        const pole = new THREE.CylinderGeometry(0.035, 0.045, 1.75, 7);
        pole.translate(0, 0.875, 0);

        return pole;
      },
      color: "#3c3a36",
      roughness: 0.8,
    },
    {
      geometry: () => {
        const head = new THREE.SphereGeometry(0.09, 8, 6);
        head.translate(0, 1.8, 0);

        return head;
      },
      color: "#ffe9b8",
      roughness: 0.5,
      emissive: "#f2c66b",
      emissiveIntensity: 0.55,
    },
  ],
  acacia: [
    {
      geometry: () => {
        const trunk = new THREE.CylinderGeometry(0.055, 0.08, 0.95, 6);
        trunk.translate(0, 0.475, 0);

        return trunk;
      },
      color: "#7a5a38",
      roughness: 0.95,
    },
    {
      geometry: () => {
        const canopy = new THREE.CylinderGeometry(0.72, 0.5, 0.2, 8);
        canopy.translate(0, 1.08, 0);

        return canopy;
      },
      color: "#6b7a3a",
      roughness: 0.95,
    },
  ],
  cityBlock: [
    {
      geometry: () => {
        const block = new THREE.BoxGeometry(1.3, 2.6, 1.3);
        block.translate(0, 1.3, 0);

        return block;
      },
      color: "#ffffff",
      roughness: 0.6,
      texture: "windowsDay",
      textureRepeat: [1, 1],
    },
    {
      geometry: () => {
        const roof = new THREE.BoxGeometry(1.38, 0.08, 1.38);
        roof.translate(0, 2.64, 0);

        return roof;
      },
      color: "#43464c",
      roughness: 0.92,
    },
  ],
  poppy: [
    {
      geometry: () => {
        const stem = new THREE.CylinderGeometry(0.015, 0.02, 0.3, 5);
        stem.translate(0, 0.15, 0);

        return stem;
      },
      color: "#5f7040",
      roughness: 0.95,
    },
    {
      geometry: () => {
        const head = new THREE.SphereGeometry(0.06, 6, 5);
        head.translate(0, 0.34, 0);

        return head;
      },
      color: "#c92c2c",
      roughness: 0.7,
    },
  ],
};

function ScatterPart({
  instances,
  spec,
}: {
  instances: Drift3DScatterInstance[];
  spec: ScatterPartSpec;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => spec.geometry(), [spec]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: spec.roughness ?? 0.95,
        emissive: new THREE.Color(spec.emissive ?? "#000000"),
        emissiveIntensity: spec.emissiveIntensity ?? 0,
        map: spec.texture
          ? getDriftMaterialTexture(
              spec.texture,
              spec.textureRepeat?.[0] ?? 1,
              spec.textureRepeat?.[1] ?? 1
            ) ?? undefined
          : undefined,
      }),
    [spec]
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const dummy = new THREE.Object3D();

    instances.forEach((instance, index) => {
      dummy.position.set(
        instance.x,
        DRIFT_3D_FLOOR_Y + instance.y,
        instance.z
      );
      dummy.rotation.set(0, instance.rotationY, 0);
      dummy.scale.setScalar(instance.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [instances]);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

export default function Drift3DScatterField() {
  const instancesByKind = useMemo(() => getDrift3DScatterInstances(), []);

  return (
    <group aria-hidden="true">
      {(Object.keys(partSpecsByKind) as Drift3DScatterKind[]).flatMap((kind) =>
        partSpecsByKind[kind].map((spec, partIndex) => (
          <ScatterPart
            key={`${kind}-${partIndex}`}
            instances={instancesByKind[kind] ?? []}
            spec={spec}
          />
        ))
      )}
    </group>
  );
}
