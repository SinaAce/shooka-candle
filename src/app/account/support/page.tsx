"use client";

import { useEffect, useRef, useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { MessageCircle, Send } from "lucide-react";
import { SUPPORT_WELCOME } from "@/lib/constants";

interface Message {
  id: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/support")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });

    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setContent("");
    }
    setSending(false);
  }

  const displayMessages =
    messages.length === 0 && !loading
      ? [
          {
            id: "welcome",
            content: SUPPORT_WELCOME,
            isFromAdmin: true,
            createdAt: new Date().toISOString(),
          },
        ]
      : messages;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            پشتیبانی
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            سوالات خود را از ما بپرسید
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />

        <div className="flex-1 flex flex-col bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden min-h-[420px] animate-scale-in">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[480px]">
            {loading ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                در حال بارگذاری...
              </p>
            ) : (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isFromAdmin ? "justify-start" : "justify-end"} animate-fade-in-up`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.isFromAdmin
                        ? "bg-[var(--surface-alt)] text-[var(--foreground)] rounded-br-sm"
                        : "bg-[var(--primary)] text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.isFromAdmin && (
                      <p className="text-[10px] font-medium mb-1 opacity-70">
                        پشتیبانی شوکا
                      </p>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.isFromAdmin ? "text-[var(--text-muted)]" : "text-white/70"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-[var(--border)] p-4 flex gap-3 items-end bg-[var(--surface-alt)]/50"
          >
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              rows={2}
              className="flex-1"
            />
            <Button type="submit" loading={sending} disabled={!content.trim()}>
              <Send className="w-4 h-4" />
              ارسال
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
