import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parsePagination, paginationMeta } from "@/lib/pagination";
import { buildOrderSearchWhere } from "@/lib/search";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const search = searchParams.get("search") || undefined;

    const searchWhere = buildOrderSearchWhere(search);
    const where = searchWhere ? { ...searchWhere } : {};

    const [orders, total, pendingCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { receiptStatus: "PENDING_REVIEW" } }),
    ]);

    return NextResponse.json({
      orders,
      pendingReceipts: pendingCount,
      pagination: paginationMeta(total, page, limit),
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت سفارشات" },
      { status: 500 }
    );
  }
}
