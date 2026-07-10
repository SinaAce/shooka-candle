"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, MessageCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "پروفایل", icon: User },
  { href: "/account/notifications", label: "اعلان‌ها", icon: Bell },
  { href: "/account/orders", label: "سفارشات", icon: Package },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/support", label: "پشتیبانی", icon: MessageCircle },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 shrink-0">
      <nav className="theme-panel p-2 space-y-1">
        {links.map((link) => {
          const isActive =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
