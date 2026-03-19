"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-home">
      <div className="hero-home__bg hero-home__bg--desktop">
        <Image
          src="/images/tracks-hero-1920x1080-v3.webp"
          alt="Visuel lumineux centré sur le symbole lambda"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>

      <div className="hero-home__bg hero-home__bg--mobile">
        <Image
          src="/images/tracks-hero-mobile-1080x1920.webp"
          alt="Visuel lumineux centré sur le symbole lambda"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>

      <div className="hero-home__overlay" />

      <div className="hero-home__content">
        <p className="hero-home__eyebrow">MISWAY</p>
        <h1 className="hero-home__title">Sound. Shadow. Signal.</h1>
        <p className="hero-home__text">
          Electronic textures, fractured light, living frequencies.
        </p>

        <div className="hero-home__actions">
          <Link href="/music" className="btn btn-primary">
            Explore
          </Link>
          <Link href="/about" className="btn btn-secondary">
            About
          </Link>
        </div>
      </div>
    </section>
  );
}