import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://jgsbc.github.io/misway";
const siteTitle = "MISWΛY (MISWAY)";
const siteDescription =
  "MISWΛY (MISWAY) is an electronic music project blending atmospheric electronica, trip-hop tension, ambient textures and cinematic pressure.";

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
    },
    {
      "@type": "MusicGroup",
      "@id": `${siteUrl}/#artist`,
      name: "MISWΛY",
      alternateName: "MISWAY",
      url: `${siteUrl}/`,
      image: `${siteUrl}/images/tracks-hero-1920x1080-v3.webp`,
      description: siteDescription,
      genre: [
        "Electronic music",
        "Atmospheric electronica",
        "Trip-hop",
        "Ambient electronic",
        "Cinematic electronic music",
      ],
      sameAs: ["https://soundcloud.com/misway"],
      mainEntityOfPage: {
        "@id": `${siteUrl}/#website`,
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} — Atmospheric electronic music`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: "MISWΛY",
  referrer: "origin-when-cross-origin",
  keywords: [
    "MISWAY",
    "MISWΛY",
    "electronic music artist",
    "atmospheric electronica",
    "trip-hop",
    "ambient electronic music",
    "cinematic electronic music",
    "dark electronic music",
    "music project",
  ],
  authors: [{ name: "MISWΛY" }],
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
    title: `${siteTitle} — Atmospheric electronic music`,
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
        alt: "MISWΛY electronic music project",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteTitle} — Atmospheric electronic music`,
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