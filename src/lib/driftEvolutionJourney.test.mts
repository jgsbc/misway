import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DMovementBounds } from "./drift3d";
import {
  DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY,
  readDriftEvolutionJourneyPose,
  writeDriftEvolutionJourneyPose,
  type DriftEvolutionJourneyStorage,
} from "./driftEvolutionJourney";

class MemoryStorage implements DriftEvolutionJourneyStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function getSafePose() {
  const bounds = getDrift3DMovementBounds();
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    z: (bounds.minZ + bounds.maxZ) / 2,
    heading: Math.PI * 2.5,
  };
}

test("journey pose round-trips position and normalized heading", () => {
  const storage = new MemoryStorage();
  const pose = getSafePose();

  assert.equal(writeDriftEvolutionJourneyPose(storage, pose), true);
  assert.deepEqual(readDriftEvolutionJourneyPose(storage), {
    x: pose.x,
    z: pose.z,
    heading: Math.PI / 2,
  });
});

test("journey pose rejects corrupt storage and clears it", () => {
  const storage = new MemoryStorage();
  storage.setItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY, "not-json");

  assert.equal(readDriftEvolutionJourneyPose(storage), null);
  assert.equal(storage.getItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY), null);
});

test("journey pose rejects values outside production movement bounds", () => {
  const storage = new MemoryStorage();
  const bounds = getDrift3DMovementBounds();
  storage.setItem(
    DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      x: bounds.maxX + 1,
      z: 0,
      heading: 0,
    })
  );

  assert.equal(readDriftEvolutionJourneyPose(storage), null);
  assert.equal(storage.getItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY), null);
});

test("journey storage contains only the resumable pose contract", () => {
  const storage = new MemoryStorage();
  const pose = getSafePose();

  assert.equal(writeDriftEvolutionJourneyPose(storage, pose), true);
  const raw = storage.getItem(DRIFT_EVOLUTION_JOURNEY_STORAGE_KEY);
  assert.ok(raw);

  const stored = JSON.parse(raw);
  assert.deepEqual(Object.keys(stored).sort(), [
    "heading",
    "version",
    "x",
    "z",
  ]);
  assert.equal("speed" in stored, false);
  assert.equal("velocityX" in stored, false);
  assert.equal("airborne" in stored, false);
});
