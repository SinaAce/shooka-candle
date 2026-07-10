import { Suspense } from "react";
import EditProductContent from "./EditProductContent";

export default function EditProductPage() {
  return (
    <Suspense fallback={<p className="text-stone-500">در حال بارگذاری...</p>}>
      <EditProductContent />
    </Suspense>
  );
}
