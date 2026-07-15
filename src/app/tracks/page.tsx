import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";
import TrackPlayButton from "@/components/audio/TrackPlayButton";

const siteUrl = "https://jgsbc.github.io/misway";
const trackCount = tracks.length;

export const metadata: Metadata = {
  title: "Tracks — music made over time",
  description: `Listen through ${trackCount} MISWΛY pieces made across different periods: early computer sketches, returns, experiments and newer electronic tracks.`,
  alternates: {
    canonical: "/tracks/",
  },
  openGraph: {
    title: "MISWΛY Tracks — music over time",
    description:
      "A chronological path through early sketches, pauses, returns, experiments and newer MISWΛY pieces.",
    url: `${siteUrl}/tracks/`,
    type: "website",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Tracks",
      item: `${siteUrl}/tracks/`,
    },
  ],
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${siteUrl}/tracks/#collection`,
  name: "MISWΛY Tracks — music over time",
  description: `A chronological path through ${trackCount} MISWΛY pieces made across different periods.`,
  url: `${siteUrl}/tracks/`,
  about: {
    "@id": `${siteUrl}/#person`,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: trackCount,
    itemListElement: tracks.map((track, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MusicRecording",
        "@id": `${siteUrl}/tracks/${track.slug}/#recording`,
        name: track.title,
        url: `${siteUrl}/tracks/${track.slug}/`,
        genre: track.tags,
        byArtist: {
          "@id": `${siteUrl}/#person`,
        },
      },
    })),
  },
};

export default function TracksPage() {
  return (
    <main className="light-theme light-page-bg min-h-screen px-6 pb-40 pt-24 md:px-10">
      <Script
        id="json-ld-breadcrumb-tracks"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <Script
        id="json-ld-tracks-collection"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
            / MUSIC OVER TIME
          </p>
          <h1 className="light-text-primary mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Tracks
          </h1>
          <p className="light-text-secondary mt-4 max-w-3xl text-sm leading-7 md:text-base">
            These pieces were made at different moments, with different tools and different versions of me.
            Some are carefully finished. Others kept the rough edges that made them worth remembering.
          </p>
          <p className="light-text-secondary mt-4 max-w-3xl text-sm leading-7 md:text-base">
            The order follows the path rather than a release strategy: early attempts, long pauses, returns,
            accidents and newer pieces that are still finding their place.
          </p>
        </div>

        <section className="light-border light-card-bg mb-10 border p-5 md:p-6">
          <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
            HOW TO MOVE THROUGH IT
          </p>
          <p className="light-text-secondary mt-4 max-w-3xl text-sm leading-7 md:text-base">
            Start at the beginning, jump to a title, follow the images or press play wherever curiosity lands.
            Nothing here is ranked, and the unevenness is part of the story.
          </p>
        </section>

        <div className="space-y-4">
          {tracks.map((track) => (
            <div
              key={track.slug}
              className="light-border light-card-bg group relative overflow-hidden border transition hover:border-neutral-400"
            >
              <TrackPlayButton track={track} className="absolute right-4 top-4 z-10" />

              <Link href={`/tracks/${track.slug}`} className="block">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="relative aspect-square md:aspect-auto md:min-h-[220px]">
                    <Image
                      src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                      alt={track.title}
                      fill
                      className="object-cover opacity-85 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                      sizes="(max-width: 768px) 100vw, 220px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent" />
                  </div>

                  <div className="p-5 md:pr-28">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-[10px] tracking-[0.24em] text-neutral-600">
                            {track.id}
                          </span>
                          <span className="font-mono text-[10px] tracking-[0.24em] text-neutral-600">
                            {track.publishedLabel}
                          </span>
                        </div>

                        <h2 className="mt-3 text-2xl font-medium tracking-tight text-neutral-200 transition group-hover:text-white">
                          {track.title}
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-neutral-400">
                          {track.shortText}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {track.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-[120px] text-left md:text-right">
                        <p className="font-mono text-[10px] tracking-[0.22em] text-neutral-600">
                          {track.duration ?? track.yearLabel}
                        </p>
                        <p className="mt-3 font-mono text-[10px] tracking-[0.22em] text-white/70 transition group-hover:text-white">
                          OPEN →
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
