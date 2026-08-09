import type { Metadata } from "next";
import VehicleCandidateLab from "@/components/drift-3d/kits/VehicleCandidateLab";

export const metadata: Metadata = {
  title: "Drift Kit Lab — real vehicle candidates",
  description:
    "Internal MISWAY vehicle candidate comparison. External 3D viewers only; no candidate is adopted into Drift or Drift Evolution.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftKitVehicleCandidatesPage() {
  return <VehicleCandidateLab />;
}
