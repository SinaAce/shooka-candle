"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("ایمیل یا رمز عبور اشتباه است");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900">ورود به حساب</h1>
          <p className="text-stone-500 mt-2">به فروشگاه شوکا خوش آمدید</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="ایمیل"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            dir="ltr"
            className="text-left"
          />

          <Input
            label="رمز عبور"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            dir="ltr"
            className="text-left"
          />

          <Button type="submit" loading={loading} className="w-full">
            ورود
          </Button>

          <p className="text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-[var(--primary)] hover:underline"
            >
              فراموشی رمز عبور
            </Link>
          </p>

          <p className="text-center text-sm text-stone-500">
            حساب کاربری ندارید؟{" "}
            <Link href="/auth/register" className="text-amber-700 hover:underline">
              ثبت‌نام
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
