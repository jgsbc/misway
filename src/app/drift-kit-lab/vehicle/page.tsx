import type { Metadata } from "next";
import VehicleHeroLab from "@/components/drift-3d/kits/VehicleHeroLab";

export const metadata: Metadata = {
  title: "Drift Vehicle Hero Study | MISWΛY",
  description: "Internal MISWAY Drift vehicle hero study.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftVehicleHeroStudyPage() {
  return <VehicleHeroLab />;
}
