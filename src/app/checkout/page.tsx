"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  Wallet,
  MapPin,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    images: { url: string }[];
  };
}

type PaymentMethod = "cod" | "online" | "card";

interface SiteSettings {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  shebaNumber?: string | null;
  codEnabled: boolean;
  onlineEnabled: boolean;
  cardTransferEnabled: boolean;
  shippingCost: number;
  freeShippingMin: number;
  globalDiscountPercent: number;
  globalDiscountActive: boolean;
}

const allPaymentMethods: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
  settingKey: keyof Pick<
    SiteSettings,
    "codEnabled" | "onlineEnabled" | "cardTransferEnabled"
  >;
}[] = [
  {
    id: "cod",
    label: "پرداخت در محل",
    desc: "پرداخت نقدی هنگام تحویل سفارش",
    icon: Banknote,
    settingKey: "codEnabled",
  },
  {
    id: "online",
    label: "پرداخت آنلاین",
    desc: "درگاه پرداخت امن (زرین‌پال)",
    icon: Wallet,
    settingKey: "onlineEnabled",
  },
  {
    id: "card",
    label: "کارت به کارت",
    desc: "واریز به شماره کارت و ارسال تصویر یا متن رسید",
    icon: CreditCard,
    settingKey: "cardTransferEnabled",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [newAddress, setNewAddress] = useState({
    title: "",
    fullName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/addresses").then(async (r) => {
        if (!r.ok) return [];
        return r.json();
      }),
      fetch("/api/cart").then(async (r) => {
        if (!r.ok) return { items: [] };
        return r.json();
      }),
      fetch("/api/settings").then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      }),
    ])
      .then(([addrs, cartData, settingsData]) => {
        if (Array.isArray(addrs)) {
          setAddresses(addrs);
          const defaultAddr = addrs.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddress(defaultAddr.id);
          else if (addrs.length > 0) setSelectedAddress(addrs[0].id);
        }
        if (cartData?.items) setCart(cartData);
        if (settingsData) {
          setSettings(settingsData);
          const enabled = allPaymentMethods.filter(
            (m) => settingsData[m.settingKey]
          );
          if (enabled.length > 0 && !enabled.find((m) => m.id === paymentMethod)) {
            setPaymentMethod(enabled[0].id);
          }
        }
      })
      .catch(() => setError("خطا در بارگذاری اطلاعات"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 }),
    });

    if (res.ok) {
      const addr = await res.json();
      setAddresses([...addresses, addr]);
      setSelectedAddress(addr.id);
      setShowNewAddress(false);
      setNewAddress({
        title: "",
        fullName: "",
        phone: "",
        province: "",
        city: "",
        address: "",
        postalCode: "",
      });
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "خطا در ذخیره آدرس");
    }
  }

  async function handleCheckout() {
    if (!selectedAddress) {
      setError("لطفاً آدرس تحویل را انتخاب کنید");
      return;
    }
    if (!cart?.items?.length) {
      setError("سبد خرید شما خالی است");
      return;
    }

    setSubmitting(true);
    setError("");

    const orderNotes = notes || undefined;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddress,
        notes: orderNotes,
        paymentMethod,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "خطا در ثبت سفارش");
      setSubmitting(false);
      return;
    }

    if (paymentMethod === "online") {
      router.push(`/checkout/payment?orderId=${data.id}`);
      return;
    }

    if (paymentMethod === "card") {
      router.push(`/account/orders/${data.id}?success=true&uploadReceipt=true`);
      return;
    }

    router.push(`/account/orders/${data.id}?success=true`);
  }

  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) || 0;

  const discount =
    settings?.globalDiscountActive && settings.globalDiscountPercent
      ? Math.round((subtotal * settings.globalDiscountPercent) / 100)
      : 0;
  const afterDiscount = subtotal - discount;
  const shipping =
    settings && afterDiscount >= settings.freeShippingMin
      ? 0
      : settings?.shippingCost ?? 45000;
  const total = afterDiscount + shipping;

  const paymentMethods = settings
    ? allPaymentMethods.filter((m) => settings[m.settingKey])
    : allPaymentMethods;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-[var(--text-muted)]">
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
          سبد خرید خالی است
        </h1>
        <p className="text-[var(--text-muted)] mb-6">
          ابتدا محصولات مورد نظر را به سبد خرید اضافه کنید
        </p>
        <Button onClick={() => router.push("/products")}>
          مشاهده محصولات
        </Button>
      </div>
    );
  }

  const steps = [
    { id: "address", label: "آدرس", icon: MapPin },
    { id: "payment", label: "پرداخت", icon: CreditCard },
    { id: "confirm", label: "تأیید", icon: CheckCircle },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-6">
        تکمیل سفارش
      </h1>

      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                step === s.id
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className="w-6 sm:w-12 h-px bg-[var(--border)]" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === "address" && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--foreground)]">
                  آدرس تحویل
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewAddress(!showNewAddress)}
                >
                  {showNewAddress ? "انصراف" : "+ آدرس جدید"}
                </Button>
              </div>

              {showNewAddress ? (
                <form onSubmit={handleAddAddress} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="عنوان"
                      value={newAddress.title}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, title: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="نام گیرنده"
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Input
                    label="شماره تماس"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="استان"
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          province: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="شهر"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Textarea
                    label="آدرس کامل"
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        address: e.target.value,
                      })
                    }
                    required
                    rows={2}
                  />
                  <Input
                    label="کد پستی"
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        postalCode: e.target.value,
                      })
                    }
                    required
                  />
                  <Button type="submit" size="sm">
                    ذخیره آدرس
                  </Button>
                </form>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedAddress === addr.id
                          ? "border-[var(--primary)] bg-[var(--primary-light)]"
                          : "border-[var(--border)] hover:border-[var(--text-muted)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="sr-only"
                      />
                      <p className="font-medium text-[var(--foreground)]">
                        {addr.title}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {addr.fullName} — {addr.phone}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {addr.province}، {addr.city} — {addr.address}
                      </p>
                    </label>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-[var(--text-muted)] text-sm">
                      آدرسی ثبت نشده. آدرس جدید اضافه کنید.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (!selectedAddress) {
                      setError("لطفاً آدرس تحویل را انتخاب کنید");
                      return;
                    }
                    setError("");
                    setStep("payment");
                  }}
                >
                  ادامه به پرداخت
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
              <h2 className="font-semibold text-[var(--foreground)] mb-4">
                روش پرداخت
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? "border-[var(--primary)] bg-[var(--primary-light)]"
                          : "border-[var(--border)] hover:border-[var(--text-muted)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-1"
                      />
                      <Icon className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {method.label}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {method.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {paymentMethod === "card" && settings && (
                <div className="mt-4 p-4 bg-[var(--surface-alt)] rounded-lg text-sm animate-fade-in-up">
                  <p className="font-medium text-[var(--foreground)] mb-2">
                    اطلاعات کارت ({settings.bankName})
                  </p>
                  <p className="text-[var(--text-secondary)] font-mono" dir="ltr">
                    {settings.cardNumber}
                  </p>
                  <p className="text-[var(--text-muted)] mt-1">
                    به نام: {settings.cardHolder}
                  </p>
                  {settings.shebaNumber && (
                    <p className="text-[var(--text-muted)] mt-1" dir="ltr">
                      شبا: {settings.shebaNumber}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep("address")}>
                  بازگشت
                </Button>
                <Button onClick={() => setStep("confirm")}>
                  ادامه
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6 space-y-4">
              <h2 className="font-semibold text-[var(--foreground)]">
                تأیید نهایی سفارش
              </h2>

              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <span className="text-[var(--text-secondary)]">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Textarea
                label="یادداشت سفارش (اختیاری)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="توضیحات اضافی برای سفارش..."
              />

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep("payment")}>
                  بازگشت
                </Button>
                <Button onClick={handleCheckout} loading={submitting} size="lg">
                  ثبت سفارش
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-semibold text-[var(--foreground)] mb-4">
              خلاصه سفارش
            </h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">جمع کل</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>تخفیف ({settings?.globalDiscountPercent}%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">ارسال</span>
                <span>
                  {shipping === 0 ? "رایگان" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
                <span>مجموع</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            {settings && afterDiscount < settings.freeShippingMin && (
              <p className="text-xs text-[var(--text-muted)] mb-3">
                ارسال رایگان برای خرید بالای{" "}
                {settings.freeShippingMin.toLocaleString("fa-IR")} تومان
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
