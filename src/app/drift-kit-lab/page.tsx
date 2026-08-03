import type { Metadata } from "next";
import DriftKitLab from "@/components/drift-3d/kits/DriftKitLab";

/**
 * DRIFT-IV-PRE-30 — internal technical inspection route for the three
 * representative shared-kit pilots. Not linked from public navigation, not
 * indexed, not production Drift. See `docs/evidence/DRIFT-IV-PRE-30/` for
 * the full evidence package.
 */
export const metadata: Metadata = {
  title: "Drift Kit Lab — PRE-30 technical pilots (internal)",
  description:
    "Internal DRIFT-IV-PRE-30 inspection route for three bounded shared-kit pilots (urban/human, nature/movement, water/weather/light). Not production Drift.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftKitLabPage() {
  return <DriftKitLab />;
}
