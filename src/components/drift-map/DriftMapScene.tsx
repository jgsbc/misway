import DriftHud from "@/components/drift-map/DriftHud";
import DriftProp from "@/components/drift-map/DriftProp";
import DriftVehicle from "@/components/drift-map/DriftVehicle";
import DriftZone from "@/components/drift-map/DriftZone";
import { driftMapConfig, driftZones } from "@/lib/driftMap";
import {
  getMapPointFromClientPoint,
  type DriftPoint,
  type DriftZoneProximity,
} from "@/lib/driftControls";
import type { PointerEvent } from "react";

type DriftMapSceneProps = {
  vehiclePosition: DriftPoint;
  vehicleFacing: number;
  isVehicleMoving: boolean;
  zoneProximity: DriftZoneProximity;
  onPointerTargetChange?: (target: DriftPoint | null) => void;
};

function safelySetPointerCapture(element: HTMLDivElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    return;
  }
}

function safelyReleasePointerCapture(element: HTMLDivElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    return;
  }
}

export default function DriftMapScene({
  vehiclePosition,
  vehicleFacing,
  isVehicleMoving,
  zoneProximity,
  onPointerTargetChange,
}: DriftMapSceneProps) {
  function getPointerTarget(event: PointerEvent<HTMLDivElement>) {
    return getMapPointFromClientPoint({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
      bounds: {
        width: driftMapConfig.width,
        height: driftMapConfig.height,
      },
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    safelySetPointerCapture(event.currentTarget, event.pointerId);
    onPointerTargetChange?.(getPointerTarget(event));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.preventDefault();
    onPointerTargetChange?.(getPointerTarget(event));
  }

  function clearPointerTarget(event: PointerEvent<HTMLDivElement>) {
    safelyReleasePointerCapture(event.currentTarget, event.pointerId);
    onPointerTargetChange?.(null);
  }

  return (
    <section
      className="light-border light-card-bg relative overflow-hidden border p-3 shadow-[0_24px_70px_rgba(50,45,38,0.08)] md:p-4"
      aria-label="Playable Drift Map prototype with eight visual music zones. Move the signal vehicle with arrow keys, W A S D, or by touching and dragging on the map."
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
        className="relative mx-auto w-full touch-none select-none overflow-hidden border border-neutral-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,236,229,0.82))] cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearPointerTarget}
        onPointerCancel={clearPointerTarget}
        onPointerLeave={clearPointerTarget}
        onLostPointerCapture={clearPointerTarget}
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

        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {driftZones.map((zone) => (
            <DriftZone
              key={zone.id}
              zone={zone}
              mapWidth={driftMapConfig.width}
              mapHeight={driftMapConfig.height}
              state={
                zoneProximity.activeZone?.id === zone.id
                  ? "active"
                  : zoneProximity.nearestZone?.id === zone.id
                    ? "nearest"
                    : "neutral"
              }
            />
          ))}

          {driftZones.flatMap((zone) =>
            (zone.props ?? []).map((prop) => (
              <DriftProp
                key={prop.id}
                prop={prop}
                mapWidth={driftMapConfig.width}
                mapHeight={driftMapConfig.height}
              />
            ))
          )}
        </div>

        <DriftVehicle
          position={{
            x: (vehiclePosition.x / driftMapConfig.width) * 100,
            y: (vehiclePosition.y / driftMapConfig.height) * 100,
          }}
          facing={vehicleFacing}
          isMoving={isVehicleMoving}
        />

        <DriftHud proximity={zoneProximity} />
      </div>
    </section>
  );
}
