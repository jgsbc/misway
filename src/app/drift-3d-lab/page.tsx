import type { Metadata } from "next";
import Drift3DLabRedirect from "@/components/drift-3d/Drift3DLabRedirect";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Drift 3D Lab — moved to Drift (MISWΛY)",
  description:
    "The Drift 3D Lab graduated: the drivable listening world now lives on the main Drift page.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/drift/`,
  },
};

export default function Drift3DLabPage() {
  return <Drift3DLabRedirect />;
}
