import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Heart, Truck } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/products/ProductCard";
import HeroSection from "@/components/home/HeroSection";
import InstagramIcon from "@/components/icons/InstagramIcon";
import prisma from "@/lib/prisma";
import {
  INSTAGRAM_DISPLAY,
  INSTAGRAM_URL,
} from "@/lib/constants";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true, featured: true },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true } },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      take: 6,
    });
  } catch {
    return [];
  }
}

async function getPageGallery() {
  try {
    return await prisma.galleryImage.findMany({
      where: { active: true, type: "PAGE" },
      orderBy: { order: "asc" },
      select: { url: true, alt: true },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, categories, pageGallery] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getPageGallery(),
  ]);

  return (
    <>
      <HeroSection />

      <section className="py-12 sm:py-16 bg-[var(--surface)] candle-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Sparkles,
                title: "دست‌ساز و منحصربه‌فرد",
                desc: "هر شمع با دستان هنرمند ساخته می‌شود",
              },
              {
                icon: Heart,
                title: "رایحه‌های طبیعی",
                desc: "اسانس‌های با کیفیت و ماندگار",
              },
              {
                icon: Truck,
                title: "ارسال سریع",
                desc: "ارسال به سراسر کشور با بسته‌بندی ایمن",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="scroll-reveal scroll-reveal-up text-center p-5 sm:p-6 rounded-2xl candle-card hover-lift"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-12 sm:py-16 candle-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="scroll-reveal scroll-reveal-up text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-6 sm:mb-8">
              دسته‌بندی‌ها
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="scroll-reveal scroll-reveal-scale candle-card p-3 sm:p-4 text-center hover:border-[var(--primary)] transition-all hover-lift"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-2xl sm:text-3xl mb-2 block">🕯️</span>
                  <h3 className="font-medium text-[var(--foreground)] text-xs sm:text-sm">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {cat._count.products} محصول
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16 bg-[var(--surface-alt)] candle-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-reveal scroll-reveal-up text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-6 sm:mb-8">
            گالری شوکا
          </h2>
          {pageGallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {pageGallery.map((img, i) => (
                <div
                  key={img.url + i}
                  className="scroll-reveal scroll-reveal-up relative aspect-square rounded-2xl overflow-hidden ring-1 ring-[var(--border)] hover-lift candle-glow"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `شمع دست‌ساز شوکا ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[var(--text-muted)] py-8">
              به زودی تصاویر گالری اضافه می‌شوند
            </p>
          )}
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[var(--surface)] candle-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal scroll-reveal-up flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              محصولات ویژه
            </h2>
            <Link
              href="/products"
              className="text-[var(--primary)] hover:opacity-80 text-sm font-medium flex items-center gap-1"
            >
              مشاهده همه
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-[var(--surface-alt)] rounded-2xl">
              <span className="text-5xl mb-4 block">🕯️</span>
              <p className="text-[var(--text-muted)]">
                به زودی محصولات جدید اضافه می‌شوند
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        className="py-12 sm:py-16 text-white scroll-reveal scroll-reveal-fade candle-section"
        style={{
          background: `linear-gradient(135deg, var(--primary-hover), var(--primary), #d97706)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            ما را در اینستاگرام دنبال کنید
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto text-sm sm:text-base">
            آخرین محصولات، تخفیف‌ها و ایده‌های تزئینی را در پیج اینستاگرام ما
            ببینید
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-[var(--primary)] hover:bg-white/90"
            >
              <InstagramIcon className="w-5 h-5" />
              {INSTAGRAM_DISPLAY}
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}
