"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
    images: { url: string }[];
  };
}

interface Cart {
  items: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  async function fetchCart() {
    const res = await fetch("/api/cart");
    if (res.ok) {
      setCart(await res.json());
      await refreshCart();
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function updateQuantity(itemId: string, quantity: number) {
    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (res.ok) {
      setCart(await res.json());
      await refreshCart();
    }
  }

  async function removeItem(itemId: string) {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) {
      setCart(await res.json());
      await refreshCart();
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-[var(--text-muted)]">
        در حال بارگذاری...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[var(--text-secondary)] mb-2">سبد خرید خالی است</h1>
        <p className="text-[var(--text-muted)] mb-6">محصولات مورد علاقه خود را اضافه کنید</p>
        <Link href="/products">
          <Button>مشاهده محصولات</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 500000 ? 0 : 45000;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">سبد خرید</h1>

      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="theme-panel p-4 flex gap-4"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--surface-alt)] shrink-0">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🕯️
                </div>
              )}
            </div>

            <div className="flex-1">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-medium text-[var(--text-secondary)] hover:text-amber-700"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {formatPrice(item.product.price)}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)] disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-[var(--foreground)]">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="theme-panel p-6">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">جمع کل</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">هزینه ارسال</span>
            <span>{shipping === 0 ? "رایگان" : formatPrice(shipping)}</span>
          </div>
          {subtotal < 500000 && (
            <p className="text-xs text-amber-600">
              خرید بالای ۵۰۰,۰۰۰ تومان — ارسال رایگان
            </p>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-stone-100">
            <span>مبلغ قابل پرداخت</span>
            <span>{formatPrice(subtotal + shipping)}</span>
          </div>
        </div>

        <Link href="/checkout">
          <Button className="w-full" size="lg">
            ادامه و ثبت سفارش
          </Button>
        </Link>
      </div>
    </div>
  );
}
