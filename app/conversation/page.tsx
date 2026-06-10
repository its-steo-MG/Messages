"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPopup } from "@/components/NotificationProvider";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

export default function Conversation() {
  const { popNotification } = useNotificationPopup();
  const { items, markRead } = useNotifications((n) => popNotification(n));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    items.filter((n) => !n.is_read).forEach((n) => markRead(n.id));
  }, [items, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  const ordered = [...items].reverse();

  let lastDay = "";

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl pt-[max(env(safe-area-inset-top),12px)] pb-2 border-b border-white/5">
        <div className="grid grid-cols-3 items-center px-3">
          <Link href="/" className="flex items-center text-ios-blue text-[17px]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-1" fill="currentColor">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            <span className="px-2 py-0.5 rounded-full bg-[#1C1C1E] text-[13px] text-white/80">
              {items.filter((n) => !n.is_read).length || ""}
            </span>
          </Link>
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3a2a5c] to-[#1a1230] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/85" fill="currentColor">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
              </svg>
            </div>
            <span className="text-[11px] text-white/70 mt-0.5 flex items-center gap-0.5">
              MPESA
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          </div>
          <div />
        </div>
      </header>

      <section className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {ordered.map((n) => {
          const dl = dayLabel(n.created_at);
          const showDay = dl !== lastDay;
          if (showDay) lastDay = dl;

          return (
            <div key={n.id}>
              {showDay && (
                <div className="text-center text-[11px] text-white/40 my-3">
                  <span className="font-semibold text-white/55">{dl}</span>{" "}
                  {fmtTime(n.created_at)}
                </div>
              )}
              <div className="flex">
                <div className="bubble">
                  {renderWithLinks(n.message)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </section>

      {/* Bottom composer */}
      <footer className="sticky bottom-0 bg-black pt-2 pb-[max(env(safe-area-inset-bottom),10px)] px-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white/70 text-xl leading-none">
            +
          </button>
          <div className="flex-1 h-10 rounded-full border border-white/15 px-4 flex items-center text-white/40 text-[15px]">
            Text Message • SMS
          </div>
          <button className="h-9 w-9 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/70" fill="currentColor">
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11Z" />
            </svg>
          </button>
        </div>
      </footer>
    </main>
  );
}

// ==================== IMPROVED renderWithLinks ====================
function renderWithLinks(text: string) {
  if (!text) return <span>{text}</span>;

  // Split on URLs, phone numbers, and also handle existing HTML <a> tags
  const parts = text.split(/(https?:\/\/\S+|\b0[17]\d{8}\b|<a[^>]*>.*?<\/a>)/gi);

  return parts.map((part, i) => {
    if (!part) return null;

    // Handle existing HTML links (from backend)
    if (part.startsWith('<a ') && part.includes('</a>')) {
      return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
    }

    // Handle URLs
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          className="text-ios-blue underline break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }

    // Handle Kenyan phone numbers (07xxxxxxxx or 01xxxxxxxx)
    if (/^0[17]\d{8}$/.test(part.trim())) {
      return (
        <a key={i} href={`tel:${part}`} className="text-ios-blue underline">
          {part}
        </a>
      );
    }

    // Normal text
    return <span key={i}>{part}</span>;
  });
}