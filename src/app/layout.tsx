import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import "./light-theme.css";
import Navigation from "@/components/ui/Navigation";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

const geistSans = localFont({
  src: "../../node_modules/next/dist/esm/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../node_modules/next/dist/esm/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

const siteUrl = "https://jgsbc.github.io/misway";
const siteTitle = "MISWΛY (MISWAY)";
const siteDescription =
  "MISWΛY (MISWAY) is a personal collection of music, images and detours made over time, from early computer sketches to newer electronic pieces.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: siteTitle,
      alternateName: "MISWAY",
      description: siteDescription,
      inLanguage: "en",
      creator: {
        "@id": `${siteUrl}/#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "MISWΛY",
      alternateName: "MISWAY",
      url: `${siteUrl}/about/`,
      image: `${siteUrl}/images/about/misway-portrait.jpg`,
      description: siteDescription,
      sameAs: ["https://soundcloud.com/misway"],
      mainEntityOfPage: `${siteUrl}/about/`,
      knowsAbout: [
        "Music composition",
        "Electronic music",
        "Trip-hop",
        "Acid jazz",
        "Piano",
        "Guitar",
        "Saxophone",
        "Music production",
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} — Music made over time`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: "MISWΛY",
  referrer: "origin-when-cross-origin",
  keywords: [
    "MISWAY",
    "MISWΛY",
    "electronic music",
    "trip-hop",
    "acid jazz",
    "ambient music",
    "French song melodies",
    "personal music collection",
  ],
  authors: [{ name: "MISWΛY", url: `${siteUrl}/about/` }],
  creator: "MISWΛY",
  publisher: "MISWΛY",
  category: "music",
  verification: {
    google: "google72fb7680ca7d68ce",
  },
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    title: `${siteTitle} — Music made over time`,
    description: siteDescription,
    url: `${siteUrl}/`,
    siteName: "MISWΛY",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/tracks-hero-1920x1080-v3.webp`,
        width: 1920,
        height: 1080,
        alt: "MISWΛY music and images made over time",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteTitle} — Music made over time`,
    description: siteDescription,
    images: [`${siteUrl}/images/tracks-hero-1920x1080-v3.webp`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld-site"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <AudioPlayerProvider>
          <Navigation />
          {children}
          <GlobalAudioPlayer />
        </AudioPlayerProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KV5TMXL902"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KV5TMXL902');
          `}
        </Script>
      </body>
    </html>
  );
}
