import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);

type MaterialKey =
  | "body"
  | "bodyShadow"
  | "roof"
  | "black"
  | "rubber"
  | "metal"
  | "glass"
  | "headlamp"
  | "red"
  | "amber";

function makeMaterials(): Record<MaterialKey, THREE.MeshStandardMaterial> {
  return {
    body: new THREE.MeshStandardMaterial({ name: "MISWAY_SAFARI_SAND", color: "#ab9464", metalness: 0.08, roughness: 0.58 }),
    bodyShadow: new THREE.MeshStandardMaterial({ name: "MISWAY_SAND_SHADOW", color: "#8e7a50", metalness: 0.08, roughness: 0.64 }),
    roof: new THREE.MeshStandardMaterial({ name: "WARM_IVORY_ROOF", color: "#d7d1c1", metalness: 0.02, roughness: 0.62 }),
    black: new THREE.MeshStandardMaterial({ name: "BLACK_POWDER_COAT", color: "#1a1b19", metalness: 0.35, roughness: 0.55 }),
    rubber: new THREE.MeshStandardMaterial({ name: "ALL_TERRAIN_RUBBER", color: "#131413", metalness: 0, roughness: 0.93 }),
    metal: new THREE.MeshStandardMaterial({ name: "AGED_STEEL", color: "#5d5b56", metalness: 0.65, roughness: 0.42 }),
    glass: new THREE.MeshStandardMaterial({ name: "SMOKED_GLASS", color: "#1f2c31", metalness: 0, roughness: 0.12, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide }),
    headlamp: new THREE.MeshStandardMaterial({ name: "HEADLAMP_GLASS", color: "#ffebb7", emissive: "#9e6f2a", emissiveIntensity: 0.45, metalness: 0, roughness: 0.18 }),
    red: new THREE.MeshStandardMaterial({ name: "REAR_LAMP", color: "#871e19", emissive: "#4d0805", emissiveIntensity: 0.35, metalness: 0, roughness: 0.26 }),
    amber: new THREE.MeshStandardMaterial({ name: "AMBER_LAMP", color: "#cd8013", emissive: "#6b3502", emissiveIntensity: 0.35, metalness: 0, roughness: 0.28 }),
  };
}

function roundedRectSection(width: number, y0: number, y1: number, chamfer: number) {
  const half = width / 2;
  const radius = Math.min(chamfer, width * 0.18, (y1 - y0) * 0.22);
  const centers: Array<[number, number, number, number]> = [
    [-half + radius, y0 + radius, Math.PI, Math.PI * 1.5],
    [half - radius, y0 + radius, Math.PI * 1.5, Math.PI * 2],
    [half - radius, y1 - radius, 0, Math.PI * 0.5],
    [-half + radius, y1 - radius, Math.PI * 0.5, Math.PI],
  ];
  const points: Array<[number, number]> = [];
  for (const [cx, cy, a0, a1] of centers) {
    for (let i = 0; i < 4; i += 1) {
      const a = a0 + ((a1 - a0) * i) / 4;
      points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
  }
  return points;
}

function loftGeometry(
  z: readonly number[],
  widths: readonly number[],
  y0: readonly number[],
  y1: readonly number[],
  chamfers: readonly number[]
) {
  const rings = z.map((zValue, i) =>
    roundedRectSection(widths[i], y0[i], y1[i], chamfers[i]).map(
      ([x, y]) => new THREE.Vector3(x, y, zValue)
    )
  );
  const ringSize = rings[0].length;
  const vertices: number[] = [];
  for (const ring of rings) for (const point of ring) vertices.push(point.x, point.y, point.z);

  const indices: number[] = [];
  for (let i = 0; i < rings.length - 1; i += 1) {
    const a = i * ringSize;
    const b = (i + 1) * ringSize;
    for (let j = 0; j < ringSize; j += 1) {
      const next = (j + 1) % ringSize;
      indices.push(a + j, a + next, b + next, a + j, b + next, b + j);
    }
  }

  const firstCenter = rings[0].reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / ringSize);
  const lastCenter = rings.at(-1)!.reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / ringSize);
  const firstIndex = vertices.length / 3;
  vertices.push(firstCenter.x, firstCenter.y, firstCenter.z, lastCenter.x, lastCenter.y, lastCenter.z);
  const lastIndex = firstIndex + 1;
  const lastOffset = (rings.length - 1) * ringSize;
  for (let j = 0; j < ringSize; j += 1) {
    const next = (j + 1) % ringSize;
    indices.push(firstIndex, next, j, lastIndex, lastOffset + j, lastOffset + next);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function quadGeometry(points: readonly THREE.Vector3[]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flatMap((point) => [point.x, point.y, point.z]), 3)
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

function tubeGeometry(from: THREE.Vector3, to: THREE.Vector3, radius: number, segments = 10) {
  const direction = to.clone().sub(from);
  const geometry = new THREE.CylinderGeometry(radius, radius, direction.length(), segments, 1, false);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().normalize()));
  geometry.translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
  return geometry;
}

function add(root: THREE.Group, name: string, geometry: THREE.BufferGeometry, material: THREE.Material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);
  return mesh;
}

function box(root: THREE.Group, name: string, size: [number, number, number], position: [number, number, number], material: THREE.Material) {
  const geometry = new THREE.BoxGeometry(...size);
  geometry.translate(...position);
  return add(root, name, geometry, material);
}

function tube(root: THREE.Group, name: string, from: [number, number, number], to: [number, number, number], radius: number, material: THREE.Material, segments = 10) {
  return add(root, name, tubeGeometry(new THREE.Vector3(...from), new THREE.Vector3(...to), radius, segments), material);
}

function quad(root: THREE.Group, name: string, points: Array<[number, number, number]>, material: THREE.Material) {
  return add(root, name, quadGeometry(points.map((point) => new THREE.Vector3(...point))), material);
}

export function buildDrift3DOriginalVehicle(): THREE.Group {
  const root = new THREE.Group();
  root.name = "MISWAY_SAFARI_110_V1";
  const material = makeMaterials();

  add(root, "body_shell", loftGeometry(
    [-2.18, -1.95, -1.55, -0.75, 0.30, 1.10, 1.65, 2.04],
    [1.72, 1.78, 1.80, 1.82, 1.82, 1.79, 1.74, 1.62],
    [0.62, 0.60, 0.58, 0.56, 0.56, 0.58, 0.60, 0.68],
    [1.05, 1.10, 1.16, 1.20, 1.20, 1.18, 1.10, 0.98],
    [0.10, 0.11, 0.12, 0.13, 0.13, 0.13, 0.12, 0.10]
  ), material.body);
  add(root, "cabin_glasshouse", loftGeometry(
    [-1.88, -1.65, -0.85, 0, 0.72, 0.98],
    [1.66, 1.72, 1.72, 1.72, 1.69, 1.57],
    [1.02, 1.04, 1.06, 1.06, 1.05, 1.06],
    [1.80, 1.88, 1.92, 1.92, 1.90, 1.77],
    [0.12, 0.14, 0.15, 0.15, 0.15, 0.14]
  ), material.glass);
  add(root, "roof", loftGeometry(
    [-1.85, -1.60, -0.50, 0.50, 0.82],
    [1.72, 1.76, 1.77, 1.76, 1.67],
    [1.82, 1.90, 1.94, 1.94, 1.90],
    [1.915, 1.995, 2.035, 2.035, 1.995],
    [0.055, 0.055, 0.055, 0.055, 0.055]
  ), material.roof);
  add(root, "hood", loftGeometry(
    [0.88, 1.15, 1.62, 2.02],
    [1.58, 1.66, 1.66, 1.54],
    [1.00, 0.98, 0.94, 0.88],
    [1.18, 1.20, 1.18, 1.07],
    [0.11, 0.12, 0.12, 0.10]
  ), material.body);

  for (const side of [-1, 1] as const) {
    const x = side * 0.873;
    quad(root, `glass_${side}_rear`, [[x,1.20,-1.70],[x,1.70,-1.64],[x,1.72,-0.95],[x,1.18,-0.98]], material.glass);
    quad(root, `glass_${side}_mid`, [[x,1.18,-0.86],[x,1.74,-0.82],[x,1.74,-0.08],[x,1.18,-0.10]], material.glass);
    quad(root, `glass_${side}_front`, [[x,1.18,0.02],[x,1.73,0.04],[x,1.65,0.70],[x,1.16,0.72]], material.glass);
    tube(root, `window_belt_${side}`, [side*0.875,1.10,-1.78], [side*0.875,1.10,0.82], 0.032, material.body);
    tube(root, `window_roofrail_${side}`, [side*0.875,1.78,-1.72], [side*0.875,1.78,0.77], 0.032, material.body);
    [-1.70,-0.91,-0.04,0.76].forEach((z, i) => tube(root, `pillar_${side}_${i}`, [side*0.875,1.08,z], [side*0.875,z < 0.5 ? 1.80 : 1.72,z+0.03], 0.038, material.body));
    tube(root, `side_step_${side}`, [side*0.94,0.45,-1.27], [side*0.94,0.45,1.18], 0.055, material.black, 8);
    [-0.88,0.02,0.78].forEach((z) => tube(root, `door_seam_${side}_${z}`, [side*0.913,1.04,z], [side*0.913,1.70,z], 0.010, material.black, 6));
    [-0.45,0.42].forEach((z) => tube(root, `handle_${side}_${z}`, [side*0.923,1.28,z-0.10], [side*0.923,1.28,z+0.08], 0.022, material.black, 8));
  }

  quad(root, "windshield_left", [[-0.74,1.15,0.735],[-0.03,1.15,0.735],[-0.03,1.70,0.94],[-0.74,1.70,0.94]], material.glass);
  quad(root, "windshield_right", [[0.03,1.15,0.735],[0.74,1.15,0.735],[0.74,1.70,0.94],[0.03,1.70,0.94]], material.glass);
  quad(root, "rear_window", [[-0.68,1.18,-1.895],[0.68,1.18,-1.895],[0.67,1.69,-1.895],[-0.67,1.69,-1.895]], material.glass);
  tube(root, "windshield_top_header", [-0.76,1.72,0.90], [0.76,1.72,0.90], 0.035, material.body);
  tube(root, "windshield_bottom_header", [-0.76,1.12,0.73], [0.76,1.12,0.73], 0.032, material.body);
  tube(root, "windshield_center", [0,1.12,0.73], [0,1.72,0.90], 0.025, material.body, 8);
  tube(root, "rear_window_top", [-0.72,1.72,-1.90], [0.72,1.72,-1.90], 0.035, material.body);
  tube(root, "rear_window_bottom", [-0.72,1.12,-1.90], [0.72,1.12,-1.90], 0.032, material.body);

  box(root, "front_grille", [1.28,0.23,0.035], [0,0.895,2.055], material.black);
  box(root, "front_bumper", [1.72,0.14,0.15], [0,0.66,2.16], material.black);
  box(root, "rear_bumper", [1.80,0.14,0.16], [0,0.65,-2.23], material.black);

  const wheelCenters: Array<[number, number, number]> = [[-0.93,0.62,1.42],[0.93,0.62,1.42],[-0.93,0.62,-1.46],[0.93,0.62,-1.46]];
  wheelCenters.forEach(([x,y,z], i) => {
    const tire = new THREE.TorusGeometry(0.34, 0.115, 12, 36); tire.rotateY(Math.PI/2); tire.translate(x,y,z); add(root, `tire_${i}`, tire, material.rubber);
    const rim = new THREE.CylinderGeometry(0.205,0.205,0.10,32); rim.rotateZ(Math.PI/2); rim.translate(x,y,z); add(root, `rim_${i}`, rim, material.metal);
    const hub = new THREE.CylinderGeometry(0.068,0.068,0.115,20); hub.rotateZ(Math.PI/2); hub.translate(x,y,z); add(root, `hub_${i}`, hub, material.black);
    for (let k = 0; k < 18; k += 1) {
      const a = Math.PI * 2 * k / 18;
      const tread = new THREE.BoxGeometry(0.115,0.055,0.105);
      tread.rotateX(-a);
      tread.translate(x, y + 0.445*Math.cos(a), z + 0.445*Math.sin(a));
      add(root, `tread_${i}_${k}`, tread, material.rubber);
    }
  });

  for (const side of [-1,1] as const) {
    for (const wheelZ of [1.42,-1.46]) {
      let previous: [number,number,number] | null = null;
      for (let i = 0; i <= 12; i += 1) {
        const a = THREE.MathUtils.degToRad(15 + 150*i/12);
        const current: [number,number,number] = [side*0.905,0.62+0.49*Math.sin(a),wheelZ+0.49*Math.cos(a)];
        if (previous) tube(root, `fender_${side}_${wheelZ}_${i}`, previous, current, 0.043, material.black, 8);
        previous = current;
      }
    }
  }

  const rackY = 2.08, rackZ0 = -1.75, rackZ1 = 0.82, rackX = 0.88;
  tube(root,"rack_left",[-rackX,rackY,rackZ0],[-rackX,rackY,rackZ1],0.027,material.black);
  tube(root,"rack_right",[rackX,rackY,rackZ0],[rackX,rackY,rackZ1],0.027,material.black);
  tube(root,"rack_rear",[-rackX,rackY,rackZ0],[rackX,rackY,rackZ0],0.027,material.black);
  tube(root,"rack_front",[-rackX,rackY,rackZ1],[rackX,rackY,rackZ1],0.027,material.black);
  for (let i=0;i<6;i+=1) { const z=rackZ0+0.15+(rackZ1-rackZ0-0.30)*i/5; tube(root,`rack_cross_${i}`,[-rackX,rackY,z],[rackX,rackY,z],0.021,material.black,8); }
  for (let i=0;i<5;i+=1) { const z=rackZ0+(rackZ1-rackZ0)*i/4; for (const side of [-1,1] as const) tube(root,`rack_post_${side}_${i}`,[side*rackX,rackY,z],[side*rackX,rackY+0.24,z],0.025,material.black,8); }
  tube(root,"rack_top_left",[-rackX,rackY+0.24,rackZ0],[-rackX,rackY+0.24,rackZ1],0.025,material.black);
  tube(root,"rack_top_right",[rackX,rackY+0.24,rackZ0],[rackX,rackY+0.24,rackZ1],0.025,material.black);

  for (const x of [-0.73,-0.48]) tube(root,`ladder_rail_${x}`,[x,0.82,-2.28],[x,1.92,-2.28],0.024,material.black,8);
  for (let i=0;i<5;i+=1) { const y=0.9+0.9*i/4; tube(root,`ladder_rung_${i}`,[-0.73,y,-2.28],[-0.48,y,-2.28],0.02,material.black,8); }

  const spare = new THREE.TorusGeometry(0.34,0.115,12,36); spare.translate(0,1.18,-2.35); add(root,"rear_spare_tire",spare,material.rubber);
  const spareRim = new THREE.CylinderGeometry(0.205,0.205,0.10,32); spareRim.rotateX(Math.PI/2); spareRim.translate(0,1.18,-2.35); add(root,"rear_spare_rim",spareRim,material.metal);

  tube(root,"snorkel_vertical",[0.92,1.06,0.55],[0.92,1.94,0.55],0.045,material.black,12);
  tube(root,"snorkel_head",[0.92,1.94,0.55],[0.92,2.02,0.46],0.052,material.black,12);
  for (const x of [-0.72,0.72]) tube(root,`bull_vert_${x}`,[x,0.62,2.21],[x,1.18,2.21],0.035,material.black);
  tube(root,"bull_top",[-0.72,1.14,2.21],[0.72,1.14,2.21],0.035,material.black);
  tube(root,"bull_mid",[-0.72,0.82,2.21],[0.72,0.82,2.21],0.028,material.black);

  for (const x of [-0.50,0.50]) { const g=new THREE.CylinderGeometry(0.115,0.115,0.045,28); g.rotateX(Math.PI/2); g.translate(x,0.91,2.09); add(root,`headlamp_${x}`,g,material.headlamp); }
  for (const x of [-0.73,0.73]) { const g=new THREE.CylinderGeometry(0.065,0.065,0.04,20); g.rotateX(Math.PI/2); g.translate(x,0.92,2.08); add(root,`front_amber_${x}`,g,material.amber); }
  for (const x of [-0.68,0.68]) { const g=new THREE.CylinderGeometry(0.075,0.075,0.04,20); g.rotateX(Math.PI/2); g.translate(x,0.90,-2.18); add(root,`rear_red_${x}`,g,material.red); }

  for (const side of [-1,1] as const) box(root,`bonnet_vent_${side}`,[0.025,0.12,0.24],[side*0.79,1.09,1.05],material.black);
  for (const z of [1.42,-1.46]) tube(root,`axle_${z}`,[-0.86,0.58,z],[0.86,0.58,z],0.055,material.black,12);
  box(root,"chassis",[1.0,0.14,3.20],[0,0.46,-0.05],material.black);

  [[-0.35,2.15,-0.75,0.55,0.18,0.75],[0.35,2.15,-0.68,0.50,0.16,0.55]].forEach((entry,i) => {
    const [x,y,z,sx,sy,sz]=entry;
    const g=new THREE.IcosahedronGeometry(1,2); g.scale(sx,sy,sz); g.translate(x,y,z); add(root,`roof_bag_${i}`,g,material.bodyShadow);
  });

  return root;
}

export function getDrift3DOriginalVehicleGeometryStats(root: THREE.Object3D) {
  let meshCount = 0;
  let triangleCount = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    meshCount += 1;
    const geometry = object.geometry;
    const index = geometry.getIndex();
    const position = geometry.getAttribute("position");
    triangleCount += index ? index.count / 3 : position.count / 3;
  });
  const box = new THREE.Box3().setFromObject(root);
  return { meshCount, triangleCount, box, size: box.getSize(new THREE.Vector3()) };
}
