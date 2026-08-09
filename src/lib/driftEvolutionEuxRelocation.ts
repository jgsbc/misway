import * as THREE from "three";
import { EUX_GAINENT_LANDMARK_ID } from "@/lib/drift3dEuxGainent";
import { drift3dLandmarks } from "@/lib/drift3dLandmarks";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_EVOLUTION_EUX_GAINENT_TARGET,
  DRIFT_EVOLUTION_FOOLFOULE_TARGET,
} from "@/lib/driftEvolutionTrackPlacementRegistry";

const SCREEN_WIDTH_FACTOR = 0.86;
const SCREEN_HEIGHT_FACTOR = 0.62;
const EPSILON = 0.001;

function getEuxFacadeSize() {
  const landmark = drift3dLandmarks.find(
    (candidate) => candidate.id === EUX_GAINENT_LANDMARK_ID
  );
  const facade = landmark?.primitives[0];

  if (!facade) return null;

  return {
    width: facade.args[0] * SCREEN_WIDTH_FACTOR,
    height: facade.args[1] * SCREEN_HEIGHT_FACTOR,
  };
}

/**
 * Finds the root group owned by EuxGainentLivingScene from its unique semantic
 * screen mesh. No production component is modified merely to expose a ref.
 */
export function findEuxGainentLivingSceneRoot(
  scene: THREE.Object3D
): THREE.Group | null {
  const expectedScreen = getEuxFacadeSize();
  if (!expectedScreen) return null;

  let root: THREE.Group | null = null;

  scene.traverse((object) => {
    if (root || !(object instanceof THREE.Mesh)) return;
    if (!(object.geometry instanceof THREE.PlaneGeometry)) return;

    const material = Array.isArray(object.material) ? null : object.material;
    if (!(material instanceof THREE.MeshBasicMaterial)) return;
    if (material.fog !== false || material.toneMapped !== false) return;

    const width = object.geometry.parameters.width;
    const height = object.geometry.parameters.height;
    if (
      Math.abs(width - expectedScreen.width) > EPSILON ||
      Math.abs(height - expectedScreen.height) > EPSILON
    ) {
      return;
    }

    if (object.parent instanceof THREE.Group) {
      root = object.parent;
    }
  });

  return root;
}

/**
 * The living scene itself remains authored at the former EUX slot (now the
 * Foolfoule target). Translate that complete rendered root to the New Signal
 * target, including the small vertical correction between both terrain points.
 */
export function getEuxGainentEvolutionTranslation() {
  const source = DRIFT_EVOLUTION_FOOLFOULE_TARGET;
  const target = DRIFT_EVOLUTION_EUX_GAINENT_TARGET;
  const sourceGroundY = getDrift3DGroundY(source.x, source.z);
  const targetGroundY = getDrift3DGroundY(target.x, target.z);

  return Object.freeze({
    x: target.x - source.x,
    y: targetGroundY - sourceGroundY,
    z: target.z - source.z,
  });
}
