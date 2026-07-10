"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import Pagination from "@/components/ui/Pagination";
import { formatPrice } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  images: { url: string }[];
  category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(DEFAULT_PAGE_SIZE),
    });
    if (search) qs.set("search", search);

    const res = await fetch(`/api/admin/products/list?${qs}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت محصولات</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <AdminSearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            placeholder="جستجو در محصولات..."
          />
          <Link href="/admin/products/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              محصول جدید
            </Button>
          </Link>
        </div>
      </div>

      <div className="candle-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--surface-alt)]">
                <th className="text-right p-4 font-medium">محصول</th>
                <th className="text-right p-4 font-medium">دسته</th>
                <th className="text-right p-4 font-medium">قیمت</th>
                <th className="text-right p-4 font-medium">موجودی</th>
                <th className="text-right p-4 font-medium">وضعیت</th>
                <th className="text-right p-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    محصولی یافت نشد
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[var(--border)]/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-alt)]">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full">
                              🕯️
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-muted)]">{product.category.name}</td>
                    <td className="p-4">{formatPrice(product.price)}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="p-1.5 text-[var(--text-muted)] hover:text-amber-700">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
