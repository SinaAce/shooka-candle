"use client";

import { useEffect } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              اعلان‌ها
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {unreadCount > 0
                ? `${unreadCount} اعلان خوانده‌نشده`
                : "همه اعلان‌ها خوانده شده"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4" />
            خواندن همه
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />

        <div className="flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-40" />
              <p className="text-[var(--text-muted)]">اعلانی ندارید</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={n.id}
                className={`bg-[var(--surface)] rounded-xl border p-4 transition-all animate-fade-in-up ${
                  n.read
                    ? "border-[var(--border)] opacity-80"
                    : "border-[var(--primary)]/30 bg-[var(--primary-light)]/30"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[var(--foreground)]">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {new Date(n.createdAt).toLocaleString("fa-IR")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => !n.read && markAsRead(n.id)}
                        className="text-xs text-[var(--primary)] hover:underline"
                      >
                        مشاهده
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
                      >
                        علامت خوانده
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
