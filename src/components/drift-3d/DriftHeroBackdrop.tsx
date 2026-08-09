import { withBasePath } from "@/lib/basePath";

const desktopHero = withBasePath("/images/tracks-hero-1920x1080-v3.webp");
const mobileHero = withBasePath("/images/tracks-hero-mobile-1080x1920.webp");

export default function DriftHeroBackdrop({
  shimmer = false,
}: {
  shimmer?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      {shimmer ? (
        <style>{`
          @keyframes drift-hero-door-shimmer {
            0%, 100% { opacity: .03; filter: brightness(1.04); }
            34% { opacity: .13; filter: brightness(1.28); }
            47% { opacity: .05; filter: brightness(1.10); }
            61% { opacity: .19; filter: brightness(1.44); }
            74% { opacity: .07; filter: brightness(1.16); }
          }
          .drift-hero-door-shimmer {
            animation: drift-hero-door-shimmer 2.45s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .drift-hero-door-shimmer { animation: none; opacity: .06; }
          }
        `}</style>
      ) : null}

      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat opacity-55 md:block"
        style={{ backgroundImage: `url(${desktopHero})` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 md:hidden"
        style={{ backgroundImage: `url(${mobileHero})` }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24),rgba(0,0,0,0.46)_42%,rgba(0,0,0,0.8)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_0%,rgba(0,0,0,0.08)_38%,rgba(0,0,0,0.46)_100%)]" />

      {shimmer ? (
        <>
          <div
            className="drift-hero-door-shimmer absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
            style={{
              backgroundImage: `url(${desktopHero})`,
              WebkitMaskImage:
                "radial-gradient(ellipse 18% 27% at 50% 49%,#000 0%,rgba(0,0,0,.96) 36%,rgba(0,0,0,.42) 60%,transparent 78%)",
              maskImage:
                "radial-gradient(ellipse 18% 27% at 50% 49%,#000 0%,rgba(0,0,0,.96) 36%,rgba(0,0,0,.42) 60%,transparent 78%)",
            }}
          />
          <div
            className="drift-hero-door-shimmer absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
            style={{
              backgroundImage: `url(${mobileHero})`,
              WebkitMaskImage:
                "radial-gradient(ellipse 28% 18% at 50% 48%,#000 0%,rgba(0,0,0,.96) 36%,rgba(0,0,0,.42) 60%,transparent 80%)",
              maskImage:
                "radial-gradient(ellipse 28% 18% at 50% 48%,#000 0%,rgba(0,0,0,.96) 36%,rgba(0,0,0,.42) 60%,transparent 80%)",
            }}
          />
        </>
      ) : null}
    </div>
  );
}
