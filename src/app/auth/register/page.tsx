"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در ثبت‌نام");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setSuccess("ثبت‌نام موفق بود! لطفاً وارد شوید.");
        setLoading(false);
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">ثبت‌نام</h1>
          <p className="text-[var(--text-muted)] mt-2">حساب کاربری جدید بسازید</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
              {success}
            </div>
          )}

          <Input
            label="نام و نام خانوادگی"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

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
            label="شماره تماس"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            dir="ltr"
            className="text-left"
          />

          <Input
            label="رمز عبور"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            dir="ltr"
            className="text-left"
          />

          <Input
            label="تکرار رمز عبور"
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
            minLength={6}
            dir="ltr"
            className="text-left"
          />

          <Button type="submit" loading={loading} className="w-full">
            ثبت‌نام
          </Button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link
              href="/auth/login"
              className="text-[var(--primary)] hover:underline"
            >
              ورود
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
