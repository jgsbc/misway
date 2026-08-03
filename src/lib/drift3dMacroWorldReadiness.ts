import {
  DRIFT_3D_MACRO_WORLD_IDS,
  isDrift3DMacroWorldId,
  type Drift3DMacroWorldId,
} from "@/lib/drift3dMacroWorldConfig";

/**
 * DRIFT-IV-PRE-40 — readiness-status vocabulary and validation for the
 * five-macro-world greybox dossier. Pure, no Three.js/DOM import. A `GO`
 * verdict never means final art exists — only that the spatial/technical
 * foundation is sufficient for later track-specific production.
 */

export type Drift3DReadinessStatus = "GO" | "GO_WITH_GAPS" | "NO_GO";

export const DRIFT_3D_READINESS_STATUSES: readonly Drift3DReadinessStatus[] =
  Object.freeze(["GO", "GO_WITH_GAPS", "NO_GO"]);

export function isDrift3DReadinessStatus(
  value: unknown
): value is Drift3DReadinessStatus {
  return (
    value === "GO" || value === "GO_WITH_GAPS" || value === "NO_GO"
  );
}

export type Drift3DGlobalReadinessRecommendation =
  | "READY_FOR_TRACK_PRODUCTION"
  | "READY_WITH_NON_BLOCKING_GAPS"
  | "REWORK_REQUIRED";

export const DRIFT_3D_GLOBAL_READINESS_RECOMMENDATIONS: readonly Drift3DGlobalReadinessRecommendation[] =
  Object.freeze([
    "READY_FOR_TRACK_PRODUCTION",
    "READY_WITH_NON_BLOCKING_GAPS",
    "REWORK_REQUIRED",
  ]);

export function isDrift3DGlobalReadinessRecommendation(
  value: unknown
): value is Drift3DGlobalReadinessRecommendation {
  return (
    value === "READY_FOR_TRACK_PRODUCTION" ||
    value === "READY_WITH_NON_BLOCKING_GAPS" ||
    value === "REWORK_REQUIRED"
  );
}

export type Drift3DOwnerVerdictPending = "PENDING";

export function isDrift3DOwnerVerdictPending(
  value: unknown
): value is Drift3DOwnerVerdictPending {
  return value === "PENDING";
}

export type Drift3DMacroWorldReadinessRecord = Readonly<{
  worldId: Drift3DMacroWorldId;
  recommendedStatus: Drift3DReadinessStatus;
  blockingRisks: readonly string[];
  nonBlockingRisks: readonly string[];
  ownerVerdict: Drift3DOwnerVerdictPending;
}>;

export type Drift3DMacroWorldReadinessRecordCandidate = Readonly<{
  worldId: string;
  recommendedStatus: string;
  blockingRisks: readonly string[];
  nonBlockingRisks: readonly string[];
  ownerVerdict: string;
}>;

export type Drift3DReadinessIssueType =
  | "invalid-world-id"
  | "duplicate-world-id"
  | "world-missing"
  | "invalid-status"
  | "no-go-without-blocking-risk"
  | "owner-verdict-not-pending";

export type Drift3DReadinessIssue = Readonly<{
  type: Drift3DReadinessIssueType;
  worldId: string;
  message: string;
}>;

/**
 * Validates a set of per-macro-world readiness records: invalid/unknown
 * world id, duplicate world id, a missing world, an invalid status, a
 * `NO_GO` with no recorded blocking risk (a `NO_GO` must identify a concrete
 * blocker — never a bare verdict), and any owner verdict that isn't the
 * literal `"PENDING"` (this lot never records a final owner decision for
 * itself).
 */
export function getDrift3DMacroWorldReadinessIssues(
  records: readonly Drift3DMacroWorldReadinessRecordCandidate[]
): readonly Drift3DReadinessIssue[] {
  const issues: Drift3DReadinessIssue[] = [];
  const seenIds = new Set<string>();

  for (const record of records) {
    if (!isDrift3DMacroWorldId(record.worldId)) {
      issues.push({
        type: "invalid-world-id",
        worldId: record.worldId,
        message: `Readiness record has an invalid world id "${record.worldId}".`,
      });
    } else if (seenIds.has(record.worldId)) {
      issues.push({
        type: "duplicate-world-id",
        worldId: record.worldId,
        message: `Readiness record world id "${record.worldId}" is duplicated.`,
      });
    } else {
      seenIds.add(record.worldId);
    }

    if (!isDrift3DReadinessStatus(record.recommendedStatus)) {
      issues.push({
        type: "invalid-status",
        worldId: record.worldId,
        message: `Readiness status "${record.recommendedStatus}" is not one of GO/GO_WITH_GAPS/NO_GO.`,
      });
    } else if (
      record.recommendedStatus === "NO_GO" &&
      record.blockingRisks.length === 0
    ) {
      issues.push({
        type: "no-go-without-blocking-risk",
        worldId: record.worldId,
        message: `A NO_GO status for "${record.worldId}" must identify at least one concrete blocking risk.`,
      });
    }

    if (!isDrift3DOwnerVerdictPending(record.ownerVerdict)) {
      issues.push({
        type: "owner-verdict-not-pending",
        worldId: record.worldId,
        message: `Owner verdict for "${record.worldId}" must be exactly "PENDING" in this lot's own evidence (got "${record.ownerVerdict}").`,
      });
    }
  }

  for (const id of DRIFT_3D_MACRO_WORLD_IDS) {
    if (!seenIds.has(id)) {
      issues.push({
        type: "world-missing",
        worldId: id,
        message: `Readiness record for required macro-world "${id}" is missing.`,
      });
    }
  }

  return issues;
}
