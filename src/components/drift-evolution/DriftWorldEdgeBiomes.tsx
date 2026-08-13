"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  getDriftMaterialMaps,
  setDriftGeometryTextureRepeat,
} from "@/components/drift-3d/drift3dTextureFactory";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_3D_NORTH_EAST_OCEAN,
  DRIFT_3D_SOUTH_VOID,
} from "@/lib/drift3dWorldEdges";

const lateralMountains = Object.freeze({
  innerX: 112,
  outerX: 166,
  westMinZ: -90,
  eastMinZ: -90,
  maxZ: 72,
  westNorthFadeEndZ: -56,
  eastNorthFadeEndZ: -18,
  eastOceanRevealStartZ: -72,
  eastOceanRevealEndZ: -16,
  southFadeStartZ: 54,
  acrossSegments: 18,
  alongSegments: 34,
});

const oceanVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;
  varying vec3 vWorldPosition;
  varying float vFogDepth;
  varying float vWave;

  void main() {
    vec3 displaced = position;
    float longWave = sin(position.x * 0.055 + uTime * 0.34);
    float crossWave = sin(position.y * 0.085 - uTime * 0.27);
    float fineWave = sin((position.x + position.y) * 0.12 + uTime * 0.21);
    vWave = (longWave + crossWave + fineWave) / 3.0;
    displaced.z += vWave * uWaveAmplitude;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    vWorldPosition = worldPosition.xyz;
    vFogDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const oceanFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uNearZ;
  uniform vec3 uCameraPosition;
  uniform vec3 fogColor;
  uniform float fogDensity;
  varying vec3 vWorldPosition;
  varying float vFogDepth;
  varying float vWave;

  void main() {
    vec2 p = vWorldPosition.xz;
    vec3 normal = normalize(vec3(
      0.10 * cos(p.x * 0.055 + uTime * 0.34) +
        0.05 * cos((p.x + p.y) * 0.12 + uTime * 0.21),
      1.0,
      0.09 * cos(p.y * 0.085 - uTime * 0.27) +
        0.05 * cos((p.x + p.y) * 0.12 + uTime * 0.21)
    ));
    vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - clamp(dot(viewDirection, normal), 0.0, 1.0), 2.7);
    float shoreDistance = max(0.0, uNearZ - vWorldPosition.z);
    float shore = 1.0 - smoothstep(0.0, 11.0, shoreDistance);
    float glint = smoothstep(0.58, 0.96, vWave * 0.5 + 0.5);

    vec3 deep = vec3(0.018, 0.060, 0.082);
    vec3 horizon = vec3(0.26, 0.31, 0.33);
    vec3 color = mix(deep, horizon, 0.10 + fresnel * 0.78);
    color += vec3(0.18, 0.16, 0.12) * glint * 0.10;
    color += vec3(0.33, 0.35, 0.32) * shore * (0.10 + glint * 0.12);

    float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    color = mix(color, fogColor, clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
  }
`;

const cosmicVertexShader = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cosmicFragmentShader = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    float below = 1.0 - smoothstep(-0.48, 0.14, vDirection.y);
    float south = smoothstep(-0.24, 0.34, vDirection.z);
    float horizon = 1.0 - smoothstep(0.08, 0.46, abs(vDirection.y));
    float southernVoid = max(
      below * 0.96,
      south * (0.84 + horizon * 0.16)
    );

    vec3 nearBlack = vec3(0.0015, 0.0020, 0.0060);
    vec3 deepBlue = vec3(0.0055, 0.0080, 0.0200);
    vec3 color = mix(
      deepBlue,
      nearBlack,
      clamp(below * 0.68 + south * 0.26, 0.0, 1.0)
    );

    float alpha = 0.055 + clamp(southernVoid, 0.0, 1.0) * 0.925;
    gl_FragColor = vec4(color, alpha);
  }
`;

function edgeNoise(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function smoothstep01(value: number) {
  const t = Math.min(1, Math.max(0, value));

  return t * t * (3 - 2 * t);
}

function createEdgeRibbon(options: {
  minX: number;
  maxX: number;
  startZ: number;
  endZ: number;
  acrossSegments: number;
  alongSegments: number;
  getY: (x: number, progress: number) => number;
}) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let along = 0; along <= options.alongSegments; along += 1) {
    const progress = along / options.alongSegments;
    const z = options.startZ + (options.endZ - options.startZ) * progress;

    for (let across = 0; across <= options.acrossSegments; across += 1) {
      const acrossProgress = across / options.acrossSegments;
      const x = options.minX + (options.maxX - options.minX) * acrossProgress;
      positions.push(x, options.getY(x, progress), z);
      uvs.push(acrossProgress * 8, progress * 2);
    }
  }

  const row = options.acrossSegments + 1;
  for (let along = 0; along < options.alongSegments; along += 1) {
    for (let across = 0; across < options.acrossSegments; across += 1) {
      const a = along * row + across;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  setDriftGeometryTextureRepeat(geometry, 8, 2);
  geometry.computeVertexNormals();

  return geometry;
}

function createLateralMountainGeometry(side: -1 | 1) {
  const config = lateralMountains;
  const minZ = side < 0 ? config.westMinZ : config.eastMinZ;
  const northFadeEndZ =
    side < 0 ? config.westNorthFadeEndZ : config.eastNorthFadeEndZ;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const row = config.acrossSegments + 1;
  const sideScale = side < 0 ? 1.08 : 0.94;

  for (let along = 0; along <= config.alongSegments; along += 1) {
    const alongProgress = along / config.alongSegments;
    const z = minZ + (config.maxZ - minZ) * alongProgress;
    const northFade = smoothstep01(
      (z - minZ) / (northFadeEndZ - minZ)
    );
    const southFade =
      1 -
      smoothstep01(
        (z - config.southFadeStartZ) /
          (config.maxZ - config.southFadeStartZ)
      );
    const edgeEnvelope = northFade * southFade;
    const seamX = side * config.innerX;
    const seamY = getDrift3DGroundY(seamX, z) + 0.01;
    const macro =
      0.76 +
      Math.sin(z * 0.073 + side * 0.9) * 0.16 +
      Math.sin(z * 0.151 - side * 0.55) * 0.08;
    const eastOceanExposure =
      side < 0
        ? 0
        : 1 -
          smoothstep01(
            (z - config.eastOceanRevealStartZ) /
              (config.eastOceanRevealEndZ - config.eastOceanRevealStartZ)
          );

    for (let across = 0; across <= config.acrossSegments; across += 1) {
      const progress = across / config.acrossSegments;
      const outward =
        config.innerX + (config.outerX - config.innerX) * progress;
      const x = side * outward;
      const shoulder = smoothstep01(progress / 0.22);
      const crest =
        Math.exp(-Math.pow((progress - 0.56) / 0.24, 2) * 2.2) *
        shoulder;
      const farShoulder = smoothstep01((progress - 0.34) / 0.66);
      const oceanWindowAcross = smoothstep01((progress - 0.1) / 0.76);
      const oceanWindow =
        side < 0
          ? 1
          : 1 - eastOceanExposure * oceanWindowAcross * 0.82;
      const roughness =
        (edgeNoise(along * row + across, side < 0 ? 17 : 29) - 0.5) *
        3.1 *
        shoulder *
        edgeEnvelope *
        oceanWindow;
      const rise =
        edgeEnvelope *
          oceanWindow *
          sideScale *
          (shoulder * 2.4 + crest * (11.5 + macro * 8.5) + farShoulder * 5.2) +
        roughness;

      positions.push(x, seamY + rise, z);
      uvs.push(progress, alongProgress);
    }
  }

  for (let along = 0; along < config.alongSegments; along += 1) {
    for (let across = 0; across < config.acrossSegments; across += 1) {
      const a = along * row + across;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      if (side < 0) {
        indices.push(a, b, c, b, d, c);
      } else {
        indices.push(a, c, b, b, c, d);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  setDriftGeometryTextureRepeat(geometry, 6, 10);
  geometry.computeVertexNormals();

  return geometry;
}

function EdgeTerrainTransitions() {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const southVoid = DRIFT_3D_SOUTH_VOID;
  const maps = getDriftMaterialMaps("rock");
  const coastGeometry = useMemo(
    () =>
      createEdgeRibbon({
        minX: ocean.minX,
        maxX: 116,
        startZ: ocean.coastZ,
        endZ: ocean.nearZ,
        acrossSegments: ocean.coastSegmentsX,
        alongSegments: ocean.coastSegmentsZ,
        getY: (x, progress) => {
          const landY = getDrift3DGroundY(x, ocean.coastZ) + 0.015;
          const submergedY = ocean.waterY - 0.58;

          return landY + (submergedY - landY) * smoothstep01(progress);
        },
      }),
    [ocean]
  );
  const southCliffGeometry = useMemo(
    () =>
      createEdgeRibbon({
        minX: -116,
        maxX: 116,
        startZ: southVoid.cliffStartZ,
        endZ: southVoid.cliffEndZ,
        acrossSegments: southVoid.cliffSegmentsX,
        alongSegments: southVoid.cliffSegmentsZ,
        getY: (x, progress) => {
          const landY = getDrift3DGroundY(x, southVoid.cliffStartZ) + 0.015;
          const abyssY = southVoid.floorY + 1;

          return landY + (abyssY - landY) * smoothstep01(progress);
        },
      }),
    [southVoid]
  );

  useEffect(
    () => () => {
      coastGeometry.dispose();
      southCliffGeometry.dispose();
    },
    [coastGeometry, southCliffGeometry]
  );

  return (
    <group aria-hidden="true">
      <mesh geometry={coastGeometry} receiveShadow renderOrder={2}>
        <meshStandardMaterial
          map={maps.map ?? undefined}
          normalMap={maps.normalMap ?? undefined}
          normalScale={new THREE.Vector2(0.72, 0.72)}
          color="#767067"
          roughness={0.96}
        />
      </mesh>
      <mesh geometry={southCliffGeometry} receiveShadow renderOrder={2}>
        <meshStandardMaterial
          map={maps.map ?? undefined}
          normalMap={maps.normalMap ?? undefined}
          normalScale={new THREE.Vector2(1.1, 1.1)}
          color="#302f34"
          roughness={0.99}
        />
      </mesh>
    </group>
  );
}

function LateralMountainBorders() {
  const maps = getDriftMaterialMaps("rock");
  const westGeometry = useMemo(() => createLateralMountainGeometry(-1), []);
  const eastGeometry = useMemo(() => createLateralMountainGeometry(1), []);

  useEffect(
    () => () => {
      westGeometry.dispose();
      eastGeometry.dispose();
    },
    [eastGeometry, westGeometry]
  );

  return (
    <group aria-hidden="true">
      {[westGeometry, eastGeometry].map((geometry, index) => (
        <mesh
          key={index === 0 ? "west-mountains" : "east-mountains"}
          geometry={geometry}
          receiveShadow
          castShadow
          renderOrder={1}
        >
          <meshStandardMaterial
            map={maps.map ?? undefined}
            normalMap={maps.normalMap ?? undefined}
            normalScale={new THREE.Vector2(0.88, 0.88)}
            color="#8b877e"
            roughness={0.985}
          />
        </mesh>
      ))}
    </group>
  );
}

function NorthEastOcean() {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: oceanVertexShader,
        fragmentShader: oceanFragmentShader,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uWaveAmplitude: { value: ocean.waveAmplitude },
            uNearZ: { value: ocean.nearZ },
            uCameraPosition: { value: new THREE.Vector3() },
          },
        ]),
        fog: true,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
      }),
    [ocean.nearZ, ocean.waveAmplitude]
  );

  useEffect(() => {
    materialRef.current = material;

    return () => {
      materialRef.current = null;
      material.dispose();
    };
  }, [material]);

  useFrame(({ camera, clock }) => {
    const current = materialRef.current;
    if (!current) return;

    current.uniforms.uTime.value = clock.elapsedTime;
    (current.uniforms.uCameraPosition.value as THREE.Vector3).copy(camera.position);
  });

  return (
    <mesh
      position={[
        (ocean.minX + ocean.maxX) / 2,
        ocean.waterY,
        (ocean.nearZ + ocean.farZ) / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      receiveShadow
      renderOrder={1}
      aria-hidden="true"
    >
      <planeGeometry
        args={[
          ocean.maxX - ocean.minX,
          ocean.nearZ - ocean.farZ,
          ocean.surfaceSegmentsX,
          ocean.surfaceSegmentsZ,
        ]}
      />
    </mesh>
  );
}

function CosmicSky() {
  const southVoid = DRIFT_3D_SOUTH_VOID;
  const groupRef = useRef<THREE.Group>(null);
  const cosmicMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: cosmicVertexShader,
        fragmentShader: cosmicFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.BackSide,
        fog: false,
      }),
    []
  );
  const starPositions = useMemo(() => {
    const starCount = Math.max(280, southVoid.starCount);
    const positions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const theta = edgeNoise(index, 3) * Math.PI * 2;
      const vertical = edgeNoise(index, 7) * 2 - 1;
      const horizontal = Math.sqrt(Math.max(0, 1 - vertical * vertical));
      const radius = 132 + edgeNoise(index, 11) * 34;

      positions[index * 3] = Math.cos(theta) * horizontal * radius;
      positions[index * 3 + 1] = vertical * radius;
      positions[index * 3 + 2] = Math.sin(theta) * horizontal * radius;
    }

    return positions;
  }, [southVoid.starCount]);

  useEffect(() => () => cosmicMaterial.dispose(), [cosmicMaterial]);

  useFrame(({ camera }) => {
    groupRef.current?.position.copy(camera.position);
  });

  return (
    <group ref={groupRef} aria-hidden="true">
      <mesh material={cosmicMaterial} renderOrder={-2}>
        <sphereGeometry args={[178, 28, 18]} />
      </mesh>

      <points frustumCulled={false} renderOrder={-1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.42}
          sizeAttenuation
          color="#e2e9f7"
          transparent
          opacity={0.88}
          fog={false}
          depthWrite={false}
          depthTest
        />
      </points>
    </group>
  );
}

export default function DriftWorldEdgeBiomes() {
  return (
    <>
      <EdgeTerrainTransitions />
      <LateralMountainBorders />
      <NorthEastOcean />
      <CosmicSky />
    </>
  );
}
