"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("رمز عبور و تکرار آن یکسان نیست");
      return;
    }

    if (!token || !email) {
      setError("لینک نامعتبر است");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/auth/login?reset=1");
    } else {
      setError(data.error || "خطا");
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="text-center text-red-600 text-sm p-4">
        لینک بازیابی نامعتبر است.{" "}
        <Link href="/auth/forgot-password" className="underline">
          درخواست مجدد
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="theme-panel rounded-2xl border border-[var(--border)] p-6 space-y-4"
    >
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      <Input label="ایمیل" type="email" value={email} disabled dir="ltr" className="text-left" />

      <Input
        label="رمز عبور جدید"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        dir="ltr"
        className="text-left"
      />

      <Input
        label="تکرار رمز عبور"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={6}
        dir="ltr"
        className="text-left"
      />

      <Button type="submit" loading={loading} className="w-full">
        ذخیره رمز جدید
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">تنظیم رمز جدید</h1>
        </div>
        <Suspense fallback={<p className="text-center text-[var(--text-muted)]">...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
