"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

interface ProductFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  scents: string[];
  currentParams: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    scent?: string;
    featured?: string;
    page?: string;
    limit?: string;
  };
}

export default function ProductFilters({
  categories,
  scents,
  currentParams,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(currentParams.search || "");
  const [minPrice, setMinPrice] = useState(currentParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || "");

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      const qs = params.toString();
      return `/products${qs ? `?${qs}` : ""}`;
    },
    [searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ search: search || undefined }));
  }

  function clearFilters() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  }

  const hasFilters =
    currentParams.category ||
    currentParams.search ||
    currentParams.sort ||
    currentParams.minPrice ||
    currentParams.maxPrice ||
    currentParams.scent ||
    currentParams.featured;

  const filterContent = (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="relative">
        <Input
          placeholder="جستجو با هر کلمه..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <button
          type="submit"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)]"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      <div>
        <h3 className="font-semibold text-[var(--foreground)] mb-3 text-sm">
          دسته‌بندی
        </h3>
        <ul className="space-y-1">
          <li>
            <a
              href={buildUrl({ category: undefined })}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentParams.category
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              همه محصولات
            </a>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <a
                href={buildUrl({ category: cat.slug })}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentParams.category === cat.slug
                    ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-[var(--foreground)] mb-3 text-sm">
          تعداد در صفحه
        </h3>
        <select
          value={currentParams.limit || "10"}
          onChange={(e) =>
            router.push(buildUrl({ limit: e.target.value === "10" ? undefined : e.target.value }))
          }
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString("fa-IR")} محصول
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-[var(--foreground)] mb-3 text-sm">
          مرتب‌سازی
        </h3>
        <select
          value={currentParams.sort || "newest"}
          onChange={(e) =>
            router.push(
              buildUrl({
                sort: e.target.value === "newest" ? undefined : e.target.value,
              })
            )
          }
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]"
        >
          <option value="newest">جدیدترین</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
          <option value="name">نام (الفبا)</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-[var(--foreground)] mb-3 text-sm">
          محدوده قیمت (تومان)
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="از"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            dir="ltr"
            className="text-left text-sm"
          />
          <Input
            placeholder="تا"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            dir="ltr"
            className="text-left text-sm"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-2"
          onClick={() =>
            router.push(
              buildUrl({
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
              })
            )
          }
        >
          اعمال قیمت
        </Button>
      </div>

      {scents.length > 0 && (
        <div>
          <h3 className="font-semibold text-[var(--foreground)] mb-3 text-sm">
            رایحه
          </h3>
          <select
            value={currentParams.scent || ""}
            onChange={(e) =>
              router.push(
                buildUrl({ scent: e.target.value || undefined })
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]"
          >
            <option value="">همه رایحه‌ها</option>
            {scents.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
        <input
          type="checkbox"
          checked={currentParams.featured === "true"}
          onChange={(e) =>
            router.push(
              buildUrl({
                featured: e.target.checked ? "true" : undefined,
              })
            )
          }
          className="rounded border-[var(--border)] text-[var(--primary)]"
        />
        فقط محصولات ویژه
      </label>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 w-full justify-center py-2"
        >
          <X className="w-4 h-4" />
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-secondary)] mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" />
        فیلترها
        {hasFilters && (
          <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        )}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[var(--surface)] p-5 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">فیلترها</h3>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      <aside className="hidden lg:block lg:w-64 shrink-0">
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sticky top-24">
          {filterContent}
        </div>
      </aside>
    </>
  );
}
