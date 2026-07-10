"use client";

import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">افزودن شمع جدید</h1>
        <p className="text-sm text-stone-500 mt-1">
          اطلاعات شمع را وارد کنید و تصاویر را آپلود کنید
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
