import type { Metadata } from "next";
import ExplorePageClient from "@/components/pages/ExplorePageClient";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "Explore MISWΛY (MISWAY) — selected entry points",
  description:
    "Explore a curated entry point into the MISWΛY catalogue, from Birth era first steps to newer releases and featured listening nodes.",
  alternates: {
    canonical: `${siteUrl}/explore/`,
  },
  openGraph: {
    title: "Explore MISWΛY (MISWAY)",
    description:
      "A curated entry point into the MISWΛY catalogue, spanning Birth era sketches and newer tracks.",
    url: `${siteUrl}/explore/`,
    type: "website",
  },
};

export default function ExplorePage() {
  return <ExplorePageClient />;
}
