"use client";

import { useEffect, useState } from "react";
import { ChevronUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="رفتن به بالای صفحه"
      className={cn(
        "fixed bottom-6 left-6 z-[9990] w-12 h-12 rounded-full",
        "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)]",
        "text-[var(--primary-text)] shadow-lg candle-glow",
        "flex items-center justify-center",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span className="relative">
        <Flame className="w-5 h-5 animate-flame" />
        <ChevronUp className="w-3 h-3 absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-90" />
      </span>
    </button>
  );
}
