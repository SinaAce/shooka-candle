import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex >= 0) return String(persianIndex);
    return String(ARABIC_DIGITS.indexOf(digit));
  });
}

export function normalizePhone(value: string): string {
  let digits = toEnglishDigits(value).replace(/\D/g, "");

  if (digits.startsWith("98") && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  } else if (digits.length === 10 && digits.startsWith("9")) {
    digits = `0${digits}`;
  }

  return digits;
}

export function normalizePostalCode(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u0600-\u06FF]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `item-${Date.now().toString(36).slice(-6)}`;
}

/** URL-safe ASCII slug for product pages (Next.js dynamic routes) */
export function generateProductSlug(name: string, id?: string): string {
  const suffix = (id ?? Date.now().toString(36)).slice(-8);

  const latin = name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u0600-\u06FF]+/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!latin || latin.length < 2) {
    return `sham-${suffix}`;
  }

  return `${latin}-${suffix}`;
}

export function isAsciiSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SK-${timestamp}-${random}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار تأیید",
  CONFIRMED: "تأیید شده",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "پرداخت در محل",
  ONLINE: "پرداخت آنلاین",
  CARD: "کارت به کارت",
};

export const RECEIPT_STATUS_LABELS: Record<string, string> = {
  AWAITING_RECEIPT: "در انتظار رسید",
  PENDING_REVIEW: "رسید در حال بررسی",
  APPROVED: "رسید تأیید شد",
  REJECTED: "رسید رد شد",
};

export function paymentMethodFromCheckout(value: string): "COD" | "ONLINE" | "CARD" {
  const map: Record<string, "COD" | "ONLINE" | "CARD"> = {
    cod: "COD",
    online: "ONLINE",
    card: "CARD",
  };
  return map[value] || "COD";
}
