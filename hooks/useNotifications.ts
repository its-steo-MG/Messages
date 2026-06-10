"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api, type MpesaNotification } from "@/lib/api";

const POLL_MS = Number(process.env.NEXT_PUBLIC_POLL_MS || 4000);

export function useNotifications(onNew?: (n: MpesaNotification) => void) {
  const [items, setItems] = useState<MpesaNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seen = useRef<Set<number>>(new Set());
  const initialized = useRef(false);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  const fetchOnce = useCallback(async () => {
    try {
      const data = await api.listNotifications();
      setError(null);
      setItems(data);
      if (!initialized.current) {
        data.forEach((n) => seen.current.add(n.id));
        initialized.current = true;
      } else {
        // detect new
        for (const n of data) {
          if (!seen.current.has(n.id)) {
            seen.current.add(n.id);
            onNewRef.current?.(n);
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, POLL_MS);
    return () => clearInterval(id);
  }, [fetchOnce]);

  const markRead = useCallback(async (id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await api.markRead(id);
    } catch {
      /* swallow */
    }
  }, []);

  return { items, loading, error, markRead, refresh: fetchOnce };
}
