export type MpesaNotification = {
  id: number;
  mpesa_id: string | null;
  notification_type: "received" | "sent";
  message: string;
  caller_id: string;
  is_read: boolean;
  created_at: string;
  transaction_type: string | null;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "access_token";

// Auto-sync token from URL when Messages app is opened from main app
function syncTokenFromUrl() {
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  if (tokenFromUrl) {
    localStorage.setItem(TOKEN_KEY, tokenFromUrl);
    console.log("[Auth] ✅ Token successfully synced from URL");

    // Clean URL (remove token from address bar)
    const newUrl = window.location.pathname + 
      (urlParams.get("phone") ? `?phone=${urlParams.get("phone")}` : "");
    
    window.history.replaceState({}, document.title, newUrl);
  }
}

// Run token sync immediately when this module loads
syncTokenFromUrl();

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Try localStorage first
  let token = localStorage.getItem(TOKEN_KEY);

  // 2. Fallback: Check URL (in case sync didn't run yet)
  if (!token) {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get("token");
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      console.log("[Auth] ✅ Token found in URL and saved");
    }
  }

  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  // Clean path - make sure it starts with /api/
  let cleanPath = path;
  if (!path.startsWith('/api/')) {
    cleanPath = `/api${path.startsWith('/') ? '' : '/'}${path}`;
  }

  const url = `${BASE}${cleanPath}`;

  console.log(`[API] → ${url} | Token: ${token ? "Present" : "❌ MISSING"}`);

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[API Error] ${res.status} ${url} - ${text}`);
    
    if (res.status === 401) {
      console.error("[Auth] Unauthorized - Token missing or invalid");
    }
    
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  listNotifications: () => request<MpesaNotification[]>("/mpesa-notif/notifications/"),
  markRead: (id: number) =>
    request<{ status: string }>(`/mpesa-notif/notifications/${id}/read/`, { method: "POST" }),
};