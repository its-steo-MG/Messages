"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api, type MpesaNotification } from "@/lib/api";

const POLL_MS = Number(process.env.NEXT_PUBLIC_POLL_MS || 8000); // Increased to reduce spam

export function useNotifications(onNew?: (n: MpesaNotification) => void) {
  const [items, setItems] = useState<MpesaNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const seen = useRef<Set<number>>(new Set());
  const initialized = useRef(false);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  const fetchOnce = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in first");
      setLoading(false);
      return;
    }

    try {
      const data = await api.listNotifications();
      setError(null);
      setItems(data);

      if (!initialized.current) {
        data.forEach((n) => seen.current.add(n.id));
        initialized.current = true;
      } else {
        // Detect new notifications
        for (const n of data) {
          if (!seen.current.has(n.id)) {
            seen.current.add(n.id);
            onNewRef.current?.(n);
          }
        }
      }
    } catch (e: any) {
      console.error("Failed to fetch notifications:", e);
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnce();
    const interval = setInterval(fetchOnce, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchOnce]);

  const markRead = useCallback(async (id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await api.markRead(id);
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  }, []);

  return { items, loading, error, markRead, refresh: fetchOnce };
}