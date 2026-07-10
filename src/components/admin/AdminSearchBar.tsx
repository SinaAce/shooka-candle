"use client";

import { Search } from "lucide-react";
import Input from "@/components/ui/Input";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function AdminSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "جستجو...",
}: AdminSearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative max-w-md w-full"
    >
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)]"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
