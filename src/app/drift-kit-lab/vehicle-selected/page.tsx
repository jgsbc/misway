import type { Metadata } from "next";
import SelectedDefenderLab from "@/components/drift-3d/kits/SelectedDefenderLab";

export const metadata: Metadata = {
  title: "Drift Kit Lab — selected Defender sand study",
  description:
    "Internal MISWAY colour study for the owner-selected ROH3D Defender D110. Viewer-only; no production or evolution vehicle change.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftKitSelectedVehiclePage() {
  return <SelectedDefenderLab />;
}
