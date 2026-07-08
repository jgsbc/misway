"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import type {
  Drift3DLandmark,
  Drift3DLandmarkPrimitive,
} from "@/lib/drift3dLandmarks";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";

type Drift3DLandmarkProps = {
  landmark: Drift3DLandmark;
  vehicleStateRef?: MutableRefObject<Drift3DVehiclePhysicsState>;
};

/**
 * Fourth-wall comfort (realism bible + camera rule): any tall piece that
 * slips between the north-looking camera and the vehicle fades out instead
 * of hiding the player. Approximation of the sight line with the base
 * camera rig (height 6, depth 10.4) — conservative enough at every zoom.
 */
const OCCLUSION_CAMERA_HEIGHT = 6;
const OCCLUSION_CAMERA_DEPTH = 10.4;
const OCCLUSION_HALF_WIDTH = 2.7;
const OCCLUSION_FADED_OPACITY = 0.22;
const OCCLUSION_MIN_HEIGHT = 1.2;

function getPrimitiveHeight(primitive: Drift3DLandmarkPrimitive) {
  switch (primitive.kind) {
    case "box":
      return primitive.args[1];
    case "cylinder":
      return primitive.args[2];
    case "cone":
      return primitive.args[1];
    case "sphere":
      return primitive.args[0] * 2;
  }
}

function PrimitiveGeometry({
  primitive,
}: {
  primitive: Drift3DLandmarkPrimitive;
}) {
  switch (primitive.kind) {
    case "box":
      return (
        <boxGeometry
          args={[primitive.args[0], primitive.args[1], primitive.args[2]]}
        />
      );
    case "cylinder":
      return (
        <cylinderGeometry
          args={[primitive.args[0], primitive.args[1], primitive.args[2], 14]}
        />
      );
    case "cone":
      return (
        <coneGeometry
          args={[primitive.args[0], primitive.args[1], primitive.args[2] ?? 12]}
        />
      );
    case "sphere":
      return <sphereGeometry args={[primitive.args[0], 14, 12]} />;
  }
}

/** Real planar reflection for canal water (three examples Reflector). */
function WaterPlane({
  primitive,
  groundY,
}: {
  primitive: Drift3DLandmarkPrimitive;
  groundY: number;
}) {
  const reflector = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      primitive.args[0],
      primitive.args[2]
    );
    const instance = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: 512,
      textureHeight: 512,
      color: new THREE.Color(primitive.color),
    });
    instance.rotation.x = -Math.PI / 2;

    return instance;
  }, [primitive]);

  useEffect(() => {
    return () => {
      reflector.geometry.dispose();
      reflector.getRenderTarget().dispose();
    };
  }, [reflector]);

  return (
    <primitive
      object={reflector}
      position={[
        primitive.offset[0],
        groundY + primitive.offset[1] + 0.02,
        primitive.offset[2],
      ]}
    />
  );
}

export default function Drift3DLandmark({
  landmark,
  vehicleStateRef,
}: Drift3DLandmarkProps) {
  const materialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  // hauteur du sol sous chaque primitive (le décor épouse le relief)
  const groundYs = useMemo(
    () =>
      landmark.primitives.map((primitive) =>
        getDrift3DGroundY(
          landmark.origin.x + primitive.offset[0],
          landmark.origin.z + primitive.offset[2]
        )
      ),
    [landmark]
  );

  useFrame((_, delta) => {
    if (!vehicleStateRef) {
      return;
    }

    const vehicle = vehicleStateRef.current.position;

    for (let index = 0; index < landmark.primitives.length; index += 1) {
      const primitive = landmark.primitives[index];
      const material = materialRefs.current[index];

      if (!material || primitive.water || primitive.noFade) {
        continue;
      }

      const height = getPrimitiveHeight(primitive) + primitive.offset[1];

      if (height < OCCLUSION_MIN_HEIGHT) {
        continue;
      }

      const worldX = landmark.origin.x + primitive.offset[0];
      const worldZ = landmark.origin.z + primitive.offset[2];
      const south = worldZ - vehicle.z;
      const authoredOpacity = primitive.opacity ?? 1;
      let targetOpacity = authoredOpacity;

      if (
        south > 0.3 &&
        south < OCCLUSION_CAMERA_DEPTH &&
        Math.abs(worldX - vehicle.x) < OCCLUSION_HALF_WIDTH
      ) {
        const sightHeight =
          0.2 +
          (OCCLUSION_CAMERA_HEIGHT - 0.2) * (south / OCCLUSION_CAMERA_DEPTH);

        if (height > sightHeight) {
          targetOpacity = Math.min(authoredOpacity, OCCLUSION_FADED_OPACITY);
        }
      }

      if (Math.abs(material.opacity - targetOpacity) > 0.004) {
        material.opacity +=
          (targetOpacity - material.opacity) * Math.min(1, delta * 6);
        material.transparent =
          primitive.opacity !== undefined || material.opacity < 0.995;
        material.depthWrite =
          primitive.opacity === undefined && material.opacity > 0.6;
      }
    }
  });

  return (
    <group
      position={[landmark.origin.x, 0, landmark.origin.z]}
      aria-hidden="true"
    >
      {landmark.primitives.map((primitive, index) => {
        if (primitive.water) {
          return (
            <WaterPlane
              key={`${landmark.id}-${index}`}
              primitive={primitive}
              groundY={groundYs[index]}
            />
          );
        }

        const height = getPrimitiveHeight(primitive);
        const centerY = groundYs[index] + primitive.offset[1] + height / 2;
        const transparent = primitive.opacity !== undefined;
        const maps = primitive.material
          ? getDriftMaterialMaps(
              primitive.material,
              primitive.textureRepeat?.[0] ?? 1,
              primitive.textureRepeat?.[1] ?? 1
            )
          : null;
        const hasRoofCap =
          primitive.kind === "box" &&
          (primitive.material === "windowsDay" ||
            primitive.material === "windowsNight");

        return (
          <group key={`${landmark.id}-${index}`}>
            <group
              position={[primitive.offset[0], centerY, primitive.offset[2]]}
              rotation={primitive.rotation ?? [0, 0, 0]}
            >
              <mesh castShadow receiveShadow>
                <PrimitiveGeometry primitive={primitive} />
                <meshStandardMaterial
                  ref={(material) => {
                    materialRefs.current[index] = material;
                  }}
                  map={maps?.map ?? undefined}
                  normalMap={maps?.normalMap ?? undefined}
                  normalScale={new THREE.Vector2(0.8, 0.8)}
                  color={primitive.color}
                  emissive={primitive.emissive ?? "#000000"}
                  emissiveIntensity={primitive.emissiveIntensity ?? 0}
                  roughness={primitive.roughness ?? 0.9}
                  transparent={transparent}
                  opacity={primitive.opacity ?? 1}
                  depthWrite={!transparent}
                />
              </mesh>
              {hasRoofCap ? (
                <mesh position={[0, height / 2 + 0.035, 0]} castShadow>
                  <boxGeometry
                    args={[
                      primitive.args[0] + 0.06,
                      0.07,
                      primitive.args[2] + 0.06,
                    ]}
                  />
                  <meshStandardMaterial color="#393c42" roughness={0.92} />
                </mesh>
              ) : null}
            </group>
            {primitive.pointLight ? (
              <pointLight
                position={[
                  primitive.offset[0],
                  groundYs[index] + primitive.pointLight.y,
                  primitive.offset[2],
                ]}
                color={primitive.pointLight.color}
                intensity={primitive.pointLight.intensity}
                distance={primitive.pointLight.distance}
                decay={2}
              />
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
