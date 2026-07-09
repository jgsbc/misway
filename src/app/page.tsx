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
                  href="/tracks"
                  className="group relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/20 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition"
                >
                  <span className="relative z-10 group-hover:text-black">ENTER</span>
                  <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
                </Link>

                <Link
                  href="/artist"
                  className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  ARTIST
                </Link>

                <Link
                  href="/tracks"
                  className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  LISTEN
                </Link>

                <Link
                  href="/drift"
                  className="group relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/25 bg-[linear-gradient(115deg,#57f2ff_0%,#8b5cf6_24%,#ff4fd8_48%,#ffb84a_72%,#c8ff57_100%)] px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-black shadow-[0_0_28px_rgba(255,79,216,0.28)] transition duration-500 hover:scale-[1.015] hover:border-white/50 hover:shadow-[0_0_42px_rgba(87,242,255,0.34)] focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_78%_30%,rgba(255,255,255,0.42),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.18),transparent_46%,rgba(0,0,0,0.12))] opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
                  <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  <span className="relative z-10 font-semibold drop-shadow-[0_1px_10px_rgba(255,255,255,0.45)]">
                    DRIFT
                  </span>
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
    </main>
  );
}
