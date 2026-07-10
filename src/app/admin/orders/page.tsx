"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_STATUS_LABELS,
} from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  CheckCircle,
  XCircle,
  Eye,
  X,
  User,
  MapPin,
  CreditCard,
  Package,
  FileText,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  productId: string;
}

interface OrderAddress {
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  receiptUrl?: string | null;
  receiptText?: string | null;
  receiptStatus?: string | null;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string | null; email: string; phone: string | null };
  items: OrderItem[];
  address: OrderAddress;
}

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function OrderDetailModal({
  order,
  actionLoading,
  onClose,
  onStatusChange,
  onReceiptAction,
}: {
  order: Order;
  actionLoading: string | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  onReceiptAction: (orderId: string, action: "approve" | "reject") => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const isCard =
    order.paymentMethod === "CARD" ||
    order.receiptStatus != null ||
    order.notes?.includes("کارت به کارت") === true;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative bg-[var(--surface)] rounded-2xl w-full max-w-2xl max-h-[min(90vh,calc(100dvh-2rem))] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--border)] shrink-0">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">جزئیات سفارش</p>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {order.orderNumber}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 text-[var(--text-muted)] transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            </span>
            {order.receiptStatus && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                {RECEIPT_STATUS_LABELS[order.receiptStatus]}
              </span>
            )}
          </div>

          <section className="rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="font-semibold text-stone-800">مشتری</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[var(--text-muted)]">نام: </span>
                <span>{order.user.name || "—"}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">ایمیل: </span>
                <span dir="ltr">{order.user.email}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">موبایل: </span>
                <span dir="ltr">{order.user.phone || "—"}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="font-semibold text-stone-800">آدرس تحویل</h3>
            </div>
            <div className="text-sm space-y-1 text-stone-600">
              <p>
                <span className="text-[var(--text-muted)]">{order.address.title}: </span>
                {order.address.fullName} — {order.address.phone}
              </p>
              <p>
                {order.address.province}، {order.address.city}
              </p>
              <p>{order.address.address}</p>
              <p className="text-stone-400">
                کد پستی: {order.address.postalCode}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="font-semibold text-stone-800">محصولات</h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0"
                >
                  {item.image ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-stone-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="font-semibold text-stone-800">خلاصه مالی</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">جمع محصولات</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>تخفیف</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">هزینه ارسال</span>
                <span>
                  {order.shippingCost === 0
                    ? "رایگان"
                    : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[var(--border)]">
                <span>مجموع</span>
                <span className="text-amber-700">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {order.notes && (
            <section className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="font-semibold text-stone-800">یادداشت سفارش</h3>
              </div>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">
                {order.notes}
              </p>
            </section>
          )}

          {isCard && (
            <section className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="font-semibold text-stone-800">رسید پرداخت</h3>
              </div>
              {order.receiptUrl || order.receiptText ? (
                <div className="space-y-4">
                  {order.receiptUrl && (
                    <div className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden border border-stone-200 bg-[var(--surface-alt)]">
                      <Image
                        src={order.receiptUrl}
                        alt="رسید"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  {order.receiptText && (
                    <div className="p-3 bg-[var(--surface-alt)] rounded-lg border border-stone-200">
                      <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                        {order.receiptText}
                      </p>
                    </div>
                  )}
                  {order.receiptStatus === "PENDING_REVIEW" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        loading={actionLoading === `${order.id}-approve`}
                        onClick={() => onReceiptAction(order.id, "approve")}
                      >
                        <CheckCircle className="w-4 h-4" />
                        تأیید رسید
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-600 border-red-200"
                        loading={actionLoading === `${order.id}-reject`}
                        onClick={() => onReceiptAction(order.id, "reject")}
                      >
                        <XCircle className="w-4 h-4" />
                        رد رسید
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-400">رسیدی ارسال نشده</p>
              )}
            </section>
          )}
        </div>

        <div className="p-5 border-t border-[var(--border)] shrink-0 flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-alt)]">
          <div className="flex items-center gap-2">
            <label htmlFor="order-status" className="text-sm text-stone-600">
              وضعیت:
            </label>
            <select
              id="order-status"
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  function updateOrderInList(updated: Order) {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
    );
    setSelectedOrder((prev) =>
      prev?.id === updated.id ? { ...prev, ...updated } : prev
    );
  }

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      updateOrderInList(updated);
    }
  }

  async function handleReceiptAction(
    orderId: string,
    action: "approve" | "reject"
  ) {
    setActionLoading(`${orderId}-${action}`);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptAction: action }),
    });
    if (res.ok) {
      const updated = await res.json();
      updateOrderInList(updated);
    }
    setActionLoading(null);
  }

  const pendingReceipts = orders.filter(
    (o) => o.receiptStatus === "PENDING_REVIEW"
  );

  return (
    <div className="space-y-6">
      <h1 className="scroll-reveal scroll-reveal-up text-2xl font-bold text-[var(--foreground)]">
        مدیریت سفارشات
      </h1>

      {pendingReceipts.length > 0 && (
        <div className="scroll-reveal scroll-reveal-up bg-amber-50 border border-amber-200 rounded-xl p-4 candle-glow">
          <p className="text-sm font-medium text-amber-800">
            {pendingReceipts.length} رسید در انتظار بررسی
          </p>
        </div>
      )}

      <div className="scroll-reveal scroll-reveal-up candle-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--surface-alt)]">
                <th className="text-right p-4 font-medium">شماره</th>
                <th className="text-right p-4 font-medium">مشتری</th>
                <th className="text-right p-4 font-medium">پرداخت</th>
                <th className="text-right p-4 font-medium">مبلغ</th>
                <th className="text-right p-4 font-medium">وضعیت</th>
                <th className="text-right p-4 font-medium">تاریخ</th>
                <th className="text-right p-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-stone-50 hover:bg-[var(--surface-alt)]/50 transition-colors"
                >
                  <td className="p-4 font-medium">{order.orderNumber}</td>
                  <td className="p-4">
                    <p>{order.user.name || "—"}</p>
                    <p className="text-xs text-stone-400">{order.user.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] ||
                        order.paymentMethod}
                    </p>
                    {order.receiptStatus === "PENDING_REVIEW" && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                        رسید جدید
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-700">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      جزئیات
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    سفارشی ثبت نشده
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          actionLoading={actionLoading}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateStatus}
          onReceiptAction={handleReceiptAction}
        />
      )}
    </div>
  );
}
