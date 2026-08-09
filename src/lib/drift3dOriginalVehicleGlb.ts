import * as THREE from "three";

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

type GltfAccessor = {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: string;
  normalized?: boolean;
};

type GltfBufferView = {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
};

type GltfPrimitive = {
  attributes: Record<string, number>;
  indices?: number;
  material?: number;
  mode?: number;
};

type GltfMesh = {
  name?: string;
  primitives: GltfPrimitive[];
};

type GltfMaterial = {
  name?: string;
  alphaMode?: "OPAQUE" | "MASK" | "BLEND";
  doubleSided?: boolean;
  emissiveFactor?: [number, number, number];
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number];
    metallicFactor?: number;
    roughnessFactor?: number;
  };
};

type GltfDocument = {
  accessors: GltfAccessor[];
  bufferViews: GltfBufferView[];
  buffers: Array<{ byteLength: number }>;
  materials?: GltfMaterial[];
  meshes: GltfMesh[];
};

type SupportedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Uint32Array
  | Float32Array;

type ArrayConstructor = {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBuffer, byteOffset: number, length: number): SupportedArray;
};

const COMPONENTS_BY_TYPE: Readonly<Record<string, number>> = Object.freeze({
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
});

const ARRAY_BY_COMPONENT_TYPE: Readonly<Record<number, ArrayConstructor>> = Object.freeze({
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
});

function fail(message: string): never {
  throw new Error(`MISWAY Safari GLB: ${message}`);
}

function parseChunks(buffer: ArrayBuffer): { document: GltfDocument; binary: ArrayBuffer } {
  if (buffer.byteLength < 20) fail("file is too small");

  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) fail("invalid magic");
  if (view.getUint32(4, true) !== GLB_VERSION) fail("unsupported version");

  const declaredLength = view.getUint32(8, true);
  if (declaredLength !== buffer.byteLength) {
    fail(`declared length ${declaredLength} does not match ${buffer.byteLength}`);
  }

  let offset = 12;
  let document: GltfDocument | null = null;
  let binary: ArrayBuffer | null = null;

  while (offset + 8 <= buffer.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + length;
    if (end > buffer.byteLength) fail("chunk exceeds file bounds");

    if (type === JSON_CHUNK) {
      const text = new TextDecoder().decode(buffer.slice(start, end)).replace(/[\u0000 ]+$/g, "");
      document = JSON.parse(text) as GltfDocument;
    } else if (type === BIN_CHUNK) {
      binary = buffer.slice(start, end);
    }

    offset = end;
  }

  if (!document) fail("JSON chunk is missing");
  if (!binary) fail("BIN chunk is missing");
  if (!document.buffers?.length || document.buffers[0].byteLength > binary.byteLength) {
    fail("binary chunk is shorter than the declared glTF buffer");
  }

  return { document, binary };
}

function readAccessor(
  document: GltfDocument,
  binary: ArrayBuffer,
  accessorIndex: number
): { array: SupportedArray; itemSize: number; normalized: boolean } {
  const accessor = document.accessors[accessorIndex];
  if (!accessor) fail(`accessor ${accessorIndex} is missing`);

  const bufferView = document.bufferViews[accessor.bufferView];
  if (!bufferView) fail(`bufferView ${accessor.bufferView} is missing`);
  if (bufferView.buffer !== 0) fail("only the embedded GLB buffer is supported");
  if (bufferView.byteStride) fail("interleaved accessors are not supported by this study asset");

  const Constructor = ARRAY_BY_COMPONENT_TYPE[accessor.componentType];
  if (!Constructor) fail(`component type ${accessor.componentType} is unsupported`);

  const itemSize = COMPONENTS_BY_TYPE[accessor.type];
  if (!itemSize) fail(`accessor type ${accessor.type} is unsupported`);

  const elementCount = accessor.count * itemSize;
  const byteLength = elementCount * Constructor.BYTES_PER_ELEMENT;
  const relativeOffset = accessor.byteOffset ?? 0;
  if (relativeOffset + byteLength > bufferView.byteLength) {
    fail(`accessor ${accessorIndex} exceeds bufferView ${accessor.bufferView}`);
  }

  const absoluteOffset = (bufferView.byteOffset ?? 0) + relativeOffset;
  if (absoluteOffset + byteLength > binary.byteLength) {
    fail(`accessor ${accessorIndex} exceeds binary chunk`);
  }

  // Copy each accessor into a tightly packed, zero-offset buffer. This avoids
  // browser TypedArray alignment/range sensitivity and gives the study a
  // deterministic compatibility boundary independent of GLTFLoader internals.
  const packed = binary.slice(absoluteOffset, absoluteOffset + byteLength);
  const array = new Constructor(packed, 0, elementCount);
  return { array, itemSize, normalized: accessor.normalized === true };
}

function makeMaterial(source: GltfMaterial | undefined, index: number): THREE.MeshStandardMaterial {
  const pbr = source?.pbrMetallicRoughness;
  const base = pbr?.baseColorFactor ?? [1, 1, 1, 1];
  const emissive = source?.emissiveFactor ?? [0, 0, 0];
  const transparent = source?.alphaMode === "BLEND" || base[3] < 1;

  return new THREE.MeshStandardMaterial({
    name: source?.name ?? `MISWAY_MATERIAL_${index}`,
    color: new THREE.Color(base[0], base[1], base[2]),
    opacity: base[3],
    transparent,
    depthWrite: !transparent,
    metalness: pbr?.metallicFactor ?? 1,
    roughness: pbr?.roughnessFactor ?? 1,
    emissive: new THREE.Color(emissive[0], emissive[1], emissive[2]),
    side: source?.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });
}

export function parseDrift3DOriginalVehicleGlb(buffer: ArrayBuffer): THREE.Group {
  const { document, binary } = parseChunks(buffer);
  const materials = (document.materials ?? []).map(makeMaterial);
  const root = new THREE.Group();
  root.name = "MISWAY_SAFARI_110_V1";

  document.meshes.forEach((meshDef, meshIndex) => {
    meshDef.primitives.forEach((primitive, primitiveIndex) => {
      if (primitive.mode !== undefined && primitive.mode !== 4) {
        fail(`mesh ${meshIndex} primitive ${primitiveIndex} is not TRIANGLES`);
      }

      const positionIndex = primitive.attributes.POSITION;
      if (positionIndex === undefined) fail(`mesh ${meshIndex} has no POSITION accessor`);
      const position = readAccessor(document, binary, positionIndex);
      if (!(position.array instanceof Float32Array) || position.itemSize !== 3) {
        fail(`mesh ${meshIndex} POSITION must be FLOAT VEC3`);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(position.array, position.itemSize, position.normalized)
      );

      const normalIndex = primitive.attributes.NORMAL;
      if (normalIndex !== undefined) {
        const normal = readAccessor(document, binary, normalIndex);
        if (!(normal.array instanceof Float32Array) || normal.itemSize !== 3) {
          fail(`mesh ${meshIndex} NORMAL must be FLOAT VEC3`);
        }
        geometry.setAttribute(
          "normal",
          new THREE.BufferAttribute(normal.array, normal.itemSize, normal.normalized)
        );
      } else {
        geometry.computeVertexNormals();
      }

      if (primitive.indices !== undefined) {
        const indices = readAccessor(document, binary, primitive.indices);
        if (indices.itemSize !== 1) fail(`mesh ${meshIndex} indices must be SCALAR`);
        geometry.setIndex(new THREE.BufferAttribute(indices.array, 1, false));
      }

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const materialIndex = primitive.material ?? -1;
      const material =
        materialIndex >= 0 && materials[materialIndex]
          ? materials[materialIndex]
          : new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = meshDef.name ?? `MISWAY_SAFARI_MESH_${meshIndex}_${primitiveIndex}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
    });
  });

  if (root.children.length === 0) fail("no renderable mesh was found");
  return root;
}

export async function loadDrift3DOriginalVehicleGlb(url: string): Promise<THREE.Group> {
  const response = await fetch(url);
  if (!response.ok) fail(`HTTP ${response.status} while loading ${url}`);
  return parseDrift3DOriginalVehicleGlb(await response.arrayBuffer());
}
