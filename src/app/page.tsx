import Link from "next/link";
import { withBasePath } from "@/lib/basePath";

export default function LandingPage() {
  return (
    <main className="bg-black text-white">
      <section className="relative min-h-[100svh] overflow-hidden">
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

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.34),rgba(0,0,0,0.52)_34%,rgba(0,0,0,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.12)_34%,rgba(0,0,0,0.5)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-1 items-center">
            <div className="mx-auto w-full max-w-4xl text-center">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 sm:text-xs">
                signal / drift / memory / fracture
              </p>

              <h1 className="text-5xl font-semibold tracking-[0.12em] text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]">
                MISWΛY
              </h1>

              <p className="mt-6 text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
                Sound, image and fragments of inner weather.
              </p>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
                MISWAY / electronic music project
              </p>

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
                  href="/drift"
                  className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  DRIFT
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-4 font-mono text-[10px] tracking-[0.18em] text-neutral-700">
            <span>ENTRY NODE / V1</span>
            <span>ARCHIVE SIGNAL</span>
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 bg-black">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-700">
              about the project
            </p>

            <h2 className="mt-4 text-lg font-medium tracking-[0.04em] text-neutral-300 sm:text-xl">
              MISWΛY, also written MISWAY
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-500">
              An electronic music project moving between atmospheric tension,
              ambient textures, trip-hop pressure and cinematic electronics.
            </p>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600">
              This site is the central archive of the project: selected tracks,
              listening paths, artist context and contact entry points.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/about"
                className="border border-white/6 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-600 transition hover:border-white/20 hover:text-neutral-300"
              >
                ABOUT
              </Link>

              <Link
                href="/tracks"
                className="border border-white/6 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-600 transition hover:border-white/20 hover:text-neutral-300"
              >
                FULL TIMELINE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}