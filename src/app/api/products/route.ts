import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildProductSearchWhere } from "@/lib/search";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Record<string, unknown> = { active: true };

    if (category) {
      where.category = { slug: category };
    }
    if (featured === "true") {
      where.featured = true;
    }
    const searchWhere = buildProductSearchWhere(search);
    if (searchWhere) Object.assign(where, searchWhere);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}
