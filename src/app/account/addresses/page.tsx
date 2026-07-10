"use client";

import { useEffect, useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    fullName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then(setAddresses);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isDefault: addresses.length === 0 }),
    });

    if (res.ok) {
      const addr = await res.json();
      setAddresses([...addresses, addr]);
      setShowForm(false);
      setForm({
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

    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">آدرس‌ها</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "انصراف" : "+ آدرس جدید"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />

        <div className="flex-1 space-y-4">
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl border border-stone-200 p-6 space-y-3"
            >
              {error && (
                <div className="text-sm p-3 rounded-lg bg-red-50 text-red-600">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="عنوان"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <Input
                  label="نام گیرنده"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                label="شماره تماس"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="استان"
                  value={form.province}
                  onChange={(e) =>
                    setForm({ ...form, province: e.target.value })
                  }
                  required
                />
                <Input
                  label="شهر"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <Textarea
                label="آدرس"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                required
                rows={2}
              />
              <Input
                label="کد پستی"
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                required
              />
              <Button type="submit" size="sm" loading={saving} disabled={saving}>
                ذخیره
              </Button>
            </form>
          )}

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-xl border border-stone-200 p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-stone-800">{addr.title}</p>
                {addr.isDefault && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    پیش‌فرض
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600">
                {addr.fullName} — {addr.phone}
              </p>
              <p className="text-sm text-stone-500">
                {addr.province}، {addr.city} — {addr.address}
              </p>
            </div>
          ))}

          {addresses.length === 0 && !showForm && (
            <p className="text-stone-500 text-sm">آدرسی ثبت نشده</p>
          )}
        </div>
      </div>
    </div>
  );
}
