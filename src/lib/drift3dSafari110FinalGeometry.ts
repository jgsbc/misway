import * as THREE from "three";
import {
  buildDrift3DOriginalVehicle,
  getDrift3DOriginalVehicleGeometryStats,
} from "./drift3dOriginalVehicleGeometry";

const UP = new THREE.Vector3(0, 1, 0);

export const DRIFT_SAFARI_110_RUNTIME_SCALE = 0.32;
export const DRIFT_SAFARI_110_RUNTIME_Y_OFFSET = -0.053;
export const DRIFT_SAFARI_110_WHEEL_PIVOT_NAMES = Object.freeze([
  "wheel_roll_0",
  "wheel_roll_1",
  "wheel_roll_2",
  "wheel_roll_3",
] as const);

const WHEEL_CENTERS = Object.freeze([
  [-0.93, 0.62, 1.42],
  [0.93, 0.62, 1.42],
  [-0.93, 0.62, -1.46],
  [0.93, 0.62, -1.46],
] as const);

function material(
  name: string,
  color: string,
  roughness: number,
  metalness = 0,
  emissive?: string
) {
  return new THREE.MeshStandardMaterial({
    name,
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity: emissive ? 0.42 : 0,
  });
}

function add(
  root: THREE.Group,
  name: string,
  geometry: THREE.BufferGeometry,
  meshMaterial: THREE.Material
) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);
  return mesh;
}

function box(
  root: THREE.Group,
  name: string,
  size: [number, number, number],
  position: [number, number, number],
  meshMaterial: THREE.Material,
  rotation?: [number, number, number]
) {
  const geometry = new THREE.BoxGeometry(...size);
  if (rotation) geometry.rotateX(rotation[0]), geometry.rotateY(rotation[1]), geometry.rotateZ(rotation[2]);
  geometry.translate(...position);
  return add(root, name, geometry, meshMaterial);
}

function tube(
  root: THREE.Group,
  name: string,
  from: [number, number, number],
  to: [number, number, number],
  radius: number,
  meshMaterial: THREE.Material,
  segments = 10
) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const direction = b.clone().sub(a);
  const geometry = new THREE.CylinderGeometry(radius, radius, direction.length(), segments, 1, false);
  geometry.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().normalize())
  );
  geometry.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return add(root, name, geometry, meshMaterial);
}

function frontDisk(
  root: THREE.Group,
  name: string,
  radius: number,
  depth: number,
  position: [number, number, number],
  meshMaterial: THREE.Material,
  segments = 28
) {
  const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(...position);
  return add(root, name, geometry, meshMaterial);
}

function frontRing(
  root: THREE.Group,
  name: string,
  radius: number,
  thickness: number,
  position: [number, number, number],
  meshMaterial: THREE.Material
) {
  const geometry = new THREE.TorusGeometry(radius, thickness, 10, 32);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(...position);
  return add(root, name, geometry, meshMaterial);
}

function wheelFace(
  root: THREE.Group,
  index: number,
  center: readonly [number, number, number],
  sandMetal: THREE.Material,
  black: THREE.Material
) {
  const [x, y, z] = center;
  const side = Math.sign(x) || 1;
  const faceX = x + side * 0.125;
  const rim = new THREE.CylinderGeometry(0.215, 0.215, 0.038, 28);
  rim.rotateZ(Math.PI / 2);
  rim.translate(faceX, y, z);
  add(root, `wheel_face_${index}`, rim, sandMetal);

  const hub = new THREE.CylinderGeometry(0.072, 0.072, 0.046, 18);
  hub.rotateZ(Math.PI / 2);
  hub.translate(faceX + side * 0.006, y, z);
  add(root, `wheel_face_hub_${index}`, hub, black);

  for (let lug = 0; lug < 6; lug += 1) {
    const angle = (Math.PI * 2 * lug) / 6;
    const lugGeometry = new THREE.SphereGeometry(0.013, 8, 6);
    lugGeometry.translate(
      faceX + side * 0.028,
      y + Math.cos(angle) * 0.112,
      z + Math.sin(angle) * 0.112
    );
    add(root, `wheel_lug_${index}_${lug}`, lugGeometry, black);
  }
}

function bindWheelPivots(root: THREE.Group) {
  WHEEL_CENTERS.forEach(([x, y, z], index) => {
    const pivot = new THREE.Group();
    pivot.name = DRIFT_SAFARI_110_WHEEL_PIVOT_NAMES[index];
    pivot.position.set(x, y, z);

    const prefixMatches = [
      `tread_${index}_`,
      `wheel_lug_${index}_`,
    ];
    const exactMatches = new Set([
      `tire_${index}`,
      `rim_${index}`,
      `hub_${index}`,
      `wheel_face_${index}`,
      `wheel_face_hub_${index}`,
    ]);

    const wheelObjects = root.children.filter(
      (child) =>
        exactMatches.has(child.name) ||
        prefixMatches.some((prefix) => child.name.startsWith(prefix))
    );

    for (const child of wheelObjects) {
      root.remove(child);
      child.position.set(-x, -y, -z);
      pivot.add(child);
    }

    root.add(pivot);
  });
}

/**
 * Owner-approved VEH-B03 visual pass. It deliberately builds on the existing
 * MISWAY-owned Safari 110 source instead of introducing a third-party model.
 * The additions target the approved multiview concept: stronger original
 * fascia, sand steel wheels, expedition cargo, custom rear treatment and
 * denser underbody/bumper detail while keeping realtime geometry bounded.
 */
export function buildDrift3DSafari110FinalVehicle(): THREE.Group {
  const root = buildDrift3DOriginalVehicle();
  root.name = "MISWAY_SAFARI_110_V2_APPROVED";

  const black = material("SAFARI_110_BLACK_COAT", "#151715", 0.52, 0.38);
  const dark = material("SAFARI_110_DARK_METAL", "#373835", 0.48, 0.55);
  const sandMetal = material("SAFARI_110_SAND_STEEL", "#a58b58", 0.58, 0.24);
  const canvas = material("SAFARI_110_CANVAS", "#88724f", 0.92, 0.01);
  const caseMaterial = material("SAFARI_110_HARD_CASE", "#242725", 0.72, 0.16);
  const lamp = material("SAFARI_110_HEADLAMP", "#fff0c8", 0.18, 0.05, "#8d6328");
  const amber = material("SAFARI_110_AMBER", "#d68120", 0.28, 0.02, "#6f3504");
  const red = material("SAFARI_110_RED", "#8c211c", 0.3, 0.02, "#480805");
  const clear = material("SAFARI_110_CLEAR_LAMP", "#d8d5c7", 0.2, 0.08, "#403c30");

  const oldGrille = root.getObjectByName("front_grille");
  if (oldGrille) oldGrille.visible = false;
  for (const x of [-0.5, 0.5]) {
    const oldLamp = root.getObjectByName(`headlamp_${x}`);
    if (oldLamp) oldLamp.visible = false;
  }
  for (const x of [-0.73, 0.73]) {
    const oldAmber = root.getObjectByName(`front_amber_${x}`);
    if (oldAmber) oldAmber.visible = false;
  }

  // Original MISWAY fascia: broad black mask, inset grille and twin round lamps.
  box(root, "v2_front_mask", [1.58, 0.43, 0.055], [0, 0.94, 2.075], black);
  box(root, "v2_grille_recess", [0.93, 0.31, 0.035], [0, 0.92, 2.11], dark);
  for (let index = -4; index <= 4; index += 1) {
    tube(
      root,
      `v2_grille_slant_${index}`,
      [index * 0.09 - 0.06, 0.79, 2.132],
      [index * 0.09 + 0.06, 1.05, 2.132],
      0.012,
      black,
      7
    );
  }
  tube(root, "v2_grille_spine_left", [-0.11, 0.77, 2.143], [-0.11, 1.08, 2.143], 0.018, black, 8);
  tube(root, "v2_grille_spine_right", [0.11, 0.77, 2.143], [0.11, 1.08, 2.143], 0.018, black, 8);

  for (const x of [-0.57, 0.57]) {
    frontDisk(root, `v2_headlamp_bucket_${x}`, 0.17, 0.045, [x, 0.98, 2.125], black, 30);
    frontRing(root, `v2_headlamp_ring_${x}`, 0.116, 0.018, [x, 0.98, 2.153], clear);
    frontDisk(root, `v2_headlamp_core_${x}`, 0.09, 0.03, [x, 0.98, 2.162], lamp, 28);
    frontDisk(root, `v2_marker_${x}`, 0.038, 0.025, [x, 0.78, 2.155], amber, 18);
  }

  box(root, "v2_hood_brow", [1.48, 0.075, 0.16], [0, 1.16, 1.93], sandMetal, [-0.08, 0, 0]);
  box(root, "v2_front_bumper_center", [1.48, 0.16, 0.2], [0, 0.63, 2.2], black);
  box(root, "v2_front_bumper_left", [0.34, 0.18, 0.16], [-0.78, 0.65, 2.15], black);
  box(root, "v2_front_bumper_right", [0.34, 0.18, 0.16], [0.78, 0.65, 2.15], black);
  box(root, "v2_skid_plate", [1.02, 0.055, 0.34], [0, 0.49, 2.05], dark, [-0.34, 0, 0]);
  for (const x of [-0.44, 0.44]) {
    frontRing(root, `v2_recovery_hook_${x}`, 0.055, 0.014, [x, 0.61, 2.31], dark);
  }

  // Stronger lower body and subtle panel signature without copying a marque.
  for (const side of [-1, 1] as const) {
    box(root, `v2_rocker_${side}`, [0.095, 0.12, 2.56], [side * 0.93, 0.53, -0.03], black);
    tube(root, `v2_panel_diag_${side}`, [side * 0.918, 0.73, -1.08], [side * 0.918, 1.08, -0.82], 0.014, dark, 7);
    tube(root, `v2_panel_diag_rear_${side}`, [side * 0.918, 0.74, -1.75], [side * 0.918, 1.02, -1.52], 0.014, dark, 7);
  }

  WHEEL_CENTERS.forEach((center, index) => wheelFace(root, index, center, sandMetal, black));

  // Roof expedition kit: hard cases plus restrained tan canvas rolls.
  box(root, "v2_roof_case_main", [0.76, 0.22, 0.78], [-0.38, 2.26, -0.88], caseMaterial);
  box(root, "v2_roof_case_front", [0.58, 0.18, 0.52], [-0.46, 2.24, 0.34], caseMaterial);
  for (const [index, x, z, length] of [
    [0, 0.42, -0.92, 0.72],
    [1, 0.42, -0.18, 0.62],
    [2, 0.42, 0.45, 0.54],
  ] as const) {
    const roll = new THREE.CylinderGeometry(0.13, 0.13, length, 14);
    roll.rotateZ(Math.PI / 2);
    roll.translate(x, 2.25, z);
    add(root, `v2_canvas_roll_${index}`, roll, canvas);
    for (const strapX of [x - length * 0.28, x + length * 0.28]) {
      tube(root, `v2_canvas_strap_${index}_${strapX}`, [strapX, 2.12, z], [strapX, 2.38, z], 0.014, black, 7);
    }
  }

  // Custom rear panel, stacked lamps and reinforced spare carrier.
  for (const side of [-1, 1] as const) {
    box(root, `v2_rear_lamp_housing_${side}`, [0.18, 0.52, 0.055], [side * 0.74, 0.98, -2.205], black);
    frontDisk(root, `v2_rear_red_${side}`, 0.052, 0.026, [side * 0.74, 1.09, -2.242], red, 18);
    frontDisk(root, `v2_rear_amber_${side}`, 0.045, 0.026, [side * 0.74, 0.96, -2.242], amber, 18);
    frontDisk(root, `v2_rear_clear_${side}`, 0.042, 0.026, [side * 0.74, 0.84, -2.242], clear, 18);
  }
  tube(root, "v2_spare_carrier_left", [-0.31, 0.72, -2.31], [-0.31, 1.53, -2.31], 0.032, black, 9);
  tube(root, "v2_spare_carrier_right", [0.31, 0.72, -2.31], [0.31, 1.53, -2.31], 0.032, black, 9);
  tube(root, "v2_spare_carrier_cross", [-0.31, 1.18, -2.31], [0.31, 1.18, -2.31], 0.03, black, 9);
  box(root, "v2_rear_bumper_center", [1.54, 0.16, 0.2], [0, 0.63, -2.29], black);
  box(root, "v2_rear_bumper_left", [0.32, 0.18, 0.16], [-0.79, 0.65, -2.24], black);
  box(root, "v2_rear_bumper_right", [0.32, 0.18, 0.16], [0.79, 0.65, -2.24], black);

  bindWheelPivots(root);
  return root;
}

export function getDrift3DSafari110FinalGeometryStats(root: THREE.Object3D) {
  return getDrift3DOriginalVehicleGeometryStats(root);
}
