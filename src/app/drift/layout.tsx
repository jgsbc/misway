import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drift — Non-Linear Navigation in MISWΛY",
  description: "Navigate MISWΛY through gentle chance and intuitive drift. Explore fragmented pathways, unstable directions, and serendipitous discoveries without optimization.",
  alternates: {
    canonical: "/drift/",
  },
  openGraph: {
    title: "Drift — Chance Navigation in MISWΛY",
    description: "Navigate MISWΛY through chance, drift, and intuitive pathways.",
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
