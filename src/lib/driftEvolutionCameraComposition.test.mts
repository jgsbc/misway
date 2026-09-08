import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DChaseCameraRig } from "./drift3d";
import { getDrift3DGroundY } from "./drift3dTerrain";
import { DRIFT_3D_VEHICLE_GROUND_CLEARANCE } from "./drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryStartPosition,
} from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_CAMERA_MAX_VERTICAL_FOV,
  DRIFT_EVOLUTION_CAMERA_MIN_VERTICAL_FOV,
  DRIFT_EVOLUTION_ENTRY_CAMERA_BACK_WALL_INSET,
  getDriftEvolutionAdaptiveCameraRig,
  getDriftEvolutionCameraVerticalFov,
} from "./driftEvolutionSpatial";

/*
 * Composition invariants for the DRIFT camera.
 *
 * These deliberately assert relationships, not today's numbers: any rig that
 * keeps the horizon inside the frame, keeps the 4x4 uncropped, keeps the
 * enclosed camera inside the tunnel and does not snap at the cave mouth is
 * allowed to replace the current constants.
 */

const DEG = Math.PI / 180;

/** Mounted Defender bounding box, measured on the runtime GLB. */
const VEHICLE_HEIGHT = 1.9;
const VEHICLE_CENTRE_ABOVE_GROUND = 0.85;

const PROFILES = [
  { name: "desktop 16:9", aspect: 1280 / 720 },
  { name: "mobile portrait", aspect: 390 / 844 },
  { name: "mobile landscape", aspect: 844 / 390 },
] as const;

const OPEN_WORLD_POSES = [
  { name: "zeeland", x: -76, z: 20, heading: 0 },
  { name: "jazzypling", x: -70.8, z: 17, heading: Math.PI },
  { name: "older shadows", x: -46, z: -20, heading: Math.PI },
  { name: "east plain", x: 40, z: 40, heading: 0.4 },
];

function vehicleAt(x: number, z: number) {
  return { x, y: getDrift3DGroundY(x, z) + DRIFT_3D_VEHICLE_GROUND_CLEARANCE, z };
}

function framing(
  position: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  vehicle: { x: number; y: number; z: number },
  verticalFov: number
) {
  const pitch = Math.atan2(
    position.y - target.y,
    Math.hypot(target.x - position.x, target.z - position.z)
  );
  const halfFov = (verticalFov / 2) * DEG;
  const vehicleCentreY = vehicle.y + VEHICLE_CENTRE_ABOVE_GROUND;
  const flat = Math.hypot(position.x - vehicle.x, position.z - vehicle.z);
  const distance = Math.hypot(flat, position.y - vehicleCentreY);
  const vehicleBelowAxis = Math.atan2(position.y - vehicleCentreY, flat) - pitch;
  const vehicleHalfAngle = Math.atan(VEHICLE_HEIGHT / 2 / distance);

  return {
    pitch,
    halfFov,
    /** < 1 means the horizon line falls inside the rendered frame. */
    horizonNdcY: Math.tan(pitch) / Math.tan(halfFov),
    /** < 1 means the whole vehicle fits in the vertical field. */
    vehicleExtent: (Math.abs(vehicleBelowAxis) + vehicleHalfAngle) / halfFov,
    vehicleHeightShare: (VEHICLE_HEIGHT / distance) / (2 * Math.tan(halfFov)),
  };
}

test("vertical fov stays inside its declared bounds for any aspect, including nonsense input", () => {
  for (const aspect of [0.2, 0.462, 1, 1.778, 2.164, 8, 0, -3, Number.NaN, Number.POSITIVE_INFINITY]) {
    const fov = getDriftEvolutionCameraVerticalFov(aspect);
    assert.ok(Number.isFinite(fov), `aspect ${aspect} produced ${fov}`);
    assert.ok(fov >= DRIFT_EVOLUTION_CAMERA_MIN_VERTICAL_FOV);
    assert.ok(fov <= DRIFT_EVOLUTION_CAMERA_MAX_VERTICAL_FOV);
  }
});

test("wide viewports keep the narrowest vertical fov, so desktop and landscape cannot regress", () => {
  for (const aspect of [16 / 9, 1280 / 720, 844 / 390, 21 / 9, 3]) {
    assert.equal(
      getDriftEvolutionCameraVerticalFov(aspect),
      DRIFT_EVOLUTION_CAMERA_MIN_VERTICAL_FOV,
      `aspect ${aspect.toFixed(3)} must not widen the vertical field`
    );
  }
});

test("a portrait frame keeps a usable horizontal field instead of a slit", () => {
  const aspect = 390 / 844;
  const fov = getDriftEvolutionCameraVerticalFov(aspect);
  const horizontal =
    (2 * Math.atan(Math.tan((fov / 2) * DEG) * aspect)) / DEG;
  const shippedHorizontal =
    (2 *
      Math.atan(
        Math.tan((DRIFT_EVOLUTION_CAMERA_MIN_VERTICAL_FOV / 2) * DEG) * aspect
      )) /
    DEG;

  assert.ok(fov > DRIFT_EVOLUTION_CAMERA_MIN_VERTICAL_FOV);
  assert.ok(horizontal > shippedHorizontal * 1.4);
  assert.ok(horizontal >= 20, `portrait horizontal field is only ${horizontal.toFixed(1)} deg`);
});

test("vertical fov never widens as the viewport gets wider", () => {
  let previous = Number.POSITIVE_INFINITY;
  for (let aspect = 0.3; aspect <= 3; aspect += 0.05) {
    const fov = getDriftEvolutionCameraVerticalFov(aspect);
    assert.ok(fov <= previous + 1e-9, `fov grew at aspect ${aspect.toFixed(2)}`);
    previous = fov;
  }
});

test("the open-world chase keeps the horizon inside the frame on every profile", () => {
  for (const pose of OPEN_WORLD_POSES) {
    const vehicle = vehicleAt(pose.x, pose.z);
    const rig = getDriftEvolutionAdaptiveCameraRig(vehicle, pose.heading, 1, 1);

    assert.equal(rig.enclosure, 0);

    for (const profile of PROFILES) {
      const fov = getDriftEvolutionCameraVerticalFov(profile.aspect);
      const f = framing(rig.position, rig.target, vehicle, fov);
      assert.ok(
        f.horizonNdcY < 1,
        `${pose.name} / ${profile.name}: horizon sits at ${f.horizonNdcY.toFixed(2)} of the half-frame, outside the image`
      );
    }
  }
});

test("the 4x4 is never cropped by the frame, in the open world or along the cave", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const poses = [
    ...OPEN_WORLD_POSES.map((p) => ({ name: p.name, x: p.x, z: p.z, heading: p.heading })),
  ];
  for (let x = cave.spawnX; x <= cave.exitX; x += 0.5) {
    poses.push({ name: `cave x=${x.toFixed(1)}`, x, z: cave.centerZ, heading: Math.PI / 2 });
  }

  for (const pose of poses) {
    const vehicle = vehicleAt(pose.x, pose.z);
    const rig = getDriftEvolutionAdaptiveCameraRig(vehicle, pose.heading, 1, 1);
    for (const profile of PROFILES) {
      const fov = getDriftEvolutionCameraVerticalFov(profile.aspect);
      const f = framing(rig.position, rig.target, vehicle, fov);
      assert.ok(
        f.vehicleExtent < 1,
        `${pose.name} / ${profile.name}: the 4x4 overflows the frame (${f.vehicleExtent.toFixed(2)} of the half-field)`
      );
    }
  }
});

test("the enclosed camera stays inside the cave volume for the whole tunnel", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;

  for (let x = cave.spawnX; x <= cave.mouthX; x += 0.25) {
    const vehicle = vehicleAt(x, cave.centerZ);
    const rig = getDriftEvolutionAdaptiveCameraRig(vehicle, Math.PI / 2, 1, 1);
    const floor = getDrift3DGroundY(rig.position.x, rig.position.z);

    assert.ok(
      rig.position.x >= cave.startX + DRIFT_EVOLUTION_ENTRY_CAMERA_BACK_WALL_INSET - 1e-6,
      `camera reversed through the rock back wall at x=${x.toFixed(2)}`
    );
    assert.ok(
      rig.position.y - floor >= 0.9,
      `camera sank to ${(rig.position.y - floor).toFixed(2)}m above the cave floor at x=${x.toFixed(2)}`
    );
    assert.ok(
      floor + cave.apexHeight - rig.position.y >= 0.6,
      `camera pushed into the cave roof at x=${x.toFixed(2)}`
    );
  }
});

test("the spawn camera takes the standoff the cave physically offers", () => {
  const vehicle = getDriftEvolutionEntryStartPosition();
  const rig = getDriftEvolutionAdaptiveCameraRig(vehicle, Math.PI / 2, 1, 1);
  const available =
    vehicle.x -
    (DRIFT_EVOLUTION_ENTRY_CAVE.startX + DRIFT_EVOLUTION_ENTRY_CAMERA_BACK_WALL_INSET);
  const standoff = Math.hypot(
    rig.position.x - vehicle.x,
    rig.position.z - vehicle.z
  );

  assert.ok(rig.enclosure > 0.95);
  assert.ok(
    standoff >= available * 0.95,
    `spawn standoff ${standoff.toFixed(2)}m of the ${available.toFixed(2)}m available`
  );
});

test("the cave-mouth transition does not snap", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const step = 0.05;
  let previous: { x: number; y: number; z: number } | null = null;
  let worst = 0;
  let worstX = 0;

  for (let x = cave.mouthX - 6; x <= cave.exitX + 6; x += step) {
    const vehicle = vehicleAt(x, cave.centerZ);
    const rig = getDriftEvolutionAdaptiveCameraRig(vehicle, Math.PI / 2, 1, 1);
    if (previous) {
      const moved = Math.hypot(
        rig.position.x - previous.x,
        rig.position.y - previous.y,
        rig.position.z - previous.z
      );
      if (moved > worst) {
        worst = moved;
        worstX = x;
      }
    }
    previous = { ...rig.position };
  }

  assert.ok(
    worst < step * 30,
    `camera jumped ${worst.toFixed(2)}m for ${step}m of travel at x=${worstX.toFixed(2)}`
  );
});

test("the enclosed camera never stands west of the cave floor it drives on", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  // CaveGroundRibbon lays the drivable floor from `startX + 0.25` eastward.
  const floorWesternEdge = cave.startX + 0.25;

  for (let x = cave.spawnX; x <= cave.mouthX; x += 0.25) {
    const vehicle = vehicleAt(x, cave.centerZ);
    const rig = getDriftEvolutionAdaptiveCameraRig(vehicle, Math.PI / 2, 1, 1);

    assert.ok(
      rig.position.x >= floorWesternEdge - 1e-6,
      `camera stood ${(floorWesternEdge - rig.position.x).toFixed(3)}m past the western edge of the cave floor at x=${x.toFixed(2)}`
    );
  }
});
