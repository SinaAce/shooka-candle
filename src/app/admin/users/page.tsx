"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">کاربران</h1>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-stone-500 border-b border-stone-100 bg-stone-50">
              <th className="text-right p-4 font-medium">نام</th>
              <th className="text-right p-4 font-medium">ایمیل</th>
              <th className="text-right p-4 font-medium">تلفن</th>
              <th className="text-right p-4 font-medium">نقش</th>
              <th className="text-right p-4 font-medium">سفارشات</th>
              <th className="text-right p-4 font-medium">تاریخ عضویت</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-stone-50">
                <td className="p-4 font-medium">{user.name || "—"}</td>
                <td className="p-4" dir="ltr">{user.email}</td>
                <td className="p-4">{user.phone || "—"}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {user.role === "ADMIN" ? "مدیر" : "کاربر"}
                  </span>
                </td>
                <td className="p-4">{user._count.orders}</td>
                <td className="p-4 text-stone-500">
                  {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
