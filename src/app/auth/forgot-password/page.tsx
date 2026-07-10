"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
    } else {
      setError(data.error || "خطا در ارسال");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">فراموشی رمز عبور</h1>
          <p className="text-[var(--text-muted)] mt-2">
            لینک بازیابی به ایمیل شما ارسال می‌شود
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="theme-panel rounded-2xl border border-[var(--border)] p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}
          {message && (
            <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg">{message}</div>
          )}

          <Input
            label="ایمیل"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className="text-left"
          />

          <Button type="submit" loading={loading} className="w-full">
            ارسال لینک بازیابی
          </Button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            <Link href="/auth/login" className="text-[var(--primary)] hover:underline">
              بازگشت به ورود
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
