import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import AudioPlayerProvider from "@/components/audio/AudioPlayerProvider";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: {
    google: "google72fb7680ca7d68ce",
  },
  title: "MISWΛY",
  description: "Audio-visual exploration.",
  metadataBase: new URL("https://jgsbc.github.io/misway/"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "MISWΛY — Audio-visual exploration",
    description:
      "Sound, image and fragments of inner weather. A dark, sensitive and synthetic territory.",
    url: "https://jgsbc.github.io/misway/",
    siteName: "MISWΛY",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MISWΛY",
              description:
                "Audio-visual exploration. Sound, image and fragments of inner weather.",
              url: "https://jgsbc.github.io/misway",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://jgsbc.github.io/misway/tracks",
                },
              },
            }),
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
      </body>
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
    </html>
  );
}
