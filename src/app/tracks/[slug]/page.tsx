import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { tracks, getTrackBySlug } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";
import TrackInlinePlayer from "@/components/audio/TrackInlinePlayer";

type Props = {
  params: Promise<{ slug: string }>;
};

const siteUrl = "https://jgsbc.github.io/misway";

function toIsoDuration(duration?: string) {
  if (!duration) return undefined;
  const match = duration.match(/^(\d+):(\d{2})$/);
  if (!match) return undefined;

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return `PT${minutes}M${seconds}S`;
}

export async function generateStaticParams() {
  return tracks.map((track) => ({ slug: track.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrackBySlug(slug);

  if (!track) {
    return {
      title: "Track Not Found | MISWΛY (MISWAY)",
    };
  }

  const trackUrl = `${siteUrl}/tracks/${track.slug}/`;
  const description = `${track.title} by MISWΛY (MISWAY). ${track.shortText} Explore the track page, artwork, context and listening links.`;

  return {
    title: `${track.title} — MISWΛY track`,
    description,
    alternates: {
      canonical: trackUrl,
    },
    openGraph: {
      title: `${track.title} — MISWΛY (MISWAY)`,
      description,
      url: trackUrl,
      type: "music.song",
      images: track.coverImage
        ? [
          {
            url: `${siteUrl}${track.coverImage}`,
            width: 1200,
            height: 1200,
            alt: `${track.title} cover artwork`,
          },
        ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${track.title} — MISWΛY (MISWAY)`,
      description,
      images: track.coverImage ? [`${siteUrl}${track.coverImage}`] : [],
    },
  };
}

export default async function TrackDetailPage({ params }: Props) {
  const { slug } = await params;
  const track = getTrackBySlug(slug);

  if (!track) {
    notFound();
  }

  const trackUrl = `${siteUrl}/tracks/${track.slug}/`;
  const relatedTracks = tracks.filter((item) => item.slug !== track.slug).slice(0, 3);

  const trackSchema = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: track.title,
    url: trackUrl,
    description: track.longText,
    duration: toIsoDuration(track.duration),
    genre: track.tags,
    image: track.coverImage ? `${siteUrl}${track.coverImage}` : undefined,
    sameAs: [track.soundcloudUrl],
    byArtist: {
      "@type": "MusicGroup",
      name: "MISWΛY",
      alternateName: "MISWAY",
      url: `${siteUrl}/`,
    },
    inAlbum: {
      "@type": "MusicAlbum",
      name: "MISWΛY catalogue",
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-40 pt-24 md:px-10">
      <Script
        id={`json-ld-track-${track.slug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(trackSchema),
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute left-[14%] top-[20%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[18%] right-[14%] h-32 w-32 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.28em] text-neutral-600">
              / TRACK NODE {track.id}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              {track.title}
            </h1>
            <p className="mt-4 font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              MISWΛY / MISWAY · {track.publishedLabel} · {track.duration ?? track.yearLabel}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/tracks"
              className="border border-white/10 px-4 py-2 text-xs font-mono tracking-[0.2em] text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              BACK TO TRACKS
            </Link>
            <a
              href={track.soundcloudUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-white/10 px-4 py-2 text-xs font-mono tracking-[0.2em] text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              SOUNDCLOUD ↗
            </a>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
          <section className="space-y-6">
            <div className="relative aspect-square overflow-hidden border border-white/10 bg-white/[0.03]">
              <Image
                src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                alt={`${track.title} artwork`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="space-y-5">
              <p className="text-base leading-7 text-neutral-300">{track.longText}</p>

              <p className="text-sm leading-7 text-neutral-400">
                <span className="text-neutral-200">{track.title}</span> is part of the
                MISWΛY catalogue, a body of electronic music shaped by atmosphere,
                emotional density, synthetic textures and inner motion.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                  ID
                </p>
                <p className="mt-2 text-sm text-neutral-200">{track.id}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                  PERIOD
                </p>
                <p className="mt-2 text-sm text-neutral-200">{track.publishedLabel}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                  LENGTH
                </p>
                <p className="mt-2 text-sm text-neutral-200">
                  {track.duration ?? track.yearLabel}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <TrackInlinePlayer track={track} />

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                TRACK SUMMARY
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{track.shortText}</p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                COVER NOTE
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                {track.coverHint ?? "A listening chamber inside the MISWΛY archive."}
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                LISTEN EXTERNALLY
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                This track also points to the public SoundCloud node for external
                listening and discovery.
              </p>
              <a
                href={track.soundcloudUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
              >
                OPEN ON SOUNDCLOUD ↗
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-white/10 pt-10">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / MORE FROM MISWΛY
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-4xl">
            Continue through the catalogue
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {relatedTracks.map((item) => (
              <Link
                key={item.slug}
                href={`/tracks/${item.slug}`}
                className="border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.05]"
              >
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  {item.publishedLabel}
                </p>
                <h3 className="mt-3 text-xl font-medium text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-400">{item.shortText}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}