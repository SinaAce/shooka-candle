"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export default function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { refreshCart } = useCart();

  async function handleAdd() {
    if (stock <= 0) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        setMessage(data.error || "خطا در افزودن به سبد");
        return;
      }

      setMessage("به سبد خرید اضافه شد ✓");
      await refreshCart();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAdd}
        loading={loading}
        disabled={stock <= 0}
        size="lg"
        className="w-full"
      >
        <ShoppingBag className="w-5 h-5" />
        {stock <= 0 ? "ناموجود" : "افزودن به سبد خرید"}
      </Button>
      {message && (
        <p className={`text-sm text-center ${message.includes("✓") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
