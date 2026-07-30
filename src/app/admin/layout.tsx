"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminScrollToTop from "@/components/motion/AdminScrollToTop";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex bg-[var(--background)]">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main
          data-admin-scroll
          className="flex-1 overflow-auto bg-[var(--surface-alt)] p-4 sm:p-6 wax-texture"
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <AdminScrollToTop />
      </div>
    </div>
  );
}
