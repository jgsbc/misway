import * as THREE from "three";
import { DRIFT_SAFARI_110_WHEEL_PIVOT_NAMES } from "./drift3dSafari110FinalGeometry";

/**
 * Imperative Three.js runtime mutation kept outside React's render/effect
 * model. The vehicle visual is authored as an Object3D scene graph, so wheel
 * roll belongs to that scene graph rather than React state.
 */
export function rotateDrift3DSafari110Wheels(
  root: THREE.Object3D,
  deltaAngle: number
) {
  for (const name of DRIFT_SAFARI_110_WHEEL_PIVOT_NAMES) {
    const wheel = root.getObjectByName(name);
    if (wheel) wheel.rotation.x += deltaAngle;
  }
}
