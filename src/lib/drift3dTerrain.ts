export * from "./drift3dTerrainLegacy";

import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import {
  drift3dEras,
  drift3dThresholdNode,
  drift3dTrackNodes,
} from "@/lib/drift3dTopology";
import * as legacyTopology from "@/lib/drift3dTopologyBase";
import { getDrift3DNodeRadius } from "@/lib/drift3dTopologyBase";
import { getDrift3DTerrainHeight as getLegacyTerrainHeight } from "./drift3dTerrainLegacy";
import { getDrift3DPeninsulaBaseHeight } from "./drift3dPeninsula";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
}

function legacyDetailWeight(distance: number, radius: number) {
  const inner = radius * 1.05;
  const outer = radius * 1.8;

  if (distance <= inner) {
    return 1;
  }

  if (distance >= outer) {
    return 0;
  }

  return 1 - smoothstep01((distance - inner) / (outer - inner));
}

/**
 * Preserve already-authored local production relief as detail modifiers while
 * Fable supplies the new macro geography. Each era is translated only; no
 * local coordinate is scaled.
 */
function getLegacyDetailHeight(x: number, z: number) {
  let detail = 0;

  for (const era of drift3dEras) {
    const legacyEra = legacyTopology.drift3dEraById[era.id];
    const distance = Math.hypot(x - era.center.x, z - era.center.z);
    const weight = legacyDetailWeight(distance, legacyEra.radius);

    if (weight <= 0) {
      continue;
    }

    const legacyX = legacyEra.center.x + (x - era.center.x);
    const legacyZ = legacyEra.center.z + (z - era.center.z);
    const legacyCenterHeight = getLegacyTerrainHeight(
      legacyEra.center.x,
      legacyEra.center.z
    );
    const localDetail =
      getLegacyTerrainHeight(legacyX, legacyZ) - legacyCenterHeight;

    detail += localDetail * weight;
  }

  return detail;
}

function getRawTerrainHeight(x: number, z: number) {
  return getDrift3DPeninsulaBaseHeight(x, z) + getLegacyDetailHeight(x, z);
}

const FLATTEN_INNER = 2.6;
const FLATTEN_OUTER = 6;

type FlattenPad = {
  x: number;
  z: number;
  targetHeight: number;
  outer: number;
};

const flattenPads: FlattenPad[] = [
  ...drift3dTrackNodes.map((node) => ({
    x: node.position.x,
    z: node.position.z,
    targetHeight: getRawTerrainHeight(node.position.x, node.position.z),
    outer: Math.max(FLATTEN_OUTER, getDrift3DNodeRadius(node) * 0.9),
  })),
  {
    x: drift3dThresholdNode.position.x,
    z: drift3dThresholdNode.position.z,
    targetHeight: getRawTerrainHeight(
      drift3dThresholdNode.position.x,
      drift3dThresholdNode.position.z
    ),
    outer: 8,
  },
];

export function getDrift3DTerrainHeight(x: number, z: number): number {
  const raw = getRawTerrainHeight(x, z);
  let weightSum = 0;
  let weightedTarget = 0;

  for (const pad of flattenPads) {
    const distance = Math.hypot(x - pad.x, z - pad.z);

    if (distance >= pad.outer) {
      continue;
    }

    const denominator = Math.max(0.001, pad.outer - FLATTEN_INNER);
    const weight = smoothstep01(
      1 - (distance - FLATTEN_INNER) / denominator
    );
    weightSum += weight;
    weightedTarget += pad.targetHeight * weight;
  }

  if (weightSum <= 0) {
    return raw;
  }

  const blend = Math.min(1, weightSum);

  return raw * (1 - blend) + (weightedTarget / weightSum) * blend;
}

export function getDrift3DGroundY(x: number, z: number): number {
  return DRIFT_3D_FLOOR_Y + getDrift3DTerrainHeight(x, z);
}

export function getDrift3DTerrainNormal(
  x: number,
  z: number
): { x: number; y: number; z: number } {
  const epsilon = 0.35;
  const heightWest = getDrift3DTerrainHeight(x - epsilon, z);
  const heightEast = getDrift3DTerrainHeight(x + epsilon, z);
  const heightNorth = getDrift3DTerrainHeight(x, z - epsilon);
  const heightSouth = getDrift3DTerrainHeight(x, z + epsilon);
  const normalX = (heightWest - heightEast) / (2 * epsilon);
  const normalZ = (heightNorth - heightSouth) / (2 * epsilon);
  const length = Math.hypot(normalX, 1, normalZ);

  return { x: normalX / length, y: 1 / length, z: normalZ / length };
}
