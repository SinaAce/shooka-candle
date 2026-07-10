"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";

interface CartContextValue {
  count: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  count: 0,
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated") {
      setCount(0);
      return;
    }

    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        setCount(0);
        return;
      }
      const cart = await res.json();
      const total = (cart.items ?? []).reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      );
      setCount(total);
    } catch {
      setCount(0);
    }
  }, [status]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ count, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
