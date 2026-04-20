import type { Metadata } from "next";
import DriftPageClient from "@/components/pages/DriftPageClient";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Drift — non-linear entry into MISWΛY (MISWAY)",
  description:
    "Drift through the MISWΛY catalogue through atmosphere, intuition and non-linear discovery. A softer route into the electronic music archive.",
  alternates: {
    canonical: `${siteUrl}/drift/`,
  },
  openGraph: {
    title: "Drift — MISWΛY (MISWAY)",
    description:
      "A non-linear and atmosphere-led route into the MISWΛY electronic music catalogue.",
    url: `${siteUrl}/drift/`,
    type: "website",
  },
};

export default function DriftPage() {
  return <DriftPageClient />;
}