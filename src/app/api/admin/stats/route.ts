import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import {
  aggregateDailyRevenue,
  aggregateMonthlyRevenue,
  aggregateYearlyRevenue,
  forecastRevenue,
  sumRevenue,
} from "@/lib/analytics";

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getLast7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }
  return days;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const yearStart = new Date();
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);

    const analyticsStart = new Date();
    analyticsStart.setFullYear(analyticsStart.getFullYear() - 2);
    analyticsStart.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const revenueFilter = { status: { not: "CANCELLED" as const } };

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      pendingReceipts,
      recentOrders,
      revenue,
      weekOrders,
      ordersByStatus,
      topProductItems,
      newUsersMonth,
      ordersToday,
      activeProducts,
      analyticsOrders,
      monthOrders,
      yearOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { receiptStatus: "PENDING_REVIEW" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.order.aggregate({
        where: revenueFilter,
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, ...revenueFilter },
        select: { createdAt: true, total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.user.count({
        where: { role: "USER", createdAt: { gte: monthStart } },
      }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        where: { createdAt: { gte: analyticsStart }, ...revenueFilter },
        select: { createdAt: true, total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: monthStart }, ...revenueFilter },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: yearStart }, ...revenueFilter },
        select: { total: true },
      }),
    ]);

    const dayLabels = getLast7Days();
    const ordersChart = dayLabels.map((day) => {
      const dayOrders = weekOrders.filter((o) => getDayKey(o.createdAt) === day);
      return {
        date: day,
        label: new Date(day).toLocaleDateString("fa-IR", {
          weekday: "short",
          day: "numeric",
        }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      };
    });

    const maxChartOrders = Math.max(...ordersChart.map((d) => d.orders), 1);

    const dailyRevenue = aggregateDailyRevenue(analyticsOrders, 30);
    const monthlyRevenue = aggregateMonthlyRevenue(analyticsOrders, 12);
    const yearlyRevenue = aggregateYearlyRevenue(analyticsOrders);
    const forecast = forecastRevenue(dailyRevenue, monthlyRevenue);

    const statusBreakdown = ordersByStatus.map((item) => ({
      status: item.status,
      label: ORDER_STATUS_LABELS[item.status] || item.status,
      count: item._count,
    }));

    const topProducts = topProductItems.map((item) => ({
      name: item.name,
      sold: item._sum.quantity || 0,
    }));

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalUsers,
        pendingOrders,
        pendingReceipts,
        revenue: revenue._sum.total || 0,
        revenueToday: sumRevenue(
          aggregateDailyRevenue(analyticsOrders, 1).slice(-1)
        ),
        revenueMonth: monthOrders.reduce((s, o) => s + o.total, 0),
        revenueYear: yearOrders.reduce((s, o) => s + o.total, 0),
        avgOrderValue: Math.round(revenue._avg.total || 0),
        newUsersMonth,
        ordersToday,
      },
      ordersChart,
      maxChartOrders,
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      forecast,
      statusBreakdown,
      topProducts,
      recentOrders,
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت آمار" },
      { status: 500 }
    );
  }
}
