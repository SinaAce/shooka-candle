"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-xs text-[var(--text-muted)]">خوش آمدید</p>
        <p className="text-sm font-semibold text-[var(--foreground)]">
          {session?.user?.name || session?.user?.email}
          <span className="mr-2 text-[10px] font-normal bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded-full">
            مدیر
          </span>
        </p>
      </div>

      <div className="flex items-center gap-1">
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
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          خروج
        </button>
      </div>
    </header>
  );
}
