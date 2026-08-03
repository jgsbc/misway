import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRIFT_3D_KIT_ASSET_MANIFEST,
  getDrift3DCanonicalKitAssetManifestIssues,
  getDrift3DKitAssetManifestIssues,
  getDrift3DKitAssetManifestTotalBytes,
} from "@/lib/drift3dKitAssets";

test("canonical asset manifest is valid", () => {
  assert.deepEqual(getDrift3DCanonicalKitAssetManifestIssues(), []);
});

test("canonical asset manifest total size is under the 30MB tracked-asset budget", () => {
  const totalBytes = getDrift3DKitAssetManifestTotalBytes();

  assert.ok(totalBytes > 0);
  assert.ok(totalBytes < 30 * 1024 * 1024);
});

test("every manifest entry is one of the exact PRE-20 owner-accepted candidates", () => {
  const allowedRegistryIds = new Set([
    "PRE20-A01",
    "PRE20-A02",
    "PRE20-B01",
    "PRE20-C01",
  ]);

  for (const entry of DRIFT_3D_KIT_ASSET_MANIFEST) {
    assert.ok(
      allowedRegistryIds.has(entry.registryId),
      `unexpected registryId ${entry.registryId} on asset ${entry.id}`
    );
  }
});

test("manifest validation catches an invalid kind", () => {
  const issues = getDrift3DKitAssetManifestIssues([
    {
      id: "human-crowd-character-male-a",
      kind: "audio",
      path: "/models/human-crowd/character-male-a.glb",
      registryId: "PRE20-A01",
      sha256: "a".repeat(64),
      sizeBytes: 100,
    },
  ]);

  assert.ok(issues.some((issue) => issue.type === "invalid-kind"));
});

test("manifest validation catches a non-absolute path and a bad sha256", () => {
  const issues = getDrift3DKitAssetManifestIssues([
    {
      id: "urban-building-a",
      kind: "model",
      path: "models/urban/building-a.glb",
      registryId: "PRE20-A02",
      sha256: "not-a-real-hash",
      sizeBytes: 100,
    },
  ]);

  assert.ok(issues.some((issue) => issue.type === "path-not-absolute"));
  assert.ok(issues.some((issue) => issue.type === "invalid-sha256"));
});

test("manifest validation catches a candidate outside the PRE-20 accepted set and a bad size", () => {
  const issues = getDrift3DKitAssetManifestIssues([
    {
      id: "urban-building-a",
      kind: "model",
      path: "/models/urban/building-a.glb",
      registryId: "PRE20-A03",
      sha256: "a".repeat(64),
      sizeBytes: -5,
    },
  ]);

  assert.ok(issues.some((issue) => issue.type === "invalid-registry-id"));
  assert.ok(
    issues.some((issue) => issue.type === "size-not-positive-integer")
  );
});

test("manifest validation catches a duplicate id", () => {
  const entry = {
    id: "urban-building-a",
    kind: "model",
    path: "/models/urban/building-a.glb",
    registryId: "PRE20-A02",
    sha256: "a".repeat(64),
    sizeBytes: 100,
  };
  const issues = getDrift3DKitAssetManifestIssues([entry, { ...entry }]);

  assert.ok(issues.some((issue) => issue.type === "duplicate-id"));
});
