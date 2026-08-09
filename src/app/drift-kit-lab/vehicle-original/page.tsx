import type { Metadata } from "next";
import OriginalSafariVehicleLab from "@/components/drift-3d/kits/OriginalSafariVehicleLab";

export const metadata: Metadata = {
  title: "Drift Kit Lab — MISWAY Safari 110 original vehicle",
  description:
    "Internal MISWAY original safari 4x4 GLB study. Kit Lab only; no Drift Evolution promotion without visual acceptance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftKitOriginalVehiclePage() {
  return <OriginalSafariVehicleLab />;
}
