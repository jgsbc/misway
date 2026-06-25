import DriftVehicle from "@/components/drift-map/DriftVehicle";
import { driftMapConfig, driftZones } from "@/lib/driftMap";
import type { DriftPoint } from "@/lib/driftControls";

type DriftMapSceneProps = {
  vehiclePosition: DriftPoint;
  vehicleFacing: number;
  isVehicleMoving: boolean;
};

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

export default function DriftMapScene({
  vehiclePosition,
  vehicleFacing,
  isVehicleMoving,
}: DriftMapSceneProps) {
  return (
    <section
      className="light-border light-card-bg relative overflow-hidden border p-3 shadow-[0_24px_70px_rgba(50,45,38,0.08)] md:p-4"
      aria-label="Playable desktop Drift Map prototype. Move the signal vehicle with arrow keys or W A S D."
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.26em]">
          Map bounds / {driftMapConfig.width} x {driftMapConfig.height}
        </p>
        <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.2em]">
          x {Math.round(vehiclePosition.x)} / y {Math.round(vehiclePosition.y)}
        </p>
      </div>

      <div
        className="relative mx-auto w-full overflow-hidden border border-neutral-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,236,229,0.82))]"
        style={{
          aspectRatio: `${driftMapConfig.width} / ${driftMapConfig.height}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,113,108,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.08) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {driftZones.map((zone) => (
          <div
            key={zone.id}
            className="pointer-events-none absolute rounded-full border border-neutral-300/70 bg-white/24"
            style={{
              left: toPercent(zone.x, driftMapConfig.width),
              top: toPercent(zone.y, driftMapConfig.height),
              width: toPercent(zone.radius * 2, driftMapConfig.width),
              height: toPercent(zone.radius * 2, driftMapConfig.height),
              transform: "translate(-50%, -50%)",
            }}
            aria-hidden="true"
          >
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-500/60" />
          </div>
        ))}

        <DriftVehicle
          position={{
            x: (vehiclePosition.x / driftMapConfig.width) * 100,
            y: (vehiclePosition.y / driftMapConfig.height) * 100,
          }}
          facing={vehicleFacing}
          isMoving={isVehicleMoving}
        />
      </div>
    </section>
  );
}
