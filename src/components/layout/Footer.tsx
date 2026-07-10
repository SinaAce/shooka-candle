import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import BrandLogo from "@/components/layout/BrandLogo";
import {
  INSTAGRAM_DISPLAY,
  INSTAGRAM_URL,
} from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      className="mt-auto scroll-reveal scroll-reveal-fade relative"
      style={{ background: "var(--footer-bg)", color: "var(--footer-text)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[var(--glow)]/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <BrandLogo inverted showTagline size="md" className="mb-4" />
            <p className="text-sm leading-relaxed opacity-80">
              شمع‌های دست‌ساز و تزئینی با کیفیت بالا. هر شمع با عشق و دقت ساخته
              شده تا فضای شما را گرم و دلنشین کند.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:opacity-100 opacity-80 transition-opacity hover:translate-x-[-2px] inline-block transition-transform">
                  محصولات
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:opacity-100 opacity-80 transition-opacity hover:translate-x-[-2px] inline-block transition-transform">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/account/support" className="hover:opacity-100 opacity-80 transition-opacity hover:translate-x-[-2px] inline-block transition-transform">
                  پشتیبانی
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:opacity-100 opacity-80 transition-opacity hover:translate-x-[-2px] inline-block transition-transform">
                  پیگیری سفارش
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold mb-4">ارتباط با ما</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-pink-400 transition-colors opacity-80 hover:opacity-100"
                >
                  <InstagramIcon className="w-4 h-4" />
                  {INSTAGRAM_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <Mail className="w-4 h-4" />
                info@shooka-candle.ir
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <Phone className="w-4 h-4" />
                ۰۹۱۲-XXX-XXXX
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm opacity-60">
          <p>© {new Date().getFullYear()} شوکا — تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
