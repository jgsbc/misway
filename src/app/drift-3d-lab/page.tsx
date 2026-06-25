import type { Metadata } from "next";
import Drift3DClient from "@/components/drift-3d/Drift3DClient";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Drift 3D Lab — experimental MISWAY route",
  description:
    "Experimental 3D listening world spike for MISWAY Drift. The stable 2D Drift Lab remains the reference.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/drift-3d-lab/`,
  },
  openGraph: {
    title: "Drift 3D Lab — MISWAY",
    description:
      "An isolated 3D spike for a future listening world where tracks become places.",
    url: `${siteUrl}/drift-3d-lab/`,
    type: "website",
  },
};

export default function Drift3DLabPage() {
  return <Drift3DClient />;
}
