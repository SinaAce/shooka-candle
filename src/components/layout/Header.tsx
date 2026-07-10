"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import ThemeToggle from "@/components/theme/ThemeToggle";
import BrandLogo from "@/components/layout/BrandLogo";
import { useCart } from "@/components/cart/CartProvider";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { INSTAGRAM_URL } from "@/lib/constants";

export default function Header() {
  const { data: session } = useSession();
  const { count: cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "خانه" },
    { href: "/products", label: "محصولات" },
    { href: "/about", label: "درباره ما" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal h-14 sm:h-16 gap-2">
          <div className="min-w-0 shrink-0 md:justify-self-start">
            <BrandLogo size="md" showTagline />
          </div>

          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 md:justify-self-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center h-10 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 md:justify-self-end shrink-0">
            <ThemeToggle />

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 text-[var(--text-muted)] hover:text-pink-600 transition-colors"
              aria-label="اینستاگرام"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            {session ? (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  aria-label="سبد خرید"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-bold animate-badge-pop">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <NotificationBell />
                <div className="relative group hidden sm:flex items-center gap-1">
                  <button className="flex items-center gap-2 p-1.5 pr-3 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]">
                    <User className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium max-w-[100px] truncate text-[var(--foreground)]">
                      {session.user.name?.split(" ")[0] || "کاربر"}
                    </span>
                    {session.user.role === "ADMIN" && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">
                        مدیر
                      </span>
                    )}
                  </button>
                  <div className="absolute left-0 top-full mt-1 w-48 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all animate-fade-in">
                    <div className="p-3 border-b border-[var(--border)]">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {session.user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                      >
                        حساب کاربری
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                      >
                        سفارشات
                      </Link>
                      {session.user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary-light)]"
                        >
                          پنل مدیریت
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        خروج
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">ثبت‌نام</Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 text-[var(--text-secondary)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="منو"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border)] animate-fade-in-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2.5 text-[var(--text-secondary)] hover:text-[var(--primary)]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 py-2.5 text-[var(--text-secondary)]"
                  onClick={() => setMobileOpen(false)}
                >
                  سبد خرید
                  {cartCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className="block py-2.5 text-[var(--text-secondary)]"
                  onClick={() => setMobileOpen(false)}
                >
                  حساب کاربری
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block py-2.5 text-red-600 w-full text-right"
                >
                  خروج
                </button>
              </>
            ) : (
              <div className="flex gap-2 mt-4">
                <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    ثبت‌نام
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
