"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { Megaphone, Send } from "lucide-react";
import { useNotifications } from "@/components/notifications/NotificationProvider";

export default function AdminAnnouncementsPage() {
  const { refreshNotifications } = useNotifications();
  const [form, setForm] = useState({ title: "", message: "", link: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        message: form.message,
        link: form.link || null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult(`اطلاعیه برای ${data.count} کاربر ارسال شد`);
      setForm({ title: "", message: "", link: "" });
      await refreshNotifications();
    } else {
      setResult(data.error || "خطا در ارسال");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">ارسال اطلاعیه</h1>
        <p className="text-sm text-stone-500 mt-1">
          اطلاعیه برای همه کاربران ارسال می‌شود و در پنل کاربری نمایش داده
          می‌شود
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2 p-4 bg-violet-50 rounded-xl text-violet-800 text-sm">
          <Megaphone className="w-5 h-5 shrink-0" />
          <p>
            کاربران اطلاعیه را در بخش «اعلان‌ها» و زنگوله نوار بالا می‌بینند.
          </p>
        </div>

        {result && (
          <div
            className={`text-sm p-3 rounded-xl ${
              result.includes("ارسال شد")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {result}
          </div>
        )}

        <Input
          label="عنوان اطلاعیه"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder="مثلاً: تخفیف ویژه آخر هفته"
        />

        <Textarea
          label="متن اطلاعیه"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={5}
          placeholder="متن کامل اطلاعیه برای کاربران..."
        />

        <Input
          label="لینک (اختیاری)"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          placeholder="/products"
          dir="ltr"
        />

        <Button type="submit" loading={loading} size="lg">
          <Send className="w-4 h-4" />
          ارسال به همه کاربران
        </Button>
      </form>
    </div>
  );
}
