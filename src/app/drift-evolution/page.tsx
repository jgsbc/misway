import type { Metadata } from "next";
import DriftEvolutionClient from "@/components/drift-evolution/DriftEvolutionClient";

export const metadata: Metadata = {
  title: "Drift Evolution — internal MISWΛY world lab",
  description:
    "Protected copy-on-write evolution surface for the MISWΛY Drift world. Production /drift remains the visual baseline.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftEvolutionPage() {
  return <DriftEvolutionClient />;
}
