import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-16 text-center text-[var(--text-muted)]">
          در حال بارگذاری...
        </div>
      }
    >
      <PaymentClient />
    </Suspense>
  );
}
