"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import type { MpesaNotification } from "@/lib/api";
import CallerPopup from "./CallerPopup";

type Ctx = {
  popNotification: (n: MpesaNotification) => void;
};
const NotificationCtx = createContext<Ctx>({ popNotification: () => {} });

export const useNotificationPopup = () => useContext(NotificationCtx);

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<MpesaNotification[]>([]);

  const popNotification = useCallback((n: MpesaNotification) => {
    setQueue((q) => [...q, n]);
    // also vibrate if available
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([60, 30, 60]);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue((q) => q.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationCtx.Provider value={{ popNotification }}>
      {children}
      <div className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pointer-events-none">
        {queue.map((n) => (
          <CallerPopup key={n.id} notif={n} onDone={() => dismiss(n.id)} />
        ))}
      </div>
    </NotificationCtx.Provider>
  );
}
