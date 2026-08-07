import { driftMapConfig } from "@/lib/driftMap";
import type { DriftMapConfig, DriftProp, DriftZoneConfig } from "@/types/drift";
import * as legacyTopology from "./drift3dTopologyBase";
import {
  drift3dThresholdNode,
  drift3dTrackNodes,
} from "./drift3dTopology";
import * as base from "./drift3dBase";
import type {
  Drift3DPoint,
  Drift3DPropTransform,
  Drift3DZoneTransform,
} from "./drift3dBase";

type DriftMapBounds = Pick<DriftMapConfig, "width" | "height">;

const LEGACY_WORLD_WIDTH = 224;
const LEGACY_WORLD_DEPTH = 144;

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function legacyMapPoint(
  point: { x: number; y: number },
  bounds: DriftMapBounds,
  y = 0
): Drift3DPoint {
  return {
    x: (point.x / bounds.width - 0.5) * LEGACY_WORLD_WIDTH,
    y,
    z: (point.y / bounds.height - 0.5) * LEGACY_WORLD_DEPTH,
  };
}

function legacyAnchorForZone(zone: DriftZoneConfig) {
  if (zone.id === legacyTopology.drift3dThresholdNode.driftZoneId) {
    return legacyTopology.drift3dThresholdNode.position;
  }

  if (zone.trackSlug) {
    return (
      legacyTopology.drift3dTrackNodes.find(
        (node) => node.trackSlug === zone.trackSlug
      )?.position ?? null
    );
  }

  return null;
}

function currentAnchorForZone(zone: DriftZoneConfig) {
  if (zone.id === drift3dThresholdNode.driftZoneId) {
    return drift3dThresholdNode.position;
  }

  if (zone.trackSlug) {
    return (
      drift3dTrackNodes.find((node) => node.trackSlug === zone.trackSlug)
        ?.position ?? null
    );
  }

  return null;
}

function translatedZonePosition(
  zone: DriftZoneConfig,
  bounds: DriftMapBounds,
  y: number
) {
  const legacyZonePosition = legacyMapPoint(zone, bounds, y);
  const legacyAnchor = legacyAnchorForZone(zone);
  const currentAnchor = currentAnchorForZone(zone);

  if (!legacyAnchor || !currentAnchor) {
    return legacyZonePosition;
  }

  return {
    x: currentAnchor.x + (legacyZonePosition.x - legacyAnchor.x),
    y,
    z: currentAnchor.z + (legacyZonePosition.z - legacyAnchor.z),
  };
}

/**
 * Preserve the old 2D-zone micro-layout as a rigid local cluster around its
 * canonical track node. The peninsula changes macro position, never object
 * size or within-zone spacing.
 */
export function getDrift3DZoneTransform(
  zone: DriftZoneConfig,
  bounds: DriftMapBounds
): Drift3DZoneTransform {
  const legacyShape = base.getDrift3DZoneTransform(zone, bounds);

  return {
    ...legacyShape,
    position: translatedZonePosition(zone, bounds, legacyShape.position.y),
  };
}

function findParentZone(prop: DriftProp) {
  return (
    driftMapConfig.zones.find((zone) =>
      (zone.props ?? []).some((candidate) => candidate.id === prop.id)
    ) ?? null
  );
}

export function getDrift3DPropTransform(
  prop: DriftProp,
  bounds: DriftMapBounds
): Drift3DPropTransform {
  const parentZone = findParentZone(prop);

  if (!parentZone) {
    return {
      position: legacyMapPoint(prop, bounds, 0.14),
      rotationY: degreesToRadians(prop.rotation ?? 0),
    };
  }

  const zoneTransform = getDrift3DZoneTransform(parentZone, bounds);
  const legacyZonePosition = legacyMapPoint(parentZone, bounds, 0.14);
  const legacyPropPosition = legacyMapPoint(prop, bounds, 0.14);

  return {
    position: {
      x:
        zoneTransform.position.x +
        (legacyPropPosition.x - legacyZonePosition.x),
      y: 0.14,
      z:
        zoneTransform.position.z +
        (legacyPropPosition.z - legacyZonePosition.z),
    },
    rotationY: degreesToRadians(prop.rotation ?? 0),
  };
}
