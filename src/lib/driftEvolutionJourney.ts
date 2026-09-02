import { getDrift3DMovementBounds } from "./drift3d";

export const DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY =
  "misway:drift:evolution-journey:v1";

const DRIFT_EVOLUTION_JOURNEY_VERSION = 1 as const;

export type DriftEvolutionJourneyPose = {
  x: number;
  z: number;
  heading: number;
};

type StoredDriftEvolutionJourneyPose = DriftEvolutionJourneyPose & {
  version: typeof DRIFT_EVOLUTION_JOURNEY_VERSION;
};

export type DriftEvolutionJourneyStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeHeading(heading: number) {
  return Math.atan2(Math.sin(heading), Math.cos(heading));
}

export function isDriftEvolutionJourneyPose(
  value: unknown
): value is DriftEvolutionJourneyPose {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StoredDriftEvolutionJourneyPose>;
  if (
    !isFiniteNumber(candidate.x) ||
    !isFiniteNumber(candidate.z) ||
    !isFiniteNumber(candidate.heading)
  ) {
    return false;
  }

  const bounds = getDrift3DMovementBounds();
  return (
    candidate.x >= bounds.minX &&
    candidate.x <= bounds.maxX &&
    candidate.z >= bounds.minZ &&
    candidate.z <= bounds.maxZ
  );
}

export function readDriftEvolutionJourneyPose(
  storage: DriftEvolutionJourneyStorage
): DriftEvolutionJourneyPose | null {
  try {
    const raw = storage.getItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as Partial<StoredDriftEvolutionJourneyPose>).version !==
        DRIFT_EVOLUTION_JOURNEY_VERSION ||
      !isDriftEvolutionJourneyPose(parsed)
    ) {
      storage.removeItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY);
      return null;
    }

    const pose = parsed as StoredDriftEvolutionJourneyPose;
    return {
      x: pose.x,
      z: pose.z,
      heading: normalizeHeading(pose.heading),
    };
  } catch {
    try {
      storage.removeItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted environments.
    }
    return null;
  }
}

export function writeDriftEvolutionJourneyPose(
  storage: DriftEvolutionJourneyStorage,
  pose: DriftEvolutionJourneyPose
) {
  if (!isDriftEvolutionJourneyPose(pose)) return false;

  const stored: StoredDriftEvolutionJourneyPose = {
    version: DRIFT_EVOLUTION_JOURNEY_VERSION,
    x: pose.x,
    z: pose.z,
    heading: normalizeHeading(pose.heading),
  };

  try {
    storage.setItem(
      DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY,
      JSON.stringify(stored)
    );
    return true;
  } catch {
    return false;
  }
}
