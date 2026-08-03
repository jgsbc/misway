import type { Metadata } from "next";
import DriftMacroWorldGreybox from "@/components/drift-3d/greybox/DriftMacroWorldGreybox";

/**
 * DRIFT-IV-PRE-40 — internal five-macro-world greybox readiness route. Not
 * linked from public navigation, not indexed, not production Drift. See
 * `docs/evidence/DRIFT-IV-PRE-40/` for the full evidence and readiness
 * dossier.
 */
export const metadata: Metadata = {
  title: "Drift Greybox Lab — PRE-40 macro-world readiness (internal)",
  description:
    "Internal DRIFT-IV-PRE-40 readiness route: one continuous, driveable, low-fidelity representation of all five macro-worlds. Not production Drift.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftGreyboxLabPage() {
  return <DriftMacroWorldGreybox />;
}
