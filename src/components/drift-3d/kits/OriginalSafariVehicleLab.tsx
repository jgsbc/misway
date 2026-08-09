"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ACESFilmicToneMapping } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  disposeDrift3DKitObject3D,
  loadDrift3DKitGltf,
} from "@/lib/drift3dKitGltfLoader";
import {
  DRIFT_3D_ORIGINAL_VEHICLE,
  getDrift3DOriginalVehicleUrl,
} from "@/lib/drift3dOriginalVehicle";

export type OriginalVehicleView = "rear-three-quarter" | "side" | "front-three-quarter";

const VIEW_POSITIONS: Readonly<Record<OriginalVehicleView, readonly [number, number, number]>> = {
  "rear-three-quarter": [5.7, 3.1, -6.6],
  side: [7.1, 2.65, 0],
  "front-three-quarter": [5.7, 3.1, 6.6],
};

const VIEW_LABELS: ReadonlyArray<{ id: OriginalVehicleView; label: string }> = [
  { id: "rear-three-quarter", label: "Rear 3/4" },
  { id: "side", label: "Side" },
  { id: "front-three-quarter", label: "Front 3/4" },
];

function VehicleOrbitControls({ view }: { view: OriginalVehicleView }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 3.8;
    controls.maxDistance = 13;
    controls.minPolarAngle = 0.32;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 1.04, 0);
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const position = VIEW_POSITIONS[view];
    camera.position.set(...position);
    controls.target.set(0, 1.04, 0);
    controls.update();
  }, [camera, view]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function OriginalSafariVehicle({ onStatus }: { onStatus: (status: string) => void }) {
  const [root, setRoot] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let active = true;
    let loadedRoot: THREE.Group | null = null;

    loadDrift3DKitGltf(getDrift3DOriginalVehicleUrl())
      .then((gltf) => {
        loadedRoot = gltf.scene;

        if (!active) {
          disposeDrift3DKitObject3D(loadedRoot);
          return;
        }

        loadedRoot.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.castShadow = true;
          object.receiveShadow = true;

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          for (const material of materials) {
            if (material.name === "SMOKED_GLASS" && material instanceof THREE.MeshStandardMaterial) {
              material.transparent = true;
              material.opacity = 0.62;
              material.depthWrite = false;
              material.roughness = 0.12;
            }
          }
        });

        setRoot(loadedRoot);
        onStatus("Original GLB loaded · inspect silhouette, glazing, wheels and safari equipment.");
      })
      .catch((error: unknown) => {
        onStatus(`GLB load failed: ${String(error)}`);
      });

    return () => {
      active = false;
      if (loadedRoot) {
        disposeDrift3DKitObject3D(loadedRoot);
      }
    };
  }, [onStatus]);

  if (!root) return null;

  return <primitive object={root} position={[0, -0.1475, 0]} />;
}

export default function OriginalSafariVehicleLab() {
  const [view, setView] = useState<OriginalVehicleView>("rear-three-quarter");
  const [status, setStatus] = useState("Loading MISWAY original GLB…");
  const asset = DRIFT_3D_ORIGINAL_VEHICLE;

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#c8c0ae] text-[#171714]">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: VIEW_POSITIONS[view] as [number, number, number], fov: 37, near: 0.1, far: 80 }}
          dpr={[1, 1.75]}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: ACESFilmicToneMapping,
          }}
        >
          <color attach="background" args={["#c8c0ae"]} />
          <fog attach="fog" args={["#c8c0ae", 18, 42]} />
          <hemisphereLight args={["#f4efe3", "#50483a", 1.3]} />
          <directionalLight
            position={[5.5, 8.5, 5.8]}
            intensity={2.35}
            castShadow
            shadow-mapSize={[1536, 1536]}
            shadow-camera-near={0.5}
            shadow-camera-far={26}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
          />
          <directionalLight position={[-4.5, 3.2, -5]} intensity={0.65} color="#aabac2" />
          <directionalLight position={[0, 4, -6]} intensity={0.35} color="#e8cf9c" />

          <OriginalSafariVehicle onStatus={setStatus} />
          <VehicleOrbitControls view={view} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[28, 28]} />
            <meshStandardMaterial color="#a99d82" roughness={0.96} metalness={0} />
          </mesh>
          <gridHelper args={[18, 18, "#817762", "#9c9178"]} position={[0, 0.004, 0]} />
        </Canvas>
      </div>

      <section className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 w-[min(88vw,30rem)] md:left-6 md:top-6">
        <div className="rounded-sm border border-black/15 bg-[#eee8da]/88 p-4 shadow-lg backdrop-blur-md md:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/45">
            MISWΛY · VEH-B01 · original GLB · Kit Lab only
          </p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
            MISWAY Safari 110 · v1
          </h1>
          <p className="mt-2 text-xs leading-5 text-black/62 md:text-sm">
            Original MISWAY geometry. No commercial vehicle mesh is included. The reference is the expedition/safari language; this model owns its proportions, surfacing and details.
          </p>
          <dl className="mt-3 grid grid-cols-4 gap-2 border-t border-black/10 pt-3 font-mono text-[8px] uppercase tracking-[0.1em] text-black/52">
            <div><dt>Length</dt><dd className="mt-1 text-black/80">{asset.dimensionsMeters.length.toFixed(2)} m</dd></div>
            <div><dt>Width</dt><dd className="mt-1 text-black/80">{asset.dimensionsMeters.width.toFixed(2)} m</dd></div>
            <div><dt>Height</dt><dd className="mt-1 text-black/80">{asset.dimensionsMeters.height.toFixed(2)} m</dd></div>
            <div><dt>Triangles</dt><dd className="mt-1 text-black/80">{asset.triangleCount.toLocaleString("en-US")}</dd></div>
          </dl>
          <div className="mt-3 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-black/48">
            <span className="h-5 w-5 rounded-full border border-black/20" style={{ backgroundColor: asset.bodyColor }} />
            <span>Safari sand {asset.bodyColor}</span>
          </div>
          <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.11em] text-black/48">{status}</p>
        </div>
      </section>

      <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2 md:bottom-6">
        {VIEW_LABELS.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => setView(candidate.id)}
            aria-pressed={view === candidate.id}
            className={`min-h-10 rounded-full border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] backdrop-blur-md transition ${
              view === candidate.id
                ? "border-black bg-black text-white"
                : "border-black/25 bg-[#eee8da]/82 text-black/75 hover:bg-[#f5efe2]"
            }`}
          >
            {candidate.label}
          </button>
        ))}
      </div>

      <nav className="absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 flex flex-col items-end gap-2 md:right-6 md:top-6">
        <Link href="/drift-kit-lab/vehicle-selected/" className="rounded-full border border-black/20 bg-[#eee8da]/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-black/70 backdrop-blur-md">
          Commercial reference
        </Link>
        <Link href="/drift-kit-lab/" className="rounded-full border border-black/20 bg-[#eee8da]/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-black/70 backdrop-blur-md">
          Kit lab
        </Link>
      </nav>

      <p className="pointer-events-none absolute bottom-[calc(4.7rem+env(safe-area-inset-bottom))] left-1/2 z-20 hidden -translate-x-1/2 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-black/40 md:block md:bottom-20">
        ORIGINAL VEHICLE STUDY · NOT PROMOTED TO DRIFT EVOLUTION · VISUAL ACCEPTANCE REQUIRED
      </p>
    </main>
  );
}
