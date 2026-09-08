import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

/*
 * Set before importing the modules under test: `@/lib/basePath` reads
 * NODE_ENV once at module scope, and the production prefix is exactly what
 * these tests exist to protect. A raw `/textures/...` URL 404s under the
 * `/misway` basePath, and a 404 texture is not a no-op in three.js: the
 * material samples the 1x1 RGBA(0,0,0,0) empty texture, blacking out the
 * diffuse and inverting the shading normal.
 */
(process.env as Record<string, string | undefined>).NODE_ENV = "production";

const {
  DRIFT_3D_PHOTO_DIFFUSE_FILES,
  DRIFT_3D_PHOTO_NORMAL_FILES,
  getDrift3DPhotoTextureUrl,
} = await import("@/components/drift-3d/drift3dTextureFactory");

const PHOTO_KINDS = ["rock", "brick", "concrete", "wood", "sand"] as const;

/** LOT 01 mobile budget for the whole photo-material set. */
const PHOTO_TEXTURE_BYTE_BUDGET = 600 * 1024;

const declaredFiles = [
  ...Object.values(DRIFT_3D_PHOTO_DIFFUSE_FILES),
  ...Object.values(DRIFT_3D_PHOTO_NORMAL_FILES),
].filter((file): file is string => typeof file === "string");

function publicPath(file: string) {
  return path.join(process.cwd(), "public", file.replace(/^\//, ""));
}

test("every photo material kind declares both a diffuse and a normal map", () => {
  for (const kind of PHOTO_KINDS) {
    assert.ok(
      DRIFT_3D_PHOTO_DIFFUSE_FILES[kind],
      `${kind} has no diffuse map declared`
    );
    assert.ok(
      DRIFT_3D_PHOTO_NORMAL_FILES[kind],
      `${kind} has no normal map declared`
    );
  }

  assert.equal(declaredFiles.length, PHOTO_KINDS.length * 2);
});

test("declared photo textures are repository-relative and exist under public/", () => {
  for (const file of declaredFiles) {
    assert.ok(
      file.startsWith("/textures/"),
      `${file} must stay repository-relative (no basePath baked in)`
    );
    assert.ok(
      fs.existsSync(publicPath(file)),
      `${file} is declared but missing from public/ — it would 404 at runtime`
    );
  }
});

test("photo texture URLs carry the production basePath", () => {
  for (const file of declaredFiles) {
    assert.equal(
      getDrift3DPhotoTextureUrl(file),
      `/misway${file}`,
      `${file} must be resolved through withBasePath() before reaching a loader`
    );
  }
});

test("the photo texture set stays inside the LOT 01 mobile byte budget", () => {
  const totalBytes = declaredFiles.reduce(
    (total, file) => total + fs.statSync(publicPath(file)).size,
    0
  );

  assert.ok(totalBytes > 0);
  assert.ok(
    totalBytes <= PHOTO_TEXTURE_BYTE_BUDGET,
    `photo textures weigh ${totalBytes} bytes, over the ${PHOTO_TEXTURE_BYTE_BUDGET}-byte budget`
  );
});
