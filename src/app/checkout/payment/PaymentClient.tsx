"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending");
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    if (!orderId) {
      router.push("/checkout");
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((order) => {
        if (order) setOrderTotal(order.total);
      })
      .catch(() => {});
  }, [orderId, router]);

  async function handlePayment() {
    setStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const success = Math.random() > 0.1;
    setStatus(success ? "success" : "failed");
  }

  if (!orderId) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 text-center">
        {status === "pending" && (
          <>
            <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
              پرداخت آنلاین
            </h1>
            <p className="text-[var(--text-muted)] mb-6 text-sm sm:text-base">
              شما به درگاه پرداخت امن هدایت می‌شوید
            </p>
            {orderTotal > 0 && (
              <p className="text-2xl font-bold text-[var(--primary)] mb-6">
                {formatPrice(orderTotal)}
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)] mb-6">
              شماره سفارش: {orderId.slice(0, 8)}...
            </p>
            <Button onClick={handlePayment} size="lg" className="w-full">
              پرداخت با درگاه زرین‌پال
            </Button>
            <button
              onClick={() => router.push(`/account/orders/${orderId}`)}
              className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--primary)]"
            >
              پرداخت بعداً
            </button>
          </>
        )}

        {status === "processing" && (
          <div className="py-8">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">
              در حال اتصال به درگاه پرداخت...
            </p>
          </div>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
              پرداخت موفق
            </h1>
            <p className="text-[var(--text-muted)] mb-6">
              سفارش شما با موفقیت ثبت و پرداخت شد
            </p>
            <Button
              onClick={() =>
                router.push(`/account/orders/${orderId}?success=true`)
              }
              className="w-full"
            >
              مشاهده سفارش
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
              پرداخت ناموفق
            </h1>
            <p className="text-[var(--text-muted)] mb-6">
              خطا در پرداخت. لطفاً دوباره تلاش کنید.
            </p>
            <Button onClick={() => setStatus("pending")} className="w-full">
              تلاش مجدد
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
