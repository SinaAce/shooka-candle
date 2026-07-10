import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import StoreShell from "@/components/layout/StoreShell";
import Providers from "@/components/Providers";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "شوکا | شمع‌های دست‌ساز و تزئینی",
  description:
    "فروشگاه آنلاین شمع‌های دست‌ساز و تزئینی شوکا — با عشق ساخته شده برای گرم کردن فضای شما",
  keywords: ["شمع", "شمع دست ساز", "شمع تزئینی", "شوکا", "shooka candle"],
  icons: {
    icon: "/images/brand/logo.png",
    apple: "/images/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme="default"
      className={`${vazirmatn.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Providers>
          <StoreShell>{children}</StoreShell>
        </Providers>
      </body>
    </html>
  );
}
