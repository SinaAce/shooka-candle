"use client";

import { useState } from "react";
import { Moon, Sun, Palette, Droplets } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

const themeConfig: Record<
  Theme,
  { label: string; icon: typeof Sun; color: string }
> = {
  default: { label: "طلایی", icon: Sun, color: "text-amber-600" },
  dark: { label: "تاریک", icon: Moon, color: "text-stone-300" },
  red: { label: "قرمز", icon: Palette, color: "text-red-500" },
  blue: { label: "آبی", icon: Droplets, color: "text-blue-500" },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)] transition-colors"
        aria-label="تغییر تم"
        title="تغییر تم سایت"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-50 w-40 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] py-1">
            {(Object.keys(themeConfig) as Theme[]).map((t) => {
              const cfg = themeConfig[t];
              const Icon = cfg.icon;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors ${
                    theme === t
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
