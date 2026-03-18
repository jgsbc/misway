import Link from "next/link";
import Image from "next/image";
import { tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

export default function TracksPage() {
  return (
    <main className="min-h-screen px-6 pb-28 pt-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / FULL TIMELINE
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Tracks
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
            Public chronology of the MISWΛY catalog, from older visible nodes to the
            most recent releases.
          </p>
        </div>

        <div className="space-y-4">
          {tracks.map((track) => (
            <Link
              key={track.slug}
              href={`/tracks/${track.slug}`}
              className="group block overflow-hidden border border-white/10 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
            >
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
          ))}
        </div>
      </div>
    </main>
  );
}