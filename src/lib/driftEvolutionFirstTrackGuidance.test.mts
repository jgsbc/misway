import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DNodeRadius, drift3dTrackNodeBySlug } from "./drift3dTopology";
import { DRIFT_EVOLUTION_ENTRY_CAVE, getDriftEvolutionEntryStartPosition } from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ZEELAND_ROUTE,
  DRIFT_EVOLUTION_ZEELAND_TARGET,
} from "./driftEvolutionZeelandGeography";
import {
  DRIFT_EVOLUTION_FIRST_TRACK_LOOKAHEAD,
  DRIFT_EVOLUTION_FIRST_TRACK_SLUG,
  getDriftEvolutionFirstTrackNavigationTarget,
  getDriftEvolutionNearestTrackGuidance,
  getDriftEvolutionTrackGuidance,
  isDriftEvolutionFirstTrackApproach,
} from "./driftEvolutionFirstTrackGuidance";

function distancePointToSegment(
  point: { x: number; z: number },
  start: { x: number; z: number },
  end: { x: number; z: number }
) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSquared = dx * dx + dz * dz;
  const t =
    lengthSquared <= 1e-9
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            ((point.x - start.x) * dx + (point.z - start.z) * dz) /
              lengthSquared
          )
        );
  return Math.hypot(
    point.x - (start.x + dx * t),
    point.z - (start.z + dz * t)
  );
}

test("Entry compass guides to Zeeland even when another track is geometrically nearer", () => {
  const spawn = getDriftEvolutionEntryStartPosition();
  const nearest = getDriftEvolutionNearestTrackGuidance(spawn);
  const guided = getDriftEvolutionTrackGuidance(spawn);

  assert.ok(nearest);
  assert.notEqual(nearest.trackSlug, DRIFT_EVOLUTION_FIRST_TRACK_SLUG);
  assert.ok(guided);
  assert.equal(guided.trackSlug, DRIFT_EVOLUTION_FIRST_TRACK_SLUG);
  assert.equal(guided.mode, "first-reveal");
  assert.notDeepEqual(
    guided.target,
    DRIFT_EVOLUTION_ZEELAND_TARGET,
    "first guidance must steer along the authored route, not at the final node center"
  );
  assert.ok(
    guided.target.x > spawn.x,
    "spawn navigation target must lead east toward the cave exit"
  );
  assert.ok(
    Math.hypot(guided.target.x - spawn.x, guided.target.z - spawn.z) <=
      DRIFT_EVOLUTION_FIRST_TRACK_LOOKAHEAD + 0.8,
    "spawn look-ahead should stay local enough to describe the drivable path"
  );
});

test("Entry exit guidance follows the first dry Zeeland route leg", () => {
  const exit = {
    x: DRIFT_EVOLUTION_ENTRY_CAVE.exitX,
    z: DRIFT_EVOLUTION_ENTRY_CAVE.centerZ,
  };
  const guided = getDriftEvolutionTrackGuidance(exit);
  const navigationTarget = getDriftEvolutionFirstTrackNavigationTarget(exit);
  const firstDryLegEnd = DRIFT_EVOLUTION_ZEELAND_ROUTE[1];

  assert.equal(isDriftEvolutionFirstTrackApproach(exit), true);
  assert.ok(guided);
  assert.equal(guided.trackSlug, DRIFT_EVOLUTION_FIRST_TRACK_SLUG);
  assert.equal(guided.mode, "first-reveal");
  assert.deepEqual(guided.target, navigationTarget);
  assert.ok(navigationTarget.x > exit.x);
  assert.ok(
    distancePointToSegment(
      navigationTarget,
      DRIFT_EVOLUTION_ZEELAND_ROUTE[0],
      firstDryLegEnd
    ) < 0.05,
    "exit arrow must point along the authored dry road rather than across harbour geography"
  );
});

test("first-reveal guidance does not capture the Birth Yard side spurs", () => {
  const peutEtre = drift3dTrackNodeBySlug["peut-etre"].position;
  const funkyHoo = drift3dTrackNodeBySlug["funky-hoo"].position;

  assert.equal(isDriftEvolutionFirstTrackApproach(peutEtre), false);
  assert.equal(isDriftEvolutionFirstTrackApproach(funkyHoo), false);
  assert.equal(
    getDriftEvolutionTrackGuidance(peutEtre)?.trackSlug,
    "peut-etre"
  );
  assert.equal(
    getDriftEvolutionTrackGuidance(funkyHoo)?.trackSlug,
    "funky-hoo"
  );
});

test("authored Entry route reaches Zeeland's playable radius quickly", () => {
  const radius = getDrift3DNodeRadius(
    drift3dTrackNodeBySlug[DRIFT_EVOLUTION_FIRST_TRACK_SLUG]
  );
  let travelled = 0;
  let activationDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < DRIFT_EVOLUTION_ZEELAND_ROUTE.length - 1; index += 1) {
    const start = DRIFT_EVOLUTION_ZEELAND_ROUTE[index];
    const end = DRIFT_EVOLUTION_ZEELAND_ROUTE[index + 1];
    const segmentLength = Math.hypot(end.x - start.x, end.z - start.z);
    const distance = distancePointToSegment(DRIFT_EVOLUTION_ZEELAND_TARGET, start, end);

    if (distance <= radius) {
      activationDistance = travelled + segmentLength;
      break;
    }
    travelled += segmentLength;
  }

  assert.ok(Number.isFinite(activationDistance));
  assert.ok(
    activationDistance <= 16,
    `first playable Zeeland encounter is too far from Entry exit: ${activationDistance.toFixed(2)}m`
  );
});
