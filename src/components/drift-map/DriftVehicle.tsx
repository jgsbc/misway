import type { DriftPoint } from "@/lib/driftControls";

type DriftVehicleProps = {
  position: DriftPoint;
  facing: number;
  isMoving: boolean;
};

export default function DriftVehicle({
  position,
  facing,
  isMoving,
}: DriftVehicleProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute z-20 h-11 w-11 will-change-transform"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${facing}deg)`,
      }}
    >
      <div
        className={`relative h-full w-full rounded-[40%_58%_48%_54%] border border-neutral-500/55 bg-white/88 shadow-[0_12px_24px_rgba(44,40,35,0.18)] backdrop-blur-sm ${
          isMoving ? "ring-2 ring-amber-200/60" : ""
        }`}
      >
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-400/70 bg-neutral-50 text-center font-mono text-[10px] leading-5 text-neutral-800">
          Λ
        </div>
        <div className="absolute right-[-8px] top-1/2 h-[2px] w-4 -translate-y-1/2 bg-neutral-700/70" />
        <div className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-sky-200/80" />
        <div className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-amber-200/80" />
      </div>
    </div>
  );
}
