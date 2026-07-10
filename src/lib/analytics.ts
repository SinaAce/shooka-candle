export interface RevenuePoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface ForecastResult {
  nextMonth: number;
  nextYear: number;
  confidence: "low" | "medium" | "high";
  method: string;
  dailyTrend: number;
}

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getYearKey(date: Date) {
  return String(date.getFullYear());
}

export function aggregateDailyRevenue(
  orders: { createdAt: Date; total: number }[],
  days: number
): RevenuePoint[] {
  const result: RevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = getDayKey(d);
    const dayOrders = orders.filter((o) => getDayKey(o.createdAt) === key);
    result.push({
      key,
      label: d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    });
  }
  return result;
}

export function aggregateMonthlyRevenue(
  orders: { createdAt: Date; total: number }[],
  months: number
): RevenuePoint[] {
  const result: RevenuePoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = getMonthKey(d);
    const monthOrders = orders.filter((o) => getMonthKey(o.createdAt) === key);
    result.push({
      key,
      label: d.toLocaleDateString("fa-IR", { year: "numeric", month: "long" }),
      revenue: monthOrders.reduce((s, o) => s + o.total, 0),
      orders: monthOrders.length,
    });
  }
  return result;
}

export function aggregateYearlyRevenue(
  orders: { createdAt: Date; total: number }[]
): RevenuePoint[] {
  const years = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const key = getYearKey(order.createdAt);
    const existing = years.get(key) || { revenue: 0, orders: 0 };
    existing.revenue += order.total;
    existing.orders += 1;
    years.set(key, existing);
  }
  return Array.from(years.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      key,
      label: key,
      revenue: data.revenue,
      orders: data.orders,
    }));
}

function linearRegression(values: number[]) {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function forecastRevenue(
  dailyData: RevenuePoint[],
  monthlyData: RevenuePoint[]
): ForecastResult {
  const dailyRevenues = dailyData.map((d) => d.revenue);
  const { slope, intercept } = linearRegression(dailyRevenues);

  const daysInMonth = 30;
  let nextMonth = 0;
  const startIndex = dailyRevenues.length;
  for (let i = 0; i < daysInMonth; i++) {
    const predicted = Math.max(0, intercept + slope * (startIndex + i));
    nextMonth += predicted;
  }

  const monthlyRevenues = monthlyData.map((m) => m.revenue);
  const monthlyAvg =
    monthlyRevenues.length > 0
      ? monthlyRevenues.reduce((s, v) => s + v, 0) / monthlyRevenues.length
      : 0;

  const recentMonthAvg =
    monthlyRevenues.length >= 3
      ? monthlyRevenues.slice(-3).reduce((s, v) => s + v, 0) / 3
      : monthlyAvg;

  const trendAdjustedYear = Math.max(0, recentMonthAvg * 12 + slope * 365);
  const linearYear = Math.max(0, nextMonth * 12);
  const nextYear = Math.round((trendAdjustedYear + linearYear) / 2);

  const dataPoints = dailyRevenues.filter((v) => v > 0).length;
  const confidence: ForecastResult["confidence"] =
    dataPoints >= 14 ? "high" : dataPoints >= 7 ? "medium" : "low";

  return {
    nextMonth: Math.round(nextMonth),
    nextYear,
    confidence,
    method: "رگرسیون خطی بر اساس درآمد روزانه + میانگین ماهانه",
    dailyTrend: Math.round(slope),
  };
}

export function sumRevenue(data: RevenuePoint[]) {
  return data.reduce((s, d) => s + d.revenue, 0);
}
