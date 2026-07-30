"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, ExternalLink, Menu } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -mr-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] shrink-0"
          aria-label="باز کردن منو"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-muted)]">خوش آمدید</p>
          <p className="text-sm font-semibold text-[var(--foreground)] truncate">
            {session?.user?.name || session?.user?.email}
            <span className="mr-2 text-[10px] font-normal bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded-full">
              مدیر
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />
        <NotificationBell />
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          فروشگاه
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
