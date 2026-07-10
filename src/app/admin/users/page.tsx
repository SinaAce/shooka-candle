"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  ShieldOff,
  Trash2,
  Ban,
  PhoneOff,
  UserX,
  UserCheck,
} from "lucide-react";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  banned: boolean;
  createdAt: string;
  _count: { orders: number };
}

interface BannedPhone {
  id: string;
  phone: string;
  reason: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [bannedPhones, setBannedPhones] = useState<BannedPhone[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [banPhone, setBanPhone] = useState("");
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(DEFAULT_PAGE_SIZE),
    });
    if (search) qs.set("search", search);

    const res = await fetch(`/api/admin/users?${qs}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, search]);

  const fetchBannedPhones = useCallback(async () => {
    const res = await fetch("/api/admin/banned-phones");
    const data = await res.json();
    setBannedPhones(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchBannedPhones();
  }, [fetchBannedPhones]);

  function handleSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function updateUser(id: string, data: { role?: "USER" | "ADMIN"; banned?: boolean }) {
    setActionLoading(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error || "خطا");
    }
    setActionLoading(null);
  }

  async function deleteUser(id: string, name: string | null) {
    if (!confirm(`حذف کاربر «${name || "بدون نام"}»؟ این عمل غیرقابل بازگشت است.`)) return;
    setActionLoading(`del-${id}`);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else {
      const err = await res.json().catch(() => null);
      alert(err?.error || "خطا در حذف");
    }
    setActionLoading(null);
  }

  async function handleBanPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!banPhone.trim()) return;
    setActionLoading("ban-phone");
    const res = await fetch("/api/admin/banned-phones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: banPhone,
        reason: banReason || undefined,
        banUser: true,
      }),
    });
    if (res.ok) {
      setBanPhone("");
      setBanReason("");
      fetchBannedPhones();
      fetchUsers();
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error || "خطا");
    }
    setActionLoading(null);
  }

  async function unbanPhone(phone: string) {
    if (!confirm(`رفع مسدودیت شماره ${phone}؟`)) return;
    await fetch(`/api/admin/banned-phones?phone=${encodeURIComponent(phone)}`, {
      method: "DELETE",
    });
    fetchBannedPhones();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">کاربران</h1>
        <AdminSearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="جستجو: نام، ایمیل، تلفن، نقش..."
        />
      </div>

      <div className="candle-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--surface-alt)]">
                <th className="text-right p-4 font-medium">نام</th>
                <th className="text-right p-4 font-medium">ایمیل</th>
                <th className="text-right p-4 font-medium">تلفن</th>
                <th className="text-right p-4 font-medium">نقش</th>
                <th className="text-right p-4 font-medium">وضعیت</th>
                <th className="text-right p-4 font-medium">سفارشات</th>
                <th className="text-right p-4 font-medium">عضویت</th>
                <th className="text-right p-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
                    کاربری یافت نشد
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border)]/50">
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
                    <td className="p-4">
                      {user.banned ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                          مسدود
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          فعال
                        </span>
                      )}
                    </td>
                    <td className="p-4">{user._count.orders}</td>
                    <td className="p-4 text-[var(--text-muted)]">
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          title={user.role === "ADMIN" ? "تنزل به کاربر" : "ارتقا به مدیر"}
                          disabled={actionLoading === user.id}
                          onClick={() =>
                            updateUser(user.id, {
                              role: user.role === "ADMIN" ? "USER" : "ADMIN",
                            })
                          }
                          className="p-1.5 text-[var(--text-muted)] hover:text-amber-700 rounded-lg hover:bg-amber-50"
                        >
                          {user.role === "ADMIN" ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          title={user.banned ? "رفع مسدودیت" : "مسدود کردن"}
                          disabled={actionLoading === user.id}
                          onClick={() =>
                            updateUser(user.id, { banned: !user.banned })
                          }
                          className="p-1.5 text-[var(--text-muted)] hover:text-orange-600 rounded-lg hover:bg-orange-50"
                        >
                          {user.banned ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>
                        {user.phone && (
                          <button
                            title="مسدود کردن شماره"
                            disabled={actionLoading === user.id}
                            onClick={async () => {
                              setActionLoading(user.id);
                              await fetch("/api/admin/banned-phones", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  phone: user.phone,
                                  banUser: true,
                                }),
                              });
                              fetchBannedPhones();
                              fetchUsers();
                              setActionLoading(null);
                            }}
                            className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          title="حذف کاربر"
                          disabled={actionLoading === `del-${user.id}`}
                          onClick={() => deleteUser(user.id, user.name)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <div className="candle-card p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
          <Ban className="w-4 h-4" />
          مسدودسازی شماره همراه
        </h2>
        <form onSubmit={handleBanPhone} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <Input
            placeholder="09xxxxxxxxx"
            value={banPhone}
            onChange={(e) => setBanPhone(e.target.value)}
            dir="ltr"
            className="text-left"
            required
          />
          <Input
            placeholder="دلیل (اختیاری)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
          <Button type="submit" size="sm" loading={actionLoading === "ban-phone"}>
            مسدود کردن
          </Button>
        </form>

        {bannedPhones.length > 0 && (
          <ul className="space-y-2 mt-4">
            {bannedPhones.map((bp) => (
              <li
                key={bp.id}
                className="flex items-center justify-between text-sm p-3 rounded-lg bg-[var(--surface-alt)]"
              >
                <div>
                  <span dir="ltr" className="font-medium">{bp.phone}</span>
                  {bp.reason && (
                    <span className="text-[var(--text-muted)] mr-2">— {bp.reason}</span>
                  )}
                </div>
                <button
                  onClick={() => unbanPhone(bp.phone)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  رفع مسدودیت
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
