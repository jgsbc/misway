"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import {
  DRIFT_3D_BIRTH_YARD_HERO_URBAN,
  DRIFT_3D_BIRTH_YARD_QUAY_BOLLARDS,
  DRIFT_3D_BIRTH_YARD_QUAY_LIGHTS,
} from "@/lib/drift3dBirthYardUrban";
import { DRIFT_3D_SEA_LEVEL } from "@/lib/drift3dPeninsula";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";

export default function BirthYardHeroUrbanScene() {
  const bollardRef = useRef<THREE.InstancedMesh>(null);
  const lightPostRef = useRef<THREE.InstancedMesh>(null);
  const lightHeadRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const concrete = useMemo(() => getDriftMaterialMaps("concrete", 8, 18), []);
  const urban = DRIFT_3D_BIRTH_YARD_HERO_URBAN;
  const quayDepth = urban.quay.maxZ - urban.quay.minZ;
  const quayCenterZ = (urban.quay.minZ + urban.quay.maxZ) / 2;
  const forecourtGround = getDrift3DGroundY(
    urban.euxForecourt.centerX,
    urban.euxForecourt.centerZ
  );
  const craneGround = getDrift3DGroundY(urban.crane.x, urban.crane.z);
  const markerGround = getDrift3DGroundY(urban.euxMarker.x, urban.euxMarker.z);

  useLayoutEffect(() => {
    const bollards = bollardRef.current;
    const posts = lightPostRef.current;
    const heads = lightHeadRef.current;

    if (bollards) {
      DRIFT_3D_BIRTH_YARD_QUAY_BOLLARDS.forEach((point, index) => {
        dummy.position.set(point.x, DRIFT_3D_SEA_LEVEL + 0.36, point.z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        bollards.setMatrixAt(index, dummy.matrix);
      });
      bollards.instanceMatrix.needsUpdate = true;
    }

    if (posts && heads) {
      DRIFT_3D_BIRTH_YARD_QUAY_LIGHTS.forEach((point, index) => {
        const ground = getDrift3DGroundY(point.x, point.z);
        dummy.position.set(point.x, ground + 0.72, point.z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        posts.setMatrixAt(index, dummy.matrix);

        dummy.position.set(point.x, ground + 1.48, point.z);
        dummy.updateMatrix();
        heads.setMatrixAt(index, dummy.matrix);
      });
      posts.instanceMatrix.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;
    }
  }, [dummy]);

  return (
    <group aria-hidden="true">
      {/* Continuous east-bank quay: water authority stays the canonical sea plane. */}
      <mesh
        position={[
          urban.quay.x,
          DRIFT_3D_SEA_LEVEL + urban.quay.wallHeight / 2 - 0.06,
          quayCenterZ,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[urban.quay.wallWidth, urban.quay.wallHeight, quayDepth]} />
        <meshStandardMaterial
          map={concrete?.map ?? undefined}
          normalMap={concrete?.normalMap ?? undefined}
          normalScale={new THREE.Vector2(0.55, 0.55)}
          color="#77736d"
          roughness={0.94}
        />
      </mesh>

      <mesh
        position={[
          urban.quay.x + urban.quay.promenadeWidth / 2 + 0.22,
          DRIFT_3D_SEA_LEVEL + 0.42,
          quayCenterZ,
        ]}
        receiveShadow
      >
        <boxGeometry args={[urban.quay.promenadeWidth, 0.08, quayDepth]} />
        <meshStandardMaterial
          map={concrete?.map ?? undefined}
          normalMap={concrete?.normalMap ?? undefined}
          normalScale={new THREE.Vector2(0.45, 0.45)}
          color="#858078"
          roughness={0.92}
        />
      </mesh>

      <instancedMesh
        ref={bollardRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_QUAY_BOLLARDS.length]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.1, 0.38, 8]} />
        <meshStandardMaterial color="#36393d" roughness={0.68} metalness={0.34} />
      </instancedMesh>

      <instancedMesh
        ref={lightPostRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_QUAY_LIGHTS.length]}
        castShadow
      >
        <cylinderGeometry args={[0.035, 0.045, 1.44, 7]} />
        <meshStandardMaterial color="#34373b" roughness={0.6} metalness={0.42} />
      </instancedMesh>
      <instancedMesh
        ref={lightHeadRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_QUAY_LIGHTS.length]}
      >
        <sphereGeometry args={[0.095, 8, 6]} />
        <meshStandardMaterial
          color="#ffd7a0"
          emissive="#ffc77f"
          emissiveIntensity={1.2}
          roughness={0.4}
        />
      </instancedMesh>

      {/* EUX forecourt: one quiet material plane that makes the gym read as destination. */}
      <mesh
        position={[
          urban.euxForecourt.centerX,
          forecourtGround + 0.035,
          urban.euxForecourt.centerZ,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[urban.euxForecourt.width, 0.07, urban.euxForecourt.depth]}
        />
        <meshStandardMaterial
          map={concrete?.map ?? undefined}
          normalMap={concrete?.normalMap ?? undefined}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          color="#8a8580"
          roughness={0.88}
        />
      </mesh>

      <group position={[urban.euxMarker.x, markerGround, urban.euxMarker.z]}>
        <mesh position={[0, urban.euxMarker.height / 2, 0]} castShadow>
          <boxGeometry args={[0.12, urban.euxMarker.height, 0.12]} />
          <meshStandardMaterial color="#34383e" roughness={0.56} metalness={0.46} />
        </mesh>
        <mesh position={[0.36, urban.euxMarker.height - 0.26, 0]}>
          <boxGeometry args={[0.72, 0.18, 0.09]} />
          <meshStandardMaterial
            color="#e8f1f8"
            emissive="#dcecff"
            emissiveIntensity={0.8}
            roughness={0.32}
          />
        </mesh>
      </group>

      {/* Working-port silhouette, intentionally low-rise and secondary to EUX. */}
      <group position={[urban.crane.x, craneGround, urban.crane.z]}>
        <mesh position={[0, urban.crane.mastHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.18, urban.crane.mastHeight, 0.18]} />
          <meshStandardMaterial color="#575b60" roughness={0.7} metalness={0.5} />
        </mesh>
        <mesh
          position={[urban.crane.boomLength / 2 - 0.15, urban.crane.mastHeight - 0.22, 0]}
          castShadow
        >
          <boxGeometry args={[urban.crane.boomLength, 0.14, 0.16]} />
          <meshStandardMaterial color="#65696e" roughness={0.68} metalness={0.48} />
        </mesh>
        <mesh
          position={[urban.crane.boomLength - 0.35, urban.crane.mastHeight - 1.0, 0]}
        >
          <cylinderGeometry args={[0.025, 0.025, 1.45, 6]} />
          <meshStandardMaterial color="#292c30" roughness={0.72} metalness={0.5} />
        </mesh>
      </group>

      <pointLight
        position={[
          urban.euxMarker.x + 0.4,
          markerGround + 1.85,
          urban.euxMarker.z + 0.1,
        ]}
        color="#dcecff"
        intensity={0.8}
        distance={5}
        decay={2}
      />
    </group>
  );
}
