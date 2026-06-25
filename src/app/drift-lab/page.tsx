import type { Metadata } from "next";
import DriftMapClient from "@/components/drift-map/DriftMapClient";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Drift Lab — experimental MISWΛY map",
  description:
    "Experimental shell for a future MISWΛY Drift Map where tracks become places.",
  alternates: {
    canonical: `${siteUrl}/drift-lab/`,
  },
  openGraph: {
    title: "Drift Lab — MISWΛY (MISWAY)",
    description:
      "A quiet experimental shell for a future playable map where MISWΛY tracks become places.",
    url: `${siteUrl}/drift-lab/`,
    type: "website",
  },
};

export default function DriftLabPage() {
  return <DriftMapClient />;
}
