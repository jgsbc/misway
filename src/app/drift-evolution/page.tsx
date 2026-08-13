import type { Metadata } from "next";
import DriftEvolutionClient from "@/components/drift-evolution/DriftEvolutionClient";
import DriftStartupVeil from "@/components/drift-3d/DriftStartupVeil";

export const metadata: Metadata = {
  title: "Drift Evolution — internal MISWΛY review mirror",
  description:
    "Internal review mirror of the MISWΛY Drift world currently promoted on /drift.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftEvolutionPage() {
  return (
    <>
      <DriftEvolutionClient />
      <DriftStartupVeil />
    </>
  );
}
