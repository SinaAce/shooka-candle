"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { Upload, X, ImageIcon, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
}

interface ProductFormProps {
  productId?: string;
  mode: "create" | "edit";
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "",
  categoryId: "",
  scent: "",
  burnTime: "",
  weight: "",
  featured: false,
  active: true,
};

export default function ProductForm({ productId, mode }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (mode === "edit" && productId) {
      fetch(`/api/products/${productId}`)
        .then((r) => r.json())
        .then((product) => {
          if (product.error) return;
          setForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            comparePrice: product.comparePrice?.toString() || "",
            stock: product.stock.toString(),
            categoryId: product.categoryId,
            scent: product.scent || "",
            burnTime: product.burnTime || "",
            weight: product.weight || "",
            featured: product.featured,
            active: product.active,
          });
          setImages(product.images || []);
        });
    }
  }, [mode, productId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    if (mode === "create" && !productId) {
      setError("ابتدا محصول را ذخیره کنید، سپس تصویر آپلود کنید");
      return;
    }

    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId!);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const image = await res.json();
        setImages((prev) => [...prev, image]);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "خطا در آپلود");
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      description: form.description,
      price: parseInt(form.price),
      comparePrice: form.comparePrice ? parseInt(form.comparePrice) : null,
      stock: parseInt(form.stock),
      categoryId: form.categoryId,
      scent: form.scent || null,
      burnTime: form.burnTime || null,
      weight: form.weight || null,
      featured: form.featured,
      active: form.active,
    };

    const res =
      mode === "create"
        ? await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "خطا در ذخیره");
      setLoading(false);
      return;
    }

    if (mode === "create") {
      router.push(`/admin/products/${data.id}/edit?created=1`);
      return;
    }

    setSuccess("محصول با موفقیت ذخیره شد");
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <form
        onSubmit={handleSubmit}
        className="xl:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-lg font-bold text-stone-900">
            {mode === "create" ? "اطلاعات شمع جدید" : "ویرایش اطلاعات شمع"}
          </h2>
          <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
            {mode === "create" ? "مرحله ۱ از ۲" : "ویرایش"}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl">
            {success}
          </div>
        )}

        <Input
          label="نام محصول"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="مثلاً: شمع لاوندر آرامش‌بخش"
        />

        <Textarea
          label="توضیحات"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          rows={4}
          placeholder="توضیح کامل درباره شمع، رایحه و کاربرد..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="قیمت (تومان)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            dir="ltr"
          />
          <Input
            label="قیمت قبل از تخفیف"
            type="number"
            value={form.comparePrice}
            onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
            dir="ltr"
            placeholder="اختیاری"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="موجودی"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            dir="ltr"
          />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              دسته‌بندی
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="رایحه"
            value={form.scent}
            onChange={(e) => setForm({ ...form, scent: e.target.value })}
          />
          <Input
            label="زمان سوخت"
            value={form.burnTime}
            onChange={(e) => setForm({ ...form, burnTime: e.target.value })}
          />
          <Input
            label="وزن"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-6 p-4 bg-stone-50 rounded-xl">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded border-stone-300 text-amber-600"
            />
            محصول ویژه (صفحه اصلی)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded border-stone-300 text-amber-600"
            />
            فعال در فروشگاه
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} size="lg">
            <Save className="w-4 h-4" />
            {mode === "create" ? "ایجاد و ادامه برای آپلود" : "ذخیره تغییرات"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/products")}
          >
            <X className="w-4 h-4" />
            انصراف
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-stone-900">تصاویر محصول</h3>
          </div>

          {mode === "create" && !productId ? (
            <p className="text-sm text-stone-500 bg-amber-50 p-4 rounded-xl">
              پس از ایجاد محصول، به صفحه ویرایش منتقل می‌شوید و می‌توانید تصاویر
              را آپلود کنید.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group"
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-2 aspect-video rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-400 text-sm">
                    هنوز تصویری آپلود نشده
                  </div>
                )}
              </div>

              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all">
                <Upload className="w-8 h-8 text-stone-400" />
                <span className="text-sm text-stone-600">
                  {uploading ? "در حال آپلود..." : "کلیک یا کشیدن تصویر"}
                </span>
                <span className="text-xs text-stone-400">JPG, PNG — حداکثر چند تصویر</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 text-sm text-amber-900">
          <p className="font-medium mb-2">راهنمای سریع</p>
          <ul className="space-y-1 text-xs text-amber-800/80 list-disc list-inside">
            <li>قیمت قبل از تخفیف برای نمایش تخفیف است</li>
            <li>محصولات ویژه در صفحه اصلی نمایش داده می‌شوند</li>
            <li>تصاویر با کیفیت بالا فروش را بیشتر می‌کنند</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
