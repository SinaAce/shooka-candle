"use client";

import { useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Image from "next/image";
import {
  CreditCard,
  Truck,
  Percent,
  Phone,
  Mail,
  Save,
  ToggleLeft,
  Megaphone,
  Upload,
  X,
} from "lucide-react";
import { useNotifications } from "@/components/notifications/NotificationProvider";

interface Settings {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  shebaNumber: string;
  codEnabled: boolean;
  onlineEnabled: boolean;
  cardTransferEnabled: boolean;
  shippingCost: number;
  freeShippingMin: number;
  globalDiscountPercent: number;
  globalDiscountActive: boolean;
  promoBannerActive: boolean;
  promoBannerText: string;
  promoBannerLink: string;
  promoBannerImageUrl: string;
  siteTagline: string;
  contactPhone: string;
  contactEmail: string;
}

export default function AdminSettingsPage() {
  const { refreshNotifications } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) =>
        setForm({
          ...data,
          shebaNumber: data.shebaNumber || "",
          promoBannerText: data.promoBannerText || "",
          promoBannerLink: data.promoBannerLink || "/products",
          promoBannerImageUrl: data.promoBannerImageUrl || "",
          siteTagline: data.siteTagline || "",
          contactPhone: data.contactPhone || "",
          contactEmail: data.contactEmail || "",
        })
      );
  }, []);

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;

    setUploadingBanner(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok && data.url) {
      setForm({ ...form, promoBannerImageUrl: data.url });
    }
    setUploadingBanner(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        shippingCost: Number(form.shippingCost),
        freeShippingMin: Number(form.freeShippingMin),
        globalDiscountPercent: Number(form.globalDiscountPercent),
        promoBannerText: form.promoBannerText || null,
        promoBannerLink: form.promoBannerLink || null,
        promoBannerImageUrl: form.promoBannerImageUrl || null,
      }),
    });

    if (res.ok) {
      setMessage("تنظیمات با موفقیت ذخیره شد");
      await refreshNotifications();
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error || "خطا در ذخیره");
    }
    setLoading(false);
  }

  if (!form) {
    return <p className="text-[var(--text-muted)]">در حال بارگذاری...</p>;
  }

  return (
    <div>
      <div className="mb-6 scroll-reveal scroll-reveal-up">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">تنظیمات سایت</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          پرداخت، ارسال، تخفیف، بنر مناسبت و اطلاعات تماس
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            className={`text-sm p-4 rounded-xl ${
              message.includes("موفقیت") ? "theme-alert-success" : "theme-alert-error"
            }`}
          >
            {message}
          </div>
        )}

        <section className="scroll-reveal scroll-reveal-up theme-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Megaphone className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">
              بنر مناسبت / تخفیف
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            بنر نازک بالای سایت برای مناسبت‌ها (یلدا، عید، و …). می‌توانید با
            تخفیف سراسری ترکیبش کنید.
          </p>

          <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={form.promoBannerActive}
              onChange={(e) =>
                setForm({ ...form, promoBannerActive: e.target.checked })
              }
              className="rounded text-[var(--primary)]"
            />
            نمایش بنر بالای سایت
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="متن بنر"
                value={form.promoBannerText}
                onChange={(e) =>
                  setForm({ ...form, promoBannerText: e.target.value })
                }
                placeholder="مثال: یلدایتون مبارک! ۱۵٪ تخفیف ویژه"
              />
            </div>
            <Input
              label="لینک بنر (اختیاری)"
              value={form.promoBannerLink}
              onChange={(e) =>
                setForm({ ...form, promoBannerLink: e.target.value })
              }
              placeholder="/products"
              dir="ltr"
            />
          </div>

          <div className="mt-4 p-4 theme-panel-muted rounded-xl">
            <p className="text-sm font-medium text-[var(--foreground)] mb-3">
              تصویر مزینه بنر (اختیاری)
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {form.promoBannerImageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden ring-1 ring-[var(--border)]">
                  <Image
                    src={form.promoBannerImageUrl}
                    alt="بنر"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, promoBannerImageUrl: "" })}
                    className="absolute top-0.5 left-0.5 p-0.5 bg-black/50 rounded text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={uploadingBanner}
                onClick={() => fileRef.current?.click()}
                className="gap-1"
              >
                <Upload className="w-4 h-4" />
                آپلود تصویر
              </Button>
            </div>
          </div>
        </section>

        <section className="scroll-reveal scroll-reveal-up theme-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">تنظیمات پرداخت</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="شماره کارت"
              value={form.cardNumber}
              onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
              dir="ltr"
              required
            />
            <Input
              label="نام صاحب کارت"
              value={form.cardHolder}
              onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
              required
            />
            <Input
              label="نام بانک"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              required
            />
            <Input
              label="شماره شبا (اختیاری)"
              value={form.shebaNumber || ""}
              onChange={(e) => setForm({ ...form, shebaNumber: e.target.value })}
              dir="ltr"
            />
          </div>

          <div className="flex flex-wrap gap-6 mt-5 p-4 theme-panel-muted rounded-xl">
            {[
              { key: "codEnabled" as const, label: "پرداخت در محل" },
              { key: "onlineEnabled" as const, label: "پرداخت آنلاین" },
              { key: "cardTransferEnabled" as const, label: "کارت به کارت" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm cursor-pointer text-[var(--foreground)]"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="rounded text-[var(--primary)]"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="scroll-reveal scroll-reveal-up theme-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Truck className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-[var(--foreground)]">ارسال</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="هزینه ارسال (تومان)"
              type="number"
              value={form.shippingCost}
              onChange={(e) =>
                setForm({ ...form, shippingCost: Number(e.target.value) })
              }
              dir="ltr"
            />
            <Input
              label="حداقل خرید برای ارسال رایگان (تومان)"
              type="number"
              value={form.freeShippingMin}
              onChange={(e) =>
                setForm({ ...form, freeShippingMin: Number(e.target.value) })
              }
              dir="ltr"
            />
          </div>
        </section>

        <section className="scroll-reveal scroll-reveal-up theme-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Percent className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--foreground)]">تخفیف سراسری</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="درصد تخفیف"
              type="number"
              min={0}
              max={100}
              value={form.globalDiscountPercent}
              onChange={(e) =>
                setForm({
                  ...form,
                  globalDiscountPercent: Number(e.target.value),
                })
              }
              dir="ltr"
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer mt-8 text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={form.globalDiscountActive}
                onChange={(e) =>
                  setForm({ ...form, globalDiscountActive: e.target.checked })
                }
                className="rounded text-[var(--primary)]"
              />
              <ToggleLeft className="w-4 h-4 text-[var(--text-muted)]" />
              فعال‌سازی تخفیف برای همه محصولات
            </label>
          </div>
        </section>

        <section className="scroll-reveal scroll-reveal-up theme-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Phone className="w-5 h-5 text-violet-500" />
            <h2 className="font-semibold text-[var(--foreground)]">اطلاعات تماس</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="شماره تماس"
              value={form.contactPhone || ""}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            />
            <Input
              label="ایمیل"
              value={form.contactEmail || ""}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              dir="ltr"
            />
            <div className="md:col-span-2">
              <Input
                label="شعار سایت"
                value={form.siteTagline || ""}
                onChange={(e) => setForm({ ...form, siteTagline: e.target.value })}
              />
            </div>
          </div>
        </section>

        <Button type="submit" loading={loading} size="lg">
          <Save className="w-4 h-4" />
          ذخیره تنظیمات
        </Button>
      </form>
    </div>
  );
}
