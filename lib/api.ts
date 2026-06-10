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

//const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const BASE = process.env.NEXT_PUBLIC_API_BASE || "https://traderiserproapp.onrender.com";

const TOKEN_KEY = "access_token";

// Sync phone from URL
function syncParamsFromUrl() {
  if (typeof window === "undefined") return;
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");
  if (phone) {
    console.log(`[Auth] Phone from URL: ${phone}`);
    const newUrl = window.location.pathname + `?phone=${encodeURIComponent(phone)}`;
    window.history.replaceState({}, document.title, newUrl);
  }
}
syncParamsFromUrl();

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  // Force correct full path
  let fullPath = path;
  if (!path.startsWith('/api/mpesa-notif/')) {
    fullPath = `/api/mpesa-notif${path.startsWith('/') ? '' : '/'}${path}`;
  }

  const url = `${BASE}${fullPath}`;

  console.log(`[API] → ${url} | Token: ${token ? "✅" : "❌"}`);

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
    console.error(`[API Error] ${res.status} ${url}`, text);

    if (res.status === 401) {
      console.error("[Auth] Token invalid - clearing");
      localStorage.removeItem(TOKEN_KEY);
      if (typeof window !== "undefined") window.location.reload();
    }
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  listNotifications: () => request<MpesaNotification[]>("/notifications/"),
  markRead: (id: number) =>
    request<{ status: string }>(`/notifications/${id}/read/`, { method: "POST" }),
};