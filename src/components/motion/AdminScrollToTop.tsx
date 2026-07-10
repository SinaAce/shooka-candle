"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AdminScrollToTopProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function AdminScrollToTop({ containerRef }: AdminScrollToTopProps) {
  const [visible, setVisible] = useState(false);
  const fallbackRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container =
      containerRef?.current ??
      (document.querySelector("[data-admin-scroll]") as HTMLElement | null);

    fallbackRef.current = container;

    function onScroll() {
      const el = containerRef?.current ?? fallbackRef.current;
      const y = el ? el.scrollTop : window.scrollY;
      setVisible(y > 280);
    }

    const el = containerRef?.current ?? fallbackRef.current;
    const target = el ?? window;

    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  function scrollToTop() {
    const el = containerRef?.current ?? fallbackRef.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="رفتن به بالای صفحه"
      className={cn(
        "fixed bottom-6 left-6 z-[9990] w-11 h-11 rounded-full",
        "bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg candle-glow",
        "flex items-center justify-center text-lg",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      ↑
    </button>
  );
}
