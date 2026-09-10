/*
 * Lossless repack of a glTF 2.0 asset that has no textures.
 *
 * Two changes, both information-preserving for the asset as it is used:
 *   - index accessors are narrowed from UNSIGNED_INT to UNSIGNED_SHORT where
 *     every index fits (checked per primitive, not assumed);
 *   - TEXCOORD_n attributes are dropped when the asset declares no images,
 *     no textures and no material references a texture.
 * Every POSITION and NORMAL float is copied bit-for-bit; triangle count,
 * primitive count, node hierarchy, materials and extensions are untouched.
 *
 * Usage: node scripts/repack-gltf.mjs <in-dir> <out-dir> [--keep-uv]
 */
import fs from "node:fs";
import path from "node:path";

const [inDir, outDir, ...flags] = process.argv.slice(2);
if (!inDir || !outDir) { console.error("usage: node scripts/repack-gltf.mjs <in-dir> <out-dir> [--keep-uv]"); process.exit(1); }
const KEEP_UV = flags.includes("--keep-uv");

const gltfName = fs.readdirSync(inDir).find((f) => f.endsWith(".gltf"));
const gltf = JSON.parse(fs.readFileSync(path.join(inDir, gltfName), "utf8"));
if (gltf.buffers.length !== 1 || !gltf.buffers[0].uri) throw new Error("expected exactly one external buffer");
const binName = gltf.buffers[0].uri;
const bin = fs.readFileSync(path.join(inDir, binName));

const COMP = { 5120: { n: "Int8", s: 1 }, 5121: { n: "Uint8", s: 1 }, 5122: { n: "Int16", s: 2 }, 5123: { n: "Uint16", s: 2 }, 5125: { n: "Uint32", s: 4 }, 5126: { n: "Float32", s: 4 } };
const NUM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

/** Decode one accessor into a flat JS array, honouring bufferView byteStride. */
function readAccessor(index) {
  const a = gltf.accessors[index];
  const bv = gltf.bufferViews[a.bufferView];
  const comp = COMP[a.componentType];
  const n = NUM[a.type];
  const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const stride = bv.byteStride || comp.s * n;
  const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const get = dv[`get${comp.n}`].bind(dv);
  const out = new Array(a.count * n);
  for (let i = 0; i < a.count; i++) {
    for (let k = 0; k < n; k++) out[i * n + k] = get(base + i * stride + k * comp.s, true);
  }
  return out;
}

const textureless =
  (!gltf.images || gltf.images.length === 0) &&
  (!gltf.textures || gltf.textures.length === 0) &&
  !(gltf.materials || []).some((m) => /"index"\s*:/.test(JSON.stringify(m)) && /Texture/.test(JSON.stringify(m)));
const dropUv = !KEEP_UV && textureless;

const out = JSON.parse(JSON.stringify(gltf));
out.bufferViews = [];
out.accessors = [];
const parts = [];
let offset = 0;
const pad = () => { while (offset % 4 !== 0) { parts.push(Buffer.from([0])); offset += 1; } };

function pushAccessor(values, componentType, type, target, extra = {}) {
  pad();
  const comp = COMP[componentType];
  const n = NUM[type];
  const count = values.length / n;
  const buf = Buffer.alloc(count * n * comp.s);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const set = dv[`set${comp.n}`].bind(dv);
  for (let i = 0; i < values.length; i++) set(i * comp.s, values[i], true);
  const bvIndex = out.bufferViews.length;
  out.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target ? { target } : {}) });
  parts.push(buf); offset += buf.length;
  out.accessors.push({ bufferView: bvIndex, componentType, count, type, ...extra });
  return out.accessors.length - 1;
}

const stats = { primitives: 0, triangles: 0, indicesNarrowed: 0, indicesKept32: 0, uvDropped: 0, uvKept: 0 };

for (let mi = 0; mi < out.meshes.length; mi++) {
  for (let pi = 0; pi < out.meshes[mi].primitives.length; pi++) {
    const src = gltf.meshes[mi].primitives[pi];
    const dst = out.meshes[mi].primitives[pi];
    stats.primitives++;

    if (src.indices !== undefined) {
      const idx = readAccessor(src.indices);
      stats.triangles += idx.length / 3;
      const max = idx.reduce((m, v) => (v > m ? v : m), 0);
      const narrow = max <= 65535;
      if (narrow) stats.indicesNarrowed++; else stats.indicesKept32++;
      dst.indices = pushAccessor(idx, narrow ? 5123 : 5125, "SCALAR", 34963);
    }

    const attrs = {};
    for (const [name, ai] of Object.entries(src.attributes)) {
      if (dropUv && /^TEXCOORD_/.test(name)) { stats.uvDropped++; continue; }
      if (/^TEXCOORD_/.test(name)) stats.uvKept++;
      const a = gltf.accessors[ai];
      const values = readAccessor(ai);
      const extra = {};
      if (a.min) extra.min = a.min;
      if (a.max) extra.max = a.max;
      if (a.normalized) extra.normalized = a.normalized;
      attrs[name] = pushAccessor(values, a.componentType, a.type, 34962, extra);
    }
    dst.attributes = attrs;
  }
}

// any accessor still referenced elsewhere (skins, animations) would break: refuse rather than corrupt
if (out.skins || out.animations) throw new Error("asset has skins/animations; this repacker only handles static meshes");

const newBin = Buffer.concat(parts);
out.buffers = [{ uri: binName, byteLength: newBin.length }];
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, binName), newBin);
fs.writeFileSync(path.join(outDir, gltfName), JSON.stringify(out));

console.log(JSON.stringify({
  textureless, dropUv, ...stats,
  binBefore: bin.length, binAfter: newBin.length,
  gltfBefore: fs.statSync(path.join(inDir, gltfName)).size, gltfAfter: fs.statSync(path.join(outDir, gltfName)).size,
  savedBytes: bin.length - newBin.length,
  savedPct: +(100 * (bin.length - newBin.length) / bin.length).toFixed(1),
}, null, 1));
