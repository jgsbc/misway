import type { Metadata } from "next";
import ExplorePageClient from "@/components/pages/ExplorePageClient";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Explore MISWΛY (MISWAY) — selected electronic music entry points",
  description:
    "Explore a curated entry point into the MISWΛY catalogue through selected tracks, atmosphere-led discovery and featured listening nodes.",
  alternates: {
    canonical: `${siteUrl}/explore/`,
  },
  openGraph: {
    title: "Explore MISWΛY (MISWAY)",
    description:
      "A curated entry point into the MISWΛY electronic music catalogue.",
    url: `${siteUrl}/explore/`,
    type: "website",
  },
};

export default function ExplorePage() {
  return <ExplorePageClient />;
}