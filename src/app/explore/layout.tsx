import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore — Curated MISWΛY Frequencies",
  description: "Step into MISWΛY through five curated audio chambers. A guided entry point into the sonic and visual archive, with carefully selected tracks and atmospheric experiences.",
  alternates: {
    canonical: "/explore/",
  },
  openGraph: {
    title: "Explore MISWΛY — Curated Frequencies",
    description: "Enter through five curated sonic chambers into the MISWΛY archive.",
    url: "https://jgsbc.github.io/misway/explore/",
    type: "website",
  },
};

export default function ExplorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
