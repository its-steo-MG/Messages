"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPopup } from "@/components/NotificationProvider";

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); 
  yest.setDate(now.getDate() - 1);
  
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long" });
}

export default function MessagesPage() {
  const { popNotification } = useNotificationPopup();
  const { items, loading, error } = useNotifications((n) => {
    popNotification(n);
  });

  const threads = useMemo(() => {
    if (items.length === 0) return [];
    const latest = items[0];
    const unreadCount = items.filter((n) => !n.is_read).length;
    
    return [
      {
        id: "mpesa",
        title: "MPESA",
        preview: latest.message,
        when: formatWhen(latest.created_at),
        unread: unreadCount,
      },
    ];
  }, [items]);

  return (
    <main className="min-h-screen pb-24">
      {/* iOS header */}
      <div className="pt-[max(env(safe-area-inset-top),20px)] px-5">
        <div className="flex items-center justify-between">
          <button className="px-3 py-1.5 rounded-full bg-[#1C1C1E] text-[15px] text-white/90">
            Edit
          </button>
          <button className="h-9 w-9 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" fill="currentColor">
              <path d="M3 5h18v2H3zm4 6h10v2H7zm-4 6h18v2H3z" />
            </svg>
          </button>
        </div>
        <h1 className="mt-3 text-[34px] font-bold tracking-tight">Messages</h1>
      </div>

      {error && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-red-900/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <ul className="mt-4">
        {loading && items.length === 0 && (
          <li className="px-5 py-6 text-white/40 text-sm">Loading…</li>
        )}
        {!loading && threads.length === 0 && !error && (
          <li className="px-5 py-6 text-white/40 text-sm">No messages yet.</li>
        )}

        {threads.map((t) => (
          <li key={t.id}>
            <Link
              href="/conversation"
              className="flex gap-3 px-5 py-3 active:bg-white/5"
            >
              <div className="relative shrink-0">
                {t.unread > 0 && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-ios-blue" />
                )}
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#3a2a5c] to-[#1a1230] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/85" fill="currentColor">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0 border-b border-white/5 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-semibold">{t.title}</span>
                  <span className="text-[13px] text-white/50 flex items-center gap-1">
                    {t.when}
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
                <p className={`text-[14px] line-clamp-2 mt-0.5 ${t.unread > 0 ? 'text-white font-medium' : 'text-white/55'}`}>
                  <span className="inline-block mr-1 px-1 rounded bg-white/10 text-[10px] text-white/70 align-middle">
                    PE
                  </span>
                  {t.preview}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Bottom search bar */}
      <div className="fixed bottom-0 inset-x-0 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 px-4 bg-gradient-to-t from-black via-black to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-10 rounded-full bg-[#1C1C1E] px-3 text-white/50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M10 4a6 6 0 1 1-4.47 10.03l-3.78 3.78-1.42-1.42 3.78-3.78A6 6 0 0 1 10 4Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
            </svg>
            <span className="text-[15px]">Search</span>
          </div>
          <button className="h-10 w-10 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.21a1 1 0 0 0 0-1.42l-2.33-2.33a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}