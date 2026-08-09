import type { Metadata } from "next";
import Drift3DClient from "@/components/drift-3d/Drift3DClient";
import DriftStartupVeil from "@/components/drift-3d/DriftStartupVeil";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Drift — a drivable listening world (MISWΛY)",
  description:
    "Drive a safari 4x4 through the MISWΛY catalogue: four eras, twenty-six track places, mountains, canals, storms and dawns. Nothing plays without your click.",
  alternates: {
    canonical: `${siteUrl}/drift/`,
  },
  openGraph: {
    title: "Drift — MISWΛY (MISWAY)",
    description:
      "A drivable 3D listening world where the MISWAY tracks become places — from a dark cave to a summer dawn beach.",
    url: `${siteUrl}/drift/`,
    type: "website",
  },
};

export default function DriftPage() {
  return (
    <>
      <Drift3DClient />
      <DriftStartupVeil />
    </>
  );
}
