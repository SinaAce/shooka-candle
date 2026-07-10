import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import InstagramIcon from "@/components/icons/InstagramIcon";
import HeroGallerySlider from "@/components/home/HeroGallerySlider";
import { INSTAGRAM_DISPLAY, INSTAGRAM_URL } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-[var(--primary-light)] via-[var(--background)] to-[var(--wax-deep)] candle-section">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-16 left-16 w-40 sm:w-56 h-40 sm:h-56 bg-[var(--glow)] rounded-full blur-3xl opacity-25 animate-float" />
        <div className="absolute bottom-8 right-8 w-48 sm:w-64 h-48 sm:h-64 bg-[var(--primary)] rounded-full blur-3xl opacity-15 animate-float-delayed" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="scroll-reveal scroll-reveal-up order-2 lg:order-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 bg-[var(--primary-light)] text-[var(--primary)] px-4 py-1.5 rounded-full text-sm mb-4 candle-glow mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse-soft" />
              شمع‌های دست‌ساز با کیفیت
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight mb-4">
              نور و گرمای
              <span className="text-[var(--primary)]"> خانه </span>
              شما
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
              مجموعه‌ای از شمع‌های دست‌ساز و تزئینی با رایحه‌های منحصربه‌فرد.
              هر شمع با عشق و دقت ساخته شده تا لحظات شما را خاص‌تر کند.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto hover-lift">
                  مشاهده محصولات
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover-lift">
                  <InstagramIcon className="w-4 h-4" />
                  {INSTAGRAM_DISPLAY}
                </Button>
              </a>
            </div>
          </div>

          <div className="scroll-reveal scroll-reveal-scale order-1 lg:order-2">
            <HeroGallerySlider />
          </div>
        </div>
      </div>
    </section>
  );
}
