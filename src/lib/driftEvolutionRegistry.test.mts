import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_EVOLUTION_DISCIPLINE,
  DRIFT_EVOLUTION_PROMOTION,
  DRIFT_EVOLUTION_REUSE_SOURCES,
  DRIFT_PRODUCTION_BASELINE,
} from "@/lib/driftEvolutionRegistry";

test("Drift evolution starts from the restored production baseline on a separate route", () => {
  assert.equal(
    DRIFT_PRODUCTION_BASELINE.commit,
    "99b343bb13e901df49d9bed530cb00decf1134cd"
  );
  assert.equal(DRIFT_PRODUCTION_BASELINE.productionRoute, "/drift");
  assert.equal(DRIFT_PRODUCTION_BASELINE.evolutionRoute, "/drift-evolution");
  assert.notEqual(
    DRIFT_PRODUCTION_BASELINE.productionRoute,
    DRIFT_PRODUCTION_BASELINE.evolutionRoute
  );
});

test("owner-approved Evolution runtime is promoted to production Drift", () => {
  assert.equal(DRIFT_EVOLUTION_PROMOTION.status, "OWNER_APPROVED");
  assert.equal(DRIFT_EVOLUTION_PROMOTION.sourceRoute, "/drift-evolution");
  assert.equal(DRIFT_EVOLUTION_PROMOTION.targetRoute, "/drift");
  assert.equal(
    DRIFT_EVOLUTION_PROMOTION.rollbackCommit,
    "525f86f7e34d225233e992695fe269600c1d067d"
  );
});

test("reuse registry keeps production art ahead of experimental salvage", () => {
  const ids = DRIFT_EVOLUTION_REUSE_SOURCES.map((source) => source.id);

  assert.equal(ids[0], "production-entry-lambda-cave");
  assert.ok(ids.includes("pre30-shared-kit-pilots"));
  assert.ok(ids.includes("world-edges-20c"));
  assert.ok(ids.includes("fable-r-and-d"));
  assert.ok(ids.includes("post-greybox-archive"));
});

test("evolution discipline requires visual comparison before promotion", () => {
  assert.ok(DRIFT_EVOLUTION_DISCIPLINE.includes("PRESERVE_PRODUCTION"));
  assert.ok(DRIFT_EVOLUTION_DISCIPLINE.includes("REUSE_EXISTING"));
  assert.ok(DRIFT_EVOLUTION_DISCIPLINE.includes("COMPARE_VISUALLY_WITH_DRIFT"));
  assert.equal(
    DRIFT_EVOLUTION_DISCIPLINE.at(-1),
    "PROMOTE_ONLY_IF_MANIFESTLY_BETTER"
  );
});
