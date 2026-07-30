"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Settings,
  Megaphone,
  PlusCircle,
  BarChart3,
  Images,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LOGO_PATH, BRAND_NAME } from "@/lib/constants";

export const adminLinks = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "آنالیز درآمد", icon: BarChart3 },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/products/new", label: "افزودن شمع", icon: PlusCircle },
  { href: "/admin/orders", label: "سفارشات", icon: ShoppingCart },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderOpen },
  { href: "/admin/gallery", label: "گالری", icon: Images },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/announcements", label: "اطلاعیه‌ها", icon: Megaphone },
  { href: "/admin/settings", label: "تنظیمات سایت", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const nav = (
    <>
      <Link
        href="/admin"
        className="flex items-center gap-2.5 mb-6 px-2 group"
        onClick={onMobileClose}
      >
        <Image
          src={LOGO_PATH}
          alt={BRAND_NAME}
          width={40}
          height={40}
          className="rounded-full ring-2 ring-[var(--primary)]/30 group-hover:ring-[var(--primary)] transition-all"
        />
        <div>
          <h2 className="text-[var(--foreground)] font-bold">{BRAND_NAME}</h2>
          <p className="text-[10px] text-[var(--text-muted)]">پنل مدیریت</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {adminLinks.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : link.href === "/admin/products"
                ? pathname === "/admin/products"
                : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                isActive
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium shadow-sm"
                  : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              )}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] px-2">
        نسخه ۲.۰ — مدیریت کامل فروشگاه
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[var(--surface)] text-[var(--text-secondary)] min-h-full p-4 flex-col border-l border-[var(--border)] shrink-0 shadow-sm">
        {nav}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/50"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 right-0 bottom-0 z-[70] w-[min(85vw,18rem)] bg-[var(--surface)] p-4 flex flex-col border-l border-[var(--border)] shadow-xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            منوی مدیریت
          </span>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
            aria-label="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
