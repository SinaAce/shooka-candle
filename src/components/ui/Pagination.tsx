"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-3 mt-8",
        className
      )}
    >
      {total != null && (
        <p className="text-xs text-[var(--text-muted)] sm:absolute sm:left-0">
          {total.toLocaleString("fa-IR")} مورد
        </p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center disabled:opacity-40 hover:bg-[var(--surface-hover)]"
          aria-label="صفحه قبل"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-[var(--text-muted)]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "min-w-9 h-9 px-2 rounded-lg text-sm transition-colors",
                p === page
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {p.toLocaleString("fa-IR")}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center disabled:opacity-40 hover:bg-[var(--surface-hover)]"
          aria-label="صفحه بعد"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ServerPaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function ServerPagination({
  page,
  totalPages,
  total,
  buildHref,
  className,
}: ServerPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col sm:flex-row items-center justify-center gap-3 mt-8",
        className
      )}
    >
      {total != null && (
        <p className="text-xs text-[var(--text-muted)] sm:absolute sm:left-0">
          {total.toLocaleString("fa-IR")} مورد
        </p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {page > 1 && (
          <a
            href={buildHref(page - 1)}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-hover)]"
            aria-label="صفحه قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-[var(--text-muted)]">
              …
            </span>
          ) : (
            <a
              key={p}
              href={buildHref(p)}
              className={cn(
                "min-w-9 h-9 px-2 rounded-lg text-sm flex items-center justify-center transition-colors",
                p === page
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {p.toLocaleString("fa-IR")}
            </a>
          )
        )}
        {page < totalPages && (
          <a
            href={buildHref(page + 1)}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-hover)]"
            aria-label="صفحه بعد"
          >
            <ChevronLeft className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
