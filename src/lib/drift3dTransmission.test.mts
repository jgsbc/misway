import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_FORWARD_GEARS,
  DRIFT_3D_TRANSMISSION_MAX_SPEED,
  getDrift3DTransmissionState,
} from "@/lib/drift3dTransmission";

test("automatic gearbox exposes the four requested speed ranges", () => {
  assert.deepEqual(
    DRIFT_3D_FORWARD_GEARS.map(({ gear, minSpeed, maxSpeed }) => ({
      gear,
      minSpeed,
      maxSpeed,
    })),
    [
      { gear: 1, minSpeed: 0, maxSpeed: 2 },
      { gear: 2, minSpeed: 2, maxSpeed: 5 },
      { gear: 3, minSpeed: 5, maxSpeed: 9 },
      { gear: 4, minSpeed: 9, maxSpeed: 15 },
    ]
  );
  assert.equal(getDrift3DTransmissionState(0).gear, 1);
  assert.equal(getDrift3DTransmissionState(1.99).gear, 1);
  assert.equal(getDrift3DTransmissionState(2).gear, 2);
  assert.equal(getDrift3DTransmissionState(4.99).gear, 2);
  assert.equal(getDrift3DTransmissionState(5).gear, 3);
  assert.equal(getDrift3DTransmissionState(8.99).gear, 3);
  assert.equal(getDrift3DTransmissionState(9).gear, 4);
  assert.equal(getDrift3DTransmissionState(15).gear, 4);
  assert.equal(getDrift3DTransmissionState(-1).gear, -1);
});

test("each upshift drops revs and briefly cuts torque", () => {
  const beforeShift = getDrift3DTransmissionState(1.99);
  const afterShift = getDrift3DTransmissionState(2.01);

  assert.equal(beforeShift.gear, 1);
  assert.equal(afterShift.gear, 2);
  assert.ok(beforeShift.normalizedRevs > afterShift.normalizedRevs);
  assert.ok(afterShift.shiftTorque < beforeShift.shiftTorque);
  assert.ok(afterShift.acceleration < beforeShift.acceleration);
});

test("higher gears trade acceleration for a higher progressive top speed", () => {
  const first = getDrift3DTransmissionState(1);
  const fourth = getDrift3DTransmissionState(12);

  assert.equal(DRIFT_3D_TRANSMISSION_MAX_SPEED, 15);
  assert.ok(first.acceleration > fourth.acceleration);
  assert.ok(fourth.normalizedRevs > 0.24);
});
