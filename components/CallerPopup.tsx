"use client";

import { useEffect } from "react";
import type { MpesaNotification } from "@/lib/api";

/**
 * iOS-style MPESA notification popup - single unified card.
 */
export default function CallerPopup({
  notif,
  onDone,
}: {
  notif: MpesaNotification;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 6000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="caller-pop pointer-events-auto mt-[max(env(safe-area-inset-top),12px)] mx-3 w-[min(92vw,360px)]"
      onClick={onDone}
    >
      <div className="rounded-3xl bg-[#1C1C1E]/95 backdrop-blur-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#3a2a5c] to-[#1a1230] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/90" fill="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[17px] font-semibold text-white">
                {notif.caller_id || "MPESA"}
              </div>
              <div className="text-white/40 text-xs">now</div>
            </div>
          </div>
        </div>

        {/* Message body - now renders HTML properly */}
        <div 
          className="px-4 pb-4 text-[15px] text-white/90 leading-snug"
          dangerouslySetInnerHTML={{
            __html: notif.message.length > 220 
              ? notif.message.slice(0, 220) + "…" 
              : notif.message
          }}
        />
      </div>
    </div>
  );
}