import { withBasePath } from "@/lib/basePath";

/**
 * DRIFT-IV-PRE-30 — deterministic manifest of the minimal tracked runtime
 * asset subset used by the three shared-kit pilots. Framework-agnostic: no
 * Three.js import, no loader call. Only declares what exists and where, plus
 * pure validators — actual `GLTFLoader`/`TextureLoader` calls live in the
 * pilot components. Every asset here is one of the exact `DRIFT-IV-PRE-20`
 * owner-accepted candidates (`PRE20-A01`, `PRE20-A02`, `PRE20-B01`,
 * `PRE20-C01`) — no candidate search is reopened by this module.
 */

export type Drift3DKitAssetKind = "model" | "texture";

export type Drift3DKitAssetId =
  | "human-crowd-character-male-a"
  | "human-crowd-colormap"
  | "urban-building-a"
  | "urban-building-b"
  | "urban-colormap"
  | "vehicle-traffic-sedan"
  | "vehicle-traffic-colormap"
  | "material-snow02-diffuse"
  | "material-snow02-normal-gl"
  | "material-snow02-roughness";

export type Drift3DKitAssetManifestEntry = Readonly<{
  id: Drift3DKitAssetId;
  kind: Drift3DKitAssetKind;
  /** Repository-relative path under `public/`, without a basePath prefix. */
  path: string;
  registryId: string;
  sha256: string;
  sizeBytes: number;
}>;

const HUMAN_CROWD_CHARACTER: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "human-crowd-character-male-a",
  kind: "model",
  path: "/models/human-crowd/character-male-a.glb",
  registryId: "PRE20-A01",
  sha256:
    "77572792bfe2773b715b8cd8e18644b52b3e1f155fe10450254b50f9c364382a",
  sizeBytes: 246916,
});

const HUMAN_CROWD_COLORMAP: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "human-crowd-colormap",
  kind: "texture",
  path: "/models/human-crowd/Textures/colormap.png",
  registryId: "PRE20-A01",
  sha256:
    "0d4947d34ff32acf4a359c7f22ca784e057e7e72f622170a9a77b6fc88fdb70e",
  sizeBytes: 8706,
});

const URBAN_BUILDING_A: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "urban-building-a",
  kind: "model",
  path: "/models/urban/building-a.glb",
  registryId: "PRE20-A02",
  sha256:
    "5cf220f90ee3f21e7abe38055ca409a48aa8ef1d5ffab6e2deb99e5a5e1ed5e0",
  sizeBytes: 108936,
});

const URBAN_BUILDING_B: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "urban-building-b",
  kind: "model",
  path: "/models/urban/building-b.glb",
  registryId: "PRE20-A02",
  sha256:
    "3b5d3ac0799c024781d92bb15971d42f4f8e380554dc5cf6a40c2f07d948947a",
  sizeBytes: 106408,
});

const URBAN_COLORMAP: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "urban-colormap",
  kind: "texture",
  path: "/models/urban/Textures/colormap.png",
  registryId: "PRE20-A02",
  sha256:
    "191bec3889aaaca5018380038fecc129ebb5c2182879a099b7b538b3fa050b5d",
  sizeBytes: 11002,
});

const VEHICLE_TRAFFIC_SEDAN: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "vehicle-traffic-sedan",
  kind: "model",
  path: "/models/vehicle-traffic/sedan.glb",
  registryId: "PRE20-B01",
  sha256:
    "b532ea7d2c59f7f6b22b138cf1955218a2c1898f1cea932af4d3fd563c3959b7",
  sizeBytes: 172216,
});

const VEHICLE_TRAFFIC_COLORMAP: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "vehicle-traffic-colormap",
  kind: "texture",
  path: "/models/vehicle-traffic/Textures/colormap.png",
  registryId: "PRE20-B01",
  sha256:
    "f3622a03a20c6696065cae9cbe391351be873508af190c2ebd1d420c055787a5",
  sizeBytes: 12371,
});

const MATERIAL_SNOW02_DIFFUSE: Drift3DKitAssetManifestEntry = Object.freeze({
  id: "material-snow02-diffuse",
  kind: "texture",
  path: "/textures/snow_02_diff_1k.jpg",
  registryId: "PRE20-C01",
  sha256:
    "523a4e69c90b96d787dd69b897f29a2b3761a017024405c60aa630d1e8e9009a",
  sizeBytes: 325497,
});

const MATERIAL_SNOW02_NORMAL_GL: Drift3DKitAssetManifestEntry = Object.freeze(
  {
    id: "material-snow02-normal-gl",
    kind: "texture",
    path: "/textures/snow_02_nor_gl_1k.jpg",
    registryId: "PRE20-C01",
    sha256:
      "9495ec680616b8340e2cbecbd151bff84c690cfad4209e90cc98d2d0ba81f810",
    sizeBytes: 1081858,
  }
);

const MATERIAL_SNOW02_ROUGHNESS: Drift3DKitAssetManifestEntry = Object.freeze(
  {
    id: "material-snow02-roughness",
    kind: "texture",
    path: "/textures/snow_02_rough_1k.jpg",
    registryId: "PRE20-C01",
    sha256:
      "b6dea8039ac2a5beaed6fd41834fb55540cc76b492edd1d48ba2da2f30f1cb75",
    sizeBytes: 146089,
  }
);

export const DRIFT_3D_KIT_ASSET_MANIFEST: readonly Drift3DKitAssetManifestEntry[] =
  Object.freeze([
    HUMAN_CROWD_CHARACTER,
    HUMAN_CROWD_COLORMAP,
    URBAN_BUILDING_A,
    URBAN_BUILDING_B,
    URBAN_COLORMAP,
    VEHICLE_TRAFFIC_SEDAN,
    VEHICLE_TRAFFIC_COLORMAP,
    MATERIAL_SNOW02_DIFFUSE,
    MATERIAL_SNOW02_NORMAL_GL,
    MATERIAL_SNOW02_ROUGHNESS,
  ]);

const ASSET_BY_ID: Readonly<Record<Drift3DKitAssetId, Drift3DKitAssetManifestEntry>> =
  Object.freeze(
    Object.fromEntries(
      DRIFT_3D_KIT_ASSET_MANIFEST.map((entry) => [entry.id, entry])
    ) as Record<Drift3DKitAssetId, Drift3DKitAssetManifestEntry>
  );

export function getDrift3DKitAsset(
  id: Drift3DKitAssetId
): Drift3DKitAssetManifestEntry {
  return ASSET_BY_ID[id];
}

/** basePath-prefixed URL ready to pass to a loader (`GLTFLoader`/`TextureLoader`). */
export function getDrift3DKitAssetUrl(id: Drift3DKitAssetId): string {
  return withBasePath(ASSET_BY_ID[id].path);
}

export function getDrift3DKitAssetManifestTotalBytes(): number {
  return DRIFT_3D_KIT_ASSET_MANIFEST.reduce(
    (total, entry) => total + entry.sizeBytes,
    0
  );
}

/**
 * Widened candidate shape accepted by the validator below, so a deliberately
 * broken fixture can be constructed without lying about what a real manifest
 * entry is typed as.
 */
export type Drift3DKitAssetManifestEntryCandidate = Readonly<{
  id: string;
  kind: string;
  path: string;
  registryId: string;
  sha256: string;
  sizeBytes: number;
}>;

export type Drift3DKitAssetManifestIssueType =
  | "invalid-kind"
  | "empty-path"
  | "path-not-absolute"
  | "invalid-registry-id"
  | "invalid-sha256"
  | "size-not-positive-integer"
  | "duplicate-id";

export type Drift3DKitAssetManifestIssue = Readonly<{
  type: Drift3DKitAssetManifestIssueType;
  id: string;
  message: string;
}>;

const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

/**
 * The exact, closed set of `DRIFT-IV-PRE-20` owner-accepted candidates this
 * lot is bounded to (`docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md`
 * §14.2). Deliberately a membership check, not a shape/regex check — a
 * structurally well-formed id like `PRE20-A03` (Quaternius, `REFERENCE`
 * only, never accepted) must still be rejected here, satisfying this lot's
 * own "no unapproved candidate was introduced" completion-gate criterion.
 */
const ALLOWED_PRE20_REGISTRY_IDS: ReadonlySet<string> = new Set([
  "PRE20-A01",
  "PRE20-A02",
  "PRE20-B01",
  "PRE20-C01",
]);

/**
 * Validates a set of manifest entry candidates: invalid `kind`; an empty or
 * non-absolute `path`; a `registryId` not matching the `PRE20-<letter><NN>`
 * pattern this lot is bounded to; a malformed (non-64-lowercase-hex)
 * `sha256`; a non-positive-integer `sizeBytes`; and duplicate `id`s.
 */
export function getDrift3DKitAssetManifestIssues(
  entries: readonly Drift3DKitAssetManifestEntryCandidate[]
): readonly Drift3DKitAssetManifestIssue[] {
  const issues: Drift3DKitAssetManifestIssue[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (seenIds.has(entry.id)) {
      issues.push({
        type: "duplicate-id",
        id: entry.id,
        message: `Asset id "${entry.id}" is duplicated.`,
      });
    } else {
      seenIds.add(entry.id);
    }

    if (entry.kind !== "model" && entry.kind !== "texture") {
      issues.push({
        type: "invalid-kind",
        id: entry.id,
        message: `Asset "${entry.id}" has an invalid kind "${entry.kind}".`,
      });
    }

    if (!entry.path) {
      issues.push({
        type: "empty-path",
        id: entry.id,
        message: `Asset "${entry.id}" has an empty path.`,
      });
    } else if (!entry.path.startsWith("/")) {
      issues.push({
        type: "path-not-absolute",
        id: entry.id,
        message: `Asset "${entry.id}" path "${entry.path}" must start with "/".`,
      });
    }

    if (!ALLOWED_PRE20_REGISTRY_IDS.has(entry.registryId)) {
      issues.push({
        type: "invalid-registry-id",
        id: entry.id,
        message: `Asset "${entry.id}" registryId "${entry.registryId}" is not one of this lot's exact owner-accepted PRE-20 candidates.`,
      });
    }

    if (!SHA256_HEX_PATTERN.test(entry.sha256)) {
      issues.push({
        type: "invalid-sha256",
        id: entry.id,
        message: `Asset "${entry.id}" sha256 is not 64 lowercase hex characters.`,
      });
    }

    if (
      !Number.isFinite(entry.sizeBytes) ||
      !Number.isInteger(entry.sizeBytes) ||
      entry.sizeBytes <= 0
    ) {
      issues.push({
        type: "size-not-positive-integer",
        id: entry.id,
        message: `Asset "${entry.id}" sizeBytes must be a positive integer (got ${entry.sizeBytes}).`,
      });
    }
  }

  return issues;
}

/** Validates the real canonical manifest (see above). */
export function getDrift3DCanonicalKitAssetManifestIssues(): readonly Drift3DKitAssetManifestIssue[] {
  return getDrift3DKitAssetManifestIssues(DRIFT_3D_KIT_ASSET_MANIFEST);
}
