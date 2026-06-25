"use client";

import { Canvas } from "@react-three/fiber";
import Drift3DScene from "@/components/drift-3d/Drift3DScene";

export default function Drift3DCanvas() {
  return (
    <section
      aria-describedby="drift-3d-description"
      aria-label="Experimental Drift 3D preview"
      className="light-border light-card-bg h-[min(32vh,320px)] min-h-[240px] overflow-hidden border bg-[#f6f3ec] md:h-[min(42vh,390px)] md:min-h-[360px]"
    >
      <Canvas
        camera={{
          position: [8.8, 8.5, 11],
          fov: 36,
          near: 0.1,
          far: 80,
        }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Drift3DScene />
      </Canvas>
    </section>
  );
}
