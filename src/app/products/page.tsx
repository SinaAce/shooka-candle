import { Suspense } from "react";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { ServerPagination } from "@/components/ui/Pagination";
import prisma from "@/lib/prisma";
import { buildProductSearchWhere } from "@/lib/search";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    scent?: string;
    featured?: string;
    page?: string;
    limit?: string;
  }>;
}

function buildQueryString(
  params: Record<string, string | undefined>,
  page: number
) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") qs.set(key, value);
  });
  if (page > 1) qs.set("page", String(page));
  const str = qs.toString();
  return str ? `?${str}` : "";
}

function getOrderBy(sort?: string) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "name":
      return { name: "asc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const rawLimit = parseInt(params.limit || String(DEFAULT_PAGE_SIZE), 10);
  const limit = PAGE_SIZE_OPTIONS.includes(rawLimit as (typeof PAGE_SIZE_OPTIONS)[number])
    ? rawLimit
    : DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { active: true };

  if (params.category) {
    where.category = { slug: params.category };
  }
  const searchWhere = buildProductSearchWhere(params.search);
  if (searchWhere) {
    Object.assign(where, searchWhere);
  }
  if (params.scent) {
    where.scent = { contains: params.scent };
  }
  if (params.featured === "true") {
    where.featured = true;
  }
  if (params.minPrice || params.maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (params.minPrice) priceFilter.gte = parseInt(params.minPrice);
    if (params.maxPrice) priceFilter.lte = parseInt(params.maxPrice);
    where.price = priceFilter;
  }

  let products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    scent: string | null;
    images: { url: string; alt?: string | null }[];
    category: { name: string } | null;
  }[] = [];
  let categories: { id: string; name: string; slug: string }[] = [];
  let scents: string[] = [];
  let total = 0;

  try {
    const scentResults = await prisma.product.findMany({
      where: { active: true, scent: { not: null } },
      select: { scent: true },
      distinct: ["scent"],
    });
    scents = scentResults
      .map((p) => p.scent)
      .filter((s): s is string => !!s);

    [products, categories, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { name: true } },
        },
        orderBy: getOrderBy(params.sort),
        skip,
        take: limit,
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.count({ where }),
    ]);
  } catch {
    // Database not connected yet
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
          محصولات
        </h1>
        <p className="text-[var(--text-muted)] text-sm sm:text-base">
          مجموعه شمع‌های دست‌ساز و تزئینی شوکا
          {total > 0 && (
            <span className="mr-2"> — {total} محصول</span>
          )}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <Suspense fallback={<div className="lg:w-64 h-96 bg-[var(--surface)] rounded-xl animate-pulse" />}>
          <ProductFilters
            categories={categories}
            scents={scents}
            currentParams={params}
          />
        </Suspense>

        <div className="flex-1 min-w-0">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <ServerPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  buildHref={(p) =>
                    `/products${buildQueryString({ ...params, limit: String(limit) }, p)}`
                  }
                />
              )}
            </>
          ) : (
            <div className="text-center py-16 sm:py-20 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <span className="text-5xl mb-4 block">🕯️</span>
              <p className="text-[var(--text-muted)]">محصولی یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
