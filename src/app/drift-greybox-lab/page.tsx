import type { Metadata } from "next";
import FableExperience from "@/components/drift-3d/fable/FableExperience";

/**
 * FABLE SPIKE — internal creative slice: Entry (la gorge) → Birth Yard
 * (le chantier de naissance). Replaces the PRE-40 five-world greybox on this
 * internal route for the duration of the spike; the greybox components are
 * untouched under src/components/drift-3d/greybox/. Not linked from public
 * navigation, not indexed, not production Drift.
 */
export const metadata: Metadata = {
  title: "Drift — fable spike (internal)",
  description:
    "Internal creative spike: one immersive Entry → Birth Yard driving slice. Not production Drift.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftGreyboxLabPage() {
  return <FableExperience />;
}
