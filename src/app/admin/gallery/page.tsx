"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  LayoutGrid,
  Presentation,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { GALLERY_SLIDES, PAGE_GALLERY_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Tab = "hero" | "page";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  active: boolean;
  type: "HERO" | "PAGE";
}

const TAB_LABELS: Record<Tab, { title: string; desc: string; icon: typeof Presentation }> = {
  hero: {
    title: "اسلایدر هیرو",
    desc: "تصاویر چرخشی بالای صفحه اصلی",
    icon: Presentation,
  },
  page: {
    title: "گالری صفحه اصلی",
    desc: "بخش «گالری شوکا» در صفحه اصلی",
    icon: LayoutGrid,
  },
};

export default function AdminGalleryPage() {
  const [tab, setTab] = useState<Tab>("hero");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = images.filter((img) =>
    tab === "hero" ? img.type === "HERO" : img.type === "PAGE"
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / DEFAULT_PAGE_SIZE));
  const paged = filtered.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE
  );

  const fetchImages = useCallback(async () => {
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    setImages(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", tab);

    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      body: formData,
    });

    if (res.ok) fetchImages();
    else alert("خطا در آپلود");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function importDefaults() {
    setImporting(true);
    const urls = tab === "hero" ? [...GALLERY_SLIDES] : [...PAGE_GALLERY_IMAGES];
    const type = tab === "hero" ? "hero" : "page";

    for (let i = 0; i < urls.length; i++) {
      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urls[i],
          alt: tab === "hero" ? `اسلاید ${i + 1}` : `گالری ${i + 1}`,
          order: i,
          type,
        }),
      });
    }
    await fetchImages();
    setImporting(false);
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) fetchImages();
  }

  async function updateOrder(id: string, order: number) {
    await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    fetchImages();
  }

  async function deleteImage(id: string) {
    if (!confirm("حذف این تصویر؟")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    fetchImages();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت گالری</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          اسلایدر و گالری صفحه اصلی جداگانه مدیریت می‌شوند
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-[var(--surface-alt)] rounded-xl w-fit flex-wrap">
        {(Object.keys(TAB_LABELS) as Tab[]).map((key) => {
          const { title, icon: Icon } = TAB_LABELS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                tab === key
                  ? "bg-[var(--surface)] text-[var(--primary)] font-medium shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {title}
              <span className="text-xs opacity-70">
                ({images.filter((i) => (key === "hero" ? i.type === "HERO" : i.type === "PAGE")).length})
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-[var(--text-muted)]">{TAB_LABELS[tab].desc}</p>

      <div className="flex gap-2 flex-wrap">
        {filtered.length === 0 && (
          <Button size="sm" variant="outline" loading={importing} onClick={importDefaults}>
            <ImageIcon className="w-4 h-4" />
            import تصاویر پیش‌فرض
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4" />
          آپلود به {TAB_LABELS[tab].title}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="candle-card p-12 text-center text-[var(--text-muted)]">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>تصویری در {TAB_LABELS[tab].title} نیست</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map((img) => (
              <div
                key={img.id}
                className={cn("candle-card overflow-hidden", !img.active && "opacity-60")}
              >
                <div className="relative aspect-[4/3] bg-[var(--surface-alt)]">
                  <Image src={img.url} alt={img.alt || "گالری"} fill className="object-cover" />
                </div>
                <div className="p-3 space-y-2">
                  <Input
                    defaultValue={img.alt || ""}
                    placeholder="توضیح تصویر"
                    className="text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== (img.alt || "")) {
                        fetch(`/api/admin/gallery/${img.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ alt: e.target.value }),
                        }).then(() => fetchImages());
                      }
                    }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      ترتیب:
                      <input
                        type="number"
                        defaultValue={img.order}
                        className="w-14 px-1 py-0.5 border border-[var(--border)] rounded text-center bg-[var(--surface)]"
                        onBlur={(e) =>
                          updateOrder(img.id, parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleActive(img.id, img.active)}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
                      >
                        {img.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteImage(img.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
