import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { featuredTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "About MISWΛY (MISWAY) — artist bio, vision & collaborations",
  description:
    "Learn about MISWΛY (MISWAY), an electronic music project exploring atmospheric electronica, ambient textures, trip-hop pressure and cinematic sound design.",
  alternates: {
    canonical: `${siteUrl}/about/`,
  },
  openGraph: {
    title: "About MISWΛY (MISWAY)",
    description:
      "Artist bio, sonic direction, selected tracks and collaboration entry points.",
    url: `${siteUrl}/about/`,
    type: "profile",
    images: [
      {
        url: `${siteUrl}/images/about/misway-portrait.jpg`,
        width: 1200,
        height: 1600,
        alt: "Portrait of MISWΛY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About MISWΛY (MISWAY)",
    description:
      "Artist bio, sonic direction, selected tracks and collaboration entry points.",
    images: [`${siteUrl}/images/about/misway-portrait.jpg`],
  },
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={withBasePath("/images/about/about-bg.jpg")}
            alt="MISWΛY background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.82)_100%)]" />
        </div>

        <div className="absolute left-1/2 top-28 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white/5 blur-[130px]" />
        <div className="absolute left-[10%] top-[18%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[16%] right-[12%] h-36 w-36 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className="mb-16 grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
              / ABOUT / ARTIST PROFILE
            </p>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              MISWΛY
            </h1>

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
              MISWAY / electronic music project
            </p>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              MISWΛY, also written MISWAY, is an electronic music project shaped by
              atmospheric tension, nocturnal textures, ambient electronics, trip-hop
              weight and cinematic contrast. The work moves between pressure and
              softness, synthetic edges and intimate melodic fragments.
            </p>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
              This site is the central archive of the project: artist context, selected
              tracks, catalogue access, contact entry points and a visual language built
              around drift, signal, memory and controlled fracture.
            </p>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
              Behind the project is a human source, not a content machine. MISWΛY is
              where personal intensity, visual taste, unfinished inner movement and
              electronic composition are turned into form, pulse and atmosphere.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  GENRES / TERRITORIES
                </p>
                <p className="mt-4 text-sm leading-7 text-neutral-300">
                  Atmospheric electronica, ambient electronic music, trip-hop pressure,
                  cinematic electronics, dark synthetic textures.
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  FOR COLLABORATIONS
                </p>
                <p className="mt-4 text-sm leading-7 text-neutral-300">
                  Sync references, visuals, artist discovery, music-related projects,
                  direct contact and selected creative collaborations.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[4/3]">
                <Image
                  src={withBasePath("/images/about/misway-portrait.jpg")}
                  alt="Portrait of MISWΛY"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>

              <div className="p-5">
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  SOURCE
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  A living source with memory, humour, fracture, tenderness, work
                  residue and an unreasonable loyalty to beauty under pressure.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                OFFICIAL LISTENING NODE
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                For public listening outside this archive, the main external profile is
                the SoundCloud node.
              </p>

              <div className="mt-5">
                <a
                  href="https://soundcloud.com/misway"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
                >
                  OPEN SOUNDCLOUD ↗
                </a>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                WHAT THIS PAGE IS FOR
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                The full artist biography and vision behind MISWΛY. For a more direct commercial/collaboration focus, visit the dedicated artist profile.
              </p>
              <Link
                href="/artist"
                className="mt-4 inline-flex border border-white/10 px-4 py-2 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
              >
                ARTIST PROFILE →
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / SELECTED TRACKS
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Entry points into the catalogue
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
            A few visible anchors to understand the sonic direction before entering the
            wider timeline.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {featuredTracks.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="border border-white/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-300 transition hover:border-white/30 hover:text-white"
              >
                {track.title}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/tracks"
              className="inline-flex border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
            >
              OPEN FULL TIMELINE
            </Link>
          </div>
        </section>

        <section id="contact" className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                CONTACT / CHANNEL
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                For music, visuals, collaborations, sync references or direct contact
                around the MISWΛY project.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                GOOD REASONS TO WRITE
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-400">
                <li>— musical collaboration</li>
                <li>— soundtrack / sync / visuals</li>
                <li>— artist inquiry</li>
                <li>— project proposal</li>
              </ul>
            </div>
          </div>

          <section className="border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              MESSAGE FORM
            </p>

            <form
              action="https://formspree.io/f/xqeywvda"
              method="POST"
              className="mt-6 space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  NAME
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  SUBJECT
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="Collab, sync, project..."
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={7}
                  required
                  className="w-full resize-none border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="Write your message..."
                />
              </div>

              <input
                type="text"
                name="_gotcha"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="border border-white/20 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
                >
                  SEND
                </button>

                <Link
                  href="/tracks"
                  className="border border-white/10 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  BACK TO TRACKS
                </Link>
              </div>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}