"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AccountSidebar from "@/components/account/AccountSidebar";
import Pagination from "@/components/ui/Pagination";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { Package } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?page=${page}&limit=${DEFAULT_PAGE_SIZE}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || (Array.isArray(data) ? data : []));
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
        setLoading(false);
      });
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">سفارشات من</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />

        <div className="flex-1">
          {loading ? (
            <p className="text-stone-500">در حال بارگذاری...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">هنوز سفارشی ثبت نکرده‌اید</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-stone-800">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">
                    {order.items.length} محصول — {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
