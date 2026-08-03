import {
  getDrift3DQualityProfile,
  scaleDrift3DQualityCount,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";

/**
 * DRIFT-IV-PRE-40 — per-macro-world Quality-Tier population counts. Pure,
 * wraps the existing SYS-40 profile/scale helpers exclusively — never a
 * second quality authority. Extracted so monotonic scaling can be unit
 * tested directly, rather than only inline inside each greybox component.
 */

const BASE_TOWER_COUNT = 16;
const MIN_TOWER_COUNT = 6;
const BASE_CROWD_COUNT = 40;
const MIN_CROWD_COUNT = 8;
const BASE_TRAFFIC_COUNT = 4;
const MIN_TRAFFIC_COUNT = 1;

export type Drift3DBirthYardCounts = Readonly<{
  towerCount: number;
  crowdCount: number;
  trafficCount: number;
}>;

export function getDrift3DBirthYardCounts(
  tier: Drift3DQualityTier
): Drift3DBirthYardCounts {
  const profile = getDrift3DQualityProfile(tier);

  return {
    towerCount: scaleDrift3DQualityCount(
      BASE_TOWER_COUNT,
      profile.capabilities.backgroundDetailScale,
      MIN_TOWER_COUNT
    ),
    crowdCount: scaleDrift3DQualityCount(
      BASE_CROWD_COUNT,
      profile.capabilities.populationScale,
      MIN_CROWD_COUNT
    ),
    trafficCount: scaleDrift3DQualityCount(
      BASE_TRAFFIC_COUNT,
      profile.capabilities.populationScale,
      MIN_TRAFFIC_COUNT
    ),
  };
}

const BASE_CAIRN_COUNT = 14;
const MIN_CAIRN_COUNT = 5;

export type Drift3DOlderShadowsCounts = Readonly<{ cairnCount: number }>;

export function getDrift3DOlderShadowsCounts(
  tier: Drift3DQualityTier
): Drift3DOlderShadowsCounts {
  const profile = getDrift3DQualityProfile(tier);

  return {
    cairnCount: scaleDrift3DQualityCount(
      BASE_CAIRN_COUNT,
      profile.capabilities.scatterScale,
      MIN_CAIRN_COUNT
    ),
  };
}

const BASE_HOUSE_COUNT = 12;
const MIN_HOUSE_COUNT = 4;

export type Drift3DVegetativeFieldCounts = Readonly<{ houseCount: number }>;

export function getDrift3DVegetativeFieldCounts(
  tier: Drift3DQualityTier
): Drift3DVegetativeFieldCounts {
  const profile = getDrift3DQualityProfile(tier);

  return {
    houseCount: scaleDrift3DQualityCount(
      BASE_HOUSE_COUNT,
      profile.capabilities.backgroundDetailScale,
      MIN_HOUSE_COUNT
    ),
  };
}
