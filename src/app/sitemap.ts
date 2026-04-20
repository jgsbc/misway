import type { MetadataRoute } from "next";
import { tracks } from "@/lib/tracks";

export const dynamic = "force-static";

const siteUrl = "https://jgsbc.github.io/misway";
const lastModified = new Date("2026-04-20");

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${siteUrl}/`,
            lastModified,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${siteUrl}/about/`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/artist/`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.95,
        },
        {
            url: `${siteUrl}/explore/`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${siteUrl}/tracks/`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/drift/`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.7,
        },
    ];

    const trackPages: MetadataRoute.Sitemap = tracks.map((track) => ({
        url: `${siteUrl}/tracks/${track.slug}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    return [...staticPages, ...trackPages];
}