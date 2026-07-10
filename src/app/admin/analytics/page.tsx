"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface RevenuePoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

interface Forecast {
  nextMonth: number;
  nextYear: number;
  confidence: "low" | "medium" | "high";
  method: string;
  dailyTrend: number;
}

type Tab = "daily" | "monthly" | "yearly";

const confidenceLabels = {
  low: "پایین",
  medium: "متوسط",
  high: "بالا",
};

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [dailyRevenue, setDailyRevenue] = useState<RevenuePoint[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenuePoint[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<RevenuePoint[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [stats, setStats] = useState<{
    revenueToday: number;
    revenueMonth: number;
    revenueYear: number;
    revenue: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setDailyRevenue(data.dailyRevenue || []);
        setMonthlyRevenue(data.monthlyRevenue || []);
        setYearlyRevenue(data.yearlyRevenue || []);
        setForecast(data.forecast || null);
        setStats(data.stats || null);
      });
  }, []);

  const activeData =
    tab === "daily"
      ? dailyRevenue
      : tab === "monthly"
        ? monthlyRevenue
        : yearlyRevenue;

  const maxRevenue = Math.max(...activeData.map((d) => d.revenue), 1);
  const totalActive = activeData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = activeData.reduce((s, d) => s + d.orders, 0);

  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: "daily", label: "روزانه (۳۰ روز)", icon: Calendar },
    { id: "monthly", label: "ماهانه (۱۲ ماه)", icon: BarChart3 },
    { id: "yearly", label: "سالانه", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="scroll-reveal scroll-reveal-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به داشبورد
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">آنالیز درآمد</h1>
          <p className="text-sm text-stone-500 mt-1">
            گزارش جامع فروش روزانه، ماهانه و سالانه
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "درآمد امروز", value: stats.revenueToday },
            { label: "درآمد این ماه", value: stats.revenueMonth },
            { label: "درآمد امسال", value: stats.revenueYear },
            { label: "درآمد کل", value: stats.revenue },
          ].map((item, i) => (
            <div
              key={item.label}
              className="scroll-reveal scroll-reveal-up candle-card p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-xs text-stone-500">{item.label}</p>
              <p className="text-xl font-bold text-stone-900 mt-1">
                {formatPrice(item.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="scroll-reveal scroll-reveal-up candle-card p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                tab === t.id
                  ? "bg-amber-100 text-amber-800 font-medium"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
          <div>
            <span className="text-stone-500">مجموع دوره: </span>
            <span className="font-bold text-stone-900">
              {formatPrice(totalActive)}
            </span>
          </div>
          <div>
            <span className="text-stone-500">تعداد سفارش: </span>
            <span className="font-medium">{totalOrders.toLocaleString("fa-IR")}</span>
          </div>
        </div>

        <div
          className={`flex items-end gap-1 sm:gap-2 h-52 overflow-x-auto pb-2 ${
            tab === "daily" ? "min-w-0" : ""
          }`}
        >
          {activeData.map((point) => (
            <div
              key={point.key}
              className="flex flex-col items-center gap-2 shrink-0"
              style={{ minWidth: tab === "daily" ? 28 : 48, flex: tab === "daily" ? "1 0 28px" : undefined }}
            >
              <span className="text-[10px] font-medium text-stone-600">
                {point.revenue > 0
                  ? `${Math.round(point.revenue / 1000).toLocaleString("fa-IR")}k`
                  : "۰"}
              </span>
              <div className="w-full flex items-end justify-center h-36">
                <div
                  className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                  style={{
                    height: `${Math.max((point.revenue / maxRevenue) * 100, point.revenue > 0 ? 6 : 2)}%`,
                  }}
                  title={`${formatPrice(point.revenue)} — ${point.orders} سفارش`}
                />
              </div>
              <span className="text-[9px] text-stone-400 text-center leading-tight max-w-[52px] truncate">
                {point.label}
              </span>
            </div>
          ))}
          {activeData.length === 0 && (
            <p className="text-sm text-stone-400 w-full text-center py-12">
              داده‌ای برای نمایش وجود ندارد
            </p>
          )}
        </div>
      </div>

      {forecast && (
        <div className="scroll-reveal scroll-reveal-up bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-6 candle-glow">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-stone-800">پیش‌بینی درآمد</h2>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
              اطمینان: {confidenceLabels[forecast.confidence]}
            </span>
          </div>
          <p className="text-xs text-stone-500 mb-4">{forecast.method}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 rounded-xl p-4 border border-violet-100">
              <p className="text-xs text-stone-500">پیش‌بینی ماه آینده</p>
              <p className="text-2xl font-bold text-violet-700 mt-1">
                {formatPrice(forecast.nextMonth)}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-violet-100">
              <p className="text-xs text-stone-500">پیش‌بینی سال آینده</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">
                {formatPrice(forecast.nextYear)}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-violet-100">
              <p className="text-xs text-stone-500">روند روزانه</p>
              <p className="text-2xl font-bold text-stone-800 mt-1">
                {forecast.dailyTrend >= 0 ? "+" : ""}
                {formatPrice(forecast.dailyTrend)}
                <span className="text-sm font-normal text-stone-500"> / روز</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-400 mt-4">
            پیش‌بینی بر اساس الگوی فروش، میانگین ماهانه و روند خطی ۳۰ روز اخیر
            محاسبه شده و با افزایش داده واقعی دقت آن بهبود می‌یابد.
          </p>
        </div>
      )}
    </div>
  );
}
