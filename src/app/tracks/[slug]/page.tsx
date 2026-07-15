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
  const description = `${track.title} by MISWΛY (MISWAY). ${track.shortText} Explore the track page, artwork, context and listening routes.`;

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

  const sameEraOtherTracks = tracks.filter(
    (item) => item.slug !== track.slug && item.publishedLabel === track.publishedLabel
  );

  const sharedTagTracks = tracks.filter(
    (item) =>
      item.slug !== track.slug &&
      item.publishedLabel !== track.publishedLabel &&
      item.tags.some((tag) => track.tags.includes(tag))
  );

  const otherTracks = tracks.filter(
    (item) =>
      item.slug !== track.slug &&
      !sameEraOtherTracks.includes(item) &&
      !sharedTagTracks.includes(item)
  );

  const relatedTracks = [...sameEraOtherTracks, ...sharedTagTracks, ...otherTracks].slice(0, 3);

  const trackSchema = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: track.title,
    url: trackUrl,
    description: track.longText,
    duration: toIsoDuration(track.duration),
    genre: track.tags,
    image: track.coverImage ? `${siteUrl}${track.coverImage}` : undefined,
    audio: `${siteUrl}${track.audioSrc}`,
    sameAs: track.soundcloudUrl ? [track.soundcloudUrl] : undefined,
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
      {
        "@type": "ListItem",
        position: 3,
        name: track.title,
        item: trackUrl,
      },
    ],
  };

  return (
    <main className="light-theme light-page-bg relative min-h-screen overflow-hidden px-6 pb-40 pt-24 md:px-10">
      <Script
        id={`json-ld-track-${track.slug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(trackSchema),
        }}
      />

      <Script
        id={`json-ld-breadcrumb-${track.slug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute left-[14%] top-[20%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[18%] right-[14%] h-32 w-32 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="light-border light-text-secondary mb-10 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="light-text-tertiary font-mono text-xs tracking-[0.28em]">
              / TRACK {track.id}
            </p>
            <h1 className="light-text-primary mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              {track.title}
            </h1>
            <p className="light-text-tertiary mt-4 font-mono text-[10px] tracking-[0.24em]">
              MISWΛY / MISWAY · {track.publishedLabel} · {track.duration ?? track.yearLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/tracks"
              className="light-border light-text-secondary hover:light-text-primary border px-4 py-2 text-xs font-mono tracking-[0.2em] transition"
            >
              BACK TO TRACKS
            </Link>

            {track.soundcloudUrl ? (
              <a
                href={track.soundcloudUrl}
                target="_blank"
                rel="noreferrer"
                className="light-border light-text-secondary hover:light-text-primary border px-4 py-2 text-xs font-mono tracking-[0.2em] transition"
              >
                SOUNDCLOUD ↗
              </a>
            ) : (
              <span className="light-border border px-4 py-2 text-xs font-mono tracking-[0.2em] text-neutral-400">
                ON THIS SITE
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
          <section className="space-y-6">
            <div className="light-border light-card-bg relative aspect-square overflow-hidden border">
              <Image
                src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                alt={`${track.title} artwork`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <p className="light-text-primary text-base leading-7">{track.longText}</p>

            <div className="flex flex-wrap gap-2">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="light-border light-text-secondary border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em]"
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
                IN A FEW WORDS
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{track.shortText}</p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                IMAGE NOTE
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                {track.coverHint ?? "A small visual room made for this piece."}
              </p>
            </div>

            {track.soundcloudUrl ? (
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                  ALSO ON SOUNDCLOUD
                </p>
                <p className="mt-4 text-sm leading-7 text-neutral-400">
                  This track also lives on SoundCloud.
                </p>
                <a
                  href={track.soundcloudUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
                >
                  LISTEN ON SOUNDCLOUD ↗
                </a>
              </div>
            ) : (
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                  LISTENING NOTE
                </p>
                <p className="mt-4 text-sm leading-7 text-neutral-400">
                  For now, this track lives here in the site player. No external link is attached.
                </p>
              </div>
            )}
          </aside>
        </div>

        <section className="mt-14 border-t border-white/10 pt-10">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / KEEP LISTENING
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-4xl">
            Take another path
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">
            {sameEraOtherTracks.length > 0
              ? `More tracks from ${track.publishedLabel}.`
              : sharedTagTracks.length > 0
                ? `A few pieces that share part of the same weather.`
                : `Three other places to continue.`}
          </p>

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
