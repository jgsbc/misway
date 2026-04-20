import Image from "next/image";
import Link from "next/link";
import { featuredTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const highlightedTracks = featuredTracks.slice(0, 3);

export default function LandingPage() {
  return (
    <main className="relative min-h-[100svh] overflow-clip bg-black px-5 sm:px-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat opacity-55 md:block"
          style={{
            backgroundImage: `url(${withBasePath("/images/tracks-hero-1920x1080-v3.webp")})`,
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 md:hidden"
          style={{
            backgroundImage: `url(${withBasePath("/images/tracks-hero-mobile-1080x1920.webp")})`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.38),rgba(0,0,0,0.56)_35%,rgba(0,0,0,0.84)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.12)_32%,rgba(0,0,0,0.52)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between py-8 sm:py-10">
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-4xl text-center">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 sm:text-xs">
              signal / drift / memory / fracture
            </p>

            <h1 className="text-5xl font-semibold tracking-[0.12em] text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]">
              MISWΛY
            </h1>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-400 sm:text-xs">
              MISWAY / electronic music artist
            </p>

            <div className="mx-auto mt-6 max-w-2xl space-y-4">
              <p className="text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
                Atmospheric electronica, trip-hop tension, ambient textures and
                cinematic pressure.
              </p>
              <p className="mx-auto max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
                MISWΛY, also written MISWAY, is an electronic music project built
                around mood, drift, nocturnal work and emotional density.
              </p>
            </div>

            <div className="mx-auto mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link
                href="/explore"
                className="group relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/20 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition"
              >
                <span className="relative z-10 group-hover:text-black">ENTER</span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
              </Link>

              <Link
                href="/tracks"
                className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
              >
                LISTEN
              </Link>

              <Link
                href="/about"
                className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
              >
                ABOUT
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-4 font-mono text-[10px] tracking-[0.18em] text-neutral-700">
          <span>ENTRY NODE / V2</span>
          <span>ARTIST / ELECTRONIC MUSIC</span>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl border-t border-white/10 py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
              / ARTIST / IDENTITY
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              MISWΛY, also written MISWAY
            </h2>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              MISWΛY (MISWAY) is an electronic music project focused on atmosphere,
              tension, nocturnal textures, inner movement and cinematic contrast.
              The project lives between ambient electronic music, trip-hop pressure,
              dark synthetic tones and more intimate melodic fragments.
            </p>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
              This site is the central archive of the MISWAY catalogue: selected
              tracks, artist context, visual direction, contact entry points and
              listening pathways through the project’s different eras.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                GENRES
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                Atmospheric electronica, ambient electronic music, trip-hop tension,
                cinematic electronics, dark synthetic textures.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                USE CASES
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                Listening, artistic discovery, soundtrack references, visual
                collaborations, sync and direct contact around the project.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                OFFICIAL CHANNEL
              </p>
              <a
                href="https://soundcloud.com/misway"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
              >
                OPEN SOUNDCLOUD ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl border-t border-white/10 py-16">
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / FEATURED TRACKS
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Start with three strong nodes
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
            A fast entry into the MISWAY catalogue through a few visible anchors.
            Then open the full timeline to explore the wider archive.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {highlightedTracks.map((track) => (
            <Link
              key={track.slug}
              href={`/tracks/${track.slug}`}
              className="group overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/25 hover:bg-white/[0.05]"
            >
              <div className="relative aspect-square">
                <Image
                  src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                  alt={track.title}
                  fill
                  className="object-cover opacity-85 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              <div className="p-5">
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  {track.publishedLabel} · {track.duration ?? track.yearLabel}
                </p>
                <h3 className="mt-3 text-2xl font-medium tracking-tight text-white">
                  {track.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  {track.shortText}
                </p>
                <p className="mt-5 font-mono text-[10px] tracking-[0.22em] text-white/70 transition group-hover:text-white">
                  OPEN TRACK →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tracks"
            className="inline-flex border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
          >
            OPEN FULL TIMELINE
          </Link>

          <Link
            href="/about"
            className="inline-flex border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
          >
            READ ARTIST CONTEXT
          </Link>
        </div>
      </section>
    </main>
  );
}