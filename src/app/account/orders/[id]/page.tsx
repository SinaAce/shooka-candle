"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AccountSidebar from "@/components/account/AccountSidebar";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_STATUS_LABELS,
} from "@/lib/utils";
import {
  ArrowRight,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  ImageIcon,
  FileText,
} from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  receiptUrl?: string | null;
  receiptText?: string | null;
  receiptStatus?: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  address: {
    fullName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  };
}

function ReceiptStatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;

  const styles: Record<string, string> = {
    AWAITING_RECEIPT: "bg-amber-100 text-amber-700",
    PENDING_REVIEW: "bg-blue-100 text-blue-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const icons: Record<string, typeof Clock> = {
    AWAITING_RECEIPT: Clock,
    PENDING_REVIEW: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
  };

  const Icon = icons[status] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${styles[status] || "bg-stone-100 text-[var(--text-secondary)]"}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {RECEIPT_STATUS_LABELS[status] || status}
    </span>
  );
}

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [receiptMode, setReceiptMode] = useState<"image" | "text">("image");
  const [receiptText, setReceiptText] = useState("");
  const success = searchParams.get("success");
  const uploadReceipt = searchParams.get("uploadReceipt");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
      });
  }, [params.id]);

  async function submitReceipt(options: { file?: File; text?: string }) {
    if (!order) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      if (options.file) formData.append("file", options.file);
      if (options.text?.trim()) formData.append("receiptText", options.text.trim());

      const res = await fetch(`/api/orders/${order.id}/receipt`, {
        method: "POST",
        body: formData,
      });

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setUploadError("پاسخ سرور نامعتبر بود. لطفاً دوباره تلاش کنید.");
        return;
      }

      if (!res.ok) {
        setUploadError(data.error || `خطا در ارسال رسید (کد ${res.status})`);
        return;
      }

      setOrder({ ...order, ...data });
      setReceiptText("");
      setUploadSuccess("رسید با موفقیت ارسال شد و در حال بررسی است.");
    } catch {
      setUploadError("خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await submitReceipt({ file });
  }

  async function handleReceiptTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receiptText.trim()) {
      setUploadError("متن رسید را وارد کنید");
      return;
    }
    await submitReceipt({ text: receiptText });
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-[var(--text-muted)]">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-[var(--text-muted)]">
        در حال بارگذاری...
      </div>
    );
  }

  const isCard =
    order.paymentMethod === "CARD" ||
    order.receiptStatus != null ||
    order.notes?.includes("کارت به کارت") === true;
  const hasReceipt = Boolean(order.receiptUrl || order.receiptText);
  const canUploadReceipt =
    isCard &&
    !hasReceipt &&
    order.receiptStatus !== "APPROVED" &&
    order.receiptStatus !== "REJECTED" &&
    order.receiptStatus !== "PENDING_REVIEW";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-amber-700 mb-6"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به سفارشات
      </Link>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6">
          {isCard && uploadReceipt
            ? "سفارش ثبت شد. لطفاً تصویر یا متن رسید واریز را ارسال کنید."
            : "سفارش شما با موفقیت ثبت شد! به زودی با شما تماس خواهیم گرفت."}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />

        <div className="flex-1 space-y-6">
          <div className="theme-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                {order.orderNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                {isCard && <ReceiptStatusBadge status={order.receiptStatus} />}
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              روش پرداخت:{" "}
              {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            </p>
          </div>

          {isCard && (
            <div className="theme-panel p-6">
              <h2 className="font-semibold mb-4">ارسال رسید پرداخت</h2>

              {uploadSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  {uploadSuccess}
                </div>
              )}

              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {uploadError}
                </div>
              )}

              {hasReceipt ? (
                <div className="space-y-4">
                  {order.receiptUrl && (
                    <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden border border-stone-200">
                      <Image
                        src={order.receiptUrl}
                        alt="رسید پرداخت"
                        fill
                        className="object-contain bg-stone-50"
                      />
                    </div>
                  )}
                  {order.receiptText && (
                    <div className="p-4 theme-panel-muted rounded-lg border border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)] mb-2">متن رسید:</p>
                      <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                        {order.receiptText}
                      </p>
                    </div>
                  )}
                  {order.receiptStatus === "PENDING_REVIEW" && (
                    <p className="text-sm text-blue-600">
                      رسید شما دریافت شد و در حال بررسی توسط پشتیبانی است.
                    </p>
                  )}
                  {order.receiptStatus === "APPROVED" && (
                    <p className="text-sm text-emerald-600">
                      رسید تأیید شد. سفارش شما فعال است.
                    </p>
                  )}
                  {order.receiptStatus === "REJECTED" && (
                    <p className="text-sm text-red-600">
                      رسید رد شد. در صورت نیاز با پشتیبانی تماس بگیرید.
                    </p>
                  )}
                </div>
              ) : canUploadReceipt ? (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    پس از واریز مبلغ، تصویر رسید یا اطلاعات واریز را ارسال کنید.
                  </p>

                  <div className="flex gap-2 p-1 bg-[var(--surface-alt)] rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptMode("image");
                        setUploadError("");
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                        receiptMode === "image"
                          ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm font-medium"
                          : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      تصویر رسید
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptMode("text");
                        setUploadError("");
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                        receiptMode === "text"
                          ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm font-medium"
                          : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      متن رسید
                    </button>
                  </div>

                  {receiptMode === "image" ? (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleReceiptUpload}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        loading={uploading}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        انتخاب و ارسال تصویر
                      </Button>
                      <p className="text-xs text-[var(--text-muted)]">
                        فرمت‌های مجاز: JPG, PNG, WebP — حداکثر ۵ مگابایت
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReceiptTextSubmit} className="space-y-3">
                      <Textarea
                        label="اطلاعات رسید"
                        value={receiptText}
                        onChange={(e) => setReceiptText(e.target.value)}
                        rows={5}
                        placeholder={`مثال:
شماره پیگیری: ۱۲۳۴۵۶
مبلغ واریزی: ${formatPrice(order.total)}
تاریخ و ساعت: ۱۴۰۴/۰۴/۲۰ — ۱۴:۳۰
نام واریزکننده: ...`}
                      />
                      <Button type="submit" loading={uploading} className="gap-2">
                        <FileText className="w-4 h-4" />
                        ارسال متن رسید
                      </Button>
                    </form>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <div className="theme-panel p-6">
            <h2 className="font-semibold mb-4">محصولات</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-panel p-6">
            <h2 className="font-semibold mb-3">آدرس تحویل</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {order.address.fullName} — {order.address.phone}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {order.address.province}، {order.address.city}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{order.address.address}</p>
            <p className="text-sm text-[var(--text-muted)]">
              کد پستی: {order.address.postalCode}
            </p>
          </div>

          <div className="theme-panel p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">جمع</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">ارسال</span>
                <span>
                  {order.shippingCost === 0
                    ? "رایگان"
                    : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>مجموع</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-[var(--text-muted)]">
          در حال بارگذاری...
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
