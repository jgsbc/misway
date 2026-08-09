"use client";

import Link from "next/link";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import VehicleHeroPilot, {
  type Drift3DVehicleHeroView,
} from "@/components/drift-3d/kits/VehicleHeroPilot";
import { DRIFT_3D_VEHICLE_HERO_PROFILE } from "@/lib/drift3dVehicleHeroStudy";

const VIEW_LABELS: ReadonlyArray<{
  id: Drift3DVehicleHeroView;
  label: string;
}> = [
  { id: "rear-three-quarter", label: "Rear 3/4" },
  { id: "side", label: "Side" },
  { id: "front-three-quarter", label: "Front 3/4" },
];

export default function VehicleHeroLab() {
  const [view, setView] = useState<Drift3DVehicleHeroView>(
    "rear-three-quarter"
  );
  const profile = DRIFT_3D_VEHICLE_HERO_PROFILE;

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#d5cdb9] text-[#171714]">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 3.15, 7.9], fov: 38, near: 0.1, far: 80 }}
          dpr={[1, 1.75]}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: ACESFilmicToneMapping,
          }}
        >
          <color attach="background" args={["#d5cdb9"]} />
          <fog attach="fog" args={["#d5cdb9", 16, 38]} />
          <hemisphereLight args={["#f0eadb", "#4e493d", 1.2]} />
          <directionalLight
            position={[5.5, 8, 5]}
            intensity={2.15}
            castShadow
            shadow-mapSize={[1536, 1536]}
            shadow-camera-near={0.5}
            shadow-camera-far={30}
            shadow-camera-left={-7}
            shadow-camera-right={7}
            shadow-camera-top={7}
            shadow-camera-bottom={-7}
          />
          <directionalLight
            position={[-5, 3.5, -4]}
            intensity={0.65}
            color="#9fb1bc"
          />

          <VehicleHeroPilot view={view} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[28, 28]} />
            <meshStandardMaterial
              color="#b9ad93"
              roughness={0.94}
              metalness={0}
            />
          </mesh>
          <gridHelper args={[18, 18, "#8f866f", "#aaa088"]} position={[0, 0.004, 0]} />
        </Canvas>
      </div>

      <section className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 max-w-[min(82vw,28rem)] md:left-6 md:top-6">
        <div className="rounded-sm border border-black/15 bg-[#eee8da]/82 p-4 shadow-sm backdrop-blur-md md:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-black/48">
            MISWΛY · Drift Kit Lab
          </p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
            Safari 4×4 · Hero study
          </h1>
          <p className="mt-2 max-w-md text-xs leading-5 text-black/62 md:text-sm">
            PRE-10 masterframe target: sand/khaki, upright expedition body,
            high clearance, roof rack and rear spare. Visual study only — no
            production or evolution vehicle has been replaced.
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.12em] text-black/55">
            <div>
              <dt>length</dt>
              <dd className="mt-0.5 text-black/80">{profile.lengthMeters.toFixed(2)} m</dd>
            </div>
            <div>
              <dt>width</dt>
              <dd className="mt-0.5 text-black/80">{profile.widthMeters.toFixed(2)} m</dd>
            </div>
            <div>
              <dt>height</dt>
              <dd className="mt-0.5 text-black/80">{profile.heightMeters.toFixed(2)} m</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2 md:bottom-6">
        {VIEW_LABELS.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => setView(candidate.id)}
            aria-pressed={view === candidate.id}
            className={`pointer-events-auto min-h-9 rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-md transition ${
              view === candidate.id
                ? "border-black bg-black text-white"
                : "border-black/25 bg-[#eee8da]/80 text-black/75 hover:bg-[#f5efe2]"
            }`}
          >
            {candidate.label}
          </button>
        ))}
      </div>

      <nav className="pointer-events-none absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 flex flex-col items-end gap-2 md:right-6 md:top-6">
        <Link
          href="/drift-kit-lab/"
          className="pointer-events-auto rounded-full border border-black/20 bg-[#eee8da]/82 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-black/70 backdrop-blur-md transition hover:bg-[#f5efe2]"
        >
          Kit lab
        </Link>
        <Link
          href="/drift-evolution/"
          className="pointer-events-auto rounded-full border border-black/20 bg-[#eee8da]/82 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-black/70 backdrop-blur-md transition hover:bg-[#f5efe2]"
        >
          Evolution
        </Link>
      </nav>

      <p className="pointer-events-none absolute bottom-[calc(4.1rem+env(safe-area-inset-bottom))] left-1/2 z-20 w-[min(90vw,38rem)] -translate-x-1/2 text-center font-mono text-[8px] uppercase tracking-[0.2em] text-black/42 md:bottom-20">
        KIT STUDY ONLY · PROMOTE ONLY AFTER OWNER VISUAL ACCEPTANCE
      </p>
    </main>
  );
}
