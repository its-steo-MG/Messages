"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPopup } from "@/components/NotificationProvider";
import { useSearchParams } from "next/navigation";
import axios from "axios";

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

// Strip HTML tags for preview
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams.get("phone");
  
  const [phone, setPhone] = useState(phoneFromUrl || "");
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState("");

  const { popNotification } = useNotificationPopup();
  const { items, loading, error: notifError } = useNotifications((n) => {
    popNotification(n);
  });

  useEffect(() => {
    if (items.length > 0) setShowLogin(false);
  }, [items]);

  useEffect(() => {
    if (phoneFromUrl) setPhone(phoneFromUrl);
  }, [phoneFromUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || pin.length !== 4) {
      setError("Please enter phone number and 4-digit PIN");
      return;
    }
    setIsLoggingIn(true);
    setError("");
    try {
      //const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://traderiserproapp.onrender.com";
      const response = await axios.post(
        `${apiUrl}/api/mpesa-notif/login/`,
        { phone_number: phone, pin },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        if (response.data.refresh) localStorage.setItem("refresh_token", response.data.refresh);
        setShowLogin(false);
        setError("");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid phone number or PIN.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Mock messages to match screenshot
  const mockThreads = [
    {
      id: "safaricom1",
      title: "SAFARICOM",
      preview: "Track every parcel for you & your customer with Leta Express mini app on M-PESA Busine...",
      when: "10:27",
      unread: true,
    },
    {
      id: "safaricom2",
      title: "Safaricom",
      preview: "You do not have an active data bundle. To continue enjoying seamless browsing, dial *...",
      when: "00:15",
      unread: true,
    },
    {
      id: "okoa",
      title: "Okoa Jahazi",
      preview: "Your Okoa Chap Chap request was successful. Your call costs through OKOA was...",
      when: "Yesterday",
      unread: true,
    },
    {
      id: "iandmbank",
      title: "IANDBMBANK",
      preview: "KES 80.00 paid to SIMON NGOWA SARO, SIMON NGOWA SARO (Acc 416121) on 08/06...",
      when: "Monday",
      unread: true,
    },
    {
      id: "21777",
      title: "21777",
      preview: "Thank you for choosing Safaricom. We would like to hear about your experience with...",
      when: "Monday",
      unread: true,
    },
  ];

  const threads = useMemo(() => {
    const liveMpesa = items[0]; // Latest MPESA notification

    if (!liveMpesa) {
      return mockThreads;
    }

    return [
      {
        id: "mpesa",
        title: "MPESA",
        preview: stripHtml(liveMpesa.message),
        when: formatWhen(liveMpesa.created_at),
        unread: items.filter((n) => !n.is_read).length > 0,
      },
      ...mockThreads,
    ];
  }, [items]);

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-5">
        <div className="w-full max-w-[380px]">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white">Messages</h1>
            <p className="text-white/60 mt-2">Sign in to view your M-Pesa notifications</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-white/70 text-sm block mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="254712345678"
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl px-5 py-4 text-white text-lg"
                required
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl px-5 py-4 text-white text-2xl tracking-widest text-center"
                required
              />
            </div>
            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 py-4 rounded-2xl text-white font-semibold text-lg transition"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-white/50 text-sm mt-8">
            Use the same 4-digit PIN you set when connecting M-Pesa
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24 bg-black">
      <div className="pt-[max(env(safe-area-inset-top),20px)] px-5">
        <div className="flex items-center justify-between">
          <button className="px-3 py-1.5 rounded-full bg-[#1C1C1E] text-[15px] text-white/90">Edit</button>
          <button className="h-9 w-9 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" fill="currentColor">
              <path d="M3 5h18v2H3zm4 6h10v2H7zm-4 6h18v2H3z" />
            </svg>
          </button>
        </div>
        <h1 className="mt-3 text-[34px] font-bold tracking-tight text-white">Messages</h1>
      </div>

      {notifError && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-red-900/30 text-red-200 text-sm">
          {notifError}
        </div>
      )}

      <ul className="mt-4">
        {loading && items.length === 0 && (
          <li className="px-5 py-6 text-white/40 text-sm">Loading messages…</li>
        )}

        {threads.map((t) => (
          <li key={t.id}>
            <Link
              href={t.id === "mpesa" ? "/conversation" : "#"}
              className="flex gap-3 px-5 py-3 active:bg-white/5"
            >
              <div className="relative shrink-0">
                {t.unread && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                )}
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#3a2a5c] to-[#1a1230] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/85" fill="currentColor">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0 border-b border-white/5 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-semibold text-white">{t.title}</span>
                  <span className="text-[13px] text-white/50">{t.when}</span>
                </div>
                <p className={`text-[15px] line-clamp-2 mt-0.5 ${t.unread ? 'text-white font-medium' : 'text-white/60'}`}>
                  {t.id === "mpesa" && (
                    <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/70 align-middle">
                      PE
                    </span>
                  )}
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

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}