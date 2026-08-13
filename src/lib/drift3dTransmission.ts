export type Drift3DVehicleGear = -1 | 1 | 2 | 3 | 4;

export type Drift3DTransmissionState = {
  gear: Drift3DVehicleGear;
  normalizedRevs: number;
  acceleration: number;
  shiftTorque: number;
};

type ForwardGearSpec = {
  gear: Exclude<Drift3DVehicleGear, -1>;
  minSpeed: number;
  maxSpeed: number;
  acceleration: number;
};

export const DRIFT_3D_TRANSMISSION_MAX_SPEED = 9.6;

export const DRIFT_3D_FORWARD_GEARS = Object.freeze([
  { gear: 1, minSpeed: 0, maxSpeed: 2.4, acceleration: 3.8 },
  { gear: 2, minSpeed: 2.4, maxSpeed: 4.8, acceleration: 3.1 },
  { gear: 3, minSpeed: 4.8, maxSpeed: 7.2, acceleration: 2.4 },
  { gear: 4, minSpeed: 7.2, maxSpeed: 9.6, acceleration: 1.8 },
] as const satisfies readonly ForwardGearSpec[]);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Automatic four-speed gearbox telemetry. Each upshift briefly cuts torque
 * and drops engine revs before the next ratio pulls toward a higher top speed.
 */
export function getDrift3DTransmissionState(
  speed: number,
  speedScale = 1
): Drift3DTransmissionState {
  const scale = clamp(speedScale, 0.25, 1.5);

  if (speed < -0.04) {
    const reverseProgress = clamp(Math.abs(speed) / (3.1 * scale), 0, 1);
    return {
      gear: -1,
      normalizedRevs: 0.28 + reverseProgress * 0.72,
      acceleration: 2.7 * scale,
      shiftTorque: 1,
    };
  }

  const forwardSpeed = Math.max(0, speed);
  const gearSpec =
    DRIFT_3D_FORWARD_GEARS.find(
      (candidate) => forwardSpeed < candidate.maxSpeed * scale
    ) ?? DRIFT_3D_FORWARD_GEARS[DRIFT_3D_FORWARD_GEARS.length - 1];
  const minSpeed = gearSpec.minSpeed * scale;
  const maxSpeed = gearSpec.maxSpeed * scale;
  const gearProgress = clamp(
    (forwardSpeed - minSpeed) / Math.max(maxSpeed - minSpeed, 0.001),
    0,
    1
  );
  const shiftTorque =
    gearSpec.gear === 1 ? 1 : 0.34 + smoothstep(gearProgress / 0.16) * 0.66;

  return {
    gear: gearSpec.gear,
    normalizedRevs: 0.24 + gearProgress * 0.76,
    acceleration: gearSpec.acceleration * scale * shiftTorque,
    shiftTorque,
  };
}
