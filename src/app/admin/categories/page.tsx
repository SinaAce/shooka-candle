"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { Pencil, Trash2, X, Check } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(categories.length / DEFAULT_PAGE_SIZE));
  const pagedCategories = categories.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }

  function resetForm() {
    setForm({ name: "", description: "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "" });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isEdit = Boolean(editingId);
    const res = await fetch(
      isEdit ? `/api/categories/${editingId}` : "/api/categories",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      resetForm();
      fetchCategories();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "خطا در ذخیره");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا از حذف این دسته‌بندی مطمئنید؟")) return;

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "خطا در حذف");
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">دسته‌بندی‌ها</h1>
        <Button
          size="sm"
          onClick={() => {
            if (showForm && !editingId) resetForm();
            else {
              setEditingId(null);
              setForm({ name: "", description: "" });
              setShowForm(!showForm);
            }
          }}
        >
          {showForm && !editingId ? "انصراف" : "+ دسته جدید"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 mb-6 max-w-md animate-scale-in"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-800">
              {editingId ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {error && (
            <div className="text-sm p-3 rounded-lg bg-red-50 text-red-600">
              {error}
            </div>
          )}
          <Input
            label="نام دسته‌بندی"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="توضیحات"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={2}
          />
          <Button type="submit" loading={loading} size="sm">
            {editingId ? (
              <>
                <Check className="w-4 h-4" />
                ذخیره تغییرات
              </>
            ) : (
              "ایجاد"
            )}
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pagedCategories.map((cat, i) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-800">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <p className="text-xs text-stone-400 mt-2">
                  {cat._count.products} محصول
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  aria-label="ویرایش"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={categories.length}
        onPageChange={setPage}
      />
    </div>
  );
}
