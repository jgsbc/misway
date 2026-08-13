import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_TRANSMISSION_MAX_SPEED,
  getDrift3DTransmissionState,
} from "@/lib/drift3dTransmission";

test("automatic gearbox exposes four progressive forward ratios", () => {
  assert.equal(getDrift3DTransmissionState(0).gear, 1);
  assert.equal(getDrift3DTransmissionState(2.5).gear, 2);
  assert.equal(getDrift3DTransmissionState(5).gear, 3);
  assert.equal(getDrift3DTransmissionState(7.5).gear, 4);
  assert.equal(getDrift3DTransmissionState(-1).gear, -1);
});

test("each upshift drops revs and briefly cuts torque", () => {
  const beforeShift = getDrift3DTransmissionState(2.39);
  const afterShift = getDrift3DTransmissionState(2.41);

  assert.equal(beforeShift.gear, 1);
  assert.equal(afterShift.gear, 2);
  assert.ok(beforeShift.normalizedRevs > afterShift.normalizedRevs);
  assert.ok(afterShift.shiftTorque < beforeShift.shiftTorque);
  assert.ok(afterShift.acceleration < beforeShift.acceleration);
});

test("higher gears trade acceleration for a higher progressive top speed", () => {
  const first = getDrift3DTransmissionState(1.2);
  const fourth = getDrift3DTransmissionState(8.4);

  assert.ok(DRIFT_3D_TRANSMISSION_MAX_SPEED > 6.4);
  assert.ok(first.acceleration > fourth.acceleration);
  assert.ok(fourth.normalizedRevs > 0.24);
});
