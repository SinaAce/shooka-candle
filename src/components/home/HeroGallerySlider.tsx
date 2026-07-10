"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GALLERY_SLIDES } from "@/lib/constants";

const INTERVAL_MS = 3000;

export default function HeroGallerySlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % GALLERY_SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0 lg:mr-auto">
      <div className="absolute -inset-3 bg-gradient-to-br from-[var(--glow)]/25 to-transparent rounded-2xl blur-xl pointer-events-none" />
      <div className="relative aspect-[5/4] max-h-[min(38vh,280px)] rounded-2xl overflow-hidden shadow-xl ring-1 ring-[var(--border)] candle-glow bg-[var(--surface-alt)]">
        {GALLERY_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={src}
              alt={`گالری شوکا ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 640px) 280px, 320px"
            />
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {GALLERY_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`اسلاید ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-5 bg-[var(--primary)]"
                  : "w-1.5 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
