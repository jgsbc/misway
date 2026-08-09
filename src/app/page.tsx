import Link from "next/link";
import DriftEntryLink from "@/components/drift-3d/DriftEntryLink";
import DriftHeroBackdrop from "@/components/drift-3d/DriftHeroBackdrop";

export default function LandingPage() {
  return (
    <main className="bg-black text-white">
      <section className="relative min-h-[100svh] overflow-hidden">
        <DriftHeroBackdrop />

        <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1440px] grid-rows-[auto_1fr_auto] px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 md:px-12 md:pb-8 md:pt-10">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 sm:text-xs">
            music / memory / detours / strange weather
          </p>

          <div className="relative min-h-[560px] md:min-h-[620px]">
            <div className="absolute inset-x-0 top-[37%] -translate-y-1/2 px-3 text-center sm:top-[38%] md:top-[43%]">
              <h1
                aria-label="MISWΛY"
                className="relative mx-auto h-[1em] text-5xl font-semibold leading-none tracking-[0.12em] text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]"
              >
                <span aria-hidden="true" className="absolute right-1/2 mr-[0.24em]">
                  MIS
                </span>
                <span aria-hidden="true" className="absolute left-1/2 -ml-[0.24em]">
                  WΛY
                </span>
              </h1>

              <div className="mx-auto mt-7 max-w-2xl sm:mt-8 md:mt-9">
                <p className="text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
                  Music, images and things made along the way.
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-neutral-500 sm:mt-4 sm:text-base">
                  Some old, some new, some still slightly lost.
                </p>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-[2%] md:bottom-[9%]">
              <div className="mx-auto grid w-full max-w-sm gap-3 md:max-w-[720px] md:grid-cols-3 md:gap-4">
                <Link
                  href="/tracks"
                  className="group order-1 relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/20 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition md:min-h-[54px]"
                >
                  <span className="relative z-10 group-hover:text-black">TRACKS</span>
                  <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
                </Link>

                <DriftEntryLink />

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
