import type { Metadata } from "next";
import Drift3DClient from "@/components/drift-3d/Drift3DClient";
import Drift3DWorldInspectorPanel from "@/components/drift-3d/Drift3DWorldInspectorPanel";

export const metadata: Metadata = {
  title: "World Inspector — MISWΛY Drift",
  description: "Production-runtime inspection surface for MISWΛY Drift.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftGreyboxLabPage() {
  return (
    <>
      <Drift3DClient />
      <Drift3DWorldInspectorPanel />
    </>
  );
}
