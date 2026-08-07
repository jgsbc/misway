export * from "./drift3dScatterBase";

import * as base from "./drift3dScatterBase";
import { getDrift3DRouteField } from "./drift3dRoutes";
import type {
  Drift3DScatterInstance,
  Drift3DScatterKind,
} from "./drift3dScatterBase";
import type { Drift3DVehicleCollider } from "./drift3dVehiclePhysics";

const ROUTE_CLEARANCE = 2;

let cachedInstances: Record<
  Drift3DScatterKind,
  Drift3DScatterInstance[]
> | null = null;
let cachedColliders: Drift3DVehicleCollider[] | null = null;

function clearsRoute(x: number, z: number) {
  return getDrift3DRouteField(x, z).distance > ROUTE_CLEARANCE;
}

/**
 * Preserve the existing deterministic scatter, but never let an old scatter
 * rule place rendered or physical clutter directly on the recovered road
 * network. Population migration remains a later, separate concern.
 */
export function getDrift3DScatterInstances() {
  if (!cachedInstances) {
    const source = base.getDrift3DScatterInstances();
    const filtered = {} as Record<
      Drift3DScatterKind,
      Drift3DScatterInstance[]
    >;

    for (const kind of Object.keys(source) as Drift3DScatterKind[]) {
      filtered[kind] = source[kind].filter((instance) =>
        clearsRoute(instance.x, instance.z)
      );
    }

    cachedInstances = filtered;
  }

  return cachedInstances;
}

export function getDrift3DScatterColliders(): Drift3DVehicleCollider[] {
  if (!cachedColliders) {
    cachedColliders = base
      .getDrift3DScatterColliders()
      .filter((collider) => clearsRoute(collider.x, collider.z));
  }

  return cachedColliders;
}
