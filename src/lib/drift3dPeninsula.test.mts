import assert from "node:assert/strict";
import test from "node:test";
import { driftMapConfig } from "@/lib/driftMap";
import {
  getDrift3DPropTransform,
  getDrift3DZoneTransform,
} from "@/lib/drift3d";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dEraById,
  drift3dThresholdNode,
  drift3dTrackNodes,
  validateDrift3DTopology,
} from "@/lib/drift3dTopology";
import * as legacyTopology from "@/lib/drift3dTopologyBase";
import {
  DRIFT_3D_PENINSULA_BOUNDS,
  DRIFT_3D_PENINSULA_REGIONS,
  DRIFT_3D_SEA_LEVEL,
  getDrift3DPeninsulaBaseHeight,
} from "@/lib/drift3dPeninsula";
import { getDrift3DTerrainHeight } from "@/lib/drift3dTerrain";

test("peninsula uses metric 710m bounds and validates topology", () => {
  assert.equal(DRIFT_3D_TOPOLOGY_WORLD_WIDTH, 710);
  assert.equal(DRIFT_3D_TOPOLOGY_WORLD_DEPTH, 710);
  assert.deepEqual(DRIFT_3D_PENINSULA_BOUNDS, {
    minX: -355,
    maxX: 355,
    minZ: -355,
    maxZ: 355,
  });

  const validation = validateDrift3DTopology();
  assert.equal(validation.ok, true, validation.issues.join("\n"));
  assert.ok(drift3dThresholdNode.position.x >= -355);
  assert.ok(drift3dThresholdNode.position.z >= -355);
});

test("every track keeps its exact local era offset: translation only, no scale", () => {
  for (const node of drift3dTrackNodes) {
    const legacyNode = legacyTopology.drift3dTrackNodeBySlug[node.trackSlug];
    const legacyEra = legacyTopology.drift3dEraById[node.eraId];
    const currentEra = drift3dEraById[node.eraId];

    assert.equal(
      node.position.x - currentEra.center.x,
      legacyNode.position.x - legacyEra.center.x,
      `${node.trackSlug}: x offset changed`
    );
    assert.equal(
      node.position.z - currentEra.center.z,
      legacyNode.position.z - legacyEra.center.z,
      `${node.trackSlug}: z offset changed`
    );
  }
});

test("recovered peninsula has a submerged central bay and elevated massif", () => {
  const bay = DRIFT_3D_PENINSULA_REGIONS.find(
    (region) => region.id === "central-bay"
  );
  const port = DRIFT_3D_PENINSULA_REGIONS.find(
    (region) => region.id === "birth-yard"
  );
  const massif = DRIFT_3D_PENINSULA_REGIONS.find(
    (region) => region.id === "os-massif"
  );

  assert.ok(bay && port && massif);

  const bayHeight = getDrift3DPeninsulaBaseHeight(bay.x, bay.z);
  const portHeight = getDrift3DPeninsulaBaseHeight(port.x, port.z);
  const massifHeight = getDrift3DPeninsulaBaseHeight(massif.x, massif.z);

  assert.ok(bayHeight < DRIFT_3D_SEA_LEVEL, `bay height=${bayHeight}`);
  assert.ok(portHeight > DRIFT_3D_SEA_LEVEL, `port height=${portHeight}`);
  assert.ok(
    massifHeight > portHeight + 20,
    `massif=${massifHeight}, port=${portHeight}`
  );
});

test("terrain generation is finite and deterministic across the world", () => {
  for (let x = -320; x <= 320; x += 80) {
    for (let z = -320; z <= 320; z += 80) {
      const first = getDrift3DTerrainHeight(x, z);
      const second = getDrift3DTerrainHeight(x, z);

      assert.ok(Number.isFinite(first), `non-finite terrain at ${x},${z}`);
      assert.equal(first, second, `non-deterministic terrain at ${x},${z}`);
    }
  }
});

test("legacy 2D props keep their local metric spacing around relocated zones", () => {
  const bounds = {
    width: driftMapConfig.width,
    height: driftMapConfig.height,
  };

  for (const zone of driftMapConfig.zones) {
    const zoneTransform = getDrift3DZoneTransform(zone, bounds);

    for (const prop of zone.props ?? []) {
      const propTransform = getDrift3DPropTransform(prop, bounds);
      const expectedDx = ((prop.x - zone.x) / bounds.width) * 224;
      const expectedDz = ((prop.y - zone.y) / bounds.height) * 144;

      assert.ok(
        Math.abs(
          propTransform.position.x - zoneTransform.position.x - expectedDx
        ) < 1e-9,
        `${prop.id}: x spacing changed`
      );
      assert.ok(
        Math.abs(
          propTransform.position.z - zoneTransform.position.z - expectedDz
        ) < 1e-9,
        `${prop.id}: z spacing changed`
      );
    }
  }
});
