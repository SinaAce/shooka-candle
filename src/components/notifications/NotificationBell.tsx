"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "./NotificationProvider";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  variant?: "light" | "dark";
}

export default function NotificationBell({
  variant = "light",
}: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    function updatePosition() {
      const rect = buttonRef.current!.getBoundingClientRect();
      const menuWidth = 320;
      const padding = 8;
      let left = rect.right - menuWidth;
      left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding));

      setMenuStyle({
        top: rect.bottom + padding,
        left,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const dropdown = open && mounted && (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <div
        ref={ref}
        style={{ top: menuStyle.top, left: menuStyle.left }}
        className={cn(
          "fixed z-[9999] w-80 max-h-96 overflow-hidden rounded-xl shadow-2xl border animate-scale-in",
          variant === "dark"
            ? "bg-stone-900 border-stone-700"
            : "bg-[var(--surface)] border-[var(--border)]"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            variant === "dark" ? "border-stone-700" : "border-[var(--border)]"
          )}
        >
          <span
            className={cn(
              "font-semibold text-sm",
              variant === "dark" ? "text-white" : "text-[var(--foreground)]"
            )}
          >
            اعلان‌ها
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-[var(--primary)] flex items-center gap-1 hover:opacity-80"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              خواندن همه
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-72">
          {notifications.length === 0 ? (
            <p
              className={cn(
                "text-sm text-center py-8",
                variant === "dark" ? "text-stone-500" : "text-[var(--text-muted)]"
              )}
            >
              اعلانی ندارید
            </p>
          ) : (
            notifications.slice(0, 15).map((n) => (
              <Link
                key={n.id}
                href={n.link || "/account/notifications"}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                  setOpen(false);
                }}
                className={cn(
                  "block px-4 py-3 border-b transition-colors",
                  variant === "dark"
                    ? "border-stone-800 hover:bg-stone-800"
                    : "border-[var(--border)] hover:bg-[var(--surface-hover)]",
                  !n.read &&
                    (variant === "dark"
                      ? "bg-stone-800/50"
                      : "bg-[var(--primary-light)]/40")
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    variant === "dark" ? "text-white" : "text-[var(--foreground)]"
                  )}
                >
                  {n.title}
                </p>
                <p
                  className={cn(
                    "text-xs mt-0.5 line-clamp-2",
                    variant === "dark" ? "text-stone-400" : "text-[var(--text-muted)]"
                  )}
                >
                  {n.message}
                </p>
                <p className="text-[10px] text-stone-500 mt-1">
                  {new Date(n.createdAt).toLocaleDateString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Link>
            ))
          )}
        </div>

        <Link
          href="/account/notifications"
          onClick={() => setOpen(false)}
          className={cn(
            "block text-center text-xs py-2.5 border-t hover:opacity-80",
            variant === "dark"
              ? "border-stone-700 text-stone-400"
              : "border-[var(--border)] text-[var(--primary)]"
          )}
        >
          مشاهده همه
        </Link>
      </div>
    </>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={cn(
          "relative p-2 transition-colors rounded-lg",
          variant === "dark"
            ? "text-stone-400 hover:text-white hover:bg-stone-800"
            : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]"
        )}
        aria-label="اعلان‌ها"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-badge-pop">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
