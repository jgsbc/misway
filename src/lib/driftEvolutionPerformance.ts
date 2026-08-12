import {
  getDrift3DQualityProfile,
  type Drift3DQualityProfile,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";

export const DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY =
  "(max-width: 900px), (pointer: coarse)";

export type DriftEvolutionSceneProximityIdentity = Readonly<{
  nearestNode: Readonly<{ id: string }> | null;
  activeNode: Readonly<{ id: string }> | null;
  nearestEra: Readonly<{ id: string }> | null;
  activeEra: Readonly<{ id: string }> | null;
  isInside: boolean;
}>;

export type DriftEvolutionPerformanceProfile = Readonly<{
  mode: "mobile" | "desktop";
  qualityTier: Drift3DQualityTier;
  qualityProfile: Drift3DQualityProfile;
  maxDpr: number;
  shadowMapSize: number;
  shadowUpdateIntervalMs: number;
  proximityRefreshIntervalMs: number;
  antialias: boolean;
  alpha: boolean;
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
  // Keep the same dynamic shadows, but refresh their expensive depth pass at
  // 15 Hz. Camera/vehicle/world rendering remains continuous.
  shadowUpdateIntervalMs: 1000 / 15,
  // Proximity drives text and discrete nearest/active states. Updating it at
  // 10 Hz keeps the HUD responsive without reconciling the complete R3F tree
  // on every few centimetres of vehicle motion.
  proximityRefreshIntervalMs: 100,
  antialias: false,
  // The scene always paints an opaque background; an alpha framebuffer only
  // adds a compositing surface on mobile Safari.
  alpha: false,
  shadows: true,
  secondaryInstancedShadows: false,
});

const DESKTOP_PROFILE: DriftEvolutionPerformanceProfile = Object.freeze({
  mode: "desktop",
  qualityTier: "high",
  qualityProfile: getDrift3DQualityProfile("high"),
  maxDpr: 1.5,
  shadowMapSize: 2048,
  shadowUpdateIntervalMs: 0,
  proximityRefreshIntervalMs: 0,
  antialias: true,
  alpha: true,
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

/**
 * The R3F world only changes when qualitative nearest/active identity changes.
 * Numeric distance/progress snapshots are shell/HUD data and must not trigger
 * a full scene reconciliation.
 */
export function hasDriftEvolutionSceneProximityIdentityChanged(
  previous: DriftEvolutionSceneProximityIdentity | null,
  next: DriftEvolutionSceneProximityIdentity
) {
  if (!previous) return true;

  return (
    previous.nearestNode?.id !== next.nearestNode?.id ||
    previous.activeNode?.id !== next.activeNode?.id ||
    previous.nearestEra?.id !== next.nearestEra?.id ||
    previous.activeEra?.id !== next.activeEra?.id ||
    previous.isInside !== next.isInside
  );
}
