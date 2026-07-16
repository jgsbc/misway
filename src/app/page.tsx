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

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24),rgba(0,0,0,0.46)_42%,rgba(0,0,0,0.8)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_0%,rgba(0,0,0,0.08)_38%,rgba(0,0,0,0.46)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1440px] grid-rows-[auto_1fr_auto] px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 md:px-12 md:pb-8 md:pt-10">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 sm:text-xs">
            music / memory / detours / strange weather
          </p>

          <div className="relative min-h-[560px] md:min-h-[620px]">
            <h1
              aria-label="MISWΛY"
              className="absolute inset-x-0 top-[11%] h-[1em] text-5xl font-semibold leading-none tracking-[0.12em] text-white sm:top-[12%] sm:text-7xl md:top-[10%] md:text-8xl lg:text-[8.5rem]"
            >
              <span aria-hidden="true" className="absolute right-[0.24em]">
                MIS
              </span>
              <span aria-hidden="true" className="absolute left-[-0.24em]">
                WΛY
              </span>
            </h1>

            <div className="absolute inset-x-0 top-[39%] mx-auto max-w-2xl px-3 text-center sm:top-[41%] md:top-[40%]">
              <p className="text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
                Music, images and things made along the way.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-neutral-500 sm:mt-4 sm:text-base">
                Some old, some new, some still slightly lost.
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-[2%] md:bottom-[9%]">
              <div className="mx-auto grid w-full max-w-sm gap-3 md:max-w-[720px] md:grid-cols-3 md:gap-4">
                <Link
                  href="/drift"
                  className="group order-1 relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/20 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition md:min-h-[54px]"
                >
                  <span className="relative z-10 group-hover:text-black">ENTER</span>
                  <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
                </Link>

                <Link
                  href="/drift"
                  className="group order-3 relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/25 bg-[linear-gradient(115deg,#57f2ff_0%,#8b5cf6_24%,#ff4fd8_48%,#ffb84a_72%,#c8ff57_100%)] px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-black shadow-[0_0_28px_rgba(255,79,216,0.28)] transition duration-500 hover:scale-[1.015] hover:border-white/50 hover:shadow-[0_0_42px_rgba(87,242,255,0.34)] focus:outline-none focus:ring-2 focus:ring-white/40 md:order-2 md:min-h-[54px]"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_78%_30%,rgba(255,255,255,0.42),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.18),transparent_46%,rgba(0,0,0,0.12))] opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
                  <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  <span className="relative z-10 font-semibold drop-shadow-[0_1px_10px_rgba(255,255,255,0.45)]">
                    DRIFT
                  </span>
                </Link>

                <Link
                  href="/about"
                  className="order-2 flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white md:order-3 md:min-h-[54px]"
                >
                  ABOUT
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 font-mono text-[10px] tracking-[0.18em] text-neutral-700">
            <span>MADE OVER TIME</span>
            <span>STILL IN MOTION</span>
          </div>
        </div>
      </section>
    </main>
  );
}
