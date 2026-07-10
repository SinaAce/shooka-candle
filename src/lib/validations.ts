import { z } from "zod";
import { normalizePhone, normalizePostalCode } from "./utils";

export const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export const productSchema = z.object({
  name: z.string().min(2, "نام محصول الزامی است"),
  description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  price: z.number().positive("قیمت باید مثبت باشد"),
  comparePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد"),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
  scent: z.string().optional().nullable(),
  burnTime: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی الزامی است"),
  description: z.string().optional().nullable(),
});

export const addressSchema = z.object({
  title: z.string().trim().min(2, "عنوان آدرس الزامی است"),
  fullName: z.string().trim().min(2, "نام گیرنده الزامی است"),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود")
    ),
  province: z.string().trim().min(2, "استان الزامی است"),
  city: z.string().trim().min(2, "شهر الزامی است"),
  address: z.string().trim().min(5, "آدرس کامل الزامی است"),
  postalCode: z
    .string()
    .trim()
    .transform(normalizePostalCode)
    .pipe(z.string().regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد")),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "آدرس تحویل الزامی است"),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(["cod", "online", "card"]).default("cod"),
});

export const siteSettingsSchema = z.object({
  cardNumber: z.string().min(16, "شماره کارت معتبر وارد کنید"),
  cardHolder: z.string().min(2, "نام صاحب کارت الزامی است"),
  bankName: z.string().min(2, "نام بانک الزامی است"),
  shebaNumber: z.string().optional().nullable(),
  codEnabled: z.boolean(),
  onlineEnabled: z.boolean(),
  cardTransferEnabled: z.boolean(),
  shippingCost: z.number().int().min(0),
  freeShippingMin: z.number().int().min(0),
  globalDiscountPercent: z.number().int().min(0).max(100),
  globalDiscountActive: z.boolean(),
  promoBannerActive: z.boolean(),
  promoBannerText: z.string().optional().nullable(),
  promoBannerLink: z.string().optional().nullable(),
  promoBannerImageUrl: z.string().optional().nullable(),
  siteTagline: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(2, "عنوان الزامی است"),
  message: z.string().trim().min(5, "متن اطلاعیه الزامی است"),
  link: z.string().optional().nullable(),
});
