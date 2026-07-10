"use client";

import { useEffect, useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AccountPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, phone: profile.phone }),
    });

    if (res.ok) {
      setMessage("پروفایل با موفقیت بروزرسانی شد");
    } else {
      setMessage("خطا در بروزرسانی");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">حساب کاربری</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />

        <div className="flex-1">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl border border-stone-200 p-6 space-y-4"
          >
            {message && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  message.includes("موفقیت")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <Input
              label="نام و نام خانوادگی"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />

            <Input
              label="ایمیل"
              value={profile.email || ""}
              disabled
              dir="ltr"
              className="text-left opacity-60"
            />

            <Input
              label="شماره تماس"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              dir="ltr"
              className="text-left"
            />

            <Button type="submit" loading={loading}>
              ذخیره تغییرات
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
