import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRIFT_3D_GLOBAL_READINESS_RECOMMENDATIONS,
  DRIFT_3D_READINESS_STATUSES,
  getDrift3DMacroWorldReadinessIssues,
  isDrift3DGlobalReadinessRecommendation,
  isDrift3DOwnerVerdictPending,
  isDrift3DReadinessStatus,
} from "@/lib/drift3dMacroWorldReadiness";

test("readiness statuses are exactly GO / GO_WITH_GAPS / NO_GO", () => {
  assert.deepEqual(DRIFT_3D_READINESS_STATUSES, ["GO", "GO_WITH_GAPS", "NO_GO"]);
  assert.equal(isDrift3DReadinessStatus("GO"), true);
  assert.equal(isDrift3DReadinessStatus("MAYBE"), false);
});

test("global readiness recommendations are exactly the three canonical values", () => {
  assert.deepEqual(DRIFT_3D_GLOBAL_READINESS_RECOMMENDATIONS, [
    "READY_FOR_TRACK_PRODUCTION",
    "READY_WITH_NON_BLOCKING_GAPS",
    "REWORK_REQUIRED",
  ]);
  assert.equal(isDrift3DGlobalReadinessRecommendation("READY_FOR_TRACK_PRODUCTION"), true);
  assert.equal(isDrift3DGlobalReadinessRecommendation("DONE"), false);
});

test("owner verdict validator accepts only the literal PENDING", () => {
  assert.equal(isDrift3DOwnerVerdictPending("PENDING"), true);
  assert.equal(isDrift3DOwnerVerdictPending("ACCEPT"), false);
  assert.equal(isDrift3DOwnerVerdictPending(""), false);
});

test("a valid, complete readiness record set has no issues", () => {
  const issues = getDrift3DMacroWorldReadinessIssues([
    { worldId: "entry", recommendedStatus: "GO_WITH_GAPS", blockingRisks: [], nonBlockingRisks: ["placeholder props"], ownerVerdict: "PENDING" },
    { worldId: "birth-yard", recommendedStatus: "GO_WITH_GAPS", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "PENDING" },
    { worldId: "older-shadows", recommendedStatus: "GO_WITH_GAPS", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "PENDING" },
    { worldId: "vegetative-field", recommendedStatus: "GO_WITH_GAPS", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "PENDING" },
    { worldId: "new-signal", recommendedStatus: "GO_WITH_GAPS", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "PENDING" },
  ]);

  assert.deepEqual(issues, []);
});

test("a NO_GO status without a recorded blocking risk is rejected", () => {
  const issues = getDrift3DMacroWorldReadinessIssues([
    { worldId: "entry", recommendedStatus: "NO_GO", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "PENDING" },
  ]);

  assert.ok(issues.some((issue) => issue.type === "no-go-without-blocking-risk"));
});

test("an owner verdict that isn't exactly PENDING is rejected", () => {
  const issues = getDrift3DMacroWorldReadinessIssues([
    { worldId: "entry", recommendedStatus: "GO", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "ACCEPT" },
  ]);

  assert.ok(issues.some((issue) => issue.type === "owner-verdict-not-pending"));
});

test("a missing macro-world in the readiness set is detected", () => {
  const issues = getDrift3DMacroWorldReadinessIssues([
    { worldId: "entry", recommendedStatus: "GO", blockingRisks: [], nonBlockingRisks: [], ownerVerdict: "PENDING" },
  ]);

  assert.ok(
    issues.some((issue) => issue.type === "world-missing" && issue.worldId === "new-signal")
  );
});
