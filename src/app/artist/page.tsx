import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { featuredTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "MISWΛY Artist Profile — Sync, Collaboration & Licensing",
  description:
    "MISWΛY (MISWAY) artist profile. Atmospheric electronic music for sync, licensing, collaborations, and serious music projects. Available for commercial partnerships.",
  alternates: {
    canonical: `${siteUrl}/artist/`,
  },
  openGraph: {
    title: "MISWΛY — Artist Profile & Collaboration",
    description:
      "Atmospheric electronic music artist available for sync, licensing, and creative collaboration.",
    url: `${siteUrl}/artist/`,
    type: "profile",
    images: [
      {
        url: `${siteUrl}/images/about/misway-portrait.jpg`,
        width: 1200,
        height: 1600,
        alt: "MISWΛY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MISWΛY — Artist Profile & Collaboration",
    description:
      "Atmospheric electronic music artist available for sync, licensing, and creative collaboration.",
    images: [`${siteUrl}/images/about/misway-portrait.jpg`],
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
      name: "Artist",
      item: `${siteUrl}/artist/`,
    },
  ],
};

const artistSchema = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "MISWΛY",
  alternateName: "MISWAY",
  url: `${siteUrl}/artist/`,
  image: `${siteUrl}/images/about/misway-portrait.jpg`,
  description:
    "MISWΛY is an electronic music project specializing in atmospheric, cinematic, and emotionally dense compositions. Available for sync licensing, film/TV collaborations, remix work, and creative partnerships.",
  genre: [
    "Electronic music",
    "Atmospheric electronica",
    "Trip-hop",
    "Ambient electronic",
    "Cinematic electronic music",
  ],
  sameAs: ["https://soundcloud.com/misway"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Collaboration",
    url: `${siteUrl}/about#contact`,
  },
};

export default function ArtistPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <Script
        id="json-ld-breadcrumb-artist"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <Script
        id="json-ld-artist"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(artistSchema),
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute left-1/2 top-28 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white/5 blur-[130px]" />
        <div className="absolute left-[10%] top-[18%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[16%] right-[12%] h-36 w-36 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header Section */}
        <section className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / ARTIST PROFILE / COLLABORATION & SYNC
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            MISWΛY
          </h1>

          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
            Atmospheric Electronic Music Artist
          </p>

          <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300">
            MISWΛY is an electronic music project specializing in atmospheric, cinematic, and emotionally dense compositions. Available for sync licensing, film/TV collaborations, remix work, and creative partnerships.
          </p>
        </section>

        {/* Artist Details Grid */}
        <section className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              SONIC DIRECTION
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-300">
              <li>• Atmospheric electronica with cinematic tension</li>
              <li>• Trip-hop pressure and ambient textures</li>
              <li>• Dark synthetic elements with emotional depth</li>
              <li>• Suitable for film, TV, and premium content</li>
            </ul>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              EXPERIENCE & CATALOGUE
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-300">
              <li>• 10+ years of composition and production</li>
              <li>• 18+ published tracks spanning 2016–2026</li>
              <li>• Portfolio ranges from ambient to high-pressure cinematic</li>
              <li>• Available on SoundCloud and this archive</li>
            </ul>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              COLLABORATION TYPES
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-300">
              <li>• Film and TV synchronization</li>
              <li>• Ad campaigns and branded content</li>
              <li>• Remix and reinterpretation work</li>
              <li>• Original composition for projects</li>
              <li>• Artist features and creative partnerships</li>
            </ul>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              LICENSE TERMS
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              Custom licensing available. Sync rights, streaming rights, and exclusive arrangements are negotiable based on project scope, budget, and media type. Reach out to discuss your specific needs.
            </p>
          </div>
        </section>

        {/* Sample Tracks */}
        <section className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / SAMPLE WORK
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Featured Tracks
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
            Representative selections showing sonic range and compositional approach. The full catalogue contains 18+ additional works.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredTracks.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.05]"
              >
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  {track.publishedLabel}
                </p>
                <h3 className="mt-3 text-lg font-medium text-white">{track.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-400">{track.shortText}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/tracks"
              className="inline-flex border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
            >
              EXPLORE FULL CATALOGUE →
            </Link>
          </div>
        </section>

        {/* Public Profile */}
        <section className="mb-16 border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
            OFFICIAL LISTENING NODE
          </p>
          <p className="mt-4 text-base leading-7 text-neutral-300">
            Primary external presence: SoundCloud. Access to the full archive, artist updates, and community engagement.
          </p>
          <a
            href="https://soundcloud.com/misway"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex border border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
          >
            SOUNDCLOUD PROFILE ↗
          </a>
        </section>

        {/* CTA Section */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              INTERESTED IN COLLABORATION?
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              If you're exploring MISWΛY for sync, licensing, remix, or creative partnership, direct contact is the best approach.
            </p>
            <Link
              href="/about#contact"
              className="mt-6 inline-flex border border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              CONTACT →
            </Link>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              WANT TO UNDERSTAND THE PROJECT BETTER?
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              Read the full artist biography, sonic direction, and vision behind MISWΛY on the dedicated artist page.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex border border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              ARTIST BIO →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
