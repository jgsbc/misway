import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drift — a drivable listening world (MISWΛY)",
  description:
    "Drive through MISWΛY: four eras, twenty-six track places, mountains, canals, storms and dawns. Explicit audio only — nothing plays without your click.",
  alternates: {
    canonical: "/drift/",
  },
  openGraph: {
    title: "Drift — MISWΛY listening world",
    description:
      "A drivable 3D world where the MISWAY tracks become places.",
    url: "https://jgsbc.github.io/misway/drift/",
    type: "website",
  },
};

export default function DriftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
