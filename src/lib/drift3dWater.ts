import { DRIFT_3D_SEA_LEVEL } from "./drift3dPeninsula";
import { getDrift3DTerrainHeight } from "./drift3dTerrain";

export const DRIFT_3D_WATER_EPSILON = 0.04;

/**
 * Water is derived from geography: a point is wet only when the canonical
 * terrain sits below the single sea-level authority.
 */
export function getDrift3DWaterDepth(x: number, z: number) {
  return Math.max(0, DRIFT_3D_SEA_LEVEL - getDrift3DTerrainHeight(x, z));
}

export function isDrift3DWater(x: number, z: number) {
  return getDrift3DWaterDepth(x, z) > DRIFT_3D_WATER_EPSILON;
}
