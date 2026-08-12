import {
  getDrift3DQualityProfile,
  type Drift3DQualityProfile,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";

export const DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY =
  "(max-width: 900px), (pointer: coarse)";

export type DriftEvolutionPerformanceProfile = Readonly<{
  mode: "mobile" | "desktop";
  qualityTier: Drift3DQualityTier;
  qualityProfile: Drift3DQualityProfile;
  maxDpr: number;
  shadowMapSize: number;
  antialias: true;
  shadows: true;
  secondaryInstancedShadows: boolean;
}>;

const MOBILE_PROFILE: DriftEvolutionPerformanceProfile = Object.freeze({
  mode: "mobile",
  // Evolution keeps the complete world and every identity guarantee. Mobile
  // receives a medium capability budget, never the generic low tier.
  qualityTier: "medium",
  qualityProfile: getDrift3DQualityProfile("medium"),
  maxDpr: 1.15,
  shadowMapSize: 1024,
  antialias: true,
  shadows: true,
  secondaryInstancedShadows: false,
});

const DESKTOP_PROFILE: DriftEvolutionPerformanceProfile = Object.freeze({
  mode: "desktop",
  qualityTier: "high",
  qualityProfile: getDrift3DQualityProfile("high"),
  maxDpr: 1.5,
  shadowMapSize: 2048,
  antialias: true,
  shadows: true,
  secondaryInstancedShadows: true,
});

/**
 * Route-local capability selection for Drift Evolution. The generic quality
 * service remains device-agnostic; the responsive Canvas explicitly chooses
 * between these two identity-preserving render budgets.
 */
export function getDriftEvolutionPerformanceProfile(isMobileContext: boolean) {
  return isMobileContext ? MOBILE_PROFILE : DESKTOP_PROFILE;
}
