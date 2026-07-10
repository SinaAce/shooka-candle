"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  UserPlus,
  Flame,
} from "lucide-react";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  revenue: number;
  avgOrderValue: number;
  newUsersMonth: number;
  ordersToday: number;
}

interface ChartDay {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-indigo-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-red-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ordersChart, setOrdersChart] = useState<ChartDay[]>([]);
  const [maxChartOrders, setMaxChartOrders] = useState(1);
  const [statusBreakdown, setStatusBreakdown] = useState<
    { status: string; label: string; count: number }[]
  >([]);
  const [topProducts, setTopProducts] = useState<
    { name: string; sold: number }[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setOrdersChart(data.ordersChart || []);
        setMaxChartOrders(data.maxChartOrders || 1);
        setStatusBreakdown(data.statusBreakdown || []);
        setTopProducts(data.topProducts || []);
        setRecentOrders(data.recentOrders || []);
      });
  }, []);

  const cards = stats
    ? [
        {
          label: "درآمد کل",
          value: formatPrice(stats.revenue),
          sub: `میانگین سفارش: ${formatPrice(stats.avgOrderValue)}`,
          icon: DollarSign,
          gradient: "from-rose-500 to-pink-600",
        },
        {
          label: "سفارشات",
          value: stats.totalOrders,
          sub: `${stats.ordersToday} سفارش امروز`,
          icon: ShoppingCart,
          gradient: "from-emerald-500 to-teal-600",
        },
        {
          label: "کاربران",
          value: stats.totalUsers,
          sub: `${stats.newUsersMonth} کاربر جدید این ماه`,
          icon: Users,
          gradient: "from-violet-500 to-purple-600",
        },
        {
          label: "محصولات فعال",
          value: stats.activeProducts,
          sub: `${stats.totalProducts} کل محصولات`,
          icon: Package,
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          label: "در انتظار",
          value: stats.pendingOrders,
          sub: "نیاز به بررسی",
          icon: Clock,
          gradient: "from-amber-500 to-orange-600",
        },
      ]
    : [];

  const totalStatusOrders = statusBreakdown.reduce((s, i) => s + i.count, 0);

  return (
    <div className="space-y-8">
      <div className="scroll-reveal scroll-reveal-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">داشبورد تحلیلی</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            نمای کلی عملکرد فروشگاه شوکا 🕯️
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full text-sm">
          <TrendingUp className="w-4 h-4" />
          <Link href="/admin/analytics" className="hover:underline">
            آنالیز درآمد
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="scroll-reveal scroll-reveal-up relative overflow-hidden candle-card p-5 hover:shadow-lg transition-all duration-300 group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-l ${card.gradient}`}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">{card.label}</p>
                <p className="text-xl font-bold text-stone-900">{card.value}</p>
                <p className="text-[11px] text-stone-400 mt-1">{card.sub}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="scroll-reveal scroll-reveal-up lg:col-span-2 candle-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[var(--foreground)]">سفارشات ۷ روز اخیر</h2>
            <span className="text-xs text-stone-400">تعداد سفارش روزانه</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-44">
            {ordersChart.map((day, i) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-2 scroll-reveal scroll-reveal-scale"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {day.orders}
                </span>
                <div className="w-full flex items-end justify-center h-32">
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-700 ease-out hover:from-amber-700 hover:to-amber-500"
                    style={{
                      height: `${Math.max((day.orders / maxChartOrders) * 100, day.orders > 0 ? 8 : 2)}%`,
                    }}
                    title={formatPrice(day.revenue)}
                  />
                </div>
                <span className="text-[10px] text-stone-400 text-center leading-tight">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-reveal scroll-reveal-up candle-card p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">وضعیت سفارشات</h2>
          <div className="space-y-3">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${statusColors[item.status] || "bg-stone-400"}`}
                    style={{
                      width: `${totalStatusOrders ? (item.count / totalStatusOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {statusBreakdown.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-4">
                داده‌ای موجود نیست
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="scroll-reveal scroll-reveal-up candle-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-amber-600 animate-flame" />
            <h2 className="font-semibold text-[var(--foreground)]">پرفروش‌ترین محصولات</h2>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div
                key={product.name}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {product.sold} فروش
                  </p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-4">
                هنوز فروشی ثبت نشده
              </p>
            )}
          </div>
        </div>

        <div className="scroll-reveal scroll-reveal-up lg:col-span-2 candle-card overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">آخرین سفارشات</h2>
            <UserPlus className="w-4 h-4 text-stone-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-stone-100">
                  <th className="text-right p-4 font-medium">شماره</th>
                  <th className="text-right p-4 font-medium">مشتری</th>
                  <th className="text-right p-4 font-medium">مبلغ</th>
                  <th className="text-right p-4 font-medium">وضعیت</th>
                  <th className="text-right p-4 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className="border-b border-stone-50 hover:bg-stone-50/80 transition-colors scroll-reveal scroll-reveal-fade"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="p-4 font-medium">{order.orderNumber}</td>
                    <td className="p-4">
                      {order.user.name || order.user.email}
                    </td>
                    <td className="p-4">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400">
                      سفارشی ثبت نشده
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
