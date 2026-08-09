export type Drift3DVehicleHeroProfile = Readonly<{
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  wheelbaseMeters: number;
  wheelRadiusMeters: number;
  groundClearanceMeters: number;
  bodyColor: string;
  roofColor: string;
  traits: Readonly<{
    boxySafariBody: true;
    highGroundClearance: true;
    roofRack: true;
    rearSpareWheel: true;
    roundHeadlights: true;
    snorkel: true;
    bullBar: true;
  }>;
}>;

/**
 * DRIFT Vehicle Hero Study — visual target only.
 *
 * The PRE-10 masterframes consistently show the same compact sand/khaki
 * safari 4x4: upright/boxy, high on its wheels, roof rack, expedition cargo
 * and a rear-mounted spare. These dimensions are a realistic metric study,
 * not yet a change to the protected production vehicle physics envelope.
 */
export const DRIFT_3D_VEHICLE_HERO_PROFILE: Drift3DVehicleHeroProfile =
  Object.freeze({
    lengthMeters: 4.15,
    widthMeters: 1.82,
    heightMeters: 1.98,
    wheelbaseMeters: 2.55,
    wheelRadiusMeters: 0.39,
    groundClearanceMeters: 0.28,
    bodyColor: "#a88f61",
    roofColor: "#d8d0ba",
    traits: Object.freeze({
      boxySafariBody: true,
      highGroundClearance: true,
      roofRack: true,
      rearSpareWheel: true,
      roundHeadlights: true,
      snorkel: true,
      bullBar: true,
    }),
  });

export type Drift3DVehicleHeroStudyIssue = Readonly<{
  field: string;
  message: string;
}>;

export function getDrift3DVehicleHeroStudyIssues(
  profile: Drift3DVehicleHeroProfile = DRIFT_3D_VEHICLE_HERO_PROFILE
): readonly Drift3DVehicleHeroStudyIssue[] {
  const issues: Drift3DVehicleHeroStudyIssue[] = [];

  if (profile.lengthMeters < 3.8 || profile.lengthMeters > 4.6) {
    issues.push({
      field: "lengthMeters",
      message: "Hero safari 4x4 length must stay in a compact realistic range.",
    });
  }

  if (profile.widthMeters < 1.7 || profile.widthMeters > 2.0) {
    issues.push({
      field: "widthMeters",
      message: "Hero safari 4x4 width must remain realistic.",
    });
  }

  if (profile.heightMeters < 1.75 || profile.heightMeters > 2.2) {
    issues.push({
      field: "heightMeters",
      message: "Hero safari 4x4 must retain an upright expedition silhouette.",
    });
  }

  if (
    profile.wheelbaseMeters <= 0 ||
    profile.wheelbaseMeters >= profile.lengthMeters * 0.75
  ) {
    issues.push({
      field: "wheelbaseMeters",
      message: "Wheelbase must remain positive and compact relative to body length.",
    });
  }

  if (profile.wheelRadiusMeters < 0.33 || profile.wheelRadiusMeters > 0.48) {
    issues.push({
      field: "wheelRadiusMeters",
      message: "Wheel radius must preserve the high-clearance off-road stance.",
    });
  }

  if (
    profile.groundClearanceMeters < 0.22 ||
    profile.groundClearanceMeters > 0.4
  ) {
    issues.push({
      field: "groundClearanceMeters",
      message: "Ground clearance must read as credible off-road clearance.",
    });
  }

  const requiredTraits = Object.entries(profile.traits);
  for (const [trait, enabled] of requiredTraits) {
    if (enabled !== true) {
      issues.push({
        field: `traits.${trait}`,
        message: `Masterframe vehicle trait ${trait} must be preserved.`,
      });
    }
  }

  return issues;
}
