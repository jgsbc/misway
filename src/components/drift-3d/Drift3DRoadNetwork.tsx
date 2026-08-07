"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import { DRIFT_3D_ROUTES, type Drift3DRoute } from "@/lib/drift3dRoutes";

function buildRouteGeometry(route: Drift3DRoute) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const half = route.halfWidth;
  let travelled = 0;

  for (let index = 0; index < route.points.length; index += 1) {
    const [x, y, z] = route.points[index];
    const previous = route.points[Math.max(0, index - 1)];
    const next = route.points[Math.min(route.points.length - 1, index + 1)];
    const dx = next[0] - previous[0];
    const dz = next[2] - previous[2];
    const length = Math.hypot(dx, dz) || 1;
    const normalX = -dz / length;
    const normalZ = dx / length;

    if (index > 0) {
      travelled += Math.hypot(
        x - route.points[index - 1][0],
        z - route.points[index - 1][2]
      );
    }

    const roadY = DRIFT_3D_FLOOR_Y + y + 0.055;
    positions.push(x - normalX * half, roadY, z - normalZ * half);
    positions.push(x + normalX * half, roadY, z + normalZ * half);
    uvs.push(0, travelled / 8, 1, travelled / 8);

    if (index > 0) {
      const a = (index - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function Drift3DRouteRibbon({ route }: { route: Drift3DRoute }) {
  const geometry = useMemo(() => buildRouteGeometry(route), [route]);
  const maps = useMemo(() => getDriftMaterialMaps("concrete", 2, 30), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={maps.map ?? undefined}
        normalMap={maps.normalMap ?? undefined}
        color="#5c5a53"
        roughness={0.94}
      />
    </mesh>
  );
}

/** Five proven Fable routes, rendered by the production runtime. */
export default function Drift3DRoadNetwork() {
  return (
    <group>
      {DRIFT_3D_ROUTES.map((route) => (
        <Drift3DRouteRibbon key={route.id} route={route} />
      ))}
    </group>
  );
}
