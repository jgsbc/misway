import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import TrackPlayButton from "@/components/audio/TrackPlayButton";
import { tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "Tracks — MISWΛY Complete Catalogue",
  description:
    "Browse the full chronology of MISWΛY tracks from 2016 to 2026. Discover audio explorations organized by era, including RISE, BLOSSOMING, and newer releases.",
  alternates: {
    canonical: "/tracks/",
  },
  openGraph: {
    title: "MISWΛY Tracks — Full Catalogue",
    description:
      "Explore the complete MISWΛY audio catalogue spanning from 2016 to present.",
    url: "https://jgsbc.github.io/misway/tracks/",
    type: "website",
  },
};

export default function TracksPage() {
  return (
    <main className="min-h-screen px-6 pb-44 pt-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / FULL TIMELINE
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Tracks
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
            Public chronology of the MISWΛY catalog, from older visible nodes to
            the most recent releases. The local player now lets the site breathe
            without breaking the experience with external embeds.
          </p>
        </div>

        <div className="space-y-4">
          {tracks.map((track) => (
            <article
              key={track.slug}
              className="overflow-hidden border border-white/10 bg-white/[0.02]"
            >
              <div className="grid md:grid-cols-[220px_1fr]">
                <Link
                  href={`/tracks/${track.slug}`}
                  className="relative block aspect-square md:aspect-auto md:min-h-[220px]"
                >
                  <Image
                    src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                    alt={track.title}
                    fill
                    className="object-cover opacity-85 transition duration-700 hover:scale-[1.02] hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, 220px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent" />
                </Link>

                <div className="p-5">
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

                      <Link href={`/tracks/${track.slug}`}>
                        <h2 className="mt-3 text-2xl font-medium tracking-tight text-neutral-200 transition hover:text-white">
                          {track.title}
                        </h2>
                      </Link>

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
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <TrackPlayButton track={track} />
                    <Link
                      href={`/tracks/${track.slug}`}
                      className="inline-flex min-h-[44px] items-center justify-center border border-white/10 px-4 py-2 text-xs font-mono tracking-[0.18em] text-neutral-300 transition hover:border-white/30 hover:text-white"
                    >
                      OPEN →
                    </Link>
                    <a
                      href={track.soundcloudUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center border border-white/10 px-4 py-2 text-xs font-mono tracking-[0.18em] text-neutral-400 transition hover:border-white/30 hover:text-white"
                    >
                      SOUNDCLOUD ↗
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
