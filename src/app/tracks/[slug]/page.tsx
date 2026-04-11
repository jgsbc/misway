import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { tracks, getTrackBySlug } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return tracks.map((track) => ({ slug: track.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrackBySlug(slug);

  if (!track) {
    return {
      title: "Track Not Found",
    };
  }

  const trackUrl = `https://jgsbc.github.io/misway/tracks/${track.slug}/`;

  return {
    title: `${track.title} — MISWΛY Track`,
    description: `${track.shortText} | ${track.duration ?? track.yearLabel} | ${track.publishedLabel}`,
    alternates: {
      canonical: `/tracks/${track.slug}/`,
    },
    openGraph: {
      title: `${track.title} — MISWΛY`,
      description: track.shortText,
      url: trackUrl,
      type: "music.song",
      images: track.coverImage
        ? [
            {
              url: `https://jgsbc.github.io/misway${track.coverImage}`,
              width: 400,
              height: 400,
              alt: track.title,
            },
          ]
        : [],
    },
  };
}

export default async function TrackDetailPage({ params }: Props) {
  const { slug } = await params;
  const track = getTrackBySlug(slug);

  if (!track) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute left-[14%] top-[20%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[18%] right-[14%] h-32 w-32 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.28em] text-neutral-600">
              / TRACK_NODE_{track.id}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              {track.title}
            </h1>
            <p className="mt-4 font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              {track.publishedLabel} · {track.duration ?? track.yearLabel}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/explore"
              className="border border-white/10 px-4 py-2 text-xs font-mono tracking-[0.2em] text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              BACK
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
                alt={track.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <p className="max-w-2xl text-base leading-7 text-neutral-300">
              {track.longText}
            </p>

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
                  DATE
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
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-4 font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                AUDIO_PORT
              </p>

              <div className="overflow-hidden rounded-md border border-white/10 bg-black/30">
                <iframe
                  title={track.title}
                  width="100%"
                  height="166"
                  allow="autoplay"
                  src={track.embedUrl}
                />
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
                FRAGMENT
              </p>
              <p className="mt-4 text-sm leading-6 text-neutral-400">
                {track.coverHint ?? "A listening chamber inside the MISWΛY archive."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}