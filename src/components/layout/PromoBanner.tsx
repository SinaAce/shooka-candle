"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, X } from "lucide-react";

interface PromoSettings {
  promoBannerActive: boolean;
  promoBannerText?: string | null;
  promoBannerLink?: string | null;
  promoBannerImageUrl?: string | null;
  globalDiscountActive?: boolean;
  globalDiscountPercent?: number;
}

export default function PromoBanner() {
  const [promo, setPromo] = useState<PromoSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setPromo(data))
      .catch(() => {});
  }, []);

  if (!promo?.promoBannerActive || dismissed) return null;

  const text =
    promo.promoBannerText?.trim() ||
    (promo.globalDiscountActive && promo.globalDiscountPercent
      ? `🎉 مناسبت ویژه! ${promo.globalDiscountPercent}% تخفیف روی تمام محصولات`
      : null);

  if (!text) return null;

  const href = promo.promoBannerLink?.trim() || "/products";

  const content = (
    <>
      {promo.promoBannerImageUrl && (
        <span className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-md overflow-hidden ring-1 ring-white/30">
          <Image
            src={promo.promoBannerImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="32px"
          />
        </span>
      )}
      {!promo.promoBannerImageUrl && (
        <Sparkles className="w-4 h-4 shrink-0 text-amber-200" />
      )}
      <span className="text-xs sm:text-sm font-medium truncate">{text}</span>
    </>
  );

  return (
    <div className="relative z-[60] bg-gradient-to-l from-[var(--primary-hover)] via-[var(--primary)] to-amber-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-9 sm:h-10 flex items-center justify-center gap-2">
        <Link
          href={href}
          className="flex items-center justify-center gap-2 min-w-0 flex-1 hover:opacity-90 transition-opacity"
        >
          {content}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-white/15 shrink-0"
          aria-label="بستن بنر"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
