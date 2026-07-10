"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import ScrollRevealObserver from "@/components/motion/ScrollRevealObserver";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CartProvider>
          <NotificationProvider>
            <ScrollRevealObserver />
            {children}
          </NotificationProvider>
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
