"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [showCreated, setShowCreated] = useState(false);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setShowCreated(true);
    }
  }, [searchParams]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">ویرایش محصول</h1>
        <p className="text-sm text-stone-500 mt-1">
          اطلاعات و تصاویر محصول را مدیریت کنید
        </p>
      </div>

      {showCreated && (
        <div className="mb-4 bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl border border-emerald-200 animate-fade-in-up">
          محصول ایجاد شد! حالا تصاویر شمع را آپلود کنید.
        </div>
      )}

      <ProductForm mode="edit" productId={params.id as string} />
    </div>
  );
}
