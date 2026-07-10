"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY_SLIDES } from "@/lib/constants";

const INTERVAL_MS = 3000;
const SWIPE_THRESHOLD = 48;

export default function HeroGallerySlider() {
  const [slides, setSlides] = useState<string[]>([...GALLERY_SLIDES]);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const restartAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
  }, [slides.length]);

  useEffect(() => {
    fetch("/api/gallery?type=hero")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((img: { url: string }) => img.url));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    restartAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restartAutoplay]);

  function handleInteraction(nextIndex: number) {
    goTo(nextIndex);
    restartAutoplay();
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || touchStartY.current == null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    // کشیدن به چپ = اسلاید بعدی | کشیدن به راست = اسلاید قبل
    if (dx < 0) handleInteraction(index + 1);
    else handleInteraction(index - 1);
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0 lg:mr-auto select-none">
      <div className="absolute -inset-3 bg-gradient-to-br from-[var(--glow)]/25 to-transparent rounded-2xl blur-xl pointer-events-none" />
      <div
        className="relative aspect-[5/4] max-h-[min(38vh,280px)] rounded-2xl overflow-hidden shadow-xl ring-1 ring-[var(--border)] candle-glow bg-[var(--surface-alt)] touch-pan-y cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="گالری اسلایدر شوکا"
      >
        {slides.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            onClick={() => i !== index && handleInteraction(i)}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out border-0 p-0 bg-transparent ${
              i === index ? "opacity-100 z-10 cursor-default" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={src}
              alt={`گالری شوکا ${i + 1}`}
              fill
              className="object-cover pointer-events-none"
              priority={i === 0}
              sizes="(max-width: 640px) 280px, 320px"
              draggable={false}
            />
          </button>
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="اسلاید قبلی"
              onClick={() => handleInteraction(index - 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="اسلاید بعدی"
              onClick={() => handleInteraction(index + 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              aria-label="ناحیه قبلی"
              className="absolute inset-y-0 right-0 w-[28%] z-20 cursor-w-resize"
              onClick={() => handleInteraction(index - 1)}
            />
            <button
              type="button"
              aria-label="ناحیه بعدی"
              className="absolute inset-y-0 left-0 w-[28%] z-20 cursor-e-resize"
              onClick={() => handleInteraction(index + 1)}
            />
          </>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 pointer-events-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`اسلاید ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => handleInteraction(i)}
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
